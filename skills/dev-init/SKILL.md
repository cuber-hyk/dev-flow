---
name: dev-init
description: Initialize Dev Flow repository memory for a project. Use when a user wants to set up cuberhyk-dev-flow in a repository, create the recommended AGENTS/CONTEXT/docs/ai/docs/capabilities/docs/plans/docs/audits/docs/adr structure, install document templates, or asks how to start using the workflow in a new or existing project. Runs or recommends the cuberhyk-dev-flow init-project command. Do not use for task planning, audits, implementation, or distillation.
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
- Recommend `dev-check` after initialization.

Dev Init does not:

- Create feature plans or audit reports.
- Read broad project code.
- Overwrite existing `AGENTS.md`, `CLAUDE.md`, or business docs.
- Replace project-specific agent policy; only append the marked Dev Flow section when absent.
- Replace `dev-orient`; use `dev-orient` after initialization for task-specific context.

## Command

Preferred after npm publish:

```bash
cuberhyk-dev-flow init-project /path/to/project
```

Local source checkout:

```bash
node C:\Users\YourName\plugins\dev-flow\bin\dev-flow.js init-project /path/to/project
```

From this plugin repo:

```bash
npm run init-project -- /path/to/project
```

## What It Creates

The command creates missing paths only; it does not overwrite existing files.

```text
AGENTS.md
CONTEXT.md
docs/ai/context-map.md
docs/capabilities/
docs/plans/
docs/audits/
docs/audits/archived/
docs/adr/
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
   - Check for `docs/capabilities/`, `docs/plans/`, `docs/audits/`, `docs/audits/archived/`, and `docs/adr/`.
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

## Next-Step Prompt

End with:

- `初始化完成；建议下一步使用 dev-check 检查文档归位，再用 dev-orient 开始具体任务。`
