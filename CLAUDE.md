# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact lifecycle workflow for coding agents. It is intentionally small: init, check, orient, brainstorm, plan, audit, branch, changelog, distill.

## If You Are an AI Agent

For fuzzy ideas or unclear product/workflow changes:

1. `cuberhyk-dev-flow:dev-brainstorm` - Clarify goals, non-goals, approaches, and user-owned decisions before planning.
2. `cuberhyk-dev-flow:dev-plan` - Turn the confirmed route into a verifiable plan.
3. `cuberhyk-dev-flow:dev-branch` - Implement in a task branch, run changelog, distill, and check gates, then wait for review before commit/merge.

For clear non-trivial development, prefer the short user flow:

1. `cuberhyk-dev-flow:dev-plan` - Enter relevant context, identify decision points, and create a verifiable plan.
2. `cuberhyk-dev-flow:dev-branch` - Implement in a task branch, run changelog, distill, and check gates, then wait for review before commit/merge.

For project-level UI design systems:

1. Discuss and review a representative UI direction.
2. `cuberhyk-dev-flow:dev-design-system` - Initialize `DESIGN.md` and `design-tokens.json`, or update/check the durable UI contract during later UI tasks.
3. Continue with `dev-plan` and `dev-branch`; UI work must run the Design System Gate.

For audit-driven work:

1. `cuberhyk-dev-flow:dev-audit` - Enter relevant context and produce evidence-based findings.
2. `cuberhyk-dev-flow:dev-plan` - Turn confirmed findings into a fix plan.
3. `cuberhyk-dev-flow:dev-branch` - Implement, verify, distill, and wait for review.

For open-ended risk discovery:

1. `cuberhyk-dev-flow:dev-exploratory-review` - Map the project or user-provided scope, build a risk map, run focused probes/tests when useful, and report only realistic failures.
2. `cuberhyk-dev-flow:dev-plan` - Turn confirmed findings into a fix plan.
3. `cuberhyk-dev-flow:dev-branch` - Implement, verify, distill, and wait for review.

For project setup and health checks:

- `cuberhyk-dev-flow:dev-init` initializes missing Dev Flow memory structure.
- `cuberhyk-dev-flow:dev-check` validates documentation routing, lifecycle health, changelog structure, ADR hints, and git visibility.
- `cuberhyk-dev-flow:dev-orient`, `cuberhyk-dev-flow:dev-changelog`, and `cuberhyk-dev-flow:dev-distill` remain available standalone, but `dev-brainstorm`, `dev-plan`, `dev-audit`, and `dev-branch` call their relevant gates during normal work.

## Skill Boundaries

- `dev-orient` does not plan or edit.
- `dev-brainstorm` clarifies fuzzy ideas, compares approaches, and confirms decisions before planning. It does not write executable plans, audit findings, or implementation code.
- `dev-plan` includes an orient gate, then checks plan readiness before writing a formal plan. It does not audit, implement, or archive.
- `dev-audit` includes an orient gate, then writes findings for bounded audits with clear scope or questions. It does not implement fixes or update capability docs with stable facts.
- `dev-exploratory-review` maps a project or bounded scope, builds a risk map, runs focused probes/tests when useful, and uses a four-pass harness to discover realistic failures. It does not implement fixes or comment on style, naming, formatting, or subjective preferences.
- `dev-branch` does not skip review, mix unrelated changes, or push automatically. It must run changelog, distill, and check gates before the review gate.
- `dev-changelog` does not replace ADRs, capability docs, task plans, or git history.
- `dev-distill` does not re-plan or re-implement.
- `dev-design-system` maintains confirmed UI rules, exact token routing, semantic component reuse, and design-system checks. It does not invent unseen UI scenarios.
- `dev-init` only bootstraps memory structure.
- `dev-check` only validates documentation routing and lifecycle health.

Persistent artifacts:

- `dev-plan` may stay chat-only for small, low-risk plans, but must write `docs/plans/YYYY-MM-DD-short-topic.md` for explicit plan documents, workflow-required plans, high-risk/cross-module/multi-turn work, or audit follow-up work.
- `dev-audit` may stay chat-only for small, low-risk bounded reviews, but must write `docs/audits/YYYY-MM-DD-topic-audit.md` for explicit audit reports, workflow-required audits, non-trivial/cross-module/correctness-sensitive audits, or findings that need follow-up.
- `dev-exploratory-review` may stay chat-only for small scoped reviews, but must write `docs/audits/YYYY-MM-DD-topic-exploratory-review.md` for repository-wide, multi-pass, cross-module, data-related, security-sensitive, correctness-sensitive, or follow-up-worthy reviews.
- After creating a plan or audit file, run `git status --short --branch --untracked-files=all` and report whether git sees the artifact.
- `dev-branch` may carry clearly related Dev Flow plan/audit artifacts onto the task branch, but must stop for unrelated existing changes.
- `dev-branch` must show `git status --short --branch --untracked-files=all` and `git diff`, then wait for explicit approval before commit, merge, or cleanup.
- `dev-branch` must run the changelog gate before review. It updates `CHANGELOG.md` through `dev-changelog` only for notable user/operator/release changes.
- `dev-branch` must run changelog, distill, and check gates before review. It updates durable knowledge, ADRs, context-map, tests, or plan/audit lifecycle artifacts when the task outcome requires it; otherwise it reports concrete "not needed" reasons. If any gate is blocked, it stops before commit or merge approval.
- `dev-changelog` writes to `## [Unreleased]` using `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`; tiny internal-only changes should report `Changelog: not needed`.

Plan readiness:

- `dev-plan` must identify unresolved product, business, data, state, irreversible cleanup, user-experience, or architecture decisions before writing an executable plan.
- `dev-brainstorm` must route fuzzy ideas to confirmed goals and decisions before `dev-plan`; it should keep output in conversation unless the user asks for a document.
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

If a harness exposes un-namespaced skills, use `dev-init`, `dev-check`, `dev-orient`, `dev-brainstorm`, `dev-design-system`, `dev-plan`, `dev-audit`, `dev-exploratory-review`, `dev-branch`, `dev-changelog`, and `dev-distill` directly.

If a harness namespaces plugin skills, use `cuberhyk-dev-flow:dev-init`, `cuberhyk-dev-flow:dev-check`, `cuberhyk-dev-flow:dev-orient`, `cuberhyk-dev-flow:dev-brainstorm`, `cuberhyk-dev-flow:dev-design-system`, `cuberhyk-dev-flow:dev-plan`, `cuberhyk-dev-flow:dev-audit`, `cuberhyk-dev-flow:dev-exploratory-review`, `cuberhyk-dev-flow:dev-branch`, `cuberhyk-dev-flow:dev-changelog`, and `cuberhyk-dev-flow:dev-distill`.
