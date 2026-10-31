# Source 3D models (compressed)

The Meshy models behind the 3D sprite sheets and the coming live-3D renderer: the myth kinds (`creep_<kind>`), the chapter bosses (`boss_<id>`) and three friends (`pet_hopper`, `pet_chroma`, `pet_inky`).

- **Compression:** `npx @gltf-transform/cli optimize <in> <out> --compress meshopt --texture-compress webp --texture-size 1024 --simplify false`. This took them from 67 MB to 5 MB.
- **Loading:** set `MeshoptDecoder` on three.js's `GLTFLoader` (`three/addons/libs/meshopt_decoder.module.js`).
- **Phase 1 (textured, from the turnaround drawings via `tools/meshy_multi.py`):** all 28 friends (`pet_<id>`, static) and `dad`, `kid` (rigged).
- **Clips:** rigged characters' animations are bone-only files `<name>_<clip>.glb` (25–120 KB), cut from Meshy's animation GLBs by `tools/clip_only.mjs`. Dad: idle, throw, cheer, ouch, wave, walking, running. Kid: idle, wave, cheer, walking, running. `r3d.js` lists which it uses in `ANIMS`.
- **Hats (Phase 3):** `hat_<id>` from the hat drawings (Meshy image-to-3D): top, wizard, cap, sun, grad, crown, santa, pilgrim, clubcap. `r3d.js` pins Dad's to his head bone and sits friends' team hats on the top of their model (`HATS3D` lists which exist). Still 2D only: laurel (its model came out upright with a stray ring), antlers, leafcrown, bow, flower, party.
- **Packing:** `tools/pack_models.sh` compresses every finished model in `tools/meshy_out/` into this folder.
- `pet_hopper_paint/` is the old way of colouring the untextured first Hopper test and is no longer used.
