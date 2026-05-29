# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact workflow plugin for coding agents.

Skills:

- `dev-init`: initialize Dev Flow memory structure.
- `dev-check`: validate docs routing and lifecycle health.
- `dev-orient`: enter repository context.
- `dev-plan`: create a verifiable plan.
- `dev-audit`: create structured audit findings under `docs/audits/`.
- `dev-distill`: preserve durable knowledge and close process artifacts.

Use the shared skills in this order for non-trivial development work:

1. `dev-init` initializes missing memory structure and templates.
2. `dev-check` validates documentation routing and lifecycle health.
3. `dev-orient` enters the repository context without reading historical noise.
4. `dev-plan` turns the task into a verifiable goal, scope, steps, risks, and checks.
5. `dev-audit` is used instead of `dev-plan` when the task is a review or correctness audit.
6. `dev-distill` converts completed work into durable project knowledge and closes plans/audits.

Do not skip directly to implementation when the task is ambiguous, cross-module, or business-critical.

Do not preserve temporary plans, old TODOs, or debugging scratchwork as default context.

Persistent artifacts:

- `dev-plan` may stay chat-only for small, low-risk plans, but writes `docs/plans/YYYY-MM-DD-short-topic.md` for explicit plan documents, workflow-required plans, high-risk/cross-module/multi-turn work, or audit follow-up work.
- `dev-audit` may stay chat-only for small, low-risk reviews, but writes `docs/audits/YYYY-MM-DD-topic-audit.md` for explicit audit reports, workflow-required audits, non-trivial/cross-module/correctness-sensitive audits, or findings that need follow-up.
- After creating a plan or audit file, run `git status --short --branch --untracked-files=all` and report whether git sees the artifact.
