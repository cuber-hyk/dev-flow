---
description: Update or prepare CHANGELOG.md
argument-hint: change summary or release version
---

# /dev-changelog

Use the `dev-changelog` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Decide whether the change affects users, operators, public behavior, data, security, install, config, compatibility, or release notes.
2. If yes, update `CHANGELOG.md` under `## [Unreleased]` using Keep a Changelog categories.
3. If no, report `Changelog: not needed` with a concrete reason.
4. When preparing a release, move `Unreleased` entries to `## [VERSION] - YYYY-MM-DD` and create a fresh `Unreleased`.
5. Do not dump git commits into the changelog.
