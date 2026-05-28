---
name: dev-plan
description: Create a minimal, verifiable development plan after repository orientation. Use for non-trivial bug fixes, features, refactors, audits, or tests after dev-orient has identified context. Defines goal, assumptions, scope, steps, risks, and verification. Do not use to execute changes, create long-lived plan documents by default, or distill completed knowledge.
---

# Dev Plan

Use this skill to turn the oriented context into a short execution plan that can be verified.

## Boundary

Dev Plan does:

- Convert the user request into a verifiable goal.
- State assumptions and unresolved questions.
- Identify scope, fact sources, risks, and validation.
- Produce a compact checklist for the current task.
- Recommend whether implementation can start.

Dev Plan does not:

- Read broad unrelated context; use `dev-orient` first when needed.
- Edit code or docs.
- Create persistent plan files unless the user explicitly asks.
- Archive final knowledge; use `dev-distill` after implementation.

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

5. Decide execution readiness:
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

下一步：...
```

## Next-Step Prompt

End with one of these:

- `计划已足够明确，下一步可以开始实现；实现结束后建议使用 dev-distill 沉淀长期知识。`
- `计划里仍有一个关键不确定点，需要用户确认后再实现。`
- `这是高风险/跨模块任务，建议先建立分支并把验收测试补齐。`
