---
description: Evaluate code-organization and large-file risk
argument-hint: file, module, or planned change
---

# /dev-split

Use the `dev-split` skill for this request.

Target or planned change:

```text
$ARGUMENTS
```

Required behavior:

1. Define the structural question and non-goal.
2. Run the bundled candidate scan when useful, resolving `scripts/check_large_code_files.py` relative to the `dev-split` skill directory.
3. Read only relevant exports, callers, tests, shared utilities, and capability docs.
4. Classify the target as `no split`, `local cleanup`, `defer`, or `proposed split`.
5. Provide code-placement constraints that prevent new large files.
6. For `defer`, include why not now, future trigger, non-goal, and current-task guardrail.
7. For `proposed split`, stop for explicit user approval before implementation.
8. Follow the skill's `templates/output.md` final response shape.
