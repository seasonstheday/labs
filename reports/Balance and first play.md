# Balance pass and first-play check, build 55

October 2026. Both checks used the game's own code, fast-forwarded in a headless browser (`defender/tools/sim_campaign.mjs`).

## How the campaign sim plays

A brand-new save plays the 40 stages in order. Between stages it does what a sensible child might:
- stars up anyone with enough pages and claims Chapter Chests
- takes the three strongest friends
- spends Skill Books, then tree points on the cheapest open upgrade, then coin ranks
- puts on the best items

Every three stages count as a day, with two 6-hour patrols, two quick patrols, a wheel spin and the daily gift. In a match it picks the first level-up card and answers Myth Checks right 75% of the time.

## What it found (build 54)

| | Build 54 |
|---|---|
| Patience left at the end of a stage | 100% on almost every stage from stage 4 on: nothing reached Dad |
| Team Power vs suggested | 4 to 7 times the suggested Power by mid-game |
| Friend level | 10 by stage 5, 30 (the cap) by stage 22 |
| Dad's stars | ★5 by stage 12 |
| Coins | 81,000 unspent by the end |

Why:
- Patrol XP alone was worth more than the matches.
- Dad's stars cost the same 50 pages as a friend's, and every fact is a page.
- Myth damage never grew with the stage, while Patience grew from the Diary, Dad's stars, ranks and items.
- The suggested Power curve stopped growing near 1,400.

## What changed (build 55)

- **Patrol:**
  - Coins: 10 + 3 per stage cleared, per hour (was 40 + 8).
  - XP: 4 + half a point per stage cleared, per hour (was 30 + 4 per stage).
- **Dad's stars:** 12 / 24 / 36 / 48 pages (was 6 / 10 / 14 / 20), so ★5 comes in the last third of the story.
- **Myths:**
  - Chapter 1 stays as it was, so a child who never opens a menu still beats the Wall.
  - Over chapter 2, myths ease up to 1.8× health and 1.1× damage. After that, health grows 4% and damage 1% each stage.
  - Most of the extra is health, not damage. When damage was pushed up, fights became all or nothing: one boss hit ended the match.
- **Suggested Power:** it keeps climbing, to about 3,200 by stage 40 (was about 1,430). That is a little under what a typical team has, so being below it really means "upgrade first".
- **Fewer in-match level-ups:** about a quarter fewer. The first-play run had roughly ten pick-a-card stops per stage.

## Result (build 55)

| | Build 54 | Build 55 |
|---|---|---|
| Friend level at the end | 30 by stage 22 | 29 by stage 40 |
| Dad ★5 | stage 12 | stage 22 |
| Power vs suggested | 4 to 7× | about 1.7 to 2× |
| Stages where Dad lost Patience | 3 of 40, all in chapter 1 or 2 | 8 of 40, mostly chapters 6 to 8 |
| Retries | none | 3, in chapters 6 to 8 |

The sim spends everything well, so a real child will usually sit closer to the suggested Power and feel the difficulty more. Easy mode is still there for anyone who needs it.

**Still to watch:** coins pile up late (about 50,000 by stage 40) because the sim buys nothing in the Shop. Real players will spend some on Library Cards and Shop items. If coins still pile up in real play, the late-game coin rewards are the next thing to trim.

## First-play check

A brand-new player played the first seven stages. Every pop-up, note and toast was logged in order.

| Found | Fixed |
|---|---|
| Up to five lines on the Stage cleared card: pages, two "now open" messages, "a Chapter Chest is ready on the World Map", a break note and XP | Whatever just opened is announced on the home screen instead, one "✨ New!" card at a time, read aloud. The clear card keeps the stage's own news. |
| "A Chapter Chest is ready on the World Map" repeated after every stage until the chest was claimed, and pointed at the map | It shows once per chest and points at the 🎁 on the home screen |
| A "New!" card could pop up in the middle of a match | It only shows on the home screen |
| Around ten level-up cards per stage | About a quarter fewer |
| With the first tuning, a player who never upgraded lost the chapter 1 boss | Chapter 1 is unchanged; the tuning starts in chapter 2 |

## Myth Master (build 56)

Myth Master is a fourth difficulty. It opens stage by stage once that stage is beaten on Hard.

**How it's harder:**
- Myths have 2× health, move 1.15× faster and hit 1.15× harder.
- Two extra elites join every wave.
- Bosses use their moves 30% more often.
- No Patience comes back during the match.

**Rewards** (prizes only, never story power):
- On the first win of each stage: a crown on the map pin, +40 gems, a Library Card, a Skill Book, and an extra item with better rarity odds.
- Beating all five stages of a chapter opens a 🔥 Myth Master chest in Chapter Rewards: gems, a Legendary item and two Skill Books. It also turns that chapter's Diary tile gold.

**Tuning:** I tested it with the campaign sim's saved teams. The first version, at 2.1× health and 1.6× damage, was lost by almost every team inside a minute. Tanks and healers piled up on Dad, each one draining Patience every second.

The final numbers keep most of the extra challenge in health and elites. A fully upgraded late-game team now wins about half its attempts, often with little Patience left.
