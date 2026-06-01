---
description: Audit code, docs, or workflows
argument-hint: target to audit
---

# /dev-audit

Use the `dev-audit` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. First run the built-in orient gate: read repository instructions, stable vocabulary, context-map, relevant capability docs, ADRs, tests, and only audit-relevant code entry points.
2. Define audit scope and evidence sources before findings.
3. Focus on correctness, completeness, lifecycle routing, tests, and risks.
4. Persist non-trivial or follow-up-worthy audits to `docs/audits/YYYY-MM-DD-short-topic-audit.md` using `templates/docs/audits/_template.md`.
5. Give persistent findings stable IDs and statuses so follow-up plans and branches can reference them.
6. Do not implement fixes, write feature plans, or update capability docs directly unless the user specifically asked for documentation repair.
7. End by recommending `/dev-plan` for fixes, `/dev-branch` for reviewed implementation, or `/dev-check` for routing validation.
8. Follow the skill's `templates/output.md` final response shape.
