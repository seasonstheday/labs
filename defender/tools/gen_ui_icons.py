#!/usr/bin/env python3
"""Painted UI icons: the small pictures the game shows in place of emoji (coins, pages, gems, elements, tabs...), drawn by the
image model in the game's picture-book style. Each replaces the hand-drawn SVG of the same name in index.html (SVG_I); any
icon without a painting keeps its SVG.

    python3 defender/tools/gen_ui_icons.py              # every icon below without a painting yet
    python3 defender/tools/gen_ui_icons.py coin gem --force

Writes defender/assets/ui/<name>.webp (128 px, transparent) and assets/ui/index.json (the list the game reads at start).
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import gen_art as G
OUT = os.path.join(HERE, '..', 'assets', 'ui'); os.makedirs(OUT, exist_ok=True)
ISTYLE = ("Children's picture-book cartoon game icon: clean thick dark-brown outline, flat cheerful colours with one soft shadow and one small "
          "highlight, chunky simple shape that reads at a tiny size. The object has no face, no eyes and no mouth. No text, no letters, no numbers. No circle, badge, button, frame or background shape behind it, and no shadow on the ground: just the object itself. No watermark.")
ICONS = {
  'coin': 'a gold coin seen slightly from the side, with a simple raised ring on its face', 'gem': 'a sparkling cut blue gem', 'page': 'a single cream paper page with a folded corner and a few grey lines',
  'ticket': 'an orange paper admission ticket with a star printed on it and a torn perforated edge (a library card ticket)', 'cupticket': 'a blue paper ticket with a gold medal circle printed on it',
  'badge': 'a gold star medal hanging from a short red ribbon (a club badge)', 'star': 'a plump five-pointed gold star', 'lock': 'a chunky gold padlock, closed',
  'power': 'a flexed cartoon arm showing a strong bicep, peach skin', 'sparkle': 'a big four-pointed yellow sparkle with a little sparkle beside it', 'gift': 'a red gift box with a gold ribbon and bow',
  'check': 'a green round button with a white tick mark', 'trophy': 'a shiny gold trophy cup with two handles on a brown base', 'medal': 'a round gold medal with a star, on a blue ribbon',
  'crown': 'a small gold crown with a red jewel', 'hammer': 'a wooden-handled hammer with a grey metal head', 'bag': 'a red school backpack with a yellow pocket', 'shirt': 'a blue t-shirt',
  'sprout': 'a little green sprout with two leaves', 'swords': 'two small cartoon swords crossed', 'lens': 'a magnifying glass with a wooden handle and a gold rim', 'drop': 'a blue water drop',
  'bolt': 'a yellow lightning bolt', 'wind': 'three curling teal gusts of wind', 'rock': 'a grey-brown rock', 'moon': 'a pale yellow crescent moon', 'rainbow': 'a small rainbow arch',
  'book': 'a closed blue book', 'bookR': 'a closed red book', 'bookG': 'a closed green book', 'notebook': 'a closed orange notebook with a strap', 'books': 'three books standing side by side, red, blue and green',
  'fire': 'an orange flame', 'snow': 'a pale blue snowflake', 'tree': 'a round green leafy tree', 'house': 'a small yellow house with a red roof', 'paw': 'a brown animal paw print',
  'bulb': 'a glowing yellow light bulb', 'shield': 'a blue shield', 'calendar': 'a little blank wall calendar page with a red top and a grid of plain coloured squares, no writing or numbers', 'map': 'a folded treasure map with a red X', 'clip': 'a brown clipboard with a paper on it',
  'question': 'a purple round button with a white question mark', 'clock': 'a round alarm clock', 'heart': 'a red heart', 'shop': 'a little shop stall with a red and white striped awning',
  'bookmark': 'a red ribbon bookmark', 'cookie': 'a chocolate chip cookie', 'wheel': 'a colourful prize wheel', 'tent': 'a green camping tent', 'music': 'two purple music notes',
  'up': 'a green arrow pointing up', 'play': 'a gold play triangle button', 'gear': 'a grey cog gear', 'warn': 'a yellow warning triangle with an exclamation mark', 'web': 'a round spider web',
  'flower': 'a pink five-petal flower with a yellow centre', 'feather': 'a light blue feather', 'dot': 'a small red round dot', 'planet': 'a ringed orange planet', 'apple': 'a red apple with a green leaf',
  'columns': 'a small white museum building with columns', 'globe': 'the Earth as a small blue and green globe', 'flask': 'a science flask with green liquid', 'brain': 'a pink cartoon brain',
  'fish': 'an orange fish', 'speaker': 'a grey loudspeaker with sound waves', 'cactus': 'a green cactus in the sand', 'wave': 'a curling blue ocean wave', 'palm': 'a palm tree',
  'party': 'a party popper with confetti', 'boom': 'an orange cartoon burst', 'flag': 'a red flag on a pole', 'school': 'a little red-roofed schoolhouse', 'person': 'a simple person shape, head and shoulders, purple shirt',
  'wheat': 'a golden ear of wheat', 'sun': 'a yellow sun with short rays', 'cloud': 'a white cloud with the sun peeking out', 'bronze': 'a bronze medal on a blue ribbon', 'silver': 'a silver medal on a blue ribbon',
  'tornado': 'a grey cartoon whirlwind', 'link': 'two gold chain links joined', 'plus': 'a chunky grey plus sign', 'snail': 'a snail with an orange swirl shell', 'cross': 'a red round button with a white X',
}

def make(k):
    out = os.path.join(OUT, k + '.webp'); tmp = os.path.join(OUT, k + '.tmp.png')
    prompt = ISTYLE + f' The icon shows {ICONS[k]}, big and centred, filling the picture. Plain pure white background, nothing else.'
    try:
        open(tmp, 'wb').write(G.call(prompt, '1:1'))
        subprocess.run(['convert', tmp, '-alpha', 'set', '-bordercolor', 'white', '-border', '1', '-fuzz', '7%', '-fill', 'none', '-draw', 'matte 0,0 floodfill',
                        '-shave', '1x1', '-trim', '+repage', '-resize', '120x120', '-background', 'none', '-gravity', 'center', '-extent', '128x128', '-quality', '85', out], check=True)
        os.remove(tmp); print('ok', k, flush=True)
    except Exception as e: print('FAILED', k, e, flush=True)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; force = '--force' in sys.argv
    todo = [k for k in (args or ICONS) if force or not os.path.exists(os.path.join(OUT, k + '.webp'))]
    print(len(todo), 'icons to paint', flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(make, todo))
    have = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.webp'))
    json.dump(have, open(os.path.join(OUT, 'index.json'), 'w')); print(len(have), 'painted icons listed in assets/ui/index.json')
