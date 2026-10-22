# Why, Dad? Defender — native shell (iOS and Android)

The game is the web build in `../defender`. This folder wraps it with
[Capacitor](https://capacitorjs.com) and adds the two things the web build never has:
rewarded videos (AdMob) and a grown-ups-only store (App Store / Play purchases).
`src/native.js` is the only bridge; the game finds `window.rewardedAd` and `window.iap`
at run time and shows those buttons only then, always behind the adult gate (a
multiplication sum).

## One-time setup on a Mac

Requirements: Node 20+, Xcode 15+ with the iOS simulator, CocoaPods (`sudo gem install cocoapods`).
For Android: Android Studio with an SDK.

```bash
cd app
npm install
npm run build          # copies ../defender into www/ and adds native.js
npx cap add ios        # once; creates ios/ (ignored by git)
npx cap add android    # once; creates android/
npx cap sync
npx cap open ios       # opens Xcode; pick your team, run on a simulator
```

After any change to the game: `npm run sync`, then run again from Xcode or Android Studio.

## Ads (AdMob)

1. Make an AdMob account, add the app for iOS and Android, create one **Rewarded** ad unit per platform.
2. Put the two ad unit IDs in `src/native.js` (`AD_UNITS`) and set `TESTING = false` for release.
   The Google test IDs there work without an account.
3. App IDs go in the native projects:
   - iOS `ios/App/App/Info.plist`: `GADApplicationIdentifier` = your iOS app ID, plus the
     `SKAdNetworkItems` list from AdMob's docs.
   - Android `android/app/src/main/AndroidManifest.xml`: a `meta-data`
     `com.google.android.gms.ads.APPLICATION_ID` with your Android app ID.
4. The bridge initialises with no tracking prompt, child-directed treatment on and non-personalised
   ads only. Keep it that way: it is a family game rated 4+, and this is what keeps the AdMob
   policies and the store review happy. In the AdMob console mark the app as made for families
   if asked.

Placements in the game: one extra Reading Room visit, +20 gems once a day in the Store, and
"double the coins" on the stage-clear screen. The Big Book Pass turns all three off.

## Purchases

Two non-consumables, deterministic by design (research note: no real money into random draws):

| Product ID | What it gives |
|---|---|
| `com.whydad.defender.pass` | no more video offers, and a gold cover for Dad's Diary (it no longer unlocks friends: buying progress is what regulators flag in children's games) |
| `com.whydad.defender.closet` | four Legendary outfits for Dad |

Create both in App Store Connect (In-App Purchases, Non-Consumable) and Play Console
(One-time products) with exactly those IDs. Prices show in the Store from the stores themselves.
"Restore purchases" is in the game. Receipts are verified by the plugin's built-in store
validation; if you later want server-side validation, point `cordova-plugin-purchase` at a
validator in `src/native.js`.

## Saves (Game Center and iCloud)

The game keeps four copies of its save:
- **The main save:** in the web view's storage.
- **A spare:** in the same storage, used if the main one is ever unreadable.
- **A phone copy:** in the phone's own storage through `@capacitor/preferences`, which survives iOS clearing web storage.
- **An iCloud copy:** through Game Center saved games.

At start the game compares the copies by progress. A new phone with an empty game loads the iCloud copy without asking. If both copies have progress, a card asks which one to keep.

The Game Center part is a small local plugin: see `native/ios/README.md` for the four Xcode steps (add two Swift files, set the view controller class, add the Game Center and iCloud capabilities). Grown-ups can also move a game by hand with a save code (Settings → 👪 → Saved game).

## Store listing notes

- Age rating 4+ (not the Kids Category, by decision, so ads and purchases stay possible).
- The game is plainly made for children, so ad requests are child-directed, under the age of consent and capped at a General rating (`src/native.js`), and every ad and purchase sits behind the grown-up gate. Have whoever owns the listing confirm this against COPPA and Apple's guidelines 1.3 and 5.1.4.
- Privacy: no account, no analytics, no data leaves the device apart from what AdMob needs to serve
  a non-personalised ad, and the save game that Game Center stores in the player's own iCloud. Say so in the App Privacy questionnaire. Add Apple's privacy manifest for
  the AdMob SDK (it ships with the SDK; Xcode will tell you if it is missing).
- Screenshots: the title lawn, the chapter map, a Pond battle, the Diary, the Party screen.
- Orientation is portrait only (set in the Xcode target and `AndroidManifest.xml`).

## Testing

- Web build: `python3 -m http.server` from the repo root, open `/defender/`. No ads or store appear.
- Shell: run on a simulator; AdMob test ads play with the test IDs; purchases need a sandbox tester
  (App Store Connect → Users and Access → Sandbox) or a licence tester (Play Console).
