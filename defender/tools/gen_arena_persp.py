#!/usr/bin/env python3
"""Perspective arenas: a tilted-camera background with one colour family and a pool of light in the middle.

  python3 defender/tools/gen_arena_persp.py 3 [--tries 3] [--out DIR] [--ref style.png] [--layout layout.png]

Paints arena N (1-16) in the style of the existing flat arena, which is sent as the style reference.
Writes DIR/arena_N_p<try>.png at the model's full size; pick one, then save it as assets/arena_Np.webp
(960 x 1600) for the game to use. The key comes from GEMINI_API_KEY, or from a proxy that adds the header.
"""
import os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_art as G

# one camera for every world, so characters stand the same way everywhere
CAMERA = ('Camera: straight-on and symmetrical, like a tower-defence or arena game level seen from the audience. We look down at the floor from a high angle, '
          'about 55 degrees. The back wall runs perfectly horizontally across the top quarter of the picture, parallel to the top edge, and we see its front face. '
          'This is NOT a corner view and NOT an isometric view: no diagonal walls, the floorboards run straight up the picture toward the back wall. '
          'The left and right edges show a thin slice of the side walls with furniture standing against them. The bottom edge is just floor running off the picture. '
          'A tall portrait picture.')
STAGE = ('The middle of the floor is a wide, empty, simple round stage, lit by a soft pool of light and a little paler than the rest; '
         'the edges and corners of the picture are darker and richer. Nothing stands in the middle. '
         'Keep the whole place in one colour family so that characters added later will stand out: muted and calm, never loud. '
         'No characters, no creatures, no faces: every object is ordinary and has no eyes or mouth. No text. The scenery runs off all four edges.')
PLACES = {
    3: ('a cosy old library at dusk. Warm brown wooden floorboards with a big round rug in the middle in a soft, dusty plum colour, not bright. '
        'On the back wall, exactly in the middle: a stone fireplace with a small fire burning, a wall lamp glowing on each side of it, and a tall bookshelf on each side of those. '
        'Tight against the left and right edges only: a rolling ladder, a globe on a stand, a reading chair, a few stacks of books. '
        'The round rug sits in the exact centre of the picture and is wide; the floor around it is clear. '
        'Evening light falls from a window out of view on the left. Colour family: warm browns, plum and amber.'),
}

def main():
    n = int(sys.argv[1]); tries = int(sys.argv[sys.argv.index('--tries') + 1]) if '--tries' in sys.argv else 2
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else '.'
    os.makedirs(out, exist_ok=True)
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else os.path.join(G.ASSETS, f'arena_{n}.png')
    layout = sys.argv[sys.argv.index('--layout') + 1] if '--layout' in sys.argv else None
    if layout:  # the dependable way to hold the camera: a plain layout to paint over, plus a picture for the style
        refs = [layout]  # sending a style picture as well made the model copy that picture's camera, so the style is described in words
        prompt = ('This picture is a plain layout sketch of a game level. Repaint it as a finished, richly detailed illustration, keeping its camera, '
                  'its composition and where everything is, exactly: the back wall straight across the top with the fireplace in the middle and a bookshelf on each side, '
                  'the floorboards running straight up the picture, the round rug in the centre of the floor, thin side walls at the left and right edges. '
                  'Do not rotate the room, do not show a corner, do not add a wall or shelves along the bottom. '
                  f'The place: {PLACES[n]} {STAGE} {G.STYLE} '
                  'Make it charming: carved mantel, framed picture, books of many sizes, a wall lamp each side of the fire, wood grain and a few knots in the boards, '
                  'a woven border on the rug. Against the side walls, drawn with height and overlapping the floor edge: a rolling ladder, a globe on a stand, '
                  'a reading chair, stacks of books. Soft shading, warm firelight spilling onto the floor in front of the fireplace, slightly darker corners. '
                  'Keep the rug and the floor around it clear, simple and calm.')
    else:
        refs = [ref]
        prompt = (f'{PLACES[n]} {CAMERA} {STAGE} {G.STYLE} Match the drawing style, outline weight and flat shading of the reference picture exactly, '
                  'as if drawn by the same artist, but do not copy its layout or camera: use the straight-on camera described and draw this new scene.')
    for k in range(tries):
        png = G.call(prompt, '9:16', refs=refs); f = os.path.join(out, f'arena_{n}_p{k + 1}.png')
        open(f, 'wb').write(png); print('wrote', f, subprocess.run(['identify', '-format', '%wx%h', f], capture_output=True, text=True).stdout)

if __name__ == '__main__':
    main()
