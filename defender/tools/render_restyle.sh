#!/bin/sh
# Re-render every creep and boss that has a packed model (assets/models) in the ink style: twice the old cell size,
# a thicker brown outline and two-tone shading with a cool shadow. Usage: sh render_restyle.sh [name ...]
# Needs: npm install in this folder; CHROME pointing at a Chromium (default /opt/pw-browsers/chromium).
cd "$(dirname "$0")"; export CHROME="${CHROME:-/opt/pw-browsers/chromium}"
TMP=$(mktemp -d); names="$*"
[ -n "$names" ] || names=$(ls ../assets/models | grep -E '^(creep|boss)_.*\.glb$' | sed 's/\.glb$//')
for n in $names; do
  mkdir -p "$TMP/$n" "$TMP/out"; cp "../assets/models/$n.glb" "$TMP/$n/model.glb"
  case "$n" in boss_*) sz=384; ol=0.026; proc="";; *) sz=320; ol=0.03; proc="bump:0.5:6";; esac # creeps also get their shove frames
  node render_sheet.mjs "$TMP/$n" --name "$n" --out "$TMP/out" --size $sz --outline $ol --ramp "176,182,204;255,255,255" ${proc:+--proc "$proc"} 2>&1 | grep -E "error|Error" | head -2
  [ -f "$TMP/out/${n}_idle.png" ] || { echo "FAILED $n"; continue; }
  python3 -c "from PIL import Image; Image.open('$TMP/out/${n}_idle.png').save('../assets/3d/${n}_idle.webp', quality=90, method=6)" && cp "$TMP/out/$n.json" "../assets/3d/$n.json" && echo "rendered $n at $sz"
  [ -f "$TMP/out/${n}_bump.png" ] && python3 -c "from PIL import Image; Image.open('$TMP/out/${n}_bump.png').save('../assets/3d/${n}_bump.webp', quality=84, method=6)"
done
