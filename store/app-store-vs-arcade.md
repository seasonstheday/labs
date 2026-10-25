# App Store or Apple Arcade?

The decision is yours. This sets out what each one asks of the game as it stands.

## Option A: the App Store, free with optional extras (what the code is built for)
**How it earns:** rewarded videos (grown-up gated) plus two non-consumables: The Big Book Pass ($), which removes the video offers and gives the Diary a gold cover, and Dad's Closet ($).

**Already done:**
- the AdMob and purchase plugins;
- the grown-up gate on every ad and purchase;
- child-directed, non-personalised ads;
- Game Center saves;
- the screenshots, listing, and privacy and age answers in this folder.

**Still to do:**
1. Real AdMob app and ad-unit IDs; the code uses Google's test IDs (`app/src/native.js`).
2. The App Store Connect app record, the two IAP products with matching IDs (`com.whydad.defender.pass`, `.closet`), and their prices.
3. The privacy policy page is drafted at `defender/privacy.html` (https://seasonstheday.github.io/labs/defender/privacy.html once merged); review the wording and replace SUPPORT_EMAIL with the support address you want public.
4. An Xcode build on a Mac: add the two Swift files and the Game Center and iCloud capabilities (`app/native/ios/README.md`), the 1024 icon, then archive and upload to TestFlight.
5. A real-iPhone test (still on the backlog).
6. The voices, once the Gemini account has credit again (`defender/tools/gen_voice.py`).

**Risks:**
- Ads in a game that clearly appeals to kids get extra scrutiny in App Review, and from parents.
- Rewarded-video income from child-directed traffic is low, because non-personalised kids' ads pay much less.

## Option B: Apple Arcade
**How it earns:** Apple's terms, agreed one game at a time. There's no ad or purchase income.

**What changes in the game:**
1. **Remove ads and purchases entirely:** the AdMob and purchase plugins, the grown-up store shelf, and the video-for-reward buttons. The rewards they gave, such as double coins, would become normal play rewards or go away.
2. **Keep and polish Game Center.** It's already there. Achievements and leaderboards (Endless best wave, Myth Master crowns) would fit naturally and are expected.
3. **Controller and iPad/Mac support** count in its favour. The game is touch-first and portrait-only today.
4. **Localisation** helps. Spanish is on the backlog.

**How to get in:** Apple picks games through its own pitch process. You submit the game for consideration and wait; nothing is guaranteed.

## My take
- **Ship on the App Store first.** It's almost ready, and the only remaining work there is store admin, the Mac build and testing.
- **Consider a "no ads at all" version** if parents push back. Remove the video offers and sell the game once, or keep only The Big Book Pass. That is a small code change (the store shelf is one place in `index.html` and `native.js`).
- **Pitch Arcade separately** if you'd like, once there's a TestFlight build and real players. A polished, ad-free, educational family game with Game Center fits what Arcade looks for. Removing ads and purchases is a day's work.
