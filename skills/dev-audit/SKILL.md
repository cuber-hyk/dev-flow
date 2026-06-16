---
name: dev-audit
description: Create a structured, evidence-based audit or review for a bounded scope. Use when the user asks to audit, inspect correctness, evaluate completeness, find risks, or produce findings for a specific feature, workflow, branch, module, or question. For open-ended unknown-risk discovery, use dev-exploratory-review.
---

# Dev Audit

Use this skill to perform a bounded audit and route findings correctly.

For open-ended project or scope review where the problem location is unknown, use the `/dev-exploratory-review` skill.

## Boundary

Dev Audit does:

- Run a low-noise orientation gate before inspecting findings unless the same context was already loaded in this turn.
- Define audit scope, questions, fact sources, and verification.
- Inspect relevant code, tests, capability docs, ADRs, and runtime behavior.
- Produce findings ordered by severity with evidence.
- Decide whether the audit can stay in conversation or must be written to `docs/audits/`.
- Create or update a persistent audit report under `docs/audits/` when the persistence rule applies.
- Verify that any created audit file exists and is visible to git.
- Recommend the `/dev-plan` skill for fixes and the `/dev-branch` skill for reviewed implementation.

Dev Audit does not:

- Implement fixes.
- Create feature plans; use the `/dev-plan` skill.
- Put findings into `docs/capabilities/`.
- Archive/delete audits after findings are handled; use the `/dev-distill` skill.
- Treat old plans or audits as current truth.

## Orient Gate

The `/dev-audit` skill includes the practical subset of the `/dev-orient` skill so users can start an audit with one
command.

Before inspecting findings, do this:

1. Read repository instructions such as `AGENTS.md`, `CLAUDE.md`, or equivalent agent guidance.
2. Read `CONTEXT.md` when present to learn stable vocabulary.
3. Read `docs/ai/context-map.md` when present to identify likely capability docs and code entry points.
4. Read only audit-relevant `docs/capabilities/*.md`, ADRs, tests, schemas, routes, or services.
5. Identify expected output destinations: audit report, follow-up plan, ADR gate, capability update,
   changelog, tests, or none.

Do not read these by default:

- `docs/plans/` unless the audit is explicitly checking a current plan.
- Old `docs/audits/` unless the user asks for historical comparison or follow-up closure.
- `archived/` directories.
- Generated files, build output, dependency folders, or unrelated historical notes.

If the repository has no Dev Flow structure and the audit is expected to produce persistent output,
recommend the `/dev-init` skill before writing the audit report.

## Persistent Audit Rule

Small, low-risk audits may stay in conversation.

Create or update `docs/audits/YYYY-MM-DD-topic-audit.md` when any of these are true:

- The user explicitly asks for an audit report, review report, findings document, checklist, or written review.
- Repository workflow instructions require audit artifacts under `docs/audits/`.
- The audit is non-trivial, cross-module, correctness-sensitive, security-sensitive, algorithmic, data-related, or likely to need later follow-up.
- The audit finds issues, risks, missing tests, unclear ownership, stale docs, or behavior that needs implementation planning.
- The audit is part of a lifecycle workflow where findings should later be distilled or archived.

Keep the audit in conversation when all of these are true:

- The audit is small, low-risk, and likely completed in one turn.
- The user did not ask for an audit report or findings document.
- Repository workflow does not require an audit file for this kind of task.
- No finding needs later implementation, distillation, or archival.

If a persistent audit is required and `docs/audits/` is missing, recommend or run the `/dev-init` skill when appropriate, then create the audit. If initialization is not allowed, report that the persistent audit cannot be written.

When creating an audit file:

1. Use `docs/audits/YYYY-MM-DD-topic-audit.md`.
2. Use the structure from `templates/docs/audits/_template.md`; do not write free-form persistent audit reports.
3. Keep it evidence-based: scope, questions, fact sources, findings, severity, verification, open questions, and closeout.
4. Include frontmatter with `artifact_type`, `status`, `created`, `updated`, `scope`, and `source_of_truth`.
5. Set `artifact_type: audit` and `status: active` for newly created audit files.
6. Give every finding a stable `ID`, `Severity`, `Status`, `Evidence`, `Owner Plan`, `Branch/Commit`,
   `Verification`, and `Closeout` field.
7. Use only these finding statuses: `open`, `planned`, `resolved`, and `verified`.
8. Start actionable findings as `open`; use `planned` only after an owner plan exists.
9. Use `resolved` only when the finding has a concrete closeout reason in `Closeout`, such as
   `fixed`, `accepted_risk`, `wont_fix`, or `not_reproducible`.
10. Do not mark the audit `archived`; audit closeout belongs to the `/dev-distill` skill after all findings are
   closed or transferred.
11. Confirm the file exists after writing it.
12. Run `git status --short --branch --untracked-files=all`.
13. If the file is not visible because `.gitignore` excludes it, either add the smallest safe allow rule or report that the audit is not tracked and ask before changing ignore policy.

## Document Routing

| Output | Destination | Rule |
|---|---|---|
| Audit report | `docs/audits/YYYY-MM-DD-topic-audit.md` | Create when the persistent audit rule applies. |
| Current module facts discovered during audit | `docs/capabilities/*.md` | Do not write directly unless the user asked for doc fixes; otherwise recommend the `/dev-distill` skill. |
| Fix plan | `docs/plans/YYYY-MM-DD-short-topic.md` | Use the `/dev-plan` skill when findings need implementation. |
| Decision | `docs/adr/YYYY-MM-DD-short-title.md` | Use only when the ADR gate passes. |
| Executable rule | tests | Prefer tests for regression-prone rules. |

## Workflow

1. Confirm audit frame:
   - Scope: feature, module, docs system, data flow, algorithm, UI flow, or tests.
   - Questions to answer.
   - Non-goals.

2. Decide audit persistence:
   - If the persistent audit rule applies, set `persistent_audit: yes`.
   - If the audit can stay in conversation, set `persistent_audit: no` and explain why it is small enough.
   - If creating a persistent audit, use `docs/audits/YYYY-MM-DD-topic-audit.md`.
   - If a relevant active audit already exists, update it instead of creating a duplicate.

3. Run the orient gate:
   - Read only task-relevant capability docs and code entry points.
   - Do not read `docs/plans/`, old `docs/audits/`, or archived files unless the user asks for historical comparison.
   - Report the key context sources used.

4. Inspect fact sources:
   - Code and tests are the final source of truth.
   - Capability docs explain current intended behavior.
   - ADRs explain hard-to-reverse decisions.
   - Runtime checks or targeted tests should confirm risky claims when practical.

5. Report findings:
   - Lead with findings, ordered by severity.
   - Assign each persistent finding a stable ID that future plans and branches can reference.
   - Include a finding status for persistent reports; use `open` for work that still needs routing or fixes.
   - Include file paths, functions, APIs, routes, tables, or commands as evidence.
   - Separate confirmed issues from risks and open questions.
   - State what was not verified.

6. Route artifacts:
   - Persistent audit: write to `docs/audits/YYYY-MM-DD-topic-audit.md` when required.
   - Chat-only audit: summarize findings in the response when the audit is small enough.
   - Never store the report under `docs/capabilities/`.
   - If findings imply a hard-to-reverse decision, fact-source change, architecture choice,
     algorithm policy, or cross-module rule, flag that the `/dev-distill` skill must run the ADR gate.

7. Verify audit file when created:
   - Confirm the path exists.
   - Run `git status --short --branch --untracked-files=all`.
   - Report whether git sees the file.
   - If ignored, add a minimal allow rule only when safe; otherwise ask the user.

8. Close the loop:
   - If fixes are needed, recommend the `/dev-plan` skill.
   - If a plan is created from the audit later, it must reference `source_audit` and `covered_findings`.
   - If fixes are likely to change durable facts or lifecycle artifacts, note that the `/dev-branch` skill should run distill and check gates before review.
   - After implementation or doc correction, recommend the `/dev-check` skill.

## Output Template

Use `templates/output.md` for the final response shape.
## Next-Step Prompt

End with one of these:

- "Audit is small enough to stay in conversation; use the `/dev-check` skill if routing needs verification."
- "Persistent audit report created and git visibility checked; next step is the `/dev-plan` skill for fixes or the `/dev-branch` skill if implementation is already clear."
- "Audit file is ignored by git; fix tracking before follow-up work or confirm that the audit should remain untracked."
- "Audit found issues that need fixes; use the `/dev-plan` skill to turn them into verifiable steps."
- "Audit produced only stable documentation facts; use the `/dev-branch` skill if changes are needed, otherwise use the `/dev-check` skill to confirm routing remains clean."
- "Audit found no follow-up work; use the `/dev-check` skill to confirm routing remains clean."
