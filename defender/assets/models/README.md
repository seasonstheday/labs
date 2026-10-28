# Source 3D models (compressed)

The Meshy models behind the 3D sprite sheets and the coming live-3D renderer: the myth kinds (`creep_<kind>`), the chapter bosses (`boss_<id>`) and three friends (`pet_hopper`, `pet_chroma`, `pet_inky`).

- **Compression:** `npx @gltf-transform/cli optimize <in> <out> --compress meshopt --texture-compress webp --texture-size 1024 --simplify false`. This took them from 67 MB to 5 MB.
- **Loading:** set `MeshoptDecoder` on three.js's `GLTFLoader` (`three/addons/libs/meshopt_decoder.module.js`).
- **Hopper:** `pet_hopper` is untextured. The sheets colour it at render time with `render_sheet.mjs --paint assets/models/pet_hopper_paint` (the front, side and back drawings, kept here). It gets a textured model in Phase 1 (see `reports/Going 3D.md`).
