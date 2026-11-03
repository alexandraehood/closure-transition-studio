# LATAF Transition Studio v2 - how to walk a site through the framework (31 Oct 2026)

Open `LATAF Transition Studio v2 (Draft A, 31 Oct 2026).html` in a browser (no install; records are saved in the browser and exported as JSON). Pick the site at the top, the rule set (v3.2 as built / v3.3 / v3.4 candidate) and the threshold set; every tab recalculates.

1. Walkthrough - the eleven steps with a tick when the record carries enough to move on; each step opens its tab.
2. 1 Asset profile - identity, pathway, decision charter, exposure, assessors; currency and price year; site attribute tags (used by the land-use optimiser); corporate objective and alignment (CAL-33).
3. 2 Evidence and gaps - one row per document (graded by provenance, not age); five evidence sub-ratings; gaps with cost to close (CAL-40).
4. 3 Requirements vs assumptions - every obligation in the proposal's four categories with instrument and clause, treatment and cost verb (CAL-31, CAL-36).
5. 4 Readiness and engine - 26 criteria: rating slider, grade, voiced range, citation, what would move it; facility sub-ratings for T1/T3/T6; the engine reading (headline, TRI and bounds, class) updates live; Tier 2 deduction as recorded or auto from open Tier 2 items.
6. 5 Jurisdiction - twelve indicators; JCI and JCA follow.
7. Interviews and questionnaire - the interview guide (six pulse ratings, seven open questions) by role and party; triangulation of pulse against the engine's dimensions; themes mined from open answers.
8. Workshop - date and parties; agenda per CAL-22; accept / override each rating with a reason or voiced range (writes the record, sets W grades, moves the basis to site-confirmed, logs the change); end goals per party with alignment; opportunity board with idea prompts drawn from the land-use options that fit the site, the interview themes and the weakest criteria; votes per party; promote an idea to the opportunity register; documents owed; parking lot.
9. Probability and robustness - independent, shared-optimism (copula) and structural runs; histogram; 3x3 rule-set x threshold grid with a verdict.
10. Information plan - priced shopping list: leverage per gap and Tier 2 item, budget knapsack.
11. Tier 2 findings and registers - findings, risks, opportunities, Tier 2 items, pathway feasibility (T2F) - all editable.
12. Pathways and land use - optimiser over ten end-state options with fit, probability of success, savings, liability transfer, one-off cost; Pareto flag; recommended sequence; promote an option to the opportunity register.
13. Cost-to-risk ledger - categories x verbs with saving ranges.
14. Tier 3 case and roadmap - quantification gate, PV comparison, roadmap with gates G0-G5, actions (triggers add re-screen tasks here).
15. QA, change log and review - twelve checks, review state Draft -> In review -> Validated in workshop -> Confirmed by framework owner -> Published, revisions, change log.
16. Portfolio - every site under the chosen rules; like-for-like note.
17. Library and triggers - jurisdiction records; event triggers open re-screen tasks.
18. Sites, export and import - add a new site (blank v3.3 record), reset to the pilot records, export this site or the portfolio as JSON, import JSON.

Engine: identical to lataf_engine.py; `node exercise.js` renders every tab for every site headlessly; `node test.js` runs the reference tests.
