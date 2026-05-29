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
| Architecture decision | `CONTEXT.md`, relevant capability docs, relevant ADRs | Add project-specific paths here | Write ADR only when the ADR gate passes. |

## Artifact Destinations

| Artifact | Destination | Default read? |
|---|---|---|
| Current module facts | `docs/capabilities/*.md` | Yes, when relevant |
| Plans | `docs/plans/*.md` | No |
| Audits | `docs/audits/*.md` | No |
| Archived audits | `docs/audits/archived/*.md` | No |
| Decisions | `docs/adr/*.md` | Only for decision tasks |

## Updated

- {{DATE}}: Initialized cuberhyk-dev-flow context map.
