#!/usr/bin/env bash
# Rebuild all binary assets from tracked sources (film v2).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/audio
ffmpeg -y -v error -f lavfi -i "nullsrc=s=960x540,format=gray,geq=lum='random(1)*255'" -frames:v 1 -update 1 public/grain.png
base64 -d assets-src/thesis-plate.jpg.b64 > public/thesis-plate.jpg
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  base64 -d "assets-src/v${i}.m4a.b64" > "/tmp/v${i}.m4a"
  ffmpeg -y -v error -i "/tmp/v${i}.m4a" -ar 44100 -ac 2 "public/audio/v${i}.wav"
done
python3 scripts/make_bed2.py
bash scripts/mix2.sh
