from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys, os
B = sys.argv[1]; OUT = sys.argv[2]
W, H = 1320, 2868
F1 = ImageFont.truetype(f'{B}/Fredoka.ttf', 104); F2 = ImageFont.truetype(f'{B}/Nunito.ttf', 50)
SHOTS = [
 ('2_fact', 'Pop the myths.\nDefend the facts!', 'A cosy backyard battler for curious kids', ('#f6d98b', '#fbf3df')),
 ('1_battle', 'Every myth you pop\nbecomes a real fact', '145 myths, checked against museums and NASA', ('#b9dde6', '#fbf3df')),
 ('4_friends', 'Team up with 28\nbackyard friends', 'Spiders, frogs, fireflies, each with their own moves', ('#c9e3b0', '#fbf3df')),
 ('3_story', 'Stop Sir Ever-So-Sure!', 'An 8-chapter story about asking "Why?"', ('#d8c8f0', '#fbf3df')),
 ('5_diary', "Fill Dad's Diary\nwith real facts", 'Every topic you complete powers up the team', ('#f3c9a8', '#fbf3df')),
 ('7_map', 'Eight worlds, from the\nbackyard to the stars', 'Pond, library, ocean, desert, arctic, jungle and sky', ('#bcd3ee', '#fbf3df')),
 ('6_home', 'No energy timers.\nPlay at your own pace.', 'Every level is free to play, any time', ('#f0d0d8', '#fbf3df')),
]
def grad(c1, c2):
    g = Image.new('RGB', (W, H), c1); top = Image.new('RGB', (W, H), c2); mask = Image.linear_gradient('L').resize((W, H)); return Image.composite(top, g, mask)
for i, (name, cap, sub, (c1, c2)) in enumerate(SHOTS, 1):
    bg = grad(c1, c2); d = ImageDraw.Draw(bg)
    y = 150
    for line in cap.split('\n'):
        w = d.textlength(line, font=F1); d.text(((W - w) / 2, y), line, font=F1, fill='#3a2c20'); y += 122
    w = d.textlength(sub, font=F2); d.text(((W - w) / 2, y + 18), sub, font=F2, fill='#6b5236'); y += 120
    shot = Image.open(f'{B}/{name}.png').convert('RGB').crop((0, 294, 1320, 2574))  # the game frame, without the letterbox
    sw = 1200; sh = int(shot.height * sw / shot.width); avail = H - y - 70
    if sh > avail: sh = avail; sw = int(shot.width * sh / shot.height)
    shot = shot.resize((sw, sh), Image.LANCZOS)
    x0 = (W - sw) // 2; r = 56
    m = Image.new('L', (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, sw - 1, sh - 1), r, fill=255)
    sh_ = Image.new('RGBA', (sw + 80, sh + 80), (0, 0, 0, 0)); ImageDraw.Draw(sh_).rounded_rectangle((40, 52, sw + 40, sh + 52), r, fill=(58, 44, 32, 90)); sh_ = sh_.filter(ImageFilter.GaussianBlur(18))
    bg.paste(sh_, (x0 - 40, y - 40), sh_)
    border = Image.new('L', (sw + 24, sh + 24), 0); ImageDraw.Draw(border).rounded_rectangle((0, 0, sw + 23, sh + 23), r + 12, fill=255)
    bg.paste(Image.new('RGB', (sw + 24, sh + 24), '#3a2c20'), (x0 - 12, y - 12), border); bg.paste(shot, (x0, y), m)
    bg.save(f'{OUT}/{i:02d}_{name}.png', optimize=True); print(f'{OUT}/{i:02d}_{name}.png')
