# Dad's drawn battle poses: python3 defender/tools/gen_dad_poses.py <outdir> bdad_idle bdad_aim bdad_ouch
# then trim, resize to 360 tall and copy to defender/assets/; the lens points in DPOSE (index.html) were measured from the glass colour
import sys, os, subprocess
sys.path.insert(0, '/home/user/labs/defender/tools')
import gen_art as g
OUT = sys.argv[1]; which = sys.argv[2:] 
A = '/home/user/labs/defender/assets/'
def flat(p):
    f = '/tmp/ref_' + os.path.basename(p); subprocess.run(['convert', p, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', f], check=True); return f
DADREF = [flat(A + 'mascot_wave.png'), flat(A + 'mascot_pointing.png')]
DAD = ("Dad from the reference pictures: short brown hair, short brown beard, round glasses, mustard-yellow sweater over a white collar, green trousers, brown shoes. Draw him exactly like that, same artist. ")
SP = " Single character, full body, seen from the side in three-quarter view, his body and face turned to the right, eyes looking straight ahead to the right (not down), on a plain pure white background, nothing else in the picture."
POSES = {
 'bdad_idle': DAD + "Ready stance: feet apart, knees slightly bent, holding a big round brass magnifying glass firmly in his right hand at shoulder height in front of him, lens facing right, other fist at his side, determined friendly smile.",
 'bdad_aim': DAD + "Action pose: lunging forward to the right, his right arm stretched fully out in front of him at shoulder height, gripping the handle of a big round brass magnifying glass, the lens held out at arm's length pointing right, peering hard through it, other arm back for balance.",
 'bdad_ouch': DAD + "Bumped pose: leaning back, wincing with one eye shut, still holding the big round brass magnifying glass in his right hand, other hand up, cartoon not hurt, funny.",
}
for k in which:
    p = g.STYLE + ' ' + POSES[k] + SP + ' Match the drawing style, outline weight, colours and shading of the reference pictures exactly.'
    png = g.call(p, '1:1', refs=DADREF); o = os.path.join(OUT, k + '.png'); open(o, 'wb').write(png); g.sprite_fix(o, 512); print(o)
