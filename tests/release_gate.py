#!/usr/bin/env python3
"""Release gate for the open edition: no client data may enter the public repository.
Scans every tracked text file for client and site identifiers and exits 1 when any remain.
Run before every public push: python3 tests/release_gate.py"""
import os,re,sys
TERMS=["Newmont","Golden Bear","Empire Mine","Woodcutters","San Mart","Valle de Siria","Rio Tinto","LASR","Vale ","Copper Cliff","0824138"]
EXT={'.html','.js','.py','.md','.json','.yml','.cff','.txt'}
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); hits=[]
for dp,dn,fn in os.walk(root):
    if '/.git' in dp: continue
    for f in fn:
        if os.path.splitext(f)[1] not in EXT or f=='release_gate.py': continue
        p=os.path.join(dp,f)
        try: s=open(p,encoding='utf-8',errors='ignore').read()
        except Exception: continue
        for t in TERMS:
            n=len(re.findall(re.escape(t),s))
            if n: hits.append((os.path.relpath(p,root),t,n))
if hits:
    print("RELEASE GATE: FAILED - client or site identifiers remain:"); 
    for p,t,n in sorted(hits): print(f"  {p}: '{t}' x{n}")
    sys.exit(1)
print("RELEASE GATE: PASSED - no client or site identifiers found"); sys.exit(0)
