---
name: dev-orient
description: Enter and orient within a repository using low-noise, repo-native context. Use at the start of a new coding session or before non-trivial work to inspect repository state, read AGENTS/CONTEXT/context-map/capability docs, identify relevant code entry points, and recommend whether to continue with dev-plan. Do not use for detailed planning, implementation, or knowledge distillation.
---

# Dev Orient

Use this skill to establish where the agent is, what context matters, and what should not be read.

## Boundary

Dev Orient does:

- Inspect repository and git state.
- Read stable context entry points.
- Select relevant capability docs and code owners.
- State assumptions, uncertainties, fact sources, and next recommended skill.

Dev Orient does not:

- Produce a detailed implementation plan.
- Edit code or docs, except when explicitly asked to fix the context system itself.
- Create TODO files, reports, ADRs, or long audits.
- Distill task outcomes after implementation.

## Workflow

1. Inspect state:
   - Run `git rev-parse --is-inside-work-tree`.
   - Run `git status --short --branch`.
   - Do not change branches or files during orientation.

2. Read stable entry files when present:
   - `AGENTS.md` or `CLAUDE.md`
   - `docs/ai/context-map.md`
   - `CONTEXT.md`

3. Choose task-specific context:
   - Use `docs/ai/context-map.md` to select capability docs.
   - Read only the relevant `docs/capabilities/*.md`.
   - Read only code entry points referenced by that capability or found by narrow `rg` searches.

4. Avoid default noise:
   - Do not read old plans, old TODOs, generated reports, build outputs, or `docs/audits/*` unless directly relevant.

5. Report orientation:
   - Task type.
   - Context files read.
   - Relevant code entry points.
   - Known fact sources.
   - Assumptions and uncertainties.
   - Recommended next step.

## Next-Step Prompt

End orientation with one of these:

- `建议下一步使用 dev-plan，把目标、步骤和验收方式固定下来。`
- `这是小任务，可以跳过 dev-plan，直接执行并在结束时考虑 dev-distill。`
- `上下文不足，需要先向用户澄清，再进入 dev-plan。`
