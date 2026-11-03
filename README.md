# Closure Transition Studio

Open, browser-only tools for deciding what a legacy, closed or closing mine site can become - and what it will take to get there - while reducing liability, carrying cost and risk.

**Three models, kept distinct**

| App | Purpose | Rule set |
|---|---|---|
| `apps/navigator.html` | Four-step guided assessment (Transition Navigator 2.0.1 workflow): configuration, evidence library, 46-item review with accept/override, site reports, executive brief, re-assessment history | ATRF 1.0 (fixed) |
| `apps/reference-model-v3.3.html` | Frozen reference baseline of the Legacy Asset Transition Assessment Framework; regression values pinned | v3.3 (locked) |
| `apps/personal-edition.html` | Development line: full framework record, documents and extraction, jurisdiction intelligence, PMLU five-step process, innovation / nature-based solutions / biomimicry, re-mining and critical minerals, standards compliance, nature and natural capital accounts, ARO estimator, stacked-conservatism analyser, multi-agent governance layer | all, incl. v3.4c calibrated |
| `apps/transition-studio-pilot.html` | Working bench with every rule set side by side | all |
| `apps/pattern-finder.html` | Pattern finder: 26 deterministic patterns in seven classes (stacking, inheritance, duplication, mis-sizing, drift, evidence, systemic) over typed registers, with published thresholds, activities per class and three illustrative packs. Also wired into the Personal edition as the Patterns & opportunities tab, fed by the assumption-extraction brief; the Personal edition also carries a Strategic review module (goal, options register, options and stakeholder matrices, validation workshop kit, roadmap and five-year plan, value levers, report) | rule library (thresholds are CAL items) |

Every app is a single self-contained HTML file: open it in a browser, no install, no server; records are saved in the browser and exported/imported as JSON. GitHub Pages serves them as they are (`index.html` links to each).

**Engine** - `src/engine.js` (JavaScript) and `engine/lataf_engine.py` (Python) implement the same deterministic rules; `tests/` holds the reference values as an anonymous vector of 26 ratings and grades, Reference vector A (v3.3 site-confirmed = 57.288, v3.2 record = 36.828, ATRF = 55.242). Run `npm test` (Node only) and `python3 tests/test_engine.py` (standard library only, no pytest needed); `tools/build_apps.py` rebuilds the single-file apps from `src/`.

**Principles** - the engine computes, people decide; rate the condition, grade the evidence (undocumented is a gap, not a 2); every number carries a citation; nothing is quantified past the prerequisite gate; production and development rule sets are separated and promoted only through regression tests and sign-off.

**Data** - the repository contains no client data. Every app ships with fictional demonstration content only: the Reference Model and the pilot bench carry one record, "Harbourview Works (illustrative)" (code HVW, Exampleland), the Navigator carries an illustrative configuration (Example Mining Company, Harbourview Works) with a synthetic draft assessment, and the Personal edition carries its fictional demonstration site. Seed unit rates, regional factors and TRLs are illustrative placeholders. See `docs/deidentification_record.md` and `SECURITY.md`.

**Licence** - code under the Apache License 2.0 (see `LICENSE` and `NOTICE`), which carries an express patent licence from every contributor. Guidance text under CC BY 4.0. Cite with `CITATION.cff`.

**Status** - Draft A, 31 October 2026; open edition release candidate, 3 Nov 2026. See `docs/` for the method notes, the agent envelope and governance rules, the calibration note, the open-access release note and the de-identification record.

**Release gate** - `python3 tests/release_gate.py` scans every file for client and site identifiers and must pass before any public push. At this version (open edition release candidate, 3 Nov 2026) the gate PASSES: every app ships with fictional demonstration content only, the method notes refer to the pilot sites as "pilot site A-D" and to "the client", and the regression anchors are kept as the anonymous Reference vector A. Continuous integration (`.github/workflows/ci.yml`) runs the Node tests, the Python engine test and the gate on every push and pull request.

**Release plan** - `docs/RELEASE_PLAN.md`: pre-release decisions (ownership, licence, patent position), the publishing steps, operating rules (release gate in CI, CAL process for rule changes, three-layer architecture) and the roadmap v0.1 to v1.0.
