# Economy, stores, creeps and dialog: deep dive (build 98)

There are four parts:
1. what stages pay and what the stores cost;
2. how other games build their stores, and what makes items worth wanting;
3. creep animation and attack feel;
4. text, dialog boxes, colours and fonts.

Each part ends with what shipped in build 98 and what is still a recommendation.

## 1. What a stage pays, and where it goes

**Coins per clear** (from `payout()` and the typical player's balance-sim run):

| Stage | Myths popped | Coins for the clear | Running total of first clears |
|---|---|---|---|
| 1 | 42 | ~120 | 120 |
| 10 | 219 | ~570 | 3,350 |
| 20 | 259 | ~880 | 9,400 |
| 39 (end of Book 1) | 343 | ~1,630 | 29,000 |
| 60 | 376 | ~2,330 | 63,700 |
| 79 (end of Book 2) | 334 | ~2,910 | 107,000 |

- Coins are paid on **every** clear, not only the first. A replay pays almost the same as a first clear.
- **Gems** come only from first clears, new stars, Hard and Myth Master firsts, and facts. That is about 15 + 3 per level, +10 for a boss.
- Patrols, the wheel, the daily gift and missions add roughly another day's worth of coins every three stages.

**Where coins go:**
- **Power** (ranks, skill picks, polish): about 37,000 coins.
  - The sim shows a typical player's wallet stuck at roughly 150–200 coins from stage 1 to about stage 25: every coin goes on power.
  - After stage 25 the wallet sits at the sim's 2,000 reserve and the extra goes on Library Cards. **Late game, coins have little left to buy.**
- **Wardrobe:** about 73,000 coins for the full ladder (sweaters 600–3,000, hats 1,000–10,000, team hats 1,500–8,000, yard 800–8,000). That is about 2.5× everything Book 1 pays and about 0.7× both books. It is a good long-term sink, but:
  - **Before stage 25 a child can't afford any of it** without giving up power.
  - The prices span 17× (600 to 10,000), against the 1:3:5 steps most stores use.
- **Gem store:** Backpack (60), Library Card (50), Pocket Money. This is fine while gems can only be earned (see the pitfall below).

**Conclusions:**
1. Early on, the only thing worth buying is power. A child sees the Wardrobe and can't reach it.
2. Late on, coins pile up with nothing exciting to spend them on.
3. The fix is not more coins. It is cheap, appealing things early, and big, visible, desirable things late.

## 2. How other games build their stores

| Game | What carries the store | Lesson for us |
|---|---|---|
| Kingdom Rush | Power is earned (the star tree). Gems buy one-off items | Keep power earned; we already do |
| Bloons TD 6 | Heroes for Monkey Money (one hero ≈ 5–30 first wins). Cosmetics (pets, projectiles, bloon skins) only for event Trophies, which **can't be bought**. Seasonal items **come back every year** | Visible in-battle cosmetics; events that return |
| Plants vs. Zombies 2 | Collecting plants, costumes, 10 free seed packets a day | A daily freebie |
| Clash Royale, Brawl Stars | A daily shop whose **first slot is free**. Brawl skins at 1,000 / 2,750 / 5,000 (1:3:5). **Removed loot boxes (2022) and chest timers (2025)** for "fair and predictable" | Daily face-up deals; no randomness or timers |
| Archero | Gear power and fusing; a 5-second revive timer (a pressure tactic) | Avoid timers |
| Pokémon Café ReMix | Outfits unlock as you play; event outfits | Cosmetics as progress rewards |
| Toca Boca, LEGO DUPLO, PBS KIDS, Pok Pok | Little or no currency. Stickers and scenes. Parents buy whole packs | Calm, few currencies, nothing pushy |

**What makes an item worth wanting** (for a 4-year-old especially):
- **You can see it while you play.** Brawl skins appear every match; BTD6 pets fly around the map. Our sweater, team hats and yard items already show in battle, which is good.
- **It moves.** Pop effects, victory dances and pets beat colour swaps.
- **It completes a set** ("4 of 6 Harvest looks").
- **It is reachable.** A visible "you can buy this!" moment within a few stages.
- **It is a surprise you chose.** Face-up picks feel generous; random boxes feel like a gamble, and the industry has moved away from them.

**Pitfalls for a 4+ audience:**
- **No countdowns, "ends soon" sales or 5-second decisions.** Radesky et al. (JAMA Network Open 2022) found manipulative design in about 80% of apps used by 3–5-year-olds.
- **No paid randomness of any kind.**
- **No guilt-trips, and no streaks that reset.** Our gift calendar already doesn't reset.
- **No store pop-ups after levels.**
- **Gems must stay earn-only.** A Library Card costs 50 gems and gives pages. If gems were ever sold, the game would be selling pages ("never sell pages"). If real-money gems ever come, the gem Library Card has to go.

## 3. Creep animation and attacks

Here is what the game did before this build.

**On hit:**
- a white flash for 0.12 s;
- a spark on the side facing the attacker;
- a damage number on every hit;
- knockback.

**On death:**
- the creep swells white and bursts with pages, stars and "POP!";
- bosses add slow-motion and screen shake.

**Telegraphs and status effects:**
- The dasher crouches, then shows a dashed line before it charges. Rangers lean back while aiming.
- Slow is a see-through blue disc. Stun shows orbiting stars.

**What the benchmarks do better:**
- **Hit poses, not just flashes.** Juice talks (Jonasson and Purho; Vlambeer) squash the target on impact and spring it back.
- **Flash limits.** A creep under several friends was flashing white more than 3 times a second. That breaks WCAG 2.3.1 and makes each flash mean nothing.
- **Fewer numbers.** Vampire Survivors added a switch to hide damage numbers. Rush Royale moved detail off the board. Most 4-year-olds can't read "17", and the numbers stack into clutter.
- **Damage shown on the body.** PvZ zombies lose arms and cones; BTD6 MOABs have four damage phases.
- **Effects that coat the creep.** BTD frozen shells and glue; PvZ butter and blue tint.
- **One telegraph grammar:** stop, crouch, glow, sound, ground marker, then 0.8–1 s later the attack (Archero's aim line).

**Shipped in build 98:**
- **Squash on every hit.** The creep goes wide and short, then springs back over 0.14 s. Bosses squash about a third as much.
- **Flash limited** to once every 0.3 s per creep (about 3 a second at most). The squash carries the hits in between.
- **Damage numbers off by default.** A crit says "POW!" in gold instead. The new **🔢 Hit numbers** setting brings the numbers back for older kids.
- **No arena word below 16 px.** "clunk", "again!", "Bonk!" and 20 more were 13–15 px.

**Recommended next:**
1. Give tank, hardcover, healer and elite creeps two body damage states (at 66% and 33%), and remove their small HP bars.
2. Give each kind its own walk:

   | Kind | Walk |
   |---|---|
   | Tank | stomp |
   | Dasher | tiptoe |
   | Healer | shuffle |
   | Swarm | skitter |
   | Rumour | slide |
   | Gossip | hop |

3. Use the dasher's telegraph steps for every special move (pelter, caster, healer, boss), in gold rather than red.
4. Make status effects coatings rather than discs: frosty page edges plus a half-speed walk for slow, and a bookmark flopped over the eyes for stun.
5. Add a 50–80 ms hit-stop on crits, stuns and boss kill blows only.
6. Have coins fly to the HUD with a chime that rises in pitch on quick pops.

## 4. Text, dialog boxes, colours and fonts

**Already good:**
- Fredoka for headings with Nunito for body text.
- Ink outlines on every button and an ink outline on arena words.
- Read-aloud buttons.
- The muted grey and word counts settled in the earlier type report.

**Problems found:**

| Problem | Where | Status |
|---|---|---|
| Arena speech was plain floating text, and "The Kid:" was typed into the line | Villain finale, boss taunts, Dad's "Hey, you!" | **Fixed:** cream speech bubbles with ink text and a tail. The Kid gets a teal name tab, the villain a purple one |
| The theme badge rule caught swapped-in icons: the "+" sat on top of "Nothing yet" | Gear slots | **Fixed** (`.otile .ie > i:not(.ico)`) |
| The same bug squeezed the 🔒 on locked skills into a corner | Friend skill ring | **Fixed** |
| The same selector could catch the weapon icon | Battle tray cooldown | **Fixed** |
| White text on green buttons was 4.1:1 (fails at small sizes) | `.btn.green.small` (e.g. Library Card "Open") | **Fixed:** green buttons are a shade darker, 4.75:1 |
| White on purple (2.7:1) and white on gold (1.9:1) fail | Nowhere in buttons today | Rule: ink text on gold, purple and water blue |
| Panel corners vary between 12/14/16/18 px, and outlines between 2/2.5/3/4 px | Across the screens | Recommend one style: panels 14 px with a 3 px outline, chips 2 px, pills fully round |
| More than one gold button on some modals | A few pop-ups | Recommend one gold primary per screen; cream for secondary, red only for leaving |

**Recommended next:**
- Type lines on at 30–50 ms per character, with tap to finish and a bouncing "next" marker in story dialogs.
- A portrait and name tab on every comic speech line, the same as the arena now has.
- 60 px or taller primary arena controls (50 px in the 440-px frame is about 44 pt, right at Apple's floor).

## 5. Store changes in build 98

**Dad's Picks** is a new shelf at the top of the Shop. It shows three face-up offers that change once a day:
1. **A present from Dad (free):** coins scaled to progress, 10 gems, 2 Blank pages, or a named Rare bookmark.
2. **A look for Dad at 30% off:** one of the six cheapest Wardrobe looks the child doesn't own yet. The first look becomes reachable in the first few stages, where the Wardrobe used to be out of reach until about stage 25.
3. **A named item:** you see exactly what it is before buying. A Rare costs 450 coins and an Epic 1,100.

The shelf follows the benchmarks:
- There is **no countdown**, just "New picks tomorrow".
- Reopening the Shop never reshuffles it.
- Nothing is random after you pay.
- Nothing costs real money.

## 6. Build 99: Wardrobe re-ladder and star looks

**Coin looks now cost 1,000, 2,500 or 5,000:**

| Price | Sweaters | Hats for Dad | Team hats | Backyard |
|---|---|---|---|---|
| 1,000 | Sky Blue, Leaf Green, Berry Red | Ball Cap, Sun Hat | Bows, Daisies | Sunflowers, Mushrooms, Balloons |
| 2,500 | Grape, Bubblegum, Storm Grey | Thinking Cap | Party Hats | Kite, Lawn Flamingo, Tent |
| 5,000 | Midnight | Top Hat | Wizard Hats | Fountain |

The coin ladder now totals 50,000 instead of about 73,000. With Dad's Picks at 30% off, a 1,000-coin look costs 700 on the day it is picked.

**Star looks are earned, never bought.** Every star on every difficulty counts. A look arrives the moment the total reaches its mark:

| Stars | Look |
|---|---|
| 15 | Star Stripes sweater (new) |
| 30 | Rainbow over the backyard |
| 50 | Little Crowns for the team |
| 75 | Rainbow sweater |
| 100 | Crown of Why |

- The stage-clear screen announces a new look, and otherwise says how many stars are left to the next one.
- In the Wardrobe, a star look's tile shows progress (e.g. "⭐ 36/50"), and the header names the next one.
- Players who already have the stars get their looks on load. Anyone who bought a crown or rainbow with coins keeps it.

## 7. Builds 100–101: the rest of the list

**Store (build 100)**
- **Moving looks.** Two new Wardrobe rows:
  - **Pop style** changes every myth burst: Confetti 1,000, Bubbles 2,500, Hearts 2,500, Twinkle Stars 5,000.
  - **Pets** follow Dad around the arena and stand beside him in the home photo: Butterfly and Ladybug 1,000, Chick and Puppy 2,500, Wise Owl 5,000.
  - A Tiny Dragon arrives at 150 stars.
  - Moving looks give late-game coins somewhere fun to go and, like everything in the Wardrobe, add no Power.
- **Pick 1 of 3.** The Lunchbox and Bookmark show three face-up choices after you pay; you keep one. The choices are saved, so leaving the Shop never loses them. The coin store has no blind boxes left.
- **Sets.** The Wardrobe counts five sets (🍂 Harvest, ❄️ Winter, 🏡 Club, 🥇 Cup, ⭐ Star). Finishing one pays 💎50 once. The event shop shows its set count and says "Back next year, so there's no rush!"
- **Save for this.** Tapping a look you can't afford yet pins it (📌). The Play screen then shows a pill that fills toward the price and glows when you can buy it.
- **Event pricing is already kind.** Event myths join every stage's pool, so a stage pays roughly 60–80 tokens plus 10 a day. A whole event set (about 850 tokens) takes about 10–12 stages, well inside the 13–23 days of an event. Prices are unchanged.
- **Not done: merging badges and cup points.** They belong to the separate Club and Cup systems, with their own shops and saves. Merging them needs a save migration and a redesign of both shops, so it is better as its own change.

**Creeps (build 101)**
- **Damage shown on the body.** Tanks, hardcovers, healers and elites lost their small health bars. They get a folded corner and a crack at two-thirds health, then a second crack and a loose scrap flapping off at one-third. Only bosses keep a bar.
- **A walk for each kind:**

  | Kind | Walk |
  |---|---|
  | Tank | stomp (deeper squash, heavy sway) |
  | Dasher | tiptoe hops |
  | Healer | slow shuffle |
  | Swarm and minis | skitter |
  | Rumour | flat slide |
  | Gossip | big hops |

- **One warning style.** Pelters and spellbooks while aiming, and healers just before healing, glow and show a shrinking gold dashed ring at their feet, the same "get ready" tell the dasher uses. Gold, never red.
- **Coatings instead of discs.** Slow is now a frosty tint with a snow cap and frost marks around the edge. Stun keeps its "?" and adds two orbiting gold stars.
- **Hit-stop.** A crit or a big knockback freezes the target for 0.07 s. The rest of the game keeps moving, so a swarm never stutters.
- **Coins fly to the counter.** Picked-up coins arc to the coin counter, and the chime climbs the scale when pickups come quickly (up to 8 steps).

**Dialog and buttons (build 101)**
- **Comic lines type on** at about 30 letters a second. The first tap finishes the line, the next one moves on. The comics already had portraits and name tabs.
- **Arena pause and speed buttons** went from 52 to 58 px, about 51 pt on a phone.
- **One corner style.** Every card corner is now 14 px; there were 35 at 12 or 16 px. Pop-up panels stay at 20 px and pills fully round.
- **One gold button per pop-up:** checked, and no pop-up has more than one.

## Sources

**Store benchmark:**
- Kingdom Rush and BTD6 wikis; Plants vs. Zombies wiki and EA forums.
- Supercell support, RoyaleAPI; Game Developer on Brawl Stars dropping loot boxes and on Archero.
- Deconstructor of Fun.
- Bulbapedia, Serebii.
- App Store pages for Toca Boca World, LEGO DUPLO World and PBS KIDS; Lingokids help pages.
- Radesky et al., JAMA Network Open 2022 (manipulative design in apps for 3–5-year-olds).

**Creep and UI benchmark:**
- George Fan, GDC 2012 (Plants vs. Zombies).
- Jonasson and Purho, "Juice it or lose it"; Vlambeer, "The Art of Screenshake".
- Sakurai on hit-stop.
- WCAG 2.3.1 and 1.4.11.
- Brown and Anthony, CHI 2012 (children's touch accuracy).
- Duolingo's shape language; Animal Crossing type on Fonts In Use; Game Accessibility Guidelines.

Fan wikis can be out of date. The coin and price figures for our game are from the code and the balance sim.
