{{AGENT_SECTION_START}}
# Dev Flow Protocol

Use cuberhyk-dev-flow for non-trivial development work.

Language policy:

- Default to Chinese for user-facing replies and documents created by this workflow.
- Follow an explicit user language request or a documented existing repository language convention instead.
- Keep code, commands, APIs, identifiers, paths, configuration keys, and required schema/status values in English.

Persistent Markdown frontmatter:

- For `DESIGN.md` and documents under `docs/capabilities/`, `docs/plans/`, `docs/audits/`, or `docs/adr/`, copy the matching template's YAML frontmatter block exactly before filling in values.
- YAML frontmatter must be the first content in the file, start with `---`, end with a second `---`, and be followed by the Markdown title on a later line.
- Never turn metadata fields such as `artifact_type`, `status`, `created`, or `updated` into Markdown headings or body text.
- After creating or updating a persistent artifact, run `validate-docs`; a frontmatter error must be fixed before reporting the artifact complete.

Default user-facing flow:

For fuzzy ideas or unclear product/workflow changes:

1. `dev-brainstorm`: clarify goals, non-goals, approaches, and user-owned decisions before planning.
2. `dev-plan`: turn the confirmed route into a verifiable plan.
3. `dev-branch`: implement in a task branch, run lifecycle gates and an independent subagent-or-manual review, then wait for approval before commit/merge.

For clear non-trivial tasks:

1. `dev-plan`: enter relevant repository context, identify unresolved decisions, and create a verifiable plan.
2. `dev-branch`: implement in a task branch, run lifecycle gates and an independent subagent-or-manual review, then wait for approval before commit/merge.

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
7. `dev-design-system`: initialize, update, or check the durable UI contract for UI work.

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
- Current confirmed UI rules -> `DESIGN.md`
- Exact UI foundation values -> `design-tokens.json`

Lifecycle rules:

- Plan status is only `active` or `archived`; active plans live in `docs/plans/`, archived plans live in `docs/plans/archived/`.
- Audit status is only `active` or `archived`; active audits live in `docs/audits/`, archived audits live in `docs/audits/archived/`.
- Capability docs are current-only; update or delete stale facts in place.
- ADR status is only `proposed`, `accepted`, or `archived`; proposed/accepted ADRs live in `docs/adr/`, archived ADRs live in `docs/adr/archived/`.
- Do not use `completed`, `distilled`, `superseded`, or `deprecated` as final document states.
- `dev-distill` must run the ADR gate when work involves hard-to-reverse decisions, fact-source changes, architecture choices, algorithm policy, or cross-module rules.

Planning decision rules:

- `dev-brainstorm` clarifies fuzzy ideas before planning; it must not write implementation code, audit findings, or executable plans.
- `dev-brainstorm` keeps output in conversation by default unless the user asks for a document.
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
- Run changelog, distill, and check gates before review. Update durable knowledge, ADRs, context-map, tests, or plan/audit lifecycle artifacts when the task outcome requires it. If no durable update is needed, report concrete "not needed" reasons. If any gate is blocked, stop before commit or merge approval.
- Run the independent review gate before approval. Use a focused read-only subagent only when available and useful; otherwise run the same review manually. The main agent must verify findings and remains responsible for the final diff and evidence.
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
- For UI tasks, read `DESIGN.md` and relevant tokens/components before planning or implementation.
- Search existing semantic UI patterns and shared components before creating a new implementation.
- After UI work, run the Design System Gate and update `DESIGN.md` only when a reusable rule changed.
{{AGENT_SECTION_END}}
