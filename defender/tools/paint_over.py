"""Paint an arena over its blockout, matching existing art: the layout comes from blockouts/<name>.png (see blockout.py),
the look from one or more reference pictures. The model keeps every block where it is, so the art fits the gameplay.

    python3 paint_over.py backyard arena_1 --ref ../assets/arena_1.png --ref ../assets/home_bg.png --out arena_1_try
"""
import sys, os, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art

KEY = {  # what each blockout colour means, per arena
  'backyard': ('a family backyard lawn', 'the lighter middle is an empty, smooth, freshly mown lawn with nothing on it (no flowers, no objects, no paths), and it blends into the rest of the grass with no visible edge, ring or oval; '
               'the darker green around it is longer grass; the brown bands with pale squares are a white wooden picket fence seen from straight above, posts and rails; '
               'the grey rectangle top-left is the roof of a small garden shed seen from above; the big dark green circles are leafy tree canopies seen from above; '
               'the smaller green circles are round bushes; the brown rounded beds with coloured dots are flower beds; the pale grey ovals are stepping stones'),
}

def main():
    a = sys.argv[1:]; name, out = a[0], a[a.index('--out') + 1] if '--out' in a else a[1]
    refs = [a[i + 1] for i, x in enumerate(a) if x == '--ref']
    what, legend = KEY[name]
    prompt = (f'The first image is only a rough colour sketch of the layout of a top-down game arena showing {what}. '
              f'Use it purely as a guide for composition: put each thing in the same place and at the same size, seen straight down from above, '
              f'but do not keep any flat shapes or flat colours. Fully render every part as detailed, textured, shaded illustration: grass with soft mowing stripes and tufts, '
              f'fence planks with shadows, shingles on the shed roof, leafy canopies with highlights and cast shadows, individual flowers. Legend of the sketch: {legend}. '
              + (f'Match the art style, colours, outlines and texture of the other image{"s" if len(refs) > 1 else ""} exactly, as if painted by the same artist. ' if refs else '')
              + gen_art.STYLE + ' Plain scenery only: nothing has eyes or a face, no characters, no animals, no text, no frame. The scenery runs off all four edges.')
    png = gen_art.call(prompt, '9:16', refs=[os.path.join('blockouts', name + '.png')] + refs)
    path = os.path.join(gen_art.ASSETS, out + '.png'); tmp = path + '.tmp.png'
    open(tmp, 'wb').write(png)
    subprocess.run(['convert', tmp, '-resize', '480x800^', '-gravity', 'center', '-extent', '480x800', tmp], check=True)
    os.replace(tmp, path); print('->', os.path.relpath(path))

if __name__ == '__main__': main()
