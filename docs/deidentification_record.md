# De-identification record - open edition release candidate (3 Nov 2026)

This record lists what was changed to make the repository fit for public release, by category, and how the result was verified. It deliberately does not reproduce any removed identifier: the four pilot sites are referred to as pilot site A (the site-confirmed one), B, C and D, the client as "the client", the consultancy as "the consultancy". The authoritative check is `python3 tests/release_gate.py`, which PASSES at this version.

## Principle
No client data in the public tree: no client or pilot-site names, project numbers, site-specific document titles, citations, key facts, regulator correspondence, or ratings tied to a named site. Public-law material (statutes, regulations and published guidance with public URLs) is allowed. Where a regression anchor was needed, the anonymous vector of 26 ratings and grades was kept and labelled "Reference vector A"; it carries no name, document or citation.

## What changed, by file category

### 1. Reference Model and pilot bench (`apps/reference-model-v3.3.html`, `apps/transition-studio-pilot.html`, `src/modules/data2.js`, `src/pathways_v2.js`, `src/modules/studio_app.js`)
| Removed | Replaced with |
|---|---|
| Five pilot site records in `DATA.sites` (names, countries, jurisdictions and permit references, ratings, grades, deliberation ranges, facility sub-ratings, gaps, risks, opportunities, Tier 2 items, roadmaps, 50-field profiles incl. legal entity, decision owner, assessors and reviewers, cost figures) | One fictional demonstration record, "Harbourview Works (illustrative)", code HVW, country Exampleland, jurisdiction "Illustrative jurisdiction", pathway "Reduced care and maintenance" (from the app's own pathway list); invented ratings 1-5 and grades E1-E4/W for all 26 criteria; three fictional documents (`DOC-HVW-01..03`) with citations per criterion; two fictional gaps; fictional key facts, risks, opportunities, Tier 2 items, roadmap and profile. Every other DATA field (`ids`, `triggers`, `interviewGuide`, `questions`) is byte-identical. |
| Jurisdiction library (`DATA.jlib`): eight entries derived from pilot records (precedents, security cases, disputes) citing pilot gap/risk IDs | Removed. The thirteen public-law entries (statutes, codes, policies with public URLs and retrieval dates) are kept; one illustrative entry for the fictional jurisdiction added. |
| Workshop parties list: the client's legacy-sites unit and the consultancy's facilitator | "Owner - corporate closure / legacy team" and "Facilitator" |
| Site attribute tags and pathway-feasibility defaults keyed by the four pilot codes (`PATHWAYS.TAGS`, `PATHWAYS.T2F`) | Defaults for HVW only (the app overrides them from each record anyway) |
| Accounting-provision constant keyed by the four pilot codes; default current site; seeded revision/change-log authorship; "as stated by <client>" profile label; a paste placeholder quoting a pilot effluent-permit number; a calibration-pairs placeholder using a pilot code | HVW-only constant; HVW as default; blank authorship and "fictional demonstration" notes; "as stated by the owner"; neutral placeholders |
| Header, controls and footer: the client's pilot name with project number, the consultancy's name, per-site regression readings, "pilot values" of pilot site A | "Open edition: the only populated site is a fictional demonstration record"; "regression: Reference vector A 57.288 (v3.3 site-confirmed) · 36.828 (v3.2 record) · 55.242 (ATRF)"; "tested against the anonymous reference vector" |
| Build: the app body lived only inside the HTML | Extracted to `src/modules/studio_app.js` (with `// @include` markers for `studio_ext.js` and `graph_ext.js`); `tools/build_apps.py` rebuilds all three apps from `src/` and `--check` verifies they match (used in CI). Only the default rule set differs between the two studio apps. |

### 2. Navigator (`apps/navigator.html`, `src/modules/navdata2.js`, `src/modules/navapp2.js`, `tests/navdata2.js`, `tests/navapp2.js`, `tests/atrf.js`)
| Removed | Replaced with |
|---|---|
| `NAV.example.config`: the client's name and logo file, the pilot programme name with project number, the confidential footer, one pilot site with its evidence-library path, its jurisdiction, a restricted-files exclusion naming a pilot facility | Client "Example Mining Company", portfolio "Illustrative legacy portfolio", footer "Illustrative - no client data", one jurisdiction "Illustrative jurisdiction", one site "Harbourview Works" (HVW) with evidence library "Evidence Library/HVW" |
| `NAV.example.assessment`: the pilot site's workshop assessment (six real document titles with permit numbers, key facts incl. cost and provision figures, 46 items with real draft ratings, accept/override decisions and workshop comments, notes with the site's readings) | One fictional assessment: 46 items with deterministic synthetic draft ratings (pattern of 2-4), confidence Medium, summary "Illustrative draft", every decision "" (To review); three fictional documents; fictional key facts |
| Self-test and intro text reading the pilot example's TRI; example-load buttons and paste placeholders naming the pilot site and its permit | `NAV.regvec` - the anonymous ATRF regression vector (26 ratings, 5 evidence answers, 12 jurisdiction answers) labelled "Reference vector A", expected 55.242 (BRS 68.2 x CAF 0.90 x JCA 0.90); self-test, intro text and placeholders refer to it and to the fictional example |
| - | `NAV.crit`, `EQ`, `PD`, `JUR`, `KF`, `FAC`, `FACSUB`, `lists`, `settings` are byte-identical. The ATRF engine (`src/modules/atrf.js`, `tests/atrf.js`) is byte-identical (verified by hash). `tests/navdata2.js` and `tests/navapp2.js` are copies of the sources. |

### 3. Method notes (`docs/LATAF_platform_design.md`, `docs/agent_instruction_amendments.md`, `docs/agent_section_replacements.md`, `docs/open_access_release.md`)
| Removed | Replaced with |
|---|---|
| Four pilot-site names (nine occurrences), the client's name (three), the client-branded agent name | "pilot site A" (the site-confirmed one), "pilot site B", "pilot site C", "pilot site D"; "the client"; "the Strategist agent" |
| The pilot Tier 2 item identifiers (seven) | A count by type ("two open assumptions, one barrier, three monitoring items and one risk") |
| Currency names and the client's cost-summary label at two pilot sites | "local-currency figures" / "the corporate cost summary" |
| The consultancy's memos and a working group's acronym in the exclusion list | "the consultancy's internal memos", "the working-group draft material" |
| - | Each changed sentence was re-read in context. The historical reference readings for pilot sites A-D stay as anonymous numbers, with a sentence noting that the open edition ships only Reference vector A. |

### 4. Shared sources already embedded in the Personal edition (`src/engine.js`, `src/modules/agents.js`, `src/modules/conservatism.js`, `src/modules/app_open2.js`, `src/modules/personal_ext.js`, `src/modules/decision_ext.js`, `apps/personal-edition.html`, `tests/app_open2..5_test.js`)
| Removed | Replaced with |
|---|---|
| Regression labels naming pilot site A in `GOV.REGRESSION` | "Reference vector A (v3.3 site-confirmed)", "Reference vector A (v3.2 record)", "Reference vector A (ATRF)" |
| Pilot site A in the calibrated-bounds comment and in a conservatism-library basis note | "pilot site A" |
| Provision constant keyed by the four pilot codes; a permit-number placeholder; a pilot-code placeholder and a pilot-code guard; seeded change-log authorship | HVW-only constant; neutral placeholders; HVW; blank |
| - | The Personal edition and the pattern finder already passed the gate; only these literal, byte-equal replacements were applied to `apps/personal-edition.html` and the fixtures so they stay consistent with the sources. |

### 5. Tests (`tests/engine_reference.test.js`, `tests/test_engine.py`, `tests/exercise_personal.js`, `tests/exercise_personal_v5.js`, `tests/exercise_navigator.js`, new `tests/exercise_studio.js`)
| Removed | Replaced with |
|---|---|
| Variable and test names coded to pilot site A | `VEC_A_*`, `test_*_reference_vector_a_*` (values unchanged) |
| A "foreign site" fixture using pilot site A's name; a hard-coded private test-pack path naming another company's site; a check that spelled out two other company names | "Elsewhere Mine" (fictional); default paths inside the repository (`apps/personal-edition.html`, `docs/ontario_sudbury_test_pack.json`); a neutral client-banner check, with `tests/release_gate.py` as the authority |
| Navigator harness pinned to the pilot example's code and reading | Reference vector A check (55.242) plus the fictional HVW example: all items To review on load, reading after accepting every draft, 2.0.2 facility rule, open findings, briefs, re-assessment |
| - | New `tests/exercise_studio.js`: stub-DOM harness for both studio apps - every tab renders for no site, a blank new site and the demonstration record; every offered rule set renders; a blank site inherits nothing from the demonstration record; Reference vector A reads 57.288 / 36.828 / 55.242 through the embedded engine. Harnesses now run from any working directory. |

### 6. Repository scaffolding
- `README.md`: release-gate paragraph (PASSES; fictional demonstration content only), data paragraph, status line (Draft A kept; "open edition release candidate, 3 Nov 2026" added), engine paragraph (Reference vector A; Python test needs no pytest).
- `RELEASE_GATE.md`: status PASSED with the per-file table.
- `.github/workflows/ci.yml`: Node engine and pattern tests, Python engine test, build check, stub-DOM harnesses, release gate on push and pull request. `.github/workflows/pages.yml`: an unquoted `${{ }}` expression inside a flow mapping was quoted so the file parses as YAML.
- `SECURITY.md`: how to report an issue privately; the no-client-data policy.
- `.github/ISSUE_TEMPLATE/`: bug report; CAL item (rule change) requiring rule changed, regression effect and calibration evidence; blank issues disabled with a private security contact link.
- `package.json`: `npm test` runs the Node tests, all harnesses and the gate; `test:engine`, `test:apps`, `build`, `gate` scripts.
- `tools/build_apps.py`: the build script described above.

## Files removed from the release tree
None. Everything could be de-identified or replaced by fictional content within the budget.

## Verification (3 Nov 2026)
| Check | Result |
|---|---|
| `python3 tests/release_gate.py` | PASSED - no client or site identifiers found |
| `node tests/engine_reference.test.js` | ALL ENGINE TESTS PASS (57.288 / 37.128 / 23.868 / 48.544 chain on Reference vector A) |
| `node tests/pattern_engine.test.js` | all checks passed |
| `python3 tests/test_engine.py` | 5 tests PASS (standard library only) |
| `node tests/exercise_studio.js` | 18 PASS, 0 FAIL - both studio apps: every tab renders for no site, blank site and HVW; every rule set; Reference vector A 57.288 / 36.828 / 55.242 |
| `node tests/exercise_personal.js` | all tabs render (no site, blank, demonstration); governance ingest 1 accepted / 1 quarantined / 1 rejected; regression unchanged |
| `node tests/exercise_personal_v5.js` (against `apps/personal-edition.html` and against the `app_open5_test.js` fixture) | 83 PASS, 0 FAIL each |
| `node tests/exercise_navigator.js` | Reference vector A 55.242; HVW example incomplete on load (every item To review), TRI 42.048 after accepting every draft; all pages render blank, with the example and after a re-assessment |
| `python3 tools/build_apps.py --check` | apps match their sources |
| HTML validator on every file in `apps/` and on `index.html` | status success, 0 errors, 0 warnings |
| Secondary scan (people's names, permit numbers, legal entities, facility names, site codes, programme names) across all text files | none remaining outside the gate's own term list; public-law entries retained by design |
