# python3 defender/tools/page_model.py [key=value ...]   e.g. tier_pages=[10,25,40,80]  (defaults = the live game, build 31)
# A free player's page income: plays every day, clears NEW new stages a day until all 40 are done,
# finishes the daily missions every day and the weekly ones every week, claims the daily gift, and
# spends half their gems on Library Cards. Reports when each friend joins and how stars grow.
import random, statistics, sys
P = dict(
    first_clear=2, boss_bonus=2, tier_pages=[10, 30, 60, 120], star_cost=[0, 6, 10, 14, 20],
    card_friend=(4, 6), card_blank=3, daily_blank=2, weekly_blank=8, cal_blank={2: 3, 5: 5}, cal_cards={1: 1, 4: 1, 6: 1},
    new_per_day=3, home=True, gem_share=.5, card_gems=50, card_every_clear=False, legend_no_story=True,
)
for a in sys.argv[1:]:
    k, v = a.split('='); P[k] = eval(v)
STORY = {'webster': (0, 0), 'hopper': (0, 1), 'sparky': (0, 2), 'puddles': (0, 3), 'dusty': (1, 12), 'pip': (1, 17), 'scuttle': (1, 22), 'nilla': (2, 27), 'luna': (2, 37)}
NEW = {'shelly': (0, 6), 'goldie': (0, 8), 'prickles': (1, 14), 'jelly': (1, 18), 'echo': (2, 30), 'inky': (3, 33), 'chroma': (3, 39)}
STORYGOALS = {'friends6': 8, 'yard': 10, 'pond': 10, 'hard': 5, 'chapter4': 10, 'chapter8': 15, 'reacts': 10}  # Blank pages
def run(seed):
    rnd = random.Random(seed); own = {}; pages = {}; stars = {}; blank = 0; gems = 0; cleared = 0; cards = 0; joined_day = {}; got = set(); fav_day5 = None
    def order():
        locked = [k for k in {**STORY, **NEW} if k not in own]
        key = lambda k: STORY[k][1] if k in STORY else (NEW[k][1] if P['home'] else 99)
        return sorted(locked, key=key)
    def tier(k): return (STORY.get(k) or NEW[k])[0]
    def add(k, n, day):
        nonlocal blank
        pages[k] = pages.get(k, 0) + n
        if k not in own and pages[k] >= P['tier_pages'][tier(k)]: pages[k] -= P['tier_pages'][tier(k)]; own[k] = True; stars[k] = 1; joined_day[k] = day
    for day in range(1, 91):
        # play
        for _ in range(P['new_per_day'] if cleared < 40 else 0):
            st = cleared; cleared += 1; cards += 1 if (P['card_every_clear'] or st % 5 in (2, 4)) else 0; gems += 15 + 3 * st + (10 if st % 5 in (2, 4) else 0) + 10
            free = [k for k, v in STORY.items() if v[1] == st and k not in own]
            if free: k = free[0]; add(k, P['tier_pages'][tier(k)] - pages.get(k, 0), day)
            else:
                o = [k for k in order() if not (k in NEW and NEW[k][0] == 3 and P.get('legend_no_story'))]
                if o: add(o[0], P['first_clear'] + (P['boss_bonus'] if st % 5 in (2, 4) else 0), day)
        # daily missions, weekly chest, the gift
        blank += P['daily_blank']
        if day % 7 == 0: blank += P['weekly_blank']; gems += 60
        cd = (day - 1) % 7; blank += P['cal_blank'].get(cd, 0); cards += P['cal_cards'].get(cd, 0); gems += 100 if cd == 6 else 0
        # story goals as they come
        for g, n in STORYGOALS.items():
            when = {'friends6': len(own) >= 6, 'yard': cleared >= 5, 'pond': cleared >= 10, 'hard': cleared >= 12, 'chapter4': cleared >= 15, 'chapter8': cleared >= 35, 'reacts': day >= 7}[g]
            if when and g not in got: got.add(g); blank += n
        # gems to cards
        while gems * P['gem_share'] >= P['card_gems']: gems -= P['card_gems'] / P['gem_share']; cards += 1
        # spend cards: friend pages for the next locked friend when offered (60%), else Blank pages
        while cards > 0:
            cards -= 1; o = order()
            if o and rnd.random() < .6: k = o[0]; add(k, P['card_friend'][1] if tier(k) >= 2 else P['card_friend'][0], day)
            else: blank += P['card_blank']
        # Blank pages: next locked new friend first, then stars on a favourite (the first friend), then anyone
        o = [k for k in order() if k in NEW]
        while blank > 0 and o:
            k = o[0]; need = P['tier_pages'][tier(k)] - pages.get(k, 0); n = min(blank, need); blank -= n; add(k, n, day); o = [k for k in order() if k in NEW]
        # stars: the favourite first, but only once every new friend has joined (otherwise Blank pages wait for them)
        if not [k for k in order() if k in NEW]:
            for k in ['hopper'] + [k for k in own if k != 'hopper']:
                while k in own and stars[k] < 5:
                    c = P['star_cost'][stars[k]] - pages.get(k, 0)
                    if blank < c: break
                    blank -= max(0, c); pages[k] = max(0, pages.get(k, 0) - P['star_cost'][stars[k]]); stars[k] += 1
                if k == 'hopper' and stars.get('hopper') == 5 and fav_day5 is None: fav_day5 = day
                if k == 'hopper' and stars.get('hopper', 0) < 5: break  # save up for the favourite
        if day == 30: s30 = sum(stars.values())
    return joined_day, fav_day5, s30, sum(stars.values()), stars.get('hopper')
R = [run(s) for s in range(40)]
for k in NEW: d = [r[0].get(k, 999) for r in R]; print(f'{k:9s} joins day {statistics.median(d):>5}  (earliest {min(d)}, latest {max(d)})')
print('favourite at ★5 on day', statistics.median([r[1] or 999 for r in R]), ' favourite stars day 90:', statistics.median([r[4] for r in R]))
print('total stars on day 30:', statistics.median([r[2] for r in R]), ' day 90:', statistics.median([r[3] for r in R]), ' of', 16 * 5)
