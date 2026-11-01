#!/usr/bin/env python3
"""Makes WebP copies of new art and rewrites the two file lists at the top of sw.js from what is in assets/.

    python3 defender/tools/sw_list.py

CORE is cached when the worker installs: the page, the home screen, Dad, the starting friends and chapter 1, so the game opens
with no signal after one visit. LATER is everything else the game draws (all the WebP art, the 3D sheets, story pictures, skill
icons, item pictures, head shots, hats); the page asks the worker to fetch it in the background once it has loaded. Voice clips and
music are cached as they play. The PNG masters in assets/ are for the art tools and are never loaded by the game.
"""
import glob, os, re, subprocess
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# first, a WebP beside every PNG the game draws (new or changed art), since the game loads the WebP
for p in glob.glob(os.path.join(D, 'assets', '*.png')) + glob.glob(os.path.join(D, 'assets', '3d', '*.png')):
    if re.search(r'(icon-\d+|apple-touch-icon)\.png$', p): continue
    w = p[:-4] + '.webp'
    if not os.path.exists(w) or os.path.getmtime(p) > os.path.getmtime(w):
        subprocess.run(['convert', p, '-quality', '82', '-define', 'webp:alpha-quality=100', '-define', 'webp:method=6', w], check=True); print('webp', os.path.relpath(w, D))
rel = lambda p: './' + os.path.relpath(p, D).replace(os.sep, '/')
CORE = ['./', './index.html', './book2.js', './manifest.json', './assets/icon-192.png'] + [rel(p) for pat in [
    'assets/mascot_*.webp', 'assets/webster.webp', 'assets/bdad_*.webp', 'assets/home_bg.webp', 'assets/*_face.webp', 'assets/kid.webp',
    'assets/pet_webster.webp', 'assets/pet_sparky.webp', 'assets/pet_hopper.webp', 'assets/arena_1.webp', 'assets/map_1.webp', 'assets/heads/*.webp',
    'assets/3d/kid.json', 'assets/3d/kid_idle.webp', 'assets/3d/props.json', 'assets/3d/props.webp'] for p in sorted(glob.glob(os.path.join(D, pat)))]
seen = set(CORE)
LATER = [rel(p) for pat in ['assets/*.webp', 'assets/*.jpg', 'assets/3d/*.json', 'assets/3d/*.webp', 'assets/icons/*.webp', 'assets/items/*.webp', 'assets/ui/*.webp', 'assets/ui/index.json', 'assets/voice/index.json']
         for p in sorted(glob.glob(os.path.join(D, pat))) if rel(p) not in seen]
fmt = lambda xs: '[\n' + ''.join(f"  '{x}',\n" for x in xs) + ']'
sw = open(os.path.join(D, 'sw.js')).read()
sw = re.sub(r'const CORE = \[.*?\];', 'const CORE = ' + fmt(CORE) + ';', sw, flags=re.S)
sw = re.sub(r'const LATER = \[.*?\];', 'const LATER = ' + fmt(LATER) + ';', sw, flags=re.S)
open(os.path.join(D, 'sw.js'), 'w').write(sw)
print(len(CORE), 'core files,', len(LATER), 'later')
