# Type and dialog readability

Why, Dad? Defender, build 63. Measured in headless Chromium at iPhone 15 size (393 × 852 points, 3× pixels).

## What we found

**1. The text is smaller on a phone than the code says.**
The game is laid out in a 440-wide frame and scaled to fit the screen. On an iPhone that scale is 0.89, so every size shrinks by about 11%.

| In the code | On an iPhone | Used for |
|---|---|---|
| 14–15 px | 12.5–13.4 pt | most body text: intros, card text, dialogue |
| 10–12 px | 8.9–10.7 pt | many labels: tile captions, "half: +3% more", rank lines |
| 8 px | 7.1 pt | the smallest badge |

Apple's iOS body text is 17 pt, and its smallest standard style (caption 2) is 11 pt. Our body text sits about 4 pt below that. Dozens of labels fall under Apple's 11 pt floor:
- Friends: 127 of 162 words on screen are under 14 pt.
- Diary: 142 of 216.
- Level up: 70 of 114.

**2. The body font is thin and has small lowercase letters.**
Patrick Hand is a handwriting font. It is charming in a heading, but its lowercase letters are short for its size and its strokes are thin, so at 12–13 pt it reads like a 10–11 pt sans. Children's reading guidance favours plain, sturdy sans-serifs with clearly different letters for body text. Andika, made for beginning readers, is the classic example.

**3. The grey "muted" text is low-contrast.**

| Colour pair | Contrast | WCAG AA (4.5:1) |
|---|---|---|
| #8b6d4b on the paper background | 3.8 : 1 | fails |
| #8b6d4b on the cream cards | 4.3 : 1 | fails |
| Proposed #6b5236 on paper | 5.8 : 1 | passes |
| Proposed #6b5236 on cards | 6.6 : 1 | passes |

It is used on intros, hints, sub-labels and the Diary's "half" lines, which is a lot of the reading in the game.

**4. Some boxes say too much.**

| Box | Words | Problem |
|---|---|---|
| Stage cleared | about 150 | seven stat rows, a flavour line, loot tiles and a notes strip that runs into the buttons |
| Level up | about 115 | each card has a 10–14 word description plus numbers like "+6% critical hits for everyone, per rank" |
| Diary topics | 9 tiles × 5 lines | the "half: +3% more" line is small, grey and rarely needed |

## Benchmarks

- **Apple HIG:** body 17 pt; smallest standard style 11 pt (caption 2). Text should grow with Dynamic Type.
- **Xbox and Game Accessibility Guidelines:** a floor of 28 px on a 1080p TV, scaled up for phone screen density. Treat it as a floor, not a goal.
- **Children's reading research:** beginning readers need larger type than adults, especially on buttons and links, and letters that are easy to tell apart (b/d/p/q, l/I/1).
  - Single-storey a and g are common in school fonts.
  - Studies found children read standard and "infant" letterforms equally well, so clean, sturdy shapes matter more than the a/g style.
- **Kids' games** (Toca Boca, Pokémon, Animal Crossing, Duolingo ABC): a rounded display font for titles, a plain rounded sans for reading, and short labels with the detail one tap away.

## Font test

The same screens were set in four fonts at a larger size with the darker grey. Images: `img/type_levelup.png`, `img/type_clear.png`, `img/type_diary.png`. In each, left to right: today, Nunito, Andika, Baloo 2.

| Font | Readability at small size | Fit with Fredoka titles | Space used | Verdict |
|---|---|---|---|---|
| Patrick Hand (today) | thin, small lowercase | fun | compact | keep only for handwritten touches |
| **Nunito** | sturdy, open, clear at 12 pt | rounded ends match Fredoka without copying it | medium | **recommended** |
| Andika | the most legible | plain, a little "school worksheet" | wide; cards grow taller | good backup |
| Baloo 2 | good | too close to Fredoka, so titles stop standing out | compact | second choice |

## Recommendation

1. **Body font:** Nunito, SemiBold (600) for reading and ExtraBold (800) for emphasis. Fredoka stays for titles, buttons and numbers. Patrick Hand stays only for handwritten touches: Dad's notes and the Diary's "Study time" card.
2. **Type scale with a floor** (in the 440 frame, then on an iPhone):

   | Use | Size in code | On an iPhone |
   |---|---|---|
   | Body | 17–18 px | 15–16 pt |
   | Secondary | 15 px | 13.4 pt |
   | Small labels (minimum) | 13 px | 11.6 pt |

   Nothing goes under 13 px. The existing **Bigger text** setting adds about 2 px on top of this.
3. **Darker grey:** #6b5236 for the muted colour, so every grey label passes WCAG AA.
4. **One idea per box,** about 12 words of body text per card at most, with detail behind a tap:
   - **Stage cleared:**
     - Three big numbers in a row: Myths, Coins and Gems, with the Diary bonus folded into the coin total.
     - The loot tiles stay.
     - The lucky-page and month-page notes become small chips.
     - The flavour line goes.
   - **Level up:** every ability description is cut to one short line (8 words or fewer). The rank numbers move to the ⓘ detail.
   - **Diary topics:** the "half: +3% more" line moves into the topic's tap card.
   - **Intros at the top of screens:** one short sentence each.

Expected result: the smallest text goes from 7–10 pt to about 11.6 pt or more, body text from about 13 pt to 15–16 pt, every grey label passes contrast, and the Stage cleared card drops from about 150 words to about 60.

Sources: [Apple HIG, Typography](https://developer.apple.com/design/human-interface-guidelines/typography.md), [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/?p=3285), [Xbox Accessibility Guideline 101: text display](https://devdocs.xbox.com/gaming/accessibility/xbox-accessibility-guidelines/101), [UXmatters: typography in applications for children](https://www.uxmatters.com/mt/archives/2011/06/effective-use-of-typography-in-applications-for-children-3.php), [type.today: children's book typography](https://type.today/en/journal/childrens_book_typography), [Made Good Designs: best fonts for kids](https://madegooddesigns.com/best-fonts-for-kids/).

## Done (build 64)

- Reading text is now Nunito: SemiBold for normal text, ExtraBold where the old font was bold. Fredoka stays for titles, buttons and numbers. The home-screen tagline keeps the handwriting font.
- Sizes went up, with a floor:
  - nothing on screen is under 13 px in the frame (about 11.6 pt on an iPhone), except tiny number badges;
  - body text is 16–18 px (about 14–16 pt).
- The muted grey is now #6b5236, which passes WCAG AA on every background.
- Stage cleared:
  - three big numbers for Myths, Coins and Gems;
  - one short line for new facts, level and the Diary bonus;
  - larger loot tiles;
  - one note per line;
  - no flavour line except at a chapter's end.
- All 87 ability descriptions are 8 words or fewer.
- The Diary shows the next milestone only on the topic you've picked.
- Screen intros are one sentence each.

Before and after: `img/type_before_after.png`.
