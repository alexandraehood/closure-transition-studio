# Release gate (open edition)

No client data ever enters the public repository. `tests/release_gate.py` scans every text file for client and pilot-site identifiers and exits non-zero while any remain. It runs in CI (`.github/workflows/ci.yml`) and in `npm test`.

Status at the open edition release candidate (3 Nov 2026): **PASSED**.

| File | Status | What was done |
|---|---|---|
| apps/reference-model-v3.3.html, apps/transition-studio-pilot.html, src/modules/data2.js | pass | Pilot records replaced by one fictional demonstration record, "Harbourview Works (illustrative)" (HVW); regression anchors kept as the anonymous Reference vector A (57.288 / 36.828 / 55.242); apps rebuilt from `src/` with `tools/build_apps.py` |
| apps/navigator.html, src/modules/navdata2.js, tests/navdata2.js | pass | Fictional deployment configuration and example (Example Mining Company, Harbourview Works, synthetic draft ratings, every item To review); ATRF engine byte-identical; anonymous ATRF regression vector `NAV.regvec` |
| docs/LATAF_platform_design.md, docs/agent_instruction_amendments.md, docs/agent_section_replacements.md, docs/open_access_release.md | pass | Site names replaced by "pilot site A-D", the client by "the client"; project number, document titles and regulator references removed |
| apps/personal-edition.html, apps/pattern-finder.html, src/modules/pattern_engine.js, tests/pattern_packs.js | pass | Already clean at Draft A; placeholder text and seed constants aligned with the demonstration record |
| tests/ | pass | Harnesses adapted to the fictional examples; pilot-coded variable names replaced by Reference vector A |

The Ontario public-law test pack (docs/ontario_sudbury_test_pack.json) and the public-law entries of the jurisdiction library are public regulatory structure only and are allowed.

Full account: `docs/deidentification_record.md`.
