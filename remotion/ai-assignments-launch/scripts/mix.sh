#!/usr/bin/env bash
# Rebuild public/audio/film_audio.wav from the bed + trimmed VO stems.
set -euo pipefail
cd "$(dirname "$0")/../public/audio"

ffmpeg -y -v error -i bed.wav -i vo1t.wav -i vo2t.wav -i vo3t.wav -i vo4t.wav \
  -i vo5t.wav -i vo6t.wav -i vo7t.wav -i vo8t.wav -filter_complex "
[1]adelay=1200|1200[v1];[2]adelay=8800|8800[v2];[3]adelay=17800|17800[v3];[4]adelay=25800|25800[v4];
[5]adelay=37000|37000[v5];[6]adelay=52800|52800[v6];[7]adelay=63800|63800[v7];[8]adelay=72300|72300[v8];
[v1][v2][v3][v4][v5][v6][v7][v8]amix=inputs=8:normalize=0[vox];
[vox]asplit=2[voxa][voxb];
[0]volume=0.19[bedq];
[bedq][voxa]sidechaincompress=threshold=0.02:ratio=4:attack=90:release=550:makeup=1[bedd];
[bedd][voxb]amix=inputs=2:normalize=0,apad,atrim=0:80,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]
" -map "[out]" -c:a pcm_s16le film_audio.wav
echo "film_audio.wav rebuilt"
