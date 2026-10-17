"""Arena blockouts: flat colour blocks at the game's exact layout, for an image model to paint over.

The arena picture is 480x800 and the game draws it at (-20, -20), so the fight's centre (CX, CY) = (220, 420) sits at
(240, 440) here. Dad's ring reaches 170 to about 230 from the centre, and myths walk in from the edges, so the middle
oval stays empty lawn and every prop sits outside it.

    python3 blockout.py backyard     -> blockouts/backyard.png (and a 2x copy the model sees)
"""
import sys, os
from PIL import Image, ImageDraw, ImageFilter

W, H, CX, CY, S = 480, 800, 240, 440, 2   # drawn at 2x, so the model gets a crisp layout
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'blockouts')

def backyard():
    im = Image.new('RGB', (W * S, H * S), (112, 165, 82)); r = lambda *b: [v * S for v in b]
    # the fight: a big empty oval of short lawn, feathered so the painting has no edge to copy
    glow = Image.new('L', im.size, 0); ImageDraw.Draw(glow).ellipse(r(CX - 225, CY - 290, CX + 225, CY + 290), fill=255)
    im = Image.composite(Image.new('RGB', im.size, (140, 190, 100)), im, glow.filter(ImageFilter.GaussianBlur(60 * S))); d = ImageDraw.Draw(im)
    # picket fence along the top and down both sides (brown bands with lighter posts)
    d.rectangle(r(0, 0, W, 46), fill=(120, 82, 50))
    for x in range(8, W, 26): d.rectangle(r(x, 6, x + 12, 40), fill=(236, 226, 205))
    for side in (0, W - 22):
        d.rectangle(r(side, 46, side + 22, 520), fill=(120, 82, 50))
        for y in range(56, 520, 26): d.rectangle(r(side + 5, y, side + 17, y + 12), fill=(236, 226, 205))
    # a garden shed roof in the top-left corner, a tree canopy top-right, another bottom-left
    d.rectangle(r(26, 50, 124, 140), fill=(140, 120, 110)); d.line(r(26, 95, 124, 95), fill=(100, 85, 78), width=4 * S)
    d.ellipse(r(360, 46, 478, 164), fill=(45, 100, 50)); d.ellipse(r(-40, 650, 90, 780), fill=(45, 100, 50))
    # flower beds (red and yellow dots on brown soil) in the corners and along the fence
    for bx, by, bw, bh in [(140, 50, 90, 34), (250, 50, 90, 34), (300, 700, 160, 70), (110, 740, 150, 50)]:
        d.rounded_rectangle(r(bx, by, bx + bw, by + bh), radius=14 * S, fill=(125, 90, 60))
        for i in range(9): px, py = bx + 10 + (i * 37) % (bw - 16), by + 8 + (i * 23) % (bh - 14); d.ellipse(r(px, py, px + 9, py + 9), fill=[(220, 60, 60), (245, 200, 60), (240, 240, 240)][i % 3])
    # bushes along the bottom edge and lower sides, outside the oval
    for bx, by in [(28, 560), (440, 560), (200, 770), (420, 760), (24, 470), (456, 470)]: d.ellipse(r(bx - 30, by - 26, bx + 30, by + 26), fill=(60, 120, 55))
    # a few stepping stones leading in from the bottom, ending before the oval
    for i, (sx, sy) in enumerate([(240, 790), (226, 762)]): d.ellipse(r(sx - 16, sy - 10, sx + 16, sy + 10), fill=(185, 180, 170))
    return im

if __name__ == '__main__':
    name = sys.argv[1] if len(sys.argv) > 1 else 'backyard'
    os.makedirs(OUT, exist_ok=True); im = {'backyard': backyard}[name]()
    im.save(os.path.join(OUT, name + '.png')); print('->', os.path.join('blockouts', name + '.png'), im.size)
