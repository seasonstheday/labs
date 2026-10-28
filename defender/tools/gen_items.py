#!/usr/bin/env python3
"""Item pictures: every armor piece, book, weapon (Dad's lenses and each friend's line) and named Legendary, drawn as one
object in the game's picture-book style, on a transparent background so the Bag's rarity frames show around it.

    python3 defender/tools/gen_items.py                    # every item in tools/items.json without a picture yet
    python3 defender/tools/gen_items.py w_dad_glass --force

tools/items.json is the list (id, kind, name, desc, owner, line), dumped from the game's ITEMS, LEGENDS, WEAPONS and CWEAP.
Writes defender/assets/items/<id>.webp (192 px; the .png master stays out of git). The game shows it wherever it showed
the item's emoji, and keeps the emoji if a picture is missing.
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import gen_art as G
OUT = os.path.join(HERE, '..', 'assets', 'items'); os.makedirs(OUT, exist_ok=True)
ITEMS = {s['id']: s for s in json.load(open(os.path.join(HERE, 'items.json')))}
# the game's style without the "big friendly eyes" part: items are objects, and in this game only the myths have faces
ISTYLE = ("Children's picture-book cartoon, clean thick dark-brown outlines, flat cheerful colours with one soft shadow and one highlight. "
          "The object has no face, no eyes and no mouth. No text, no writing, no letters anywhere, not even on book covers or pages. No watermark.")
OWNER = {'dad': 'Dad, whose weapons are magnifying-glass lenses that shoot sunlight'}

def make(iid):
    s = ITEMS[iid]; out = os.path.join(OUT, iid + '.png')
    what = {'armor': 'something to wear', 'book': 'a book or something to read', 'weapon': 'a weapon', 'shop': 'something for sale in the game\'s shop'}[s['kind']]
    if s.get('owner') and s['owner'] != 'dad': what = f"one of {s['owner'].capitalize()}'s {s.get('line', 'weapons').lower()} (a little animal friend's own weapon)"
    elif s.get('owner') == 'dad': what = 'one of ' + OWNER['dad']
    extra = ' It is a famous one-of-a-kind treasure, so make it a little grand and golden.' if s.get('legend') else ''
    prompt = (ISTYLE + f" A single game item icon for a children's game: \"{s['name']}\", {what}. {s['desc']}{extra} "
              "Draw just that one object, big, centred and filling the picture, seen at a slight three-quarter angle, with a soft highlight. "
              "No character, no hands, no frame, no shadow on the ground. On a plain pure white background, nothing else in the picture.")
    try:
        png = G.call(prompt, '1:1'); tmp = out + '.tmp.png'; open(tmp, 'wb').write(png)
        subprocess.run(['convert', tmp, '-alpha', 'set', '-bordercolor', 'white', '-border', '1', '-fuzz', '6%', '-fill', 'none', '-draw', 'matte 0,0 floodfill',
                        '-shave', '1x1', '-trim', '+repage', '-resize', '176x176', '-background', 'none', '-gravity', 'center', '-extent', '192x192', out], check=True)
        subprocess.run(['convert', out, '-quality', '85', out[:-4] + '.webp'], check=True)
        os.remove(tmp); print('ok', iid, flush=True)
    except Exception as e: print('FAILED', iid, e, flush=True)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
    todo = [k for k in (args or ITEMS) if force or not os.path.exists(os.path.join(OUT, k + '.webp'))]
    print(len(todo), 'items to draw', flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(make, todo))
