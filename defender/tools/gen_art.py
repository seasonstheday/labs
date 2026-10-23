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
REFS = []      # --ref a.png,b.png: existing art sent with every prompt, so new pictures match it
SUFFIX = ''    # --suffix _try: write <name>_try.png instead of replacing the real one
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
    'shelly':  'a small friendly pond turtle with a rounded olive-green shell with hexagon plates, a calm smile and sleepy eyes',
    'goldie':  'a round orange goldfish with big shiny eyes and flowing fins, floating inside a small water bubble just above the floor',
    'prickles':'a small round brown hedgehog with soft-looking spines, a pointy pink nose and a cheerful face',
    'jelly':   'a little pink-and-lilac jellyfish with a round glowing bell and short wavy tentacles, floating just above the floor',
    'echo':    'a small fuzzy brown bat with big ears, wings half open and a friendly toothy grin, hovering just above the floor',
    'inky':    'a cheerful purple octopus with big curious eyes, eight curly arms spread on the floor, one arm waving',
    'chroma':  'a small chameleon with a curly tail and big swivelling eyes, its skin shading through rainbow colours from head to tail',
    'bumble':  'a round fuzzy bumblebee with black and yellow stripes, tiny wings and a big happy smile, hovering just above the floor',
    'wiggles': 'a pink earthworm curled into a friendly S shape with a little smile and rosy cheeks',
    'coco':    'a red squirrel with a big fluffy curled tail, holding an acorn in its paws',
    'dot':     'a round red ladybird with black spots, a black head with big friendly eyes and little antennae',
    'rosie':   'a pink flamingo standing on one leg with the other tucked up, a curved black-tipped beak and a proud little smile',
    'gizmo':   'a raccoon with a black eye mask, a ringed bushy tail and clever little hands held together',
    'bramble': 'a small red fox with a white-tipped bushy tail, pointy ears and a sly friendly grin, sitting',
    'pinch':   'a small red lobster with two big claws raised, long feelers and a cheerful face',
    'sol':     'a blue peacock with its tail fanned out wide in a circle of green and blue eye feathers, proud and happy',
    'frost':   'a chubby polar bear cub with thick white fur, a black nose and round ears, sitting',
    'bluey':   'a small round blue whale with a pale belly and a little water spout on top, floating just above the floor',
    'uni':     'a small white unicorn with a golden spiral horn and a pastel rainbow mane and tail, prancing',
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

def call(prompt, aspect='1:1', refs=()):
    # refs: image files sent ahead of the prompt (a layout to paint over, or existing art to match)
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
    parts = [{'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(open(r, 'rb').read()).decode()}} for r in refs]
    body = json.dumps({'contents': [{'parts': parts + [{'text': prompt}]}],
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
    out = os.path.join(ASSETS, name + SUFFIX + '.png'); print(name + SUFFIX, '...', flush=True)
    if REFS: prompt += f' Match the drawing style, outline weight, colours and shading of the reference picture{"s" if len(REFS) > 1 else ""} exactly, as if drawn by the same artist, but draw only the new {"scene" if kind == "arena" else "character"} described.'
    png = call(prompt, {'arena': '9:16', 'map': '21:9', 'story': '4:3'}.get(kind, '1:1'), refs=REFS); tmp = out + '.tmp.png'
    with open(tmp, 'wb') as f: f.write(png)
    if RAW: open(os.path.join(RAW, name + '.png'), 'wb').write(png)  # keep the model's output for re-processing
    if kind == 'pet': sprite_fix(tmp, 400)
    elif kind == 'kid': sprite_fix(tmp, 800)
    elif kind == 'arena': subprocess.run(['convert', tmp, '-resize', '480x800^', '-gravity', 'center', '-extent', '480x800', tmp], check=True)
    elif kind == 'map': subprocess.run(['convert', tmp, '-resize', '928x422^', '-gravity', 'center', '-extent', '880x400', tmp], check=True)  # a little overscan trims any margin the model paints
    if kind == 'story':  # stored as JPEG, 720x540: twenty of these add about 2 MB instead of 15
        jpg = out[:-4] + '.jpg'; subprocess.run(['convert', tmp, '-resize', '720x540^', '-gravity', 'center', '-extent', '720x540', '-quality', '82', jpg], check=True); os.remove(tmp); print('  ->', os.path.relpath(jpg)); return
    os.replace(tmp, out); print('  ->', os.path.relpath(out))

# storyboard scenes for the prologue and each chapter's opening and closing; Dad and the Kid come from the references
CAST = ("Dad is the man in the first reference picture (short brown hair, short brown beard, round glasses, mustard-yellow sweater, green trousers). "
        "The Kid is the child in the second reference picture (short brown hair, blue striped t-shirt, green shorts, red sneakers). Draw them exactly like that. "
        "The myths are loose book pages that have come alive: cream paper pages with a few printed lines, a cheeky cartoon face, tiny arms and legs, mischievous but friendly, never scary. ")
# the villain's scenes need a third reference picture: --ref mascot_wave.png,kid.png,sses_idle.png
VILLAIN = ("Sir Ever-So-Sure is the pompous Title Page in the third reference picture: a tall cream book page with gold edges, a purple squiggle banner, "
           "a gold monocle, a twirly brown moustache, noodle arms with white gloves, brown shoes and a purple quill. Draw him exactly like that: silly and smug, never scary. ")
STORY_V = {
    'story_v0': 'The library at night by moonlight. Sir Ever-So-Sure stands on the reading stand and flings the giant old book wide open with a grand gesture, cackling, quill raised, as glowing page myths whoosh out of it into the air. Dad and the Kid are not in this picture.',
    'story_1_flee': 'The backyard at sunset. Sir Ever-So-Sure leaps over the white picket fence with a rolled-up page under his arm, looking back smugly. Dad and the Kid run after him across the lawn, the Kid pointing. A pond glints in the distance.',
    'story_2_flee': 'A pond with lily pads. Sir Ever-So-Sure hops from lily pad to lily pad clutching a rolled-up page, looking back smugly. Dad and the Kid stand at the water edge; a frog watches. Far away, the roofs of a little town and its library.',
    'story_3_flee': 'Inside a tall library. Sir Ever-So-Sure slides down a rolling library ladder clutching a rolled-up page, heading for an open window with a harbour and sailing boats outside. Dad and the Kid hurry between the shelves after him.',
    'story_4_flee': 'The bright blue sea. Sir Ever-So-Sure paddles away on a floating open book like a little raft, using his quill as an oar, smug. Dad and the Kid lean out of their small rowing boat, a hermit crab at the front. A sandy desert coast on the horizon.',
    'story_5_flee': 'The desert at night, frosty and blue under stars. Sir Ever-So-Sure tiptoes away north across the silvery dunes with a rolled-up page, past plain saguaro cacti (no faces). Dad and the Kid in a blanket spot him. Snowy mountains on the far horizon.',
    'story_6_flee': 'The snowy Arctic. Sir Ever-So-Sure sleds away downhill on a big open page like a toboggan, holding his monocle on, smug. Dad and the Kid in puffy parkas chase him through the snow. A white snowy owl flies alongside. Green jungle far away to the south.',
    'story_7_flee': 'A rainy jungle. Sir Ever-So-Sure flies straight up out of the treetops hanging from a kite made of a page, waving his quill smugly toward the starry evening sky. Dad and the Kid look up from a branch, open-mouthed; a monkey points.',
    'story_8_boss': 'A showdown on a grassy hilltop at night under a sky full of stars. On the RIGHT, Sir Ever-So-Sure stands on top of a big rock, leaning back and laughing, holding high above his head a giant flat round disc painted like a flat map of the Earth, like a shield. On the LEFT, facing him from below, Dad holds up his magnifying glass and the Kid points up at him, brave; a toad, a spider and a firefly behind them. The two sides face each other across the hilltop.',
    'story_end1': 'The same hilltop under the stars, calm now. Sir Ever-So-Sure sits on the grass, soft and a little crumpled, monocle askew, shrugging with a small shy smile. The Kid kneels and offers him a friendly hand; Dad smiles beside them.',
    'story_end2': 'The town library at dawn. The giant old book on its reading stand closes by itself, its cover glowing warm gold with a big friendly question mark shape on it. Dad, the Kid and Sir Ever-So-Sure (smiling, humble) watch through the window from outside.',
    'story_end3': 'The backyard on a warm starry night: a picnic blanket, a telescope, Dad and the Kid lying back looking at the stars, all the animal friends around them (a spider, a toad, a firefly, a duck, a snowy owl, a moth), and Sir Ever-So-Sure sitting with them asking a question, curious and happy.',
}
STORY = {
    'story_p1': 'A cosy small-town library at dusk seen from the street. Through the big front window a huge old leather-bound book on a reading stand glows faintly gold. The Kid presses their nose to the glass outside, curious.',
    'story_p2': 'Inside the library, the giant old book bursts open in a whirlwind of glowing loose pages. Each flying page is one of the page myths, tumbling and cheering. Tall shelves behind, warm lamplight.',
    'story_p3': 'A sunny suburban backyard with a white picket fence. A line of page myths marches across the lawn. Dad holds up a big magnifying glass like a hero while the Kid points at the pages, excited.',
    'story_p4': 'Dad and the Kid stand back to back on the lawn at golden hour, ready for anything: Dad holds his magnifying glass, the Kid holds a small notebook. A friendly brown spider, a green toad and a glowing firefly gather around their feet.',
    'story_1_in': 'A backyard lawn where page myths are marching out from under the fence. The Kid shouts and points; Dad grabs his magnifying glass from the porch step.',
    'story_1_out': 'The same backyard, tidy and calm at golden hour. Dad and the Kid sit on the porch step with a picnic basket of snacks while the last few pages blow over the fence toward a pond in the distance.',
    'story_2_in': 'A green pond with lily pads, reeds and a white duck. Dad crouches at the water edge with the Kid; a page myth sits on a lily pad next to a curious frog.',
    'story_2_out': 'At the pond, a frog happily leaps out of a small pot of water while the Kid laughs. Far away across fields, pages flutter toward a little town with a library.',
    'story_3_in': 'Inside a grand old library with tall wooden shelves and a round red rug. A thick hardcover-book myth stomps along; Dad holds a finger to his lips saying shh, the Kid giggles.',
    'story_3_out': 'The Kid looks out of a tall library window at a sunny harbour with sailing boats; a stream of pages flies away out to sea.',
    'story_4_in': 'Dad and the Kid in a small wooden rowing boat on a bright blue sea. A little orange hermit crab rides at the front of the boat. A whale tail splashes in the distance.',
    'story_4_out': 'Dad and the Kid on a sandy beach at sunset with the rowing boat pulled up behind them; pages blow inland toward golden desert dunes.',
    'story_5_in': 'A hot sunny desert with tall golden dunes under a pale blue sky. A few tall green saguaro cacti stand on the dunes; the cacti are ordinary plants with NO faces, NO eyes and NO mouths. Dad and the Kid wear wide straw sun hats; Dad shades his eyes and looks across the dunes, the Kid points at the sand ahead, where little bumps ripple as page myths hide under it, one page corner poking out.',
    'story_5_out': 'The same desert at night: dark blue sky full of stars and a crescent moon, the golden dunes now silvery with a thin sparkle of frost, and plain saguaro cacti (ordinary plants with NO faces) standing dark against the sky. The Kid sits on a rock wrapped in a striped blanket, breath puffing in the cold, amazed. Dad points north toward a bright star, where a line of pages flutters away into the distance.',
    'story_6_in': 'A snowy arctic landscape with ice floes. Dad and the Kid in puffy parkas look at a very confused page myth dressed as a penguin; a polar bear watches from far away.',
    'story_6_out': 'The arctic at night under green northern lights. Dad and the Kid wave goodbye to a polar bear cub; pages fly away south.',
    'story_7_in': 'A rainy green jungle with giant leaves and vines. A monkey laughs on a branch, lightning flashes in the sky; Dad holds an umbrella over the Kid.',
    'story_7_out': 'A jungle clearing after the rain, sunbeams through leaves. One glowing page flies straight up into the sky and the Kid points up at it, open-mouthed.',
    'story_8_in': 'A grassy hill at night with a telescope and a sky full of stars. Dad and the Kid look up at a huge glowing page myth floating in the sky.',
    'story_8_out': 'Dad and the Kid sit together on the hill under the stars, the old book now closed and gently glowing in the Kid\'s lap; Dad has his arm around the Kid. Warm, happy ending.',
}
STORY_STYLE = (" A storyboard frame: one wide picture-book panel, cinematic composition, clear focal point, characters large enough to read on a phone, "
               "warm painted light, clean thick dark-brown outlines like the reference pictures, no border, no speech bubbles, no text or letters anywhere.")
HOME = ('A cosy suburban backyard at golden hour, seen from the side at a child\'s eye height, as the backdrop of a game\'s home screen. '
        'The top third is a calm warm sky, soft peach to pale blue, with two or three soft clouds and no sun disc. '
        'The middle has a low wooden picket fence, a big leafy tree on the left edge and the corner of a house porch with a warm lit window on the right edge. '
        'The lower half is a soft green lawn with a gently worn, empty, lighter patch of grass in the centre where characters will stand, '
        'and a few small flowers only along the very bottom edge. Soft long shadows, gentle light. Nothing has eyes or a face, no people, no animals, no text.')
# the home screen follows the furthest world reached: the same layout as home_bg (calm sky on top, scenery at the sides,
# an empty patch in the lower middle where the team stands); generate with --ref home_bg.png
HOME_LAYOUT = ('Seen from the side at a child\'s eye height, as the backdrop of a game\'s home screen, laid out exactly like the reference picture: '
               'the top third is calm sky with two or three soft clouds and no sun disc, scenery frames the left and right edges, '
               'and the lower half is open ground with a gently worn, empty, lighter patch in the centre where characters will stand. '
               'Soft long shadows, gentle light. Nothing has eyes or a face, no people, no animals, no text. ')
HOMES = {
  2: 'A sunny pond bank: tall reeds and cattails on the left edge, a small wooden jetty and a weeping willow on the right edge, the pond water with lily pads across the middle, and a soft grassy bank in front.',
  3: 'Inside a cosy old library: tall wooden bookshelves full of books on the left and right edges, a big arched window with warm afternoon light in the middle instead of sky, a round red rug on the wooden floor in front.',
  4: 'A sunny beach: a palm tree leaning in from the left edge, a striped beach hut on the right edge, calm blue sea and a few gentle waves across the middle, and smooth pale sand in front with a few shells along the bottom edge.',
  5: 'A sunny desert: tall green saguaro cacti (plain plants, no faces) on the left and right edges, golden dunes across the middle, and smooth rippled sand in front with a few small stones along the bottom edge.',
  6: 'The Arctic on a bright day, far from any town: snowy pine trees on the left edge, a small round igloo on the right edge, white snow fields and blue ice floes across the middle, and smooth soft snow in front. No fence, no buildings.',
  7: 'A rainforest clearing: giant leaves, vines and a big tree trunk on the left and right edges, misty green jungle across the middle, and a soft mossy clearing in front with a few ferns along the bottom edge.',
  8: 'A grassy hilltop at dusk: a deep blue sky with the first stars and a crescent moon instead of clouds, a small telescope on a stand at the right edge, a leafy bush on the left edge, faraway hills across the middle, and soft dark-green grass in front.',
}
def jobs():
    for pid, d in PETS.items(): yield 'pet_' + pid, STYLE + ' ' + d + '.' + SPRITE, 'pet', 'pets'
    yield 'kid', STYLE + ' ' + KID + '.' + SPRITE.replace('facing to the right', 'facing the viewer'), 'kid', 'kid'
    yield 'home_bg', HOME + ' ' + STYLE, 'arena', 'home'
    for i, d in HOMES.items(): yield f'home_bg_{i}', d + ' ' + HOME_LAYOUT + STYLE, 'arena', 'homes'
    for k, d in STORY.items(): yield k, STYLE + ' ' + CAST + d + STORY_STYLE, 'story', 'story'
    for k, d in STORY_V.items(): yield k, STYLE + ' ' + CAST + VILLAIN + d + STORY_STYLE, 'story', 'villain'
    for i, d in enumerate(ARENAS): yield f'arena_{i + 1}', f'Top-down view, straight down, of {d}. Soft even daylight, {STYLE} It is an empty stage waiting for the characters to be added later: plain scenery only, every flower, shell and object is ordinary and has no eyes or mouth. Keep the middle of the picture empty and simple. The scenery runs off all four edges.', 'arena', 'arenas'
    for i, d in enumerate(MAPS): yield f'map_{i + 1}', f'A wide hand-painted children\'s storybook landscape strip of {d}, side view, left to right. {STYLE} It is an empty stage waiting for the characters to be added later: plain scenery only, and the sun, moon, trees, plants and buildings are ordinary and have no eyes or mouths. The scenery runs off all four edges of the image like a crop from a bigger painting, with no border or frame line around it.', 'map', 'maps'

if __name__ == '__main__':
    if not KEY: print('GEMINI_API_KEY is not set; relying on the network to add it (a proxy secret), otherwise requests will fail with 401')
    argv = sys.argv[1:]; opt = lambda k: argv[argv.index(k) + 1] if k in argv else None
    if opt('--ref'):  # flattened on white: a transparent reference reads as black, and the model copies the black background
        REFS = []
        for r in opt('--ref').split(','):
            src = os.path.join(ASSETS, r) if not os.path.exists(r) else r; flat = os.path.join('/tmp', 'ref_' + os.path.basename(src))
            subprocess.run(['convert', src, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', flat], check=True); REFS.append(flat)
    SUFFIX = opt('--suffix') or ''
    args = [a for i, a in enumerate(argv) if not a.startswith('--') and (i == 0 or argv[i - 1] not in ('--ref', '--suffix'))]; force = '--force' in sys.argv
    os.makedirs(ASSETS, exist_ok=True); n = 0
    for name, prompt, kind, group in jobs():
        want = not args or name in args or group in args
        if not want: continue
        exists = os.path.exists(os.path.join(ASSETS, name + '.png'))
        if exists and not force and name not in args and not SUFFIX: print(name, 'exists, skipping'); continue
        make(name, prompt, kind); n += 1
    print(f'done, {n} image(s). Open defender/index.html?debug and check the Party screen, an arena and the map.')
