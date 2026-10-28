#!/usr/bin/env python3
"""Skill icons: a small painted tile for every ability, in the game's picture-book style, showing the friend who owns it
doing the move (the friend's own art goes along as a reference).

    python3 defender/tools/gen_icons.py                 # every skill in tools/icons.json that has no icon yet
    python3 defender/tools/gen_icons.py web zap --force # these, even if they exist

tools/icons.json is the skill list (id, name, desc, who, whoDesc), dumped from the game's ABIL and CHARS.
Writes defender/assets/icons/<id>.png, 192 px square with transparent corners. The game shows these wherever it used
the skill's emoji, and keeps the emoji if a file is missing.
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import gen_art as G
ASSETS = os.path.join(HERE, '..', 'assets'); OUT = os.path.join(ASSETS, 'icons'); os.makedirs(OUT, exist_ok=True)
SKILLS = {s['id']: s for s in json.load(open(os.path.join(HERE, 'icons.json')))}
REF = {'Dad': 'mascot_wave.png'}  # everyone else: pet_<lowercase name>.png
TINTS = ['sky-blue', 'mint-green', 'butter-yellow', 'peach', 'lavender', 'pale pink', 'sea-green', 'warm cream']
MYTH = ('If the move shows its targets, they are the game\'s myths: loose cream paper book pages with a few printed lines and a cheeky cartoon face, '
        'never animals, monsters or people. ')

def ref_for(s):
    src = REF.get(s['who']) or f"pet_{s['who'].lower()}.png"; p = os.path.join(ASSETS, src)
    if not os.path.exists(p): return []
    flat = os.path.join('/tmp', 'ref_icon_' + os.path.basename(src))
    if not os.path.exists(flat): subprocess.run(['convert', p, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', flat], check=True)
    return [flat]

def make(sid):
    s = SKILLS[sid]; out = os.path.join(OUT, sid + '.png'); refs = ref_for(s)
    who = f"{s['who']} ({'the character in the reference picture, drawn exactly like it' if refs else s['whoDesc']})" if s['who'] else 'a friendly backyard creature'
    tint = TINTS[sum(map(ord, s['who'] or s['id'])) % len(TINTS)]  # one colour per friend, so a friend's icons go together
    prompt = (G.STYLE + f" A square game skill icon for a children's game: a rounded-square tile with a soft {tint} background and a thick dark-brown border, "
              f"showing {who} using the move \"{s['name']}\": {s['desc']} One clear, bold, simple picture that reads at a tiny size: at most the character "
              "and one or two simple objects or effects, big shapes, centred, filling the tile. " + MYTH +
              "No text, no letters, no numbers. The tile sits on a plain pure white background.")
    try:
        png = G.call(prompt, '1:1', refs=refs); tmp = out + '.tmp.png'; open(tmp, 'wb').write(png)
        subprocess.run(['convert', tmp, '-alpha', 'set', '-bordercolor', 'white', '-border', '1', '-fuzz', '8%', '-fill', 'none', '-draw', 'matte 0,0 floodfill',
                        '-shave', '1x1', '-trim', '+repage', '-resize', '192x192', '-background', 'none', '-gravity', 'center', '-extent', '192x192', out], check=True)
        os.remove(tmp); print('ok', sid, flush=True)
    except Exception as e: print('FAILED', sid, e, flush=True)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
    todo = [k for k in (args or SKILLS) if force or not os.path.exists(os.path.join(OUT, k + '.png'))]
    print(len(todo), 'icons to draw', flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(make, todo))
