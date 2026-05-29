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

## Verification

- Commands run:
- Not verified:

## Git Visibility

- After creating this file, run `git status --short --branch --untracked-files=all`.
- If this file is ignored, add a minimal allow rule or report that the audit is not tracked.

## Closeout

During `dev-distill`, choose one:

- `distilled`: stable facts moved to capability docs, ADRs, or tests.
- `archived`: evidence retained outside default context.
- delete: useful conclusions are represented elsewhere and evidence has no future value.
