# Dev Exploratory Review Output Template

```md
Review mode: dev-exploratory-review

Review scope:
- Type: repository-wide | path-bounded | feature-bounded | flow-bounded | change-bounded | doc-bounded
- Boundary: <review boundary>
- Expansions: <contracts inspected outside the boundary or none>

Persistent report: yes/no
Report file: docs/audits/YYYY-MM-DD-topic-exploratory-review.md or none

Conclusion: <short conclusion>

Context loaded:
- <file or source>

Project map:
- <module/flow/entry point/data store/side effect>

Risk map:
- <risk surface and why it matters>

Passes:
- Project Mapper: <summary>
- Risk Prober: <summary>
- Adversarial Verifier: <summary>
- Judge: <summary>

Findings:
- [P1/P2/P3, Confirmed/Strong/Risk, category] <finding>
  Scenario: <realistic trigger>
  Evidence: <code/test/config/runtime evidence>
  Verification: <how verified>
  Impact: <failure result>
  Fix direction: <short direction>
- or No realistic failures found.

Rejected candidates:
- Candidate: <candidate>
  Reason: <why rejected>
- or None

Tests/probes:
- <command/probe path/result/disposition>

Not verified:
- <gap or none>

Artifact routing:
- Fixes: dev-plan needed/not needed; reason
- Implementation: dev-branch needed/not needed; reason
- Stable knowledge / ADR gate: needed/not needed/maybe; reason

Git visibility:
- <status when report or probe artifacts remain; otherwise not applicable>

Next step: <recommended next skill or action>
```
