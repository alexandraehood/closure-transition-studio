"""LATAF deterministic engine - Legacy Asset Transition Assessment Framework.
Engine of record for the Transition Readiness Index (TRI) and the two-axis result.
Implements the v3.2-PILOT formula (as built), the v3.3 candidate rules (CAL-10..16)
and the v3.4 candidate additions (CAL-17 facility rule, CAL-18 W cap, CAL-27 JCA option).
The language model never computes; it supplies ratings, grades, ranges and citations.
All parameters are explicit so the same code reproduces the Excel engine cell for cell.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
import math

DIM_WEIGHT = 0.2
DIMS = ["Technical", "Regulatory", "Financial", "Stakeholder", "Governance"]
# criterion id -> (dimension, weight within dimension)  [v3.2-PILOT CONFIG]
CRITERIA: Dict[str, Tuple[str, float]] = {
    "T1": ("Technical", 0.25),
    "T2": ("Technical", 0.2),
    "T3": ("Technical", 0.2),
    "T4": ("Technical", 0.15),
    "T5": ("Technical", 0.1),
    "T6": ("Technical", 0.1),
    "R1": ("Regulatory", 0.25),
    "R2": ("Regulatory", 0.2),
    "R3": ("Regulatory", 0.25),
    "R4": ("Regulatory", 0.2),
    "R5": ("Regulatory", 0.1),
    "F1": ("Financial", 0.25),
    "F2": ("Financial", 0.25),
    "F3": ("Financial", 0.2),
    "F4": ("Financial", 0.15),
    "F5": ("Financial", 0.15),
    "S1": ("Stakeholder", 0.25),
    "S2": ("Stakeholder", 0.25),
    "S3": ("Stakeholder", 0.2),
    "S4": ("Stakeholder", 0.2),
    "S5": ("Stakeholder", 0.1),
    "G1": ("Governance", 0.25),
    "G2": ("Governance", 0.25),
    "G3": ("Governance", 0.2),
    "G4": ("Governance", 0.2),
    "G5": ("Governance", 0.1),
}
JCA_BY_LEVEL = {4: 0.85, 3: 0.90, 2: 0.95, 1: 1.00}          # Very High / High / Moderate / Low
CAF_BY_LEVEL = {"Low": 0.80, "Moderate": 0.90, "High": 1.00}  # v3.2 only; Moderate/High to be confirmed against CONFIG
THRESHOLDS = {"A": (80, 60, 40), "B": (70, 50, 30), "C": (75, 55, 35)}
CATS = ["Transition ready", "Transition achievable with intervention", "Significant transition barriers", "Fundamental reassessment required"]

@dataclass
class Rules:
    version: str = "v3.3"
    thresholds: str = "A"
    caf_on: bool = False            # v3.2 True; v3.3+ False (CAL-12)
    jca_always: bool = False        # v3.2/v3.3: only when pathway is institution-dependent; v3.4 trial: True
    toa_dedup: bool = True          # CAL-13
    facility_rule: bool = False     # CAL-17 (v3.4): weakest applicable facility governs T1/T3/T6
    w_cap: Optional[int] = None     # CAL-18 (v3.4): site-statement line capped at 4
    low_step: Dict[str, float] = field(default_factory=lambda: {"E1": 0, "E2": 0, "E3": 0, "E4": 1, "W": 1})
    high_step: Dict[str, float] = field(default_factory=lambda: {"E1": 0, "E2": 0, "E3": 1, "E4": 1, "W": 0})
    high_cap: Dict[str, float] = field(default_factory=lambda: {"E1": 5, "E2": 5, "E3": 4, "E4": 3, "W": 4})
    e4_cap: int = 3                 # CAL-10: an E4-based best estimate cannot exceed 3
    measured_share: float = 0.6; inferred_share: float = 0.3; measured_min_sub: int = 4; inferred_max_sub: int = 2

@dataclass
class Criterion:
    id: str
    rating: float                       # best estimate on the balance of evidence (1-5)
    grade: str                          # E1 | E2 | E3 | E4 | W
    deliberation: Optional[Tuple[float, float]] = None   # CAL-29: both voiced ratings
    facilities: Optional[Dict[str, Tuple[float, str, bool]]] = None  # name -> (sub-rating, basis 'assessed'|'visual'|'none', applicable)
    fatal: bool = False
    citation: str = ""

def rating_used(c: Criterion, r: Rules) -> float:
    x = c.rating
    if r.facility_rule and c.facilities:
        subs = []
        for name, (s, basis, applicable) in c.facilities.items():
            if not applicable: continue
            if basis == "visual": s = min(s, 3)
            if basis == "none": s = min(s, 2)
            subs.append(s)
        if subs: x = min(subs)
    if c.grade == "E4": x = min(x, r.e4_cap)
    if r.w_cap is not None and c.grade == "W": x = min(x, r.w_cap)
    return x

def bounds(c: Criterion, r: Rules) -> Tuple[float, float]:
    x = rating_used(c, r); g = c.grade
    lo = max(1.0, x - r.low_step[g]); hi = min(5.0, x + r.high_step[g])
    if x < r.high_cap[g]: hi = min(hi, r.high_cap[g])
    else: hi = x
    if c.deliberation:
        lo, hi = min(lo, min(c.deliberation)), max(hi, max(c.deliberation))
    return lo, hi

def dimension_scores(values: Dict[str, float]) -> Dict[str, float]:
    out = {d: 0.0 for d in DIMS}
    for cid, (d, w) in CRITERIA.items(): out[d] += w * values[cid] * 20
    return out

def brs(values: Dict[str, float]) -> float:
    return sum(DIM_WEIGHT * s for s in dimension_scores(values).values())

def band(tri: float, th=THRESHOLDS["A"]) -> str:
    return CATS[0] if tri >= th[0] else CATS[1] if tri >= th[1] else CATS[2] if tri >= th[2] else CATS[3]

def confidence_class(crits: List[Criterion], weakest_sub: int, r: Rules) -> str:
    share = sum(DIM_WEIGHT * CRITERIA[c.id][1] for c in crits if c.grade in ("E1", "E2"))
    if share >= r.measured_share and weakest_sub >= r.measured_min_sub: return "Measured"
    if share < r.inferred_share or weakest_sub <= r.inferred_max_sub: return "Inferred"
    return "Indicated"

def tri(brs_value: float, jca: float, toa_share: float, caf: float = 1.0) -> float:
    """TRI = BRS x CAF x JCA + TOA points, TOA points = toa_share x BRS (negative = deduction)."""
    return brs_value * caf * jca + toa_share * brs_value

def run(crits: List[Criterion], r: Rules, *, jci_level: int, institution_dependent: bool, toa_share: float,
        confidence_level: str = "Low", weakest_evidence_sub: int = 3) -> dict:
    vals = {c.id: rating_used(c, r) for c in crits}
    los = {c.id: bounds(c, r)[0] for c in crits}; his = {c.id: bounds(c, r)[1] for c in crits}
    jca = JCA_BY_LEVEL[jci_level] if (r.jca_always or institution_dependent) else 1.0
    caf = CAF_BY_LEVEL[confidence_level] if r.caf_on else 1.0
    th = THRESHOLDS[r.thresholds]
    b, bl, bh = brs(vals), brs(los), brs(his)
    t, tl, th_ = (tri(x, jca, toa_share, caf) for x in (b, bl, bh))
    cls = confidence_class(crits, weakest_evidence_sub, r)
    cat, cl, ch = band(t, th), band(tl, th), band(th_, th)
    if cat == CATS[0] and cls != "Measured": cat = CATS[1]       # only Measured may be Transition ready
    fatal = sum(1 for c in crits if c.fatal)
    if fatal or th_ < th[2]: result, decision = ("Fundamental reassessment required", "Escalate decision")
    elif cl != ch: result, decision = (f"Information-limited: {ch} to {cl}" if False else f"Information-limited: {cl} to {ch}", "Proceed with validation")
    elif cat == CATS[2]: result, decision = (f"{cat} - robust to the evidence range", "Reassess pathway")
    else: result, decision = (f"{cat} - robust to the evidence range", "Proceed")
    return {"version": r.version, "dimensions": dimension_scores(vals), "BRS": round(b, 4), "BRS_low": round(bl, 4), "BRS_high": round(bh, 4),
            "JCA": jca, "CAF": caf, "TOA_share": toa_share, "TRI": round(t, 4), "TRI_low": round(tl, 4), "TRI_high": round(th_, 4),
            "band": cat, "band_low": cl, "band_high": ch, "confidence_class": cls, "fatal_flags": fatal, "result": result, "decision": decision}
