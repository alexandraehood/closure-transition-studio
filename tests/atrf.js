// ATRF 1.0 engine - the Transition Navigator 2.0.1 calculation rules, reproduced from the workbook (Results - TRI & Heat Map; Settings & Lists). Deterministic.
const ATRF = (() => {
const S = NAV.settings, CRIT = NAV.crit, DIMS = ["Technical","Regulatory","Financial","Stakeholder","Governance"], DW = 0.2;
const BANDS = ["Transition ready","Transition achievable","Significant transition barriers","Fundamental reassessment required"];
function evidenceLevel(weakest, openCritical){ if(weakest==null) return ""; let lv = weakest>=5?"Very High": weakest>=4?"High": weakest>=3?"Moderate": weakest>=2?"Low":"Very Low"; if(openCritical>0 && (lv==="Very High"||lv==="High"||lv==="Moderate")) lv="Low"; return lv; }
function jci(complex){ // complex: {RC1..PL3: 1-4 complexity}; each sub-index takes its highest indicator; JCI = highest sub-index
  const g={RC:[],IC:[],SC:[],PL:[]}; for(const [k,v] of Object.entries(complex)){ if(v==null||v==="") continue; g[k.slice(0,2)].push(+v); }
  const sub={}; for(const k of Object.keys(g)) sub[k]= g[k].length<3? null : Math.max(...g[k]); const vals=Object.values(sub); if(vals.some(v=>v==null)) return {sub,jci:null,level:""};
  const j=Math.max(...vals); return {sub,jci:j,level:S.jciLevels[j-1]}; }
function dims(ratings){ const o={}; DIMS.forEach(d=>o[d]=0); const n={}; DIMS.forEach(d=>n[d]=0); for(const c of CRIT){ const r=ratings[c.id]; if(r==null||r==="") continue; o[c.dim]+= c.w*(+r)*S.ratingPct; n[c.dim]++; } for(const d of DIMS){ const tot=CRIT.filter(c=>c.dim===d).length; if(n[d]<tot) o[d]=null; } return o; }
function toa(brs, counts){ // counts: {n1,n2,n3,n4,n5,p1,p2,p3,p4,p5}
  const t=S.toaShare; const neg=Math.max(S.toaNegCap,(counts.n1||0)*t.n1+(counts.n2||0)*t.n2+(counts.n3||0)*t.n3+(counts.n4||0)*t.n4+(counts.n5||0)*t.n5); const pos=Math.min(S.toaPosCap,(counts.p1||0)*t.p1+(counts.p2||0)*t.p2+(counts.p3||0)*t.p3+(counts.p4||0)*t.p4+(counts.p5||0)*t.p5); return {neg:neg*brs,pos:pos*brs,points:(neg+pos)*brs,negShare:neg,posShare:pos}; }
function band(t){ return t>=S.triReady?BANDS[0]: t>=S.triAchievable?BANDS[1]: t>=S.triBarriers?BANDS[2]: BANDS[3]; }
function dimBand(v){ return v==null?"": v>=S.dimGreen?"Green": v>=S.dimYellow?"Yellow": v>=S.dimOrange?"Orange":"Red"; }
// inputs: {ratings:{id:1-5}, cited:{id:bool}, fatal:{id:bool}, eq:[5 values or null], openCritical:int, complex:{...}, pathway, counts:{...}, projectedGain:number, readinessFail:bool, materialityHigh:bool, liability:number}
function run(inp){ const d=dims(inp.ratings||{}); const complete=DIMS.every(k=>d[k]!=null); const brs= complete? DIMS.reduce((s,k)=>s+DW*d[k],0) : null;
  const eqVals=(inp.eq||[]).filter(v=>v!=null&&v!==""); const weakest= eqVals.length===5? Math.min(...eqVals.map(Number)) : null; const level=evidenceLevel(weakest, inp.openCritical||0); const caf= level? S.caf[level] : null;
  const J=jci(inp.complex||{}); const instDep = NAV.lists.pathInstDep[inp.pathway]; const jcaRaw= J.level? S.jca[J.level] : null; const jca = jcaRaw==null? null : (instDep===false? 1.0 : jcaRaw);
  const T = brs!=null? toa(brs, inp.counts||{}) : {points:0,neg:0,pos:0,negShare:0,posShare:0};
  const rated=Object.values(inp.ratings||{}).filter(v=>v!=null&&v!=="").length; const uncited=CRIT.filter(c=>(inp.ratings||{})[c.id]!=null&&(inp.ratings||{})[c.id]!==""&&!(inp.cited||{})[c.id]).length; const fatal=CRIT.filter(c=>(inp.fatal||{})[c.id]).length;
  let tri=null, b="", guard="None", decision="", next="", why="", red=0;
  if(brs!=null&&caf!=null&&jca!=null){ tri=Math.min(100,Math.max(0,brs*caf*jca+T.points)); b=band(tri); red=DIMS.filter(k=>d[k]<S.dimOrange).length;
    if(S.guards.fatal&&fatal>0) guard="Fatal flaw -> Fundamental reassessment required"; else if(S.guards.redDim&&red>0&&(b===BANDS[0]||b===BANDS[1])) guard="Dimension in the red -> capped at Significant transition barriers"; else if(S.guards.lowConf&&(level==="Low"||level==="Very Low")&&b===BANDS[0]) guard="Low evidence confidence -> capped at Transition achievable";
    if(inp.readinessFail) decision="Not assessable - readiness"; else if(rated<S.criteriaCount||uncited>0) decision="Incomplete - no category assigned"; else decision= guard.startsWith("Fatal")?BANDS[3]: guard.startsWith("Dimension")?BANDS[2]: guard.startsWith("Low")?BANDS[1]: b;
    why=`TRI ${tri.toFixed(0)} = BRS ${brs.toFixed(0)} x CAF ${caf.toFixed(2)} (${level} evidence) x JCA ${jca.toFixed(2)} (${(jca===1&&J.level!=="Low")?"not applied - pathway not institution-dependent; JCI "+J.level:J.level+" JCI"}) ${T.points<0?"- ":"+ "}${Math.abs(T.points).toFixed(1)} TOA (${Math.round(100*T.points/brs)}% of BRS)`;
    if(decision===BANDS[3]||decision===BANDS[2]) next="Tier 2 REQUIRED"; else if(decision===BANDS[1]) next=(inp.materialityHigh||J.level==="High"||J.level==="Very High"||(+inp.liability||0)>=S.costB4max)?"Tier 2 recommended":"Tier 2 optional"; else if(decision===BANDS[0]) next="Tier 2 optional"; }
  const weakestDim = complete? DIMS.reduce((a,k)=>d[k]<d[a]?k:a,DIMS[0]) : ""; const strongestDim = complete? DIMS.reduce((a,k)=>d[k]>d[a]?k:a,DIMS[0]) : "";
  const projected = tri!=null? Math.min(100,tri+(+inp.projectedGain||0)) : null;
  return {dims:d, dimBands:Object.fromEntries(DIMS.map(k=>[k,dimBand(d[k])])), complete, BRS:brs, weakestEQ:weakest, level, CAF:caf, jci:J, instDep, JCA:jca, toa:T, TRI:tri, band:b, guard, decision, next, why, red, rated, uncited, fatal, weakestDim, strongestDim, projected, improvement: projected!=null? projected-tri : null}; }
return {run, dims, jci, toa, band, dimBand, evidenceLevel, BANDS, DIMS};
})();
if (typeof module!=="undefined") module.exports=ATRF;
