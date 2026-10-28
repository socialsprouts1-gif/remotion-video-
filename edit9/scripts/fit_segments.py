import re,json,functools,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
words=[w for w in open(os.path.join(ROOT,'script.txt')).read().split() if w!='—']
SPEC={'portfolio':4,'telegram':3,'multiply':3,'crorepati':4,'arabpati':4,'five-star':2,'jaane-anjaane':5,'khoon-paseene':4,'shyamlal':2,'biharilal':4,'deepak':2,'wadhwa':2,'nishchit':2,'bachaiye':4,'mushkil':2,'samajhna':3,'kripya':2,'scams':1,'scam':1,'market':2,'manage':2,'iphone':3,'macbook':2,'ipad':2,'18':2,'burgundy':3,'wadhwa.official':6,'instagram':3,'highlights':2,'wisely':2,'diwali':3,'exchange':2,'delta':2,'trading':2,'details':2,'information':4}
def syl(w):
    l=re.sub(r'[^a-z0-9.]','',w.lower())
    if l in SPEC: return SPEC[l]
    return max(1,len(re.findall(r'[aeiouy]+',l)))
S=[syl(w) for w in words]
P=[(0.0, 0.98), (6.02, 6.26), (8.1, 8.47), (11.44, 11.94), (13.94, 14.44), (19.28, 19.84), (23.79, 24.24), (25.04, 25.24), (26.9, 27.09), (28.93, 29.26), (35.79, 36.16), (41.34, 41.66), (43.35, 43.62), (49.97, 50.32), (54.57, 55.13), (56.31, 56.49), (56.83, 57.02), (59.22, 59.58), (65.57, 65.95), (72.51, 72.89), (73.78, 74.09), (74.19, 74.38), (75.51, 75.91), (79.69, 80.96)]
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
