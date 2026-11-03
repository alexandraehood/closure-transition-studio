import sys, os; sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from engine.lataf_engine import Criterion, Rules, run, brs, CRITERIA
IDS = list(CRITERIA)
VEC_A_RECORD = [3,3,3,2,3,3,2,2,2,3,2,2,2,2,3,1,2,2,3,1,2,2,2,2,2,2]
VEC_A_RECORD_GRADES = ["E1","E2","E1","E2","E3","E2","E2","E2","E2","E2","E2","E3","E2","E3","E3","E3","E3","E2","E2","E3","E3","E3","E3","E1","E2","E2"]
VEC_A_SITE = [4,4,3,3,5,4,3,3,2,3,3,5,4,4,4,3,3,3,3,3,2,4,3,3,4,4]
VEC_A_SITE_GRADES = ["E1","E2","E3","E2","W","E3","E2","E2","E2","E2","E2","W","W","W","E3","E3","E3","E2","E2","W","E3","E3","E3","E1","W","W"]
def crits(ratings, grades, fac=None):
    out=[]
    for i,g,r in zip(IDS,grades,ratings):
        out.append(Criterion(i,r,g,facilities=(fac or {}).get(i)))
    return out
def approx(a,b,tol=1e-3): assert abs(a-b)<tol, (a,b)

def test_v32_reference_vector_a_record():
    r=Rules(version="v3.2",caf_on=True,toa_dedup=False)
    res=run(crits(VEC_A_RECORD,VEC_A_RECORD_GRADES),r,jci_level=4,institution_dependent=False,toa_share=-0.26,confidence_level="Low")
    approx(res["BRS"],44.2); approx(res["TRI"],23.868)
def test_v33_reference_vector_a_desktop():
    res=run(crits(VEC_A_RECORD,VEC_A_RECORD_GRADES),Rules(),jci_level=4,institution_dependent=False,toa_share=-0.16,weakest_evidence_sub=3)
    approx(res["TRI"],37.128); approx(res["TRI_high"],43.512); assert res["confidence_class"]=="Indicated"; assert res["decision"]=="Proceed with validation"
def test_v33_reference_vector_a_site_confirmed():
    g=[("E3" if x=="W" else x) for x in VEC_A_SITE_GRADES]
    res=run(crits(VEC_A_SITE,g),Rules(),jci_level=4,institution_dependent=False,toa_share=-0.16,weakest_evidence_sub=3)
    approx(res["BRS"],68.2); approx(res["TRI"],57.288); approx(res["TRI_high"],61.152)
def test_v34_reference_vector_a_facility_and_wcap():
    fac={"T3":{"TSF":(5,"assessed",True),"HLF":(2,"none",True),"Pit":(3,"visual",True),"WRD":(3,"assessed",True)},
         "T6":{"TSF":(4,"assessed",True),"HLF":(3,"visual",True),"Pit":(3,"visual",True),"Landforms":(3,"assessed",True)},
         "T1":{"Contact water":(4,"assessed",True),"Discharge":(4,"assessed",True),"Treatment exit":(0,"none",False)}}
    r=Rules(version="v3.4",jca_always=True,facility_rule=True,w_cap=4)
    res=run(crits(VEC_A_SITE,VEC_A_SITE_GRADES,fac),r,jci_level=3,institution_dependent=False,toa_share=-0.16,weakest_evidence_sub=3)
    approx(res["BRS"],65.6); approx(res["TRI"],48.544); approx(res["TRI_low"],44.696); approx(res["TRI_high"],51.652); assert res["decision"]=="Reassess pathway"
def test_portfolio_v32_v33_chain():
    # BRS and shares as recorded for pilot sites B, C and D (anonymous); checks the TRI formula chain
    from engine.lataf_engine import tri
    approx(tri(46.2,0.85,-0.12,0.8),25.872); approx(tri(53,0.9,-0.10,0.8),32.86); approx(tri(43.2,1.0,-0.19,0.8),26.352)
    approx(tri(46.2,0.85,-0.07),36.036); approx(tri(53,0.9,-0.05),45.05); approx(tri(43.2,1.0,-0.09),39.312)
if __name__=="__main__":
    for k,v in list(globals().items()):
        if k.startswith("test_"): v(); print("PASS",k)
