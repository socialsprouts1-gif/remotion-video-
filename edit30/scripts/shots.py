"""Shot cut list for the editorial-style edit: each shot starts just before a spoken word.
Writes src/shots.json (start times in seconds) used by both the picture and the score."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(f"{ROOT}/src/edit.json"))
by = {}
for w in d["words"]: by.setdefault(w["line"], []).append(w)
W = lambda l, k: by[l][k]["s"]
CUTS = [None, (1, 0), (2, 0), (3, 0), (3, 8), (4, 0), (5, 0), (6, 0), (7, 0), (8, 0), (9, 0), (10, 0)]
starts = [0.0] + [round(W(l, k) - 0.12, 3) for (l, k) in CUTS[1:]]
end = round(by[10][9]["e"] + 1.0, 3)
json.dump({"starts": starts, "end": end}, open(f"{ROOT}/src/shots.json", "w"))
print(len(starts), "shots; end card at", end)
