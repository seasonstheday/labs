#!/usr/bin/env python3
"""Generate the drop-in art for Why, Dad? Defender with Gemini's image model (Nano Banana).

    GEMINI_API_KEY=... python3 defender/tools/gen_art.py            # everything that is missing
    GEMINI_API_KEY=... python3 defender/tools/gen_art.py pets       # one group: pets, kid, arenas, maps
    GEMINI_API_KEY=... python3 defender/tools/gen_art.py pet_hopper # one file, regenerated even if it exists
    ... --force                                                     # regenerate the whole group

Output goes to defender/assets/ with the names the game looks for (see ART.md). Sprites are
asked for on a flat white background, then the white is made transparent and the image is
trimmed, so the game can place them by their feet. Needs only python3 and ImageMagick.
Nothing but the prompt and the key leaves this machine. The key goes in the x-goog-api-key header; leave
GEMINI_API_KEY unset when a proxy adds that header for you.
"""
import base64, json, os, subprocess, sys, time, urllib.request

KEY = os.environ.get('GEMINI_API_KEY', '')  # may be empty when a proxy adds the key header itself
MODEL = os.environ.get('GEMINI_IMAGE_MODEL', 'gemini-2.5-flash-image')
HERE = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(HERE, '..', 'assets')
RAW = os.environ.get('GEN_ART_RAW')  # optional directory that keeps the untouched model output

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
    'a sandy beach with gentle waves along the top edge, and a few small shells only in the corners',
    'a desert of smooth pale sand with soft dune ripples, and only a few small plain green cacti (ordinary plants with no eyes, no mouth and no face) and pebbles right at the edges of the picture',
    'pale blue-white snowy arctic ground with soft blue shadows, faint ice cracks and low snow drifts along the edges, and only a tiny igloo far off in one top corner',
    'a jungle floor crowded with big leaves and vines around the edge',
    'a night-time lawn under a starry sky, dark blue-green grass with a soft silvery glow in the middle as if lit by moonlight from off the picture (the moon itself is not in the picture), a few tiny stars and fireflies, and only a tiny folded picnic blanket tucked into one bottom corner',
]
MAPS = [
    'a backyard with a red garden shed, a picket fence and flower beds, under a plain blue sky with a few clouds and no sun',
    'a pond with reeds, lily pads and a duck, willow trees behind, under a plain blue sky with no sun',
    'the inside of a cosy library with tall bookshelves and a round red rug',
    'a beach with a small sailing boat and a whale spout out at sea, under a plain blue daytime sky with no sun and no moon',
    'a desert with pyramids, rolling sand dunes and a small palm oasis, under a plain clear blue sky with no sun',
    'a snowy arctic landscape with an igloo, a snowman and ice floes, under a plain pale sky with no sun or moon',
    'a dense green jungle with a monkey in a tree and a parrot',
    'a starry night sky over a dark lawn with a telescope and a crescent moon',
]

def call(prompt, aspect='1:1'):
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
    body = json.dumps({'contents': [{'parts': [{'text': prompt}]}],
                       'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': aspect}}}).encode()
    headers = {'Content-Type': 'application/json'}
    if KEY: headers['x-goog-api-key'] = KEY
    req = urllib.request.Request(url, data=body, headers=headers)
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
    # white background -> transparent (flood fill from the edges, so white eyes, bellies and cards stay white),
    # trim to the drawing, pad to a square with the feet at the bottom
    subprocess.run(['convert', path, '-alpha', 'set', '-bordercolor', 'white', '-border', '1', '-fuzz', '6%', '-fill', 'none',
                    '-draw', 'matte 0,0 floodfill', '-shave', '1x1', '-trim', '+repage',
                    '-resize', f'{size}x{size}', '-background', 'none', '-gravity', 'south', '-extent', f'{size}x{size}', path], check=True)

def make(name, prompt, kind):
    out = os.path.join(ASSETS, name + '.png'); print(name, '...', flush=True)
    png = call(prompt, {'arena': '9:16', 'map': '21:9'}.get(kind, '1:1')); tmp = out + '.tmp.png'
    with open(tmp, 'wb') as f: f.write(png)
    if RAW: open(os.path.join(RAW, name + '.png'), 'wb').write(png)  # keep the model's output for re-processing
    if kind == 'pet': sprite_fix(tmp, 400)
    elif kind == 'kid': sprite_fix(tmp, 800)
    elif kind == 'arena': subprocess.run(['convert', tmp, '-resize', '480x800^', '-gravity', 'center', '-extent', '480x800', tmp], check=True)
    elif kind == 'map': subprocess.run(['convert', tmp, '-resize', '928x422^', '-gravity', 'center', '-extent', '880x400', tmp], check=True)  # a little overscan trims any margin the model paints
    os.replace(tmp, out); print('  ->', os.path.relpath(out))

def jobs():
    for pid, d in PETS.items(): yield 'pet_' + pid, STYLE + ' ' + d + '.' + SPRITE, 'pet', 'pets'
    yield 'kid', STYLE + ' ' + KID + '.' + SPRITE.replace('facing to the right', 'facing the viewer'), 'kid', 'kid'
    for i, d in enumerate(ARENAS): yield f'arena_{i + 1}', f'Top-down view, straight down, of {d}. Soft even daylight, {STYLE} It is an empty stage waiting for the characters to be added later: plain scenery only, every flower, shell and object is ordinary and has no eyes or mouth. Keep the middle of the picture empty and simple. The scenery runs off all four edges.', 'arena', 'arenas'
    for i, d in enumerate(MAPS): yield f'map_{i + 1}', f'A wide hand-painted children\'s storybook landscape strip of {d}, side view, left to right. {STYLE} It is an empty stage waiting for the characters to be added later: plain scenery only, and the sun, moon, trees, plants and buildings are ordinary and have no eyes or mouths. The scenery runs off all four edges of the image like a crop from a bigger painting, with no border or frame line around it.', 'map', 'maps'

if __name__ == '__main__':
    if not KEY: print('GEMINI_API_KEY is not set; relying on the network to add it (a proxy secret), otherwise requests will fail with 401')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
    os.makedirs(ASSETS, exist_ok=True); n = 0
    for name, prompt, kind, group in jobs():
        want = not args or name in args or group in args
        if not want: continue
        exists = os.path.exists(os.path.join(ASSETS, name + '.png'))
        if exists and not force and name not in args: print(name, 'exists, skipping'); continue
        make(name, prompt, kind); n += 1
    print(f'done, {n} image(s). Open defender/index.html?debug and check the Party screen, an arena and the map.')
