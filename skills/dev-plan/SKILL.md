---
name: dev-plan
description: Create a minimal, verifiable development plan after repository orientation. Use for non-trivial bug fixes, features, refactors, audits, or tests after dev-orient has identified context. Defines goal, assumptions, scope, steps, risks, verification, and artifact destinations. When a persistent plan document is requested or needed, place it under docs/plans. Do not use to execute implementation changes, write audit reports to capabilities, or distill completed knowledge.
---

# Dev Plan

Use this skill to turn the oriented context into a short execution plan that can be verified.

## Boundary

Dev Plan does:

- Convert the user request into a verifiable goal.
- State assumptions and unresolved questions.
- Identify scope, fact sources, risks, and validation.
- Produce a compact checklist for the current task.
- Define where any task artifacts belong.
- Create or update a persistent plan under `docs/plans/` when the user asks for a plan file or the workflow requires one.
- Include lifecycle expectations for plans, audits, ADRs, and capability updates.
- Recommend whether implementation can start.

Dev Plan does not:

- Read broad unrelated context; use `dev-orient` first when needed.
- Edit code or docs.
- Create audit reports; use `docs/audits/` for audit deliverables when explicitly requested.
- Store plans, audits, or findings in `docs/capabilities/`.
- Archive final knowledge; use `dev-distill` after implementation.

## Document Routing

Use these destinations:

| Artifact | Destination | Rule |
|---|---|---|
| Task plan | `docs/plans/YYYY-MM-DD-short-slug.md` | Use only for persistent plans. Chat-only plans can stay in the response. |
| Audit/review report | `docs/audits/YYYY-MM-DD-topic-audit.md` | Plan may say an audit report will be created here, but do not write it unless asked. |
| Current module facts | `docs/capabilities/*.md` | Do not write plans or audit findings here. Only current stable facts belong here. |
| Important decision | `docs/adr/YYYY-MM-DD-short-title.md` | Recommend only when there is a real tradeoff. |
| Executable rule | tests | Prefer tests over prose-only rules when practical. |

## Lifecycle Protocol

Persistent plans must include compact frontmatter:

```md
---
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
artifact_type: plan
---
```

Plan status values:

- `active`: work has not finished.
- `completed`: work finished and durable knowledge was distilled.
- `superseded`: a newer plan replaced this one.
- `archived`: kept only for history.

When planning an audit, route the eventual audit report to `docs/audits/YYYY-MM-DD-topic-audit.md` and state that `dev-distill` must later choose `archive`, `delete`, or `keep-active` after stable facts move to capability docs, ADRs, or tests.

## Workflow

1. Confirm the task frame:
   - Task type: bug, feature, refactor, audit, docs, test, or research.
   - Goal in one sentence.
   - Non-goals in one sentence when scope could drift.

2. Make assumptions explicit:
   - List only assumptions that affect implementation.
   - Ask the user if an assumption is risky and cannot be resolved from code.

3. Identify fact sources:
   - Relevant docs.
   - Relevant files, APIs, tables, state stores, or tests.
   - The single source of truth if the task touches business logic.

4. Create the smallest useful plan:
   - 3 to 7 steps.
   - Each step has a verification method.
   - Prefer proving the existing issue before modifying code.

5. Define artifact routing:
   - State whether the task will create or update a plan, audit, capability doc, ADR, tests, or none.
   - If creating a persistent plan, use `docs/plans/YYYY-MM-DD-short-slug.md`.
   - Persistent plans must state their status and closeout expectation.
   - If the task is an audit, route the audit report to `docs/audits/`, not `docs/capabilities/`.
   - If audit findings become durable module facts, note that `dev-distill` may later update `docs/capabilities/*.md`.
   - Include whether `docs/ai/context-map.md` may need an update after implementation.

6. Decide execution readiness:
   - Ready: continue implementing.
   - Needs clarification: ask one concise question.
   - Needs branch/spec: tell the user why before creating long-lived artifacts.

## Output Shape

Use concise Markdown:

```md
目标：...

范围：...

假设/不确定点：
- ...

步骤与验证：
1. ...
2. ...

风险：
- ...

产物归位：
- ...

生命周期：
- ...

下一步：...
```

## Next-Step Prompt

End with one of these:

- `计划已足够明确，下一步可以开始实现；实现结束后建议使用 dev-distill 沉淀长期知识。`
- `计划里仍有一个关键不确定点，需要用户确认后再实现。`
- `这是高风险/跨模块任务，建议先建立分支并把验收测试补齐。`
