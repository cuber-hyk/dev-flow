# AI Context Map

This file routes AI agents to current context without reading process noise.

## Default Entry

1. Read `AGENTS.md` or `CLAUDE.md` when present.
2. Read `CONTEXT.md`.
3. Select only task-relevant `docs/capabilities/*.md`.
4. Read only code entry points named by the selected capability docs.

## Memory Rules

- Do not read `docs/plans/` by default.
- Do not read `docs/audits/` by default.
- Do not read any `archived/` directory by default.
- Treat code and tests as the final source of truth when docs disagree.

## Task Routes

| Task type | Read first | Code entry points | Notes |
|---|---|---|---|
| Feature or bug | `CONTEXT.md`, relevant capability docs | Add project-specific paths here | Use `dev-orient` first. |
| Audit | `CONTEXT.md`, relevant capability docs | Add project-specific paths here | Use `dev-audit`; write report to `docs/audits/`. |
| Release notes | `CHANGELOG.md` | Add release-specific paths here | Use `dev-changelog`; keep entries human-readable. |
| Architecture decision | `CONTEXT.md`, relevant capability docs, relevant ADRs | Add project-specific paths here | Write ADR only when the ADR gate passes. |

## Plan Readiness Rule

Before writing a persistent plan, `dev-plan` must confirm that the execution route is decided.
If product, business, data, state, irreversible cleanup, user-experience, or architecture decisions
are unresolved, ask the user to confirm the route first. Do not put unresolved option branches into
`docs/plans/*.md`.

## Artifact Destinations

| Artifact | Destination | Default read? |
|---|---|---|
| Current module facts | `docs/capabilities/*.md` | Yes, when relevant |
| Active plans | `docs/plans/*.md` | No |
| Archived plans | `docs/plans/archived/*.md` | No |
| Active audits | `docs/audits/*.md` | No |
| Archived audits | `docs/audits/archived/*.md` | No |
| Proposed or accepted decisions | `docs/adr/*.md` | Only for decision tasks |
| Archived decisions | `docs/adr/archived/*.md` | No |
| Release notes | `CHANGELOG.md` | Only for release/changelog tasks |

## Lifecycle Summary

| Artifact | Persisted statuses | Closeout |
|---|---|---|
| Plan | `active`, `archived` | Active files stay in `docs/plans/`; archived files move to `docs/plans/archived/`; delete when no future value remains. |
| Audit | `active`, `archived` | Active files stay in `docs/audits/`; archived files move to `docs/audits/archived/`; delete when stable facts are captured elsewhere. |
| Capability | `current` | Update in place; remove stale facts. |
| ADR | `proposed`, `accepted`, `archived` | Proposed/accepted files stay in `docs/adr/`; archived files move to `docs/adr/archived/`; delete mistaken drafts. |

Do not use `completed`, `distilled`, `superseded`, or `deprecated` as final document states.

## Updated

- {{DATE}}: Initialized cuberhyk-dev-flow context map.
