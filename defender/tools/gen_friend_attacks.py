# each friend's attack drawing from its pet_<id>.png: python3 defender/tools/gen_friend_attacks.py <outdir> [ids]
# then resize to 256 and copy to defender/assets/pet_<id>_atk.png; mouth points live in EMIT_ATK, size matches in ATK_K (index.html)
import sys, os, subprocess
sys.path.insert(0, '/home/user/labs/defender/tools')
import gen_art as g
A = '/home/user/labs/defender/assets/'; OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
ACT = {
 'webster': 'rearing up on its back legs with the two front legs raised high, mouth open in a cheeky shout',
 'sparky': 'darting forward, its glowing tail blazing extra bright, little sparks crackling around it',
 'hopper': 'leaning forward with its wide mouth gaping open in a big round O, the tongue kept inside the mouth so none of it sticks out',
 'puddles': 'leaning forward with its beak wide open in a big loud QUACK, wings flared out',
 'dusty': 'leaning forward and flinging its little red book forward like a throw',
 'pip': 'one big claw raised high behind it, about to lob something, eyes eager',
 'scuttle': 'head down and charging forward, legs scrambling, determined',
 'nilla': 'wings spread wide open, beak open in a hoot',
 'bluey': 'spouting a big jet of water from its blowhole, tail flicked up',
 'bramble': 'pouncing forward with front paws stretched out, mouth open',
 'bumble': 'diving forward stinger-first, wings a blur, determined grin',
 'chroma': 'leaning forward with its mouth wide open and its curly tail up, colours brighter',
 'coco': 'winding up to throw its acorn forward overarm',
 'dot': 'wing cases flicked open, leaning forward, cheeky grin',
 'echo': 'wings spread wide, mouth open in a big squeak',
 'frost': 'rearing up with one big paw raised to swipe, mouth open in a little roar',
 'gizmo': 'leaning forward pushing both little hands out, mischievous grin',
 'goldie': 'puffing out a stream of bubbles from its mouth inside its bubble bowl',
 'inky': 'two tentacles reaching forward, the others bracing, cheeky grin',
 'jelly': 'tentacles swishing forward, glowing brighter, little sparkles',
 'luna': 'wings opened wide and glowing softly, sprinkling sparkly moon dust forward',
 'pinch': 'both big claws thrust forward snapping, mouth open',
 'prickles': 'quills puffed out and bristling, leaning forward, determined',
 'rosie': 'wings spread wide, one leg kicked out forward, beak open',
 'shelly': 'stretching its neck forward with its mouth open in a shout',
 'sol': 'tail feathers fanned out fully and glowing like the sun, beak open',
 'uni': 'rearing up on its back legs, horn glowing with magic',
 'wiggles': 'stretching its head forward with its mouth open in a cheerful shout',
}
for k in (sys.argv[2:] or ACT):
    o = os.path.join(OUT, k + '.png')
    if os.path.exists(o): continue
    f = '/tmp/ref_pet_' + k + '.png'; subprocess.run(['convert', A + 'pet_' + k + '.png', '-background', 'white', '-alpha', 'remove', '-alpha', 'off', f], check=True)
    p = (g.STYLE + ' The same character as the reference picture, drawn exactly like it (same colours, markings, proportions and outline), now in an attack pose: ' + ACT[k] +
         '. Facing to the right, full body, centred, the same size in the frame as the reference, on a plain pure white background, nothing else in the picture.')
    try:
        png = g.call(p, '1:1', refs=[f]); open(o, 'wb').write(png); g.sprite_fix(o, 400); print('ok', k, flush=True)
    except Exception as e: print('FAIL', k, e, flush=True)
