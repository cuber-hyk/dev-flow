---
description: Open-ended risk review of a project or scope
argument-hint: optional project path, module, feature, flow, branch, or files to review
---

# /dev-exploratory-review

Use the `dev-exploratory-review` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Treat the request as open-ended problem discovery, not as a narrow known-question audit.
2. Respect any user-supplied scope; otherwise review the current project as a whole.
3. Build a project/scope map and risk map before reporting findings.
4. Use the four-pass harness: Project Mapper, Risk Prober, Adversarial Verifier, and Judge.
5. Run existing tests or focused probes when practical; create temporary probe tests only when they verify a realistic failure.
6. Report only issues with realistic failure scenarios and evidence.
7. Do not implement fixes or comment on style, naming, formatting, or subjective preferences.
8. Persist non-trivial or follow-up-worthy reviews to `docs/audits/YYYY-MM-DD-short-topic-exploratory-review.md` using the audit template structure and stable finding statuses.
9. End by recommending `/dev-plan` for confirmed fixes, `/dev-branch` for reviewed implementation, or `/dev-check` for routing validation.
10. Follow the skill's `templates/output.md` final response shape.
