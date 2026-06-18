---
name: dev-check
description: Validate Dev Flow repository memory, documentation routing, and lifecycle health. Use when the user asks to check AGENTS, CONTEXT, CHANGELOG, context-map, capabilities, plans, audits, ADRs, design-system files, templates, or Dev Flow directories, or after workflow steps that change repository memory. Not for implementation, planning, changelog writing, or deep code audits.
---

[toc]



# Dev Check

Use this skill to verify that Dev Flow memory is organized correctly[.

## Boundary

Dev Check does:

- Run `node <dev-flow>/bin/dev-flow.js validate-docs [project-dir]`.
- Report missing recommended memory paths.
- Detect process artifacts misplaced under `docs/capabilities/`.
- Warn when plans, audits, ADRs, or capabilities lack required metadata.
- Warn when plan/audit/ADR statuses violate the lifecycle protocol.
- Warn when audit findings lack stable IDs or finding status.
- Error when archived audits still contain unresolved findings or follow-up work.
- Warn when likely long-term decisions appear only in plans, audits, or capabilities without ADR review.
- Warn when `CHANGELOG.md` is missing `Unreleased`, release dates, or standard categories.
- Warn when `docs/ai/context-map.md` points to missing paths or routes default context to process noise.
- Warn when git ignore rules hide Dev Flow paths such as `docs/plans/` or `docs/audits/`.
- When a design contract exists, validate the `DESIGN.md`/`design-tokens.json` pair, required design
  sections, JSON structure, and referenced UI source paths.
- Recommend the next skill or cleanup action.

Dev Check does not:

- Perform a deep business or code audit; use the `/dev-audit` skill.
- Rewrite capability docs.
- Archive or delete files automatically.
- Replace the `/dev-distill` skill; use the `/dev-distill` skill to close artifacts and update durable facts.

## Command

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
- Audit files without required frontmatter: `artifact_type`, `status`, `created`, `updated`, `scope`,
  and `source_of_truth`.
- Audit findings tables without `ID`, `Severity`, `Status`, `Finding`, `Evidence`, `Owner Plan`, or
  `Branch/Commit` columns.
- Invalid plan step statuses. Allowed statuses are `todo`, `done`, and `blocked`.
- Invalid audit finding statuses. Allowed statuses are `open`, `planned`, `resolved`, and
  `verified`.
- Archived audits that still contain unresolved finding statuses, Critical/High unresolved sections,
  not-verified work, open questions, or next-step recommendations.
- Invalid plan/audit statuses. Allowed persisted statuses are `active` and `archived`.
- Invalid ADR statuses. Allowed persisted statuses are `proposed`, `accepted`, and `archived`.
- Disallowed legacy statuses: `completed`, `distilled`, `superseded`, and `deprecated`.
- Active artifacts inside archived directories.
- Archived plan/audit/ADR files that have not been moved into their `archived/` directory.
- `docs/ai/context-map.md` references to missing paths.
- `docs/ai/context-map.md` that routes default context to plans, audits, or archived files.
- Git ignore rules that hide `AGENTS.md`, `CONTEXT.md`, `docs/ai/context-map.md`,
  `docs/capabilities/`, `docs/plans/`, `docs/audits/`, or `docs/adr/`.
- A partial design contract where only `DESIGN.md` or `design-tokens.json` exists.
- Missing core `DESIGN.md` sections, invalid token JSON, missing `$type`/`$value`, or missing referenced sources.
- `CHANGELOG.md` structure, including `Unreleased`, release date format, and standard categories.
- Likely ADR-worthy decision language in plans, audits, or capability docs that has not been
  reviewed by the `/dev-distill` skill.

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
   - Missing structure -> use the `/dev-init` skill.
   - Audit/review needed -> use the `/dev-audit` skill.
   - Active plan/audit cleanup -> use the `/dev-distill` skill.
   - ADR warning -> use the `/dev-distill` skill to run the ADR gate.
   - Clean state and new task -> use the `/dev-orient` skill.

## Output Template

Use `templates/output.md` for the final response shape.
## Next-Step Prompt

End with one of these:

- "Validation passed; use the `/dev-orient` skill to start the next concrete task."
- "Missing Dev Flow structure; use the `/dev-init` skill to create missing directories and templates."
- "Audit or review is needed; use the `/dev-audit` skill to create a structured report."
- "Active plan or audit cleanup is needed; use the `/dev-distill` skill to close, archive, or delete the related artifacts."
- "A long-term decision may need ADR review; use the `/dev-distill` skill to run the ADR gate."
