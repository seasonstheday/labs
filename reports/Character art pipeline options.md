# Character art pipeline options for Why, Dad? Defender

Researched 2026-10-14. Prices are public API list prices found on vendor pages and recent
aggregators; vendor pages were partly unreachable from the research sandbox, so verify in each
console before budgeting. Sources are listed at the end.

## The problem we are solving

1. **Gear doesn't fit.** Hats, vests, glasses and watches are drawn by code as vector overlays
   placed at anchor points that were tuned for the old hand-coded sprites. On the generated PNGs
   the heads and bodies sit elsewhere, so a hat floats and a vest lands on a shell. Nudging
   anchors per character will always look pasted on, because a flat vector hat on a shaded
   raster frog is two different drawings.
2. **Flat vs chunky.** Modern casual mobile games render toon-shaded 3D characters, which read as
   higher quality. Ours are flat picture-book PNGs (and the mascot art from the show is flat).

## Option 1: regenerate outfits as whole images (fixes gear now)

Keep the current style. For every friend and every outfit, ask an image model for "the same
character wearing a blue baseball cap" using the existing PNG as the reference. The game already
loads drop-in PNGs; it would look for `pet_hopper_cap.png` first and fall back to the plain
sprite plus the vector overlay.

| Need | Count |
|---|---|
| 9 friends × 4 looks (cap, vest, glasses, watch) | 36 images |
| Dad: 4 poses × 4 looks | 16 images |
| Kid: none | 0 |
| **Total with retries (~1.5×)** | **about 80 calls** |

Cost at $0.04–0.07 per image: **$3 to $6**. One afternoon. No change to gameplay code beyond
the file lookup. This is the "precanned combinations" idea from earlier in the project.

Rarity (Common → Legendary) can be shown by tinting the same outfit image in code (hue shift
on the hat only is hard; a coloured glow or a small gem badge is easy and reads fine).

## Option 2: restyle every character as "chunky 3D toon" stills (the look, cheaply)

Same pipeline as option 1, but the prompt asks for a 3D-rendered toon style (soft studio
lighting, rounded forms, like a Pixar-style mobile game) and we regenerate everything: 9 friends,
the Kid, **and Dad**, each in a few facing angles plus the outfits. Dad must be included or the
flat mascot will clash with 3D friends. The code's lunge, hop and squash motion stays and does the
animating.

| Need | Count |
|---|---|
| 11 characters × 3 angles (front-right, right, back-right) | 33 |
| Outfits as in option 1 | 52 |
| **Total with retries** | **about 130 calls, $8 to $15** |

Gives most of the visual lift of the screenshot at a fraction of the work. Risk: angle drift
between images of the same character; curation needed.

## Option 3: real 3D models rendered to sprite sheets (the full thing)

Turn each PNG into a rigged 3D model with Meshy or Tripo, add idle, walk, hit and attack
animations from their preset libraries, then render 8-direction sprite sheets in Blender with a
toon shader and outline. The game stays a light 2D canvas app that plays frames; no 3D engine
at runtime.

| Service | Price | Rigging and animation | Notes |
|---|---|---|---|
| Meshy Pro | $20/mo, about 20–25 credits per model (~$0.45) | Auto-rig for bipeds and quadrupeds, 500+ preset animations, rigging free | Best value and library |
| Tripo Pro | $19.90/mo, 30–60 credits per model (~$0.30–0.60) | Quadruped rigging is its strength, smaller animation library | Good for our animals |
| Hyper3D Rodin | ~$0.40–0.48 per run | No rigging | Overkill, realism-leaning |
| TRELLIS.2 + UniRig (open source) | $0 plus a 16 GB GPU | Rig yourself | Most work |

Estimated cost for 10 characters × 4 animations: **$20 to $40** in subscriptions plus a few
hours of Blender setup (free software; Blender runs on the Mac). I can write the Blender render
script and the game's sprite-sheet player; the renders have to run on a machine with Blender.
Custom moves that aren't in the preset library (a tongue lash, a web shot) need hand keyframes.

Video models (Seedance, Kling, Runway, Veo) were also checked: they can animate a still, but
none outputs transparency, identity drifts across hundreds of clips, and chroma-key cleanup is
the real cost. Useful for one-off effects, not for a character set.

## Which image model for options 1 and 2

Ranked for our need (same character across outfits and angles first, then price, then quality):

| Service | Price per 1K image | Consistency feature | Transparent output |
|---|---|---|---|
| Google Gemini image (Nano Banana; 2.5 Flash $0.039, 3.1 Flash $0.067, Pro $0.134) | multi-reference edits, best identity hold | no (key out a flat background, as we do now) |
| Black Forest Labs FLUX.1 Kontext pro $0.04 / FLUX.2 pro ~$0.03–0.05 | reference edits **with seeds** for repeatable reruns | no |
| OpenAI gpt-image-1.5 $0.034 (medium) | multi-reference edits | **yes, native** |
| Recraft V4 $0.035 (+$0.005 style) | locks art style across the whole set, SVG output | SVG is background-free |
| Scenario.com from $15/mo | train a per-character model once | remove-bg tool |
| Ideogram Character $0.10–0.20 | dedicated character reference | no |
| Midjourney | no official API | no |
| Grok Imagine $0.04–0.08 | new, unproven for consistency | no |

We already have a working Gemini key and script, and Gemini's edit mode is the strongest at
"same character, new outfit". The plan is to extend `defender/tools/gen_art.py` with an edit
mode that passes the existing PNG as the reference. FLUX is the fallback if we need seeds.

## Recommendation

1. **Do option 1 this week.** It fixes the gear problem for a few dollars with no gameplay risk.
2. **Decide on the look.** Keep the flat picture-book style (matches the show's mascot) or move
   everyone, Dad included, to chunky 3D toon (option 2). If 3D toon, do it before option 1 so
   outfits are generated once, in the final style.
3. **Option 3 only if animation quality becomes the priority.** It is the route the game in the
   reference screenshot took, and it is worth it once the game is otherwise finished.

## Sources

- Gemini pricing: https://ai.google.dev/gemini-api/docs/pricing
- OpenAI image models: https://developers.openai.com/api/docs/models/gpt-image-1.5 ; https://pricepertoken.com/gpt-image-pricing
- Black Forest Labs: https://bfl.ai/pricing ; https://help.bfl.ai/articles/3670520907-can-i-use-the-api-for-a-commercial-application
- Recraft: https://www.recraft.ai/docs/api-reference/pricing
- Ideogram: https://ideogram.ai/features/api-pricing
- Scenario: https://www.scenario.com/pricing
- Leonardo: https://docs.leonardo.ai/docs/generate-images-using-transparency
- Midjourney API status: https://www.myarchitectai.com/blog/midjourney-apis
- xAI Grok Imagine: https://docs.x.ai/docs/models ; https://openrouter.ai/x-ai/grok-imagine-image-2.0
- Stability: https://platform.stability.ai/pricing
- Meshy: https://docs.meshy.ai/en/webapp/pricing ; https://docs.meshy.ai/en/webapp/guides/3d-model/rigging
- Tripo: https://developers.tripo3d.ai/en/pricing ; https://www.tripo3d.ai/blog/ai-tools-for-rigging-and-animating-quadruped-or-non-humanoid-3d
- Hyper3D Rodin: https://fal.ai/models/fal-ai/hyper3d/rodin
- Hunyuan3D / TRELLIS: https://triposr.org/blog/hunyuan3d-vs-trellis ; UniRig https://github.com/VAST-AI-Research/UniRig
- Video models: https://devtk.ai/en/blog/ai-video-generation-pricing-2026/ ; https://unifically.com/blogs/runway-gen-4 ; https://benchlm.ai/media-pricing/veo ; https://docs.byteplus.com/en/docs/ModelArk/1587798 ; https://www.eesel.ai/blog/pika-ai-pricing
