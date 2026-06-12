---
description: Initialize, update, or check the project UI design system
argument-hint: initialize, update, or check request
---

# /dev-design-system

Use the `dev-design-system` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Detect whether this is initialize, update, or check mode.
2. Read only confirmed UI discussion and relevant UI sources.
3. Keep exact values in `design-tokens.json`; keep intent, reuse rules, and routing in `DESIGN.md`.
4. Search existing semantic patterns and shared components before allowing a new one.
5. Do not invent rules for unseen or unconfirmed UI scenarios.
6. Report provisional rules, known gaps, conflicts, and verification.
7. Follow the skill's `templates/output.md` final response shape.
