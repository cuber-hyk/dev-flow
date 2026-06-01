---
description: Initialize Dev Flow docs and templates
argument-hint: [project-dir or setup request]
---

# /dev-init

Use the `dev-init` skill for this request.

Task:

```text
$ARGUMENTS
```

Required behavior:

1. Target the current repository when no project directory is provided.
2. Create only missing Dev Flow memory files and directories.
3. Use `cuberhyk-dev-flow init-project [project-dir]` when a stable file creation mechanism is available.
4. Do not overwrite existing `AGENTS.md`; append the marked Dev Flow section only when it is absent.
5. End by recommending `/dev-check`.
