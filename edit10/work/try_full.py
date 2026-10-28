import sys, os, subprocess, re, json
sys.path.insert(0,'scripts')
import align as A, pocketsphinx as ps
choice = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
cfg = ps.Config(lm=None); cfg["hmm"]=os.path.join(A.MD,"en-us"); cfg["dict"]=os.path.join(A.MD,"cmudict-en-us.dict"); cfg["loglevel"]="ERROR"
cfg["beam"]=1e-100; cfg["pbeam"]=1e-100; cfg["wbeam"]=1e-80
dec = ps.Decoder(cfg)
raw = subprocess.run(["ffmpeg","-v","error","-i","work/voice_clean.wav","-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
words = [w for w in open('script.txt').read().split() if w!='—']
names=[]; tok={}
for i,w in enumerate(words):
    k=re.sub(r"[^a-z0-9'/-]","",w.lower())
    alt = A.NUM[k][choice.get(str(i),0)] if k in A.NUM else k
    for p,sub in enumerate(alt.split()):
        n=f"w{i}p{p}"; dec.add_word(n, A.pron(sub), False); names.append(n); tok[n]=i
dec.set_align_text(" ".join(names))
dec.start_utt(); dec.process_raw(raw, full_utt=True); dec.end_utt()
h=dec.hyp(); print('score', h.score if h else None)
if h:
    span={}
    for s in dec.seg():
        if s.word in tok:
            i=tok[s.word]; a,b=s.start_frame/100,(s.end_frame+1)/100
            span[i]=(min(span.get(i,(a,b))[0],a),max(span.get(i,(a,b))[1],b))
    out=[{"w":w,"s":round(span[i][0],3),"e":round(span[i][1],3)} for i,w in enumerate(words)]
    json.dump(out,open('work/align.json','w'),ensure_ascii=False)
    sil=[(s.start_frame/100,(s.end_frame+1)/100) for s in dec.seg() if s.word in('<sil>','[NOISE]','<s>','</s>') or s.word.startswith('+')]
    print('silences', [(a,b) for a,b in sil if b-a>=0.15])
    for o in out: print(f"{o['s']:6.2f} {o['e']:6.2f} {o['w']}")
