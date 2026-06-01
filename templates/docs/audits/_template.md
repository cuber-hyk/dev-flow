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
- `planned`: finding is assigned to a plan but not fixed yet.
- `in_progress`: finding is being fixed in a branch.
- `fixed`: implementation exists but verification or closeout is not complete.
- `verified`: fix or accepted disposition has been verified.
- `accepted_risk`: user explicitly accepted the risk.
- `wont_fix`: user explicitly decided not to fix.
- `not_reproducible`: finding was rejected after verification.

| ID | Severity | Status | Finding | Evidence | Owner Plan | Branch/Commit | Verification | Closeout |
|---|---|---|---|---|---|---|---|---|
| AUD-1 | P1/P2/P3 | open |  |  |  |  |  |  |

Do not archive this audit while any finding remains `open`, `planned`, `in_progress`, or `fixed`.

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

- Keep active: leave `status: active` in `docs/audits/` while any finding remains open, planned,
  in progress, fixed-but-unverified, or not fully routed.
- Archive: set `status: archived` and move to `docs/audits/archived/` only after every finding is
  `verified`, `accepted_risk`, `wont_fix`, `not_reproducible`, or transferred to a still-active plan
  that fully owns follow-up.
- Delete: remove this file only when stable conclusions are represented elsewhere, all findings are
  closed or transferred, and the raw evidence has no future value.

Do not use `distilled` as a final state.
