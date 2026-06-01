---
description: Enter repo context without noise
argument-hint: task or area to orient around
---

# /dev-orient

Use the `dev-orient` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Read low-noise repository memory first: `AGENTS.md`, `CONTEXT.md`, `docs/ai/context-map.md`, and relevant capability docs.
2. Do not read historical plans, audits, archived docs, generated docs, or build artifacts by default.
3. Identify the relevant code and documentation entry points.
4. Do not create a detailed plan, audit, implementation, or distillation.
5. End by recommending `/dev-plan`, `/dev-audit`, `/dev-branch`, `/dev-init`, or direct implementation when appropriate.
