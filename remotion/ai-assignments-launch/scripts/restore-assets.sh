#!/usr/bin/env bash
# Rebuild all binary render assets from tracked sources.
# Renders themselves are intentionally not tracked (repo policy).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio

# 1. paper grain plate (procedural)
ffmpeg -y -v error -f lavfi -i "nullsrc=s=960x540,format=gray,geq=lum='random(1)*255'" \
  -frames:v 1 -update 1 public/grain.png

# 2. engraved thesis plate (tracked as base64 text)
base64 -d assets-src/thesis-plate.jpg.b64 > public/thesis-plate.jpg

# 3. VO stems (tracked as base64 m4a; decoded back to wav for the mix)
for i in 1 2 3 4 5 6 7 8; do
  base64 -d "assets-src/vo${i}t.m4a.b64" > "/tmp/vo${i}t.m4a"
  ffmpeg -y -v error -i "/tmp/vo${i}t.m4a" -ar 44100 -ac 2 "public/audio/vo${i}t.wav"
done

# 4. score + final mix
python3 scripts/make_bed.py
bash scripts/mix.sh

echo "assets restored — ready to render:"
echo "  npm install && npm run render"
