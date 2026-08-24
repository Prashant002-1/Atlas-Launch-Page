#!/usr/bin/env bash
# Rebuild public/audio/film_audio.wav (film v2: score + 12 VO stems).
set -euo pipefail
cd "$(dirname "$0")/../public/audio"
ffmpeg -y -v error -i bed.wav -i v1.wav -i v2.wav -i v3.wav -i v4.wav -i v5.wav -i v6.wav -i v7.wav -i v8.wav -i v9.wav -i v10.wav -i v11.wav -i v12.wav -filter_complex "
[1]adelay=700|700[a1];[2]adelay=5900|5900[a2];[3]adelay=13600|13600[a3];[4]adelay=20200|20200[a4];
[5]adelay=28300|28300[a5];[6]adelay=35600|35600[a6];[7]adelay=44600|44600[a7];[8]adelay=58800|58800[a8];
[9]adelay=74500|74500[a9];[10]adelay=81400|81400[a10];[11]adelay=93800|93800[a11];[12]adelay=98400|98400[a12];
[a1][a2][a3][a4][a5][a6][a7][a8][a9][a10][a11][a12]amix=inputs=12:normalize=0[vox];
[vox]asplit=2[voxa][voxb];
[0]volume=0.16[bedq];
[bedq][voxa]sidechaincompress=threshold=0.02:ratio=3.5:attack=100:release=600:makeup=1[bedd];
[bedd][voxb]amix=inputs=2:normalize=0,apad,atrim=0:118,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[out]
" -map "[out]" -c:a pcm_s16le film_audio.wav
echo "film_audio.wav rebuilt (130s)"
