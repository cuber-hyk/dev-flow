# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact development workflow for coding agents. It is intentionally small: orient, plan, implement, distill.

## If You Are an AI Agent

For non-trivial coding work, use the workflow skills in order:

1. `cuberhyk-dev-flow:dev-orient` - Enter repository context and identify relevant docs/code.
2. `cuberhyk-dev-flow:dev-plan` - Define goal, scope, steps, risks, and verification.
3. Implement and verify with the smallest safe change.
4. `cuberhyk-dev-flow:dev-distill` - Preserve durable knowledge in docs, ADRs, or tests.

## Skill Boundaries

- `dev-orient` does not plan or edit.
- `dev-plan` does not implement or archive.
- `dev-distill` does not re-plan or re-implement.

If a harness exposes un-namespaced skills, use `dev-orient`, `dev-plan`, and `dev-distill` directly.

If a harness namespaces plugin skills, use `cuberhyk-dev-flow:dev-orient`, `cuberhyk-dev-flow:dev-plan`, and `cuberhyk-dev-flow:dev-distill`.
