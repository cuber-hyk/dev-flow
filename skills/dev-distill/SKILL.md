---
name: dev-distill
description: "Distill completed development work into durable repository knowledge. Use after implementation, review, debugging, planning, or audits when task outcomes may change domain vocabulary, feature docs, capability docs, ADRs, audit reports, plan records, or tests. Classifies information and writes it to the right destination: CONTEXT, docs/plans, docs/audits, docs/capabilities, docs/adr, or tests. Do not use for initial orientation, task planning, or implementation."
---

# Dev Distill

Use this skill after work is done to keep the repository memory accurate without accumulating process noise.

## Boundary

Dev Distill does:

- Identify durable knowledge produced by the task.
- Update the right long-lived documents when needed.
- Recommend ADRs only for important, hard-to-reverse tradeoffs.
- Recommend tests for business rules and regression-prone logic.
- Keep plans and audits in their own historical directories.
- Close or archive process artifacts after durable knowledge is captured.
- Mark temporary TODOs and reports as non-entry context.

Dev Distill does not:

- Enter a repository from scratch; use `dev-orient`.
- Create the implementation plan; use `dev-plan`.
- Redo implementation work.
- Write broad postmortems or reports unless explicitly requested.

## Document Routing

Classify before writing:

| Information type | Destination | Rule |
|---|---|---|
| Stable domain term | `CONTEXT.md` | Only terms reused across modules. |
| Persistent task plan | `docs/plans/YYYY-MM-DD-short-slug.md` | Historical plan record; not default context. |
| Audit report or review findings | `docs/audits/YYYY-MM-DD-topic-audit.md` | Historical evidence; not a capability doc. |
| Current module facts, APIs, data sources, rules | `docs/capabilities/*.md` | Only the current recommended behavior. |
| Important hard-to-reverse decision | `docs/adr/YYYY-MM-DD-short-title.md` | Use only when the ADR gate passes. |
| Executable business rule | tests | Prefer tests for regression-prone rules. |

Never put plan documents or audit reports in `docs/capabilities/`. If an audit discovers a stable fact, write the audit to `docs/audits/` and separately update the relevant capability doc with only the current fact.

## Lifecycle Protocol

After distillation, close process artifacts:

| Artifact | Required closeout |
|---|---|
| Active plan | Mark `status: completed`, `superseded`, or `archived`; keep it out of default context. |
| Active audit | Choose `keep-active`, `archive`, or `delete`; explain why. |
| Distilled audit | Move to `docs/audits/archived/` or mark `status: distilled`/`archived` unless it still drives active work. |
| Capability doc | Keep only current facts, not investigation logs. |
| Context map | Update when a new capability, ADR, or key entry point is added or moved. |

Audit cleanup rule:

- Delete only when all useful conclusions are represented in capability docs, ADRs, tests, or code and the evidence has no future value.
- Archive when the audit contains useful evidence, comparisons, or reasoning that should not be default context.
- Keep active only when unresolved findings still drive work.

## Distillation Rules

1. Classify the outcome:
   - Domain term changed.
   - Persistent plan should be recorded.
   - Audit report or review findings were produced.
   - Current feature behavior changed.
   - Module responsibility or fact source changed.
   - Architecture/business decision was made.
   - Regression-prone rule was discovered.
   - No durable knowledge was created.
   - Existing plan or audit artifact needs closeout.

2. Choose exactly the right destination:
   - Domain term -> `CONTEXT.md`.
   - Persistent task plan -> `docs/plans/*.md`.
   - Audit report or review findings -> `docs/audits/*.md`.
   - Current feature behavior -> `docs/features.md`.
   - Module contract, fact source, rules, or test notes -> `docs/capabilities/*.md`.
   - Hard-to-reverse decision with real tradeoff -> `docs/adr/*.md`.
   - Executable rule -> tests.

3. Avoid noise:
   - Do not create long reports for ordinary work.
   - Do not preserve step-by-step implementation logs.
   - Do not place audits or plans in capability docs.
   - Do not duplicate the same rule across multiple docs.
   - Do not describe old and new systems in parallel; document only the current recommended path.

4. Check consistency:
   - Docs must match code reality.
   - Capability docs must name the current fact source.
   - ADRs must include status, context, decision, and consequences.
   - Tests should cover the rule instead of restating it only in prose when practical.
   - `docs/ai/context-map.md` must not route default context to `docs/plans/`, `docs/audits/`, or archived files.

5. Close artifacts:
   - If a plan drove the work, mark it completed, superseded, or archived.
   - If an audit drove the work, archive/delete/keep-active and state the reason.
   - If a capability doc was updated from an audit, remove investigation narrative and keep only current facts.

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

产物收尾：
- ...

下一步：...
```

## Next-Step Prompt

End with one of these:

- `知识沉淀已完成；下一次新任务建议从 dev-orient 开始。`
- `这次没有产生长期知识，不需要更新文档；下一次新任务建议从 dev-orient 开始。`
- `发现需要补测试或 ADR，建议先完成该项再合并。`
