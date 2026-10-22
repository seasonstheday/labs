// Why, Dad? Defender: Game Center saved games (stored in the player's iCloud). Used by app/src/native.js as
// Capacitor.Plugins.GameSaves: signIn() -> { signedIn }, save({ data }) -> { saved }, load() -> { data? }.
// Needs the Game Center and iCloud (iCloud Documents) capabilities on the App target. See app/native/ios/README.md.
import Capacitor
import GameKit

@objc(GameSavesPlugin)
public class GameSavesPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GameSavesPlugin"
    public let jsName = "GameSaves"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "save", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "load", returnType: CAPPluginReturnPromise),
    ]
    private let slot = "whydad-save" // one save per player; GameKit replaces a save with the same name

    @objc func signIn(_ call: CAPPluginCall) {
        let player = GKLocalPlayer.local
        if player.isAuthenticated { call.resolve(["signedIn": true]); return }
        var answered = false
        player.authenticateHandler = { [weak self] viewController, error in
            if let vc = viewController { // Game Center wants to show its own sign-in sheet
                DispatchQueue.main.async { self?.bridge?.viewController?.present(vc, animated: true) }
                return
            }
            if !answered { answered = true; call.resolve(["signedIn": player.isAuthenticated, "error": error?.localizedDescription ?? ""]) }
        }
    }

    @objc func save(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated, let text = call.getString("data"), let data = text.data(using: .utf8) else {
            call.resolve(["saved": false]); return
        }
        GKLocalPlayer.local.saveGameData(data, withName: slot) { _, error in
            call.resolve(["saved": error == nil, "error": error?.localizedDescription ?? ""])
        }
    }

    @objc func load(_ call: CAPPluginCall) {
        guard GKLocalPlayer.local.isAuthenticated else { call.resolve([:]); return }
        GKLocalPlayer.local.fetchSavedGames { games, _ in
            let mine = (games ?? []).filter { $0.name == self.slot }
                .sorted { ($0.modificationDate ?? .distantPast) > ($1.modificationDate ?? .distantPast) }
            guard let newest = mine.first else { call.resolve([:]); return }
            newest.loadData { data, _ in
                guard let data = data, let text = String(data: data, encoding: .utf8) else { call.resolve([:]); return }
                // two devices saved while apart: keep the newest and tell GameKit the conflict is settled
                if mine.count > 1 { GKLocalPlayer.local.resolveConflictingSavedGames(mine, with: data) { _, _ in } }
                call.resolve(["data": text])
            }
        }
    }
}
