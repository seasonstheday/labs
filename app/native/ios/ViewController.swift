// Registers the app's own plugins with Capacitor. Set this class on the bridge view controller in Main.storyboard.
import Capacitor

class ViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameSavesPlugin())
    }
}
