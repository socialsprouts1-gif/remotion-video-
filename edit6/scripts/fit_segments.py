import re,json,functools,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
words=[w for w in open(os.path.join(ROOT,'script.txt')).read().split() if w!='—']
SPEC={'whatsapp':3,'akola':3,'software':2,'automation':4,'automatically':5,'complicated':4,'example':3,'salon':2,'template':2,'appointment':3,'calendar':3,'schedule':2,'products':2,'location':3,'11:42':6,'walk-in':2,'intelligently':5,'questions':2,'available':4,'businesses':4,'business':2,'opportunity':5,'product-based':3,'ai':2,'specifically':5,'serious':3,'customer':3,'according':3,'option':2,'directly':3,'iphone':3,'macbook':2,'ipad':2,'18':2,'burgundy':3,'wadhwa.official':6,'instagram':3,'highlights':2,'wisely':2,'diwali':3,'exchange':2,'delta':2,'trading':2,'details':2,'information':4}
def syl(w):
    l=re.sub(r'[^a-z0-9.]','',w.lower())
    if l in SPEC: return SPEC[l]
    return max(1,len(re.findall(r'[aeiouy]+',l)))
S=[syl(w) for w in words]
P=[(0.0, 1.16), (5.62, 5.98), (10.04, 10.44), (14.33, 14.81), (18.86, 19.27), (21.81, 22.17), (30.29, 30.78), (35.48, 36.07), (40.13, 40.67), (42.09, 42.31), (44.9, 45.31), (50.62, 51.16), (51.76, 52.42), (52.93, 53.36), (55.67, 56.01), (58.11, 58.64), (60.26, 60.71), (63.26, 64.04), (70.34, 70.97), (72.23, 72.92), (74.3, 74.74), (76.3, 77.08)]
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
