#!/usr/bin/env python3
"""Book 2 ("The Little Book of Everybody Says") as game data: reads the myth tables and comics in reports/Book 2 plan.md
and writes defender/book2.js, which index.html merges into MYTHS, META and WORLDS once Book 1 is finished.

    python3 defender/tools/book2_data.py

Re-run it whenever the plan changes (the source check, a reworded fact). The look of each world (lawn colours, the friend
it features, its chapter trait) and the story frames are kept here, since the plan describes them in words.
"""
import json, os, re, hashlib
HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = os.path.join(HERE, '..', '..', 'reports', 'Book 2 plan.md')
OUT = os.path.join(HERE, '..', 'book2.js')
src = open(PLAN, encoding='utf-8').read()

# the 8 worlds' looks, in plan order; topics pull in Book 1 myths Lady Hearsay is re-spreading
LOOK = [
  dict(comp='coco', deco='🍳', lawn=['#f3e2c4', '#e6cfa8'], stone='#fff6e6', edge='#c9a477', topics=['food', 'science']),
  dict(comp='hopper', deco='🌾', lawn=['#b9d77a', '#a3c466'], stone='#f2e6c4', edge='#8a6b3d', topics=['animals']),
  dict(comp='dusty', deco='🏺', lawn=['#e5ddd0', '#d6ccbc'], stone='#ffffff', edge='#9c8f7c', topics=['history', 'animals']),
  dict(comp='gizmo', deco='🏢', lawn=['#c9ccd3', '#b7bbc4'], stone='#eef0f3', edge='#7c8290', topics=['history', 'science', 'words']),
  dict(comp='sparky', deco='🏅', lawn=['#7fc46a', '#6bb257'], stone='#ffffff', edge='#d9d9d9', topics=['body']),
  dict(comp='echo', deco='🌦️', lawn=['#b7d3e3', '#a2c3d6'], stone='#f4f9fc', edge='#7fa3b8', topics=['weather']),
  dict(comp='frost', deco='⛰️', lawn=['#d4e2d0', '#bfd2ba'], stone='#ffffff', edge='#8ca088', topics=['earth', 'animals']),
  dict(comp='luna', deco='🛰️', lawn=['#3b4466', '#323a59'], stone='#9aa6d1', edge='#232a45', topics=['space']),
]
# one chapter trait per world, earned by finding all its facts (as Book 1's TRAITS)
TRAITS = [['🍳', 'Simmering', 'Coins +6%'], ['🚜', 'Early Riser', 'Patience +10'], ['🏛️', 'Curator', 'One extra Nope on level-up cards'],
          ['🏙️', 'Rush Hour', 'Ring +8'], ['🏅', 'Warmed Up', 'Patience +15'], ['🌦️', 'Forecaster', 'Coins +6%'], ['⛰️', 'Thin Air', 'Ring +10'], ['🛰️', 'Mission Control', 'Critical hits +3%']]
PAL = ['#f3d36b', '#d9705f', '#f0a35a', '#8fc7e8', '#a8d38a', '#c9a6f2', '#f2a7c3', '#e8c48a', '#9fd3c7', '#d8b48a']

def lines(s):  # the villains speak in quotes, as in Book 1
    out = [[m.group(1), m.group(2).strip().rstrip('/').strip().strip('"').strip()] for m in re.finditer(r'`(\w)`\s*([^`]+)', s)]
    return [[w, f'"{t}"' if w in 'hv' else t] for w, t in out]

sec2 = src[src.index('## 2. The 40 new myths'):src.index('### Boss moves')]
worlds_tables = re.split(r'\n### ', sec2)[1:]
myths, meta, worlds = {}, {}, []
plan_worlds = re.findall(r'^\| (\d) \| (\S+) (.+?) \| (.+?) \| (.+?) \| (.+?) \|$', src, re.M)
for wi, block in enumerate(worlds_tables[:8]):
    pool, boss = [], None
    for row in re.findall(r'^\| `(\w+)`( \*\*Boss\*\*)? \| (\S+) \| (.+?) \| (.+?) \| (.+?) \| (\w+) \| (.+?) \|$', block, re.M):
        mid, isboss, em, name, myth, fact, kind, source = row
        myths[mid] = dict(em=em, name=name, myth=myth.strip(), fact=fact.replace('*', '').strip(), kind='boss' if isboss else kind,
                          col=PAL[int(hashlib.md5(mid.encode()).hexdigest(), 16) % len(PAL)], book=2)
        meta[mid] = [LOOK[wi]['topics'][0], source.split(' · ')[0].strip()]
        if isboss: boss = mid
        else: pool.append(mid)
    num, em, name, desc, fam, topics = plan_worlds[wi]
    worlds.append(dict(name=name.strip(), em=em, desc=desc.strip(), pool=pool, boss=boss, book=2, topics=LOOK[wi]['topics'],
                       comp=LOOK[wi]['comp'], deco=LOOK[wi]['deco'], lawn=LOOK[wi]['lawn'], stone=LOOK[wi]['stone'], edge=LOOK[wi]['edge']))

# comics, notes and escapes: "**N. Name**" blocks
villain = []
for wi, block in enumerate(re.split(r'\n\*\*\d\. ', src[src.index('**Comics**'):src.index('## 2. The 40 new myths')])[1:9]):
    note = re.search(r'- Note: "(.+?)"\s*$', block, re.M).group(1)
    cin = lines(re.search(r'- in: (.+)$', block, re.M).group(1))
    cout = lines(re.search(r'- out[^:]*: (.+)$', block, re.M).group(1))
    flee = re.search(r'- Flee: (.+)$', block, re.M)
    worlds[wi]['comic'] = {'in': cin, 'out': cout}
    villain.append(dict(note=f'"{note}"', cameo='"Pass it on!"', flee=lines(flee.group(1)) if flee else None,
                        prev=f'Lady Hearsay ran off toward {worlds[wi + 1]["name"].replace("The ", "the ")} with a page.' if wi < 7 else None))

STORY = dict(
  prologue=[
    {'img': 'story_b2_p1', 'lines': [['n', 'Every book in the library had been checked. Every one but one: a little book that came back through the return slot, a hundred years overdue.']]},
    {'img': 'story_b2_p2', 'lines': [['n', 'It was the Little Book of Everybody Says. On its back cover lived Lady Hearsay. She never checked anything, as long as everybody was saying it.'], ['h', '"Did you hear? Everybody says EVERYTHING in here is true! Pass it on!"']]},
    {'img': 'story_b2_p3', 'lines': [['n', 'She blew on the pages, and off they flew, whispering to each other all the way.']]},
    {'img': 'story_b2_p4', 'lines': [['v', '"Oh dear. I know her. I used to be sure. She doesn\'t even care if she\'s right."'], ['k', 'Then we\'ll check. Every page.']], 'big': '<small>Book 2</small>The Little Book of Everybody Says'},
  ],
  showdown=[{'img': 'story_16_boss', 'lines': [['h', '"So you popped my pages. It doesn\'t matter. EVERYBODY says I\'m right!"'], ['k', 'Who\'s everybody?'], ['h', '"Everybody! My friend\'s cousin\'s hamster! Behold my shield: the biggest campfire in the sky!"'], ['d', 'Pop the shield first. Then we ask her where she heard it.']]}],
  ending=[
    {'img': 'story_b2_end1', 'lines': [['k', 'Lady Hearsay… where did you hear all this?'], ['n', 'Lady Hearsay opened her mouth. Then she closed it.'], ['h', '"I… I don\'t know. Somebody said it. I never checked."']]},
    {'img': 'story_16_out', 'lines': None},
    {'img': 'story_b2_end2', 'lines': [['v', '"Welcome to \'I don\'t know\'. It\'s a lovely place to start."'], ['n', 'The little book snapped shut, and its cover turned silver. It wasn\'t the Little Book of Everybody Says any more.']], 'big': '<small>The</small>Little Book of How'},
    {'img': 'story_b2_end3', 'lines': [['h', '"So… how DO we know the Earth goes round the Sun?"'], ['d', 'Great question. Get your coat. We\'ll need a telescope.'], ['n', 'The End. Well, the end of this book.']]},
  ])

data = dict(myths=myths, meta=meta, worlds=worlds, villain=villain, traits=TRAITS, **STORY)
assert len(worlds) == 8 and all(W['boss'] and len(W['pool']) >= 3 and W.get('comic') for W in worlds), [(W['name'], W['boss'], len(W['pool'])) for W in worlds]
open(OUT, 'w', encoding='utf-8').write('// Book 2, "The Little Book of Everybody Says": generated by tools/book2_data.py from reports/Book 2 plan.md. Do not edit by hand.\n'
                                        'const BOOK2 = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
print(f'{len(myths)} myths, {len(worlds)} worlds -> {os.path.relpath(OUT)}')
