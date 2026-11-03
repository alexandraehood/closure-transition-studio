# Contributing
- `main` is the production baseline: rule sets frozen, `npm test` must pass (regression values pinned in `tests/`).
- `develop` is the steward line: new rule sets, calibration tables and modules. Promote to `main` only with a passing regression table and a release note that SUPERSEDES the previous version (never overwrite history).
- Never commit client data. The demonstration site is fictional and must stay so.
- Every framework change is a CAL item: what changed, why, the before/after readings on the reference cases.
- Licence: by submitting a contribution you agree that it is licensed under the Apache License 2.0 (section 5 of the licence); there is no separate contributor agreement. Pull requests follow the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
