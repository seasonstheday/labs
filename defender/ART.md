# Why, Dad? Defender — art drop-in guide

The game draws every friend, the Kid, the eight arenas and the eight map bands with code,
so it always works. Drop a PNG into `defender/assets/` with the right name and the game
uses it instead, no code change. Missing files are fine; the game falls back to the
drawn version.

## File names

| File | What it replaces | Size | Notes |
|---|---|---|---|
| `pet_webster.png` … `pet_luna.png` | a friend's sprite | about 400 × 400, transparent | facing **right**, feet touching the bottom edge, centred. Ids: webster, sparky, hopper, puddles, dusty, pip, scuttle, nilla, luna |
| `kid.png` | the Kid | about 400 × 800, transparent | standing, facing the viewer, feet at the bottom edge |
| `arena_1.png` … `arena_8.png` | a chapter's battle floor | 480 × 800 | top-down, soft lighting; keep the middle 300 px clear for Dad and friends. Chapter order: Backyard, Pond, Library, Ocean, Desert, Arctic, Jungle, Night Sky |
| `map_1.png` … `map_8.png` | a chapter's strip on the scrolling map | 880 × 400 | landscape, side view, left to right; pins and labels are drawn on top so keep it uncluttered |

Equipped hats, vests, glasses and watches are drawn on top of sprites using anchor points
in `WEAR_PET` (head, chest, foot, hand). If a PNG's head is somewhere else, adjust that one
line. The Kid's "?" is drawn onto the blank card in `kid.png` at `KID_CARD` (x and y from the
feet, in units of the Kid's height); move it if a new Kid holds the card somewhere else.

## Generating with the script

`python3 defender/tools/gen_art.py` makes every missing file with the Gemini image model
(see the docstring for the key and the one-file / one-group forms). It asks for 9:16 arenas
and 21:9 map strips so the model does not paint a framed card inside a square, and it clears
sprite backgrounds with a flood fill from the edges so white eyes, bellies and the card stay
opaque. The model likes to put faces on suns, flowers and shells; the prompts ask for an
"empty stage" instead, and a file that still comes back with faces is worth one more try.

## Style

Match the mascot PNGs in `assets/`: clean cartoon, thick dark-brown outline (#3a2c20),
flat colours with one soft shadow and one highlight, big friendly eyes with a catchlight,
no gradients heavier than a gentle one, no text, no background.

## Prompts (Nano Banana / Gemini image, or any image model)

Paste the style line first, then the subject.

**Style line:** "Children's picture-book cartoon, clean thick dark-brown outlines,
flat cheerful colours with one soft shadow, big friendly eyes with a white catchlight,
isolated on a transparent background, no text, in the style of a modern preschool TV
show mascot."

- Webster: "a small friendly brown garden spider, eight legs, slightly cross-eyed, facing right, standing"
- Sparky: "a firefly with a round glowing yellow tail, striped brown body, big eyes, little wings, facing right, hovering"
- Hopper: "a squat green toad with a pale belly and bumpy back, cheeky grin, facing right"
- Puddles: "a plump white duck with an orange bill and feet, pleased with itself, facing right"
- Dusty: "a green bookworm wearing round reading glasses, curled over a small red book, facing right"
- Pip: "a small orange hermit crab in a spiral shell, eyes on stalks, one claw raised, facing right"
- Scuttle: "a round dark-blue scarab beetle with long antennae, six little legs, facing right"
- Nilla: "a fluffy white snowy owl with big yellow eyes and faint grey speckles, facing right"
- Luna: "a pale green luna moth seen from above, long wing tails, feathery antennae, hovering"
- The Kid: "a seven-year-old child with short brown hair, a blue striped t-shirt, green shorts and red sneakers, standing, holding up a white question card, facing the viewer"

Arenas (top-down): "top-down view of a [backyard lawn with a picket fence and flower beds /
pond with lily pads around a grassy island / library with wooden floorboards, a round red rug
and bookshelves / sandy beach with waves at the top and shells / desert with dune ripples,
cacti and bleached rocks / snowy arctic ground with blue ice cracks and a small igloo / jungle
floor crowded with big leaves and vines / night-time lawn under stars with a telescope and a
picnic blanket], soft even light, children's cartoon style, no characters, the centre left
empty".

Map bands (side view): "a wide hand-painted children's storybook landscape strip of
[a sunny backyard with a red shed and fence / a pond with reeds, lily pads and a duck /
inside a library with tall shelves and a red rug / a beach with a sailing boat and a whale /
a desert with pyramids and cacti / a snowy arctic with an igloo and a snowman / a dense green
jungle with a monkey and a parrot / a starry night sky over a dark lawn with a telescope],
no text, no characters".

## Blender

For 3D-ish motion later (item 6 on the wishlist): render each friend at 8 facing angles
with a toon shader and freestyle outlines, 400 × 400, transparent, and drop them in as
`pet_<id>_<0..7>.png`. The game does not read those yet; `drawCompanionAt` is where that
would go.
