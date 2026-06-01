---
artifact_type: plan
status: active
created: {{DATE}}
updated: {{DATE}}
owner: agent
plan_readiness: ready
---

# Plan Title

## Goal

State the verifiable outcome in one sentence.

## Scope

- In scope:
- Out of scope:

## Plan Readiness

- Goal clear:
- Scope clear:
- Source of truth known:
- Critical decisions confirmed:
- Validation path known:

Do not use this template for unresolved decision requests. If critical decisions are unresolved,
ask the user first and create/update this plan only after confirmation.

## Assumptions And Decisions

- 

## Decision Points Checked

| Decision | Chosen route | Confirmed by | ADR gate |
|---|---|---|---|

## Steps And Verification

1. Step:
   Verification:

## Acceptance Criteria

- 

## Artifact Routing

- Capability updates:
- Audit output:
- ADR gate: needed/not needed/maybe; reason:
- Tests:

## Git Visibility

- After creating this file, run `git status --short --branch --untracked-files=all`.
- If this file is ignored, add a minimal allow rule or report that the plan is not tracked.

## Closeout

During `dev-distill`, choose one final action:

- Archive: move this file to `docs/plans/archived/` and set `status: archived` when the plan has trace value.
- Delete: remove this file when it has no independent future value.

Do not use `completed` or `superseded` as final states.
