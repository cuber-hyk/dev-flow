---
name: dev-plan
description: Create a minimal, verifiable development plan after repository orientation. Use for non-trivial bug fixes, features, refactors, audit follow-up fixes, docs work, tests, or user requests that invoke dev-plan. Small plans may stay in conversation. Create or update docs/plans for explicit plan documents, repository workflow requirements, high-risk/cross-module/multi-turn work, audit follow-up work, or reviewable branch workflows. Do not execute implementation changes, write audit reports, or distill completed knowledge.
---

# Dev Plan

Use this skill to turn oriented context or audit findings into a verifiable development plan.

## Boundary

Dev Plan does:

- Convert the user request or audit findings into a verifiable goal.
- State assumptions and unresolved questions.
- Identify scope, fact sources, risks, validation, and acceptance criteria.
- Decide whether the plan can stay in conversation or must be written to `docs/plans/`.
- Create or update a persistent plan under `docs/plans/` when the persistence rule applies.
- Verify that any created plan file exists and is visible to git.
- Recommend whether implementation can start.

Dev Plan does not:

- Read broad unrelated context; use `dev-orient` first when needed.
- Perform audits or write findings; use `dev-audit`.
- Edit implementation code.
- Store plans, audits, or findings in `docs/capabilities/`.
- Archive final knowledge; use `dev-distill` after implementation.

## Persistent Plan Rule

Small, low-risk plans may stay in conversation.

Create or update `docs/plans/YYYY-MM-DD-short-topic.md` when any of these are true:

- The user explicitly asks for a plan file, persistent plan, detailed plan document, TODO document, or written plan.
- Repository workflow instructions require plan artifacts under `docs/plans/`.
- The task is high-risk, cross-module, architecture-affecting, audit-follow-up work, expected to span multiple turns, or likely to need later review.
- The user asks to use a branch/task workflow that needs a reviewable plan before implementation.
- A previous `dev-audit` produced findings that need implementation sequencing.

Keep the plan in conversation when all of these are true:

- The task is small, low-risk, and likely completed in one turn.
- The user did not ask for a plan document or persistent TODO.
- Repository workflow does not require a plan file for this kind of task.
- No audit finding or branch workflow requires a reviewable artifact.

If a persistent plan is required and `docs/plans/` is missing, recommend or run `dev-init` when appropriate, then create the plan. If initialization is not allowed, report that the persistent plan cannot be written.

When creating a plan file:

1. Use `docs/plans/YYYY-MM-DD-short-topic.md`.
2. Keep it actionable: goal, scope, assumptions, fact sources, steps, verification, risks, acceptance criteria, artifact routing, and closeout.
3. Include frontmatter with `artifact_type`, `status`, `created`, `updated`, and `owner`.
4. Confirm the file exists after writing it.
5. Run `git status --short --branch --untracked-files=all`.
6. If the file is not visible because `.gitignore` excludes it, either add the smallest safe allow rule or report that the plan is not tracked and ask before changing ignore policy.

## Document Routing

| Artifact | Destination | Rule |
|---|---|---|
| Task plan | `docs/plans/YYYY-MM-DD-short-topic.md` | Create when the persistent plan rule applies. |
| Audit/review report | `docs/audits/YYYY-MM-DD-topic-audit.md` | Do not write audit findings here unless using `dev-audit`. |
| Current module facts | `docs/capabilities/*.md` | Do not write plans or audit findings here. |
| Important decision | `docs/adr/YYYY-MM-DD-short-title.md` | Recommend only when there is a real tradeoff. |
| Executable rule | tests | Prefer tests over prose-only rules when practical. |

## Workflow

1. Confirm the task frame:
   - Task type: bug, feature, refactor, audit follow-up, docs, test, or research.
   - Goal in one sentence.
   - Non-goals in one sentence when scope could drift.

2. Decide plan persistence:
   - If the persistent plan rule applies, set `persistent_plan: yes`.
   - If the plan can stay in conversation, set `persistent_plan: no` and explain why it is small enough.
   - If creating a persistent plan, use `docs/plans/YYYY-MM-DD-short-topic.md`.
   - If a relevant active plan already exists, update it instead of creating a duplicate.

3. Make assumptions explicit:
   - List only assumptions that affect implementation.
   - Ask the user if an assumption is risky and cannot be resolved from code.

4. Identify fact sources:
   - Relevant docs.
   - Relevant files, APIs, tables, state stores, or tests.
   - The single source of truth if the task touches business logic.

5. Create the smallest useful plan:
   - 3 to 7 steps.
   - Each step has a verification method.
   - Prefer proving the existing issue before modifying code.

6. Define artifact routing:
   - State whether the task will create or update a plan, audit, capability doc, ADR, tests, or none.
   - If the task comes from an audit, reference the audit path and keep findings in `docs/audits/`.
   - Include whether `docs/ai/context-map.md` may need an update after implementation.

7. Verify plan file when created:
   - Confirm the path exists.
   - Run `git status --short --branch --untracked-files=all`.
   - Report whether git sees the file.
   - If ignored, add a minimal allow rule only when safe; otherwise ask the user.

8. Decide execution readiness:
   - Ready: continue implementing.
   - Needs clarification: ask one concise question.
   - Needs branch/spec: tell the user why before creating long-lived artifacts.

## Output Shape

Use concise Markdown:

```md
Goal: ...

Persistent plan: yes/no
Plan file: docs/plans/YYYY-MM-DD-short-topic.md or none

Scope:
- ...

Assumptions / unknowns:
- ...

Steps and verification:
1. ...

Acceptance criteria:
- ...

Artifact routing:
- ...

Git visibility:
- ...

Next step: ...
```

## Next-Step Prompt

End with one of these:

- `Plan is small enough to stay in conversation; next step is implementation, then dev-distill if durable knowledge changes.`
- `Persistent plan created and git visibility checked; next step is implementation, then dev-distill.`
- `Plan file is ignored by git; fix tracking before implementation or confirm that the plan should remain untracked.`
- `One key uncertainty remains; confirm it before implementation.`
- `This is audit follow-up work; after implementation, use dev-distill to close the plan and audit, then use dev-check.`
