# Source 3D models (compressed)

The Meshy models behind the 3D sprite sheets and the coming live-3D renderer: the myth kinds (`creep_<kind>`), the chapter bosses (`boss_<id>`) and three friends (`pet_hopper`, `pet_chroma`, `pet_inky`).

- **Compression:** `npx @gltf-transform/cli optimize <in> <out> --compress meshopt --texture-compress webp --texture-size 1024 --simplify false`. This took them from 67 MB to 5 MB.
- **Loading:** set `MeshoptDecoder` on three.js's `GLTFLoader` (`three/addons/libs/meshopt_decoder.module.js`).
- **Phase 1 (textured, from the turnaround drawings via `tools/meshy_multi.py`):** `pet_webster`, `pet_sparky`, `pet_hopper` (static), and `dad`, `kid` (rigged; the walk and run clips are in `tools/meshy_out/<name>/`, not yet used by the game). `pet_hopper_paint/` is the old way of colouring the untextured first Hopper test and is no longer used.
