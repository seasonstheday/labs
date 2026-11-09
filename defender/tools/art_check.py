#!/usr/bin/env python3
"""Art check: do the characters read against every arena?

  python3 defender/tools/art_check.py [--out DIR]

Writes to DIR (default: the current folder):
  arenas_sheet.png        every arena, as a contact sheet
  arenas_sheet_grey.png   the same in greyscale (the squint test)
  art_check.json          brightness, contrast and saturation per arena and per character

and prints a table. An arena is flagged when its play area (the centre 60%) is within NEAR points of
Dad's brightness on a 0-255 scale: a character that bright on a ground that bright reads only by its outline.
It is also flagged when the floor is more saturated than Dad (the floor should never be the loudest thing).
Needs Pillow. The weekly review (reports/Weekly review.md) runs this and compares with last week's numbers.
"""
import colorsys, glob, json, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, '..', 'assets')
NEAR = 30
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else '.'


def stats(im, box=None):
    """mean brightness, its spread, and mean saturation of the opaque pixels"""
    im = im.convert('RGBA')
    if box:
        im = im.crop(box)
    im = im.resize((96, max(1, int(96 * im.height / im.width))))
    lum, sat = [], []
    for r, g, b, a in im.get_flattened_data() if hasattr(im, 'get_flattened_data') else im.getdata():
        if a < 128:
            continue
        lum.append(.2126 * r + .7152 * g + .0722 * b)
        sat.append(colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)[1])
    n = len(lum) or 1
    m = sum(lum) / n
    return {'lum': round(m), 'spread': round((sum((x - m) ** 2 for x in lum) / n) ** .5), 'sat': round(sum(sat) / n, 2)}


def main():
    os.makedirs(OUT, exist_ok=True)
    dad = stats(Image.open(os.path.join(ASSETS, 'bdad_idle.webp')))
    cast = {'dad': dad}
    for f in sorted(glob.glob(os.path.join(ASSETS, 'pet_*.webp'))):
        name = os.path.basename(f)[4:-5]
        if '_' not in name:
            cast[name] = stats(Image.open(f))
    arenas, tiles = [], []
    files = sorted(glob.glob(os.path.join(ASSETS, 'arena_*.webp')), key=lambda f: int(os.path.basename(f)[6:-5]))
    for f in files:
        im = Image.open(f)
        w, h = im.size
        play = stats(im, (int(w * .2), int(h * .25), int(w * .8), int(h * .75)))
        flags = []
        if abs(play['lum'] - dad['lum']) <= NEAR:
            flags.append('near Dad')
        if play['sat'] > dad['sat']:
            flags.append('loud floor')
        if w < 900:
            flags.append('low-res')
        arenas.append({'file': os.path.basename(f), 'size': [w, h], 'play': play, 'flags': flags})
        tiles.append(im.convert('RGB').resize((220, int(220 * h / w))))
    cols, tw, th = 4, 224, max(t.height for t in tiles) + 4
    sheet = Image.new('RGB', (cols * tw, -(-len(tiles) // cols) * th), '#222')
    for k, t in enumerate(tiles):
        sheet.paste(t, ((k % cols) * tw + 2, (k // cols) * th + 2))
    sheet.save(os.path.join(OUT, 'arenas_sheet.png'))
    sheet.convert('L').save(os.path.join(OUT, 'arenas_sheet_grey.png'))
    json.dump({'dad': dad, 'cast': cast, 'arenas': arenas}, open(os.path.join(OUT, 'art_check.json'), 'w'), indent=1)
    print(f"Dad: brightness {dad['lum']}, saturation {dad['sat']}")
    print(f"{'arena':<16}{'size':<11}{'bright':>7}{'spread':>7}{'sat':>6}  flags")
    for a in arenas:
        p = a['play']
        print(f"{a['file']:<16}{'x'.join(map(str, a['size'])):<11}{p['lum']:>7}{p['spread']:>7}{p['sat']:>6}  {', '.join(a['flags'])}")
    near = sum('near Dad' in a['flags'] for a in arenas)
    print(f"{near} of {len(arenas)} arenas are within {NEAR} of Dad's brightness.")


if __name__ == '__main__':
    main()
