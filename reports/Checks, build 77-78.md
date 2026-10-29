# Checks: difficulty, speed and bugs

Why, Dad? Defender, October 2026 (builds 77–78). Three checks were run on the game: a difficulty sweep, a speed test and a bug hunt. The competitor research is in `Competitor research.md`.

## 1. Difficulty: every stage, played by a computer

`defender/tools/balance_sim.mjs` plays the whole story from a fresh save, the way a typical kid would. It spends between stages, claims daily rewards and answers quizzes, so the team that reaches each stage was built only from the game's own rewards. Each stage is then played several times.

**Player types:**
- **Typical:** uses the Bag and the Shop, and plays a "day" every 3 stages.
- **Weak:** never opens the Bag or the Shop.
- **Strong:** plays a stage a day.

**What it found (before tuning):**
- **No stage stopped a normal player.** From stage 4 on, typical and strong players won every stage on the first try with 96–100% Patience left. Their Power was 2–5 times what the stage "needed".
- **Dad's lens mattered more than Power.**
  - On the same save, Bubble Lens won 0 of 4 times and Classic Lens 2 of 4. Every crowd-hitting lens won 4 of 4 with almost no Patience lost.
  - The lens comes from random drops, so it was a lottery.
- **The only walls were for a player who never upgrades and holds a weak lens:** Arctic 1–2, Jungle 1–4 and Night Sky.
- **Chapter bosses had fallen behind.** Bosses didn't scale like regular myths: by stage 40 a boss had only 0.18 times the health share it should.
- **The "needs" number was 2–5 times too low** and didn't predict wins.
- **The earlier difficulty tuning came from a simulator that had a bug.** It never equipped weapons properly (it didn't call `syncWeapons`), so the game had been tuned against a handicapped team.

**Changes:**
- **Lenses:**
  - Classic and Bubble Lens are stronger; Bubble's bubbles fly straighter and faster.
  - The over-strong lenses come down: Yo-yo, Bat, Plane, Frisbee and Balloon.
- **Myths and bosses:**
  - Late-game myth health is up (`TUNE` from `hp 1.8 / hs .04` to `hp 2.2 / hs .05`).
  - Bosses now scale like everything else.
  - Arctic myths are slightly less thick (×1.15 → ×1.05) and Jungle bunches slightly smaller (×1.15 → ×1.05).
- **The "needs" number** now follows a player who never uses the Shop, so a green check means that player can win.

**After tuning:**

| Player | Stages 1–10 | 11–20 | 21–30 | 31–40 |
|---|---|---|---|---|
| Typical: wins / lowest Patience | 100% / 98 | 100% / 98 | 100% / 90 | 95% / 82 |
| Strong | 100% / 99 | 100% / 98 | 100% / 97 | 100% / 95 |
| Never upgrades | 100% / 92 | 100% / 96 | 75% / 60 | 80% / 36 |

- **Typical players** now feel some pressure in the last three chapters.
- **Players who never upgrade** get stuck at times in chapters 5–8, and replaying an earlier stage gets them through.
- **Stages 1–20 stay gentle**, which suits the youngest players. Hard and Myth Master are where experienced players go for a challenge.

**Still open (for you to decide):**
- **Spending gap.** A player who never opens the Shop reaches stage 40 with about 46,000 coins and 4,450 gems unspent. A gentle "you can afford this" nudge in the Shop and Bag would narrow the gap between players.
- **Power ignores the lens.** It doesn't count which lens Dad holds, even though the lens matters a lot.
- **Book 2.** The training ranks up to 25 and levels 20–30 now have room to matter, but only Book 2 (an expansion) would fully use them.

## 2. Speed on a mid-range phone

Measured in headless Chromium with the CPU slowed 4 times and on a Fast 4G connection.

| | Before | After |
|---|---|---|
| First visit | 108 requests, 18.2 MB | 62 requests, 1.6 MB |
| Art on disk the game loads | 36 MB of PNG | 3.7 MB of WebP |
| Offline after one visit | no skill icons, item pictures or hats | everything except voice and music (cached as they play) |
| New myth type mid-match | 100–300 ms stall | none (anchor points measured ahead of time) |

**Other changes:**
- **Loading:** Dad's 3D sheets no longer download by accident on start-up.
- **Loading:** chapters load their arena and map when you reach them.
- **Loading:** fonts don't hold up the page.
- **Smoother frames:** redraws are batched to one per frame, and the home screen idles at 30 fps.
- **Smoother frames:** low-effects mode starts after 1.5 seconds of slow frames.

**Still slow:**
- **Canvas drawing on slow phones.** Battles with 20+ myths ran at about 15 fps at 4 times CPU slowdown, but that was software drawing without a GPU, so it's pessimistic. A real-phone test is the next step.
- **3D mode** is too heavy without a GPU.

**Keeping it fast:** run `python3 defender/tools/sw_list.py` after adding art. It makes the WebP copies and updates the offline lists.

## 3. Bug hunt

All fixed in build 77. Each one was reproduced in a browser with a faked clock.

1. **A match crashed if a seasonal event ended while it was running.** The event button and shop had the same problem if left open.
2. **Bought Cup Tickets disappeared the next day.** The daily free ticket capped everything at 3.
3. **A Cup match across Monday 00:00 UTC lost its result.** It also moved the new week's bracket on by mistake.
4. **League pay for a week was lost unless the Club was opened the following week.**
5. **Earned club and raid chests, and finished club jobs, were wiped at the week or day change.** They're now paid out instead.
6. **Dad's themed lens didn't show in his Hit and Quick stats.**

**Not fixed:** existing clubs would drop levels under the new club XP curve. It only matters if build 70 reached real players, and it didn't.

**Also noted:** daily and weekly resets happen at midnight UTC, which is late afternoon or evening in the US. Moving them to local midnight is worth considering.
