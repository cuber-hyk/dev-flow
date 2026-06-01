---
name: dev-init
description: Initialize Dev Flow repository memory for a new or existing project. Use when a user wants to set up cuberhyk-dev-flow, quickly connect an existing project, create the recommended AGENTS/CONTEXT/CHANGELOG/docs memory structure, install templates, or learn how to start the workflow. Runs or recommends the underlying cuberhyk-dev-flow init-project command. Do not use for task planning, audits, implementation, changelog maintenance, or distillation.
---

# Dev Init

Use this skill to bootstrap the Dev Flow memory structure in a repository.

## Boundary

Dev Init does:

- Inspect whether the current directory is a repository.
- Check whether Dev Flow memory files and directories already exist.
- Run `cuberhyk-dev-flow init-project [project-dir]` or the local equivalent when appropriate.
- Create missing files from the plugin `templates/` directory.
- Append a marked Dev Flow section to `AGENTS.md` when it already exists; create `AGENTS.md` only when missing.
- Explain what was created and what remains user-owned.
- Recommend the `/dev-check` skill after initialization.

Dev Init does not:

- Create feature plans or audit reports.
- Read broad project code.
- Overwrite existing `AGENTS.md`, `CLAUDE.md`, or business docs.
- Replace project-specific agent policy; only append the marked Dev Flow section when absent.
- Replace the `/dev-orient` skill; use the `/dev-orient` skill after initialization for task-specific context.

## User-Facing Use

Ask the agent to use this skill:

```text
dev-init 接入当前项目的 Dev Flow 文档结构
```

For an existing project, the `/dev-init` skill creates only the missing memory structure and templates. It does not infer all capability docs or ADRs in one step; follow with the `/dev-plan` skill for feature work or the `/dev-audit` skill for review work. Those skills enter relevant context, and the `/dev-branch` skill runs changelog, distill, and check gates before review.

## Internal Command

`dev-init` uses this CLI command as its stable file-creation mechanism:

```bash
cuberhyk-dev-flow init-project /path/to/project
```

Local source checkout:

```bash
node C:\Users\YourName\plugins\dev-flow\bin\dev-flow.js init-project /path/to/project
```

## What It Creates

The command creates missing paths only; it does not overwrite existing files.

```text
AGENTS.md
CHANGELOG.md
CONTEXT.md
docs/ai/context-map.md
docs/capabilities/
docs/plans/
docs/plans/archived/
docs/audits/
docs/audits/archived/
docs/adr/
docs/adr/archived/
docs/capabilities/_template.md
docs/plans/_template.md
docs/audits/_template.md
docs/adr/_template.md
```

Existing `AGENTS.md` receives only this marked block when missing:

```md
<!-- cuberhyk-dev-flow:start -->
...
<!-- cuberhyk-dev-flow:end -->
```

## Workflow

1. Confirm target:
   - Use the current working directory when the user does not provide `[project-dir]`.
   - If the target is unclear, ask one concise question.

2. Inspect existing memory:
   - Check for `AGENTS.md` and whether it already has the Dev Flow marked section.
   - Check for `CONTEXT.md`.
   - Check for `docs/ai/context-map.md`.
   - Check for `docs/capabilities/`, `docs/plans/`, `docs/plans/archived/`, `docs/audits/`,
     `docs/audits/archived/`, `docs/adr/`, and `docs/adr/archived/`.
   - Check for `_template.md` files in capabilities, plans, audits, and adr.

3. Initialize:
   - Run the command if the user asked to initialize or the target is clearly a project being set up.
   - Do not overwrite existing files.
   - Append Dev Flow guidance to `AGENTS.md` only if the marked section is absent.

4. Report:
   - Target project.
   - Created files/directories.
   - Existing files left unchanged.
   - Recommended next step.

## Output Template

Use `templates/output.md` for the final response shape.

## Next-Step Prompt

End with:

- "Initialization is complete; use the `/dev-check` skill to verify routing, then use the `/dev-orient` skill to start a concrete task."
