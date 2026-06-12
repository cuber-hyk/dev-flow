# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact workflow plugin for coding agents.

Skills:

- `dev-init`: initialize Dev Flow memory structure.
- `dev-check`: validate docs routing and lifecycle health.
- `dev-orient`: enter repository context.
- `dev-brainstorm`: clarify fuzzy ideas and compare approaches before planning.
- `dev-design-system`: initialize, update, or check the durable project UI contract.
- `dev-plan`: create a verifiable plan.
- `dev-audit`: create structured audit findings under `docs/audits/`.
- `dev-exploratory-review`: map a project or scope, build a risk map, and verify realistic failures.
- `dev-branch`: isolate implementation in a reviewed Git branch.
- `dev-changelog`: maintain notable `CHANGELOG.md` entries.
- `dev-distill`: preserve durable knowledge and close process artifacts.

For UI work, read `DESIGN.md` and relevant `design-tokens.json` entries before planning or implementation.
Search existing semantic patterns and shared components before creating a new UI implementation.

Use this flow for fuzzy ideas or unclear product/workflow changes:

1. `dev-brainstorm` clarifies goals, non-goals, approaches, and user-owned decisions before planning.
2. `dev-plan` turns the confirmed route into a verifiable goal, scope, steps, risks, and checks.
3. `dev-branch` executes implementation in a task branch, runs changelog, distill, and check gates, and waits for review before commit/merge.

Use this short flow for clear non-trivial development work:

1. `dev-plan` enters relevant context, identifies decision points, and turns the task into a verifiable goal, scope, steps, risks, and checks.
2. `dev-branch` executes implementation in a task branch, runs changelog, distill, and check gates, and waits for review before commit/merge.

Use this flow for audit-driven work:

1. `dev-audit` enters relevant context and creates evidence-based findings.
2. `dev-plan` turns confirmed findings into a fix plan.
3. `dev-branch` implements, verifies, distills, and waits for review.

Use `dev-exploratory-review` when the problem location is unknown and the agent should map the project
or a user-provided scope, run focused probes/tests when useful, and report only realistic failures.

Use `dev-init` for first-time project adoption and `dev-check` for lifecycle/routing validation.
`dev-orient`, `dev-changelog`, and `dev-distill` are still available standalone, but normal `dev-brainstorm`, `dev-plan`,
`dev-audit`, and `dev-branch` calls include their relevant gates.

Do not skip directly to implementation when the task is ambiguous, cross-module, or business-critical.

Do not preserve temporary plans, old TODOs, or debugging scratchwork as default context.

Persistent artifacts:

- `dev-plan` may stay chat-only for small, low-risk plans, but writes `docs/plans/YYYY-MM-DD-short-topic.md` for explicit plan documents, workflow-required plans, high-risk/cross-module/multi-turn work, or audit follow-up work.
- `dev-audit` may stay chat-only for small, low-risk bounded reviews, but writes `docs/audits/YYYY-MM-DD-topic-audit.md` for explicit audit reports, workflow-required audits, non-trivial/cross-module/correctness-sensitive audits, or findings that need follow-up.
- `dev-exploratory-review` may stay chat-only for small scoped reviews, but writes `docs/audits/YYYY-MM-DD-topic-exploratory-review.md` for repository-wide, multi-pass, cross-module, data-related, security-sensitive, correctness-sensitive, or follow-up-worthy reviews.
- `dev-branch` may carry related Dev Flow plan/audit artifacts onto the task branch, but must stop for unrelated existing changes.
- `dev-branch` must show status and diff, then wait for explicit approval before commit, merge, cleanup, or push.
- `dev-branch` must run the changelog gate before review. Use `dev-changelog` only when a change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
- `dev-branch` must run changelog, distill, and check gates before review. Update durable knowledge, ADRs, context-map, tests, or plan/audit lifecycle artifacts when the task outcome requires it; otherwise report concrete "not needed" reasons. If any gate is blocked, stop before commit or merge approval.
- `dev-changelog` uses `CHANGELOG.md` -> `## [Unreleased]` and Keep a Changelog categories. Do not log tiny internal-only changes.
- After creating a plan or audit file, run `git status --short --branch --untracked-files=all` and report whether git sees the artifact.

Plan readiness:

- `dev-plan` must identify unresolved product, business, data, state, irreversible cleanup, user-experience, or architecture decisions before writing an executable plan.
- `dev-brainstorm` keeps fuzzy idea refinement chat-only by default and routes confirmed decisions into `dev-plan`.
- If code facts cannot resolve a decision, ask the user to confirm it first.
- Recommendations are allowed, but must be labeled as recommendations.
- Plan files should contain one confirmed execution route, not unresolved option branches.

Lifecycle rules:

- Plan files only persist as `status: active` or `status: archived`; active plans live in `docs/plans/`, archived plans live in `docs/plans/archived/`.
- Audit files only persist as `status: active` or `status: archived`; active audits live in `docs/audits/`, archived audits live in `docs/audits/archived/`.
- Capability docs are current-only and must not preserve investigation logs or stale facts.
- ADR files use only `proposed`, `accepted`, or `archived`; proposed/accepted ADRs live in `docs/adr/`, archived ADRs live in `docs/adr/archived/`.
- Do not use `completed`, `distilled`, `superseded`, or `deprecated` as final document states.
- `dev-distill` must run the ADR gate for hard-to-reverse decisions, fact-source changes, architecture choices, algorithm policy, or cross-module rules.
