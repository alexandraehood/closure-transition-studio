"""Probabilistic readiness: Monte Carlo over criterion ratings and structural parameters (CAL-40 candidate)."""
import numpy as np
from .lataf_engine import CRITERIA, DIM_WEIGHT, bounds, rating_used, tri, band, THRESHOLDS

def simulate(crits, rules, *, jca, toa_share, n=20000, seed=42, toa_range=None, jca_options=None, caf=1.0):
    rng = np.random.default_rng(seed)
    W = np.array([DIM_WEIGHT * CRITERIA[c.id][1] for c in crits])
    draws = np.zeros((n, len(crits)))
    for k, c in enumerate(crits):
        lo, hi = bounds(c, rules); mode = min(max(rating_used(c, rules), lo), hi)
        draws[:, k] = mode if hi - lo < 1e-9 else rng.triangular(lo, mode, hi, n)
    brs = (draws * W).sum(axis=1) * 20
    toa = rng.uniform(toa_range[0], toa_range[1], n) if toa_range else np.full(n, toa_share)
    jcas = rng.choice(jca_options, n) if jca_options else np.full(n, jca)
    t = brs * caf * jcas + toa * brs
    th = THRESHOLDS[rules.thresholds]
    probs = {k: float(v) for k, v in {"ready": (t >= th[0]).mean(), "achievable": ((t >= th[1]) & (t < th[0])).mean(),
             "barriers": ((t >= th[2]) & (t < th[1])).mean(), "reassess": (t < th[2]).mean()}.items()}
    swing = sorted(((c.id, round((bounds(c, rules)[1] - bounds(c, rules)[0]) * W[k] * 20 * jca * (1 + toa_share), 3)) for k, c in enumerate(crits)), key=lambda x: -x[1])
    return {"p10": float(np.percentile(t, 10)), "p50": float(np.percentile(t, 50)), "p90": float(np.percentile(t, 90)), "mean": float(t.mean()), "probabilities": probs, "swing": swing}
