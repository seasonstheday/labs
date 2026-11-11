#!/usr/bin/env python3
"""Repaint the home-screen backdrops and the World Map bands in the style of the tilted arenas.

  python3 defender/tools/gen_scenes_persp.py home all --tries 1 --out DIR      (or: map all, home 3,7)
  python3 defender/tools/gen_scenes_persp.py home 3 --install DIR/home_3_p1.png

Each picture is repainted over the one the game already uses, so its layout stays where the code expects it
(the home screen's open patch where Dad and his friends stand; a map band's ground where the stage pins sit),
and it takes the landmarks and colour family of that world's arena (PLACES in gen_arena_persp.py), so the home
screen, the map and the level are plainly the same place. Home backdrops are saved at 960 x 1600, bands at 1760 x 800.
"""
import os, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art as G
from gen_arena_persp import PLACES

RULES = ('No characters, no people, no animals, no creatures, no faces: every object is ordinary and has no eyes or mouth. No text, no letters, no numbers. '
         'One calm colour family, muted rather than loud, with soft shading and gentle light.')


def src(kind, n): return os.path.join(G.ASSETS, ('home_bg' + ('' if n == 1 else f'_{n}') if kind == 'home' else f'map_{n}') + '.png')


def prompt(kind, n):
    place, far, sides, stage, family = PLACES[n]
    if kind == 'home':
        return ('This picture is the backdrop of a game\'s home screen. Repaint it as a finished, richly detailed illustration, keeping its camera, its composition and where everything is: '
                'calm sky or upper wall in the top third, scenery framing the left and right edges, and open ground in the lower half with an empty, lighter patch in the centre where characters will stand. '
                f'Make it plainly the same place as this game level: {place}. In the background, behind the open ground: {far}. Framing the edges: {sides}. '
                f'The patch where the characters stand: {stage}. Colour family: {family}. {RULES} {G.STYLE} '
                'Add charming small details at the edges and in the background, but keep the centre patch and the ground around it clear and simple.')
    return ('This picture is one band of a game\'s world map: a wide landscape strip. Repaint it as a finished, richly detailed illustration, keeping its camera, its composition and where everything is, '
            'especially the open ground along the lower part, where the map\'s stage markers are placed. '
            f'Make it plainly the same place as this game level: {place}. Feature, in the background: {far}. Scattered at the sides: {sides}. Colour family: {family}. {RULES} {G.STYLE} '
            'The scenery runs off the left and right edges. Keep the lower ground clear and simple.')


def paint(job):
    kind, n, k, out = job
    try: png = G.call(prompt(kind, n), '9:16' if kind == 'home' else '21:9', refs=[src(kind, n)])
    except Exception as e: return f'{kind} {n} try {k}: FAILED {str(e)[:120]}'
    f = os.path.join(out, f'{kind}_{n}_p{k}.png'); open(f, 'wb').write(png); return 'wrote ' + f


def install(kind, n, path):
    from PIL import Image
    im = Image.open(path).convert('RGB'); w, h = im.size
    if kind == 'home': ch = round(w / .6); t = max(0, (h - ch) // 2); im = im.crop((0, t, w, t + ch)).resize((960, 1600), Image.LANCZOS)
    else: cw = round(h * 2.2); l = max(0, (w - cw) // 2); im = im.crop((l, 0, l + cw, h)).resize((1760, 800), Image.LANCZOS)
    name = ('home_bg' + ('' if n == 1 else f'_{n}')) if kind == 'home' else f'map_{n}'
    im.save(os.path.join(G.ASSETS, name + '.webp'), quality=86, method=6); print(f'installed assets/{name}.webp')


def main():
    a = sys.argv[1:]; kind = a[0]
    if '--install' in a: return install(kind, int(a[1]), a[a.index('--install') + 1])
    which = list(PLACES) if a[1] == 'all' else [int(x) for x in a[1].split(',')]
    tries = int(a[a.index('--tries') + 1]) if '--tries' in a else 1
    out = a[a.index('--out') + 1] if '--out' in a else '.'
    os.makedirs(out, exist_ok=True)
    jobs = [(kind, n, k + 1, out) for n in which for k in range(tries) if not os.path.exists(os.path.join(out, f'{kind}_{n}_p{k + 1}.png'))]
    with ThreadPoolExecutor(4) as ex:
        for r in ex.map(paint, jobs): print(r, flush=True)


if __name__ == '__main__':
    main()
