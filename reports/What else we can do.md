# Why, Dad? Defender: what else we can do

A survey of similar games, kids' design guidance, learning research and Apple's rules, checked against build 44. October 2026.

## Where the game stands

The core is in place:
- arena combat with level-up picks
- 28 friends with tiers, pages, stars, elements, families and pair-ups
- weapons with themes and forging
- Team Power with a suggested Power for each stage
- daily gifts and missions
- 40 stages across 8 chapters

Five gaps came out of the research. Each is something comparable games or the guidance treat as basic.

## 1. Sound and touch (the biggest gap)

- **There is no audio at all.** `index.html` has no `AudioContext` or `Audio`: no pops, no level-up chime, no music.
- **There is no haptics.** The native shell already has a `haptic()` hook (`app/src/native.js`), but the game never calls it.

Audio is half of what makes a hit feel good, and for children who can't read yet, sound is how they learn what just happened.

**Proposal:**
- **Sound effects** synthesised with Web Audio, so there are no asset files:
  - pop, crit, hit on Dad
  - level-up, notebook, coin
  - forge, button tap
- **A short music loop per chapter.**
- **Volume controls:** separate music and effects sliders in Settings, plus a "quiet mode" that respects the phone's silent switch.
- **Haptics:** a light tap on buttons, and a firmer one on crits, boss hits and level-ups.

## 2. Kid safety and fair play

The game is plainly made for children. In the US, whether COPPA applies depends on the content and audience, not on the App Store category. So the 4+, non-Kids-Category decision (see `app/README.md`) doesn't remove the duty of care.

- **Ads:**
  - Apple's guidance for kids' apps: ads must be human-reviewed for age-appropriateness, and must not link out without a parental gate ([Apple: designing for kids](https://developer-mdn.apple.com/kids/), [guideline 1.3 notes](https://www.goodbarber.com/help/apple-rejection-r100/apple-rejection-apps-for-kids-a365/)).
  - Third-party analytics and advertising are restricted in apps aimed at kids ([summary of 5.1.4](https://conductatlas.com/platform/apple/apple-app-store-review-guidelines/kids-category-and-coppa-aligned-child-privacy-requirements/)).
  - Our AdMob setup already asks for non-personalised ads (`npa: true`), but it doesn't mark requests as child-directed.
  - **Action:** set `tagForChildDirectedTreatment`, set the maximum ad content rating to G, and keep every ad behind the grown-up gate (it is today). This needs a check by whoever handles the store listing; I'm not a lawyer.
- **Dark patterns regulators look for.** A Hungarian competition authority sweep of children's games found these problems ([GVH, 2023](https://www.gvh.hu/en/press_room/press_releases/press-releases-2023/attention-parents-this-is-not-a-game-such-are-the-dangers-of-free-online-games-on-mobile-phones)):
  - levelling up just by paying (7 games)
  - "keep playing" praise tied to payment (12 games)
  - unclear exits (11 games)

  A study of apps for young children found time pressure, paywalls and rewards that look like gambling ([ECGBL](https://papers.academic-conferences.org/index.php/ecgbl/article/view/1656)). How we compare:
  - The daily streak is already gentle: missing a day loses nothing.
  - The Library Card is pick-a-page, not a random draw.
  - Pages are never sold.
  - **One to look at:** the Big Book Pass makes every friend join at once. That's close to "level up by paying", so I'd change it to add pages, or make it cosmetic.
  - **To add:** a gentle "good place to stop" card after a few matches in a row, and a clear way out of every screen.
- **A grown-ups' page** (behind the gate). It would show:
  - facts learned this week
  - play time
  - switches for ads, purchases and play reminders

  It builds trust with parents, which is who writes reviews and pays.

## 3. Turning busted myths into real learning

The research on how children remember is strong.

- **Retrieval works for children.** Being asked to recall something beats seeing it again, and this holds for children of different reading ability ([Haebig et al., 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8740735)).
- **It works best when effortful but successful** ([Current Directions in Psychological Science](https://www.psychologicalscience.org/journals/current-directions/0963721418806673/)).
- **Spacing the reviews out roughly doubled recall** in young children ([Northampton](https://pure.northampton.ac.uk/en/publications/expanding-retrieval-practice-an-effective-aid-to-preschool-childr)).
- **Games can do this without feeling like a quiz,** but younger children need clear cues ([EEF](https://educationendowmentfoundation.org.uk/news/retrieval-practice-a-game-of-hide-and-seek)).

What we have now:
- facts pop up when a myth is busted
- an optional "the Kid has a question" quiz after a stage
- the Diary

**Proposal: Myth Check.**
- **When:** now and then, just before a myth you've busted before walks in.
- **What:** a two-choice question with pictures, read aloud: "True or busted?"
- **Reward:** a correct answer gives that myth a "You know this one!" weakness for the match (the game already has this bonus).
- **Spacing:** questions are scheduled on a widening gap per fact (1, 3, 7 and 14 days), using the dates we already store.
- **Measuring it:** the Diary gains a "facts you really know" count, and the grown-ups' page shows it.

## 4. Reasons to come back that aren't chores

- **Survivor.io and Archero:**
  - Survivor.io has stayed popular for years on three things: replayable runs, unlocks outside the runs, and regular limited-time events ([Symphony](https://www.gf.symphonyonline.co.uk/news/how-survivor.io-continues-to-pull-in-5-million-a-month-three-years-later)).
  - Early on it was criticised for spending that didn't make you stronger ([Mobilegamer](https://mobilegamer.biz/two-months-in-survivor-io-passes-75m-from-37m-downloads/)).
  - Archero 2 adds survival rounds, boss battles, a tower and resource dungeons ([Android Authority](https://www.androidauthority.com/archero-2-3517511/)). Reviewers found the pile of daily tasks overwhelming, like busywork ([HighGround](https://www.highgroundgaming.com/?p=139917)).
- **For us:** add a few modes and keep them small.
  - **Daily Myth.** One short stage a day with a twist, the same for every player that day: all flyers, double speed, or one friend only. It gives a small fixed prize, and nothing is lost if you skip it.
  - **The Endless Stacks.** Waves keep coming until Dad runs out of Patience, with your best wave saved. This is where Team Power gets tested once the story is done.
  - **Myth of the Month.** A themed month (for example ocean myths) with one event friend whose pages drop that month. Missed event friends come back later, so there's no fear of missing out.
- **What not to add:** no energy timers, no stacks of daily chores, no loot boxes.

## 5. Distribution options

Apple Arcade takes finished or in-progress games by pitch, and it's subscription-only. Commentary from its launch says games with microtransactions and ads aren't considered ([GameAnalytics](https://www.gameanalytics.com/blog/apple-arcade-mobile-game-developers), [Apple](https://developer.apple.com/jp/apple-arcade/)). A version with no ads and no purchases would fit Arcade's family audience. It's worth deciding before launch which path we take, because it changes the economy work.

## Suggested order

| # | What | Why first | Size |
|---|---|---|---|
| 1 | Sound effects, music and haptics | the biggest missing piece of game feel | medium |
| 2 | Child-directed ad flags, Pass review, a stopping-point card | compliance and trust, small changes | small |
| 3 | Myth Check (spaced, picture-based, read aloud) | makes the learning promise real | medium |
| 4 | Daily Myth and the Endless Stacks | replay without chores | medium |
| 5 | Grown-ups' page | parents' trust; shows facts learned | small |
| 6 | Myth of the Month events | long-term reason to return | medium, ongoing |
| 7 | Decide App Store vs Apple Arcade | shapes how the game makes money | decision |
