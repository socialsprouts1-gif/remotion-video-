#!/bin/sh
# switch the project to clip N (1 or 2): data files + timing constants
set -e
cd "$(dirname "$0")/.."
N=$1
cp data/tl$N.json src/tl.json
cp data/raw$N.mp4 public/clips/raw.mp4
cp data/final$N.mp4 public/clips/final.mp4
python3 - "$N" <<'P'
import json,re,sys,subprocess
n=sys.argv[1]
d=json.load(open('src/tl.json'))['dur']
fin=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','public/clips/final.mp4'],capture_output=True,text=True).stdout)
raw=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','public/clips/raw.mp4'],capture_output=True,text=True).stdout)
p='src/Film.tsx';s=open(p).read()
s=re.sub(r'export const DURATION = [\d.]+;',f'export const DURATION = {int(fin)+1};',s)
s=re.sub(r'^const CLIP = [\d.]+;',f'const CLIP = {fin:.2f};',s,flags=re.M)
s=re.sub(r'^const RAW_LEN = [\d.]+;',f'const RAW_LEN = {raw:.2f};',s,flags=re.M)
s=re.sub(r'Podcast_Clip\d*',f'Podcast_Clip{n}',s)
open(p,'w').write(s)
print('clip',n,'final',fin,'raw',raw)
P
