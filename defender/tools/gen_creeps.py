#!/usr/bin/env python3
"""Concept images for the 3D creeps and bosses (Gemini), ready for Meshy image-to-3D.

    python3 defender/tools/gen_creeps.py            # everything that is missing
    python3 defender/tools/gen_creeps.py tank boss_wall   # just these (regenerated)

Output: defender/tools/concepts/creep_<kind>.png and boss_<id>.png (white background removed, trimmed, square).
Creeps are asked for in a neutral grey-beige so the game can tint each myth its own colour. Uses gen_art.py's
Gemini call (GEMINI_API_KEY, or a proxy that adds the key header).
"""
import os, sys
from gen_art import call, sprite_fix, STYLE

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'concepts'); os.makedirs(OUT, exist_ok=True)
VIEW = (" Single character, full body, centred, three-quarter front view turned slightly to the viewer's right, standing on an "
        "invisible floor, on a plain pure white background, nothing else in the picture. The character reads as a solid toy "
        "figure with simple rounded volumes, no thin floating parts, and no text or letters anywhere on it.")
NEUTRAL = " Its main body is a plain medium grey-beige with no pattern, so it can be recoloured later."
CREEPS = {
    'normal':    'a grumpy walking library book, a plain hard cover with a slightly darker spine, standing upright on two short stubby legs with little round shoes, two cross-looking eyes near the top of the cover' + NEUTRAL,
    'fast':      'a round scurrying beetle with six short legs and two antennae, whose back shell is a small closed book with a spine down the middle, beady eyes at the front' + NEUTRAL,
    'tank':      'an overstuffed school backpack with two shoulder straps and a zipped front pocket, standing on two short stubby legs, grumpy half-closed eyes on the front' + NEUTRAL,
    'splitter':  'a thick square pad of sticky notes standing on two short stubby legs, the top sheet peeling up at one corner, grumpy eyes on the front' + NEUTRAL,
    'dasher':    'a thin paperback book leaning forward in a sprinter\'s crouch, two short stubby legs, narrow determined eyes on the cover' + NEUTRAL,
    'hardcover': 'a thick armoured hardcover book with riveted metal corner guards and a metal clasp, standing on two short stubby legs, scowling eyes on the cover' + NEUTRAL,
    'flyer':     'a single sheet of paper with small round bat wings spread out, hovering just above the floor, grumpy eyes drawn on the page, faint ruled lines' + NEUTRAL,
    'rumour':    'a slightly see-through ghostly book with soft wispy edges and a big question mark on its cover, hovering, sly half-closed eyes, pale and faded' + NEUTRAL,
    'healer':    'a fat round thesaurus book with a sticking plaster on its cover and a little white nurse cap on top, standing on two short stubby legs, kind sleepy eyes',
    'gossip':    'a square yellow sticky note with a big open chattering mouth and wide excited eyes, standing on two short stubby legs, one hand cupped beside its mouth',
    'swarm':     'a small torn scrap of paper with two tiny angry eyes and two little legs, leaning forward' + NEUTRAL,
}
BOSSES = {
    'wall':     'a huge ancient tome standing upright, its front cover built of red bricks with pale mortar, a small golden crown on top',
    'spiders':  'a huge ancient brown tome standing upright with eight hairy spider legs sticking out of its sides and a small spider on its cover, a small golden crown on top',
    'brain':    'a huge ancient blue tome standing upright with a big pink wrinkly brain sitting on top of it, a small golden crown on the brain',
    'bolt':     'a huge ancient dark-grey tome standing upright with a fluffy grey storm cloud on top and a yellow lightning bolt coming out of the cloud, a small golden crown',
    'boil':     'a big round cooking pot with a plain blank book cover for a lid, a happy green frog relaxing inside with its arms on the rim, wisps of steam, a small golden crown on the frog',
    'triangle': 'a huge ancient sea-blue tome shaped like a triangle standing on its base, a little sailing ship drawn on its cover, a small golden crown on the top point',
    'hot':      'a huge ancient orange tome standing upright with a blazing yellow sun on its cover and short sun rays sticking out around its edges, a small golden crown on top',
    'penguin':  'a huge ancient black tome standing upright with a white penguin belly on its front, an orange beak and two small flippers, a small golden crown on top',
    'flat':     'a huge thick flat disc shaped like a flat earth, blue ocean on top with green continents, standing on a short stand so it is tilted toward the viewer, a small golden crown on the rim',
}
def jobs():
    for k, d in CREEPS.items(): yield 'creep_' + k, STYLE + ' ' + d + '.' + VIEW
    for k, d in BOSSES.items(): yield 'boss_' + k, STYLE + ' ' + d + ' It looks grand and a little pompous, with big eyes on its front.' + VIEW
want = set(sys.argv[1:])
for name, prompt in jobs():
    short = name.split('_', 1)[1]
    out = os.path.join(OUT, name + '.png')
    if want and short not in want and name not in want: continue
    if not want and os.path.exists(out): continue
    print(name, '...', flush=True); png = call(prompt); tmp = out + '.tmp.png'
    open(tmp, 'wb').write(png); sprite_fix(tmp, 512); os.replace(tmp, out); print('  ->', os.path.relpath(out))
