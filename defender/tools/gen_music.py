# The soundtrack: python3 defender/tools/gen_music.py [names]  (needs network; the proxy adds the API key)
# Writes <name>.mp3 here; then trim, normalise and encode into defender/assets/music/ with:
#   ffmpeg -i X.mp3 -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,loudnorm=I=-18:TP=-1.5:LRA=11" -ar 44100 -c:a libmp3lame -b:a 96k defender/assets/music/X.mp3
import subprocess, sys, os
LYRIA = os.path.join(os.path.dirname(__file__), "lyria.py")
from concurrent.futures import ThreadPoolExecutor
S = ("Original instrumental video game music for a cosy children's fantasy adventure game, in the spirit of classic adventure game soundtracks, "
     "but with its own original melodies. Signature motif shared by the whole soundtrack: a bright rising three-note horn call answered by a playful flute phrase. "
     "Warm chamber-orchestra palette built around flute, ocarina, harp, pizzicato strings and French horns. Clean mix, no vocals, no lyrics. ")
LOOP = "About two minutes long, with an ending that leads smoothly back into the beginning so it can loop."
T = {
 'home':    "The main theme for the home screen: hopeful, cosy and warm, the full signature melody on ocarina then flute over harp arpeggios and soft strings, 104 bpm, major key. ",
 'w0':      "Backyard level: cheerful, bouncy overworld adventure march, ocarina lead, pizzicato strings, light snare and horns, 112 bpm, major key, sunny. ",
 'w1':      "Pond level: a gentle, lazy 3/4 waltz on clarinet and ocarina over harp and marimba, dragonflies and lily pads, 96 bpm, major key. ",
 'w2':      "Library level: hushed and curious, tiptoeing pizzicato and bassoon, celesta and a ticking clock feel, a little mysterious, dorian mode, 92 bpm. ",
 'w3':      "Ocean level: a rollicking sea shanty in 6/8 with tin whistle, accordion and fiddle, horns on the motif, waves and sea air, 120 bpm, major key. ",
 'w4':      "Desert level: a sunny desert adventure with oud, darbuka hand drums and flute in a phrygian-dominant flavour, shimmering heat, 100 bpm. ",
 'w5':      "Arctic level: twinkling and sparkly, glockenspiel, celesta, soft strings and sleigh bells in a gentle 3/4, snowfall, 88 bpm, major key. ",
 'w6':      "Jungle level: lively and green, marimba, hand drums and pan flute with bird-like flute trills, rain on leaves, 116 bpm, mixolydian. ",
 'w7':      "Night sky level: dreamy and full of wonder, harp, celesta and soft wordless choir pads under a slow flute melody, starlight, 80 bpm. ",
 'boss':    "Boss battle: urgent and heroic but kid-friendly, driving strings, timpani, brass stabs and the horn call made bold, minor key, 140 bpm. ",
 'final':   "Final battle against a pompous know-it-all villain: the biggest, most heroic version of the signature horn call, full orchestra, timpani rolls, soaring strings, minor turning to major, 150 bpm. ",
 'villain': "Comic villain theme for a pompous, sneaky know-it-all: tiptoeing staccato bassoon and tuba, pizzicato, harpsichord flourishes and a smug little trumpet, minor key, 100 bpm, funny not scary. ",
 'credits': "End credits: a warm, triumphant full-orchestra reprise of the main theme that settles into a gentle, happy ending on harp and flute, about two minutes, ends with a final chord. ",
}
want = sys.argv[1:] or list(T)
def go(k): return subprocess.run(['python3', LYRIA, 'lyria-3-pro-preview', f'{k}.mp3', S + T[k] + ('' if k == 'credits' else LOOP)], capture_output=True, text=True).stdout.strip()
with ThreadPoolExecutor(3) as ex:
    for r in ex.map(go, want): print(r, flush=True)
