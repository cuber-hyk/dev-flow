---
description: Refine fuzzy ideas before planning
argument-hint: idea to clarify
---

# /dev-brainstorm

Use the `dev-brainstorm` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. First run the built-in orient gate: read repository instructions, stable vocabulary, context-map, relevant capability docs, and only idea-relevant code entry points.
2. Clarify the goal, non-goals, constraints, success signals, and decision points.
3. If multiple routes are reasonable, present 2-3 approaches with tradeoffs and a recommendation.
4. If unresolved decision points exist, stop with a decision request instead of writing an executable plan.
5. Do not implement, audit, create changelog entries, distill knowledge, or write branch artifacts.
6. Keep brainstorm output in conversation by default; only write a document when the user explicitly asks.
7. End by routing to `/dev-plan`, `/dev-audit`, `/dev-exploratory-review`, `/dev-orient`, or continued brainstorming.
8. Follow the skill's `templates/output.md` final response shape.
