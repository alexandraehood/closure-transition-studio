# LATAF platform - design brief for a GitHub / Shiny (or equivalent) application (Draft A, 30 Oct 2026)

Two streams. Stream 1 finishes the pilot to the proposal (v3.4 rules, site records, D5-D8, Transition Navigator 2.0.2). Stream 2 carries v3.3+ beyond the project: a decision platform for legacy asset transition that any owner can run. This brief is the plan for Stream 2; the engine in /engine is already the shared calculation for both.

## 1. What changes, and why it matters
Today the framework is a scoring workbook populated by prompts. The six adopted recommendations turn it into a decision system:
1. Probabilistic readiness and value of information (CAL-40) - every open gap priced by how much it moves the decision.
2. Evidence graph - every rating cites a clause; documents are ingested once and reused by every site in the jurisdiction.
3. Obligations register in the proposal's four categories (CAL-31) tied to cost drivers with Keep / Validate / Simplify / Reframe (CAL-36) - the cost-to-risk engine.
4. Portfolio optimisation - for a budget, the set of information purchases and actions that maximises expected liability reduction (CAL-41).
5. Event-triggered reassessment (CAL-38) - a permit change, incident, ownership change, new data or security re-set opens a re-screen task.
6. Jurisdiction library (CAL-42) - relinquishment precedents, security re-set cases, acceptance routes, inherited by every new site.

## 2. Architecture (stack-neutral)
- Data layer: one relational or document store (SharePoint lists / Dataverse for the Microsoft route; PostgreSQL for GitHub/Shiny). Entities: Site, Facility, Criterion rating (per revision), Evidence item, Citation (rating -> evidence item + clause), Obligation (RvA row with proposal category), Cost driver (activity, annual cost, currency, price year, obligation link, decision verb), Gap / information request (cost to close, expected VoI), Tier 2 item (assumption, barrier, monitoring deficiency, risk), Pathway assessment, Roadmap action and gate, Jurisdiction record (precedents, routes, cases), Event trigger, Revision and change log (CAL).
- Engine service: /engine/lataf_engine.py (deterministic, versioned, tested against the pilot values) and /engine/mc.py (Monte Carlo and VoI). Exposed as a Python package and a small HTTP endpoint; the workbook export calls the same functions so Excel and app never disagree.
- Agents (drafters): Site Record Builder v2 (evidence-first: ingests the site folder, builds the evidence graph, drafts ratings with grade, bounds, citation and what-would-move-it, drafts the information request list), Obligations Mapper (RvA rows to the four categories and to cost drivers), Jurisdiction Librarian (extracts precedents and routes from regulator correspondence and public registers), Portfolio Analyst (runs the engine and the optimiser, drafts the synthesis). Agents write Drafts; people accept; the engine computes. Copilot Studio today; the same instruction blocks run in any orchestration.
- Application: Shiny for Python (or Streamlit) in a GitHub repository with CI running the engine tests on every change; screens: Site record (ratings with citations and bounds), Facility view, Evidence graph, Obligations and cost drivers, Information plan (priced, VoI-ranked), Readiness (deterministic + probability bands), Portfolio (comparison, optimiser), Jurisdiction library, Change log and revisions, Triggers.
- Executive view: Power BI or the app's portfolio page; the proposal's decision category as the headline, TRI band and confidence class as diagnostics (CAL-37).

## 3. The engines (what computes what)
| Engine | Input | Output | Status |
|---|---|---|---|
| Readiness (deterministic) | 26 ratings, grades, bounds, facilities, JCI, pathway, Tier 2 counts | dimensions, BRS, TRI and bounds, category, confidence class, decision | Built and verified (5 reference tests pass) |
| Probabilistic readiness | same + structural parameter sets | P10/P50/P90, category probabilities, swing per criterion | Built (prototype on pilot site A) |
| Value of information | gaps with cost to close, Tier 2 items | change in category probability per unit cost; ranked information plan | Specified; needs cost-to-close field in the gap register |
| Cost-to-risk | RvA rows (four categories), cost drivers, decision verbs | cost by category, Simplify / Reframe candidates, annual saving range | Specified (CAL-31, CAL-36); partial in T2E today |
| Portfolio optimiser | sites' gaps and actions with cost, expected liability reduction, dependencies; budget | the set maximising expected liability reduction (knapsack with dependencies), by site and quarter | Specified (CAL-41) |
| Triggers | event feed (permit, incident, ownership, data, assurance) | re-screen task with scope | Specified (CAL-38); Power Automate or GitHub Action |
| Jurisdiction library | regulator correspondence, public registers, closed cases | precedent records inherited by new sites in the jurisdiction | Specified (CAL-42) |

## 4. Process (who does what, in order)
1. Set-up: site identity, facilities present, pathway, currency and price year, decision charter - once.
2. Ingest: documents into the evidence library; the agent builds the evidence graph (one record per document; citations per clause).
3. Draft: ratings with grade, bounds, citation, what-would-move-it; information requests with cost to close; RvA rows with proposal category; cost drivers with decision verb. No arithmetic by the agent.
4. Compute: the engine produces the deterministic and probabilistic readings and the VoI-ranked information plan.
5. Confirm: site workshop (facility by facility, worked example first, CAL-22); deliberation ranges recorded; second reader; framework owner confirms the category; regional director signs the end-state statement.
6. Decide: steering adopts rule changes only as CAL items with a regression run.
7. Watch: triggers and the annual re-screen by materiality class; every revision keeps its delta.

## 5. Challenges to plan for
- Rating anchors are still words; two assessors can read "3" differently - keep the reconcile-never-average rule (CAL-24) and the calibration runs in the Scoring agent.
- Independence: a Monte Carlo over independent criteria understates spread when the room shares one optimism; add a common factor for W-line criteria and report both.
- The structural parameters (TOA deductions, JCA, thresholds) move the category more than ratings do - decide them at steering before the probabilities are read as findings.
- Cost to close a gap is rarely recorded; without it VoI cannot be priced - add the field now (CAL-40).
- Currency and price year: local-currency figures unconverted at pilot site C; the price year of the corporate cost summary unconfirmed at pilot site A.
- Evidence access: sensitivity labels blocked one SharePoint upload in October; the platform needs a service identity with the right labels.
- Client confidentiality: the jurisdiction library must be built from public records and the owner's own documents only; no cross-client content.
- Change control: every rule, weight or threshold is a CAL item with a version string; the engine tests are the gate.

## 6. Roadmap
- Nov 2026: v3.4 rules at steering; engine tests as the acceptance gate; CAL-10 rule into the agents; Monte Carlo sheet in the trial workbook.
- Dec 2026: v3.5 specification (CAL-31..42); Transition Navigator 2.1; D5-D8 final.
- Q1 2027: repository live (engine, tests, data schema, Shiny app skeleton); SharePoint/Dataverse or PostgreSQL decided; Site Record Builder v2 drafting into the app; jurisdiction library seeded from the four pilots.
- Q2 2027: VoI-priced information plans and the portfolio optimiser on Wave 1 sites; triggers live.
- Q3-Q4 2027: annual re-screen cycle; library growth; publication of the method.
