# Dev Branch Output Template

## Before Approval

```md
Branch: task/YYYYMMDD-short-task-slug

Existing changes before branch:
- <clean/related Dev Flow artifacts/unrelated changes handled>

Changes made:
- <file or behavior changed>

Verification:
- <command/check/result>

Changelog:
- Updated CHANGELOG.md under [Unreleased] -> Added/Changed/Deprecated/Removed/Fixed/Security
- or Not needed: <concrete reason>

Distill:
- Updated <CONTEXT/capability/ADR/context-map/tests/lifecycle artifact>
- or Not needed: <concrete reason>

Review:
- git status --short --branch --untracked-files=all: <summary>
- git diff: shown above/summarized

Waiting for approval:
- Say "审核通过" or "可以合并" to let me commit, merge, and clean up.
- Push will not be performed unless separately requested and confirmed.
```

## After Merge

```md
Merged into: <main branch>
Commit: <hash>
Task branch deleted: yes/no
Push: not performed
Current status: clean/<status>
Next step: dev-check/none
```
