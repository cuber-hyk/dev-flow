---
artifact_type: audit
status: active
created: {{DATE}}
updated: {{DATE}}
scope: ""
source_of_truth: code
---

# Audit Title

## Scope

State exactly what was reviewed.

## Fact Sources

- Code:
- Tests:
- Docs:
- Runtime checks:

## Findings

| Severity | Finding | Evidence | Recommended next step |
|---|---|---|---|

## ADR Gate

- Needed: yes/no/maybe
- Reason:

## Verification

- Commands run:
- Not verified:

## Git Visibility

- After creating this file, run `git status --short --branch --untracked-files=all`.
- If this file is ignored, add a minimal allow rule or report that the audit is not tracked.

## Closeout

During `dev-distill`, choose one final action:

- Archive: set `status: archived` and move to `docs/audits/archived/` when evidence has trace value.
- Delete: remove this file when stable conclusions are represented elsewhere and evidence has no future value.

Do not use `distilled` as a final state.
