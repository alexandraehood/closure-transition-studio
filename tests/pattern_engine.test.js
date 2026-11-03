// Pattern finder engine - reference behaviour on the illustrative packs (no client data)
const PF=require('../src/modules/pattern_engine.js'); const P=require('./pattern_packs.js'); const today='2026-10-31';
function assert(c,m){ if(!c){ console.log('FAIL',m); process.exit(1);} console.log('ok',m); }
const a=PF.run(P.stacking,today); assert(a.findings.some(f=>f.id==='A2'),'joint-probability inflation fires on the stacking pack'); assert(a.findings.some(f=>f.id==='A4'),'incompatible extremes fire'); assert(a.findings.some(f=>f.id==='D2'),'low forecast utilisation fires');
const b=PF.run(P.inheritance,today); assert(b.findings.some(f=>f.id==='B1'),'operating-phase monitoring regime fires'); assert(b.findings.some(f=>f.id==='C2'),'same quantity, different values fires'); assert(b.findings.some(f=>f.id==='E2'),'high-consequence decision without reversal trigger fires');
const c=PF.run({records:P.portfolio},today); assert(c.findings.filter(f=>f.cls==='Systemic').length>=1,'systemic findings need three sites and fire on the portfolio pack');
assert(PF.activities(a).length>=1,'activities derive from findings'); console.log('pattern engine: all checks passed');
