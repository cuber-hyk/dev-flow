---
description: Plan work after decision readiness
argument-hint: task to plan
---

# /dev-plan

Use the `dev-plan` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. First run the built-in orient gate: read repository instructions, stable vocabulary, context-map, relevant capability docs, and only task-relevant code entry points.
2. Check whether the goal, boundary, product decisions, data semantics, lifecycle choices, and irreversible actions are clear.
3. If unresolved decision points exist, stop with a decision request instead of writing an executable plan.
4. If the task is ready, produce a minimal verifiable plan with scope, steps, risks, verification, and acceptance criteria.
5. Persist non-trivial plans to `docs/plans/YYYY-MM-DD-short-topic.md` when repository workflow or task risk calls for it.
6. Do not implement, audit, archive, or distill.
7. End by recommending `/dev-branch`, direct implementation, or the next required Dev Flow step.
8. Follow the skill's `templates/output.md` final response shape.
