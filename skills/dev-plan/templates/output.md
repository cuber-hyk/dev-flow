# Dev Plan Output Template

## Ready To Plan

```md
Plan readiness: ready

Goal: <one sentence>

Persistent plan: yes/no
Plan file: docs/plans/YYYY-MM-DD-short-topic.md or none

Scope:
- <in scope>
- Non-goals: <out of scope or none>

Assumptions and decisions:
- <confirmed assumption or decision>

Fact sources:
- <doc/code/test/config/source of truth>

Context loaded:
- <file or source>

Split guidance:
- Required: yes/no
- Source: dev-split result or not needed because <reason>
- Classification: no split/local cleanup/defer/proposed split/not applicable
- Code-placement constraints: <owner modules and guardrails or none>
- Deferred split trigger: <trigger or none>

Steps and verification:
| ID | Status | Step | Verification |
|---|---|---|---|
| PLAN-1 | todo/done/blocked | <step> | <command/check/manual verification> |

Acceptance criteria:
- <observable completion condition>

Completion:
- <complete when all non-deferred steps are done, no step is blocked, and verification is recorded>

Artifact routing:
- Plan: <path or none>
- Source audit: <path or none>
- Covered findings: <IDs or none>
- Deferred findings: <IDs or none>
- Capability docs: <path or none>
- Changelog: needed/not needed/maybe; reason
- Distill: needed/not needed/maybe; reason
- ADR gate: needed/not needed/maybe; reason

Git visibility:
- <status when a persistent plan is created; otherwise not applicable>

Next step: <recommended next skill or action>
```

## Blocked By Decisions

```md
Plan readiness: blocked by decision points

Goal:
- <goal>

Known facts:
- <fact>

Decision points:
1. Question: <decision question>
   Recommendation: <recommended option>
   Alternatives: <other viable options>
   Impact: <tradeoff>
   Needs user confirmation because: <reason>
   ADR gate: needed/not needed/maybe; reason

After confirmation:
- <what will be created or updated>
```
