# What to borrow from the top games

Why, Dad? Defender, October 2026. Research on tower defense and hero-collector games, kids' learning apps, store pages and the rules for a 4+ app.

**About the evidence:** few developers publish their numbers, so much of this comes from analysts, fan wikis and store-page agencies. Where a point is our own judgement, it says so.

## Targets

| | Day 1 | Day 7 | Day 30 |
|---|---|---|---|
| Median mobile game (GameAnalytics 2025) | about 22% | about 3.5–4% | under 1% |
| Top quarter, iOS | 31–33% | | |
| Tower defense (agency figure) | 35–45% | | |
| **Our target** | **30%+** | **10%+** | **3%+** |

- **Sessions:** a typical mobile session is 3 minutes, about 4 times a day (GameAnalytics 2026).
- **What that means for us:** design for 3–8 minute bursts, with a natural place to stop around 15 minutes.

## Top 10, by impact for the effort

1. **Pop a myth in the first 30 seconds, and spread unlocks across days 1–7.** We have about 15 systems. Showing them all at once is the biggest risk for 4–10 year olds. Habby's games (Archero, Survivor.io) open features over several days.
2. **Count where new players stop, on the device only.** Use no third-party analytics: Apple 5.1.4 bans it for apps aimed mainly at kids. Count tutorial steps, the first pop, the first friend, clearing chapter 1, and coming back on day 1 and day 7. In one tower defense game, 24% of players quit at a single tutorial step (GameAnalytics case study).
3. **Daily challenge and a daily gift that never resets.** Bloons TD 6 has a daily challenge, a "Perfect Week" badge, and daily rewards that don't reset when a day is missed. We have the Daily Myth: add the Perfect Week and make sure missed days never punish.
4. **Stars from pages left, plus hard replays.** Kingdom Rush gives 3 stars for 18–20 lives left, 2 for 6–17 and 1 for 1–5. It also offers extra stars from "Heroic" and "Iron" replays of cleared stages, with more stars available than needed so nobody gets stuck. This is cheap content because the maps already exist.
5. **Diary as a fact-card album, plus a "What we learned this week" page for parents.** Parents praise learning they can see (Common Sense reviews of Lingokids and Duolingo ABC). It's our main selling point on the store page.
6. **Parents' area behind the gate:**
   - A play-time limit with a gentle "Dad needs a nap".
   - Notification opt-in.
   - Sound settings.
   - "No ads, nothing to buy".
   - The fact log.

   Apple 4.5.4 and the UK children's code support all of this.
7. **Natural stopping points.** After about 3 matches, show a "Great myth-busting today!" summary with the facts learned and the coins waiting tomorrow. Timers reward coming back and never punish being away. Toca Boca and Pok Pok earn parents' trust this way.
8. **Gentle random rewards.** Keep the wheel free and never sell it. Show its odds behind an "i" button, and give a rule that turns duplicates into progress. Prodigy Math drew an FTC complaint for pushing status items at kids.
9. **A simpler friend page for young readers** (our own judgement). Show:
   - One big portrait.
   - One line on what they do, read aloud.
   - Rarity and element as colour and icon.
   - A preview of the next upgrade ("Owl's next trick: hoots 2 pages!").
10. **A steady event rhythm:** weekly Cup, plus one small monthly event of about 5 stages with a fact theme and a cosmetic, built from reusable templates.

## Store page

- **Words:**
  - Title and subtitle are 30 characters each; the hidden keyword field is 100. Don't repeat words across them.
  - Subtitle idea: "Myth-Busting Fun Facts Game".
  - Keywords: tower,defense,kids,facts,science,learning,animals,trivia,family,curious,heroes.
- **Screenshots, in order:**
  1. Real gameplay captioned "Pop Myths, Learn Facts!".
  2. A fact card.
  3. The friends collection.
  4. A trust frame: "No ads. Nothing to buy. Stars are earned."
- **Preview video:** 15–30 seconds of real footage, a hook in the first 3 seconds, works with the sound off.
- **Rating prompt:** use Apple's own prompt only (custom prompts aren't allowed). Show it after a boss win, from day 3 on, never from a button. On Android, use the Play In-App Review API.

## Rules to watch

- **Apple 5.1.4** applies even outside the Kids Category: no third-party analytics or ads in an app aimed mainly at kids.
- **Apple's new age-rating questionnaire** (deadline January 31, 2026) must be answered before updates can be submitted.
- **COPPA changes** (compliance deadline April 22, 2026): the simple safe setup is no accounts, no personal data, saves on the device.
- **Google Play Families policy:** applies if children are in the target audience.
- **Notifications:** must be opt-in and never needed to play.
- **Accounts:** if accounts or cloud saves are ever added, account deletion must be possible inside the app.
- **Club, League and Cup:** keep them offline with made-up rivals: no chat, no player names.

## Sources

**Retention benchmarks**
- GameAnalytics benchmarks: https://www.gameanalytics.com/reports/2025-mobile-gaming-benchmarks · https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks

**What tower defense and hero games do**
- Bloons TD 6 daily systems: https://www.bloonswiki.com/Daily_Challenge_(BTD6) · https://www.bloonswiki.com/Daily_Reward
- Kingdom Rush stars: https://kingdomrushtd.fandom.com/wiki/Kingdom_Rush
- Habby and Survivor.io: https://naavik.co/deep-dives/survivorio-archeros-footsteps/ · https://www.gamigion.com/survivor-io-the-progressive-monetization-masterclass/
- Tutorial drop-off case study: https://www.gameanalytics.com/customers/paradoxum-games

**Kids' apps and what parents say**
- Parent reviews: https://www.commonsensemedia.org/app-reviews/lingokids-play-and-learn · https://www.commonsensemedia.org/app-reviews/duolingo-abc-learn-to-read
- Prodigy complaint: https://fairplayforkids.org/feb-19-2021-advocates-to-ftc-prodigy-math-game-preys-on-kids-and-families/

**Rules and compliance**
- Apple guidelines: https://developer.apple.com/app-store/review/guidelines/
- UK children's code on nudges: https://ico.org.uk/for-organisations/guide-to-data-protection/ico-codes-of-practice/age-appropriate-design-a-code-of-practice-for-online-services/13-nudge-techniques
- COPPA amendments: https://www.hunton.com/privacy-and-cybersecurity-law-blog/coppa-rule-amendment-compliance-deadline-approaches

**Store page**
- Store page fields and screenshots: https://studio.adalo.com/blog/app-store-keywords-field · https://www.apptweak.com/en/aso-blog/how-to-optimize-your-app-screenshots
