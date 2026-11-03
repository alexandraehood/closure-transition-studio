# Releasing the Personal edition as open access (31 Oct 2026)

Recommended home: a public GitHub repository with GitHub Pages serving the single-file apps (they are static HTML, no backend), tagged releases, and a Zenodo DOI minted from each release for citation.
- Code (engine, apps, scripts): Apache-2.0 (patent-grant clause matters given the governance architecture; keep the invention disclosure separate and dated BEFORE the public release - a public release starts the clock on novelty in most jurisdictions, so file the provisional first or release only the parts you are not claiming).
- Guidance content, criteria text, playbook material: CC BY 4.0 (or CC BY-SA 4.0 if derivative guidance must stay open).
- Exclude: every client record, the client's pilot data (DATA.sites), the consultancy's internal memos, the working-group draft material unless the working group agrees, and anything under a sensitivity label.
- Structure: /engine (Python + JS, tests), /app/personal (HTML build + sources), /docs (method, calibration table, agent envelope schema, governance rules), /examples (the fictional demonstration site only), CHANGELOG, CITATION.cff, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.
- Alternatives: Hugging Face Spaces (static) for discoverability; Streamlit Community Cloud or Posit Connect Cloud if a Python/Shiny backend is added later; Observable for notebook-style explanation. None beat GitHub + Pages + Zenodo for provenance and versioning.
- Governance of the open line: production/development separation applies to the repo too - `main` = production baseline (frozen rule set, regression tests must pass), `develop` = steward line; releases supersede, never overwrite.
