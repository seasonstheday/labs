#!/usr/bin/env python3
"""Perspective arenas: a tilted-camera background with one colour family and a pool of light in the middle.

  python3 defender/tools/gen_arena_persp.py 3 [--tries 3] [--out DIR]

Paints arena N (1-16) in the style of the existing flat arena, which is sent as the style reference.
Writes DIR/arena_N_p<try>.png at the model's full size; pick one, then save it as assets/arena_Np.webp
(960 x 1600) for the game to use. The key comes from GEMINI_API_KEY, or from a proxy that adds the header.
"""
import os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art as G

# one camera for every world, so characters stand the same way everywhere
CAMERA = ('Seen from a high three-quarter camera, like a tower-defence or arena game level: we look down at the floor at about 55 degrees. '
          'The floor fills most of the picture and recedes gently toward the top. The far wall of the place runs across the top fifth of the picture '
          'and we see its front face. Along the left and right edges and the bottom corners stand objects with real height, drawn in the same perspective. '
          'A tall portrait picture.')
STAGE = ('The middle of the floor is a wide, empty, simple round stage, lit by a soft pool of light and a little paler than the rest; '
         'the edges and corners of the picture are darker and richer. Nothing stands in the middle. '
         'Keep the whole place in one colour family so that characters added later will stand out: muted and calm, never loud. '
         'No characters, no creatures, no faces: every object is ordinary and has no eyes or mouth. No text. The scenery runs off all four edges.')
PLACES = {
    3: ('a cosy old library at dusk. Warm brown wooden floorboards with a big round rug in the middle in a soft, dusty plum colour, not bright. '
        'Across the top: a stone fireplace with a small fire burning, tall bookshelves either side of it, and two wall lamps glowing. '
        'Down the left and right edges: bookshelves, a rolling ladder, a globe on a stand, stacks of books, a reading chair. '
        'A tall window on the left wall lets in a slanted shaft of evening light. Colour family: warm browns, plum and amber.'),
}

def main():
    n = int(sys.argv[1]); tries = int(sys.argv[sys.argv.index('--tries') + 1]) if '--tries' in sys.argv else 2
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else '.'
    os.makedirs(out, exist_ok=True)
    ref = os.path.join(G.ASSETS, f'arena_{n}.png')
    prompt = (f'{PLACES[n]} {CAMERA} {STAGE} {G.STYLE} Match the drawing style, outline weight and flat shading of the reference picture exactly, '
              'as if drawn by the same artist, but change the camera to the tilted view described and draw this new scene.')
    for k in range(tries):
        png = G.call(prompt, '9:16', refs=[ref]); f = os.path.join(out, f'arena_{n}_p{k + 1}.png')
        open(f, 'wb').write(png); print('wrote', f, subprocess.run(['identify', '-format', '%wx%h', f], capture_output=True, text=True).stdout)

if __name__ == '__main__':
    main()
