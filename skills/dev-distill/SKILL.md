---
name: dev-distill
description: Distill completed development work into durable repository knowledge. Use after implementation, review, debugging, or audits when task outcomes may change domain vocabulary, feature docs, capability docs, ADRs, or tests. Decides what to update and what to discard. Do not use for initial orientation, task planning, or implementation.
---

# Dev Distill

Use this skill after work is done to keep the repository memory accurate without accumulating process noise.

## Boundary

Dev Distill does:

- Identify durable knowledge produced by the task.
- Update the right long-lived documents when needed.
- Recommend ADRs only for important, hard-to-reverse tradeoffs.
- Recommend tests for business rules and regression-prone logic.
- Mark temporary plans, TODOs, and reports as non-entry context.

Dev Distill does not:

- Enter a repository from scratch; use `dev-orient`.
- Create the implementation plan; use `dev-plan`.
- Redo implementation work.
- Write broad postmortems or reports unless explicitly requested.

## Distillation Rules

1. Classify the outcome:
   - Domain term changed.
   - Current feature behavior changed.
   - Module responsibility or fact source changed.
   - Architecture/business decision was made.
   - Regression-prone rule was discovered.
   - No durable knowledge was created.

2. Choose exactly the right destination:
   - Domain term -> `CONTEXT.md`.
   - Current feature behavior -> `docs/features.md`.
   - Module contract, fact source, rules, or test notes -> `docs/capabilities/*.md`.
   - Hard-to-reverse decision with real tradeoff -> `docs/adr/*.md`.
   - Executable rule -> tests.

3. Avoid noise:
   - Do not create long reports for ordinary work.
   - Do not preserve step-by-step implementation logs.
   - Do not duplicate the same rule across multiple docs.
   - Do not describe old and new systems in parallel; document only the current recommended path.

4. Check consistency:
   - Docs must match code reality.
   - Capability docs must name the current fact source.
   - ADRs must include status, context, decision, and consequences.
   - Tests should cover the rule instead of restating it only in prose when practical.

## ADR Gate

Create or recommend an ADR only when all are true:

- The decision is hard to reverse.
- Future maintainers would ask why it was done.
- There were real alternatives and a meaningful tradeoff.

Otherwise update the relevant capability doc or tests instead.

## Output Shape

Use concise Markdown:

```md
沉淀结论：...

已更新/建议更新：
- ...

无需沉淀：
- ...

下一步：...
```

## Next-Step Prompt

End with one of these:

- `知识沉淀已完成；下一次新任务建议从 dev-orient 开始。`
- `这次没有产生长期知识，不需要更新文档；下一次新任务建议从 dev-orient 开始。`
- `发现需要补测试或 ADR，建议先完成该项再合并。`
