---
name: dev-branch
description: Run a development task inside an isolated Git branch with changelog, distill, and review gates. Use when the user asks to create a task branch, use branch-task, isolate implementation work, perform a planned task safely, or wants Codex/Claude to implement changes but only commit/merge after explicit approval. Handles Git repository detection, main branch selection, dirty worktree classification, task branch creation, implementation, verification, changelog decisions, durable knowledge distillation, status/diff review, user approval gate, commit, merge, and cleanup. Allows clearly related Dev Flow plan/audit artifacts to move onto the task branch, but must stop for unrelated existing changes. Never push automatically.
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
- Run meaningful verification.
- Run the changelog gate and use the `/dev-changelog` skill when release notes are needed.
- Run the distill gate and use the `/dev-distill` skill when durable repository knowledge, ADRs, lifecycle
  closure, or documentation routing changed.
- Run the check gate before review when changelog, distill, documentation routing, lifecycle
  artifacts, capability docs, ADRs, context-map, or templates changed.
- Show `git status --short --branch` and `git diff` before any commit.
- Wait for explicit user approval before commit, merge, or cleanup.
- Commit, merge back to main, and delete the task branch only after approval.
- Recommend the `/dev-check` skill after merge when documentation or lifecycle artifacts changed.

Dev Branch does not:

- Replace the `/dev-orient` or `/dev-plan` skills for unclear non-trivial tasks.
- Hide unresolved product, data, state, cleanup, or architecture decisions.
- Mix unrelated source/config/test/generated changes into the task branch.
- Commit, merge, delete a branch, or push before the review gate passes.
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
| Unrelated or ambiguous changes | Source code, config, dependencies, tests, generated files, unrelated docs, unknown user edits | Stop, show status/diff, and ask the user whether to keep, commit elsewhere, stash, discard, or include them. |
| Clean worktree | No changes | Continue. |

If a plan file was created by the `/dev-plan` skill before the `/dev-branch` skill, it may remain uncommitted and move
onto the task branch. Do not commit it early.

## Plan And Decision Gate

Before implementation, decide whether planning is needed:

- If the task is small, explicit, and low-risk, proceed after basic orientation.
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
   - Run `git status --short --branch --untracked-files=all` and `git diff`.

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
   - Use the `/dev-plan` skill first if the task is not plan-ready.
   - Make the smallest necessary implementation changes.
   - Keep existing code style.
   - Avoid unrelated refactors or compatibility fallback paths.

6. Verify:
   - Run the smallest meaningful tests, type checks, builds, or manual checks for the change.
   - If verification cannot be run, state why.

7. Changelog gate:
   - Decide whether the change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
   - If yes, use the `/dev-changelog` skill rules to update `CHANGELOG.md` under `## [Unreleased]`.
   - If no, report `Changelog gate: not needed` with a concrete reason.
   - If the changelog decision is blocked, stop before the review gate.
   - Do not write changelog entries for pure internal refactors, formatting, test-only changes, or tiny invisible tweaks.

8. Distill gate:
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

9. Check gate:
   - Run this gate before review when changelog, distill, documentation routing, lifecycle
     artifacts, capability docs, ADRs, context-map, templates, or validation rules changed.
   - Use the `/dev-check` skill rules or `cuberhyk-dev-flow validate-docs <project>` to verify routing and lifecycle health.
   - If no docs or lifecycle artifacts changed, report `Check gate: not needed` with a concrete reason.
   - If validation reports errors or lifecycle/routing blockers, stop before the review gate.

10. Review gate:
   - Run `git status --short --branch --untracked-files=all`.
   - Run `git diff`.
   - Summarize changed files, verification, changelog gate, distill gate, and check gate.
   - Stop and wait for explicit user approval.

11. After explicit approval only:
   - Stage only task-related files.
   - Commit with a concise message.
   - Switch back to the main branch.
   - Merge the task branch.
   - Confirm merged status.
   - Delete the task branch.
   - Do not push unless the user separately asks and confirms.

12. Close:
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
