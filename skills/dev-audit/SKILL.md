---
name: dev-audit
description: Create a structured audit or review report for a repository feature, module, workflow, or documentation system. Use when the user asks to audit, review, inspect correctness, evaluate completeness, find risks, produce findings, or invokes dev-audit. Small audits may stay in conversation. Create or update docs/audits for explicit audit reports, repository workflow requirements, non-trivial/cross-module/correctness-sensitive audits, or findings that need follow-up. Recommend dev-plan for fixes and dev-distill for stable knowledge. Do not implement fixes, create feature plans, or write capability documentation.
---

# Dev Audit

Use this skill to perform a bounded audit and route findings correctly.

## Boundary

Dev Audit does:

- Define audit scope, questions, fact sources, and verification.
- Inspect relevant code, tests, capability docs, ADRs, and runtime behavior.
- Produce findings ordered by severity with evidence.
- Decide whether the audit can stay in conversation or must be written to `docs/audits/`.
- Create or update a persistent audit report under `docs/audits/` when the persistence rule applies.
- Verify that any created audit file exists and is visible to git.
- Recommend `dev-plan` for fixes and `dev-distill` after fixes or knowledge updates.

Dev Audit does not:

- Implement fixes.
- Create feature plans; use `dev-plan`.
- Put findings into `docs/capabilities/`.
- Archive/delete audits after findings are handled; use `dev-distill`.
- Treat old plans or audits as current truth.

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

If a persistent audit is required and `docs/audits/` is missing, recommend or run `dev-init` when appropriate, then create the audit. If initialization is not allowed, report that the persistent audit cannot be written.

When creating an audit file:

1. Use `docs/audits/YYYY-MM-DD-topic-audit.md`.
2. Keep it evidence-based: scope, questions, fact sources, findings, severity, verification, open questions, and closeout.
3. Include frontmatter with `artifact_type`, `status`, `created`, `updated`, `scope`, and `source_of_truth`.
4. Confirm the file exists after writing it.
5. Run `git status --short --branch --untracked-files=all`.
6. If the file is not visible because `.gitignore` excludes it, either add the smallest safe allow rule or report that the audit is not tracked and ask before changing ignore policy.

## Document Routing

| Output | Destination | Rule |
|---|---|---|
| Audit report | `docs/audits/YYYY-MM-DD-topic-audit.md` | Create when the persistent audit rule applies. |
| Current module facts discovered during audit | `docs/capabilities/*.md` | Do not write directly unless the user asked for doc fixes; otherwise recommend `dev-distill`. |
| Fix plan | `docs/plans/YYYY-MM-DD-short-topic.md` | Use `dev-plan` when findings need implementation. |
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

3. Enter context:
   - Use `dev-orient` first if repository context is not already loaded.
   - Read only task-relevant capability docs and code entry points.
   - Do not read `docs/plans/`, old `docs/audits/`, or archived files unless the user asks for historical comparison.

4. Inspect fact sources:
   - Code and tests are the final source of truth.
   - Capability docs explain current intended behavior.
   - ADRs explain hard-to-reverse decisions.
   - Runtime checks or targeted tests should confirm risky claims when practical.

5. Report findings:
   - Lead with findings, ordered by severity.
   - Include file paths, functions, APIs, routes, tables, or commands as evidence.
   - Separate confirmed issues from risks and open questions.
   - State what was not verified.

6. Route artifacts:
   - Persistent audit: write to `docs/audits/YYYY-MM-DD-topic-audit.md` when required.
   - Chat-only audit: summarize findings in the response when the audit is small enough.
   - Never store the report under `docs/capabilities/`.

7. Verify audit file when created:
   - Confirm the path exists.
   - Run `git status --short --branch --untracked-files=all`.
   - Report whether git sees the file.
   - If ignored, add a minimal allow rule only when safe; otherwise ask the user.

8. Close the loop:
   - If fixes are needed, recommend `dev-plan`.
   - After implementation or doc correction, recommend `dev-distill`.
   - After distillation, recommend `dev-check`.

## Output Shape

Use concise Markdown:

```md
Audit scope: ...

Persistent audit: yes/no
Audit file: docs/audits/YYYY-MM-DD-topic-audit.md or none

Conclusion: ...

Findings:
- [Severity] Finding - evidence

Verification:
- ...

Artifact routing:
- ...

Git visibility:
- ...

Next step: ...
```

## Next-Step Prompt

End with one of these:

- `Audit is small enough to stay in conversation; use dev-check if routing needs verification.`
- `Persistent audit report created and git visibility checked; next step is dev-plan for fixes or dev-distill for stable knowledge.`
- `Audit file is ignored by git; fix tracking before follow-up work or confirm that the audit should remain untracked.`
- `Audit found issues that need fixes; use dev-plan to turn them into verifiable steps.`
- `Audit produced only stable documentation facts; use dev-distill to update capability docs, ADRs, or tests and close the audit.`
- `Audit found no follow-up work; use dev-check to confirm routing remains clean.`
