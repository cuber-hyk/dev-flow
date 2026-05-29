---
name: dev-orient
description: Enter and orient within a repository using low-noise, repo-native context. Use at the start of a new coding session or before non-trivial work to inspect repository state, read AGENTS/CONTEXT/context-map/capability docs, identify relevant code entry points, identify likely documentation destinations such as docs/plans, docs/audits, docs/capabilities, or docs/adr, and recommend whether to continue with dev-plan or dev-audit. Do not use for detailed planning, auditing, implementation, or knowledge distillation.
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
- Perform audits or write findings; use `dev-audit`.
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

## Lifecycle Protocol

| Artifact | Active location | Closed location/status | Default read? |
|---|---|---|---|
| Plan | `docs/plans/*.md` with `status: active` | `completed`, `superseded`, or `archived` | No |
| Audit | `docs/audits/*.md` with `status: active` | `distilled`, `archived`, or `docs/audits/archived/` | No |
| Capability | `docs/capabilities/*.md` | Always current; no historical findings | Yes, when relevant |
| ADR | `docs/adr/*.md` | `accepted`, `superseded`, or `deprecated` | Only for decision tasks |

If the project has no Dev Flow memory structure, report that it needs initialization and recommend `dev-init`.

## Workflow

1. Inspect state:
   - Run `git rev-parse --is-inside-work-tree`.
   - Run `git status --short --branch`.
   - Do not change branches or files during orientation.

2. Read stable entry files when present:
   - `AGENTS.md` or `CLAUDE.md`
   - `docs/ai/context-map.md`
   - `CONTEXT.md`

3. Check memory structure:
   - Note whether `CONTEXT.md`, `docs/ai/context-map.md`, `docs/capabilities/`, `docs/plans/`, `docs/audits/`, `docs/audits/archived/`, and `docs/adr/` exist.
   - Note whether `_template.md` files exist for capabilities, plans, audits, and ADRs.
   - If a needed destination is missing, recommend `dev-init`.

4. Choose task-specific context:
   - Use `docs/ai/context-map.md` to select capability docs.
   - Read only the relevant `docs/capabilities/*.md`.
   - Read only code entry points referenced by that capability or found by narrow `rg` searches.

5. Avoid default noise:
   - Do not read old plans, old TODOs, generated reports, build outputs, `docs/plans/*`, `docs/audits/*`, or any `archived/` directory unless directly relevant.
   - Never treat an audit or plan as current truth.

6. Report orientation:
   - Task type.
   - Context files read.
   - Relevant code entry points.
   - Known fact sources.
   - Likely artifact destination: `docs/plans/`, `docs/audits/`, `docs/capabilities/`, `docs/adr/`, tests, or none.
   - Memory structure gaps and whether initialization is recommended.
   - Assumptions and uncertainties.
   - Recommended next skill.

## Next-Step Prompt

End with one of these:

- `建议下一步使用 dev-plan，把目标、步骤和验收方式固定下来。`
- `这是审查任务；建议下一步使用 dev-audit，把审查范围、证据和发现归位到 docs/audits/。`
- `这是小任务，可以跳过 dev-plan，直接执行并在结束时考虑 dev-distill。`
- `上下文不足，需要先向用户澄清，再进入 dev-plan 或 dev-audit。`
