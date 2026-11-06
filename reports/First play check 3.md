# First play check 3 (builds 98–103)

This check plays a brand-new save, phone-sized, through the prologue and the first four stages. Its purpose is to see how the recent changes land for a new player: the store, the creep effects, comic typing, Medals and the victory dance. The script answers every card the way a child tapping the first option would, and fast-forwards the matches.

## The numbers

| Step | Result |
|---|---|
| Prologue | 14 taps at a steady pace, about 6 s. Typing means a line can take two taps (one to finish it, one to move on). |
| Stage 1 | Won in 59 game-seconds, 3★, Patience 100. 42 myths, 3 level-up picks. +95 coins. Webster joins. |
| Stage 2 | Won in 80 s, 3★. 77 myths, 5 picks. +180 coins. Pages for Hopper and Shelly. |
| Stage 3 | Won in 96 s, 3★. 116 myths, 7 picks. +280 coins. First fact cards and the first Chapter Reward. |
| Stage 4 | Won in 126 s, 2★, Patience 97. 151 myths, 8 picks. +340 coins. Hopper joins. |
| After stage 4 | All five tabs open. 895 coins, 177 gems, 11 stars. |

No page errors anywhere.

## What reads well
- **The first look is reachable.** By stage 4 a new player has 895 coins. Dad's Picks shows a 1,000-coin look for 700 and a free present, so the first purchase lands in the first session. Before build 98 the cheapest look was out of reach until about stage 25.
- **Star progress motivates.** The clear screen says "6/15 stars to the Star Stripes", and the 15-star sweater arrives around stage 5.
- **The arena stays calm.** With hit numbers off, the early stages show only pops, "POP!" and fact cards. The squash on each hit reads clearly at phone size.
- **The difficulty ramp is gentle.** Three stars on stages 1–3 and a first slip on stage 4 is a good curve for 4+.

## What this build fixes
- **Free present nudge.** The Shop tab now shows its red dot when today's present from Dad hasn't been opened, as well as for unspent Library Cards. It only appears once the Shop is unlocked.
- **Tiny bookmark.** A bookmark shown as the free present was drawn at its small Bag-grid size. It is now about twice as big in Shop rows.
- **Flaky test.** The test helper opened the game with an empty save, then wrote the test save and reloaded. Under load, the first page could save over the test save. The test save now goes in before the game's code runs.

## Victory dance (build 103)

A new Wardrobe row, **Victory dance**, sets what Dad does on the stage-clear screen:

| Dance | Price | Movement |
|---|---|---|
| Big Wave | free | the waving pose, with a gentle sway |
| Happy Hop | 1,000 | bouncy hops |
| Wiggle Jig | 2,500 | a side-to-side wiggle |
| Twirl | 2,500 | spins round |
| Cartwheel | 5,000 | a full cartwheel every couple of seconds |

- The pet, if Dad has one, hops beside him.
- The dance keeps going through a chapter-end comic and stops when the next match starts.
- Calm mode shows Dad standing still.

## Worth watching
- **Two taps per comic line.** Typing doubles the taps for a child who taps quickly. Most story games do the same, and lines finish on their own in about 1–2 s. If it feels slow in real play, lines could type faster (20 ms per letter instead of 35).
