// Pattern finder engine - finds cross-cutting patterns, inefficiencies and opportunities in a populated closure record that
// single-discipline, day-to-day work does not see. Deterministic rules over typed registers; agents only populate the registers,
// the reviewer confirms. Personal edition module candidate (CAL item if adopted). Screening-level. Plain JavaScript: identical in the HTML tool and in node.
const PF=(()=>{
const T={discStack:1.3, discLayers:3, overDesign:5, utilisation:0.40, staleYears:5, stepDownYears:3, overlayStack:1.6, quantityDiffPct:10, systemicSites:3, gapDays:120, highConsequence:4};
const num=(x,d)=>{ const v=+x; return isFinite(v)&&!isNaN(v)? v : d; };
const LIB=[
 // id, class, name, detector (plain words), question to ask, evidence to collect, verb, effect
 ["A1","Stacking","Discretionary stack on one chain",`${T.discLayers}+ discretionary layers or discretionary multiplier >= x${T.discStack} on a design or cost chain`,"Which of these margins does the instrument actually require, and which are ours?","Instrument clause per layer; design basis memo","Validate","cost"],
 ["A2","Stacking","Joint-probability inflation",`Independent tail assumptions multiplied; implied return period >= ${T.overDesign}x the requirement`,"What is the joint probability of the design case, and does the requirement ask for it?","Coincident-frequency analysis on the observed joint record","Reframe","cost, risk"],
 ["A3","Stacking","Same driver counted twice","Two statistical layers share a driver (one event treated as two)","Are these two margins the same event?","Driver mapping per layer","Simplify","cost"],
 ["A4","Stacking","Incompatible extremes combined","Layers declared physically incompatible are combined in one design case","Can these two conditions occur at the same time?","Joint record of the two variables","Reframe","cost"],
 ["A5","Stacking","Scenario on extremes","A scenario (no probability) multiplied onto statistical extremes","Is the scenario a design multiplier or a monitored trigger?","Observed trend against scenario; review cycle","Reframe","cost, time"],
 ["A6","Stacking","Probability lost at hand-off","A statistical layer handed to the next discipline as a fixed value","Did the receiving model use the probability or the number?","Hand-off register signed by both disciplines","Validate","risk"],
 ["A7","Stacking","Margin applied more than once","Safety factor layered on top of upstream margins, or two safety factors on one chain","Where is margin held, and how many times?","Design basis memo listing every margin","Simplify","cost"],
 ["B1","Inheritance","Operating-phase regime carried into closure",`Monitoring above the permit frequency with >= ${T.stepDownYears} years without exceedance`,"Why is this still sampled at the operating frequency?","Exceedance history; permit schedule; step-down precedent","Simplify","cost (regulatory route)"],
 ["B2","Inheritance","Stale assumption never re-validated",`Assumption sourced from a document older than ${T.staleYears} years with no later document on the parameter`,"When was this last checked against data?","Newer measurements or a re-validation memo","Validate","risk, cost"],
 ["B3","Inheritance","Horizon beyond the instrument","Cost or treatment horizon longer than the instrument or record supports","What does the instrument say about the horizon, and what does the trend say?","Permit; water quality trend; exit criteria","Reframe","cost"],
 ["B4","Inheritance","Assumption without provenance","Category Unknown or no source document: nobody can say why it is there","Who introduced this, and on what basis?","Source document or a decision to drop it","Validate","cost, risk"],
 ["C1","Duplication","Estimate overlays stacked",`Contingency, class default, escalation and growth overlays multiply to >= x${T.overlayStack} on one line`,"Which overlays cover the same uncertainty?","Estimate class basis; corporate standard","Simplify","cost"],
 ["C2","Duplication","Same quantity, different values",`The same named quantity differs by more than ${T.quantityDiffPct}% between documents`,"Which value is the design basis, and who owns it?","Reconciled design-basis table","Validate","risk"],
 ["C3","Duplication","Duplicate controls","Two requirements or controls address the same feature","Do both controls add protection, or only cost?","Requirement mapping to features","Simplify","cost"],
 ["D1","Mis-sizing","Low observed utilisation",`Observed demand below ${Math.round(T.utilisation*100)}% of the designed quantity`,"What would a staged or modular design have cost?","Operating data; utilisation trend","Reframe","cost"],
 ["D2","Mis-sizing","Low forecast utilisation",`Central-case need below ${Math.round(T.utilisation*100)}% of the designed quantity (1 / total multiplier)`,"What is the expansion trigger if we build the binding case first?","Central-case forecast; trigger definition","Reframe","cost, time"],
 ["E1","Drift","Decision past its review date","Ledger decision with a review date in the past","Is the decision still right on today's evidence?","Review note; evidence since the decision","Validate","risk"],
 ["E2","Drift","No reversal trigger on a high-consequence decision",`Decision with consequence >= ${T.highConsequence} and no reversal trigger`,"What observation would make us reverse this?","Trigger definition and owner","Validate","risk"],
 ["E3","Drift","Uncosted obligation","Binding requirement with no cost line","Who pays for this, and when?","Cost line or a documented reason it costs nothing","Validate","cost, risk"],
 ["E4","Drift","Orphan cost line","Cost line linked to no requirement and no assumption","Why are we spending this?","Requirement or assumption link, or drop the line","Simplify","cost"],
 ["E5","Drift","Decision-critical gap left open",`Decision-critical gap open for more than ${T.gapDays} days`,"What stops this gap from closing?","Owner, evidence source, date","Validate","time, risk"],
 ["F1","Evidence","Low confidence on a high-consequence decision",`Decision at Low confidence with consequence >= ${T.highConsequence}`,"What evidence would raise confidence before we commit?","Targeted data collection with value-of-information","Validate","risk"],
 ["F2","Evidence","Desktop pessimism counted as fact","Criteria rated 2 or below on undocumented evidence (E4)","Is this a bad condition or a missing document?","The document, or a gap entry","Validate","cost, time"],
 ["F3","Evidence","Information held but unused","Document in the register cited by no criterion, assumption or decision","What does this document change, if anything?","Extraction pass over the document","Validate","time"],
 ["G1","Systemic","Same pattern across sites",`A pattern fires at >= ${T.systemicSites} sites: a practice, not a site condition`,"Which standard, template or habit produces this everywhere?","Portfolio standard or template; CAL item","Reframe","cost, time, risk"],
 ["G2","Systemic","Copied design basis",`The same assumption (driver and factor) appears at >= ${T.systemicSites} sites`,"Was this derived per site or copied forward?","Per-site derivation or a documented portfolio basis","Validate","cost, risk"]
];
const BYID=Object.fromEntries(LIB.map(r=>[r[0],{id:r[0],cls:r[1],name:r[2],detector:r[3],question:r[4],evidence:r[5],verb:r[6],effect:r[7]}]));
function F(id, where, text, extra){ const p=BYID[id]; return Object.assign({id,cls:p.cls,name:p.name,where,text,question:p.question,evidence:p.evidence,verb:p.verb,effect:p.effect},extra||{}); }
function daysBetween(a,b){ const x=Date.parse(a), y=Date.parse(b); if(isNaN(x)||isNaN(y)) return null; return Math.round((y-x)/86400000); }

function stacking(r, today){
  const out=[]; const chains={}; for(const a of (r.assumptions||[])){ (chains[a.chain||"(chain)"]=chains[a.chain||"(chain)"]||[]).push(a); }
  for(const [name,L0] of Object.entries(chains)){ const L=L0.map((l,i)=>Object.assign({idx:i+1},l)); const where=name;
    let total=1,required=1,disc=1,nDisc=0,sf=0; for(const l of L){ const f=Math.max(0.01,num(l.factor,1)); total*=f; if(l.category==="Binding") required*=f; else { disc*=f; if(f>1.001) nDisc++; } if(l.ptype==="safety factor") sf++; }
    const stat=L.filter(l=>l.ptype==="statistical"&&num(l.tailP,0)>0&&num(l.tailP,0)<1);
    if(nDisc>=T.discLayers||disc>=T.discStack) out.push(F("A1",where,`${nDisc} discretionary layer(s) multiply to x${disc.toFixed(2)} on top of the binding x${required.toFixed(2)}; total x${total.toFixed(2)}`,{indicative: r.driverCost? (num(r.driverCost,0)*(1-1/disc)) : null, severity: disc>=1.6?"High":"Medium"}));
    const groups={}; for(const l of stat){ const k=(l.driver||"layer "+l.idx).toLowerCase(); (groups[k]=groups[k]||{driver:l.driver||("layer "+l.idx),layers:[],tailP:1}).layers.push(l); }
    for(const g of Object.values(groups)){ g.tailP=Math.min(...g.layers.map(l=>num(l.tailP,1))); if(g.layers.length>1) out.push(F("A3",where,`Driver "${g.driver}" in layers ${g.layers.map(l=>"#"+l.idx).join(", ")}: one event counted ${g.layers.length} times`)); }
    const G=Object.values(groups); if(G.length>=2 && num(r.requiredRP,0)>0){ const jp=G.reduce((p,g)=>p*g.tailP,1); const rp=1/jp; const ratio=rp/num(r.requiredRP,1); if(ratio>=T.overDesign) out.push(F("A2",where,`${G.length} independent tail assumptions: joint annual probability ${jp.toExponential(2)} (about 1 in ${Math.round(rp).toLocaleString()} years) against a 1 in ${num(r.requiredRP,0).toLocaleString()} requirement; ratio ${Math.round(ratio).toLocaleString()}x`,{severity:"High"})); }
    const seenPairs=new Set(); for(const l of L){ for(const t of String(l.incompatibleWith||"").split(/[,\s]+/).filter(Boolean)){ const m=L.find(x=>x.idx===+t); if(!m||m.idx===l.idx) continue; const key=Math.min(l.idx,m.idx)+"-"+Math.max(l.idx,m.idx); if(seenPairs.has(key)) continue; seenPairs.add(key); const a=l.idx<m.idx?l:m, b=l.idx<m.idx?m:l; out.push(F("A4",where,`#${a.idx} (${a.parameter}) with #${b.idx} (${b.parameter})`,{severity:"High"})); } }
    const scen=L.filter(l=>l.ptype==="scenario"); if(scen.length&&stat.length) out.push(F("A5",where,`Scenario layer(s) ${scen.map(l=>"#"+l.idx).join(", ")} on ${stat.length} statistical extreme(s)`));
    for(const l of stat) if((l.handedTo||"").trim()&&!l.probabilityCarried) out.push(F("A6",where,`#${l.idx} (${l.parameter}) handed to ${l.handedTo} as a fixed value; tail probability ${l.tailP} not carried`));
    if(sf>=2 || (sf>=1 && stat.length>=3)) out.push(F("A7",where,`${sf} safety factor layer(s) on a chain with ${stat.length} statistical margin(s)`));
    if(L.length&&1/total<T.utilisation) out.push(F("D2",where,`Central-case need about ${Math.round(100/total)}% of the designed quantity (total multiplier x${total.toFixed(2)})`,{indicative: r.driverCost? num(r.driverCost,0)*(1-1/disc)*0.6 : null}));
    for(const l of L){ if(l.category==="Unknown"||(!l.sourceDoc&&!l.requirementRef&&l.category!=="Binding")) out.push(F("B4",where,`#${l.idx} (${l.parameter}): ${l.category==="Unknown"?"category Unknown":"no source document or requirement reference"}`));
      if(l.sourceDate && today){ const yrs=(daysBetween(l.sourceDate,today)||0)/365.25; const newer=(r.documents||[]).some(d=>d.parameter===l.parameter && Date.parse(d.date)>Date.parse(l.sourceDate)); if(yrs>T.staleYears&&!newer) out.push(F("B2",where,`#${l.idx} (${l.parameter}) sourced ${l.sourceDate}, ${yrs.toFixed(1)} years ago, no later document on the parameter`)); } }
  }
  return out;
}
function inheritance(r, today){ const out=[];
  for(const m of (r.monitoring||[])){ if(num(m.frequencyPerYear,0)>num(m.permitFrequencyPerYear,0)&&num(m.yearsWithoutExceedance,0)>=T.stepDownYears) out.push(F("B1",m.parameter||m.id,`${m.frequencyPerYear}/yr sampled where the permit asks ${m.permitFrequencyPerYear}/yr; ${m.yearsWithoutExceedance} years without exceedance`,{regulatoryRoute:true,indicative: m.costPerSample? num(m.costPerSample,0)*(num(m.frequencyPerYear,0)-num(m.permitFrequencyPerYear,0))*num(m.yearsRemaining,1):null})); }
  if(num(r.horizonYears,0)>num(r.instrumentHorizonYears,0)&&num(r.instrumentHorizonYears,0)>0) out.push(F("B3","horizon",`Cost horizon ${r.horizonYears} years; the instrument or record supports ${r.instrumentHorizonYears}`,{indicative: r.annualPostClosureCost? num(r.annualPostClosureCost,0)*(num(r.horizonYears,0)-num(r.instrumentHorizonYears,0)):null}));
  return out; }
function duplication(r){ const out=[];
  for(const c of (r.costLines||[])){ const ov=(1+num(c.contingencyPct,0)/100)*(1+num(c.classDefaultContPct,0)/100)*(1+num(c.escalationPct,0)/100)*(1+num(c.growthPct,0)/100)*(1+num(c.indirectPct,0)/100); if(ov>=T.overlayStack) out.push(F("C1",c.item||c.id,`Overlays multiply to x${ov.toFixed(2)} on a base of ${num(c.base,0).toLocaleString()}`,{indicative: num(c.base,0)*(ov-Math.min(ov,1.35))})); }
  const q={}; for(const d of (r.documents||[])) for(const x of (d.quantities||[])){ (q[(x.name||"").toLowerCase()]=q[(x.name||"").toLowerCase()]||[]).push({doc:d.title||d.id,value:num(x.value,NaN),unit:x.unit||""}); }
  for(const [name,vals] of Object.entries(q)){ const v=vals.map(x=>x.value).filter(x=>!isNaN(x)); if(v.length>=2){ const mn=Math.min(...v), mx=Math.max(...v); if(mn>0&&(mx-mn)/mn*100>T.quantityDiffPct) out.push(F("C2",name,`${vals.map(x=>`${x.doc}: ${x.value}${x.unit?" "+x.unit:""}`).join("; ")} (spread ${Math.round((mx-mn)/mn*100)}%)`)); } }
  const feat={}; for(const x of (r.requirements||[])) if(x.feature){ (feat[x.feature.toLowerCase()]=feat[x.feature.toLowerCase()]||[]).push(x); } for(const [f,xs] of Object.entries(feat)) if(xs.length>=2&&xs.every(x=>x.control)) out.push(F("C3",f,`${xs.length} controls on the same feature: ${xs.map(x=>x.id).join(", ")}`));
  return out; }
function drift(r, today){ const out=[];
  for(const d of (r.decisions||[])){ if(d.reviewDate&&today&&Date.parse(d.reviewDate)<Date.parse(today)) out.push(F("E1",d.id,`"${d.question||d.id}" review due ${d.reviewDate}`)); if(num(d.consequence,0)>=T.highConsequence&&!(d.reversalTrigger||"").trim()) out.push(F("E2",d.id,`"${d.question||d.id}" consequence ${d.consequence}, no reversal trigger`)); if((d.confidence||"")==="Low"&&num(d.consequence,0)>=T.highConsequence) out.push(F("F1",d.id,`"${d.question||d.id}" taken at Low confidence with consequence ${d.consequence}`,{severity:"High"})); }
  const costReq=new Set((r.costLines||[]).map(c=>c.requirementId).filter(Boolean)); const asmReq=new Set((r.assumptions||[]).map(a=>a.requirementRef).filter(Boolean));
  for(const x of (r.requirements||[])) if(x.binding!==false&&x.costed!==true&&!costReq.has(x.id)) out.push(F("E3",x.id,`${x.instrument||""} ${x.clause||""}: ${x.text||x.id}`.trim()));
  for(const c of (r.costLines||[])) if(!c.requirementId&&!c.assumptionId) out.push(F("E4",c.item||c.id,`${num(c.base,0).toLocaleString()} with no requirement or assumption link`,{indicative:num(c.base,0)}));
  for(const g of (r.gaps||[])) if(g.critical&&(g.status||"Open")!=="Closed"&&g.opened&&today){ const dd=daysBetween(g.opened,today); if(dd!=null&&dd>T.gapDays) out.push(F("E5",g.id,`${g.what||g.id}: open ${dd} days`)); }
  return out; }
function evidence(r){ const out=[];
  const e4=(r.criteria||[]).filter(c=>c.grade==="E4"&&num(c.rating,5)<=2); if(e4.length) out.push(F("F2","criteria",`${e4.length} criteria (${e4.map(c=>c.id).join(", ")}) rated 2 or below on E4`));
  const cited=new Set(); for(const c of (r.criteria||[])) String(c.citation||"").split(/[;,\s]+/).forEach(x=>cited.add(x)); for(const a of (r.assumptions||[])) if(a.sourceDoc) cited.add(a.sourceDoc); for(const d of (r.decisions||[])) String(d.evidence||"").split(/[;,\s]+/).forEach(x=>cited.add(x));
  for(const d of (r.documents||[])) if(d.id&&!cited.has(d.id)&&(d.role||"site evidence")==="site evidence") out.push(F("F3",d.id,`${d.title||d.id} (${d.date||"undated"}) is cited nowhere`));
  return out; }
function analyseRecord(r, today){ today=today||new Date().toISOString().slice(0,10); const f=[].concat(stacking(r,today),inheritance(r,today),duplication(r),drift(r,today),evidence(r)); return f.map(x=>Object.assign({site:r.code||r.name||""},x)); }
function systemic(records, perSite){ const out=[]; const byPattern={}; for(const f of perSite) (byPattern[f.id]=byPattern[f.id]||new Set()).add(f.site);
  for(const [id,sites] of Object.entries(byPattern)) if(sites.size>=T.systemicSites) out.push(F("G1",id,`${BYID[id].name} fires at ${sites.size} sites (${[...sites].join(", ")})`,{site:"portfolio",severity:"High"}));
  const sig={}; for(const r of records) for(const a of (r.assumptions||[])){ const k=`${(a.driver||"").toLowerCase()}|${num(a.factor,1).toFixed(2)}|${(a.parameter||"").toLowerCase().slice(0,40)}`; (sig[k]=sig[k]||new Set()).add(r.code||r.name); }
  for(const [k,sites] of Object.entries(sig)) if(sites.size>=T.systemicSites&&k.split("|")[0]) out.push(F("G2",k.split("|")[2],`"${k.split("|")[2]}" with driver "${k.split("|")[0]}" and factor x${k.split("|")[1]} at ${sites.size} sites (${[...sites].join(", ")})`,{site:"portfolio"}));
  return out; }
function run(input, today){ const records=Array.isArray(input)?input:(input.records||[input]); const per=[]; for(const r of records) per.push(...analyseRecord(r,today)); const sys=records.length>1?systemic(records,per):[]; const all=per.concat(sys);
  const byClass={}; for(const f of all) byClass[f.cls]=(byClass[f.cls]||0)+1; return {records:records.length,findings:all,byClass,indicativeTotal:all.reduce((s,f)=>s+(f.indicative||0),0)}; }
const ACT={ // class -> activity template
 "Stacking":{action:"Joint design-basis review across the disciplines on the chain: one table of every margin with its probability, driver and hand-off; re-derive the design case from the joint record; sign the hand-offs",lead:"Technical lead with each discipline",weeks:"6-12",riskControl:"Binding requirement kept; residual coincidence covered by storage, staging or contingency"},
 "Inheritance":{action:"Re-validation sprint: test each inherited assumption, regime or horizon against current data and the instrument; prepare the step-down or deviation application where a regulatory route exists",lead:"Regulatory lead with the discipline owner",weeks:"4-8",riskControl:"Nothing is dropped without the instrument clause and the data trend in the file"},
 "Duplication":{action:"Reconciliation: one design-basis table and one estimate basis; remove overlays that cover the same uncertainty; name an owner per quantity",lead:"Cost and design leads",weeks:"2-4",riskControl:"Estimate class and contingency retained at the standard for the class"},
 "Mis-sizing":{action:"Staged or modular delivery study: binding case first, expansion provisions, trigger and lead time",lead:"Process engineering with the owner",weeks:"6-10",riskControl:"Expansion trigger with lead time; interim contingency"},
 "Drift":{action:"Decision and obligation hygiene: review overdue decisions, set reversal triggers, cost every binding obligation, justify or drop every orphan cost line, unblock decision-critical gaps",lead:"Project manager",weeks:"2-3",riskControl:"Ledger review cadence agreed"},
 "Evidence":{action:"Targeted evidence plan: collect the data that raises confidence on high-consequence decisions first; extract unused documents; convert E4 low ratings into gaps or documents",lead:"Evidence lead",weeks:"4-8",riskControl:"Value-of-information ranking drives the order"},
 "Systemic":{action:"Portfolio standard review: find the template, standard or habit that produces the same pattern everywhere and change it once (CAL item)",lead:"Practice lead",weeks:"4-6",riskControl:"Change made at the standard, then re-run the finder on every site"}
};
function activities(result){ const groups={}; for(const f of result.findings) (groups[f.cls]=groups[f.cls]||[]).push(f);
  return Object.entries(groups).map(([cls,fs],i)=>{ const t=ACT[cls]; return {id:"ACT-"+(i+1),cls,count:fs.length,action:t.action,lead:t.lead,weeks:t.weeks,riskControl:t.riskControl,indicative:fs.reduce((s,f)=>s+(f.indicative||0),0)||null,questions:[...new Set(fs.map(f=>f.question))],evidence:[...new Set(fs.map(f=>f.evidence))],findings:fs.map(f=>f.id+" "+f.where)}; }); }
return {T,LIB,BYID,run,activities,analyseRecord};
})();
if (typeof module!=="undefined") module.exports=PF;
