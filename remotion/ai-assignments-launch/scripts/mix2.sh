#!/usr/bin/env bash
# Rebuild public/audio/film_audio.wav (film v2: score + 12 VO stems).
set -euo pipefail
cd "$(dirname "$0")/../public/audio"
ffmpeg -y -v error -i bed.wav -i v1.wav -i v2.wav -i v3.wav -i v4.wav -i v5.wav -i v6.wav -i v7.wav -i v8.wav -i v9.wav -i v10.wav -i v11.wav -i v12.wav -filter_complex "
[1]adelay=600|600[a1];[2]adelay=5200|5200[a2];[3]adelay=12200|12200[a3];[4]adelay=18000|18000[a4];
[5]adelay=25200|25200[a5];[6]adelay=37800|37800[a6];[7]adelay=42400|42400[a7];[8]adelay=52900|52900[a8];
[9]adelay=68200|68200[a9];[10]adelay=74200|74200[a10];[11]adelay=86400|86400[a11];[12]adelay=91000|91000[a12];
[a1][a2][a3][a4][a5][a6][a7][a8][a9][a10][a11][a12]amix=inputs=12:normalize=0[vox];
[vox]asplit=2[voxa][voxb];
[0]volume=0.19[bedq];
[bedq][voxa]sidechaincompress=threshold=0.02:ratio=3:attack=100:release=600:makeup=1[bedd];
[bedd][voxb]amix=inputs=2:normalize=0,apad,atrim=0:110,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]
" -map "[out]" -c:a pcm_s16le film_audio.wav
echo "film_audio.wav rebuilt (130s)"
