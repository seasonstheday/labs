# First play check, round 2 (build 66)

A simulated brand-new player started from an empty save. It taps through every story frame, takes the first card at every level-up, presses **Next stage** after every clear, and never visits a menu to upgrade: the least engaged player we can imagine. The tool is `defender/tools/sim_firstplay.mjs`.

## What it found (build 65)

1. **A pile of pickers before a match.** From the second stage on, each match opened with up to six "Everyone remembered a trick!" pickers in a row before the player could move.
2. **A wall at stage 3.** The player lost at The Backyard 3 (the spiders' mid-boss) and then at stage 5. "Try that wave again" brought back the same fight, so the simulated player lost about 20 times in a row and never got through. A real child would probably give up.
3. **Cards on top of cards.** A fact toast stayed on screen behind the level-up card, and the Stage cleared notes ran under the buttons.
4. **What was fine.** In stage 1 a level-up came about every 15 to 20 seconds, with a fact toast every 5 to 10 seconds and three short hints over the first five stages. That is busy, but it is the core loop, and it stays.

## What changed (build 66)

- **Remembered tricks are one card.** Dad picks the best of three for each remembered trick, all at once. The card lists one row per trick at its final rank, for example "Eight Eyes · Rank 3 (+3) · Webster", with a single **Let's go ▶** button.
- **The loss card helps:**
  - If the team is under the stage's recommended Power, it says so in one line and shows **💪 Power up the team**, which goes straight to Friends.
  - From the second retry of a wave, Dad has a snack: +20% Patience, and myths bump 10% softer per snack, up to three snacks. The card tells the player before they try.
- **One thing to read at a time:**
  - The fact toast hides when a level-up card opens. The fact is already saved in the Diary.
  - The XP note on Stage cleared is one line per item: "✨ +53 XP for everyone", then the level-ups.

## After

Same simulated player on build 66:
- one remembered-tricks card per match instead of up to six pickers;
- no endless loop: through The Backyard, The Pond, The Library and into The Ocean, it lost two or three times on the harder stages, then won once the snacks kicked in. A child who visits Friends between stages won't need the snacks.

Cards: `img/firstplay_cards.png`.
