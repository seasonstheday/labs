# Lens balance

**Short version:** the lens wasn't deciding runs through its numbers. It was a bug. Every time Dad's lens fires, it starts a 0.42 s wind-up, and while that wind-up plays Dad can't use any other move. The game also checks the lens before Dad Joke each frame. So when a lens's cooldown is shorter than the wind-up (cooldown × Dad's Quick multiplier, cdMul), the lens is always ready first and **Dad Joke never fires**. That happened to Classic, Long and Bubble. Dad Joke stuns every myth in the ring, and late in the game it goes off about 18 times a minute. It is the strongest defence in the game. The slow lenses (Halo, Glare, Ricochet, Burning Glass) left room for it; the fast ones didn't.

| Dad Jokes per minute (typical save, st 74-75) | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning |
|---|---|---|---|---|---|---|---|
| before | 0.2 | 14.6 | 19.1 | 0.8 | 18.5 | 0.0 | 19.2 |
| after the patch (all 27 saves) | 18.6 | 17.8 | 16.6 | 18.2 | 19.4 | 18.5 | 18.2 |

This explains every earlier finding: Bubble and Classic were weak, crowd lenses were strong, and Balloon won at half the Power. The one Bubble/Classic buff round made it worse, because it made those lenses faster. With the joke fixed, the lenses still differed, but only by numbers. Ten number changes close that gap. Each lens keeps its identity.

## Method

- **Tool:** `defender/tools/lens_duel.mjs` (new). It takes the arrival saves `balance_sim.mjs --snaps` writes and replays each stage with each of the 7 lenses.
  - Only `save.weapon` changes. `dadTheme` is cleared; the gear item, ranks, stars, party, Skill Trees and the level-up AI stay the same. So every lens gets the same save, rank and gear.
  - Each try is a first try. The tool also records Dad's share of all damage, Dad Joke casts, and Patience lost by source (melee, ranged, boss, elite).
  - It takes `--patch` and `--tune` like the sim. Run: `node defender/tools/lens_duel.mjs --snaps=DIR --profiles=weak,typical,strong --stages=34,35,36,54,55,56,74,75,76 --n=3 [--patch=reports/img/lens_patch.json] [--tune='{"hp":3}']`.
- **Saves:** three careers (`weak`, `typical`, `strong`; `balance_sim --book2 --n=1 --snaps`), stages 34-36 (Book 1 late), 54-56 (Book 2 mid) and 74-76 (Book 2 late). That's 27 saves; 35, 55 and 75 are chapter bosses.
  - The careers held Long (typical, weak) and Classic (strong). Power: weak 7.1k-11.2k (about recPower), typical 14.7k-20.2k, strong 13.9k-16.6k.
- **Two conditions:**
  1. **Game tuning:** as shipped. After the fix nearly every lens wins nearly every stage with 95-100% Patience, so this condition can't tell the lenses apart.
  2. **Stress**, to rank them. `TUNE` hp/dmg was raised to 5.5/2.0 at st 34-36, 4.0/1.5 at st 54-56 and 3.0/1.3 at st 74-76, so a typical lens sits around 80% Patience and some tries lose. **All number tuning was done under stress.** That is the condition that matters once Book 2 difficulty is raised again (see Caveats).
- **Ablations** (stress, with the fix):
  - **Burning Glass:** halving its damage changed nothing (97). Removing its shove fell to 83, removing its puddle to 84, removing its slow to 91. Its value is crowd control, not damage.
  - **Long Lens:** double damage gave only +10. Half cooldown +4. Pierce 6 did nothing. A small shove gave +17. Patience goes to melee myths at Dad's feet, so lenses that push or slow win, and raw damage helps little.
  - **Dad Joke:** a first version of the fix only let the joke go first when it was already ready. Slow lenses still got about 16% more jokes, because a fast lens's wind-up delays the joke. The final fix looks one wind-up (0.42 s) ahead.
- **Iterations:** six rounds (v1-v6), 3-4 tries per save per lens. Noise: one lens's mean over one checkpoint group moves about ±8 between identical runs, so per-checkpoint spreads under about 15-20 are within noise.

## Results: same save, each lens

Each cell is the mean over 9 saves per checkpoint (27 for "all"). Patience left counts a loss as 0.

### Game tuning: before (current index.html)
| checkpoint | metric | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning | spread |
|---|---|---|---|---|---|---|---|---|---|
| Book 1 late (st 34-36) | Patience left | 99 | 100 | 100 | 99 | 96 | 89 | 99 | 11 |
| Book 1 late (st 34-36) | first-try win % | 100 | 100 | 100 | 100 | 96 | 96 | 100 | 4 |
| Book 2 mid (st 54-56) | Patience left | 76 | 96 | 100 | 40 | 92 | 53 | 100 | 60 |
| Book 2 mid (st 54-56) | first-try win % | 84 | 96 | 100 | 55 | 93 | 64 | 100 | 45 |
| Book 2 late (st 74-76) | Patience left | 18 | 99 | 96 | 2 | 90 | 6 | 100 | 98 |
| Book 2 late (st 74-76) | first-try win % | 22 | 100 | 98 | 2 | 90 | 7 | 100 | 98 |
| **all** | Patience left | 64 | 98 | 99 | 47 | 93 | 49 | 100 | 52 |
| **all** | first-try win % | 69 | 99 | 99 | 52 | 93 | 56 | 100 | 48 |

### Game tuning: after (lens_patch.json)
| checkpoint | metric | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning | spread |
|---|---|---|---|---|---|---|---|---|---|
| Book 1 late (st 34-36) | Patience left | 100 | 100 | 99 | 100 | 100 | 99 | 100 | 0 |
| Book 1 late (st 34-36) | first-try win % | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 0 |
| Book 2 mid (st 54-56) | Patience left | 100 | 100 | 96 | 100 | 100 | 99 | 97 | 4 |
| Book 2 mid (st 54-56) | first-try win % | 100 | 100 | 100 | 100 | 100 | 100 | 100 | 0 |
| Book 2 late (st 74-76) | Patience left | 99 | 96 | 100 | 98 | 99 | 87 | 96 | 13 |
| Book 2 late (st 74-76) | first-try win % | 100 | 96 | 100 | 100 | 100 | 89 | 96 | 11 |
| **all** | Patience left | 100 | 99 | 98 | 99 | 100 | 95 | 98 | 4 |
| **all** | first-try win % | 100 | 99 | 100 | 100 | 100 | 96 | 99 | 4 |

### Stress: before (current index.html)
| checkpoint | metric | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning | spread |
|---|---|---|---|---|---|---|---|---|---|
| Book 1 late (st 34-36) | Patience left | 40 | 60 | 85 | 12 | 78 | 10 | 85 | 75 |
| Book 1 late (st 34-36) | first-try win % | 48 | 63 | 89 | 29 | 81 | 15 | 89 | 74 |
| Book 2 mid (st 54-56) | Patience left | 9 | 81 | 85 | 2 | 79 | 4 | 98 | 97 |
| Book 2 mid (st 54-56) | first-try win % | 26 | 89 | 93 | 4 | 85 | 4 | 100 | 96 |
| Book 2 late (st 74-76) | Patience left | 0 | 69 | 65 | 4 | 91 | 0 | 89 | 91 |
| Book 2 late (st 74-76) | first-try win % | 0 | 70 | 70 | 4 | 96 | 0 | 89 | 96 |
| **all** | Patience left | 16 | 70 | 78 | 6 | 83 | 5 | 91 | 86 |
| **all** | first-try win % | 25 | 74 | 84 | 12 | 88 | 6 | 93 | 86 |

### Stress: Dad Joke fix only (edit 1, no number changes)
| checkpoint | metric | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning | spread |
|---|---|---|---|---|---|---|---|---|---|
| Book 1 late (st 34-36) | Patience left | 82 | 83 | 78 | 50 | 83 | 62 | 88 | 37 |
| Book 1 late (st 34-36) | first-try win % | 89 | 89 | 78 | 61 | 89 | 72 | 89 | 28 |
| Book 2 mid (st 54-56) | Patience left | 82 | 86 | 90 | 62 | 88 | 73 | 98 | 36 |
| Book 2 mid (st 54-56) | first-try win % | 89 | 89 | 100 | 67 | 89 | 78 | 100 | 33 |
| Book 2 late (st 74-76) | Patience left | 84 | 60 | 67 | 78 | 97 | 85 | 100 | 40 |
| Book 2 late (st 74-76) | first-try win % | 89 | 61 | 67 | 78 | 100 | 94 | 100 | 39 |
| **all** | Patience left | 82 | 76 | 78 | 63 | 89 | 73 | 95 | 32 |
| **all** | first-try win % | 89 | 80 | 81 | 69 | 93 | 81 | 96 | 28 |

### Stress: after (all 11 edits; final verification run, n=4)
| checkpoint | metric | Classic | Halo | Glare | Long | Ricochet | Bubble | Burning | spread |
|---|---|---|---|---|---|---|---|---|---|
| Book 1 late (st 34-36) | Patience left | 86 | 84 | 82 | 79 | 72 | 85 | 84 | 14 |
| Book 1 late (st 34-36) | first-try win % | 94 | 86 | 83 | 86 | 81 | 92 | 89 | 14 |
| Book 2 mid (st 54-56) | Patience left | 93 | 83 | 84 | 83 | 94 | 79 | 97 | 17 |
| Book 2 mid (st 54-56) | first-try win % | 94 | 89 | 89 | 89 | 97 | 86 | 100 | 14 |
| Book 2 late (st 74-76) | Patience left | 82 | 77 | 83 | 88 | 82 | 79 | 80 | 11 |
| Book 2 late (st 74-76) | first-try win % | 86 | 78 | 83 | 89 | 86 | 83 | 81 | 11 |
| **all** | Patience left | 87 | 81 | 83 | 83 | 83 | 81 | 87 | 6 |
| **all** | first-try win % | 92 | 84 | 85 | 88 | 88 | 87 | 90 | 7 |

**Final spread, with the patch:**
- **Game tuning:** every lens is within 13 Patience points and 11 win points at every checkpoint. Over all saves the spread is 4 and 4. Before, it was 98 and 98 at Book 2 late.
- **Stress:** 14 / 17 / 11 Patience points and 14 / 14 / 11 win points at the three checkpoints; 6 and 7 over all saves. Before, it was 75-97. Every lens wins the same stages, within noise.

## What changed (and why)

- **Dad Joke starvation (edit 1).** This is the one change to behaviour. It applies only to the ability called `weapon`, which only Dad has; friends are untouched.
- **Weak lenses up:**
  - **Long Lens:** damage about +30%, plus a small shove (30, like Ricochet). It had no crowd control at all and lost even with double damage.
  - **Bubble:** damage about +11%, and Dad's bubbles slow for 2.5 s instead of 2 s (Goldie's stay at 2 s).
  - **Halo:** about 10% faster, damage +7%, its second halo arrives a rank earlier, and its bonk goes from 40 to 60, so it flips Hardcovers.
- **Strong lenses down:**
  - **Burning Glass:** cooldown +15%, splash radius -9%, shove 60 → 30, puddle 3.5 s → 2 s at 70% speed (was 55%). These touch only the sunspot (`s.sun`); Pip's shell, which shares the shot code, is unchanged.
  - **Glare:** knockback 160 → 135.
- **Classic and Ricochet** are unchanged.

## powerOf()

- No lens factor is needed. Once the joke bug is fixed, the lenses land within about 6 points of each other at equal Power, which is inside the noise, so a per-lens factor in powerOf() would just encode noise. powerOf()'s "needs" estimate is honest again with the patch.
- Without the patch the gap was decisive: Classic, Long and Bubble lost stages that Burning Glass won at 100%. No small factor could have covered that.

## Caveats and follow-ups

- **The game gets easier for half the players.**
  - Holders of Classic, Long and Bubble now get Dad Joke, which they never had. The `typical` career held Long and walled from stage 55 on. With the patch, its saves at 55 and 74-76 win with every lens.
  - With the patch, all 27 test saves win almost everything at shipped tuning, weak saves at about recPower included.
  - The Book 2 curve from `book2_balance_round2.json` was measured with lens-dependent jokes. Re-run `balance_sim.mjs --book2 --patch=reports/img/lens_patch.json` and retune `TUNE` and Book 2 numbers after applying it.
- **Dad Joke is the real balance lever.** It fires about every 3.3 s late in the game: cooldown 8-4 s × Quick, and each joke stuns the whole ring for 1.2 s or more. That is close to permanent crowd control. It deserves its own look. The lens numbers here were balanced with the joke working, so they hold if the joke is toned down evenly for everyone.
- **Not tested here:** evolved lenses (ranks rarely reach 5 inside a run, mean end rank 2.2-2.6), themed lens variants (`dadTheme` was cleared), and Book 1 before stage 34. `strip()` shows the new cd/dmg automatically. No `desc` or `WINFO` text needed changing.

## Files

- `reports/img/lens_patch.json`: the 11 edits in the `--patch` format. All 11 apply exactly once each to the current `index.html`, and the patched script passes `node --check`.
- `reports/img/lens_duel.json`: duel summaries for every table above.
- `defender/tools/lens_duel.mjs`: the duel tool.

## The edits ([old, new], in order)

1. Bug fix (behaviour): Dad's lens no longer starves Dad Joke. The lens waits while another of Dad's actives is ready or will be within one wind-up (0.42 s).

   ```
   old:       if (m.cds[a] <= 0 && !m.anim) { const D = a === 'weapon'
   new:       if (m.cds[a] <= 0 && !m.anim && !(a === 'weapon' && CHARS[m.id].abil.some(b => b !== a && m.ranks[b] && !ABIL[b].passive && m.cds[b] <= .42))) { const D = a === 'weapon'
   ```

2. Halo: cd -10%, dmg +7%, a second halo one rank earlier (n 1,1,2,2,3 -> 1,2,2,3,4).

   ```
   old: yoyo: { em: '💫', name: 'Halo Lens', desc: 'A ring of light flies out, bonks everything and comes back.', cd: [1.6, 1.45, 1.3, 1.1, .9], dmg: [14, 17, 20, 25, 30], n: [1, 1, 2, 2, 3] },
   new: yoyo: { em: '💫', name: 'Halo Lens', desc: 'A ring of light flies out, bonks everything and comes back.', cd: [1.45, 1.3, 1.15, 1.0, .82], dmg: [15, 18, 22, 27, 32], n: [1, 2, 2, 3, 4] },
   ```

3. Long Lens: dmg +30%.

   ```
   old: plane: { em: '🔭', name: 'Long Lens', desc: 'A dart of light that zips through a whole line.', cd: [1.0, .9, .8, .7, .6],     dmg: [9, 11, 14, 17, 20],  n: [1, 2, 2, 3, 4] },
   new: plane: { em: '🔭', name: 'Long Lens', desc: 'A dart of light that zips through a whole line.', cd: [1.0, .9, .8, .7, .6],     dmg: [12, 15, 18, 22, 26],  n: [1, 2, 2, 3, 4] },
   ```

4. Bubble: dmg +11%.

   ```
   old: bubble: { em: '🫧', name: 'Bubble Lens', desc: 'Floaty bubbles that slow myths down.', cd: [.7, .62, .55, .48, .42],  dmg: [25, 31, 39, 48, 59],   n: [1, 2, 2, 3, 4] },
   new: bubble: { em: '🫧', name: 'Bubble Lens', desc: 'Floaty bubbles that slow myths down.', cd: [.7, .62, .55, .48, .42],  dmg: [28, 35, 43, 53, 65],   n: [1, 2, 2, 3, 4] },
   ```

5. Burning Glass: cd +15%, splash radius -9%.

   ```
   old: balloon: { em: '☀️', name: 'Burning Glass', desc: 'A hot sunspot lobbed at a crowd. Splash!', cd: [2.0, 1.8, 1.6, 1.4, 1.15], dmg: [14, 18, 21, 27, 33], n: [60, 66, 72, 80, 92] },
   new: balloon: { em: '☀️', name: 'Burning Glass', desc: 'A hot sunspot lobbed at a crowd. Splash!', cd: [2.3, 2.05, 1.85, 1.6, 1.35], dmg: [14, 18, 21, 27, 33], n: [54, 60, 66, 72, 84] },
   ```

6. Long Lens darts give a small shove (knock 0 -> 30, same as Ricochet).

   ```
   old: if (s.k === 'plane') { for (const e of G.enemies) if (e.hp > 0 && !s.hitset.has(e) && dist(e, s) < e.r + 10) { s.hitset.add(e); hurt(e, s.dmg);
   new: if (s.k === 'plane') { for (const e of G.enemies) if (e.hp > 0 && !s.hitset.has(e) && dist(e, s) < e.r + 10) { s.hitset.add(e); hurt(e, s.dmg, 30);
   ```

7. Burning Glass shove 60 -> 30 (only the sunspot: `s.sun`; Pip's shell keeps 60).

   ```
   old: hurt(e, s.dmg, s.knock || 60,
   new: hurt(e, s.dmg, s.knock || (s.sun ? 30 : 60),
   ```

8. Burning Glass puddle: 3.5 s -> 2 s and slows to 70% instead of 55% (sunspot only; Pip's shell is unchanged).

   ```
   old: G.traps.push({ x: s.tx, y: s.ty, r: s.R * .9, t: 0, life: 3.5, mul: .55, puddle: true
   new: G.traps.push({ x: s.tx, y: s.ty, r: s.R * .9, t: 0, life: s.sun ? 2 : 3.5, mul: s.sun ? .7 : .55, puddle: true
   ```

9. Halo bonk 40 -> 60 (now flips Hardcovers like the other crowd lenses).

   ```
   old: { s.hitset.add(e); hurt(e, s.dmg, 40); }
   new: { s.hitset.add(e); hurt(e, s.dmg, 60); }
   ```

10. Glare knockback 160 -> 135.

   ```
   old: if (ev || Math.abs(da) < 1.35) hurt(e, dmg, 160, m);
   new: if (ev || Math.abs(da) < 1.35) hurt(e, dmg, 135, m);
   ```

11. Bubble Lens slow 2 s -> 2.5 s (only Dad's bubbles, which have no `s.m`; Goldie's bubbles keep 2 s).

   ```
   old: hurt(e, s.dmg, 0, s.m || G.dad); e.slow = 2; s.dead = true;
   new: hurt(e, s.dmg, 0, s.m || G.dad); e.slow = s.m ? 2 : 2.5; s.dead = true;
   ```

