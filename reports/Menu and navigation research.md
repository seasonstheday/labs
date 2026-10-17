# Why, Dad? Defender: menus and navigation

What comparable games and kids' design guidance say about home screens and menus, what Defender did before build 33, and what changed. October 2026.

## What the research says

- **A bottom tab bar is the genre standard.** Survivor.io's home has five bottom tabs: Shop, Equipment, Battle, Evolve and Challenge. Battle is the home screen, where you start the next chapter. Strategy-game home screens split into a top bar for currencies, a middle for the party, and a bottom tab menu for everything else.
- **Three to five tabs.** Apple's guidance is to use the fewest tabs that still cover the app, about three to five on iPhone. Every extra tab makes the app harder to use, and a "More" tab hides things.
- **Icons with words, always visible, big targets.** Google's guidance for kids' apps is icon-based navigation that stays on screen, with familiar symbols like home and back. Avoid text-only buttons, since many players can't read yet. Make targets large, because children miss small targets more often than adults. A University of Florida study found the youngest group, ages 7 to 10, had the most trouble.
- **Grids for collections.** Apple recommends standard grids over custom layouts. A grid shows 6 to 15 items on a phone screen in portrait, where a list shows 3 to 5.
- **Dots only when there's something to do.** Red badges that are always on stop meaning anything, which designers call "badge blindness". Keep them for actionable things and keep their meaning consistent.
- **Too many buttons on one hub confuses new players.** A 2025 design critique of Brawl Stars' home screen makes this point and proposes a few switchable tabs instead.

## What Defender had (build 32)

- **The home screen:** eight small icon buttons in two columns (Cards, Store, Garage, Room, Party, Items, Diary, Missions), a World Map button, and How to play and Settings underneath. The labels were 11px.
- **Getting around:** every screen was a dead end with a back arrow to home. Moving from the Party to the Garage took three taps through home.
- **The Party:** one long scrolling list of 17 large cards, each showing every detail at once.
- **Text:** every screen opened with a long explanation paragraph.
- **Out-of-date text:** the Store's Library Card description still promised "a draw".

## What changed (build 33)

| | Before | After |
|---|---|---|
| Getting around | back to home, then a different button | a five-tab bar on every menu screen: Shop, Friends, Play, Bag, Diary, with Play in the middle and raised |
| Home | eight small icons and a map button | one big "▶ Play" showing the next stage, the World Map underneath, and Missions, How to play and Settings as icons top right |
| Starting a match | home, map, pick a stage, play | one tap on Play goes to the next stage |
| Friends | a list of 17 full cards | a grid: the party of four on top, then friends you have, then friends still to meet with their page bars. Tap one for the full card |
| Garage | its own button on home | the Weapons half of the Friends tab, and a button on each friend's card goes straight to their weapon |
| Library Cards | a separate home button | the first row of the Shop, with a dot on the Shop tab while you have one |
| Reading Room | a separate home button | a button at the top of the Diary |
| Intro text | a paragraph per screen | one line per screen |
| Dots | only on Missions | on the Play tab (missions ready), the Shop tab (a Library Card to spend) and the Friends tab and grid (a friend whose own pages can buy a star or fill their book). Never just for having Blank pages, which show as a count instead |

The tab bar hides during matches and on the World Map, which has its own play button.

## Still to consider

- **Haptics on a real phone:** a light tap on every tab press.
- **Testing with kids:** watch a few 6 to 9 year olds use it. The research on this age group is thin, and testing with the actual audience is the strongest evidence.

## Sources

- [BlueStacks: Survivor.io beginner's guide (main menu tabs)](https://www.bluestacks.com/blog/game-guides/survivor-io/sio-beginner-guide-en.html)
- [Survivor.io guide on TalkAndroid](https://www.talkandroid.com/24372-survivor-io-ultimate-game-guide-with-tips-2023/)
- [Coherent Labs: a strategy-game battle deck screen](https://coherent-labs.com/posts/how-to-create-a-modern-battle-deck-screen-for-mobile-strategy-game/)
- [Apple Human Interface Guidelines: tab bars](https://developer-rno.apple.com/design/human-interface-guidelines/components/navigation-and-search/tab-bars)
- [Apple Human Interface Guidelines: collections](https://developer-rno.apple.com/design/human-interface-guidelines/components/layout-and-organization/collections)
- [Google: designing engaging apps for kids](https://developers.google.com/building-for-kids/designing-engaging-apps)
- [University of Florida: touch interfaces for children](https://init.cise.ufl.edu/designing-smarter-touch-based-interfaces-for-educational-contexts/)
- [Braze: beware red dot blindness](https://www.braze.com/resources/articles/beware-red-dot-badging)
- [UX Collective: badge notifications](https://uxdesign.cc/badge-notifications-why-everyone-wants-to-get-rid-of-them-decedb28b46d)
- [Pratt: design critique of Brawl Stars](https://ixd.prattsi.org/2025/02/design-critique-brawl-stars/)
- [mGBA forum: grid against list for game libraries](https://forums.mgba.io/showthread.php?tid=408)
