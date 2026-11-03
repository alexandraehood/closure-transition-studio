// Node harness for the Personal edition built as ONE file (app.js = the script embedded in build.html).
// Same DOM stubs and checks as the source harness (exercise_open.js); loads app.js instead of the source files.
// Usage: node harness.js [path/to/app.js]
const fs=require('fs'); const path=require('path');
function El(){ this.innerHTML=''; this.value=''; this.textContent=''; this.classList={toggle(){},remove(){},add(){}}; this.dataset={}; this.style={setProperty(){}}; this.width=640; this.height=220; this.files=[]; this.checked=false; this.type=''; }
El.prototype.addEventListener=function(){}; El.prototype.querySelectorAll=()=>[]; El.prototype.querySelector=()=>new El(); El.prototype.getContext=()=>({clearRect(){},fillRect(){},fillText(){}}); El.prototype.closest=function(){return this;}; El.prototype.select=function(){};
const panel=new El(); global.document={documentElement:new El(),querySelector:(s)=>s==='#panel'?panel:new El(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>new El(),head:{appendChild(){}},body:{appendChild(){}},execCommand(){}}; global.window={}; global.localStorage={getItem:()=>null,setItem(){}}; global.getComputedStyle=()=>({getPropertyValue:()=>'#000'}); global.URL={createObjectURL:()=>''}; global.Blob=function(){}; global.navigator={}; global.alert=()=>{}; global.confirm=()=>true; global.prompt=()=>'Tester'; global.FileReader=function(){};
// Default app: the script embedded in apps/personal-edition.html (or pass a path to an extracted app.js / the app_open5_test.js fixture).
const appPath=process.argv[2]||path.join(__dirname,'..','apps','personal-edition.html'); const TESTPACK=process.argv[3]||path.join(__dirname,'..','docs','ontario_sudbury_test_pack.json');
let src=fs.readFileSync(appPath,'utf8'); if(/<script>/.test(src)) src=src.slice(src.indexOf('<script>')+8,src.lastIndexOf('</script>'));
for(const n of ['LATAF','PATHWAYS','DATA','DOCS','JURLIB','ARO','GOV','REGVEC','CONS','STANDARDS','PF']) src=src.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'=');
// test surface (the published file has none): expose the same symbols the source test build exposes, just before the app IIFE closes
const PX={toFinderRecord:'toFinderRecord',addGap:'pfAddGap',addDecision:'pfAddDecision',dismiss:'pfDismiss',recordOutcome:'pfRecordOutcome',hitRates:'pfHitRates',exportJSON:'pfExportJSON',exportCSV:'pfExportCSV',plusDays:'plusDays',assumptionBrief:'asmBrief',ingestAssumptions:'ingestAssumptions',ingestTable:'asmIngestTable',setState:'asmSetState',openRun:'asmOpenRun',promoteRequirement:'asmPromote',rvEnsure:'rvEnsure',rvDefaults:'rvDefaults',rvIndicator:'rvIndicator',rvPreRead:'rvPreRead',rvReport:'rvReport',rvActionsCSV:'rvActionsCSV',rvSetLever:'rvSetLever',rvLeverEntries:'rvLeverEntries',rvSetVote:'rvSetVote',rvSetConsensus:'rvSetConsensus',rvRecordDecision:'rvRecordDecision',rvApplyPathway:'rvApplyPathway'};
const pxLine='globalThis.__PX={'+Object.entries(PX).map(([k,f])=>`${k}:(typeof ${f}==="function"?${f}:null)`).join(',')+'};';
if(!/globalThis\.__T=/.test(src)) src=src.replace(/\}\)\(\);\s*$/,'globalThis.__T={load,DBget:()=>DB,DBset:v=>{DB=v;},TABS,state,renderTab,blankRecord,loadDemo,settings,library}; '+pxLine+'\n})();');
(0,eval)(src);
const T=globalThis.__T; T.load();
let fails=0, passes=0; const ok=(cond,msg)=>{ console.log((cond?'PASS ':'FAIL ')+msg); if(!cond) fails++; else passes++; };
T.state.tab='walk'; T.renderTab(); if(!panel.innerHTML.includes('New site')) { console.log('FAIL no-site view'); process.exit(1); }
T.DBget().records['NEW']=T.blankRecord('NEW','New Site'); T.DBget().current='NEW'; for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ console.log('FAIL NEW',k,e.message); process.exit(1);} }
T.loadDemo(); for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ console.log('FAIL DEMO',k,e.message); process.exit(1);} }
const r=T.DBget().records.DEMO; const a=GOV.AGENTS.find(x=>x.id==='REG'); const env=GOV.envelope(r,a,'test',T.DBget()); r.agentRuns=r.agentRuns||[]; r.agentRuns.push(env);
T.DBget().records['OTH']=T.blankRecord('OTH','Elsewhere Mine');
const pkg={correlationId:env.correlationId,agent:'REG',position:'ok',confidence:{information:'Medium'},records:[{type:'obligation',classification:'binding_requirement',text:'Permit condition 12 requires annual monitoring',citation:'DOC-01 p.3',site:'DEMO'},{type:'technical_finding',classification:'technical_condition',text:'Dump slopes stable',citation:'DOC-02'},{type:'obligation',classification:'precedent',text:'At Elsewhere Mine the regulator accepted a 50-year basis',citation:'ext'}],dependencies:[]};
const out=GOV.ingest(r,JSON.stringify(pkg),T.DBget()); console.log('governance ingest: accepted',out.accepted.length,'quarantined',out.quarantined.length,'rejected',out.rejected.length,'deps',out.dependencies.length); delete T.DBget().records['OTH'];
ok(out.accepted.length===1&&out.quarantined.length===1&&out.rejected.length===1,'governance ingest 1 accepted / 1 quarantined / 1 rejected');
console.log('confidence gate',GOV.informationConfidence(r).level,'|',GOV.informationConfidence(r).allowed.join(' / '));
const reg=GOV.REGRESSION.map(v=>{ const vec=REGVEC[v.version]; const got=LATAF.run(vec.crits,Object.assign({version:v.version},vec.opts)).TRI; return [v.version,v.expect,+got.toFixed(3)]; }); console.log('regression', JSON.stringify(reg)); ok(reg.every(x=>Math.abs(x[1]-x[2])<0.01),'regression vector readings unchanged');
// re-mining quick numbers
r.remine={facilities:[{name:'Old heap',type:'Heap leach',tonnes:12,metal:'Au',grade:0.35,recovery:45,payable:99,processCost:3.5,rehandleCost:1.2,capex:4000000,royalty:2,closureOffset:3000000,residueCost:1500000,coproducts:[{metal:'Cu',grade:0.08,recovery:50,payable:90},{metal:'Te',grade:3,recovery:30,payable:80}]}],prices:{Au:{price:2400},Cu:{price:9000},Te:{price:70}},priceDate:'test'};
T.state.tab='remine'; T.renderTab(); console.log('remine renders', panel.innerHTML.includes('Break-even'));
console.log('all tabs render: no-site, blank new site, demonstration site');
// ---- usefulness test: stacked conservatism on the demonstration site
const rr=T.DBget().records.DEMO; const cm=CONS.model(rr); for(const i of [0,2,3,4,6]){ const l=CONS.LIB[i]; cm.layers.push({chain:l[0],layer:l[1],driver:l[2],driverCost:i===0?18000000:0,category:l[3],factor:l[4],basis:l[5],verb:CONS.VERB[l[3]],reversible:"Yes"}); }
cm.layers.push({chain:"Water treatment duration",layer:CONS.LIB[7][1],driver:"Treatment OPEX",driverCost:600000,category:CONS.LIB[7][3],factor:CONS.LIB[7][4],basis:CONS.LIB[7][5],verb:"Simplify",reversible:"Yes"});
const an=CONS.analyse(rr); for(const c of an.rows) console.log(`CONS ${c.chain}: layers ${c.layers.length} total x${c.total.toFixed(2)} required x${c.required.toFixed(2)} discretionary x${c.disc.toFixed(2)} (${c.nDisc}) index ${c.stackIndex.toFixed(2)} ${c.severity} saving ${c.indicativeSaving==null?'-':Math.round(c.indicativeSaving)}`);
console.log('auto-detected on demo:', CONS.detect(rr,{version:'v3.2'}).map(d=>d.layer.slice(0,60)));
T.state.tab='cons'; T.renderTab(); console.log('cons tab renders', panel.innerHTML.includes('Stack index'));
// ---- new tabs + Sudbury test skeleton run
for(const k of ['calib','invest','decisions','command']){ T.state.tab=k; T.renderTab(); if(panel.innerHTML.length<100){ console.log('FAIL',k); process.exit(1);} }
const pack=JSON.parse(fs.readFileSync(TESTPACK,'utf8')); const s=T.blankRecord(pack.site.code,pack.site.name); Object.assign(s,{country:pack.site.country,jurisdiction:pack.site.jurisdiction,pathway:pack.site.pathway,institutionDependent:pack.site.institutionDependent,basis:pack.site.basis,currency:pack.site.currency,profile:pack.site.profile,conservatism:pack.site.conservatism,gaps:pack.site.gaps}); T.DBget().records.SUD=s; T.DBget().current='SUD';
JURLIB.merge(T.library().jur,pack.jurisdiction); const j=T.library().jur.find(x=>x.name==='Ontario, Canada'); const sug=JURLIB.suggestions(j); console.log('Ontario record: legislation',j.legislation.length,'-> RvA rows',sug.rva.length,'T2F defaults',Object.keys(sug.t2f).length,'indicator suggestions',JSON.stringify(sug.indicators));
const res=LATAF.run(T.DBget().records.SUD.criteria.map(c=>({id:c.id,rating:c.rating,grade:c.grade,delib:null,facilities:null})),{version:'v3.4c',thresholds:'A',jci:3,institutionDependent:true,toa:0,weakestSub:3,openCritical:2}); console.log('SUD skeleton reading', res.decision, res.TRI.toFixed(1), '['+res.TRI_low.toFixed(1)+'-'+res.TRI_high.toFixed(1)+']', res.cls);
console.log('SUD confidence gate', GOV.informationConfidence(s).level, GOV.informationConfidence(s).allowed.join('/'));
for(const k of T.TABS.map(x=>x[0])){ T.state.tab=k; T.renderTab(); } console.log('SUD skeleton renders on every tab');
T.state.tab='graph'; T.renderTab(); console.log('graph tab renders', panel.innerHTML.includes('<svg'), 'narrative chars', (panel.innerHTML.match(/<textarea id="narr"[^>]*>([\s\S]*?)<\/textarea>/)||['',''])[1].length);

// ================= Patterns tab and assumption-extraction brief / return-package ingest (added with these items) =================
const hasPatterns=T.TABS.some(t=>t[0]==='patterns');
if(hasPatterns){
  const X=globalThis.__PX; // extension test surface exposed by the patterns module
  ok(!!X,'patterns module exposes its functions for the harness');
  // -- renders for no-site, blank site, demonstration site
  T.DBget().current='NEW'; T.state.tab='patterns'; T.renderTab(); ok(panel.innerHTML.includes('Patterns'),'patterns tab renders for the blank site');
  T.DBget().current='DEMO'; T.renderTab(); ok(panel.innerHTML.includes('Patterns'),'patterns tab renders for the demonstration site');
  const saveDB=T.DBget(); T.DBset({records:{},current:"",settings:{company:"",portfolio:"",currency:"USD",brand:""},library:{docs:[],jur:[]},framework:{production:"v3.3",development:"v3.4c",releases:[]}}); T.renderTab(); ok(panel.innerHTML.includes('New site'),'patterns tab with no site falls back to the new-site view'); T.DBset(saveDB);
  // -- demo site findings (the usefulness-test layers are on DEMO; E4 criteria rated 2 fire F2, the stack fires A1)
  const d=T.DBget().records.DEMO; const fr=X.toFinderRecord(d); const run=PF.run(fr,'2026-10-31');
  console.log('demo finder: findings',run.findings.length,'by class',JSON.stringify(run.byClass),'ids',[...new Set(run.findings.map(f=>f.id))].join(','));
  ok(run.findings.length>=1,'demo site produces >= 1 finding'); ok(run.findings.some(f=>f.id==='F2'),'demo site fires F2 (E4 criteria rated 2 or below)'); ok(run.findings.some(f=>f.id==='A1'),'demo site fires A1 (discretionary stack on the closure cost chain)');
  // -- adapter mapping checks
  ok(fr.assumptions.length===6&&fr.assumptions[0].parameter===d.conservatism.layers[0].layer&&fr.assumptions[0].notes===d.conservatism.layers[0].basis,'adapter maps conservatism layers to assumptions (parameter=layer, notes=basis)');
  ok(fr.criteria.length===26&&fr.gaps.length===d.gaps.length&&fr.gaps.every(g=>g.opened),'adapter maps criteria and gaps with an opened date');
  ok(fr.annualPostClosureCost===d.recurring&&fr.driverCost>0,'adapter carries recurring cost and driver cost');
  // -- Add as gap / Add to decision ledger / Dismiss / outcomes
  const f0=run.findings.find(f=>f.id==='A1'); const g0=d.gaps.length; X.addGap(d,f0); ok(d.gaps.length===g0+1&&d.gaps[d.gaps.length-1].source==='Pattern finder A1'&&d.gaps[d.gaps.length-1].status==='Open','Add as gap adds exactly one gap with source "Pattern finder A1"');
  d.decisions=d.decisions||[]; const n0=d.decisions.length; X.addDecision(d,f0); const dec=d.decisions[d.decisions.length-1]; ok(d.decisions.length===n0+1&&dec.source==='Pattern finder A1'&&dec.options.includes('Keep')&&dec.options.includes('Reframe')&&dec.chosen===''&&dec.reversal===''&&/^\d{4}-\d{2}-\d{2}$/.test(dec.review),'Add to decision ledger adds one entry (options Keep/Validate/Simplify/Reframe, no choice, review date set)');
  const rd=new Date('2026-10-31T00:00:00Z'); rd.setUTCDate(rd.getUTCDate()+90); ok(X.plusDays('2026-10-31',90)===rd.toISOString().slice(0,10),'review date is today + 90 days');
  T.renderTab(); const before=(panel.innerHTML.match(/data-pfd=/g)||[]).length; X.dismiss(d,f0); T.renderTab(); const after=(panel.innerHTML.match(/data-pfd=/g)||[]).length;
  ok(after===before-1,'Dismiss hides the finding row from the active table'); ok(panel.innerHTML.includes('Dismissed findings'),'dismissed findings appear in the collapsed list');
  ok((d.patternOutcomes||[]).filter(o=>o.outcome==='dismissed').length===1,'dismiss stored as an outcome');
  const f1=run.findings.find(f=>f.id==='F2'); X.recordOutcome(d,f1,'confirmed'); X.recordOutcome(d,f1,'acted'); const hits=X.hitRates(); ok(hits.F2&&hits.F2.confirmed===1&&hits.F2.acted===1&&hits.A1&&hits.A1.dismissed===1,'outcomes count per pattern id across records');
  T.renderTab(); ok(panel.innerHTML.includes('Hit rates')&&panel.innerHTML.includes('CAL item'),'hit rates and the CAL sentence are on the tab');
  // -- exports
  const ex=X.exportJSON(d); ok(Array.isArray(ex.findings)&&Array.isArray(ex.activities)&&ex.thresholds&&ex.thresholds.discStack===PF.T.discStack&&ex.source&&ex.exportedAt,'export JSON carries source, exportedAt, thresholds, findings, activities');
  const csv=X.exportCSV(d); ok(csv.split('\n').length>=2&&csv.split('\n')[0].includes('pattern'),'findings CSV has a header and rows');
  // -- portfolio run with 3 copied records yields a Systemic finding
  const copies=[1,2,3].map(i=>Object.assign(JSON.parse(JSON.stringify(d)),{code:'CP'+i,name:'Copy '+i})); const pr=PF.run(copies.map(X.toFinderRecord),'2026-10-31'); console.log('portfolio finder on 3 copies:',JSON.stringify(pr.byClass));
  ok((pr.byClass.Systemic||0)>=1,'portfolio run with 3 copied records yields a Systemic finding');
  for(const c of copies) T.DBget().records[c.code]=c; T.DBget().current='DEMO'; T.state.tab='patterns'; T.renderTab(); ok(panel.innerHTML.includes('Systemic'),'portfolio section on the tab shows the Systemic class with 3+ sites'); for(const c of copies) delete T.DBget().records[c.code];
  // ================= Item 2: assumption-extraction brief and return-package ingest
  if(!X.assumptionBrief){ console.log('item 2 functions not present - item 2 checks skipped'); } else {
  const lib=T.library(); lib.docs.push({id:'DOC-91',title:'Water treatment design basis',type:'Design report or as-built',grade:'E3',date:'2024-05-01',text:'The plant was conservatively sized for the 1-in-200-year freshet.',hash:'h91',added:'2026-10-31',sites:['DEMO']}); if(!d.evidence.some(e=>e.id==='DOC-91')) d.evidence.push({id:'DOC-91',title:'Water treatment design basis',type:'Design report or as-built',date:'2024-05-01',grade:'E3',source:'Library'});
  const asm=GOV.AGENTS.find(x=>x.id==='ASM'); ok(!!asm&&['assumption','monitoring','costLine','requirement','quantity'].every(t=>asm.owns.includes(t)),'ASM agent exists and owns the five record types');
  const br=X.assumptionBrief(d); const brief=br.text; const env2=br.env;
  ok(brief.includes('DEMO')&&brief.includes(d.name),'brief contains the site code and name'); ok(['assumption','monitoring','costLine','requirement','quantity'].every(t=>brief.includes('"'+t+'"')||brief.includes(t)),'brief names the five record types');
  ok(['assumed','conservatively','worst case','design basis','return period','percentile','safety factor','in perpetuity','scenario'].every(w=>brief.includes(w)),'brief lists the trigger words'); ok(brief.includes('DOC-91')&&brief.includes(env2.correlationId),'brief lists the linked document and the correlation id');
  ok(d.agentRuns.some(x=>x.correlationId===env2.correlationId&&x.agent==='ASM'),'brief opened an ASM agent run');
  T.DBget().records['OTH']=T.blankRecord('OTH','Elsewhere Mine');
  const pkg2={correlationId:env2.correlationId,agent:'ASM',position:'extracted',confidence:{information:'Medium'},records:[
    {type:'assumption',chain:'Water treatment plant sizing',discipline:'Hydrology',parameter:'1-in-100-year freshet peak inflow',adopted:'1:100',central:'1:100',ptype:'statistical',tailP:0.01,driver:'Wet-year hydrology',category:'Binding',factor:1.4,requirementRef:'R1',sourceDoc:'DOC-91',sourceDate:'2024-05-01',citation:'DOC-91 p.3'},
    {type:'assumption',chain:'Water treatment plant sizing',discipline:'Hydrology',parameter:'Uplift to 1-in-200-year peak for margin',ptype:'statistical',tailP:0.005,driver:'Wet-year hydrology',category:'Interpreted and precedent',factor:1.12,sourceDoc:'DOC-91',sourceDate:'2024-05-01',citation:'DOC-91 p.4'},
    {type:'assumption',chain:'Water treatment plant sizing',discipline:'Climate',parameter:'High-emission scenario +20% on all flows',ptype:'scenario',driver:'Climate change',category:'Inherited and layered conservatism',factor:1.2,sourceDoc:'DOC-91',sourceDate:'2024-05-01',citation:'DOC-91 p.5'},
    {type:'assumption',chain:'Water treatment plant sizing',discipline:'Process',parameter:'Design safety factor on sized capacity',ptype:'safety factor',driver:'Engineering margin',category:'Interpreted and precedent',factor:1.25,sourceDoc:'DOC-91',sourceDate:'2024-05-01',citation:'DOC-91 p.6'},
    {type:'monitoring',parameter:'Sulphate, downstream station',frequencyPerYear:12,permitFrequencyPerYear:4,yearsWithoutExceedance:6,costPerSample:450,yearsRemaining:20,citation:'DOC-91 p.9'},
    {type:'assumption',chain:'Cover design',parameter:'At Elsewhere Mine the regulator accepted a 1.0 m cover',ptype:'none',category:'Unknown',factor:1,citation:'ext'},
    {type:'rating_proposal',text:'T1 3 - fine',citation:'DOC-91'}],dependencies:[]};
  const ing=X.ingestAssumptions(d,JSON.stringify(pkg2),T.DBget()); console.log('assumption ingest: accepted',ing.accepted.length,'quarantined',ing.quarantined.length,'rejected',ing.rejected.length);
  ok(ing.accepted.filter(x=>x.type==='assumption').length===4&&ing.accepted.filter(x=>x.type==='monitoring').length===1,'ingest accepts 4 assumptions and 1 monitoring line');
  ok(ing.quarantined.length===1&&/Elsewhere Mine/.test(ing.quarantined[0].parameter||ing.quarantined[0].text||''),'ingest quarantines the foreign-site mention'); ok(ing.rejected.length===1&&ing.rejected[0].type==='rating_proposal','ingest rejects an unknown (not owned) record type');
  ok((d.assumptions||[]).length===4&&d.assumptions.every(x=>x.state==='Draft')&&(d.monitoring||[]).length===1&&d.monitoring[0].state==='Draft','accepted records land in r.assumptions / r.monitoring as Draft');
  delete T.DBget().records['OTH'];
  let thrown=false; try{ X.ingestAssumptions(d,JSON.stringify(Object.assign({},pkg2,{correlationId:'nope'})),T.DBget()); }catch(e){ thrown=true; } ok(thrown,'ingest refuses a package whose correlation id matches no open run');
  // only accepted rows feed the finder: Draft rows do not
  const fr2=X.toFinderRecord(d); ok(fr2.assumptions.filter(a=>a.chain==='Water treatment plant sizing').length===0,'Draft rows do not feed the finder');
  for(const x of d.assumptions) X.setState(x,'Specialist-approved'); for(const x of d.monitoring) X.setState(x,'Specialist-approved');
  const fr3=X.toFinderRecord(d); const run3=PF.run(fr3,'2026-10-31'); const a1=run3.findings.filter(f=>f.id==='A1'&&f.where==='Water treatment plant sizing');
  ok(a1.length===1,'after Accept the finder shows a Stacking finding on the ingested chain (3 discretionary layers)'); ok(run3.findings.some(f=>f.id==='B1'),'after Accept the monitoring line fires B1');
  T.state.tab='patterns'; T.renderTab(); ok(panel.innerHTML.includes('Water treatment plant sizing'),'patterns tab shows the Stacking finding on the ingested chain');
  // TSV paste
  const tsv='chain\tparameter\tptype\tcategory\tfactor\tsourceDoc\tcitation\nCover design\tCover thickness 1.5 m where 1.0 m approved\tnone\tInherited and layered conservatism\t1.4\tDOC-91\tDOC-91 p.12\nCover design\tInfiltration 5% of MAP\tstatistical\tInterpreted and precedent\t1.1\tDOC-91\tDOC-91 p.13';
  const nA=d.assumptions.length; const tr=X.ingestTable(d,tsv); ok(tr.added===2&&d.assumptions.length===nA+2&&d.assumptions.slice(-2).every(x=>x.state==='Draft'&&x.chain==='Cover design'),'TSV paste of 2 assumption rows adds 2 Draft rows');
  // requirements go to r.requirements, never r.rva; promote copies one row
  const run4=X.openRun(d); const pkg3={correlationId:run4.correlationId,agent:'ASM',records:[{type:'requirement',id:'R1',instrument:'Discharge permit',clause:'4.2',text:'Treat the 1-in-100-year freshet inflow to end-of-pipe limits',binding:true,feature:'WTP',control:true,citation:'DOC-91 p.2'},{type:'quantity',documentId:'DOC-91',name:'Design inflow',value:14.2,unit:'m3/s',citation:'DOC-91 p.3'}]};
  const rvaN=d.rva.length; const ing3=X.ingestAssumptions(d,JSON.stringify(pkg3),T.DBget()); ok(ing3.accepted.length===2&&d.rva.length===rvaN&&(d.requirements||[]).length===1,'requirements land in r.requirements, the RvA register is untouched');
  const doc91=lib.docs.find(x=>x.id==='DOC-91'); ok(doc91.quantities&&doc91.quantities.length===1&&doc91.quantities[0].name==='Design inflow','quantities land on the document register entry');
  T.state.tab='docs'; T.renderTab(); ok(panel.innerHTML.includes('Assumption extraction brief')&&panel.innerHTML.includes('return package'),'documents tab shows the brief button and the paste box');
  ok(panel.innerHTML.includes('Promote to RvA register')&&panel.innerHTML.includes('>Accept<'),'documents tab lists the Draft rows with Accept / Promote buttons');
  X.promoteRequirement(d,d.requirements[0]); ok(d.rva.length===rvaN+1&&d.rva[d.rva.length-1].category==='Binding'&&d.rva[d.rva.length-1].instrument.includes('Discharge permit'),'Promote to RvA register adds one RvA row');
  T.renderTab(); ok(!panel.innerHTML.includes('Promote to RvA register')&&panel.innerHTML.includes(d.rva[d.rva.length-1].id),'promoted requirement shows its RvA id and no second Promote button');
  const fr5=X.toFinderRecord(d); ok(fr5.requirements.filter(x=>x.id==='R1'||x.ref==='R1').length===1,'a promoted requirement is counted once by the finder');
  T.state.tab='agents'; T.renderTab(); ok(panel.innerHTML.includes('Assumption extractor'),'agents tab lists the Assumption extractor');
  // round trip: the whole database serialises with the new registers
  const dump=JSON.parse(JSON.stringify(T.DBget())); ok(dump.records.DEMO.assumptions.length===d.assumptions.length&&dump.records.DEMO.patternOutcomes.length===d.patternOutcomes.length&&dump.library.docs.some(x=>x.id==='DOC-91'&&x.quantities),'export carries assumptions, outcomes and document quantities');
  for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ ok(false,'DEMO with registers renders '+k+': '+e.message); } }
  console.log('all tabs render with the new registers populated');
  }
}
// ================= Item 3: Strategic review tab (goal, pathway options, validation workshop, five-year plan)
const hasReview=T.TABS.some(t=>t[0]==='review');
if(hasReview){
  const X=globalThis.__PX; ok(!!X&&typeof X.rvEnsure==='function'&&typeof X.rvReport==='function','strategic review module exposes its functions for the harness');
  ok(T.TABS.findIndex(t=>t[0]==='review')===T.TABS.findIndex(t=>t[0]==='patterns')+1&&T.TABS.find(t=>t[0]==='review')[1]==='Strategic review','"Strategic review" tab sits right after Patterns & opportunities');
  const saveDB2=T.DBget(); T.DBset({records:{},current:"",settings:{company:"",portfolio:"",currency:"USD",brand:""},library:{docs:[],jur:[]},framework:{production:"v3.3",development:"v3.4c",releases:[]}}); T.state.tab='review'; T.renderTab(); ok(panel.innerHTML.includes('New site'),'review tab with no site falls back to the new-site view'); T.DBset(saveDB2);
  T.DBget().current='NEW'; T.state.tab='review'; T.renderTab(); ok(panel.innerHTML.includes('Strategic review')&&panel.innerHTML.includes('Review setup')&&panel.innerHTML.includes('No option is carried to the workshop yet'),'review tab renders for the blank site (defaults created)');
  const nr=T.DBget().records.NEW; ok(nr.review&&nr.review.gates.length===7&&nr.review.objectives.length===2&&nr.review.cycleYears===5&&nr.review.stages.length===4&&nr.review.options.length===0,'blank site defaults: 7 gates, 2 objectives, 5-year cycle, 4 stages, no options');
  T.DBget().current='DEMO'; T.renderTab(); ok(panel.innerHTML.includes('Harbourview Works (illustrative)')&&panel.innerHTML.includes('Options overview matrix'),'review tab renders for the demonstration site with the illustrative example and the matrix');
  const d=T.DBget().records.DEMO; const rv=d.review;
  ok(rv.options.length===4&&rv.options.filter(o=>o.status==='Validated').length===1&&rv.options.filter(o=>o.status==='Fallback').length===1&&rv.options.some(o=>o.status==='Eliminated before workshop')&&rv.options.some(o=>o.status==='Carried to workshop'),'demo seeds 4 options: one Validated, one Fallback, one eliminated before the workshop, one carried');
  ok(rv.focus.length>=3&&rv.interviews.length>=3&&rv.options.filter(o=>['Carried to workshop','Validated','Fallback'].includes(o.status)).every(o=>o.matrix.duration&&o.matrix.approval&&o.matrix.cost&&o.matrix.nextSteps),'demo seeds focus areas, interviews and one filled matrix column per carried option');
  const dft=X.rvDefaults(); ok(dft.weights.approval===0.25&&dft.weights.time===0.2&&dft.weights.cost===0.2&&dft.weights.stakeholder===0.15&&dft.weights.risk===0.2,'published default weights 0.25 / 0.20 / 0.20 / 0.15 / 0.20');
  const o3=rv.options.find(o=>o.id==='SO-03'); const manual=0.25*o3.scores.approval+0.2*o3.scores.time+0.2*o3.scores.cost+0.15*o3.scores.stakeholder+0.2*o3.scores.risk; const i1=X.rvIndicator(rv,o3).score; ok(Math.abs(i1-manual)<1e-9,'screening indicator equals the weighted average with the published weights');
  ok(panel.innerHTML.includes('published default 0.25')&&panel.innerHTML.includes('never the decision'),'weights are published on the tab with the "prompt for discussion, never the decision" label');
  const w0=rv.weights.approval; rv.weights.approval=0.6; const i2=X.rvIndicator(rv,o3).score; ok(Math.abs(i2-i1)>1e-6,'indicator changes when a weight changes'); rv.weights.approval=w0;
  const pre=X.rvPreRead(d); ok(pre.includes(rv.goal)&&rv.options.every(o=>pre.includes(o.name))&&pre.includes(rv.current),'pre-read contains the goal, the current strategy and the option names');
  ok(['Relative duration to closure','Relative confidence in approval','Relative cost','Long-term monitoring','Technical data gaps','Next steps','Implementation considerations','Regulatory considerations','Community and stakeholder risks','Opportunities'].every(h=>pre.includes(h)),'pre-read contains the matrix headings');
  ok(pre.includes('Stakeholder considerations')&&pre.includes('Interview themes')&&pre.includes('Open gaps')&&pre.includes('GAP-DEMO-01')&&pre.includes('Documents linked'),'pre-read carries the stakeholder matrix, interview themes, open gaps and the document list');
  ok(rv.agenda.some(a=>String(a.day)==='1')&&rv.agenda.some(a=>String(a.day)==='2')&&rv.agenda.some(a=>/first-impression vote/.test(a.item))&&rv.agenda.some(a=>/gates versus action items/.test(a.item))&&panel.innerHTML.includes('Day 1')&&panel.innerHTML.includes('Day 2'),'agenda template has Day 1 and Day 2 and the tab shows both days');
  X.rvSetVote(d,'SO-02','r1','support',5); X.rvSetVote(d,'SO-02','r2','support',8); ok(rv.votes['SO-02'].r1.support===5&&rv.votes['SO-02'].r2.support===8&&rv.votes['SO-03'].r1&&rv.votes['SO-03'].r2,'vote capture stores two rounds per option');
  X.rvSetConsensus(d,'conditions','Receptor study first'); X.rvSetConsensus(d,'validated','SO-03'); ok(rv.consensus.conditions==='Receptor study first'&&rv.consensus.validated==='SO-03'&&rv.consensus.fallback==='SO-04'&&rv.consensus.date&&rv.consensus.participants&&rv.consensus.dissent,'consensus record saved (validated, fallback, conditions, dissent, participants, date)');
  const dump1=JSON.parse(JSON.stringify(T.DBget())); ok(dump1.records.DEMO.review.consensus.conditions==='Receptor study first'&&dump1.records.DEMO.review.votes['SO-02'].r2.support===8,'consensus and votes travel with the serialised database');
  ok(rv.gates.length===7&&rv.gates[0].id==='SG1'&&/Internal strategy approval/.test(rv.gates[0].gate)&&/Project execution plan/.test(rv.gates[1].gate)&&/Next strategic review/.test(rv.gates[6].gate)&&rv.gates.filter(g=>g.status==='Done').length===2,'7 default gates in order; the demo has two done');
  const csv=X.rvActionsCSV(d); const lines=csv.split('\n'); ok(lines[0].startsWith('id,action,gate,year,owner,priority')&&lines.length===1+rv.actions.length&&rv.actions.length===3&&lines[1].includes('SA-01'),'action CSV has a header plus one row per action (3 in the demo)');
  const n0=d.opps.length; const lv=X.rvSetLever(d,'VL-02','Yes'); ok(d.opps.length===n0+1&&d.opps[d.opps.length-1].id===lv.oppId&&d.opps[d.opps.length-1].type==='Value lever'&&d.opps[d.opps.length-1].status==='Hypothesis','a Yes lever creates exactly one entry in the Tier 2 opportunity register');
  X.rvSetLever(d,'VL-02','Yes'); ok(d.opps.length===n0+1,'setting the lever again does not duplicate the entry');
  X.rvSetLever(d,'VL-02','No'); ok(d.opps.length===n0+1&&d.opps.find(o=>o.id===lv.oppId).status==='Parked','a lever set to No parks its entry rather than deleting it');
  ok(X.rvLeverEntries(d).length===3&&d.opps.some(o=>o.id==='OPP-DEMO-02'),'demo levers (2) plus the test lever give three entries');
  T.renderTab(); ok(panel.innerHTML.includes('OPP-DEMO-02')&&panel.innerHTML.includes('Value levers screen'),'tab lists the lever opportunities');
  const rep=X.rvReport(d); ok(rep.includes('## Executive summary')&&rep.includes('| Option | Key uncertainties and threats | Key opportunities |')&&rep.includes('## Appendices')&&rep.includes('Screening-level'),'report markdown has Executive summary, the options table, Appendices and the screening banner');
  ok(rep.includes('Strategy elimination and validation')&&rep.includes('Recommended actions')&&rep.includes('Next steps and gates')&&rep.includes('Additional considerations')&&rep.includes('### C Options matrix')&&rep.includes('### D Stakeholder matrix')&&rep.includes('### E Document library'),'report has the body sections and the five appendices');
  d.decisions=d.decisions||[]; const nd=d.decisions.length; const dec=X.rvRecordDecision(d); ok(d.decisions.length===nd+1&&dec.source==='Strategic review'&&dec.question===`Closure goal and pathway for ${d.name}`&&dec.chosen==='Alternative risk-based criteria route'&&dec.reversal===rv.phaseTrigger&&rv.phaseTrigger.length>0&&dec.review===rv.nextReview&&dec.dissent===rv.consensus.dissent&&dec.options.includes('Do nothing (baseline)'),'Record the validated strategy adds exactly one ledger entry with the reversal trigger and the review date');
  X.rvRecordDecision(d); ok(d.decisions.length===nd+1,'re-recording updates the same ledger entry (still exactly one)');
  const before=d.pathway; const applied=X.rvApplyPathway(d); ok(applied&&d.pathway==='Relinquishment'&&d.pathway!==before,"Apply pathway changes the record pathway to the validated option's pathway");
  const old=JSON.parse(JSON.stringify(d)); delete old.review; old.code='OLD'; old.name='Old export without review'; T.DBget().records.OLD=old; T.DBget().current='OLD'; let okAll=true; for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ okAll=false; console.log('FAIL OLD',k,e.message); } } ok(okAll&&T.DBget().records.OLD.review&&T.DBget().records.OLD.review.options.length===0,'an export made without r.review imports and renders on every tab (defaults created, no options)'); delete T.DBget().records.OLD; T.DBget().current='DEMO';
  const reg2=GOV.REGRESSION.map(v=>{ const vec=REGVEC[v.version]; return [v.expect,+LATAF.run(vec.crits,Object.assign({version:v.version},vec.opts)).TRI.toFixed(3)]; }); ok(reg2.every(x=>Math.abs(x[0]-x[1])<0.01),'regression readings unchanged after the strategic review module');
  ok(!/Confidential - prepared for/.test(src)&&!/client record/i.test(src.slice(0,2000)),'the built app carries no client banner (the release gate, tests/release_gate.py, is the authority on client identifiers)');
  console.log('strategic review: options',rv.options.length,'validated',(rv.options.find(o=>o.status==='Validated')||{}).name,'| fallback',(rv.options.find(o=>o.status==='Fallback')||{}).name,'| indicator SO-03',i1.toFixed(3),'| gates',rv.gates.length,'| actions',rv.actions.length,'| ledger',dec.id);
}
console.log(fails?`HARNESS: ${fails} failure(s) (${passes} PASS, ${fails} FAIL)`:`HARNESS: all checks passed (${passes} PASS, 0 FAIL)`); process.exit(fails?1:0);
