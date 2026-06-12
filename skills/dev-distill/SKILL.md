---
name: dev-distill
description: Distill completed development, audit, review, debugging, or documentation work into durable repository knowledge. Use after implementation or from the `/dev-branch` skill's pre-review distill gate when task outcomes may change domain vocabulary, feature docs, capability docs, ADRs, audit reports, plan records, context maps, or tests. Classifies information, writes it to the right destination, then closes plans and audits by archiving or deleting them. Do not use for initial orientation, task planning, auditing, or implementation.
---

# Dev Distill

Use this skill after implementation, or inside the `/dev-branch` skill before the review gate, to keep
repository memory accurate without accumulating process noise.

## Boundary

Dev Distill does:

- Identify durable knowledge produced by the task.
- Update the right long-lived documents when needed.
- Run the ADR gate and create, update, archive, or recommend ADRs when the gate passes.
- Recommend tests for business rules and regression-prone logic.
- Close process artifacts after durable knowledge is captured.
- Update `docs/ai/context-map.md` when new capabilities, ADRs, or core entry points are added.
- Recommend the `/dev-check` skill after lifecycle cleanup.
- Keep same-task knowledge updates in the same reviewed branch when invoked by the `/dev-branch` skill.

Dev Distill does not:

- Enter a repository from scratch; use the `/dev-orient` skill.
- Create the implementation plan; use the `/dev-plan` skill.
- Perform the audit; use the `/dev-audit` skill.
- Redo implementation work.
- Write broad postmortems unless explicitly requested.

## Document Routing

| Information type | Destination | Rule |
|---|---|---|
| Stable domain term | `CONTEXT.md` | Only terms reused across modules. |
| Current feature behavior | `docs/features.md` when the project uses it | Document current behavior only. |
| Current module facts, APIs, data sources, rules | `docs/capabilities/*.md` | Only current recommended behavior. |
| Important hard-to-reverse decision | `docs/adr/YYYY-MM-DD-short-title.md` | Use only when the ADR gate passes. |
| Current confirmed UI design and reuse rules | `DESIGN.md` | Update in place through `/dev-design-system`; remove stale rules. |
| Exact UI foundation values | `design-tokens.json` | Keep one current value source; avoid duplicated manual values. |
| Executable business rule | tests | Prefer tests for regression-prone rules. |
| Process evidence | `docs/plans/`, `docs/audits/`, or archived audit paths | Not default context. |

Never put plan documents or audit reports in `docs/capabilities/`. If an audit discovers a stable
fact, keep the audit in `docs/audits/` and separately update the relevant capability doc with only
the current fact.

## Lifecycle Protocol

`completed`, `distilled`, `superseded`, and `deprecated` are not final document states. They are
events or vague historical labels. Dev Distill must end with a concrete closeout action.

| Artifact | Allowed persisted status | Final action | Required rule |
|---|---|---|---|
| Plan | `active`, `archived` | archive or delete | Active plans live in `docs/plans/`; archived plans live in `docs/plans/archived/`. |
| Audit | `active`, `archived` | archive or delete | Active audits live in `docs/audits/`; archived audits live in `docs/audits/archived/`. |
| Capability | `current` | update in place | Keep current facts only; remove stale facts and process narrative. |
| ADR | `proposed`, `accepted`, `archived` | accept, archive, or delete | Proposed/accepted ADRs live in `docs/adr/`; archived ADRs live in `docs/adr/archived/`. |
| Context map | no lifecycle status | update in place | Update when new capabilities, ADRs, or key entry points are added or moved. |

### Plan Closeout

- Archive a plan when its sequence, risk record, verification notes, or partial execution history
  may be useful later. Move it to `docs/plans/archived/` and set `status: archived`.
- Delete a plan when it is complete, abandoned, or replaced and has no independent future value.
- Do not leave a finished plan as `completed`; completion is an event handled by this skill.
- Do not use `superseded`; update the active plan when still useful, otherwise archive or delete.

### Audit Closeout

- Run the Audit Closeout Gate before archiving or deleting any audit.
- Keep an audit active when any finding is `open`, `planned`, or `resolved` without a closeout
  reason that no longer needs verification, or when the audit contains unresolved `Not verified`,
  `Open questions`, `Next step`, `Recommended next step`, `待进一步调查`, or `推荐下一步` content.
- Keep partially executed audits active. Update finding status, owner plan, branch/commit, and
  verification fields instead of archiving the whole audit.
- Archive an audit only when every finding is `verified`, or `resolved` with closeout reason
  `accepted_risk`, `wont_fix`, `not_reproducible`, or fully transferred to an active plan that owns
  follow-up. Move it to `docs/audits/archived/` and set `status: archived`.
- Delete an audit only when all useful conclusions are represented in capability docs, ADRs, tests,
  code, or active plans, every finding is closed or transferred, and the raw evidence has no future
  value.
- Do not leave an audit as `distilled`; distillation must end in archive or delete.
- Before deleting an audit, confirm that no unique stable fact exists only in the audit.

### Audit Closeout Gate

Before changing an audit from active to archived or deleting it, verify:

- The audit has frontmatter with `artifact_type: audit`, `status`, `updated`, `scope`, and
  `source_of_truth`.
- Every finding has `ID`, `Severity`, `Status`, `Evidence`, `Owner Plan`, `Branch/Commit`,
  `Verification`, and `Closeout`.
- No finding remains `open`, `planned`, or `resolved` without a closeout reason that no longer needs verification.
- No Critical/High finding remains unresolved.
- Remaining follow-up work is owned by active plans through `source_audit` and `covered_findings`.

If any check fails, keep the audit in `docs/audits/` with `status: active`, update the fields that
can be updated safely, and report `Audit: blocked` or `Audit: keep active` with the reason.

### Capability Closeout

- Update current facts in place.
- Delete stale facts instead of preserving old paths.
- Do not describe old and new systems in parallel unless both are current supported modes.
- Do not include investigation narrative, audit findings, or task logs.

### ADR Closeout

- Keep `accepted` ADRs only for current effective decisions.
- Archive old ADRs only when their reasoning has historical value.
  Move them to `docs/adr/archived/` and set `status: archived`.
- Delete ADRs that were created by mistake, duplicated, or never accepted and have no value.
- Do not use `superseded` or `deprecated`.

## Distillation Workflow

1. Classify the outcome:
   - Domain term changed.
   - Current feature behavior changed.
   - Module responsibility or fact source changed.
   - Architecture/business decision was made.
   - Regression-prone rule was discovered.
   - Existing plan or audit artifact needs closeout.
   - Confirmed reusable UI rule, token, layout, interaction pattern, or UI implementation rule changed.
   - No durable knowledge was created.

2. Choose exactly the right destination:
   - Domain term -> `CONTEXT.md`.
   - Current feature behavior -> `docs/features.md` when the project uses it.
   - Module contract, fact source, rules, or test notes -> `docs/capabilities/*.md`.
   - Hard-to-reverse decision with real tradeoff -> `docs/adr/*.md`.
   - Executable rule -> tests.
   - Process evidence -> plan/audit archive or deletion.

3. Avoid noise:
   - Do not create long reports for ordinary work.
   - Do not preserve step-by-step implementation logs.
   - Do not place audits or plans in capability docs.
   - Do not duplicate the same rule across multiple docs.
   - Do not describe old and new systems in parallel; document only the current recommended path.

4. Check consistency:
   - Docs must match code reality.
   - Capability docs must name the current `source_of_truth`.
   - ADRs must include status, context, decision, alternatives, and consequences.
   - Tests should cover the rule instead of restating it only in prose when practical.
   - `docs/ai/context-map.md` must not route default context to `docs/plans/`, `docs/audits/`, or archived files.

5. Close artifacts:
   - If a plan drove the work, choose archive or delete.
   - If archiving a plan, move it to `docs/plans/archived/`, set `status: archived`, and keep it out of default context.
   - If deleting a plan, first confirm no unique useful information exists only there.
   - If an audit drove the work, run the Audit Closeout Gate.
   - If archiving an audit, move it to `docs/audits/archived/` and set `status: archived` only after the gate passes.
   - If deleting an audit, first confirm stable facts are captured in capability docs, ADRs, tests, code, or active plans, and that the gate passes.
   - If the audit is partially handled, keep it active and update finding statuses and owner plan/branch references.
   - If a capability doc was updated from an audit, remove investigation narrative and keep only current facts.

## ADR Gate

Create, update, archive, or recommend an ADR only when all are true:

- The decision is hard to reverse.
- Future maintainers would ask why it was done.
- There were real alternatives and a meaningful tradeoff.
- The decision affects architecture, data ownership, business rules, APIs, workflow policy, or multiple modules.

Typical ADR triggers:

- Choosing a database migration or persistence strategy.
- Changing the source of truth for a module or statistic.
- Defining a long-term algorithm or review policy.
- Removing or keeping a major feature area.
- Adopting a repository-wide workflow or documentation lifecycle rule.

Do not create an ADR for ordinary bug fixes, small UI changes, local refactors without real
tradeoff, or temporary audit/plan notes.

If the ADR gate fails, update the relevant capability doc or tests instead.

## Output Template

Use `templates/output.md` for the final response shape.
## Next-Step Prompt

End with one of these:

- "Knowledge distillation is complete; use the `/dev-check` skill to verify routing and lifecycle cleanup."
- "No durable knowledge was produced; no doc update is needed. Start the next non-trivial task with the `/dev-orient` skill."
- "A test or ADR is still needed; complete that follow-up before final merge or release."
