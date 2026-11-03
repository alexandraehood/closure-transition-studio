# Security and data policy

## Reporting an issue
- Open a GitHub issue using the **Bug report** template for defects that do not involve sensitive data.
- For a vulnerability, or for anything that might expose non-public information (a client name, a site record, a document title, a project number, a person's name), **do not open a public issue**. Use GitHub's private vulnerability reporting ("Report a vulnerability" under the Security tab) or contact the maintainer listed in `CITATION.cff`. Include the file, the line and why it matters; we acknowledge within five working days.
- Browser-only apps: the tools run entirely in your browser and store records in `localStorage`. They make no network calls. Treat any exported JSON as your own data and keep it out of this repository.

## No-client-data policy
- The public repository carries **no client data**: no client or pilot-site names, project numbers, site-specific document titles, citations, key facts, regulator correspondence, or ratings tied to a named site.
- Every app ships with fictional demonstration content only ("Harbourview Works (illustrative)", "Example Mining Company"). The regression anchors are anonymous vectors of 26 ratings and grades ("Reference vector A"); they carry no name, document or citation.
- Public-law material (statutes, regulations, published guidance with public URLs) is allowed.
- `python3 tests/release_gate.py` scans every text file for the identifiers of the pilot programme and fails the build while any remain. It runs in CI on every push and pull request. Add new identifiers to its term list before any new private material is ever worked on in a branch.
- Pull requests that add real site records, even de-identified ones, are declined. Use the fictional demonstration record or a clearly synthetic one, and say so in the record itself (e.g. "(illustrative)").
- If client content is found in the history of a public branch, report it as above; the remedy is to purge the history and rotate anything that could have been derived from it, not just to delete the file.
