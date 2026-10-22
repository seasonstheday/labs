# Character style benchmark: 3D sheets or 2D drawings?

Researched 2026-10-22 for Why, Dad? Defender. Screenshots are in
`/tmp/claude-0/-home-user-labs/c02ddbb7-c8b3-50e4-ba53-58a5bf73c64f/scratchpad/style/` (file names below).
That is a session scratch folder, so copy anything you want to keep.

## Recommendation

**Make the 2D drawings the official look for all 28 friends, everywhere, and bring them to life
with code animation plus a few extra drawn poses per friend. Don't spend Meshy credits on the
17 missing friends.** Keep 3D only where it is clearly better: Dad in battle (he is the only
character with a real rig and a real throw animation) and the myths and bosses. Give both a
brown outline and turn them a little toward the camera, so they sit next to the drawings without
looking like they came from another game.

This is option **(d), a hybrid**, but it leans heavily on (b): friends are 2D, enemies and Dad are
3D with outlines. Skeletal 2D animation (Spine-style) is a good later step for the five or six most
popular friends. It is not needed now.

Why, in four lines:

1. At battle size (about 70 to 90 phone pixels tall), the drawings read much better. They have
   faces turned toward you, thick outlines and clean colours. The 3D sheets show side profiles
   with no visible eyes, very thin outlines and muddy texture (pictures 20 and 23).
2. The 3D friends are a **single still frame**. They animate exactly like the drawings do (bob,
   squash and lean from code), so 3D adds no motion today.
3. Every one of the 28 friends already has a drawing in one consistent style. Going 3D means
   about 374 Meshy credits (you have 12) plus a lot of clean-up, and it would still give you 28
   statues.
4. The successful kids' and family games that small teams make (Kingdom Rush, Cut the Rope,
   Pokémon Café ReMix, Toca Boca, Sago Mini, Duolingo) use 2D illustration with cut-out or vector
   animation. Real-time 3D (Brawl Stars, Archero, Bloons TD 6, Pokémon GO, Pocket Camp) comes
   with big art teams and fully rigged, animated models.

## Action list (in order)

| # | What | Why | Rough effort |
|---|---|---|---|
| 1 | Keep friends on their 2D drawings in battle, menus and title. Remove the 3D friend sheets from the battle path (or keep them only as a debug option). | One consistent look for 28 friends | Already done in battle; 15 min to tidy |
| 2 | Add a 2 px brown (#3a2c20) outline to 3D Dad and the myths. Either re-render with a thicker outline or add a cheap outline when the sprite is first drawn and cache it. | Makes 3D Dad and myths match the outlined drawings; biggest single fix (picture 23, row C) | 2 to 4 hours |
| 3 | Bias 3D facing toward the camera: when Dad faces left or right, use the 3/4 front rows (1 and 7), not the pure side rows (2 and 6). Avoid the back rows unless he is really walking away. | Faces show; this is the "cheat to camera" rule of stage and animation | 1 hour |
| 4 | "Juice kit" for friends in code: blink (a lid shape over eye points stored per friend), anticipation squash before an attack, a 1-frame white flash and recoil on hit, a happy hop and spin on level-up, a small tilt toward the target. | Most of the feel of real animation at no art cost | 1 to 2 days |
| 5 | Generate 3 extra poses per friend with the same Gemini prompt and style: **attack**, **happy/cheer**, **ouch**. Swap to them for 0.2 to 0.6 s. | Gives real acting (mouth open, arms up) that bobbing cannot; 84 images, about $4 to $8 | 1 to 2 days with curation |
| 6 | Menu life: idle breathing and a blink on party cards, a jump and a sparkle when picked, a cheer pose on level-up, star-up and tree finisher. | Kids tap characters to see them react; this is where attachment forms | 1 day after #4 and #5 |
| 7 | Decide Dad: either keep 3D Dad in battle (with #2 and #3), or test the existing 2D mascot poses (wave, pointing, amazed, talking) in battle for a week. Menus already use the 2D mascot. | Today the title shows a flat drawn Dad and battle shows a 3D Dad | 2 hours to try |
| 8 | Later, optional: Spine cut-out rigs for the 4 to 6 starter and Legendary friends (Webster, Hopper, Sparky, Inky, Chroma). | Smooth walk cycles and squishy tentacles for the stars | $69 to $369 licence plus about 0.5 to 1 day per friend |

**On the Meshy credits:** 17 friends × about 22 credits is about 374 credits. You have 12, and the
balance resets on 6 November. If you want to use credits, spend them on something that
gets a rig and a real animation, like the Kid or a new boss with a signature move. Don't spend
them on more one-frame friend statues the game no longer shows.

## What the game looks like today

| Picture | What it shows |
|---|---|
| `01_title.png` | Title lawn: 2D mascot Dad waving, 2D Webster and Shelly peeking from behind the Play button |
| `02_friends_tab.png`, `03_friends_tab_scrolled.png` | Party cards: all 2D drawings, clean and consistent, Dad is the 2D mascot |
| `04_detail_webster.png`, `05_detail_shelly.png` | Friend detail card: 2D drawing, small and static |
| `10_battle_s3_webster-shelly-sparky(_zoom).png` | Backyard 4: 3D Dad in the middle, 2D friends around him |
| `10_battle_s12_hopper-goldie-nilla(_zoom).png` | Library 3, normal |
| `10_battle_s12_hopper-goldie-nilla_3Dforced(_zoom).png` | Same, with the 3D friend sheets forced on (as before the recent change): 3D Hopper and Nilla next to 2D Goldie |
| `10_battle_s30_inky-uni-pip(_zoom).png` | Jungle 1 with myths: 2D friends among 3D myths |
| `10_battle_s30_inky-chroma-luna(_3Dforced)(_zoom).png` | Jungle with Legendaries, 2D and forced 3D: 3D Inky shows the back of its head while aiming |
| `20_gallery_battle_size.png` | The 11 friends with both versions, 3D sheet vs drawing, at real battle size on three arena colours |
| `20_gallery_menu_size.png` | Same at menu-card size |
| `21_3d_eight_directions.png` | All 8 facing directions for Dad, four friends, two myths and a boss |
| `22_3d_cells_2x_closeup.png` | One 3D frame per friend at 2× zoom: texture detail and outline |
| `23_3d_fixes_facing_outline.png` | Mock-up of fixes: today vs turned 3/4 vs 3/4 + brown outline vs the drawing (Dad's head is clipped by the mock-up canvas, not in the game) |

### What we see

- **The drawings win at battle size.** Big eyes facing the player, a thick brown outline and
  flat colours survive being shrunk to 80 px. The 3D versions keep their shape but lose their
  faces (`20_gallery_battle_size.png`).
- **3D friends are drawn in side view.** The game asks for the direction "slightly right"
  (`phi = .35`), which picks the pure side row. Webster, Scuttle, Puddles and Luna show no face at
  all. When a friend aims upward it can show its back (Inky in the Jungle 3D-forced shot).
- **Outlines are too thin to survive.** The renderer uses an outline of 1.2% of model size, in
  black. On a 160 px cell shrunk to about 80 px, this is under 1 px and disappears. The drawings use
  about 3 to 4 px brown lines.
- **Texture mush.** Meshy bakes its own soft shading into the texture, and the toon shader adds
  bands on top. Hopper's spots, Nilla's speckles and Pip's shell turn to grey-green noise
  (`22_3d_cells_2x_closeup.png`).
- **Some models lost the design.** Luna was modelled with her wings upright, so from the game's
  camera she is a thin green sliver. The drawing shows her wide open wings, which are her whole
  silhouette. Sparky's glowing tail is gone in 3D, and Scuttle's face is tiny.
- **Scale drifts.** 3D friends are drawn 10% taller than their drawings, and the sheets are scaled
  by cell size, not by the model's real height. So 3D Hopper looks bigger than 3D Scuttle by more
  than intended.
- **Mixed looks clash in the same frame.** A soft 3D Dad with no outline stands among crisp
  outlined 2D friends (`10_battle_s3..._zoom.png`). It is noticeable but acceptable, because Dad is
  the "hero". It becomes jarring when friends mix (3D Hopper next to 2D Goldie).
- **The 3D myths read well enough.** Their colour tint and big angry eyes carry them, and
  having enemies look a bit different from friends is a good thing. An outline would still help
  in busy waves (`10_battle_s30_inky-uni-pip_zoom.png`).
- **Ground shadows are fine.** The game draws a soft ellipse under everyone. Keep it.

## How comparable games do it

| Game | How characters are made | Outlines and shading | Notes |
|---|---|---|---|
| **Kingdom Rush** (Ironhide), incl. Kingdom Rush 5 Alliance (2024) | 2D, "rich hand-drawn characters and stages" | Thick dark outlines, flat colours | Tiny units still read because of outline and silhouette. The studio came from Flash games. |
| **Plants vs. Zombies / PvZ2** (PopCap) | 2D cut-out animation: drawn parts moved by an animation tool. The first game's animations ship as Flash `.fla` files. | Outlined, flat with one shade | The classic "drawings that move" approach; huge cast in one style |
| **Bloons TD 6** (Ninja Kiwi) | Real-time 3D in Unity, 2.5D view; the first Bloons TD in 3D (earlier ones were 2D) | Cartoon toon look, light outlines | Big team, every monkey modelled, rigged and animated |
| **Brawl Stars** (Supercell) | Real-time low-poly 3D, stylised textures | Bright, simple shapes | Supercell's talks stress that each brawler must read its role and silhouette "almost instantly" |
| **Archero / Archero 2** (Habby) | Real-time cartoon 3D, top-down | Simple colourful style | Not confirmed which engine; reviews call it "cartoonish 3D" |
| **Survivor.io** (Habby) | Described in trade press as a "2D roguelike"; how characters are drawn is not documented | n/a | Could not verify; left out of the conclusion |
| **Pokémon GO** | Real-time 3D models, originally reused from the 3DS games, animated in Unity | Smooth cel look | Benefits from a decade of existing models |
| **Pokémon Café ReMix** | 2D illustrated style by Hiroyuki Yamamoto, a deliberate change from his 3D card art | Outlined, flat | Big friendly faces; closest in spirit to our drawings |
| **Animal Crossing: Pocket Camp** | Real-time 3D; assets derived from the 3DS New Leaf game | Soft toon | Again reuses an existing 3D library |
| **Cut the Rope** (ZeptoLab) | 2D; Om Nom designed like a 1 to 2 year old, with charm from "animation and sound" | Outlined, flat | One character, animated with care, beats many static ones |
| **Toca Boca / Sago Mini** | 2D illustrated; Sago Mini builds 2D apps in Unity with in-house animators | Flat shapes | Tooling (Spine or other) not confirmed |
| **Duolingo** | 2D vector characters animated in Rive with state machines (idle blinks, nods, lip-sync) | Flat, no outline, very bold shapes | Chose Rive because a few assets combine into many reactions and it is far smaller than video |
| **Bluey: The Videogame** | 3D models made to look like the 2D show | Flat-shaded to match | Reviewers praised the look but noted a "disconnect between the cartoon-styled character models and the 3D environments" |
| **Hades** (Supergiant) and **Dead Cells** (Motion Twin) | Pre-rendered 3D: models animated in 3D, exported as 2D frames from many angles. Hades' menu portraits are hand-painted 2D. | Strong ink lines (Hades) or pixel art (Dead Cells) | Proof that our current pipeline *can* work, but they use hand-made models and dozens of frames per move, not one |

### What the pattern says

- **Real-time 3D works for teams that rig and animate everything** (Supercell, Ninja Kiwi, Nintendo,
  Niantic). The payoff is motion and camera freedom. Our camera never moves and our friends don't
  have animations, so we pay the 3D costs without getting those benefits.
- **Pre-rendered 3D works when there are many frames and strong lines** (Hades, Dead Cells). Ours
  has one frame and a hairline outline. We'd have to redo the renders and add rigs and animations
  for every friend to get there.
- **Kids' games by small teams mostly use 2D drawings with motion layered on top**, through cut-out
  animation, vector rigs or swapped poses. Cut the Rope and Duolingo show that one well-animated
  drawing builds more attachment than a detailed still.
- **Readability is the rule everyone states.** The Supercell talks and general 3D character
  guidance say a character must be recognisable "from different directions and distances". At our
  battle size, that means a face toward the player and a dark outline.

## Option scorecard

Scores are 1 (poor) to 5 (great) for our game today.

| | (a) 3D sheets for friends | (b) 2D drawings + code motion | (c) 2D skeletal (Spine-style) | (d) Hybrid: 2D friends + pose swaps, 3D Dad and myths with outlines |
|---|---|---|---|---|
| Readability at battle size | 2: side views, thin lines | 5 | 5 | 5 |
| Consistency across 28 friends | 2: only 11 exist, quality varies | 5: all 28 done in one style | 4: depends on cutting skill | 4: Dad and myths differ on purpose |
| Cost for the 17 missing | about 374 credits + clean-up, 2 to 3 days | 0 | about 0.5 to 1 day each + licence | about $5 of images + 1 to 2 days |
| Animation quality | 1 today (1 frame); 4 if rigged | 2 to 3 | 4 to 5 | 3 to 4 |
| Performance on older iPhones | OK: big sheets (Dad's throw sheet is 3072 × 1536, about 19 MB in memory) | Best: one 400 px image each | Needs a runtime; the plain canvas version cannot do mesh bending | Good |
| Menus (idle, picked, celebrate) | Only with re-renders | Good with code | Best | Good, with real cheer poses |
| Gameplay (wind-up, hit, facing) | 8 real directions, but faces turn away | Mirror left and right only; good enough (Kingdom Rush does this) | Mirror + real wind-ups | Mirror + attack and ouch poses |

## Concrete fixes for the 3D models we keep (Dad, myths, bosses)

1. **Outline**: raise `--outline` from 0.012 to about 0.03 to 0.04 and colour it #3a2c20, or add a
   2 px outline in the game when a frame is first drawn (see `23_3d_fixes_facing_outline.png`, row C).
   An outline added in the game stays the same thickness at every size, so it is the safer option.
2. **Facing**: map "left" and "right" to the 3/4 front rows. Use back rows only for real movement
   away from the camera.
3. **Texture**: render with flat ("unlit") colour from the texture, plus one toon shadow band,
   so Meshy's baked shading doesn't double up. Optionally reduce colours to a small palette per
   model.
4. **Scale**: size each sheet by the model's measured height per cell, not by cell size, and
   use the same height table as the drawings.
5. **Camera**: a higher camera (35° to 40° instead of 25°) shows more of the top and face of short
   animals and fits the top-down arena.
6. **Pose**: friends were modelled in neutral poses. If any friend ever goes back to 3D, model it from
   a 3/4 front drawing with the face, wings or claws spread out, not from a side view.

## Ideas for making characters feel alive (cheap, code plus a few drawings)

- **Cards**: a slow breathing scale (2%), a blink every 3 to 6 s, a look toward the finger on
  touch, a hop and a sparkle when picked into the party, and a sad droop when swapped out.
- **Level-up / star-up / tree finisher**: switch to the "cheer" pose, add a squash-stretch jump,
  confetti and a short sound.
- **Battle**: before an attack, squash down for about 0.15 s, then stretch and lean toward the
  target (the code already does part of this). On a hit, show the "ouch" pose for about
  0.2 s with a white flash and a small knock-back. Use the "happy" pose when a wave is cleared.
- **Facing**: mirror the drawing toward the target and add a small tilt toward it (Kingdom
  Rush-style). That is enough; kids do not miss the back view.

## Sources

- Kingdom Rush: https://en.wikipedia.org/wiki/Kingdom_Rush ; Kingdom Rush 5 press release ("rich hand-drawn characters and stages"): https://gamespress.westeu-v2.propressroom.com/5-Reasons-to-Watch-for-Kingdom-Rush-5-Alliance ; https://www.pocketgamer.com/kingdom-rush-5-alliance/new-release-announcement ; founder interview: https://www.kodeco.com/2769-making-a-hit-tower-defense-game-a-top-app-dev-interview
- Plants vs. Zombies: https://en.wikipedia.org/wiki/Plants_vs._Zombies_2 ; animation files as .fla: https://fr.vgtimes.com/games/plants-vs-zombies/files/18496-utilitaire-ddition-danimation.html
- Bloons TD 6: https://en.wikipedia.org/wiki/Bloons_TD_6 ; https://www.bloonswiki.com/Bloons_TD_6 ; https://www.androidauthority.com/bloons-td-6-android-876385/
- Brawl Stars: https://www.pocketgamer.biz/5-creative-pillars-for-designing-brawlers-in-supercells-brawl-stars ; GDC clips: https://gamedev.net/news/3430/ , https://gamedev.net/news/4113/ ; Supercell job post (low-poly 3D, stylised textures): https://hitmarker.net/jobs/supercell-3d-character-artist-brawl-stars-885364
- Archero: https://www.gamepressure.com/games/archero/zc5f01 ; Archero 2 teardown: https://someselectedstories.substack.com/p/tiny-teardown-archero-2-habby-games
- Survivor.io: https://www.pocketgamer.biz/feature/79592/how-innovation-and-iteration-has-transformed-survivorio/
- Pokémon GO: https://twinfinite.net/opinion/niantic-pokemon-go-retro-8-bit/ ; Unity work on GO Fest: https://mrguy.artstation.com/projects/9N2Dya
- Pokémon Café ReMix: https://bulbapedia.bulbagarden.net/wiki/Hiroyuki_Yamamoto ; https://siliconera.com/?p=842642
- Animal Crossing: Pocket Camp: https://nookipedia.com/wiki/Animal_Crossing:_Pocket_Camp ; https://www.pocketgamer.com/articles/075698/r/
- Cut the Rope: https://en.wikipedia.org/wiki/Cut_the_Rope_(video_game) ; ZeptoLab interview: https://www.ifanr.com/49313.md
- Sago Mini: https://jobs.sagomini.com/apply/gylFRTpeYL/2D-Unity-Game-Developer
- Duolingo and Rive: https://blog.duolingo.com/world-character-visemes
- Bluey: The Videogame: https://en.wikipedia.org/wiki/Bluey:_The_Videogame ; https://www.cgmagonline.com/review/game/bluey-the-videogame-switch-review ; https://www.nintendolife.com/reviews/nintendo-switch/bluey-the-videogame
- Hades (3D rendered to 2D frames, hand-painted portraits): https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862 ; https://kotaku.com/the-art-of-hades-1845443438
- Dead Cells 3D-to-2D pipeline: https://80.lv/articles/case-study-dead-cells-character-art-pipeline/ ; https://gamedeveloper.com/program/gama-archive
- Spine: showcase https://esotericsoftware.com/spine-showcase ; prices https://esotericsoftware.com/spine-purchase ; canvas runtime limits and mobile reports https://esotericsoftware.com/forum/d/16475 , https://ko.esotericsoftware.com/forum/d/28652-website-performance-issues-after-integrating-spine-player
- Animation principles in games (squash and stretch, anticipation): https://gamedeveloper.com/production/the-12-principles-of-animation-in-video-games
- 3D readability principles: https://www.theseus.fi/handle/10024/904059 ; https://www.taylorfrancis.com/books/9781482254808/chapters/10.1201/b18373-44

Not verified: the exact tools used by Kingdom Rush, Toca Boca, Sago Mini and Survivor.io, and
Archero's engine. Some vendor pages could not be opened from the research sandbox, so a few facts
come from search summaries of those pages.
