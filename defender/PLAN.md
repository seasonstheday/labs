# Why, Dad? Defender — build plan

Source: `reports/Arena defense genre player feedback.md` (Priority 1 and 2 rows), plus two
asks from the show: tougher, more varied creeps, and an overarching story.

Each phase is one PR, in order. Phases A and B are the research's Priority 1/2 rows;
C is creeps; D is story and worlds; E ties the Fact Book into play; F is polish.

---

## Phase A — Safe to ship (Priority 1)

Nothing here changes how the game plays; it changes what it can never become.

1. **Remove the "buy gems" placeholder.** Gems stay earned-only (daily, first clears,
   world clears). Keep the gem → coin exchange.
2. **No real-money path to randomness.** Store sells chests and Library Cards for
   earned currency only. If/when there is IAP, it is deterministic: a full unlock,
   named companion packs, Dad outfits — behind a parental gate (adult-level task,
   voiced for pre-readers via Web Speech).
3. **Show the odds.** Draw screen and Fact Book state the draw chances and the
   every-5th guarantee in plain words ("3 in 10 draws is a friend. Never more than
   5 draws between friends."). A free probability lesson.
4. **Deterministic unlock path beside draws.** Each companion also unlocks by a
   Fact Book milestone or a world clear (e.g. Hopper joins when you've busted every
   myth in the Pond world). Draws become the fast path, not the only path.
5. **Calendar with no hard reset.** Claim the next day whenever you return. Best
   rewards on days 2–5. No "you missed it" text.
6. **No analytics, no ad SDK, offline-first.** Already true; keep it true. Add a
   plain-language privacy note in Settings ("This game keeps everything on your
   device.").
7. **Store page copy** never claims learning outcomes; it says what the game does
   (every popped myth becomes a real fact in your Fact Book).

## Phase B — The loop (Priority 2)

1. **Skip/reroll on level-up cards**: two per match, shown as a small stack of
   "Nope" cards. Scarce, so the choice stays meaningful.
2. **Ability evolutions.** Rank 5 of a primary ability transforms it (new look, new
   behaviour): Truth Beam → Spotlight (sweeping beam), Web Shot → Web Net (hits
   three), Zap → Thunderclap (chain never breaks), Tongue Lash → Lasso (pulls),
   Quack → Honk (knocks everything in the ring). Banner + slow-mo on first evolve.
3. **Synergy badges.** Party screen shows "work well together" pairs (Webster's
   slow + Sparky's glow; Hopper's knockback + Dad's bat). Small, honest, legible.
4. **Retry from the current wave.** On defeat: "Try that wave again" keeps ranks
   and items; coins for the match so far are banked. Full restart stays as an
   option. A loss always pays something.
5. **Replace waiting with doing.** The attention ring stays as the targeting rule,
   but tapping a myth outside it makes Dad shout "Hey, you!": it hurries in and is
   marked (the existing focus). Tapping the lawn between waves starts the next wave
   early. Pause button between waves is explicit.
6. **"Little Kid" toggle** in Settings and on the pause screen, changeable
   mid-match without losing progress: myths 35% slower, Patience never drops below
   1 (Dad "needs a snack" instead of a nap, wave restarts), facts read aloud.
7. **Generous early tuning and boss telegraphs.** Stage 1–2 bosses announce their
   next move with a wind-up ring; first boss of each world has a visible "weak spot".
   Slow-mo pop on every boss, confetti of true pages.
8. **Cap permanent ranks** so cards keep mattering: Power/Quick ranks top out at
   +40% total, and later worlds scale past that on purpose.

## Phase C — Step up the creeps

Today every myth is one of five kinds. Add behaviours, elites and boss phases so
reading the screen matters.

New myth behaviours (each introduced by a world, see D):

| Kind | Look | Behaviour | Counter |
|---|---|---|---|
| Dasher | thin paperback | walks, pauses, then charges the last 120px | knockback or stun during the pause |
| Hardcover | thick book, spine forward | front takes 70% less; flips when knocked back | bat, quack, Hopper's hop |
| Flyer | paper plane / bat | ignores traps and the Bedtime Story aura; dips in and out | ranged only; Sparky's zap chains to flyers |
| Rumour | faded, half-transparent | invisible outside the ring; appears late | wide-area abilities; Eight Eyes reveals early |
| Thesaurus | fat purple book | heals myths around it ("…also, in other words…") | focus-tap it first |
| Gossip | sticky note | jumps onto a companion and mutes it for 3s | Dad's joke shakes it off |
| Swarm | stack of index cards | 6 tiny fast ones | AoE: balloons, quack, Big Hop |

Elites: any myth can spawn as an elite (bigger, crowned, 3× HP, drops a guaranteed
Rare+ item). One per wave from world 3 on.

Boss phases: every boss gets a phase 2 at 50% HP with one new move (shield that must
be knocked off, summons a swarm, a charge that must be dodged by… nobody, so it
costs Patience unless stunned). Phase change is telegraphed with a line of dialogue.

Spawn director: waves mix kinds deliberately (a Thesaurus behind two Hardcovers)
instead of random picks from a pool. Entity cap of ~40 on screen for frame rate.

## Phase C2 — Classes and gear

Decisions (2026-10-11): family game, 4+ rating, NOT the Kids Category (keeps
rewarded ads and gated IAP possible); 3★ = Patience never dropped; the Kid is
"the Kid" with placeholder art.

1. **Classes**, library-themed, with a legible rock-paper-scissors against creep
   kinds. Each class card shows ✓ strong against / ✗ weak against.

   | Class | Who | Role | Strong vs | Weak vs |
   |---|---|---|---|---|
   | 🔍 Detective | Dad | single target, finds weak spots | Hardcover, Rumour | Swarm |
   | 🕸️ Trapper | Webster | control, slows and traps | Dasher, Swarm | Flyer |
   | ⚡ Spark | Sparky | chains, hits many | Flyer, Swarm | Hardcover |
   | 🎵 Bard | Hopper | support, heals Patience, knockback | Gossip | Dasher |
   | 📣 Herald | Puddles | shoves, breaks escorts | Healer escorts | Rumour |

   Strong = +35% damage and the counter effect (Detective flips Hardcovers on hit;
   Spark's chain always jumps to Flyers). Weak = −20%. Shown as a floating "✓" or
   "✗" on the first hit of each kind in a match.
2. **Weapon clarity.** Every weapon shows a stat strip: Power · Rate · Reach · Hits ·
   Effect, plus one line "Best against …". Same strip on level-up cards.
3. **Per-character weapon lines.** Dad: garage tools (today's seven). Webster:
   fangs (Sticky, Needle, Venom-free "Tickle", Hook). Sparky: lanterns (Jar,
   Beacon, Strobe). Hopper: lily pads (Bouncy, Wide, Heavy). Puddles: feathers
   (Down, Quill, Flight). Each variant moves two attributes in opposite
   directions (e.g. Needle: +Power −Hits), so there is a real choice.
4. **Bookmarks** (our runes). Weapons, armor and books get 1–3 bookmark slots by
   rarity. Bookmark types: 🔖 Red (Power), Blue (Rate), Green (Reach), Gold
   (Coins), Purple (Crit), Silver (Patience). A bookmark can be moved between
   items for a small coin fee.
5. **Rewarded-ad hooks** (hidden until an ad provider exists in the native build,
   and always behind an adult gate): +1 Reading Room run, +20 gems once a day.
   No ad SDK in the web build.

## Phase C3 — The Reading Room (mini-game)

Unlocks when the party reaches level 10 (total ranks bought). The hook:
**"Myth or Fact?" boss duels.** One big boss, no waves. Between its phases the
Kid holds up a card ("Myth or fact: lightning never strikes the same place
twice?"); a right answer stuns the boss and opens a weak spot for 5s, a wrong
answer just shows the fact, kindly. Questions come only from facts already in
the Diary, so it is review, not a test. Clearing drops a bookmark of a type the
player picks, plus coins. **3 runs per 12 hours**, timer visible, no streak,
never a nag.

## Phase D — Story and worlds

**Shipped in PR 12 (D2):** eight chapters of five stages (stage 3 a rough draft of the chapter boss, stage 5 the real one, page stages end in an elite rush), 45 new myths, five native friends (Dusty, Pip, Scuttle, Nilla, Luna) with three abilities, a class, a weapon line and evolutions each, in/out comics per chapter, the scrolling chapter map, and a Fact Book grouped by chapter. Difficulty now scales by the stage's index (0–39) with a gentler curve.

**Shipped in PR 11 (D1):** the map screen, Easy/Normal/Hard (Hard after a Normal clear), stars per stage per difficulty, Hard pays 1.5× coins and a one-time 💎20 + Library Card. D2 adds the worlds.

**Decisions (2026-10-11):** world map first, a Time Machine map in a later update; the story is told by Dad and the Kid in 3-panel comics (Kid sprite is a placeholder until drawn in the mascot style).

**Premise.** The Big Book of Wrong, a grumpy old encyclopedia of everything people
used to believe, blew open in the library window. Its pages scattered across the
world, and every page landed somewhere and started marching around insisting it's
true. Dad and the kid set off to pop every page back into a fact. Each world is a
chapter; the final boss is the Book itself.

**Worlds** (8, each 5 short stages + boss; stages 3–5 minutes). Each world brings:
a palette, 6 new myths, one new creep behaviour, one native companion (unlockable
by draw or by clearing the world), and a 3-panel comic in/out.

| # | World | Myths about | New creep | Native companion |
|---|---|---|---|---|
| 1 | The Backyard | garden & home | — (tutorial) | Webster the spider |
| 2 | The Pond | frogs, ducks, fish | Dasher | Hopper the toad |
| 3 | The Library | books, brains, words | Hardcover, Thesaurus | Dusty the bookworm |
| 4 | The Ocean | sharks, whales, tides | Flyer (gulls) | Pip the hermit crab |
| 5 | The Desert | camels, pyramids, heat | Rumour (mirages) | Scuttle the beetle |
| 6 | The Arctic | polar bears, penguins, cold | Gossip | Nilla the snowy owl |
| 7 | The Jungle | monkeys, lightning, rain | Swarm | Sparky the firefly |
| 8 | The Night Sky | moon, stars, flat earth | all, elites | Luna the moth |

World map on the title screen: the Big Book's torn-out pages scattered over a
hand-drawn map; each world a region, each stage a pin. Beaten stages stay
tappable to replay. Each stage has three difficulties (Easy / Normal / Hard,
unlocked in order) and up to three stars per difficulty: 1★ cleared, 2★ Patience
above half at the end, 3★ Patience never dropped. Stars show on the pin; world
star totals unlock the native companion and a world trait.
Dialogue is short, voiced via Web Speech with a toggle, and skippable with one tap.

Myth bank: 48 myths (we have 20). Each world's six are written to the age band and
checked against a reputable source before shipping; the Fact Book cites it.

## Phase E — Facts in play (intrinsic integration)

**Shipped in PR 13:** known-fact weak spots (+25%), the Kid's Diary by topic and by chapter with learned dates and sources, 💎2 per fact, a Library Card per finished topic, a chapter trait per mastered chapter, a Diary coin multiplier (+1% per fact), daily Study time (+🪙40), the optional Pop Quiz on the clear screen. Also the **friend level and skill tree**: XP per match, abilities unlock at levels 1/2/4 and the pair-up at 6, three coin upgrades per ability (wider, longer, stronger), skill icons with cooldowns in the HUD, and a stat summary per character on the Party screen.

1. **"You know this one!"** A myth type whose fact is in the Fact Book spawns with
   its weak spot shown and takes +25% damage. Learning is the power-up.
2. **World mastery.** Busting all six myths in a world grants a world trait
   (Pond: companions +1 rank on slows; Arctic: Patience +20) and unlocks the native
   companion.
3. **Fact reveal at rest points only**: card reveal, stage end, Fact Book. Never
   mid-wave, never a gate.
4. **The Diary.** The Fact Book becomes a diary, organised by category (Animals,
   Body, Sky & Space, Weather, Food, History, Words) and by world, with a per-category
   progress ring, the date each fact was learned, and the source it came from.
   Facts are written in the Kid's voice ("Dad says…") so it reads like a journal.
5. **Facts feed the economy.** Every fact learned pays a one-time 💎 bonus; every
   full category pays a Library Card; the diary's completion percent sets a
   permanent coin multiplier (+1% per fact). "Study time": once a day the Kid can
   re-read a category in the diary for a small coin reward, so revisiting facts is
   worth something but never required.
6. **Pop Quiz (later, optional).** At rest points only (stage end, daily visit), the
   Kid offers one voiced multiple-choice question drawn from facts already in the
   diary. Right or wrong, play continues; a right answer adds a bonus (coins, a
   chest, an item), a wrong answer shows the fact again, kindly, with no penalty.
   Never a gate, never mid-wave, always skippable, questions only about things the
   player has already seen. Ships after D so the question bank matches the worlds.

## Phase G — 3D characters (in progress)

**Decision (2026-10-14): go 3D.** Bodies come from Meshy image-to-3D of the game's own art (`defender/tools/meshy_test.py`), rendered to toon-outlined sprite sheets with per-frame bone anchors (`defender/tools/render_sheet.mjs`, assets in `defender/assets/3d/`). One body per character; hats, glasses and weapons are drawn by the game at the head and hand anchors, so gear fits every pose. Dad and the Kid are rigged (idle, walk, throw); the nine friends are static models animated by the code's hop, bob and squash. Shipped in PR 17: the pipeline, the player and the first full set. PR 18 tuned gear sizes per character and added the vest tint. PR 19 locked the gear down: the seven weapons, the Dad Joke drum and one prop per friend's weapon line are modelled from primitives and rendered with the same toon look (`defender/tools/render_props.mjs` → `assets/3d/props.png|json`, 8 directions, grip point per cell); Dad holds his weapon at rest, swings or throws it on the wind-up, and the friends carry their line's prop (tinted per variant). Glasses sit on each friend's eye line, caps face the way the head faces, Dad's vest is a V-necked shape on the body copy, the friends' vest is a neckerchief. Still to do: a walk for Dad if he ever moves.

**Decision (2026-10-15): gear stays off the bodies.** Fitting hats, glasses and vests to eleven different bodies was never going to look right, so armor is equipped and counted, not drawn. Dad's weapon and the friends' props (rendered from 3D, `render_props.mjs`) stay in hand. The item system got the depth instead: 14 bases per slot with a line each, extra stats on Rare and up, nine named Legendaries.

## Phase H — Creeps and bosses (in progress)

**Shipped in PR 19:** a move for every chapter boss with a tell that a stun cancels (`BOSSMOVE`): the Wall bricks up the ring, Eight Spiders sends eight at once, the Boiling Frog warms the ring until it's hit, the Ten-Percent Brain fogs the ring smaller, the Triangle blinks away and brings friends, the Always-Hot Desert throws mirages and a heat wave, the Penguin slides through and frosts friends, the Storm marks spots and strikes them twice, the Flat Earth flips the yard. Each boss carries its own look on the tome. **Shipped in PR 20:** every creep kind and every boss as a 3D model (Gemini concept → Meshy → sheet; `tools/gen_creeps.py`, `meshy_batch.py`, `render_all.sh`), tinted per myth in the game, with the old drawings kept only as a fallback. That used 600 Meshy credits (30 per model; the monthly 572 reset on 6 Nov, 72 permanent remain). **Shipped in PR 21:** chapter variants (`VARIANT`): every chapter after the Backyard mixes its own colour into its myths and gives them one readable habit (Soggy, Well-read, Salty, Sunbaked, Frosty, Wild, Starry), shown on the stage card and as a hint the first time. Damage numbers are bigger. Next: elite affixes, and a frame-rate pass on a phone now that every sprite is a sheet.

## Phase F — Polish and accessibility

**Shipped in PR 14:** offline first (service worker caches the game and its art, network-first for the page so new builds arrive), home-screen install (manifest, icons), safe-area aware scaling, Calm screen (no blink, no shake, no bouncy animations), Bigger text, Read buttons aloud (every button, pin and card says its name), a private-by-design note in Settings, and a frame-rate guard that trims particles when a device falls behind (fps readout under `?debug`). Still to do on a real device: a frame-rate pass on an older iPhone.

Flashing/shake toggles, text at a 7-year-old reading level, voiced labels for the
six title buttons, big tap targets off the bottom edge, settings remembered,
offline check, entity cap, frame-rate test on an older iPhone.

---

## Order and rough size

| Phase | Size | Ships as |
|---|---|---|
| A | small | PR 6 |
| B | medium | PR 7 |
| C | medium | PR 8 |
| C2 | medium | PR 9 |
| C3 | medium | PR 10 |
| D1 | medium (map, difficulty, stars) | PR 11 |
| D2 | large (8 worlds, 28 myths, companions, comics) | PR 12 |
| E | small | PR 13 |
| F | small | PR 14 (done) |
