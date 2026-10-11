#!/usr/bin/env python3
"""Generate the drop-in art for Why, Dad? Defender with Gemini's image model (Nano Banana).

    GEMINI_API_KEY=... python3 defender/tools/gen_art.py            # everything that is missing
    GEMINI_API_KEY=... python3 defender/tools/gen_art.py pets       # one group: pets, kid, arenas, maps
    GEMINI_API_KEY=... python3 defender/tools/gen_art.py pet_hopper # one file, regenerated even if it exists
    ... --force                                                     # regenerate the whole group

Output goes to defender/assets/ with the names the game looks for (see ART.md). Sprites are
asked for on a flat white background, then the white is made transparent and the image is
trimmed, so the game can place them by their feet. Needs only python3 and ImageMagick.
Nothing but the prompt and the key leaves this machine.
"""
import base64, json, os, subprocess, sys, time, urllib.request

KEY = os.environ.get('GEMINI_API_KEY')
MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image')
HERE = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(HERE, '..', 'assets')

STYLE = ("Children's picture-book cartoon, clean thick dark-brown outlines, flat cheerful colours with one soft shadow "
         "and one highlight, big friendly eyes with a white catchlight, in the style of a modern preschool TV show mascot. "
         "No text, no watermark, no signature.")
SPRITE = " Single character, full body, centred, facing to the right, standing on an invisible floor, on a plain pure white background, nothing else in the picture."

PETS = {
    'webster': 'a small friendly brown garden spider with eight legs and a slightly cross-eyed grin',
    'sparky':  'a firefly with a round glowing yellow tail, a striped brown body, big eyes and little clear wings, hovering just above the floor',
    'hopper':  'a squat green toad with a pale belly and a bumpy back and a cheeky grin',
    'puddles': 'a plump white duck with an orange bill and orange feet, very pleased with itself',
    'dusty':   'a green bookworm wearing round reading glasses, curled over a small red book',
    'pip':     'a small orange hermit crab in a spiral shell, eyes on stalks, one claw raised in a wave',
    'scuttle': 'a round dark-blue scarab beetle with long antennae and six little legs',
    'nilla':   'a fluffy white snowy owl with big yellow eyes and faint grey speckles',
    'luna':    'a pale green luna moth seen from above with long wing tails and feathery antennae, hovering',
}
KID = ('a seven-year-old child with short brown hair, a blue striped t-shirt, green shorts and red sneakers, standing and '
       'smiling, holding up a white blank card in one hand, facing the viewer')
ARENAS = [
    'a backyard lawn with a white picket fence around the edge and flower beds',
    'a pond with lily pads and reeds in a ring around a small grassy island',
    'a library with wooden floorboards, a round red rug in the middle and bookshelves around the edge',
    'a sandy beach with gentle waves along the top edge, shells and a sandcastle',
    'a desert with dune ripples, a few cacti and bleached rocks',
    'snowy arctic ground with pale blue ice cracks, snow drifts and a small igloo',
    'a jungle floor crowded with big leaves and vines around the edge',
    'a night-time lawn under a starry sky with a telescope and a picnic blanket',
]
MAPS = [
    'a sunny backyard with a red garden shed, a picket fence and flower beds',
    'a pond with reeds, lily pads and a duck, willow trees behind',
    'the inside of a cosy library with tall bookshelves and a round red rug',
    'a beach with a small sailing boat and a whale spout out at sea',
    'a desert with pyramids, cacti and a big sun',
    'a snowy arctic landscape with an igloo, a snowman and ice floes',
    'a dense green jungle with a monkey in a tree and a parrot',
    'a starry night sky over a dark lawn with a telescope and a crescent moon',
]

def call(prompt):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}'
    body = json.dumps({'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': {'responseModalities': ['IMAGE']}}).encode()
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: data = json.load(r)
            for part in data['candidates'][0]['content']['parts']:
                if 'inlineData' in part: return base64.b64decode(part['inlineData']['data'])
            raise RuntimeError('no image in response: ' + json.dumps(data)[:300])
        except Exception as e:
            if attempt == 3: raise
            print('  retry after', e); time.sleep(3 * (attempt + 1))

def sprite_fix(path, size):
    # white background -> transparent, trim to the drawing, pad to a square with the feet at the bottom
    subprocess.run(['convert', path, '-fuzz', '6%', '-transparent', 'white', '-trim', '+repage',
                    '-resize', f'{size}x{size}', '-background', 'none', '-gravity', 'south', '-extent', f'{size}x{size}', path], check=True)

def make(name, prompt, kind):
    out = os.path.join(ASSETS, name + '.png'); print(name, '...', flush=True)
    png = call(prompt); tmp = out + '.tmp.png'
    with open(tmp, 'wb') as f: f.write(png)
    if kind == 'pet': sprite_fix(tmp, 400)
    elif kind == 'kid': sprite_fix(tmp, 800)
    elif kind == 'arena': subprocess.run(['convert', tmp, '-resize', '480x800^', '-gravity', 'center', '-extent', '480x800', tmp], check=True)
    elif kind == 'map': subprocess.run(['convert', tmp, '-resize', '880x400^', '-gravity', 'center', '-extent', '880x400', tmp], check=True)
    os.replace(tmp, out); print('  ->', os.path.relpath(out))

def jobs():
    for pid, d in PETS.items(): yield 'pet_' + pid, STYLE + ' ' + d + '.' + SPRITE, 'pet', 'pets'
    yield 'kid', STYLE + ' ' + KID + '.' + SPRITE.replace('facing to the right', 'facing the viewer'), 'kid', 'kid'
    for i, d in enumerate(ARENAS): yield f'arena_{i + 1}', f'Top-down view, straight down, of {d}. Soft even daylight, {STYLE} No characters. Keep the middle of the picture empty and simple. Portrait orientation, 3:5.', 'arena', 'arenas'
    for i, d in enumerate(MAPS): yield f'map_{i + 1}', f'A wide hand-painted children\'s storybook landscape strip of {d}, side view, left to right. {STYLE} No characters. Landscape orientation, wider than it is tall, about 11:5.', 'map', 'maps'

if __name__ == '__main__':
    if not KEY: sys.exit('GEMINI_API_KEY is not set')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
    os.makedirs(ASSETS, exist_ok=True); n = 0
    for name, prompt, kind, group in jobs():
        want = not args or name in args or group in args
        if not want: continue
        exists = os.path.exists(os.path.join(ASSETS, name + '.png'))
        if exists and not force and name not in args: print(name, 'exists, skipping'); continue
        make(name, prompt, kind); n += 1
    print(f'done, {n} image(s). Open defender/index.html?debug and check the Party screen, an arena and the map.')
