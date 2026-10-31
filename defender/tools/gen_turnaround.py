#!/usr/bin/env python3
"""Character turnarounds for 3D modelling: one sheet with front, side (profile, facing right) and back views, drawn by the
image model from the character's existing art, then split into three clean views on transparent backgrounds.

    python3 defender/tools/gen_turnaround.py dad kid pet_webster   # any names in CAST below
    python3 defender/tools/gen_turnaround.py --split dad           # only re-split an existing sheet

Writes defender/assets/models/turnarounds/<name>_sheet.png and <name>_{front,side,back}.png. These are what Meshy's
multi-image-to-3D gets (see reports/Going 3D.md), and what render_sheet.mjs --paint can project onto a model.
"""
import os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import gen_art as G
ASSETS = os.path.join(HERE, '..', 'assets'); OUT = os.path.join(ASSETS, 'models', 'turnarounds')

POSE_HUMAN = 'Standing straight in a relaxed A-pose, arms slightly away from the body, empty hands, neutral friendly face.'
CAST = {  # name: (reference art in assets/, description, pose)
    'dad': ('mascot_wave.png', 'the man in the reference picture, drawn exactly like him (short brown hair, short brown beard, round glasses, mustard-yellow sweater over a white collar, green trousers, brown shoes)', POSE_HUMAN + ' No magnifying glass.'),
    'kid': ('kid.png', 'the child in the reference picture, drawn exactly like them (short brown hair, blue striped t-shirt, green shorts, red sneakers)', POSE_HUMAN + ' No card in their hands.'),
    'pet_webster': ('pet_webster.png', 'the small friendly brown garden spider in the reference picture, drawn exactly like it (eight legs, big friendly eyes, the same colours)', 'Standing on all eight legs, legs spread evenly.'),
    'pet_sparky': ('pet_sparky.png', 'the firefly in the reference picture, drawn exactly like it (round glowing yellow tail, striped brown body, big eyes, little clear wings)', 'Hovering level, wings spread.'),
    'pet_hopper': ('pet_hopper.png', 'the squat green toad in the reference picture, drawn exactly like it (pale belly, bumpy spotted back, cheeky grin)', 'Sitting, all four feet on the ground.'),
}

# any other friend: their own art and the one-line description from tools/icons.json
def cast(name):
    if name in CAST: return CAST[name]
    import json; who = name[4:].capitalize(); d = {x['who']: x.get('whoDesc', '') for x in json.load(open(os.path.join(HERE, 'icons.json')))}
    return (name + '.png', f'the little animal friend in the reference picture, {who}, drawn exactly like it (same shape, colours, markings and face). {d.get(who, "")}',
            'In a calm neutral pose: standing on all its feet if it walks, hovering level if it flies, resting upright if it swims; limbs and wings spread a little so none overlap the body.')

def sheet(name):
    ref_src, desc, pose = cast(name); os.makedirs(OUT, exist_ok=True)
    ref = os.path.join('/tmp', 'ref_turn_' + name + '.png')
    subprocess.run(['convert', os.path.join(ASSETS, ref_src), '-background', 'white', '-alpha', 'remove', '-alpha', 'off', ref], check=True)
    prompt = (G.STYLE + f' A character turnaround sheet of {desc}: three full-body views side by side in one row, evenly spaced, the same size and height: '
              'on the LEFT seen straight from the FRONT, in the MIDDLE seen exactly from its RIGHT SIDE in a flat profile facing right (only one eye visible), '
              f'on the RIGHT seen straight from BEHIND. {pose} Flat even lighting, plain pure white background, no text, no labels, no floor shadows.')
    out = os.path.join(OUT, name + '_sheet.png'); open(out, 'wb').write(G.call(prompt, '16:9', refs=[ref])); print(name, 'sheet ->', os.path.relpath(out))

def split(name):
    src = os.path.join(OUT, name + '_sheet.png')
    w, h = map(int, subprocess.run(['identify', '-format', '%w %h', src], capture_output=True, text=True, check=True).stdout.split())
    for i, view in enumerate(['front', 'side', 'back']):
        out = os.path.join(OUT, f'{name}_{view}.png')
        subprocess.run(['convert', src, '-crop', f'{w // 3}x{h}+{i * w // 3}+0', '+repage', out], check=True)
        G.sprite_fix(out, 768)  # white -> transparent from the edges, trimmed, feet at the bottom
        print(' ', view, '->', os.path.relpath(out))

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')] or list(CAST)
    for n in args:
        if '--split' not in sys.argv: sheet(n)
        split(n)
