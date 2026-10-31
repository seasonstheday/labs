#!/bin/bash
# Compress every finished Meshy model into the game: meshy_out/<name>/model.glb (rigged.glb for people) -> assets/models/<name>.glb
# (meshopt geometry, WebP textures at 1024 px; about 2-3 MB down to 150-320 KB), skipping ones already packed and newer.
cd "$(dirname "$0")"
for d in meshy_out/*/; do n=$(basename "$d"); case $n in pet_*_untextured*|*_test) continue;; pet_*|hat_*|dad|kid) ;; *) continue;; esac
  src="$d/model.glb"; [ -f "$d/rigged.glb" ] && src="$d/rigged.glb"; [ -f "$src" ] || continue
  out="../assets/models/$n.glb"; [ -f "$out" ] && [ "$out" -nt "$src" ] && continue
  npx --yes @gltf-transform/cli optimize "$src" "$out" --compress meshopt --texture-compress webp --texture-size 1024 --simplify false 2>&1 | tail -1
done
