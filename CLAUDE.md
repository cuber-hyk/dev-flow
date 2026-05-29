# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact lifecycle workflow for coding agents. It is intentionally small: init, check, orient, plan, audit, implement, distill.

## If You Are an AI Agent

For project setup and non-trivial coding work, use the workflow skills in order:

1. `cuberhyk-dev-flow:dev-init` - Initialize missing Dev Flow memory structure when needed.
2. `cuberhyk-dev-flow:dev-check` - Validate documentation routing and lifecycle health.
3. `cuberhyk-dev-flow:dev-orient` - Enter repository context and identify relevant docs/code.
4. `cuberhyk-dev-flow:dev-plan` - Define goal, scope, steps, risks, and verification.
5. `cuberhyk-dev-flow:dev-audit` - Produce structured review findings under `docs/audits/` when the task is an audit.
6. Implement and verify with the smallest safe change.
7. `cuberhyk-dev-flow:dev-distill` - Preserve durable knowledge in docs, ADRs, or tests and close process artifacts.
8. `cuberhyk-dev-flow:dev-check` - Re-check routing after documentation changes.

## Skill Boundaries

- `dev-orient` does not plan or edit.
- `dev-plan` does not audit, implement, or archive.
- `dev-audit` does not implement fixes or update capability docs with stable facts.
- `dev-distill` does not re-plan or re-implement.
- `dev-init` only bootstraps memory structure.
- `dev-check` only validates documentation routing and lifecycle health.

Persistent artifacts:

- `dev-plan` may stay chat-only for small, low-risk plans, but must write `docs/plans/YYYY-MM-DD-short-topic.md` for explicit plan documents, workflow-required plans, high-risk/cross-module/multi-turn work, or audit follow-up work.
- `dev-audit` may stay chat-only for small, low-risk reviews, but must write `docs/audits/YYYY-MM-DD-topic-audit.md` for explicit audit reports, workflow-required audits, non-trivial/cross-module/correctness-sensitive audits, or findings that need follow-up.
- After creating a plan or audit file, run `git status --short --branch --untracked-files=all` and report whether git sees the artifact.

If a harness exposes un-namespaced skills, use `dev-init`, `dev-check`, `dev-orient`, `dev-plan`, `dev-audit`, and `dev-distill` directly.

If a harness namespaces plugin skills, use `cuberhyk-dev-flow:dev-init`, `cuberhyk-dev-flow:dev-check`, `cuberhyk-dev-flow:dev-orient`, `cuberhyk-dev-flow:dev-plan`, `cuberhyk-dev-flow:dev-audit`, and `cuberhyk-dev-flow:dev-distill`.
