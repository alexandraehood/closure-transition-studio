# Closure Transition Studio - GitHub release plan (open edition)
Prepared 3 Nov 2026. Companion to the open-edition package `closure_transition_studio_open_edition_v3.zip` (repository tree, release gate, CI). Everything below can be done from a laptop with Git and a GitHub account; Cowork cannot push to GitHub for you.

## 1. What is being released
| Item | In the package | Note |
|---|---|---|
| `apps/personal-edition.html` | Development line, 36 tabs incl. Patterns & opportunities, Assumption extractor, Strategic review | De-identified; fictional demonstration record only |
| `apps/pattern-finder.html` | Standalone pattern finder, 26 rules, 3 illustrative packs | No client data by construction |
| `apps/reference-model-v3.3.html`, `apps/transition-studio-pilot.html` | Frozen reference baseline and the rule-set bench | Pilot records replaced by the fictional "Harbourview Works" record; regression anchors kept as anonymous vectors |
| `apps/navigator.html` | Four-step guided assessment (ATRF 1.0) | Fictional configuration and example |
| `src/`, `engine/` | JavaScript engine and modules; Python engine port | Identical rules; reference readings pinned in `tests/` |
| `tests/` | Engine reference tests, pattern engine tests, stub-DOM harnesses, `release_gate.py` | The gate is the no-client-data control |
| `docs/` | Method notes (de-identified), pattern library, Ontario public-law test pack, open-access release note, de-identification record | Public-law content only |
| `.github/workflows/pages.yml`, `ci.yml` | GitHub Pages deployment; CI on every push | CI fails the build if the gate fails |
| `LICENSE` (Apache-2.0), `NOTICE`, `CITATION.cff`, `CONTRIBUTING.md`, `SECURITY.md`, issue templates, pull-request template (CAL checklist) | Governance files | Licence decided (section 2) |

Rule: nothing goes public until `python3 tests/release_gate.py` prints PASSED on the exact tree being pushed.

## 2. Pre-release decisions (yours, before step 4)
| Decision | Options | Recommendation |
|---|---|---|
| Who owns and publishes | Personal GitHub account; an employer organisation account; a new organisation for the Studio | **Decided 3 Nov 2026: personal GitHub account.** Confirm your employer's IP and confidentiality position before the repository is made public (step 6 of the publishing instructions); no employer or client name in the repository description. This plan does not give legal advice. |
| Licence | MIT (as drafted: permissive, short); Apache-2.0 (adds an explicit patent grant and contribution terms) | **Decided 3 Nov 2026: Apache-2.0** (express patent grant; contributions are licensed under section 5 of the licence, so no separate contributor agreement). Applied in the package: `LICENSE`, `NOTICE`, `README.md`, `package.json`, `CITATION.cff`, `index.html`. |
| Patent position | File a provisional before the first public push, or publish without | **Open.** A push to a private repository is not a public disclosure, so steps 1-5 can proceed now; decide, and file the provisional if wanted, before the repository is made public in step 6. |
| Name and attribution | "Closure Transition Studio"; author line in CITATION.cff | Keep; add ORCID if you have one. |
| Scope of the first public version | All five apps, or Personal edition + pattern finder only | All five pass the gate; the Navigator fictional example is the weakest demonstration, so label it clearly in the README. |
| Governance of rule changes | CAL process as in the Studio (every rule, threshold or bound change is a CAL item with regression effect and calibration evidence) | Enforced by the CAL issue template and the pinned reference tests. |

## 3. Release steps (about one hour, once the decisions are made)
1. Unzip the package into an empty folder; open a terminal there.
2. `python3 tests/release_gate.py` must print PASSED. `node tests/engine_reference.test.js`, `node tests/pattern_engine.test.js` and `python3 tests/test_engine.py` must pass. Open each file in `apps/` in Edge once (five minutes each): first open, demonstration record, one tab of each kind.
3. Licence: Apache-2.0 is already applied in the package (`LICENSE`, `NOTICE`, `README.md`, `package.json`, `CITATION.cff`, `index.html`); nothing to change.
4. Create the repository on GitHub (Private first): name `closure-transition-studio`, no README/licence from the template (the package has them). Do not add client names anywhere in the description.
5. In the terminal:
   `git init -b main`
   `git add .`
   `git commit -m "Closure Transition Studio - open edition release candidate (Draft A, 3 Nov 2026)"`
   `git remote add origin https://github.com/<account>/closure-transition-studio.git`
   `git push -u origin main`
6. In the repository settings: Branches: protect `main` (require pull request and passing CI). Actions: allow GitHub Actions. Pages: Source = GitHub Actions (the included `pages.yml` deploys `index.html` and `apps/`). Security: enable Dependabot alerts and private vulnerability reporting (SECURITY.md explains the process).
7. Wait for the first CI run to pass (tests plus release gate). Open the Pages URL; check each app loads.
8. Tag the release: `git tag -a v0.1.0 -m "Open edition release candidate, Draft A"` then `git push origin v0.1.0`; create a GitHub Release from the tag with the one-paragraph description from the README and the note "Illustrative content only; no client data".
9. Optional: connect Zenodo to the repository before the release so the tag gets a DOI; add the DOI to `CITATION.cff`.
10. Flip the repository to Public only after steps 2-8 are green and the section-2 decisions are recorded.

## 4. Operating rules after release
- No client data, ever: the release gate runs in CI on every push and pull request; a contribution that fails it is not merged. Client work stays in the internal editions; the open edition receives only engine, schema and shell changes plus fictional or public-law packs.
- Every rule change is a CAL item: opened with the CAL issue template (rule changed, regression effect on the pinned readings, calibration evidence), merged by pull request with the reference tests updated in the same change, and recorded with a rule-set version string. Thresholds in the pattern library and the v3.4c bounds are rules.
- Three layers stay separate: engine (JavaScript and Python, identical rules), record schema (JSON, versioned, import bridge), shells (single-file HTML; the tenant managed app and the client editions are built from the same engine and schema).
- Versioning: semantic versions for the repository (v0.x until the bounds are confirmed by calibration pairs from more than one site); the rule sets keep their own labels (v3.2, v3.3, v3.4c, ATRF 1.0).
- Releases carry a changelog in GitHub Releases (the open edition is not a first-issue client deliverable, so a public changelog is right here); the apps themselves carry no change log.
- Contributions: CONTRIBUTING.md (small pull requests, tests required, no client data, screening-level language). Treat issues that propose site-specific content as out of scope.

## 5. Roadmap for the open edition
| Milestone | Content | Gate |
|---|---|---|
| v0.1.0 (now) | Five apps, engine, tests, release gate, CI, docs | Gate PASSED; CI green; Pages live |
| v0.2.0 | Navigator: nine-dimension screening record, requirements vs assumptions matrix, risk-to-cost-to-liability ledger, executive page (ported from the client build once it is verified in the pilot); Personal edition: finder outcomes feeding hit-rate statistics | Harness assertions per tab; validator clean |
| v0.3.0 | Pathway assessment, Tier 2 feasibility, financial case and roadmap in the Navigator; Python port of the pattern engine; back-test harness on one fictionalised completed closure | Reference readings unchanged; back-test documented |
| v0.4.0 | Calibrated bounds (v3.4c confirmed or revised) once pairs from more than one site exist, as a CAL item with the evidence | CAL issue closed with regression effect recorded |
| v1.0.0 | Stable record schema v1, documented engine API, published method paper or technical note citing the repository | Schema frozen; CITATION updated with DOI |

## 6. What stays out of the open edition
Client editions and their records; client trial reports and test records; review-process material beyond its generic structure (the Strategic review module ships generic); the tenant-specific managed-app source; user guides that name client sites. These stay in the owner's internal handover package.
