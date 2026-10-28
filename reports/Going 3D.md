# Going 3D: plan

Why, Dad? Defender, after the Hopper test (build 71, PR #54).

## The goal

Real 3D characters and battles, the way the big mobile tower defense games look, while keeping:
- what already works: the story, Diary, Club, Cup, events and everything else;
- the storybook warmth.

## Three ways to do it

| | 1. 3D sprites (what we have) | 2. Live 3D in the web game (three.js) | 3. Rebuild in a game engine (Unity, Godot) |
|---|---|---|---|
| What you see | Pictures of 3D models, 8 facing directions | Real 3D: smooth turning, camera moves, lighting, depth | Real 3D, with the most polish possible |
| Outfits | Each hat and sweater rendered into every frame, or laid on top as flat pictures | Hats and sweaters are real 3D pieces on Dad's head and body, any combination | Same as option 2 |
| Keeps today's game | All of it | All the rules, screens, saves, shops and story. Only the drawing of the battle, home scene and Friends screen changes | Almost nothing. Every system is rebuilt |
| Phones | Lightest | Fine with low-poly, toon-shaded models and a modest number of animated characters (see Performance) | Best, but the app gets much bigger |
| Effort | Small | About 3–5 weeks of building, plus the models | Months |
| Web version | Yes | Yes | Only through a heavy web export |

**Recommendation: option 2, live 3D with three.js, inside the current game.**
- The game's rules (`G`, waves, abilities, Patience, scoring) stay exactly as they are.
- A new 3D renderer draws the same game state each frame, in place of today's 2D canvas drawing of the battle.
- Menus, cards, the Diary and shops stay as they are: crisp HTML is better there than 3D text anyway.
- three.js is already in the project's tools for the sprite renderer, so nothing new needs installing.

## The models (the part that decides how good it looks)

The Hopper test showed that the model's own texture matters most. Painting an untextured model from drawings blurs the face. So every character needs a properly textured model.

| Who | How many | How |
|---|---|---|
| Dad and the Kid | 2 | Meshy image-to-3D with texture, from turnaround drawings (front, side, back), then Meshy's free auto-rig and animations (walk, throw, cheer, hit). Human shapes rig automatically. |
| Friends | 28 | Meshy with texture from a clean front + side turnaround of each. Animals don't auto-rig, so either: (a) whole-body procedural motion (hop, lunge, wobble, tongue), already built and enough for most; or (b) Blender rigs for the ones that need limbs, such as the spider's legs and the owl's wings. Start with (a). |
| Myths and bosses | 13 kinds + 9 bosses | Already exist as Meshy models; only re-texture where needed. Paper-page myths animate in the shader (bend, flutter), with no skeleton, so dozens on screen stay cheap. |
| Hats and outfits | 11 hats + weapons | Small separate models attached to Dad's head bone or a friend's top. Sweater colours become a material colour swap on the sweater part of Dad's texture, the same idea as today's recolour. |
| Arenas | 8 | Low-poly ground pieces plus a few props each, from the existing painted art. |

**Cost (Meshy's official pricing):** image-to-3D 20–25 credits, texturing 10, rigging and animation free.
- About 30 new textured characters at about 35 credits each comes to **about 1,050 credits**.
- Plus about 300 for retries and hats, so **about 1,300–1,500 credits** in all.
- That's one or two months of a paid Meshy plan; check meshy.ai/pricing for the current plan prices.
- The account has 7 credits now.

**Turnarounds first:** for each character, the image model draws a front/side/back sheet in the game's style before Meshy sees it. The Hopper test showed this matters most for faces. Give Meshy a clean front view, not a three-quarter one.

## Performance plan (phones)

- **Animated characters:** only Dad and the 3–4 party friends are skinned (skeleton-animated).
- **Myths:** plain meshes moved and bent in the shader. Same-kind myths are drawn in one batch (instancing), so a 60-myth wave costs about a dozen draw calls, not 60.
- **Size:** models under about 8k triangles, textures 512–1024 px, compressed (meshopt geometry, KTX2 textures) so the download stays small.
- **Style:** toon shading with a 3-step ramp and an outline: the cheap look that also matches the storybook style.
- **Safety net:** a "2D mode" switch keeps today's renderer for very old phones, and as a fallback if WebGL fails.
- **Check:** test on a real iPhone at each phase. Forum reports show older iPhones struggling with many skinned meshes, which is why only the team is skinned.

## Phases

| Phase | What | Result |
|---|---|---|
| 0. Spike (2–3 days) | Battle in three.js with the models we already have: the myths, bosses, Hopper, and a temporary Dad. Real camera, toon shading, Patience ring and effects. | Measured frame rate on a phone, and the look in practice |
| 1. Models | Turnarounds, then Meshy (textured), rigs and animations for Dad, the Kid and the starting friends (Webster, Sparky, Hopper) | The first 5 characters in real 3D |
| 2. Battle renderer | All of the battle in 3D: attacks, projectiles, pops, bosses, elements, hit flashes. Same rules, same tests. | The game playable in 3D, with 2D mode as a fallback |
| 3. Outfits | 3D hats on the head bone, sweater colour swap, weapons in hand, team hats | The Wardrobe and gear in 3D |
| 4. The rest of the cast | The other 23 friends and the arenas | Everything in 3D |
| 5. Home and Friends | 3D home scene with a slow camera drift; a Friends screen where you turn your friend round to see the outfit | The "wow" screens |
| 6. Store refresh | New screenshots and a preview video from the 3D game | Store-ready |

## Decisions needed

1. **Meshy credits:** a paid plan for one to two months, about 1,300–1,500 credits.
2. **Go ahead with Phase 0:** it needs no new credits, because it uses the myth and boss models already made.

## Housekeeping

The existing Meshy models (myths, bosses, about 67 MB) exist only in this cloud container. `defender/tools/meshy_out/` isn't saved in the repo, so they'll be lost when the container is cleared. Phase 0 saves them, compressed, under `defender/assets/models/`.

Sources: [Meshy API pricing](https://docs.meshy.ai/api/pricing.md), [Meshy pricing and credits](https://docs.meshy.ai/pricing), [three.js forum: many skinned meshes](https://discourse.threejs.org/t/optimization-of-large-amounts-100-1000-of-skinned-meshes-cpu-bottlenecks/58196), [three.js forum: instancing with skinned meshes in a tower defense](https://discourse.threejs.org/t/how-to-optimize-performance-using-instancing-in-a-scene-full-of-skinned-mesh/5502).
