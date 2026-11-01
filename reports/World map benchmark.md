# World map benchmark

Why, Dad? Defender: how the best-loved mobile games handle their level map, and what this game should do with its World Map.

Researched 2026-11-01. No game code was changed.

## The short answer

**Yes, revisit the map, but don't rebuild it.** The painted bands, the zigzag path, the pins and the villain waiting up ahead are already the standard saga layout. What's missing is the thing every leader adds on top: **a little life, and a "you are here" character.** At the moment nothing on the map moves, and nothing marks the player except a gold pin.

**Small animated touches go a long way, but only certain kinds.** The ones that pay off are:
1. **A player character on the path** who hops to the next pin after a win.
2. **A short reveal when a new chapter opens.**
3. **Two or three slow ambient loops per band**, like water, smoke, a torch or birds.
4. **Things kids can tap to get a silly reaction.**

Real 3D isn't needed. Candy Crush tried a 3D-perspective map, and players mostly remember it as hiding their progress. Kingdom Rush, the most-loved map in tower defense, is flat painted 2D with a few looping critters.

**Evidence quality.** No one has published a clean A/B test of "animated map vs. static map". The best data point is Royal Match. It tested a no-map variant, an episode-background variant and a decorate-the-castle variant, and the castle won ([Naavik](https://naavik.co/digest/royal-match-finding-success-through-iteration/)). That suggests the **meta screen matters for retention when it shows visible progress**, not just when it looks pretty. Everything else here is design practice from the leaders, not measured lift.

---

## What the leaders do

### Saga and puzzle games

| Game | Map style | What moves | Progress and what's next | Sources |
|---|---|---|---|---|
| **Candy Crush Saga** | Long vertical scroll of themed "episodes", now in a 3D perspective view with a straight path (revamped Aug 2017). | Character animations and pop-up characters on the map. Tiffi and friends animate at episode stops. Short comic scenes before and after each episode, with the guide pointing the way. | Your avatar sits at your current level, and friends' avatars used to show along the path. The next episode is a locked, themed scene. | [Map](https://candycrush.fandom.com/wiki/Map), [World](https://candycrush.fandom.com/wiki/World), [Candy Town](https://candycrush.fandom.com/wiki/Candy_Town), [map art overhaul](https://kleeam.artstation.com/projects/L3lDBv) |
| **Royal Match** | **No level map at all.** One big Play button over the castle area you're decorating. | The castle itself. Each finished task visibly changes part of the scene. | A level number on the button, and the next decoration task. | [Naavik A/B tests](https://naavik.co/digest/royal-match-finding-success-through-iteration/), [Funovus](https://www.funovus.com/blogs/royal-match-dominates-match-3-what-can-all-designers-learn/), [Naavik deep dive](https://naavik.co/deep-dives/royal-match/) |
| **Homescapes / Gardenscapes** (Playrix) | Renovation scene as the meta, plus an area map. Austin's icon moves to the area you pick. | Spine-rigged characters (faces, idles), animated story scenes, and new areas revealed as you restore them. | Task list plus a story. The map is gated until the second area unlocks. | [Gardenscapes map help](https://playrix.helpshift.com/hc/en/5-gardenscapes/faq/16381-how-do-i-switch-between-garden-areas-1762390008/?l=en), [Spine rig for Gardenscapes](https://www.behance.net/gallery/164022629/Spine2D-Character-animation-for-Gardenscapes-Playrix?locale=en_US), [Playrix ArtStation](https://playrix.artstation.com/albums/2190641) |
| **Toon Blast** | Episode-based, moving away from the classic saga path toward a streamlined Play-first home. The cast (Cooper, Wally, Bruno) carries each themed episode. | Characters. | Episode name and number, 50 levels per episode. | [fan summary](https://shapes.inc/fandom/toon-blast), [App Store](https://apple.co/2Dooqhh) |
| **Fishdom** | The aquarium is the meta, the same pattern as Playrix's "scene that changes". *(No good source found. Based on general knowledge.)* | Fish swim and water shimmers in the tank. | Decorate-to-progress. | n/a |

**The pattern:** casual leaders are moving away from long passive scrolls toward **one Play button plus a living scene that changes as you progress.** The scroll stays where there's a story world to travel through, which is this game's case.

### Tower defense and strategy

| Game | Map style | What moves | Progress and what's next | Sources |
|---|---|---|---|---|
| **Kingdom Rush** (Frontiers, Origins, Vengeance, Alliance, Genesis) | One big hand-painted 2D world map. Branching paths link towns and enemy camps. | Small details and critters: villagers in Frontiers, a zombie cameo. Fans call it "mostly static" and want more motion. In the stages, the scenery is tappable as easter eggs: windmills stop and start, a seal goes back in the water. | Each stage is a **flag** that earns stars. A Heroic clear adds golden wings to the flag, and an Iron clear gives it a silver tint, so mastery shows on the map itself. A new flag appears at the end of a newly drawn dotted path. | [Steam thread](https://steamcommunity.com/app/2849080/discussions/0/720116096634457099/), [review](https://www.superjumpmagazine.com/legends-of-kingdom-rush-review/), [scenery list](https://kingdomrushtd.fandom.com/wiki/Category:Scenery), [Heroic](https://kingdomrushtd.fandom.com/wiki/Heroic_Challenge), [Iron](https://kingdomrushtd.fandom.com/wiki/Iron_Challenge), [Genesis map reveal](https://www.ironhidegames.com/News/Details/520) |
| **Bloons TD 6** | **No world map.** A grid of map thumbnails sorted by difficulty tab. | Very little. Thumbnails are stills. | Medals on each thumbnail. | [map thumbnails](https://www.bloonswiki.com/Category:BTD6_map_thumbnails), [BTD6 wiki](https://breezewiki.discard.no/bloons/wiki/Bloons_TD_6) |
| **Plants vs Zombies 2** | A world-select carousel of time periods (Penny the time machine), then **one map per world** with level nodes, gates, and side branches for bonus plants. | Themed props and zombies on the map. Branches and gates open up. | Keys and gates. Branches show optional extras, and the next world is a teaser on the carousel. | [TCRF worlds](https://tcrf.net/Plants_vs._Zombies_2:_It%27s_About_Time/Worlds_and_Levels), [PvZ wiki](https://plantsvszombies.wiki.gg/wiki/PvZ_2), [EA world level changes](https://careers.ea.com/games/plants-vs-zombies/plants-vs-zombies-2/news/changes-to-world-levels-and-rewards) |
| **Clash Royale** | **Trophy Road**: a vertical road of arenas. Each arena is a painted, slightly 3D tile, with rewards along the road. | Each arena tile has its own theme, and a big moment when a new arena unlocks. Gates stop you dropping back. | A trophy count with the next arena and next reward visible above you. Extended in 2025–26 to 12,000 and then 14,000 trophies. | [Dec 2025 notes](https://supercell.com/en/games/clashroyale/blog/release-notes/december-update-2025/), [June 2025 notes](https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2025/), [Trophy Road launch](https://clashroyale.com/blog/release-notes/new-update-feature-enter-the-trophy-road.html), [Arenas](https://clashroyale.fandom.com/wiki/Arenas) |
| **Rush Royale** | Similar arena or season road. *(Not sourced. Based on general knowledge.)* | | | n/a |

**The pattern:** in tower defense, the map's main job is to **show mastery** (stars, wings, tints) and **tease the next place**. The most-loved map (Kingdom Rush) wins on painted charm, not on motion, and even its fans ask for more motion.

### Kids' games

| Game | What it does | Sources |
|---|---|---|
| **Toca Boca** | No scores or timers. The company's research found **kids tap every scene, character and prop looking for surprises**, so everything does something (a plant drops leaves, a drawer opens). | [Fast Company](https://www.fastcompany.com/40474511/meet-toca-boca-the-weird-playful-gender-neutral-lifestyle-brand-for-kids), [Toca Boca](https://en.wikipedia.org/wiki/Toca_Boca) |
| **Duolingo path** | Swapped a branching tree for **one single path** ("a complete reboot"). Characters stand beside the path cheering, rigged in Rive so dozens fit in a small download. The current node bounces with a "Start" bubble. **Chests sit on the path** midway through units. Finished units turn gold ("Legendary"). Unit headers say what's coming. | [Apple: Behind the Design](https://developer.apple.com/news/?id=jhkvppla), [Duolingo blog](https://blog.duolingo.com/new-duolingo-home-screen-design), [Rive mascot write-up](https://dev.to/uianimation/how-duolingo-uses-rive-for-their-character-animation-and-how-you-can-build-a-similar-rive-mascot-5d19), [glossary](https://fitatotto.nl/portfolio/duolingo-glossary/), [Legendary](https://happilyevertravels.com/duolingo-legendary-level/) |
| **Prodigy** | An RPG world map of about 10 zones, each with its own landscape, quests and pets to rescue. The pets are the stars. | [Prodigy Game Portal](https://www.prodigygame.com/blog/prodigy-game-portal), [parents' guide](https://prodigygame.com/blog/parents-guide-to-prodigy) |
| **PBS Kids and preschool guidance** | Give immediate feedback on every touch, with a sound when possible. Double-taps read as "broken". Make tappable things look tappable, and keep non-tappable backgrounds calmer. Offer a way to reduce motion and sound. | [Sesame / Cooney Center best practices](https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf), [NN/g kids](https://www.nngroup.com/articles/children-ux-physical-development/), [Smashing](https://www.smashingmagazine.com/2016/01/designing-apps-for-kids-is-not-childs-play/) |

**The pattern:** for kids, **interactivity beats spectacle.** A cloud that wobbles and giggles when tapped is worth more than a fancy shader nobody touches.

### Performance tricks

- **Skeletal 2D (Spine, Rive)** is far smaller than frame-by-frame sprite sheets. Esoteric, the maker of Spine, quotes 18× for a 1-second clip, though that's a vendor figure. It suits characters. One developer measured only about 60–70 Spine objects at 60 fps on a budget phone, against about 350 frame-based ones. So **use skeletal animation for one or two characters, and cheap tricks for ambient loops** ([Spine demos](https://en.esotericsoftware.com/spine-demos), [Spine forum](https://fr.esotericsoftware.com/forum/d/28695-optimizing-spine-animations-for-mobile-game-performance--tips-), [UE forum](https://forums.unrealengine.com/t/how-good-is-spine2d-animation-perfomance-in-ue4/119213)).
- **Ambient loops** are usually 4–8 frame flipbooks on one atlas, plus transform-only tweens (sway, bob, drift, alpha twinkle). Both are nearly free.
- **Menus drain batteries.** Redraw only on change, cap menus at about 30 fps, and pause when idle. Research finds big savings once a game goes idle, about 3 seconds after the last touch ([HotPower 2015](https://engineering.purdue.edu/~hotpower/HotPower_2015_paper_6.pdf), [bugnet](https://bugnet.io/blog/how-to-fix-mobile-game-battery-drain), [gamedev.net](https://www.gamedev.net/articles/programming/general-and-gameplay-programming/developing-iphone-games-for-longer-battery-life-r2765/)).
- **"Juice"** means small, layered feedback that makes a thing feel alive without changing the rules: squash and stretch, easing, particles, sound ([Juice it or lose it, summary](https://gamejuice.pages.dev/articles/juice-it-or-lose-it-lessons)).

### Common pitfalls

- **Hiding progress.** Candy Crush players complained that the cycling path shapes felt like "going in an endless circle", and that friends' progress disappeared from the map ([King Community](https://community.king.com/en/candy-crush-saga/discussion/345129/could-you-please-change-the-map-back-to-new-episodes-per-15-levels-you-complete), [King Community](https://community.king.com/en/candy-crush-saga/discussion/259597/map-progress)).
- **Making the map a step in the way.** Royal Match, Toon Blast and this game's own Play button already go straight to the next stage. Keep the map for choosing and admiring ([Menu usability benchmark](Menu%20usability%20benchmark.md)).
- **Clutter.** For young kids, too many moving things compete with the pins. Calm, muted backgrounds help tappable things stand out (Smashing).
- **Slow scrolling.** 40 pins (80 with Book 2) means a long scroll. Always open centred on the current pin, which the game already does.
- **Battery and heat** from animating off-screen bands, or from running at 60 fps on a menu.
- **Big download** from frame-by-frame art for 16 chapters.

---

## How this game compares today

From `defender/index.html`, `drawMap` and `buildMap`:
- The map is drawn once onto a 440 px canvas at 2×. There are eight 200 px bands (`map_N.webp`, or a code-drawn fallback), a dotted path, and 50 px DOM pins. Nothing animates.
- Already good:
  - It opens on the current pin.
  - Stars show on the pins, and a 🔥 crown marks Master.
  - Locked bands are dimmed with a 🔒.
  - Sir Ever-So-Sure waits at the chapter's last page, with purple footprints leading to him. This is a real villain teaser, like PvZ2's next-world tease, and worth playing up.
  - The Chapter Chests have a reveal.
- Missing compared with the leaders:
  - No player character on the path.
  - No unlock moment.
  - No ambient life.
  - Nothing to tap except pins.
  - No mastery shown on the band itself (Kingdom Rush flags, Duolingo gold units).
  - The pin bounce on the current stage is a static scale, not a loop.

Because the bands are static images on a canvas, the cheapest route is **one small overlay layer**: a second transparent canvas, or a few absolutely positioned DOM or CSS sprites. It animates only the bands on screen, and the painted art stays as it is.

---

## Recommendations, ranked

Impact is for a 4+ player. Effort is for the current web/canvas build.

| # | Recommendation | Why (who does it) | Impact | Effort |
|---|---|---|---|---|
| **1** | **Put the Kid (or the Kid and Dad) on the path at the current pin.** After a win, the Kid hops along the dotted path to the next pin (about 1 s, a few bounces, a "boing" sound). A tap on the Kid gives a giggle or a wave. | Candy Crush avatar, Gardenscapes' Austin icon, Duolingo characters. This is the single clearest "you are here, this is your adventure" cue. | ★★★★★ | Small–medium (one sprite with a 2–4 frame hop, a tween along the existing quadratic path) |
| **2** | **Bounce the current pin and add a "Play!" bubble.** Use a soft looping bob or pulse, not just scale 1.15. | Duolingo's bouncing current node. Tells a pre-reader where to tap. | ★★★★☆ | Tiny (CSS keyframes) |
| **3** | **A chapter-unlock reveal.** On the first map visit after a chapter boss, the camera scrolls up, the band "un-greys" (sweep the dim overlay off, or a torn page unfolds), confetti falls, the chapter's friend pops up waving, and a chime plays. Play it once and save that it played. | Kingdom Rush's new flag with path drawing, Clash Royale's arena unlock, Gardenscapes' area reveal. This is the "wow" moment, and it rewards coming back. | ★★★★★ | Medium |
| **4** | **Make the villain marker alive.** Sir Ever-So-Sure idles (bob, cape flutter) and peeks out. When the Kid gets close he runs ahead to the next chapter's end. The footprints fade in one by one. A tap gives a short taunt bubble ("Everybody knows…!"). | PvZ2 next-world teaser, Candy Crush episode framing. This game already has the setup. | ★★★★☆ | Small |
| **5** | **2–3 ambient loops per band, only while the band is on screen** (see the list below). Use slow, low-contrast motion, one "hero" loop per band (the torch, sprinkler or whale spout) and one or two small ones. | Kingdom Rush critters, Playrix's living scenes. This is the "burning torch" idea, and it's right as long as it stays sparse. | ★★★★☆ | Medium (a sprite atlas of about 20 small flipbooks, plus tweens) |
| **6** | **One tappable surprise per band.** Tap the frog and it jumps, tap the whale and it sprays, tap the snowman and his hat pops off. Each has a sound, maybe a one-time ⭐ the first time. | Toca Boca ("kids tap everything"), Kingdom Rush easter eggs. Cheap for 4-year-olds and they love it. | ★★★★☆ | Small per item |
| **7** | **Show mastery on the band.** A finished chapter gets a little flag or banner on its band. All stars turns it gold, and Master gets a sparkle. | Kingdom Rush flag wings and tints, Duolingo Legendary gold units. Gives a reason to go back for 3 stars. | ★★★☆☆ | Small |
| **8** | **Put the Chapter Chests on the map** at the halfway and boss pins. They wiggle and sparkle when ready, and opening one plays the existing reveal. | Duolingo chests on the path. Also fixes the hidden chest dot from the Menu usability benchmark. | ★★★☆☆ | Small |
| **9** | **A light parallax layer.** Clouds (or bubbles, snow, stars, depending on the band) drift at about 0.6× scroll speed over the art. Gives depth without 3D. | Standard 2.5D trick. Feels richer than a flat page. | ★★★☆☆ | Small |
| **10** | **A peek at the next locked chapter.** Instead of a flat grey band, show a fog or torn-paper cover with one teaser silhouette (a camel, a penguin) and "Coming next!". | Clash Royale's next arena, PvZ2's world carousel. Builds anticipation. | ★★★☆☆ | Small |
| **11** | **Performance and comfort rules** (do this alongside 1–6): animate only visible bands (IntersectionObserver), 30 fps on the map, stop after about 20 s idle, stop when the tab is hidden, honour `prefers-reduced-motion`, add a "Calm map" toggle in Settings, and keep everything in one atlas under about 1 MB. | Battery research, kids' guidance on reducing motion. | ★★☆☆☆ (prevents harm) | Small |
| **12** | **Skip real 3D on the map.** If the 3D plan goes ahead, use pre-rendered 3D-looking sprites for the Kid and villain, and keep the painted 2D bands. | Kingdom Rush and Duolingo get their charm in 2D. Candy Crush's 3D perspective drew complaints. Live 3D costs battery and build time for little gain on a scroll screen. | n/a | Avoids large effort |

**Suggested order:** 2, then 1 and 4 together (both are characters on the path), then 3, then 5 and 6 band by band (backyard first, since everyone sees it), then 7–10. Build 11 into the first animation PR.

**Watch out for:**
- Keep pins the clearest thing on screen. No ambient loop should be brighter or bigger than a pin.
- Don't put anything moving within about 30 px of a pin, so kids don't mis-tap.
- Book 2 doubles the bands, so reuse the loop system and swap the art.

---

## Ambient animations by chapter (Book 1)

Each chapter has one **hero** loop (the most noticeable), one or two quiet ones, and one **tap** surprise. All of them work as a 4–8 frame flipbook or a simple tween.

| Chapter | Hero loop | Quiet loops | Tap surprise |
|---|---|---|---|
| **1. Backyard** | Sprinkler arcing back and forth with a sparkle spray | Swing gently swaying. Two butterflies on a figure-8 path. Laundry flapping on the line. | Tap the doghouse or red barn and a puppy pops out and barks. Tap the swing for a big swoosh. |
| **2. Pond** | Ripple rings spreading from lily pads, with a shimmer on the water | Duck paddling slowly across. Dragonfly darting. Reeds swaying. | Tap the frog: it jumps to another lily pad with a "ribbit" and a splash. |
| **3. Library** | Desk lamp or candle flickering (the "torch") | Book pages flipping by themselves. Dust motes floating in a sunbeam. Clock pendulum swinging. | Tap a book and it flaps off the shelf like a bird, then lands back. |
| **4. Ocean** | Whale spout puffing every few seconds | Waves scrolling. Sailboat bobbing. A gull gliding across. | Tap the whale for a big spray and a rainbow. Tap the island for a crab scuttle. |
| **5. Desert** | Heat shimmer over the dunes (a wavy distortion, or a cheap faked alpha wobble) | Tumbleweed rolling across now and then. Camel blinking and chewing. Sun rays pulsing. | Tap a cactus: a flower blooms, or a lizard peeks out. |
| **6. Arctic** | Northern lights rippling across the sky (a slow gradient ribbon) | Light snowfall. Penguin waddling or sliding. Igloo chimney smoke. | Tap the snowman: his hat pops off and lands back. Tap the penguin to send it down a slide. |
| **7. Jungle** | Waterfall flowing (scrolling texture plus mist) | Leaves swaying. Parrot flapping on a branch. Fireflies near the floor. | Tap the monkey: it swings on a vine and drops a banana. |
| **8. Night sky** | Twinkling stars (alpha pulse on a few) | Shooting star every 8–12 s. Telescope slowly turning. Planet ring glinting. | Tap the moon for a sleepy yawn. Tap the telescope for a quick zoom bubble showing a constellation. |

**Cross-chapter extras (optional):**
- A drifting cloud or sky layer for parallax (recommendation 9).
- A tiny Dad figure who sometimes waves from the band the Kid is on.
- Seasonal swaps tied to the game's monthly event: snow in December, leaves in autumn.

---

## Notes on sources

- `candycrush.fandom.com` and `gamedeveloper.com` couldn't be fetched from this session (network allow-list). Their findings come from search summaries.
- I found no primary sources for Fishdom, Rush Royale or Bloons TD 6's map screen animations. Those rows are general knowledge and should be checked in-game.
- Royal Match's A/B test (Naavik) is the only experiment-level evidence on meta-screen impact. The other claims describe what leaders ship, not measured retention lift.
