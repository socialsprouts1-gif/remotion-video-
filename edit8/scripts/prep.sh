#!/bin/bash
# Cut each room from the raw walkthrough, stabilise (vidstab), speed it up, upscale to 1080x1920 and sharpen.
set -e
SRC=../short-raw/v8/walk.mp4
OUT=public/clips
mkdir -p $OUT /tmp/claude-0/vs
# id start end speed
while read id a b spd; do
  [ -z "$id" ] && continue
  d=$(python3 -c "print($b-$a)")
  ffmpeg -nostdin -v error -y -ss $a -t $d -i $SRC -an -vf "vidstabdetect=shakiness=8:accuracy=12:result=/tmp/claude-0/vs/$id.trf" -f null -
  ffmpeg -nostdin -v error -y -ss $a -t $d -i $SRC -an -vf "vidstabtransform=input=/tmp/claude-0/vs/$id.trf:smoothing=24:zoom=4:optzoom=0:interpol=bicubic,setpts=PTS/$spd,fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.9:5:5:0.0,hqdn3d=1.5:1.5:4:4" -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p $OUT/$id.mp4
  echo "$id $(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT/$id.mp4)"
done <<LIST
entrance 0.5 8.5 2.2
living 9.0 19.6 1.8
dining 20.0 25.0 1.6
kitchen 25.0 40.0 2.2
utility 40.2 47.0 2.0
bath 54.5 60.0 2.2
bed1 60.0 72.0 1.9
bed2a 72.0 77.3 2.0
bed2b 79.6 86.0 2.0
ensuite 86.0 89.0 2.0
balcony 89.0 96.0 1.8
finish 96.6 103.2 2.0
LIST
