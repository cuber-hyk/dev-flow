---
name: dev-exploratory-review
description: Perform open-ended, scope-aware, risk-driven review of an existing project when the user does not know where problems may be. Use when asked to inspect a whole project, module, feature, flow, branch, or directory for realistic bugs, correctness issues, data integrity problems, security risks, race conditions, performance regressions, or user-visible failures. Build a project map and risk map, run or write focused probes/tests when useful, validate findings across multiple review passes, and report only issues with realistic failure scenarios. Do not implement fixes or report style, naming, formatting, or subjective preferences.
---

# Dev Exploratory Review

Use this skill to discover unknown project risks through a map-first, evidence-gated review.

## Boundary

Dev Exploratory Review does:

- Understand an existing project or user-provided scope before judging code.
- Divide the project or scope into modules, features, flows, entry points, data stores, side effects, and contracts.
- Build a risk map across correctness, data integrity, security, user-visible failures, concurrency, performance, and maintainability risks that can lead to realistic failure.
- Run existing tests, build commands, or focused runtime checks when practical.
- Create temporary probe tests or scripts when they are the simplest way to verify a suspected failure.
- Use a four-pass review harness for non-trivial work.
- Report findings only when a realistic scenario can fail.
- Recommend `dev-plan` for fixes and `dev-branch` for reviewed implementation.

Dev Exploratory Review does not:

- Implement fixes.
- Make style, naming, formatting, or subjective preference comments.
- Treat theoretical suspicion as a finding without a credible failure path.
- Browse the whole repository endlessly when the user supplied a narrower scope.
- Preserve temporary probe tests unless they are intentionally promoted to follow-up work.
- Replace `dev-audit` for bounded audits that already have clear questions.

## Scope Handling

This skill is open-ended about the problem, not necessarily unbounded about the search area.

Supported scopes:

- `repository-wide`: no scope is supplied; review the current project as a whole.
- `path-bounded`: directories or files such as `backend/auth` or `src/importer.ts`.
- `feature-bounded`: features such as authentication, plugin loading, or collection management.
- `flow-bounded`: business/data flows such as delete, rename, migrate, import, export, or publish.
- `change-bounded`: current branch, staged changes, recent edits, or a commit range.
- `doc-bounded`: documentation routing, capability docs, ADRs, plans, audits, or context maps.

For a user-provided scope:

1. Treat the named paths, modules, features, routes, commands, flows, or changes as the review boundary.
2. Build a local map inside that boundary first.
3. Expand outside the boundary only for direct contracts: callers, callees, schemas, migrations, tests, configuration, permissions, persistence, caches, files, external APIs, background jobs, or generated side effects.
4. Report every expansion and why it was necessary.
5. Keep unrelated areas out of scope.

If no scope is provided, start repository-wide but prioritize high-risk modules instead of reading every file equally.

## Orient Gate

Before reviewing, load only enough context to understand the project:

1. Read repository instructions such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or equivalent guidance.
2. Read `README`, package/config files, test configuration, and lockfiles only as needed to identify stack, entry points, and commands.
3. Read `CONTEXT.md` and `docs/ai/context-map.md` when present.
4. Read relevant capability docs, ADRs, schemas, routes, services, command handlers, tests, migrations, and configuration.
5. Avoid generated files, dependency folders, build output, archived docs, and old plans/audits unless the review specifically targets them.

If the project has git, use `git status --short --branch --untracked-files=all` to understand local state. Git is helpful but not required.

## Evidence Standard

Report an issue only when all are true:

- There is a realistic trigger path in this project.
- The failure result is concrete: wrong data, broken user flow, security exposure, crash, lost side effect, stale state, race, excessive cost, or maintainability risk likely to cause a real future defect.
- The evidence is grounded in code, tests, configuration, schema, commands, runtime output, or a minimal reproduction.
- Existing guards, schemas, caller constraints, or documented invariants do not already prevent the failure.
- The issue is not style, naming, formatting, or subjective preference.

Use these evidence labels:

- `Confirmed`: reproduced by a test, command, runtime check, or direct deterministic proof.
- `Strong`: code path and trigger conditions are clear, but no runtime reproduction was practical.
- `Risk`: plausible but not proven; keep out of main findings unless the user asked for risk inventory.

## Four-Pass Harness

For small reviews, run these passes in one agent sequentially.

For non-trivial reviews or when the harness supports subagents, use four role passes. Read `references/agent-roles.md` for detailed role prompts when dispatching or simulating the passes.

1. `Project Mapper`
   - Build the project/scope map.
   - Divide modules, flows, contracts, and side effects.
   - Identify test/build commands and high-risk surfaces.
   - Produce initial review questions and candidate probes.

2. `Risk Prober`
   - Use the map to inspect correctness, data integrity, boundaries, exceptional paths, and user-visible failures.
   - Run existing tests or focused commands when practical.
   - Create temporary probe tests/scripts only when they verify a concrete suspicion.
   - Output candidate findings with scenarios and evidence.

3. `Adversarial Verifier`
   - Verify or reject prior candidate findings.
   - Look for guards, caller constraints, schema constraints, transaction boundaries, permissions, retries, idempotency, cleanup, and integration contracts.
   - Continue searching security, concurrency, performance, and integration risks not covered by earlier passes.

4. `Judge`
   - Merge duplicates.
   - Remove findings without realistic failure scenarios.
   - Separate confirmed issues, strong evidence issues, rejected candidates, and not-verified areas.
   - Order findings by severity and user/business impact.

Do not let later passes restart from scratch. They should validate, extend, and challenge the existing map.

## Probe And Test Policy

- Prefer existing project test commands first.
- Write focused probe tests or scripts only when they reduce uncertainty about a realistic failure.
- Keep probe edits minimal and directly tied to the suspected issue.
- Clearly state whether probes were temporary, left in the tree, or should be promoted to regression tests during a later fix.
- Do not change business logic while reviewing.
- If probe files remain, report their paths and git visibility.

## Persistent Report Rule

Small, low-risk exploratory reviews may stay in conversation.

Create or update `docs/audits/YYYY-MM-DD-topic-exploratory-review.md` when any of these are true:

- The user asks for a report, written review, checklist, or findings document.
- The review is repository-wide, cross-module, data-related, security-sensitive, correctness-sensitive, or multi-pass.
- Findings need follow-up planning, implementation, distillation, or archival.
- Probe tests/scripts were created and should be traceable.
- Repository workflow requires persistent audit/review artifacts.

If `docs/audits/` is missing and a persistent report is required, recommend or run `dev-init` when appropriate before writing the report.

When creating a report:

1. Include frontmatter with `artifact_type`, `status`, `created`, `updated`, `scope`, and `source_of_truth`.
2. Include project map, risk map, passes, findings, rejected candidates, verification, not-verified areas, and next steps.
3. Confirm the file exists.
4. Run `git status --short --branch --untracked-files=all`.
5. Report whether git sees the file.

## Output Shape

Use concise Markdown:

```md
Review mode: dev-exploratory-review
Review scope:
- Type: repository-wide | path-bounded | feature-bounded | flow-bounded | change-bounded | doc-bounded
- Boundary: ...
- Expansions: ...

Persistent report: yes/no
Report file: docs/audits/YYYY-MM-DD-topic-exploratory-review.md or none

Conclusion: ...

Context loaded:
- ...

Project map:
- ...

Risk map:
- ...

Passes:
- Project Mapper: ...
- Risk Prober: ...
- Adversarial Verifier: ...
- Judge: ...

Findings:
- [P1/P2/P3, evidence label, category] Finding
  Scenario:
  Evidence:
  Verification:
  Impact:
  Fix direction:

Rejected candidates:
- Candidate: ...
  Reason:

Tests/probes:
- ...

Not verified:
- ...

Artifact routing:
- Fixes: dev-plan
- Implementation: dev-branch
- Stable knowledge / ADR gate: needed/not needed/maybe; reason

Git visibility:
- ...

Next step: ...
```

## Next-Step Prompt

End with one of these:

- `Exploratory review found confirmed issues; use dev-plan to turn them into verifiable fix steps.`
- `Exploratory review found only strong unconfirmed risks; use dev-plan if you want to validate and fix them.`
- `Exploratory review found no realistic failures in the reviewed scope; use dev-check if routing needs verification.`
- `Persistent exploratory review report created and git visibility checked; next step is dev-plan for fixes or dev-branch if implementation is already clear.`
- `Probe artifacts remain in the worktree; decide whether to keep them as regression tests before implementation.`
