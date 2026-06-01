---
name: dev-check
description: Validate Dev Flow documentation routing and lifecycle health. Use when a user asks to check whether AGENTS, CONTEXT, CHANGELOG, context-map, capabilities, plans, audits, ADRs, templates, or Dev Flow directories are correctly organized, or after dev-init/dev-audit/dev-branch/dev-changelog/dev-distill to verify repository memory. Runs or recommends cuberhyk-dev-flow validate-docs. Do not use for implementing features, writing plans, branch execution, changelog writing, or performing deep code audits.
---

# Dev Check

Use this skill to verify that Dev Flow memory is organized correctly.

## Boundary

Dev Check does:

- Run `cuberhyk-dev-flow validate-docs [project-dir]` or the local equivalent.
- Report missing recommended memory paths.
- Detect process artifacts misplaced under `docs/capabilities/`.
- Warn when plans, audits, ADRs, or capabilities lack required metadata.
- Warn when plan/audit/ADR statuses violate the lifecycle protocol.
- Warn when likely long-term decisions appear only in plans, audits, or capabilities without ADR review.
- Warn when `CHANGELOG.md` is missing `Unreleased`, release dates, or standard categories.
- Warn when `docs/ai/context-map.md` points to missing paths or routes default context to process noise.
- Warn when git ignore rules hide Dev Flow paths such as `docs/plans/` or `docs/audits/`.
- Recommend the next skill or cleanup action.

Dev Check does not:

- Perform a deep business or code audit; use `dev-audit`.
- Rewrite capability docs.
- Archive or delete files automatically.
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
  - `CHANGELOG.md`
  - `CONTEXT.md`
  - `docs/ai/context-map.md`
  - `docs/capabilities/`
  - `docs/plans/`
  - `docs/plans/archived/`
  - `docs/audits/`
  - `docs/audits/archived/`
  - `docs/adr/`
  - `docs/adr/archived/`
- Audit, review, findings, or plan artifacts stored under `docs/capabilities/`.
- Capability docs without `source_of_truth`.
- Plan and audit files without `status`, `updated`, or `artifact_type`.
- Invalid plan/audit statuses. Allowed persisted statuses are `active` and `archived`.
- Invalid ADR statuses. Allowed persisted statuses are `proposed`, `accepted`, and `archived`.
- Disallowed legacy statuses: `completed`, `distilled`, `superseded`, and `deprecated`.
- Active artifacts inside archived directories.
- Archived plan/audit/ADR files that have not been moved into their `archived/` directory.
- `docs/ai/context-map.md` references to missing paths.
- `docs/ai/context-map.md` that routes default context to plans, audits, or archived files.
- Git ignore rules that hide `AGENTS.md`, `CONTEXT.md`, `docs/ai/context-map.md`,
  `docs/capabilities/`, `docs/plans/`, `docs/audits/`, or `docs/adr/`.
- `CHANGELOG.md` structure, including `Unreleased`, release date format, and standard categories.
- Likely ADR-worthy decision language in plans, audits, or capability docs that has not been
  reviewed by `dev-distill`.

## Workflow

1. Confirm target:
   - Use the current working directory when `[project-dir]` is omitted.

2. Run validation:
   - Prefer the CLI command rather than manually reimplementing checks.

3. Interpret output:
   - `Errors` mean routing is likely wrong and should be fixed before relying on the docs.
   - `Warnings` mean the workflow can continue, but cleanup, initialization, metadata updates, or
     ADR review may be needed.
   - Git ignore warnings mean agents may create correct-looking docs that are not versioned.

4. Recommend next step:
   - Missing structure -> use `dev-init`.
   - Audit/review needed -> use `dev-audit`.
   - Active plan/audit cleanup -> use `dev-distill`.
   - ADR warning -> use `dev-distill` to run the ADR gate.
   - Clean state and new task -> use `dev-orient`.

## Output Template

Use `templates/output.md` for the final response shape.
## Next-Step Prompt

End with one of these:

- `���ͨ������һ������ʹ�� dev-orient ��ʼ��������`
- `���ֽṹȱ�ڣ�������ʹ�� dev-init ��ʼ��ȱʧĿ¼��ģ�塣`
- `����������󣻽���ʹ�� dev-audit ���ɽṹ����鱨�档`
- `���ֲ��������������⣻����ʹ�� dev-distill �رա��鵵��ɾ����ؼƻ�/����ĵ���`
- `���ֿ�����Ҫ ADR �ĳ��ھ��ߣ�����ʹ�� dev-distill ���� ADR gate��`
