// Stub-DOM harness for the two studio apps (Reference Model v3.3 and the pilot bench), built as ONE file each.
// Loads the script embedded in the HTML, exposes a test surface before the app IIFE closes, then checks that every tab
// renders with no site, with a blank new site and with the fictional demonstration record, and that the anonymous
// regression vectors (src/modules/regvec.js) still read 57.288 / 36.828 / 55.242 through the embedded engine.
// Usage: node tests/exercise_studio.js [path/to/app.html ...]
const fs=require('fs'); const path=require('path');
function El(){ this.innerHTML=''; this.value=''; this.textContent=''; this.classList={toggle(){},remove(){},add(){}}; this.dataset={}; this.style={setProperty(){}}; this.width=640; this.height=220; this.files=[]; this.checked=false; this.type=''; }
El.prototype.addEventListener=function(){}; El.prototype.querySelectorAll=()=>[]; El.prototype.querySelector=()=>new El(); El.prototype.getContext=()=>({clearRect(){},fillRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}}); El.prototype.closest=function(){return this;}; El.prototype.select=function(){};
const apps=process.argv.slice(2).length?process.argv.slice(2):['../apps/reference-model-v3.3.html','../apps/transition-studio-pilot.html'].map(p=>path.join(__dirname,p));
const REGVEC_SRC=fs.readFileSync(path.join(__dirname,'..','src','modules','regvec.js'),'utf8').replace(/^const REGVEC=/m,'globalThis.REGVEC=');
const EXPECT={"v3.3":57.288,"v3.2":36.828,"atrf":55.242};
let fails=0, passes=0; const ok=(cond,msg)=>{ console.log((cond?'PASS ':'FAIL ')+msg); if(!cond) fails++; else passes++; };
for(const app of apps){
  const panel=new El(); global.document={documentElement:new El(),querySelector:(s)=>s==='#panel'?panel:new El(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>new El(),head:{appendChild(){}},body:{appendChild(){}},execCommand(){}}; global.window={}; global.localStorage={getItem:()=>null,setItem(){}}; global.getComputedStyle=()=>({getPropertyValue:()=>'#000'}); global.URL={createObjectURL:()=>''}; global.Blob=function(){}; global.navigator={}; global.alert=()=>{}; global.confirm=()=>true; global.prompt=()=>'Tester'; global.FileReader=function(){};
  const html=fs.readFileSync(app,'utf8'); let src=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
  for(const n of ['LATAF','PATHWAYS','DATA','DOCS','CONS']) src=src.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'=');
  src=src.replace(/\}\)\(\);\s*$/,'globalThis.__T={load,DBget:()=>DB,DBset:v=>{DB=v;},TABS,state,renderTab,blankRecord,seedRecord}; \n})();');
  (0,eval)(src+'\n'+REGVEC_SRC);
  const T=globalThis.__T; const name=path.basename(app); console.log('==',name,'| default rule set',T.state.version);
  ok(!/Prepared by .* for /.test(html)&&/fictional demonstration/.test(html),`${name}: built file carries the fictional-demonstration banner and no client banner (tests/release_gate.py is the authority on identifiers)`);
  // no site at all
  T.DBset({records:{},current:''}); let all=true; for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ all=false; console.log('  FAIL no-site',k,e.message); } } ok(all,`${name}: every tab renders with no site`);
  // seeded demonstration record
  T.load(); const db=T.DBget(); ok(Object.keys(DATA.sites).join()==='HVW'&&db.current==='HVW'&&db.records.HVW,`${name}: DATA.sites holds only the fictional demonstration record (HVW) and it is current`);
  const r=db.records.HVW; ok(r.name.includes('illustrative')&&r.criteria.length===26&&r.evidence.length===3&&r.gaps.length===2&&r.criteria.every(c=>c.rating>=1&&c.rating<=5&&["E1","E2","E3","E4","W"].includes(c.grade)),`${name}: demonstration record has 26 rated and graded criteria, 3 documents, 2 gaps`);
  all=true; for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ all=false; console.log('  FAIL HVW',k,e.message); } } ok(all,`${name}: every tab renders for the demonstration record`);
  // blank new site
  db.records.NEW=T.blankRecord('NEW','New Site'); db.current='NEW'; ok(db.records.NEW.evidence.length===0&&db.records.NEW.gaps.length===0,`${name}: a blank site inherits no documents or gaps from the demonstration record`);
  all=true; for(const [k] of T.TABS){ T.state.tab=k; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ all=false; console.log('  FAIL NEW',k,e.message); } } ok(all,`${name}: every tab renders for a blank new site`);
  // every rule set the app offers, on the demonstration record
  db.current='HVW'; const versions=/value="atrf"/.test(html)?['atrf','v3.2','v3.3','v3.4','v3.4c']:['v3.3','v3.2']; all=true; for(const v of versions){ T.state.version=v; T.state.tab='readiness'; try{ T.renderTab(); if(panel.innerHTML.length<40) throw new Error('empty'); }catch(e){ all=false; console.log('  FAIL version',v,e.message); } } ok(all,`${name}: readiness tab renders under every offered rule set (${versions.join(', ')})`);
  // anonymous regression vectors through the embedded engine
  const reg=Object.keys(EXPECT).map(k=>{ const v=REGVEC[k]; const got=LATAF.run(v.crits,Object.assign({version:k},v.opts)).TRI; return [k,EXPECT[k],+got.toFixed(3)]; }); console.log('  Reference vector A readings',JSON.stringify(reg)); ok(reg.every(x=>Math.abs(x[1]-x[2])<0.01),`${name}: regression readings unchanged (57.288 / 36.828 / 55.242)`);
}
console.log(fails?`HARNESS: ${fails} failure(s) (${passes} PASS, ${fails} FAIL)`:`HARNESS: all checks passed (${passes} PASS, 0 FAIL)`); process.exit(fails?1:0);
