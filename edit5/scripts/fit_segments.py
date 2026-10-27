import re,json,functools,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
words=[w for w in open(os.path.join(ROOT,'script.txt')).read().split() if w!='—']
SPEC={'iphone':3,'macbook':2,'ipad':2,'18':2,'burgundy':3,'wadhwa.official':6,'instagram':3,'highlights':2,'wisely':2,'diwali':3,'exchange':2,'delta':2,'trading':2,'details':2,'information':4}
def syl(w):
    l=re.sub(r'[^a-z0-9.]','',w.lower())
    if l in SPEC: return SPEC[l]
    return max(1,len(re.findall(r'[aeiouy]+',l)))
S=[syl(w) for w in words]
P=[(0.0,1.76),(8.65,9.15),(10.89,11.4),(12.28,12.51),(13.58,13.96),(17.35,18.53),(18.91,19.42),(19.99,20.49),(21.34,21.78),(24.46,25.41),(30.39,31.01),(31.71,32.07),(33.87,34.46),(34.93,35.15),(35.74,36.37),(37.54,37.82),(39.48,39.99),(43.5,43.71),(46.61,46.82),(49.06,49.22),(49.79,50.11),(51.78,52.24),(54.55,55.36),(58.39,58.87),(59.41,61.02)]
segs=[(P[i][1],P[i+1][0]) for i in range(len(P)-1)]
dur=[b-a for a,b in segs];K=len(segs);N=len(words)
rate=sum(S)/sum(dur)
punct=lambda i: bool(re.search(r'[.,?!]$',words[i-1]))
@functools.lru_cache(None)
def f(i,k):
    if k==K: return (0,()) if i==N else (1e9,())
    best=(1e9,())
    for j in range(i+1,N+1-(K-k-1)):
        r=sum(S[i:j])/dur[k]
        c=((r-rate)/rate)**2*4+(0 if j==N or punct(j) else 1.0)
        if c>best[0]: 
            if r>rate*3: break
            continue
        sub=f(j,k+1)
        if c+sub[0]<best[0]: best=(c+sub[0],(j,)+sub[1])
    return best
c,ends=f(0,0);i=0;out=[]
for k,j in enumerate(ends):
    print(f'{segs[k][0]:5.2f}-{segs[k][1]:5.2f} r={sum(S[i:j])/dur[k]:.1f}',' '.join(words[i:j]));out.append([segs[k][0],segs[k][1],i,j]);i=j
json.dump({'words':words,'syl':S,'segs':out},open(os.path.join(ROOT,'src','segs.json'),'w'))
