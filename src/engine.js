// LATAF engine - JavaScript port (identical rules to lataf_engine.py). Deterministic; the model never computes.
const LATAF = (() => {
const CRIT = {T1:["Technical",0.25,"Water management performance"],T2:["Technical",0.2,"Geochemical performance"],T3:["Technical",0.2,"Geotechnical stability"],T4:["Technical",0.15,"Ecological performance"],T5:["Technical",0.1,"Infrastructure management"],T6:["Technical",0.1,"Closure performance demonstration"],
R1:["Regulatory",0.25,"Closure compliance"],R2:["Regulatory",0.2,"Permit alignment"],R3:["Regulatory",0.25,"Relinquishment feasibility"],R4:["Regulatory",0.2,"Regulatory acceptance pathway"],R5:["Regulatory",0.1,"Post-closure liability requirements"],
F1:["Financial",0.25,"Liability understanding"],F2:["Financial",0.25,"Funding sufficiency"],F3:["Financial",0.2,"Long-term stewardship burden"],F4:["Financial",0.15,"Cost optimization opportunity"],F5:["Financial",0.15,"Economic feasibility"],
S1:["Stakeholder",0.25,"Community expectations alignment"],S2:["Stakeholder",0.25,"Indigenous relationships"],S3:["Stakeholder",0.2,"Land use compatibility"],S4:["Stakeholder",0.2,"Social commitments fulfillment"],S5:["Stakeholder",0.1,"Stewardship expectations"],
G1:["Governance",0.25,"Accountability structure"],G2:["Governance",0.25,"Transition governance"],G3:["Governance",0.2,"Decision-making effectiveness"],G4:["Governance",0.2,"Organizational capacity"],G5:["Governance",0.1,"Role clarity"]};
const IDS = Object.keys(CRIT), DIMS = ["Technical","Regulatory","Financial","Stakeholder","Governance"], DW = 0.2;
const JCA = {4:0.85,3:0.90,2:0.95,1:1.00}, CAF = {"Very High":1.0,High:0.95,Moderate:0.9,Low:0.8,"Very Low":0.7};
// Evidence confidence level (v3.2 / ATRF 1.0): weakest of the five evidence sub-ratings; any open decision-critical gap caps the level at Low.
function evidenceLevel(weakestSub, openCritical){ if(weakestSub==null) return "Low"; let lv = weakestSub>=5?"Very High": weakestSub>=4?"High": weakestSub>=3?"Moderate": weakestSub>=2?"Low":"Very Low"; if((openCritical||0)>0 && (lv==="Very High"||lv==="High"||lv==="Moderate")) lv="Low"; return lv; }
const TH = {A:[80,60,40],B:[70,50,30],C:[75,55,35]};
const CATS = ["Transition ready","Transition achievable with intervention","Significant transition barriers","Fundamental reassessment required"];
const RULES = {
 "atrf":{caf:true,jcaAlways:false,facility:false,wCap:null,e4cap:false,navigator:true,label:"Navigator 2.0.1 (ATRF 1.0 engine)"},
 "v3.2":{caf:true,jcaAlways:false,facility:false,wCap:null,label:"v3.2-PILOT (as built)"},
 "v3.3":{caf:false,jcaAlways:false,facility:false,wCap:null,label:"v3.3 candidate"},
 "v3.4":{caf:false,jcaAlways:true,facility:true,wCap:4,label:"v3.4 candidate"},
 "v3.4c":{caf:false,jcaAlways:true,facility:true,wCap:4,calibrated:true,label:"v3.4c calibrated (interim bounds E4 -1/+2, E3 -1/+1; ordinal draws; rho on E3/E4/W)"}};
const LOW = {E1:0,E2:0,E3:0,E4:1,W:1}, HIGH = {E1:0,E2:0,E3:1,E4:1,W:0}, CAP = {E1:5,E2:5,E3:4,E4:3,W:4};
function used(c, r){ let x = c.rating;
  if (r.facility && c.facilities){ const subs=[]; for (const f of c.facilities){ if(!f.applicable) continue; let s=f.sub; if(f.basis==="visual") s=Math.min(s,3); if(f.basis==="none") s=Math.min(s,2); subs.push(s);} if(subs.length) x=Math.min(...subs); }
  if (c.grade==="E4" && r.e4cap!==false) x=Math.min(x,3); if (r.wCap!==null && c.grade==="W") x=Math.min(x,r.wCap); return x; }
const CLOW = {E1:0,E2:0,E3:1,E4:1,W:1}, CHIGH = {E1:0,E2:0,E3:1,E4:2,W:0}; // interim calibrated bounds from the pilot site A desktop -> site-confirmed pairs (29 Sep -> 30 Oct 2026); re-estimate after each workshop (CAL-40)
function bounds(c, r){ const x=used(c,r), g=c.grade; if(r.navigator) return [x,x]; if(r.calibrated){ let lo=Math.max(1,x-CLOW[g]), hi=Math.min(5,x+CHIGH[g]); if(c.delib){ lo=Math.min(lo,Math.min(...c.delib)); hi=Math.max(hi,Math.max(...c.delib)); } return [lo,hi]; } let lo=Math.max(1,x-LOW[g]), hi=Math.min(5,x+HIGH[g]); hi = x<CAP[g]? Math.min(hi,CAP[g]) : x;
  if (c.delib){ lo=Math.min(lo,Math.min(...c.delib)); hi=Math.max(hi,Math.max(...c.delib)); } return [lo,hi]; }
function dims(vals){ const o={}; DIMS.forEach(d=>o[d]=0); for (const id of IDS) o[CRIT[id][0]] += CRIT[id][1]*vals[id]*20; return o; }
function brs(vals){ const d=dims(vals); return DIMS.reduce((s,k)=>s+DW*d[k],0); }
function band(t, th){ return t>=th[0]?CATS[0]: t>=th[1]?CATS[1]: t>=th[2]?CATS[2]: CATS[3]; }
function tri(b, jca, toa, caf=1){ return b*caf*jca + toa*b; }
function confClass(crits, weakestSub){ const share=crits.reduce((s,c)=> s + ((c.grade==="E1"||c.grade==="E2")? DW*CRIT[c.id][1]:0),0);
  if (share>=0.6 && weakestSub>=4) return "Measured"; if (share<0.3 || weakestSub<=2) return "Inferred"; return "Indicated"; }
function run(crits, opts){ const r=RULES[opts.version], th=TH[opts.thresholds||"A"];
  const vals={}, los={}, his={}; for (const c of crits){ vals[c.id]=used(c,r); const [lo,hi]=bounds(c,r); los[c.id]=lo; his[c.id]=hi; }
  const jca = (r.jcaAlways||opts.institutionDependent)? JCA[opts.jci]:1.0; const level = opts.confidenceLevel || evidenceLevel(opts.weakestSub, opts.openCritical); const caf = r.caf? CAF[level]:1.0;
  const b=brs(vals), bl=brs(los), bh=brs(his); const t=tri(b,jca,opts.toa,caf), tl=tri(bl,jca,opts.toa,caf), thi=tri(bh,jca,opts.toa,caf);
  const nearest=th.reduce((a,v)=>Math.abs(t-v)<Math.abs(t-a)?v:a,th[0]); const distance=t-nearest;
  const cls=confClass(crits, opts.weakestSub??3); let cat=band(t,th); const cl=band(tl,th), ch=band(thi,th); if (cat===CATS[0]&&cls!=="Measured") cat=CATS[1];
  const fatal=crits.filter(c=>c.fatal).length; let result, decision;
  if (r.navigator){ const d=dims(vals); const red=DIMS.filter(k=>d[k]<40).length; let cat0=band(t,th), guard="None"; if(fatal){ guard="Fatal flaw"; cat0=CATS[3]; } else if(red>0&&(cat0===CATS[0]||cat0===CATS[1])){ guard="Dimension in the red"; cat0=CATS[2]; } else if((level==="Low"||level==="Very Low")&&cat0===CATS[0]){ guard="Low evidence confidence"; cat0=CATS[1]; }
    const nav=cat0===CATS[0]?"Proceed":cat0===CATS[1]?"Proceed with validation":cat0===CATS[2]?"Reassess pathway":"Escalate decision"; const next=(cat0===CATS[2]||cat0===CATS[3])?"Tier 2 REQUIRED":cat0===CATS[1]?((opts.jci>=3)?"Tier 2 recommended":"Tier 2 optional"):"Tier 2 optional";
    return {version:opts.version, dims:d, BRS:b, BRS_low:b, BRS_high:b, JCA:jca, CAF:caf, level, TOA:opts.toa, TRI:t, TRI_low:t, TRI_high:t, band:cat0, band_low:cat0, band_high:cat0, cls:"Point estimate (ATRF has no evidence range)", fatal, result:`${cat0} - ATRF 1.0 point reading; safety rule: ${guard}; ${next}`, decision:nav, vals, los:vals, his:vals}; }
  if (fatal||thi<th[2]) {result="Fundamental reassessment required"; decision="Escalate decision";}
  else if (cl!==ch) {result=`Information-limited: ${cl} to ${ch}`; decision="Proceed with validation";}
  else if (cat===CATS[2]) {result=`${cat} - robust to the evidence range`; decision="Reassess pathway";}
  else {result=`${cat} - robust to the evidence range`; decision="Proceed";}
  return {version:opts.version, dims:dims(vals), BRS:b, BRS_low:bl, BRS_high:bh, JCA:jca, CAF:caf, TOA:opts.toa, TRI:t, TRI_low:tl, TRI_high:thi, band:cat, band_low:cl, band_high:ch, cls, fatal, result, decision, vals, los, his, nearest, distance};
}
// Monte Carlo with optional shared-optimism factor on W-line criteria and structural draws
function mulberry(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function triDraw(u,lo,mode,hi){ if(hi-lo<1e-9) return mode; const f=(mode-lo)/(hi-lo); return u<f? lo+Math.sqrt(u*(hi-lo)*(mode-lo)) : hi-Math.sqrt((1-u)*(hi-lo)*(hi-mode)); }
function normInv(p){ // Acklam approximation
  const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];
  const pl=0.02425,ph=1-pl; let q,r; if(p<pl){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);} if(p<=ph){q=p-0.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);} q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
function normCdf(z){ const t=1/(1+0.2316419*Math.abs(z)); const dd=0.3989423*Math.exp(-z*z/2); let p=dd*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; }
// Monte Carlo. Independent draws by default; with rho>0 a Gaussian copula ties the W-line (site-statement) criteria to one shared factor:
// z_i = rho*Z + sqrt(1-rho^2)*e_i, u_i = Phi(z_i). Structural draws: toaRange (Tier 2 deduction closing), jcaOptions (CAL-27), fixed threshold set.
// Ordinal draw: integer ratings in [lo,hi], mode x, weights 1/(1+|k-x|) (x=3, 2..5 -> P 0.21/0.43/0.21/0.14)
function ordDraw(u,lo,x,hi){ let tot=0; const w=[]; for(let k=lo;k<=hi;k++){ const v=1/(1+Math.abs(k-x)); w.push(v); tot+=v; } let acc=0; for(let i=0;i<w.length;i++){ acc+=w[i]/tot; if(u<=acc) return lo+i; } return hi; }
function simulate(crits, opts, n=8000, seed=42){ const r=RULES[opts.version], th=TH[opts.thresholds||"A"], rnd=mulberry(seed); const discrete = opts.discrete ?? !!r.calibrated; const rhoE3 = opts.rhoE3 ?? !!r.calibrated;
  const rho = opts.rho||0; const jcaBase=(r.jcaAlways||opts.institutionDependent)? JCA[opts.jci]:1.0, caf=r.caf?CAF[opts.confidenceLevel||evidenceLevel(opts.weakestSub,opts.openCritical)]:1.0;
  const pre=crits.map(c=>{const x=used(c,r); const [lo,hi]=bounds(c,r); return {id:c.id,w:DW*CRIT[c.id][1],x,lo,hi,W:(c.grade==="W")||(rhoE3&&(c.grade==="E3"||c.grade==="E4"))};});
  const out=new Float64Array(n); const counts=[0,0,0,0];
  for(let i=0;i<n;i++){ const Z=normInv(Math.min(0.9999,Math.max(0.0001,rnd()))); let b=0;
    for(const p of pre){ let u=rnd(); if(rho>0&&p.W){ const e=normInv(Math.min(0.9999,Math.max(0.0001,u))); u=normCdf(rho*Z+Math.sqrt(1-rho*rho)*e); } b+= p.w*(discrete? ordDraw(u,p.lo,p.x,p.hi) : triDraw(u,p.lo,p.x,p.hi)); }
    b*=20; const toa = opts.toaRange? (opts.toaRange[0]+rnd()*(opts.toaRange[1]-opts.toaRange[0])) : opts.toa;
    const jca = opts.jcaOptions? opts.jcaOptions[Math.floor(rnd()*opts.jcaOptions.length)] : jcaBase;
    const t=tri(b,jca,toa,caf); out[i]=t; counts[CATS.indexOf(band(t,th))]++; }
  const s=Array.from(out).sort((a,b)=>a-b); const q=p=>s[Math.min(n-1,Math.floor(p*n))];
  const probs={ready:counts[0]/n,achievable:counts[1]/n,barriers:counts[2]/n,reassess:counts[3]/n}; const se={}; for(const k of Object.keys(probs)) se[k]=Math.sqrt(probs[k]*(1-probs[k])/n);
  return {n,p10:q(0.1),p50:q(0.5),p90:q(0.9),mean:s.reduce((a,b)=>a+b,0)/n,probs,se,discrete,rhoE3,samples:s};
}
// Value of information: decision leverage of a gap = P(better category | affected criteria at upper bound, Tier 2 share released) - P(... | lower bound), in percentage points.
function leverage(crits, opts, gap, n=3000){ const base=opts; const mk=(side)=>crits.map(c=>{ if(!gap.criteria.includes(c.id)) return c; const r=RULES[opts.version]; const [lo,hi]=bounds(c,r); return Object.assign({},c,{rating:side==="hi"?hi:lo,grade:"E1",delib:null,facilities:null}); });
  const toaHi = Math.min(0, (opts.toa||0) + (gap.release||0)); const hi=simulate(mk("hi"),Object.assign({},base,{toa:toaHi,toaRange:null}),n,7), lo=simulate(mk("lo"),Object.assign({},base,{toaRange:null}),n,7);
  const better=p=>p.ready+p.achievable; return {pHi:better(hi.probs),pLo:better(lo.probs),leverage:100*(better(hi.probs)-better(lo.probs)),triHi:hi.p50,triLo:lo.p50}; }
return {CRIT,IDS,DIMS,JCA,CAF,TH,CATS,RULES,used,bounds,dims,brs,band,tri,confClass,evidenceLevel,run,simulate,leverage,normInv,normCdf,ordDraw};
})();
if (typeof module!=="undefined") module.exports=LATAF;
