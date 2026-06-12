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

Allowed finding statuses:

- `open`: confirmed or strong finding that still needs routing or work.
- `planned`: finding is assigned to a plan and owned by follow-up work.
- `resolved`: finding has been handled; record the closeout reason such as `fixed`, `accepted_risk`, `wont_fix`, or `not_reproducible`.
- `verified`: fix or disposition has been verified and the finding is closed.

| ID | Severity | Status | Finding | Evidence | Owner Plan | Branch/Commit | Verification | Closeout |
|---|---|---|---|---|---|---|---|---|
| AUD-1 | P1/P2/P3 | open |  |  |  |  |  |  |

Do not archive this audit while any finding remains `open`, `planned`, or `resolved` without an explicit closeout reason that no longer needs verification.

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

- Keep active: leave `status: active` in `docs/audits/` while any finding remains `open`, `planned`,
  or `resolved` without a closeout reason that no longer needs verification.
- Archive: set `status: archived` and move to `docs/audits/archived/` only after every finding is
  `verified`, or `resolved` with `accepted_risk`, `wont_fix`, `not_reproducible`, or fully
  transferred to a still-active plan that owns follow-up.
- Delete: remove this file only when stable conclusions are represented elsewhere, all findings are
  closed or transferred, and the raw evidence has no future value.

Do not use `distilled` as a final state.
