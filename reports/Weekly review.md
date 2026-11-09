# Weekly review: how it runs

A scheduled task runs this review every Monday and reports out. Each run writes `reports/weekly/YYYY-MM-DD.md` and opens a pull request with that report for the owner to read and merge. It never merges anything itself, and it never changes game code.

## What each run does

1. **Health**
   - Run the smoke tests (`cd defender/tests && npm install && CHROME_PATH=/opt/pw-browsers/chromium node smoke.mjs`, with the repo served on port 8765). Record passed / total and any failure.
   - Note the build number (`defender/index.html`) and what merged to `main` in the last 7 days (`git log --since="7 days ago" --no-merges`).
2. **Art check**
   - Run `python3 defender/tools/art_check.py --out <scratch folder>`.
   - Compare with last week's report: how many arenas are flagged "near Dad", "loud floor" or "low-res", and whether any new art arrived.
   - Capture two or three worlds in play (colour and greyscale) if art changed that week.
3. **First-play spot check**
   - Play a brand-new save through the prologue and stage 1 with the `?debug` hooks. Record errors, stars and coins.
4. **One benchmark topic**, rotating each week:
   1. tower-defense art and feel;
   2. kids' app store pages and trailers;
   3. AI tools (new models, prices, licence changes for the tools in the pipeline table below);
   4. economy and store practice.

   Half a page at most, with sources, and one to three concrete lessons.
5. **Outstanding actions**
   - Carry the list below forward. Mark what closed, add what is new, and keep "waiting on the owner" separate from "queued work".
6. **Report out**
   - Write `reports/weekly/YYYY-MM-DD.md` with these sections: Summary (five lines at most), Health, Art check, First play, Benchmark of the week, Recommendations (three at most, ordered), Outstanding actions.
   - Update the "Outstanding actions" section of this file.
   - Open a pull request titled `Weekly review YYYY-MM-DD` containing only files under `reports/`.

## Rules

- Plain words, short sentences, numbers with units.
- Say what was not checked and why. Do not get round sites that block automated access.
- No API keys in any file. No model names in commits or pull requests.
- If a run finds a real bug, describe it in the report with steps to reproduce. Do not fix it in the same pull request.

## The AI pipeline (review prices and terms in week 3 of each rotation)

| Area | Tool |
|---|---|
| Images | Google Gemini image models |
| 3D models, rigs, animation | Meshy |
| Voice | Gemini TTS (Dad is the "Iapetus" voice) |
| Music and stingers | Google Lyria |
| Code, tests, reviews | Claude Code |

## Outstanding actions (as of 2026-11-09)

**Waiting on the owner**
- Move Gemini to a paid, batch-enabled account with a spend cap, so the last 134 of Dad's 459 voice lines can be recorded. The price doubles on 1 January 2027.
- Check the nine Book 2 source links that block automated checks.
- Add about 120 Meshy credits for the last four 3D hats (Bows, Daisies, Leaf Crowns, Reindeer Antlers).
- Read Google's terms on distributing Lyria music before the App Store launch.
- Watch the CasiCreativo video to confirm the style points marked as inferred.

**Queued work (not started)**
- Art pass 1: grade the arenas, cream halo, one contact shadow, world tint and paper grain, re-toned creeps with the shared ink line.
- Art pass 2: scale the cast up, regenerate arenas at 2× from a shared prompt template, edge-only ambient motion, 3D mode matched to the 2D rules.
- Pipeline: a style sheet file, reference sets per character, a scoring gate before art is committed, logged prompts and seeds.
- From the YouTube review: the 10,000-steps myth, mystery opening lines, talking creeps, cause-and-effect fact cards, faces that change with damage, store screenshots and short clips.
- Re-run the 80-stage balance simulation.
