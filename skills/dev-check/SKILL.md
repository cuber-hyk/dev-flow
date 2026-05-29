---
name: dev-check
description: Validate Dev Flow documentation routing and lifecycle health. Use when a user asks to check whether AGENTS, CONTEXT, context-map, capabilities, plans, audits, ADRs, templates, or Dev Flow directories are correctly organized, or after dev-init/dev-audit/dev-distill to verify repository memory. Runs or recommends cuberhyk-dev-flow validate-docs. Do not use for implementing features, writing plans, or performing deep code audits.
---

# Dev Check

Use this skill to verify that Dev Flow memory is organized correctly.

## Boundary

Dev Check does:

- Run `cuberhyk-dev-flow validate-docs [project-dir]` or the local equivalent.
- Report missing recommended memory paths.
- Detect obvious process artifacts misplaced under `docs/capabilities/`.
- Warn when plans, audits, ADRs, or capabilities lack required lifecycle metadata.
- Warn when `docs/ai/context-map.md` points to missing paths or routes default context to process noise.
- Warn when git ignore rules hide Dev Flow paths such as `docs/plans/` or `docs/audits/`.
- Recommend the next skill or cleanup action.

Dev Check does not:

- Perform a deep business or code audit; use `dev-audit`.
- Rewrite capability docs.
- Archive or delete audit files automatically.
- Replace `dev-distill`; use `dev-distill` to close artifacts and update durable facts.

## Command

Preferred after npm publish:

```bash
cuberhyk-dev-flow validate-docs /path/to/project
```

Local source checkout:

```bash
node C:\Users\YourName\plugins\dev-flow\bin\dev-flow.js validate-docs /path/to/project
```

From this plugin repo:

```bash
npm run validate-docs -- /path/to/project
```

## Checks

The validator checks:

- Missing recommended paths:
  - `AGENTS.md`
  - `CONTEXT.md`
  - `docs/ai/context-map.md`
  - `docs/capabilities/`
  - `docs/plans/`
  - `docs/audits/`
  - `docs/audits/archived/`
  - `docs/adr/`
- Audit, review, findings, or plan artifacts stored under `docs/capabilities/`.
- Capability docs without `source_of_truth`.
- Plan and audit files without `status`, `updated`, or `artifact_type`.
- Invalid plan, audit, or ADR statuses.
- Active artifacts inside archived directories.
- `docs/ai/context-map.md` references to missing paths.
- `docs/ai/context-map.md` that routes default context to plans, audits, or archived files.
- Git ignore rules that hide `AGENTS.md`, `CONTEXT.md`, `docs/ai/context-map.md`, `docs/capabilities/`, `docs/plans/`, `docs/audits/`, or `docs/adr/`.

## Workflow

1. Confirm target:
   - Use the current working directory when `[project-dir]` is omitted.

2. Run validation:
   - Prefer the CLI command rather than manually reimplementing checks.

3. Interpret output:
   - `Errors` mean routing is likely wrong and should be fixed before relying on the docs.
   - `Warnings` mean the workflow can continue, but cleanup, initialization, or metadata updates are recommended.
   - Git ignore warnings mean agents may create correct-looking docs that are not versioned.

4. Recommend next step:
   - Missing structure -> use `dev-init`.
   - Audit/review needed -> use `dev-audit`.
   - Active plan/audit cleanup -> use `dev-distill`.
   - Clean state and new task -> use `dev-orient`.

## Output Shape

Use concise Markdown:

```md
检查目标：...

结果：
- ...

建议：
- ...

下一步：...
```

## Next-Step Prompt

End with one of these:

- `检查通过；下一步可以使用 dev-orient 开始具体任务。`
- `发现结构缺口；建议先使用 dev-init 初始化缺失目录或模板。`
- `发现审查需求；建议使用 dev-audit 生成结构化审查报告。`
- `发现产物生命周期问题；建议使用 dev-distill 关闭或归档相关计划/审查文档。`
