{{AGENT_SECTION_START}}
# Dev Flow Protocol

Use cuberhyk-dev-flow for non-trivial development work.

Default user-facing flow:

1. `dev-plan`: enter relevant repository context, identify unresolved decisions, and create a verifiable plan.
2. `dev-branch`: implement in a task branch, run changelog and distill gates, then wait for review before commit/merge.

Audit-driven flow:

1. `dev-audit`: enter relevant repository context and produce evidence-based findings.
2. `dev-plan`: turn confirmed findings into a fix plan.
3. `dev-branch`: implement, verify, distill, and wait for review.

Setup and maintenance skills:

1. `dev-init`: create missing repository memory structure.
2. `dev-check`: validate documentation routing and lifecycle health.
3. `dev-orient`: enter low-noise project context when context-only orientation is needed.
4. `dev-changelog`: update `CHANGELOG.md` only for notable user/operator/release changes.
5. `dev-distill`: preserve stable knowledge and close process artifacts.
6. `dev-check`: re-check routing after documentation changes.

Document routing:

- Stable vocabulary -> `CONTEXT.md`
- Context routing -> `docs/ai/context-map.md`
- Current module facts -> `docs/capabilities/*.md`
- Active plans -> `docs/plans/*.md`
- Archived plans -> `docs/plans/archived/*.md`
- Active audits -> `docs/audits/*.md`
- Archived audits -> `docs/audits/archived/*.md`
- Proposed/accepted decisions -> `docs/adr/*.md`
- Archived decisions -> `docs/adr/archived/*.md`
- Human-readable release notes -> `CHANGELOG.md`
- Executable business rules -> tests

Lifecycle rules:

- Plan status is only `active` or `archived`; active plans live in `docs/plans/`, archived plans live in `docs/plans/archived/`.
- Audit status is only `active` or `archived`; active audits live in `docs/audits/`, archived audits live in `docs/audits/archived/`.
- Capability docs are current-only; update or delete stale facts in place.
- ADR status is only `proposed`, `accepted`, or `archived`; proposed/accepted ADRs live in `docs/adr/`, archived ADRs live in `docs/adr/archived/`.
- Do not use `completed`, `distilled`, `superseded`, or `deprecated` as final document states.
- `dev-distill` must run the ADR gate when work involves hard-to-reverse decisions, fact-source changes, architecture choices, algorithm policy, or cross-module rules.

Planning decision rules:

- `dev-plan` must not write an executable plan while key product, business, data, state, cleanup, or architecture decisions are unresolved.
- If multiple reasonable routes exist and code facts cannot decide, `dev-plan` must ask the user to confirm the decision.
- Recommendations are allowed, but must be labeled as recommendations, not treated as confirmed decisions.
- Formal plan files should contain a single confirmed execution route, not unresolved `Option A / Option B` branches.

Branch execution rules:

- `dev-branch` does not require a perfectly clean worktree; it requires attributable changes.
- Related Dev Flow artifacts, such as the current task plan or audit, may move onto the task branch.
- Unrelated or ambiguous source/config/test/generated changes must stop the workflow until the user decides how to handle them.
- Before commit or merge, show `git status --short --branch --untracked-files=all` and `git diff`, then wait for explicit approval.
- Run the changelog gate before review; update `CHANGELOG.md` only when the change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
- Run the distill gate before review; update durable knowledge, ADRs, context-map, tests, or plan/audit lifecycle artifacts when the task outcome requires it. If no durable update is needed, report `Distill: not needed` with a concrete reason.
- Never push automatically.

Changelog rules:

- Keep `CHANGELOG.md` human-readable and maintain `## [Unreleased]`.
- Use only `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, and `Security`.
- Do not write changelog entries for tiny internal-only changes, formatting, test-only work, or invisible refactors.

Default context rules:

- Do not read `docs/plans/` by default.
- Do not read `docs/audits/` by default.
- Do not read archived files by default.
- Treat code and tests as the source of truth when documents disagree.
{{AGENT_SECTION_END}}
