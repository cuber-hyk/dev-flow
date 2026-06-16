---
name: dev-branch
description: Execute a clear or planned development task in an isolated Git branch with verification and review gates. Use when the user wants implementation work, task-branch isolation, reviewed commit/merge flow, or explicit approval before commit or merge. Also applies when related plan or audit artifacts should move with the task. Never push automatically.
---

# Dev Branch

Use this skill to execute a task in an isolated Git workflow with an explicit review gate.

Core principle:

> The branch must contain only explainable task changes. Changelog and distillation happen before
> review so one approved diff contains the full task outcome.

## Boundary

Dev Branch does:

- Inspect Git repository state before changing branches.
- Identify the main branch: remote default first, then local `main`, then local `master`.
- Classify existing uncommitted changes before creating a task branch.
- Allow clearly related Dev Flow artifacts to move onto the task branch.
- Stop for unrelated or ambiguous existing changes and ask the user how to handle them.
- Create a task branch.
- Implement the requested task when the route is clear.
- During implementation, autonomously delegate focused worker subagents when the task can be split
  into clear, non-overlapping ownership scopes.
- Run meaningful verification.
- Run the Design System Gate for UI tasks before changelog and distill gates.
- Run the changelog gate and use the `/dev-changelog` skill when release notes are needed.
- Run the distill gate and use the `/dev-distill` skill when durable repository knowledge, ADRs, lifecycle
  closure, or documentation routing changed.
- Run the check gate before review when changelog, distill, documentation routing, lifecycle
  artifacts, capability docs, ADRs, context-map, or templates changed.
- Run an independent review pass. The agent is authorized to autonomously choose subagent mode when
  a focused read-only reviewer is useful and safe; otherwise run the same gate in manual mode.
- Run `git status --short --branch --untracked-files=all` and inspect the diff before any commit.
  Summarize changed files and key diffs instead of printing the full diff by default.
- Wait for explicit user approval before commit, merge, or cleanup.
- Commit, merge back to main, and delete the task branch only after approval.
- Recommend the `/dev-check` skill after merge when documentation or lifecycle artifacts changed.

Dev Branch does not:

- Replace the `/dev-orient` or `/dev-plan` skills for unclear non-trivial tasks.
- Hide unresolved product, data, state, cleanup, or architecture decisions.
- Mix unrelated source/config/test/generated changes into the task branch.
- Commit, merge, delete a branch, or push before the review gate passes.
- Delegate commits, merges, branch cleanup, or push to any subagent.
- Let worker subagents edit outside their assigned ownership scope or revert changes made by others.
- Let reviewer subagents implement fixes or edit files.
- Run `git push` unless the user separately asks and confirms push.
- Write noisy changelog entries for tiny internal-only changes.
- Leave durable knowledge distillation for a separate post-merge change when it belongs to the same
  task outcome.
- Revert user changes unless the user explicitly asks.

## Dirty Worktree Rule

Do not require a perfectly clean worktree. Require an attributable worktree.

Before creating the task branch, run:

```bash
git rev-parse --is-inside-work-tree
git status --short --branch --untracked-files=all
git diff
```

Classify existing changes:

| Class | Examples | Action |
|---|---|---|
| Dev Flow task artifacts | `docs/plans/*.md`, `docs/audits/*.md`, `docs/ai/context-map.md`, `CONTEXT.md`, Dev Flow section in `AGENTS.md` | Allow if clearly related to this task. These move onto the task branch and remain part of review. |
| Unrelated or ambiguous changes | Source code, config, dependencies, tests, generated files, unrelated docs, unknown user edits | Stop, show status and a concise diff summary, then ask the user whether to keep, commit elsewhere, stash, discard, or include them. |
| Clean worktree | No changes | Continue. |

If a plan file was created by the `/dev-plan` skill before the `/dev-branch` skill, it may remain uncommitted and move
onto the task branch. Do not commit it early.

## Plan And Decision Gate

Before implementation, decide whether planning is needed:

- If the task is small, explicit, and low-risk, proceed after basic orientation.
- If the task is fuzzy or route selection is still needed, use or recommend the `/dev-brainstorm` skill.
- If the task is non-trivial, cross-module, correctness-sensitive, or already has a persistent plan, use or recommend the `/dev-plan` skill.
- If unresolved decisions exist, stop and ask the user. Do not create an executable branch plan from unresolved choices.
- If a persistent plan exists, read only the active plan for this task and verify it is plan-ready.

## Branch Naming

Use:

```text
task/YYYYMMDD-short-task-slug
```

Examples:

```text
task/20260530-fix-dark-theme
task/20260530-add-review-stats
```

If the task cannot produce a clear slug, ask for a branch name.

## Main Branch Detection

Prefer:

1. Remote default branch from `git symbolic-ref refs/remotes/origin/HEAD`.
2. Local `main`.
3. Local `master`.

If none can be detected reliably, ask the user.

## Workflow

1. Clarify task input:
   - If empty, ask what task to run.
   - If multiple interpretations exist, list the decision points and ask before proceeding.

2. Inspect repository:
   - Run `git rev-parse --is-inside-work-tree`.
   - If not a Git repository, stop and explain that the `/dev-branch` skill requires Git. Recommend initializing a repository only if the user asks.
   - Run `git status --short --branch --untracked-files=all` and inspect `git diff`.
   - Do not print the full diff by default; summarize changed files and relevant diff themes.

3. Classify existing changes:
   - If only related Dev Flow artifacts exist, continue.
   - If unrelated or ambiguous changes exist, show them and ask the user how to handle them.
   - Do not stash, commit, discard, or include unrelated changes silently.

4. Prepare branch:
   - Detect the main branch.
   - Create the task branch from the main branch.
   - If related uncommitted Dev Flow artifacts existed, confirm they are now on the task branch.

5. Execute task:
   - Use the `/dev-orient` skill first if context is not loaded.
   - Use the `/dev-brainstorm` skill first if the task is fuzzy or the route is not confirmed.
   - Use the `/dev-plan` skill first if the task is not plan-ready.
   - Decide whether implementation should use worker subagents.
   - The agent is authorized to choose worker subagent delegation autonomously without asking the user again.
   - Use worker subagents when all are true:
     - the task can be split into clear, non-overlapping ownership scopes;
     - each worker has a concrete objective, write scope, and verification expectation;
     - parallel work materially helps the task;
     - the main agent can inspect, integrate, and verify all worker outputs.
   - Do not delegate implementation when the task is small, tightly coupled, urgently blocking, or likely to create merge conflicts.
   - Tell workers they are not alone in the codebase, must not revert others' edits, and must adapt to existing changes.
   - Workers may edit only within their assigned ownership scope.
   - Workers must not commit, merge, delete branches, clean up unrelated lifecycle artifacts, or push.
   - Make the smallest necessary implementation changes.
   - Keep existing code style.
   - Avoid unrelated refactors or compatibility fallback paths.

6. Verify:
   - Run the smallest meaningful tests, type checks, builds, or manual checks for the change.
   - If verification cannot be run, state why.

7. Design System Gate:
   - Run for page, component, styling, layout, interaction, or other UI tasks.
   - Read applicable `DESIGN.md` rules and search shared components and semantic interaction patterns.
   - Reuse an existing applicable pattern; do not create a page-specific equivalent only because copy differs.
   - Use `/dev-design-system` update mode when the task confirms or changes a reusable project-level rule.
   - Use `/dev-design-system` check mode to verify rule, token, component, responsive, visual, and accessibility compliance.
   - If no reusable rule changed, report `Design system gate: not needed` with a concrete reason.
   - If a design decision or contract conflict remains unresolved, stop before review.

8. Changelog gate:
   - Decide whether the change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
   - If yes, use the `/dev-changelog` skill rules to update `CHANGELOG.md` under `## [Unreleased]`.
   - If no, report `Changelog gate: not needed` with a concrete reason.
   - If the changelog decision is blocked, stop before the review gate.
   - Do not write changelog entries for pure internal refactors, formatting, test-only changes, or tiny invisible tweaks.

9. Distill gate:
   - Decide whether this task changed durable knowledge:
     - domain vocabulary;
     - feature behavior or public workflow;
     - module ownership, source of truth, API, schema, state, lifecycle, or algorithm policy;
     - important hard-to-reverse decisions that need the ADR gate;
     - plan or audit artifacts that should be archived or deleted;
     - context-map routing, AGENTS/CLAUDE guidance, or validation rules;
     - regression-prone rules that should become tests.
   - If yes, use the `/dev-distill` skill rules now, before the review gate.
   - If no, report `Distill gate: not needed` with a concrete reason.
   - If the `/dev-distill` skill reports blocked lifecycle closeout, unresolved audit findings, missing ADR/test
     follow-up, or routing inconsistency, stop before the review gate.
   - Close or route active plan/audit artifacts as part of the same branch when they belong to this task.
   - Do not defer same-task knowledge updates until after commit unless the user explicitly asks.

10. Check gate:
   - Run this gate before review when changelog, distill, documentation routing, lifecycle
     artifacts, capability docs, ADRs, context-map, templates, or validation rules changed.
   - Use the `/dev-check` skill rules or `cuberhyk-dev-flow validate-docs <project>` to verify routing and lifecycle health.
   - If no docs or lifecycle artifacts changed, report `Check gate: not needed` with a concrete reason.
   - If validation reports errors or lifecycle/routing blockers, stop before the review gate.

11. Independent review gate:
   - This gate is mandatory. The agent is authorized to choose the review mode autonomously without
     asking the user again.
   - Choose exactly one mode:
     - `subagent`: use when the implementation is non-trivial or benefits from independent review,
       and a focused reviewer can work read-only without shared writes.
     - `manual`: use when the task is too small to justify dispatch or independent read-only review
       cannot be safely delegated.
   - Do not dispatch a subagent merely because one is available. Dispatch when all are true:
     - the review scope and pass/fail criteria are explicit;
     - the reviewer does not need to modify files or make unresolved product/architecture decisions;
     - the main agent can verify every finding against the repository, diff, and command output;
     - dispatch provides meaningful independence or context relief.
   - Provide a subagent reviewer with:
     - task goal and confirmed route;
     - active plan or audit source when applicable;
     - `git status --short --branch --untracked-files=all`;
     - changed files and diff summary, plus full diff only when line-level review is necessary;
     - verification commands and observed results;
     - the required review output fields below.
   - The review pass must report:
     - mode: `subagent` or `manual`;
     - plan compliance: `pass`, `fail`, or `not applicable`;
     - audit coverage: `pass`, `fail`, or `not applicable`;
     - related changes only: `pass` or `fail`;
     - verification evidence: `pass` or `fail`;
     - changelog, distill, and check gate results with reasons;
     - blocking issues.
   - The main agent owns the result:
     - independently verify subagent findings and inspect the final diff;
     - reject unsupported findings;
     - fix or route confirmed blocking issues, then rerun the review gate;
     - never treat a subagent statement as verification evidence by itself.
   - Stop before approval when any required result is `fail` or blocking issues remain.

12. Approval review output:
   - Run `git status --short --branch --untracked-files=all`.
   - Inspect `git diff`.
   - Summarize changed files, key diff themes, verification, changelog gate, distill gate, check gate,
     and the independent review gate.
   - Do not print the full diff by default.
   - Print the full diff only when the user asks, the diff is small, or line-level review is necessary.
   - Stop and wait for explicit user approval.

13. After explicit approval only:
   - Stage only task-related files.
   - Commit with a concise message.
   - Switch back to the main branch.
   - Merge the task branch.
   - Confirm merged status.
   - Delete the task branch.
   - Do not push unless the user separately asks and confirms.

14. Close:
   - Recommend the `/dev-check` skill after documentation/lifecycle changes.

## Approval Language

Treat these as approval to commit and merge:

- `审核通过`
- `同意提交`
- `可以提交`
- `可以合并`
- `approve`
- `approved`

Approval to commit/merge is not approval to push. Push requires a separate explicit request and confirmation.

## Output Template

Use `templates/output.md` for the final response shape.

Use the `Before Approval` section before commit/merge approval. Use the `After Merge` section only after the approved commit, merge, and branch cleanup have completed.
