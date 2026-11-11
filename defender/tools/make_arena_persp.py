#!/usr/bin/env python3
"""Draw the plain layout sketch for a tilted-camera arena, for gen_arena_persp.py to paint over.

  python3 defender/tools/make_arena_persp.py N [out.png]        (N = arena 1-16; default out: arena_N_layout.png)

The image model holds a camera only when it is given a layout to repaint: asked in words alone, or shown a style
picture, it turned the scene to a corner view. So the layout is drawn here in code, the same for every world:
the ground drawn flat and tilted into perspective (the far edge narrower and shorter), a band straight across the
top for the far wall or far scenery with one feature in the middle, thin side strips, a round stage in the centre,
a pool of light and darker edges. Only the colours and the ground pattern change per world (LAYOUTS below).
"""
import os, random, sys
import numpy as np
from PIL import Image, ImageDraw

W, H, WALL, INSET = 960, 1600, 400, 70          # picture size, depth of the far band, how far the far ground edge narrows each side
INK = (58, 44, 32)

# per arena: ground colour, ground-line colour, pattern (boards | tiles | plain), stage colour (None = no rug, a paler patch),
# far-band colour, centre-feature colour, side-strip colour
LAYOUTS = {
    1:  ((132, 176, 96),  (110, 156, 82),  'plain',  None,            (238, 236, 226), (150, 110, 74),  (96, 140, 76)),    # backyard: lawn, white fence, garden gate
    2:  ((142, 196, 208), (120, 178, 194), 'plain',  (150, 190, 110), (110, 156, 96),  (86, 126, 78),   (104, 150, 110)),  # pond: water, grassy island, far bank of reeds
    3:  ((198, 152, 106), (150, 100, 60),  'boards', (142, 100, 124), (124, 86, 60),   (150, 138, 126), (92, 60, 42)),     # library
    4:  ((236, 214, 160), (222, 198, 142), 'plain',  None,            (120, 190, 206), (232, 232, 224), (224, 200, 146)),  # ocean beach: sand, the sea across the top
    5:  ((232, 204, 150), (216, 186, 130), 'plain',  None,            (214, 170, 110), (176, 120, 84),  (212, 180, 124)),  # desert: sand, far dunes and a rock arch
    6:  ((228, 240, 248), (204, 222, 236), 'plain',  None,            (176, 206, 228), (236, 244, 250), (200, 222, 238)),  # arctic: snow, ice cliffs and an igloo
    7:  ((150, 150, 96),  (128, 130, 80),  'plain',  None,            (62, 110, 70),   (120, 110, 86),  (70, 120, 76)),    # jungle: earth floor, wall of trees, old stone doorway
    8:  ((54, 92, 104),   (44, 78, 90),    'plain',  (76, 120, 124),  (30, 46, 78),    (236, 226, 180), (40, 72, 84)),     # night sky: dark lawn, moonlit patch, starry sky and a tent with a lantern
    9:  ((226, 222, 204), (170, 196, 160), 'tiles',  (220, 190, 120), (214, 190, 150), (200, 200, 204), (190, 160, 120)),  # kitchen: checked tiles, rug, worktop with a stove
    10: ((190, 156, 110), (170, 136, 92),  'plain',  (214, 190, 120), (170, 60, 50),   (120, 80, 50),   (150, 120, 84)),   # farm: dirt and straw, red barn with open doors
    11: ((214, 212, 210), (190, 188, 188), 'tiles',  (190, 176, 150), (196, 186, 170), (150, 140, 128), (170, 162, 150)),  # museum: stone floor, mosaic, wall with a big archway
    12: ((216, 206, 188), (192, 182, 164), 'tiles',  (226, 218, 202), (170, 150, 140), (120, 150, 170), (150, 140, 130)),  # city plaza: paving, shop fronts and a clock
    13: ((120, 172, 96),  (240, 240, 232), 'plain',  None,            (196, 96, 80),   (236, 236, 228), (196, 96, 80)),    # sports field: grass, running track, scoreboard
    14: ((196, 200, 206), (172, 178, 186), 'tiles',  (214, 196, 150), (190, 220, 240), (240, 240, 240), (170, 176, 184)),  # weather station roof: sky beyond the rail, white hut
    15: ((140, 178, 108), (120, 160, 92),  'plain',  None,            (150, 160, 176), (236, 240, 246), (110, 140, 96)),   # mountains: meadow, grey peaks with snow
    16: ((176, 180, 190), (150, 154, 166), 'tiles',  (150, 156, 170), (120, 126, 140), (20, 24, 50),    (130, 134, 148)),  # space station: padded floor, hatch, wall with a big round window
}


def coeffs(dst, src):
    """PIL perspective coefficients mapping each output point (dst) back to its source point"""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    return np.linalg.solve(np.array(m, dtype=float), np.array(src, dtype=float).reshape(8)).tolist()


def layout(n):
    ground, line, pattern, stage, far, feature, side = LAYOUTS[n]
    random.seed(n)
    FW, FH = W, 1860                                                                   # drawn flat and taller than it will show: the tilt squeezes it
    f = Image.new('RGB', (FW, FH), ground); d = ImageDraw.Draw(f)
    if pattern == 'boards':
        for x in range(0, FW, 80):
            d.line([x, 0, x, FH], fill=line, width=4)
            for y in range(random.randint(60, 300), FH, random.randint(380, 520)): d.line([x, y, x + 80, y], fill=line, width=4)
    elif pattern == 'tiles':
        for x in range(0, FW, 120): d.line([x, 0, x, FH], fill=line, width=4)
        for y in range(0, FH, 120): d.line([0, y, FW, y], fill=line, width=4)
    else:                                                                              # a few faint streaks, so the tilt still reads
        for x in range(60, FW, 160): d.line([x, 0, x, FH], fill=line, width=3)
    cx, cy, r = FW // 2, 870, 330
    if stage: d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=stage, outline=INK, width=6)
    else: d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=tuple(min(255, c + 14) for c in ground), outline=line, width=5)
    quad = [(INSET, WALL), (W - INSET, WALL), (W + 40, H + 60), (-40, H + 60)]
    img = f.transform((W, H), Image.PERSPECTIVE, coeffs(quad, [(0, 0), (FW, 0), (FW, FH), (0, FH)]), Image.BICUBIC)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, WALL], fill=far); d.line([0, WALL, W, WALL], fill=INK, width=6)                      # the far band
    d.rectangle([W // 2 - 140, 150, W // 2 + 140, WALL], fill=feature, outline=INK, width=6)                    # its centre feature
    for s in (0, 1):                                                                                          # side strips
        x = (lambda v: v) if s == 0 else (lambda v: W - v)
        d.polygon([(x(0), WALL), (x(INSET), WALL), (x(-40), H + 60)], fill=side)
    a = np.asarray(img).astype(float); yy, xx = np.mgrid[0:H, 0:W]
    pool = np.exp(-(((xx - W / 2) / 420) ** 2 + ((yy - 900) / 520) ** 2))
    edge = np.clip(((xx - W / 2) / (W / 2)) ** 2 * .5 + ((yy - 860) / 900) ** 2 * .45, 0, 1)
    a = a * (1 + pool * .1 - edge * .3)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8')).resize((768, 1280), Image.LANCZOS)


if __name__ == '__main__':
    n = int(sys.argv[1]); out = sys.argv[2] if len(sys.argv) > 2 else f'arena_{n}_layout.png'
    layout(n).save(out); print('wrote', out)
