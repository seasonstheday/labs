#!/usr/bin/env python3
"""Draw the plain layout sketch for a tilted-camera arena (the Library), for gen_arena_persp.py to paint over.

  python3 defender/tools/make_arena_persp.py [out.png]          (default: arena_3_layout.png in the current folder)
  python3 defender/tools/gen_arena_persp.py 3 --layout arena_3_layout.png --tries 3 --out DIR

The image model holds a camera only when it is given a layout to repaint: asked in words alone, or shown a style
picture, it turned the room to a corner view. So the layout is drawn here in code: a floor drawn flat (boards and a
round rug) tilted into perspective, a back wall straight across the top with a fireplace, lamps and bookshelves, thin
side walls, a pool of light and dark edges. Pick a painted result, crop it to 3:5, and save it as
assets/arena_3p.webp (960 x 1600). The game adds the moving parts on top: see AMBIENT in index.html, whose numbers
say where the painted fire and lamps are.
"""
import os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

A = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
W, H, WALL, WH, INSET = 960, 1600, 400, 300, 70          # picture size, height of the back wall, how far the far floor edge narrows each side
INK = (58, 44, 32)
random.seed(3)


def coeffs(dst, src):
    """PIL perspective coefficients mapping each output point (dst) back to its source point"""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(src, dtype=float).reshape(8)
    return np.linalg.solve(np.array(m, dtype=float), b).tolist()


def floor():
    # drawn flat, as if from straight above, then tilted: boards running toward the far wall, and a round rug
    FW, FH = W, 1860                                                                   # taller than it will show: the tilt squeezes it to 70%
    f = Image.new('RGB', (FW, FH), (198, 152, 106)); d = ImageDraw.Draw(f)
    for i, x in enumerate(range(0, FW, 80)):
        tone = random.choice([(198, 152, 106), (190, 144, 100), (204, 158, 112), (194, 148, 102)])
        d.rectangle([x, 0, x + 80, FH], fill=tone); d.line([x, 0, x, FH], fill=(150, 100, 60), width=4)
        for y in range(random.randint(60, 300), FH, random.randint(380, 520)): d.line([x, y, x + 80, y], fill=(150, 100, 60), width=4)
    cx, cy, r = FW // 2, 870, 330                                                      # the rug, under Dad
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(142, 100, 124), outline=INK, width=7)
    d.ellipse([cx - r + 34, cy - r + 34, cx + r - 34, cy + r - 34], outline=(174, 132, 150), width=10)
    d.ellipse([cx - r + 70, cy - r + 70, cx + r - 70, cy + r - 70], fill=(156, 112, 136))
    quad = [(INSET, WALL), (W - INSET, WALL), (W + 40, H + 60), (-40, H + 60)]
    return f.transform((W, H), Image.PERSPECTIVE, coeffs(quad, [(0, 0), (FW, 0), (FW, FH), (0, FH)]), Image.BICUBIC)


def shelf(d, x0, y0, x1, y1, rows):
    d.rectangle([x0, y0, x1, y1], fill=(96, 62, 40), outline=INK, width=5)
    rh = (y1 - y0 - 10) / rows
    for r in range(rows):
        ty, by = y0 + 8 + r * rh, y0 + 2 + (r + 1) * rh
        d.rectangle([x0 + 8, ty, x1 - 8, by], fill=(62, 40, 28))
        x = x0 + 12
        while x < x1 - 22:
            bw = random.choice([12, 14, 16, 20]); bh = (by - ty) * random.uniform(.72, .96)
            col = random.choice([(150, 92, 74), (120, 96, 132), (178, 142, 84), (104, 122, 110), (140, 110, 90), (166, 120, 96), (96, 88, 120)])
            d.rectangle([x, by - bh, min(x + bw, x1 - 10), by], fill=col, outline=INK, width=2)
            x += bw + 1
        d.line([x0 + 4, by + 2, x1 - 4, by + 2], fill=INK, width=4)


def wall(img):
    # the wall is drawn on its own strip and set below a plain band, which the game's top bar covers
    strip = Image.new('RGB', (W, WH)); d = ImageDraw.Draw(strip)
    d.rectangle([0, 0, W, WH], fill=(124, 86, 60))                                  # panelled wall
    for x in range(0, W, 80): d.line([x, 0, x, WH], fill=(108, 74, 52), width=3)
    shelf(d, INSET - 30, 30, 330, WH - 8, 3); shelf(d, W - 330, 30, W - INSET + 30, WH - 8, 3)
    # the fireplace: stone surround, dark mouth, mantel
    cx = W // 2
    d.rectangle([cx - 130, 70, cx + 130, WH - 2], fill=(150, 138, 126), outline=INK, width=5)
    for y in range(110, WH, 44):
        d.line([cx - 128, y, cx + 128, y], fill=(126, 114, 104), width=3)
        for x in range(cx - 100 + (y // 44 % 2) * 40, cx + 120, 80): d.line([x, y, x, y + 44], fill=(126, 114, 104), width=3)
    d.pieslice([cx - 84, 110, cx + 84, 278], 180, 360, fill=(40, 28, 24), outline=INK, width=5)
    d.rectangle([cx - 84, 192, cx + 84, WH - 2], fill=(40, 28, 24)); d.line([cx - 84, 192, cx - 84, WH], fill=INK, width=5); d.line([cx + 84, 192, cx + 84, WH], fill=INK, width=5)
    d.rectangle([cx - 150, 52, cx + 150, 78], fill=(104, 68, 44), outline=INK, width=5)   # mantel
    for lx in (cx - 60, cx + 40): d.rectangle([lx, 268, lx + 50, 286], fill=(92, 60, 40), outline=INK, width=3)  # logs
    for lx in (372, W - 372):                                                             # wall lamps
        d.line([lx, 150, lx, 120], fill=INK, width=6); d.polygon([(lx - 22, 120), (lx + 22, 120), (lx + 14, 86), (lx - 14, 86)], fill=(236, 200, 120), outline=INK, width=4)
    d.rectangle([0, WH - 10, W, WH + 6], fill=(84, 56, 38), outline=INK, width=4)     # skirting board
    d = ImageDraw.Draw(img); d.rectangle([0, 0, W, WALL - WH], fill=(108, 74, 52)); d.line([0, WALL - WH - 4, W, WALL - WH - 4], fill=INK, width=5)
    img.paste(strip, (0, WALL - WH))
    # side walls: the wedges beside the tilted floor, with a hint of shelves
    for side in (0, 1):
        x = lambda v: v if side == 0 else W - v
        d.polygon([(x(0), WALL), (x(INSET), WALL), (x(-40), H + 60)], fill=(92, 60, 42))
        for k in range(1, 9):
            y = WALL + k * 150; xi = INSET * (1 - (y - WALL) / (H - WALL)) * .9
            d.line([x(0), y, x(xi), y - 26], fill=INK, width=3)
    return img


def light(img):
    a = np.asarray(img).astype(float)
    yy, xx = np.mgrid[0:H, 0:W]
    pool = np.exp(-(((xx - W / 2) / 420) ** 2 + ((yy - 900) / 520) ** 2))                # a pale pool where Dad stands
    edge = np.clip(((xx - W / 2) / (W / 2)) ** 2 * .55 + ((yy - 860) / 900) ** 2 * .5, 0, 1)
    k = (1 + pool * .14 - edge * .42)[..., None]
    a = a * k + pool[..., None] * np.array([18, 12, 2])
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))


import sys
out = sys.argv[1] if len(sys.argv) > 1 else 'arena_3_layout.png'
light(wall(floor())).resize((768, 1280), Image.LANCZOS).save(out)
print('wrote', out)
