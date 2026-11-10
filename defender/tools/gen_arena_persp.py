#!/usr/bin/env python3
"""Paint the tilted-camera arenas: one colour family, a quiet stage in the middle, scenery with height at the edges.

  python3 defender/tools/gen_arena_persp.py 3            one arena (1-16), 2 tries
  python3 defender/tools/gen_arena_persp.py all --tries 2 --out DIR
  python3 defender/tools/gen_arena_persp.py 3 --install DIR/arena_3_p2.png     crop to 3:5 and save assets/arena_3p.webp

Each arena is painted over its layout sketch (make_arena_persp.py): that is what holds the camera. Asked in words
alone, or shown a style picture, the image model turned the scene to a corner view. Writes DIR/arena_N_p<try>.png.
The game adds the moving parts on top: see AMBIENT in index.html. The key comes from GEMINI_API_KEY, or a proxy.
"""
import os, sys, io
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art as G
from make_arena_persp import layout

STAGE = ('The middle of the ground is a wide, empty, simple round stage, lit by a soft pool of light and a little paler than the rest; '
         'the edges and corners of the picture are darker and richer. Nothing stands in the middle. '
         'Keep the whole place in one colour family so that characters added later will stand out: muted and calm, never loud. '
         'No characters, no people, no animals, no creatures, no faces: every object is ordinary and has no eyes or mouth. No text, no letters, no numbers.')
# per arena: the place, what runs straight across the top (with one feature in the middle), what stands at the left and right edges,
# the round stage in the middle, and the colour family
PLACES = {
    1: ('a sunny backyard lawn', 'a white picket fence with a wooden garden gate in the middle, flower beds in front of it and treetops behind',
        'flower beds, a watering can, a wheelbarrow, a bird bath, bushes', 'a round patch of paler, mown grass', 'soft greens with cream and a little pink'),
    2: ('a calm pond', 'the far bank: tall reeds and cattails with a little wooden jetty in the middle',
        'reeds, lily pads with pink flowers, mossy stones, a half-sunk log', 'a round grassy island in the middle of the water, with clear water all around it', 'soft blue-greens'),
    3: ('a cosy old library at dusk, with warm wooden floorboards', 'the back wall: a stone fireplace with a small fire burning in the middle, a wall lamp each side of it, and tall bookshelves either side',
        'a rolling ladder, a globe on a stand, a reading chair, stacks of books', 'a big round rug in a soft, dusty plum colour with a woven border', 'warm browns, plum and amber'),
    4: ('a sandy beach', 'the sea: gentle waves rolling onto the sand, with a little wooden rowing boat pulled up in the middle',
        'shells, starfish-shaped stones, driftwood, a striped beach umbrella, a bucket and spade, tufts of dune grass', 'a round patch of smooth damp sand, a little darker', 'pale sand and soft sea blue'),
    5: ('a desert of smooth pale sand with soft dune ripples', 'far dunes and red rock cliffs, with a natural rock arch in the middle',
        'tall cacti, round boulders, dry bushes, a sun-bleached log', 'a round patch of flat, paler sand ringed by a few pebbles', 'warm sand, terracotta and dusty rose'),
    6: ('pale blue-white arctic snow with faint ice cracks', 'a wall of blue ice cliffs with a snug igloo in the middle, its doorway glowing warm',
        'snow drifts, ice blocks, a wooden sledge, a pair of skis stuck in the snow, a flag on a pole', 'a round patch of smooth, swept ice', 'icy blues and white with one warm glow'),
    7: ('a jungle clearing with an earthy floor', 'a wall of huge leaves, tree trunks and hanging vines, with an old mossy stone doorway in the middle',
        'giant leaves, ferns, vines, bright flowers, mossy stones, a fallen log', 'a round patch of bare, sunlit earth', 'deep greens with a little gold'),
    8: ('a lawn at night under a starry sky', 'a dark treeline under a deep blue starry sky, with a small camping tent in the middle and a lantern glowing beside it',
        'bushes, a picnic blanket, a telescope on a tripod, a backpack, tall grass', 'a round patch of grass glowing softly silver, as if lit by the moon from out of the picture', 'deep blue-greens with a silver glow and one warm lantern'),
    9: ('a big friendly kitchen with a checked tile floor', 'the back wall: worktops and cupboards, with a stove in the middle and a pot gently steaming on it, a window above',
        'a fridge, a table with a fruit bowl, stools, hanging pans, a potted herb', 'a big round woven rug in a soft mustard colour', 'cream, sage green and mustard'),
    10: ('a farmyard of soft dirt and straw', 'a big red barn with its doors open in the middle, a wooden fence either side',
         'hay bales, a water trough, a wheelbarrow, milk churns, a pitchfork leaning on the fence', 'a round patch of golden straw', 'warm earth browns, straw gold and barn red'),
    11: ('a grand museum hall with a polished stone floor', 'the back wall: a tall stone archway in the middle with a big sunlit window in it, a display case each side',
         'plinths with vases, glass display cases, big potted ferns, a velvet rope on brass posts', 'a big round floor mosaic in soft colours', 'pale stone, soft gold and dusty teal'),
    12: ('a city plaza of pale paving stones', 'a row of friendly shop fronts with striped awnings, and a little clock tower in the middle',
         'benches, old-fashioned lamp posts, flower planters, a bicycle, a post box', 'a big round patterned paving circle', 'warm stone, soft brick and dusty blue'),
    13: ('a school sports field of green grass with white lines', 'the red running track curving across the top, a scoreboard in the middle and small stands behind',
         'cones, hurdles, a rack of balls, a finish-line flag, a water cooler on a bench', 'the white centre circle of the pitch', 'fresh greens with brick red and white'),
    14: ('the flat roof of a weather station, with a tiled deck', 'a railing with wide open sky and big soft clouds beyond, and a little white weather hut in the middle',
         'a spinning-cup wind meter on a pole, a rain gauge, a weather vane, a satellite dish, coiled cables', 'a big painted circle on the deck in soft yellow', 'pale greys, sky blue and soft yellow'),
    15: ('a high alpine meadow with small flowers', 'grey mountain peaks with snow on top, a wooden signpost and a pile of rocks in the middle',
         'pine trees, grey boulders, patches of snow, a wooden bench, alpine flowers', 'a round patch of short, paler grass', 'soft greens, slate grey and white'),
    16: ('the inside of a space station module with a soft grey padded floor', 'the back wall: control panels with little lights, and one big round window in the middle showing stars and the blue Earth',
         'handrails, storage lockers, panels with little lights, floating straps, a potted plant in a holder', 'a big round hatch pattern in the floor', 'soft greys and lilac with small warm lights'),
}


def prompt(n):
    place, far, sides, stage, family = PLACES[n]
    return ('This picture is a plain layout sketch of a game level, seen from a high, straight-on camera. Repaint it as a finished, richly detailed illustration, '
            'keeping its camera, its composition and where everything is, exactly: one band straight across the top with a single feature in its middle, '
            'the ground running straight up the picture toward it and getting narrower, a round stage in the centre of the ground, a thin strip of scenery down the left and right edges. '
            'Do not rotate the scene, do not show a corner, do not add anything along the bottom edge except the ground running off the picture. '
            f'The place: {place}. Across the top: {far}. Down the left and right edges, drawn with height and overlapping the ground a little: {sides}. '
            f'In the centre: {stage}. Colour family: {family}. {STAGE} {G.STYLE} '
            'Make it charming and full of small details at the top and the edges, with soft shading and gentle light, but keep the stage and the ground around it clear, simple and calm.')


def paint(job):
    n, k, out = job
    buf = io.BytesIO(); layout(n).save(buf, 'PNG'); tmp = os.path.join(out, f'_layout_{n}.png'); open(tmp, 'wb').write(buf.getvalue())
    try: png = G.call(prompt(n), '9:16', refs=[tmp])
    except Exception as e: return f'arena {n} try {k}: FAILED {str(e)[:120]}'
    f = os.path.join(out, f'arena_{n}_p{k}.png'); open(f, 'wb').write(png); return 'wrote ' + f


def install(n, src):
    from PIL import Image
    im = Image.open(src).convert('RGB'); w, h = im.size; ch = round(w / .6); t = max(0, (h - ch) // 2)
    im.crop((0, t, w, t + ch)).resize((960, 1600), Image.LANCZOS).save(os.path.join(G.ASSETS, f'arena_{n}p.webp'), quality=88, method=6)
    print(f'installed assets/arena_{n}p.webp from {src}')


def main():
    a = sys.argv[1:]
    if '--install' in a: return install(int(a[0]), a[a.index('--install') + 1])
    which = [n for n in PLACES if n != 3] if a[0] == 'all' else [int(x) for x in a[0].split(',')]
    tries = int(a[a.index('--tries') + 1]) if '--tries' in a else 2
    out = a[a.index('--out') + 1] if '--out' in a else '.'
    os.makedirs(out, exist_ok=True)
    jobs = [(n, k + 1, out) for n in which for k in range(tries) if not os.path.exists(os.path.join(out, f'arena_{n}_p{k + 1}.png'))]
    with ThreadPoolExecutor(4) as ex:
        for r in ex.map(paint, jobs): print(r, flush=True)


if __name__ == '__main__':
    main()
