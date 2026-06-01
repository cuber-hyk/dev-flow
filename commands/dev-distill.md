---
description: Distill completed work into durable knowledge
argument-hint: completed work or artifact to distill
---

# /dev-distill

Use the `dev-distill` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Classify completed outcomes into durable facts, decisions, executable rules, and temporary process artifacts.
2. Update only the correct durable destinations: `CONTEXT.md`, `docs/features.md`, `docs/capabilities/`, `docs/adr/`, and tests.
3. Close process artifacts by moving retained plans/audits/ADRs into their `archived/` folders or deleting disposable ones.
4. Do not re-plan, re-audit, or implement new fixes.
5. End by recommending `/dev-check`.
6. Follow the skill's `templates/output.md` final response shape.
