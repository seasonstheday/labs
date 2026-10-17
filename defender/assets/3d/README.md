# 3D-rendered sprite sheets

Toon-shaded sheets rendered from Meshy image-to-3D models of the game's own art
(`defender/tools/meshy_test.py`, `meshy_animate.py`, `render_sheet.mjs`). Transparent PNG,
rows = view directions, columns = animation frames. Each `<id>.json` holds `size`, `dirs`,
`anims` (frames, duration in seconds), `anchors[anim][row][frame]` and `bones`.

## Facing convention (all sheets)

- Row 0 faces the camera (character walks toward the viewer, i.e. screen-down).
- Rows go **clockwise on screen** in 45° steps: 0 down, 1 down-left, 2 left, 3 up-left,
  4 up (back view), 5 up-right, 6 right, 7 down-right.
- So row 2 shows the character's **left** side (face points screen-left) and row 6 its
  **right** side. The camera sits 25° above the horizon.
- Anchors `[x, y, z]` are pixels inside the frame cell (origin top-left) and a depth
  (bigger = nearer the camera). `__ground` is the pixel of the model's origin on the floor;
  draw the sprite so that this point sits on the entity's ground position.

| sheet | cell | frames | ground y | notes |
|---|---|---|---|---|
| dad_idle / dad_walk | 192 | 8 | 165 | idle 1.9 s loop, walk 1.07 s loop |
| dad_throw | 192 | 16 | 165 | 4.3 s "Over Shoulder Throw": 0-5 wind-up, 6-8 arm out (release), 9-12 follow-through, 13-15 crouch (skip) |
| kid_idle / kid_walk | 192 | 8 | 168 | same clips as Dad |
| webster, sparky, hopper, puddles, dusty, pip, scuttle, nilla, luna `_idle` | 160 | 1 | see json | static friends, 8 rows; animate with the code's hop/bob |

Friend ground y: webster 110, sparky 131, hopper 128, puddles 137, dusty 126, pip 123,
scuttle 130, nilla 133, luna 122 (sparky and luna fly, so their ground is below the body).

## Bones (dad.json and kid.json, same rig)

Hips, Spine, Spine01, Spine02, neck, **Head**, head_end (top of the head), headfront,
Left/Right Shoulder, Arm, ForeArm, **Hand**, UpLeg, Leg, Foot, ToeBase. "Right" is the
character's own right. Hats go on `Head`/`head_end`, glasses on `headfront`, a thrown
item in `RightHand`.

## Myths and bosses (creep_<kind>, boss_<id>)

Concept images from Gemini (`tools/gen_creeps.py` → `tools/concepts/`), Meshy image-to-3D in a batch
(`tools/meshy_batch.py`, static, no rig), sheets from `tools/render_all.sh` (creeps 160 px cells,
bosses 192, one idle frame × 8 rows). The creeps are modelled in a neutral grey-beige and the game
washes each myth's own colour over the body (`drawSheet` `tint`), with the myth's sticker at `__mid`.
Kinds: normal, fast, tank, splitter (minis reuse it smaller), dasher, hardcover, flyer, rumour, healer,
gossip, swarm. Bosses: wall, spiders, brain, bolt, boil, triangle, hot, penguin, flat (mirages reuse
the boss). Bricks stay drawn.

## Props (props.png, props.json)

Hand-held things, modelled from primitives in `tools/render_props.mjs` (no Meshy credits):
Dad's seven weapons and the Dad Joke drum, and one prop per friend's weapon line
(fangs, jar lantern, lily pad, feather, spectacles, shell, horn, talons, candle). One
column per prop, 8 direction rows like the bodies, `u` pixels per body unit and the
grip point per row in the JSON. The game pins them to the hand anchor (`drawProp`),
scaled by the body's height and `GEAR3D[id].pk`. Re-render after editing a prop:

    cd defender/tools && node render_props.mjs --out ../assets/3d --size 96

## New friends (October 2026)

Inky and Chroma (the two Legendaries) are 3D: Meshy image-to-3D of their Gemini sprites
(`assets/pet_inky.png`, `pet_chroma.png`), static, 160 px cells, 60 credits. Shelly, Goldie,
Prickles, Jelly and Echo use their Gemini sprites until the monthly credits reset on 6 November;
then `python3 tools/meshy_test.py pet_<id> --no-rig` and `node tools/render_sheet.mjs
tools/meshy_out/pet_<id> --name <id> --out assets/3d --size 160` for each (about 150 credits).

## Credits

Balance 1030 before, 672 after: 358 Meshy credits. 11 image-to-3D models, 2 rigs
(walk + run free), animations: Idle (0, turns the body, unused), Idle 1 (11, used),
Idle 2 (12, a stretch, unused), Over Shoulder Throw (421). The Kid model dropped the
card from `kid.png`; no model needed regenerating. Source GLBs are in the git-ignored
`defender/tools/meshy_out/`.
