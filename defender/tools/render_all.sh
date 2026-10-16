#!/bin/sh
# render every creep / boss model that has no sheet yet (creeps 160 px cells, bosses 192)
cd "$(dirname "$0")"
for d in meshy_out/creep_* meshy_out/boss_*; do
  n=$(basename "$d"); [ -f "$d/model.glb" ] || continue; [ -f "../assets/3d/${n}_idle.png" ] && continue
  case "$n" in boss_*) sz=192;; *) sz=160;; esac
  node render_sheet.mjs "$d" --name "$n" --out ../assets/3d --size $sz 2>&1 | grep -E "sheet|error" | head -2
done
