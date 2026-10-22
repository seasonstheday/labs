# Why, Dad? Defender: menu usability benchmark

How easy the menus are for a 5 to 10 year old to use without getting lost, tested on build 51/52 in an iPhone-sized browser (390 × 844, touch on). The tests covered three players: brand new, early (3 stages cleared) and progressed (14 cleared, 5 friends, items, Skill Tree points). October 2026.

## The short version

**The basics are in good shape.** One big Play button starts the next stage in one tap. The five-tab bar is easy to reach. The World Map pins are a good size, and nothing costs real money without a grown-up check. That already matches what the best casual games do.

**Three things are most likely to strand a child:**

1. **The buttons that let you leave a pop-up are hidden below the fold.** Five pop-ups put their only way out (Next stage, Home, Keep going or Done) under the bottom edge, so a child has to know to scroll inside the pop-up. They are the Stage cleared card, Pause, Settings, the Skill Tree and How to play. Tapping outside the pop-up does nothing, and there is no ✕.
2. **The tab bar changes shape as the game unlocks.** A new player sees only Play and Diary, at the far left. Every unlock adds a tab and pushes the others along: Play moves from the left edge to the middle over the first three stages. Apple's guidelines say not to hide tabs for exactly this reason.
3. **Many buttons are small, and the instructions are text a pre-reader can't follow.** About half the buttons are below Apple's 44-point minimum, partly because the whole game is shrunk to 89% with black bars above and below. The Bag says "Put it on from a friend's card in Friends" in small grey text, and doesn't give you a button to do it.

All ten fixes are listed at the end, and most of them are small.

## How we tested

- Every task below was done by tapping through the game in Playwright (an automated Chromium browser), with screenshots and measured button sizes.
- Sizes are in on-screen points. On an iPhone the game fills 390 of 390 points of width, but the 440 × 760 game frame is scaled down to 89%, so every button is 11% smaller than its design size.
- The screenshots are in `/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/`. File names are given in the text.

## The menu map

Depth counts the taps needed from Home. Home is the Play tab, at depth 0. Pop-ups are marked "(pop-up)".

```
HOME (Play tab)                                              depth 0
├─ ▶ Play (next stage) ─────────────── match                 1
│    └─ in match: Level-up pick (pop-up), Myth Check (pop-up),
│       Dad's Notebook (pop-up), Pause (pop-up) → Home,
│       Stage cleared (pop-up) → Next stage / Home, Dad needs a nap (pop-up)
├─ 🗺️ World Map (no tab bar here; ← only)                    1
│    ├─ stage pin → card with Easy/Normal/Hard → Play        2
│    └─ 🎁 Chapter Chests (pop-up) → Claim → reward reveal   2–3
├─ 📅 Daily Myth  ♾️ Endless   (after 11 and 12 stages)      1
├─ month pill (shows a long text message)                    1
├─ 📋 Missions (a screen, Play tab lit)                      1
├─ ❓ How to play (pop-up, 12 paragraphs)                     1
└─ ⚙️ Settings (pop-up, 10 switches)                          1
     └─ 👪 Grown-ups → sum gate (pop-up) → grown-ups page    2–3

SHOP tab (after 2 stages) "The Store"                        1
├─ Library Cards → shelf of three (pop-up)                   2
└─ Lunchbox, Backpack, cards, Pocket Money, Bookmark (one tap buys)

FRIENDS tab (after 1 stage) "The Party"                      1
├─ Team Power, six family chips (each shows a message)
├─ In the backyard: Dad and 3 friends → friend card          2
└─ Friends / Still to meet grid → friend card                2
     friend card (1.7 screens long):
     ├─ Join / "In party ✓" (takes them out)
     ├─ Outfit: Weapon / Armor / Book → picker (pop-up)      3
     │     └─ ✨🔨 → the item card replaces the picker         4
     ├─ weapon album (opens in place)
     ├─ 🌳 Skill Tree (pop-up, 2.2 screens long)             3
     └─ upgrade ranks (one tap spends coins)

BAG tab (after 3 stages) "The Bag"                           1
├─ filter chips (All, Weapons, Armor, Books, Marks)
└─ item → item card (pop-up): Polish / Forge / Sell          2
     ├─ Forge → confirm (replaces the card)                  3
     └─ +🔖 → bookmark picker (replaces the card)            3

DIARY tab (always) "The Kid's Diary"                         1
├─ 📚 Reading Room (pop-up) → Go in                          2
├─ 📖 The story so far (comic pop-up)                        2
├─ By topic / By chapter → topic chips → fact list          1
└─ Study time → Read (pop-up)                                2

Automatic pop-ups: daily gift "Welcome back!", the prologue comic, unlock messages
```

Most things are at depth 1 or 2, which is shallow. The deepest path is Friends, then a friend, then the outfit picker, then the item card, at depth 4. Pop-ups never stack on top of each other. Instead, one pop-up quietly swaps its contents, so the outfit picker turns into an item card. That causes its own confusion: Done then closes everything instead of going back to the picker.

## The 12 tasks

The tap counts include the first tap from Home.

| # | Task | Taps | Deepest | What got in the way |
|---|---|---|---|---|
| 1 | Start the next stage | **1** (new player: 1 + 5 story taps + Let's go) | 1 | None for returning players. A new player gets the story first, which is fine, but the Skip button is 33 pt tall. |
| 2 | Replay an old stage for 3 stars | **3** (World Map, pin, Play) | 2 | Pins are 44 pt, which is good. Stars show on the pins. Hard says "clear Normal" in text only. The "Chapter Chests" button under Play is easy to hit by mistake. |
| 3 | Put a new item on a friend | **4** if you know the way, **9** in our first try | 3 | **A dead end.** The obvious place is the Bag, which has no "put on" button, only a grey line of text (`t03-bag-itemcard.png`). You have to go Friends, then a friend, then the slot, then Wear (62 × 33 pt). |
| 4 | Spend a Skill Tree point | **4** plus 2 scrolls | 3 | The 🌳 button is below the bottom of the friend card, so you have to scroll. The tree is 2.2 screens long and its Done button is 2 screens down, with no ✕ (`t04-tree.png`). All the +1 and Pick buttons are 33 pt tall. |
| 5 | Swap a friend in the party | **6** | 2 | "tap a friend to swap" opens their card, it doesn't swap. "In party ✓" is the button that takes a friend out. When the party is full, Join is just greyed out with no reason given. |
| 6 | Claim a Chapter Chest | **5**, +1 to get back | 2–3 | No dot on Home or on the World Map button. The only red dot is on a small button at the very bottom of the map. Claim is 61 × 33 pt. The prize numbers are tiny and sit on top of the icons (`t06-chests.png`). |
| 7 | Claim missions | **2** | 1 | The 📋 icon is 39 pt with no label. When missions are ready, four dots show at once, including one on the Play tab you're already on (`x-home-missions-ready.png`). The icon shows for brand-new players too, before missions unlock at stage 4. |
| 8 | Read a learned fact | **1–2** (Diary, then a topic chip) | 1 | The facts are all text: "I THOUGHT … DAD SAYS …". There's no speaker button on a fact, and "Read facts aloud" is off by default. Unknown facts mixed into the list show as "???" (`x-tabs-1.png`). |
| 9 | Change the sound | **3** plus a scroll | 1 | Music and Sound effects are the 7th and 8th of 10 switches. Done is below the fold. In a match, Pause shows the same 10 switches and hides **Keep going** below the fold (`t09-pause.png`). |
| 10 | Find the Daily Myth | **1** (after 11 stages) | 1 | Easy to find, a labelled button under Play, but only 33 pt tall. Before stage 11 it doesn't exist, and nothing says it's coming. |
| 11 | Open the grown-ups page | **3** plus a scroll plus typing | 3 | Settings, scroll, Grown-ups, a times-table sum, then the page. The gate works, but a sum like 4 × 8 is something many 8 to 10 year olds can do. |
| 12 | Get back to Home from deep screens | **1–3** | — | The Play tab works from any tab screen. It doesn't work on the World Map, which has no tab bar, or behind a pop-up, where you have to find Done first. On a friend card, the top ← goes back to the friends grid, not Home, and there's a second "← All friends" right under it. **After a stage, the Home and Next stage buttons are off-screen** (`x-clear.png`). |

## What we found, by theme

### Ways out of pop-ups (the biggest problem)

We measured where the exit button sits compared with the bottom of its pop-up (746 pt on screen):

| Pop-up | Exit button sits at | Visible without scrolling? |
|---|---|---|
| Stage cleared (Next stage / Home) | 752 pt | **No**, about 10 pt short, and longer when a friend joins or levels up |
| Pause (Keep going / Home) | 831 pt | **No** |
| Settings (Done / Grown-ups) | 920 pt | **No** |
| How to play (Close) | 1,234 pt | **No** |
| Skill Tree (Done) | 1,453 pt | **No** |
| Chapter Chests, item card, Library Card, Reading Room, gate | on screen | Yes |

None of them has a ✕ in the corner, and tapping the dark area outside doesn't close them. A child who pauses a match sees ten switches and no way to carry on. Apple's guidance is to "always give people an obvious way to dismiss a modal view."

Screenshots: `x-clear.png`, `t09-pause.png`, `t09-settings.png`, `t04-tree.png`.

### The tab bar moves as things unlock

| Stages cleared | Tabs shown (left edge, in points) |
|---|---|
| 0 | Play @4, Diary @80 |
| 1 | Friends @4, **Play @80**, Diary @157 |
| 2 | Shop @4, Friends @80, **Play @157**, Diary @233 |
| 3 | Shop, Friends, Play, Bag, **Diary @310** |

Play moves twice and Diary moves three times. For a child who finds things by where they are rather than by reading, this undoes what they've learned. Apple says: "Don't disable or hide tab bar buttons, even when their content is unavailable… [it] makes your app's interface appear unstable and unpredictable." The tab bar also disappears on the World Map, and Apple warns that "if you hide the tab bar, people can forget which area of the app they're in."

Screenshots: `home-new.png`, `x-tabs-0.png` to `x-tabs-3.png`.

### Small tap targets

The whole game is drawn at 89% size, with about 85 pt of unused black above and below on an iPhone. Here is how many buttons on each screen are under Apple's 44 × 44 pt:

| Screen | Small / total | Examples |
|---|---|---|
| Home | 7 / 8 | 📋 ❓ ⚙️ (39 pt), World Map, Daily Myth, Endless (33 pt tall), month pill (27 pt) |
| Skill Tree | 16 / 17 | every +1, Pick and Learn (33 pt tall) |
| Shop | 8 / 8 | every price button (85 × 33), ← |
| Friend card | 7 / 10 | In party ✓, ← All friends, Skill Tree, rank buttons |
| Bag | 6 / 12 | filter chips (29 pt tall) |
| Chapter Chests | 4 / 5 | ◀ ▶ (39 pt), Claim (33 pt) |
| Tab bar, World Map pins | 0 | 77 × 53 and 44 × 44, which is good |

Research with children found that their finger contact patch is about as big as an adult's, because they have less control. Smaller fingers don't mean they can manage smaller buttons.

### Text a pre-reader can't follow

- Every screen opens with a sentence of instructions, such as "Tap anything to polish ✨, forge 🔨 or sell it…".
- How to play is 12 paragraphs. It still uses old names ("Fact Book", "Party screen", "upgraded for coins on the Party screen"). It also says "nothing to buy with real money", while the Store says the app has a grown-ups shelf.
- The same place has two names in several spots: Shop and "The Store", Friends and "The Party", Diary and "The Kid's Diary", World Map and "The Big Book's Pages".
- The game already has a **"Read buttons aloud"** switch, which is the right tool, but it's off by default and is the 6th switch in Settings. Google notes that most kids under 5 can't read, and may not know how to turn the sound on.

### Red dots

- When missions are ready, up to four dots show at once (📋, Play tab, Daily Myth, Shop). The Play-tab dot is on the screen you're already looking at.
- The Shop dot stays on whenever you have even one Library Card, so it soon stops meaning anything.
- The one dot that would really help, a Chapter Chest ready, is missing from Home and the World Map button.

### Spending by accident

- Store items, Sell, rank upgrades and Skill Tree nodes all spend with **one tap and no undo**. On the Sell test, the item was gone in one tap.
- Pause → Home leaves the match straight away. It sits right next to Keep going (when you can find them).
- None of this is real money. The real-money shelf and video ads are behind the grown-up gate, which is correct. Children still feel it when they lose a favourite item or 300 coins they were saving.

## How other games and guidance compare

| | What good practice looks like | Defender today |
|---|---|---|
| Home or hub | Survivor.io, Archero and Clash Royale: one big Battle or Play button in the middle, with a fixed bottom bar of 4 to 5 sections. Duolingo replaced its branching "tree" with one "path" so learners don't have to choose. | ✔ The big Play button already does this |
| Tabs | Apple: 3 to 5 tabs, always visible, never hidden while locked. Clash Royale-style games show locked tabs with a padlock. | ✘ Tabs appear one at a time and move |
| Back | Google (kids): "always have the navigation showing… home buttons and back arrows." Pokémon Go keeps one menu button in the same place. | ~ ← plus the tab bar, but ← means different things, and the map has no tab bar |
| Pop-ups | Apple: an obvious way to dismiss, keep them short, one pop-up at a time. Games usually put a big ✕ top-right and close on a tap outside. | ✘ Exits below the fold, no ✕, no tap-outside |
| Targets | Apple: 44 × 44 pt minimum. Kids' research says bigger. | ✘ About half the buttons are under 44 |
| Pre-readers | Google, Sago Mini and Toca Boca: icons first, almost no words, voice or audio for instructions. NN/g: give clear, specific instructions that build on what kids already know. | ~ Good emoji icons, but instructions are text, and read-aloud is off |
| Dots | Apple: "Reserve badges for critical information." Badge-blindness research says the same. | ✘ Too many dots, and the one for chests is missing |
| Spending | The FTC's 2014 case against Apple over children's purchases shows why a confirmation step matters. Kids' games add a confirm or undo even for soft currency. | ✘ Everything is one tap |

## The fixes, most important first

| # | What | Where | Why | Effort |
|---|---|---|---|---|
| **1** | **Pin the exit buttons to the bottom of every pop-up and add a big ✕ (at least 48 pt) top-right.** Let information pop-ups close on a tap outside. | Stage cleared, Pause, Settings, Skill Tree, How to play; the ✕ on all of them | Children get stuck on the most-used screens: after every stage and every pause. | Small (one shared CSS footer) |
| **2** | **Show all five tabs from the first launch.** Locked ones get a padlock and say "Clear stage 2 to open" with a picture when tapped. Keep the tab bar on the World Map. | Tab bar | Stops Play and Diary from moving, and teaches what's coming. Apple says exactly this. | Small |
| **3** | **Bigger buttons, and use the whole screen.** Make the icon buttons (⚙️ 📋 ❓ ← ◀ ▶, pause, speed) at least 48 pt, and every "small" button at least 44 pt tall. Let the frame fill the screen height instead of shrinking to 89%. | Everywhere; the Skill Tree, Shop and Home first | About half the buttons are under Apple's minimum, and young children miss small buttons more. | Medium |
| 4 | **"Put on" in the Bag.** The item card gets a button showing the party's faces, and one tap equips. | Bag item card | Removes the only real dead end we found (9 taps down to 3). | Medium |
| 5 | **Voice by default.** Turn "Read buttons aloud" and "Read facts aloud" on for new players, or ask once with a picture of a speaker. Add a 🔊 button to each Diary fact. | First launch, Settings, Diary | The audience can't read well. The feature already exists. | Small |
| 6 | **Simpler party swap.** Tapping a backyard slot opens "Who comes instead?" with the friend faces. Rename "In party ✓" to "Take out". When the party is full, Join says why. | Friends | Six taps, a misleading label and a silent dead end. | Medium |
| 7 | **Clear dot rules.** No dot on the tab you're on. Add a dot on World Map and Home when a Chapter Chest is ready. The Shop dot shows only for a new card. One dot means "a prize to collect". | Home, tab bar, map | Dots stay meaningful, and chests get found. | Small |
| 8 | **Confirm or undo when spending.** A picture confirm ("Sell the ⌚ watch? ✔ ✖") or a 3-second "Undo" toast on Sell, Store buys and Skill Tree spends, and "Leave this stage?" on Pause → Home. | Bag, Shop, Skill Tree, Pause | Stops lost items and coins from stray taps. | Small |
| 9 | **One meaning for ←, one name per place.** ← always goes up one level, and the friend card has a single back. Headings match the tab names (Shop, Friends, Bag, Diary, World Map). | All tab screens | Fewer "where am I?" moments. | Small |
| 10 | **Fewer words.** Replace How to play with 3 or 4 picture cards and fix the old names in it. Cut the one-line intros, or make them speak. Hide 📋 until missions unlock. | How to play, screen intros, Home | Pre-readers skip text, and out-of-date text confuses parents. | Small–medium |

Smaller items outside the top ten:

- The Skill Tree could open on the branch with points to spend and show Done at the top.
- The outfit picker's ✨🔨 swaps the picker for the item card, and Done then drops you out completely.
- The grown-up gate could use a harder task than a single-digit times table, such as typing a spelled-out number or a press-and-hold.
- Chest prize numbers need to be bigger.

## Screenshots of the main problems

All files are in `/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/`.

| Problem | File |
|---|---|
| Stage cleared: Next stage and Home off-screen | ![](/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/x-clear.png) `x-clear.png` |
| Pause: Keep going off-screen | ![](/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/t09-pause.png) `t09-pause.png` |
| Settings: Done off-screen | `t09-settings.png` |
| Skill Tree: Done 2 screens down | ![](/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/t04-tree.png) `t04-tree.png` |
| New player: two tabs, Play at the far left | ![](/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/home-new.png) `home-new.png`, plus `x-tabs-1.png`, `x-tabs-2.png`, `x-tabs-3.png` |
| Bag: text instead of a "put on" button | ![](/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/menus/t03-bag-itemcard.png) `t03-bag-itemcard.png` |
| Too many dots, but none for the ready chests | `x-home-missions-ready.png` |
| Chests: small Claim button and tiny prize numbers | `t06-chests.png` |
| Friend card: two backs, "In party ✓" | `t03-friend-card.png` |
| Shop: every price is one tap | `x-store.png` |

## Sources

- [Apple Human Interface Guidelines: tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars). Don't hide or disable tabs, keep the tab bar visible, reserve badges for critical information.
- [Apple Human Interface Guidelines: modality](https://developer.apple.com/design/human-interface-guidelines/modality). An obvious way to dismiss, keep modal tasks short, one at a time.
- [Apple Human Interface Guidelines: sheets](https://developer.apple.com/design/human-interface-guidelines/sheets). Close and Done placement, swipe to dismiss.
- [Apple Human Interface Guidelines: buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) and [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility). The 44 × 44 pt minimum.
- [Apple: design safe and age-appropriate experiences (Kids)](https://developer-mdn.apple.com/kids/). Parental gates.
- [Google: designing engaging apps for kids](https://developers.google.com/building-for-kids/designing-engaging-apps). Always-visible icon navigation, home and back arrows, no text-only buttons, big targets.
- [Nielsen Norman Group: Designing for Children (video)](https://www.nngroup.com/videos/designing-children/) and [Feifei Liu's articles on children's UX](https://www.nngroup.com/articles/author/feifei-liu/?page=5). Clear specific instructions, big tap targets, use existing conventions.
- [NN/g: touch target size](https://www.nngroup.com/articles/touch-target-size/)
- [University of Florida MTAGIC: children's touchscreen interactions](https://init.cise.ufl.edu/?p=2686) and the [contact-patch write-up](https://cur.at/ARpE5tD?m=web)
- [UXmatters: kids-first design](https://www.uxmatters.com/mt/archives/2020/01/ux-design-for-kids-key-design-considerations.php)
- [Aten Design: designing for young audiences (audio instructions)](https://atendesigngroup.com/articles/designing-young-audiences)
- [DesignCrowd: designing a website for kids (PBS Kids example)](https://blog.designcrowd.com/article/2203/designing-a-website-for-kids)
- [Sago Mini](https://sagomini.com/) and [Family Gaming Database: Sago Mini accessibility](https://www.familygamingdatabase.com/accessibility/Sago+Mini)
- [BlueStacks: Survivor.io beginner's guide (main menu tabs)](https://www.bluestacks.com/blog/game-guides/survivor-io/sio-beginner-guide-en.html) and [TalkAndroid: Survivor.io guide](https://www.talkandroid.com/24372-survivor-io-ultimate-game-guide-with-tips-2023/)
- [BINUS: UI/UX analysis of Clash Royale](https://binus.ac.id/bekasi/2025/03/analysis-towards-ui-ux-of-clash-royale-towards-the-gameplay/)
- [Pratt: design critique of Brawl Stars](https://ixd.prattsi.org/2025/02/design-critique-brawl-stars/) and [Pratt: design critique of Pokémon GO](https://ixd.prattsi.org/2026/09/design-critique-pokemon-go/)
- [Duolingo: the new home screen design (the path)](https://blog.duolingo.com/new-duolingo-home-screen-design/)
- [Braze: beware red-dot badging](https://www.braze.com/resources/articles/beware-red-dot-badging)
- [FTC: Apple settles over children's in-app purchases (2014)](https://www.ftc.gov/node/47265)
- The earlier report in this folder, `Menu and navigation research.md`, covers the build 33 tab-bar redesign.
