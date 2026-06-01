---
name: dev-orient
description: Enter and orient within a repository using low-noise, repo-native context. Use at the start of a new coding session or before non-trivial work to inspect repository state, read AGENTS/CONTEXT/context-map/capability docs, identify relevant code entry points, identify likely documentation destinations such as docs/plans, docs/audits, docs/capabilities, or docs/adr, and recommend whether to continue with the `/dev-plan`, `/dev-audit`, or `/dev-branch` skills. Do not use for detailed planning, auditing, implementation, branch execution, or knowledge distillation.
---

# Dev Orient

Use this skill to establish where the agent is, what context matters, and what should not be read.

## Boundary

Dev Orient does:

- Inspect repository and git state.
- Read stable context entry points.
- Check whether the recommended knowledge directories and templates exist.
- Select relevant capability docs and code owners.
- State assumptions, uncertainties, fact sources, likely artifact destinations, and next recommended skill.

Dev Orient does not:

- Produce a detailed implementation plan.
- Perform audits or write findings; use the `/dev-audit` skill.
- Edit code or docs, except when explicitly asked to fix the context system itself.
- Create TODO files, reports, ADRs, or long audits.
- Distill task outcomes after implementation.

## Repository Memory Map

| Content | Destination | Orient behavior |
|---|---|---|
| Agent rules and project workflow | `AGENTS.md` or `CLAUDE.md` | Read first when present. |
| Stable domain vocabulary | `CONTEXT.md` | Read when present. |
| AI context routing | `docs/ai/context-map.md` | Read when present. |
| Current module facts, owners, APIs, data sources, rules | `docs/capabilities/*.md` | Read only relevant capability docs. |
| Persistent task plans | `docs/plans/*.md` | Do not read by default; mention as plan destination. |
| Audit reports and review findings | `docs/audits/*.md` | Do not read by default; mention as audit destination. |
| Important hard-to-reverse decisions | `docs/adr/*.md` | Read only when the task involves decisions. |

## Lifecycle Awareness

| Artifact | Active location | Closed state/action | Default read? |
|---|---|---|---|
| Plan | `docs/plans/*.md` with `status: active` | `docs/plans/archived/*.md` with `status: archived` or deleted by the `/dev-distill` skill | No |
| Audit | `docs/audits/*.md` with `status: active` | `docs/audits/archived/*.md` with `status: archived` or deleted by the `/dev-distill` skill | No |
| Capability | `docs/capabilities/*.md` | Always current; no historical findings | Yes, when relevant |
| ADR | `docs/adr/*.md` for `proposed`/`accepted`; `docs/adr/archived/*.md` for `archived` | `proposed`, `accepted`, or `archived` | Only for decision tasks |

Do not use `completed`, `distilled`, `superseded`, or `deprecated` as final document states.
Completion and distillation are events; closed plans and audits must be archived or deleted.

If the project has no Dev Flow memory structure, report that it needs initialization and recommend
the `/dev-init` skill.

## Workflow

1. Inspect state:
   - Run `git rev-parse --is-inside-work-tree`.
   - Run `git status --short --branch`.
   - Do not change branches or files during orientation.

2. Read stable entry files when present:
   - `AGENTS.md` or `CLAUDE.md`.
   - `docs/ai/context-map.md`.
   - `CONTEXT.md`.

3. Check memory structure:
   - Note whether `CONTEXT.md`, `docs/ai/context-map.md`, `docs/capabilities/`, `docs/plans/`,
     `docs/plans/archived/`, `docs/audits/`, `docs/audits/archived/`, `docs/adr/`, and
     `docs/adr/archived/` exist.
   - Note whether `_template.md` files exist for capabilities, plans, audits, and ADRs.
   - If a needed destination is missing, recommend the `/dev-init` skill.

4. Choose task-specific context:
   - Use `docs/ai/context-map.md` to select capability docs.
   - Read only the relevant `docs/capabilities/*.md`.
   - Read accepted ADRs only when the task involves a long-term decision or historical tradeoff.
   - Read only code entry points referenced by capability docs or found by narrow `rg` searches.

5. Avoid default noise:
   - Do not read old plans, old TODOs, generated reports, build outputs, `docs/plans/*`,
     `docs/audits/*`, or any `archived/` directory unless directly relevant.
   - Never treat an audit or plan as current truth.

6. Report orientation:
   - Task type.
   - Context files read.
   - Relevant code entry points.
   - Known fact sources.
   - Likely artifact destination: `docs/plans/`, `docs/audits/`, `docs/capabilities/`,
     `docs/adr/`, tests, or none.
   - Memory structure gaps and whether initialization is recommended.
   - Assumptions and uncertainties.
   - Recommended next skill.

## Output Template

Use `templates/output.md` for the final response shape.

## Next-Step Prompt

End with one of these:

- "Context is loaded; use the `/dev-plan` skill to lock goal, boundaries, and verification before implementation, then use the `/dev-branch` skill for reviewed branch work."
- "This is review work; use the `/dev-audit` skill to define scope, evidence, and findings under `docs/audits/` when persistence is needed."
- "This is a small clear task; direct implementation is possible, and the `/dev-distill` skill may be needed at closeout if durable knowledge changes."
- "Context is insufficient or decisions are unclear; clarify with the user before using the `/dev-plan` or `/dev-audit` skill."
