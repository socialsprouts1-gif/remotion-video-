import re,json,functools,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
words=[w for w in open(os.path.join(ROOT,'script.txt')).read().split() if w!='—']
SPEC={'excitement':3,'successful':3,'realise':3,'decision':3,'potential':3,'reality':4,'actually':3,'zaroori':3,'options':2,'scary':2,'idea':3,'ideas':3,'convert':2,'signing':2,'vivek':2,'whatsapp':3,'akola':3,'software':2,'automation':4,'automatically':5,'complicated':4,'example':3,'salon':2,'template':2,'appointment':3,'calendar':3,'schedule':2,'products':2,'location':3,'11:42':6,'walk-in':2,'intelligently':5,'questions':2,'available':4,'businesses':4,'business':2,'opportunity':5,'product-based':3,'ai':2,'specifically':5,'serious':3,'customer':3,'according':3,'option':2,'directly':3,'iphone':3,'macbook':2,'ipad':2,'18':2,'burgundy':3,'wadhwa.official':6,'instagram':3,'highlights':2,'wisely':2,'diwali':3,'exchange':2,'delta':2,'trading':2,'details':2,'information':4}
def syl(w):
    l=re.sub(r'[^a-z0-9.]','',w.lower())
    if l in SPEC: return SPEC[l]
    return max(1,len(re.findall(r'[aeiouy]+',l)))
S=[syl(w) for w in words]
P=[(0.0, 0.05), (1.1, 1.31), (6.07, 6.29), (7.12, 7.53), (7.73, 7.91), (8.58, 8.79), (10.97, 11.24), (14.45, 16.29), (18.1, 19.05), (22.23, 22.48), (24.06, 24.35), (32.95, 33.21), (34.93, 35.28), (37.26, 37.52), (37.61, 37.79), (37.93, 38.13), (39.93, 40.23), (40.89, 41.2), (41.56, 42.4)]
segs=[(P[i][1],P[i+1][0]) for i in range(len(P)-1)]
dur=[b-a for a,b in segs];K=len(segs);N=len(words)
rate=sum(S)/sum(dur)
punct=lambda i: bool(re.search(r'[.,?!…]$',words[i-1]))
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
