---
description: Validate Dev Flow docs routing
argument-hint: [project-dir or validation request]
---

# /dev-check

Use the `dev-check` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Validate Dev Flow structure, routing, lifecycle folders, templates, and context-map references.
2. Prefer `cuberhyk-dev-flow validate-docs [project-dir]` for mechanical checks.
3. Report concrete findings with paths.
4. Do not perform code audits or implementation work.
5. End by recommending the next fitting Dev Flow skill.
