# App Privacy and age rating answers

These are drafts based on what the code does today: `app/src/native.js` and `defender/index.html`. Whoever submits the app should confirm them, especially the AdMob part against Google's current disclosure guide, because SDKs change.

## What the app does with data
- **No account, no sign-up, no analytics SDK, no server of our own.** The save game lives on the phone, with a phone-storage copy through Capacitor Preferences.
- **Game Center saved games:** if the player is signed in to Game Center, a copy of the save goes to *their own* iCloud through Apple. We never see it.
- **Purchases:** two non-consumables through Apple (`cordova-plugin-purchase`), verified on the device. We keep no purchase records of our own.
- **Ads:** rewarded videos only, through Google AdMob. They are behind the grown-up gate, child-directed, under the age of consent, rated G, and non-personalised (`npa: true`). We don't ask for App Tracking Transparency, so there is no IDFA.

## App Privacy questionnaire (App Store Connect → App Privacy)

**Do you or your third-party partners collect data from this app?** Yes. AdMob collects some data to serve and measure ads.

Data types to declare, per Google's guidance for the Mobile Ads SDK (confirm against the current page):

| Data type | Collected by | Linked to the user? | Used for tracking? | Purpose |
|---|---|---|---|---|
| Coarse location (from IP address) | AdMob | No | No | Third-party advertising, analytics |
| Device ID (IDFV; no IDFA without ATT) | AdMob | No | No | Third-party advertising, analytics, fraud prevention |
| Product interaction | AdMob | No | No | Third-party advertising, analytics |
| Advertising data | AdMob | No | No | Third-party advertising, analytics |
| Crash data | AdMob | No | No | App functionality, analytics |
| Performance data | AdMob | No | No | App functionality, analytics |
| Other diagnostic data | AdMob | No | No | App functionality, analytics |

Not collected: contact info, health, financial info, precise location, contacts, user content, browsing or search history, purchases (Apple handles these; we keep nothing), and gameplay data (the save stays on the device or in the player's own iCloud).

**Privacy policy URL:** https://seasonstheday.github.io/labs/defender/privacy.html (`defender/privacy.html`; it goes live once merged). The Grown-ups page in the game could link to it too.

**Privacy manifest:** the Google Mobile Ads SDK ships its own `PrivacyInfo.xcprivacy`. The app itself uses UserDefaults (through Preferences), so add a manifest declaring the required-reason API `NSPrivacyAccessedAPICategoryUserDefaults` with reason `CA92.1`. Xcode's privacy report flags anything missing.

## Age rating questionnaire

| Question | Answer | Why |
|---|---|---|
| Cartoon or fantasy violence | **Infrequent / mild** | Paper "myths" pop with a puff and a "POP!"; bosses bump into Dad. No blood or injury. |
| Realistic violence | None | |
| Sexual content, nudity | None | |
| Profanity or crude humour | None | Dad jokes only. |
| Alcohol, tobacco, drugs | None | |
| Mature or suggestive themes | None | |
| Horror or fear themes | None | The villain is silly, never scary. |
| Medical or treatment information | None | Body facts are general knowledge, not advice. |
| Simulated gambling | None | See the note below. |
| Contests | None | |
| Unrestricted web access | No | |
| User-generated content, messaging, chat | No | |
| Advertising | Yes | Optional rewarded videos, grown-up gated. |
| In-app purchases | Yes | Two non-consumables, grown-up gated. |

Expected rating: **4+**.

**Note on chance-based rewards:** the daily Prize Wheel, Lunchboxes and Library Cards give random in-game items, but none can be bought with real money. Real-money purchases are fixed items, so Apple's loot-box odds rule (guideline 3.1.1) doesn't apply. The Store already shows Lunchbox odds anyway (65% Common, 30% Rare, 5% Epic). If a real-money random item is ever added, its odds must be shown before purchase.

**Kids Category:** not chosen, by decision, which keeps ads and purchases possible. Because the game clearly appeals to children, Apple's guidelines 1.3 and 5.1.4 still apply in spirit. Ads must be age-appropriate (they are: child-directed, rated G), and purchases must sit behind a parental gate (they do). App Review may still ask about this, so keep the answers ready.
