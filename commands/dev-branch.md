---
description: Run a task in a reviewed Git branch
argument-hint: task description
---

# /dev-branch

Use the `dev-branch` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Inspect Git repository state and classify existing changes before creating a branch.
2. Allow only clearly related Dev Flow plan/audit artifacts to move onto the task branch.
3. Stop for unrelated or ambiguous existing changes and ask the user how to handle them.
4. Create `task/YYYYMMDD-short-task-slug` from the detected main branch.
5. Implement and verify the task with the smallest safe change.
6. Run the changelog gate: update `CHANGELOG.md` only when the change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
7. Run the distill gate before review: update durable repository knowledge, ADRs, context-map, tests, or plan/audit lifecycle artifacts when the task outcome requires it.
8. Run the check gate before review when changelog, distill, docs routing, lifecycle artifacts, ADRs, context-map, capability docs, templates, or validation rules changed.
9. Stop before review if changelog, distill, or check is blocked.
10. Run the mandatory independent review gate in subagent mode when a focused read-only reviewer is available and useful; otherwise run the same gate in manual mode.
11. Independently verify subagent findings and stop if any review blocker remains.
12. Show `git status --short --branch --untracked-files=all` and `git diff`.
13. Wait for explicit approval before commit, merge, or branch cleanup.
14. Never push automatically.
15. Follow the skill's `templates/output.md` final response shape.
