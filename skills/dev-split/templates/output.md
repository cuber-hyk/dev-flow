# Dev Split Output Template

## Classification

```md
Dev Split: classified

Target:
- <file/module/scope>

Structural question:
- <what boundary or growth risk is being evaluated>

Scan:
- Command: <command or not run with reason>
- Candidate signal: <large file/block result or none>
- Note: line count is a triage signal, not a split rule

Context read:
- <exports/callers/tests/docs>

Classification:
- Result: no split/local cleanup/defer/proposed split
- Reason: <why this result fits>

Code-placement constraints:
- New behavior owner: <path/module>
- Do not add behavior to: <path/module or none>
- Side effects owner: <path/module or none>
- State owner: <path/module or none>
- Test owner: <test path/type>
- Shared module allowed: yes/no; reason
- Miscellaneous bucket risk: pass/fail; reason

Owner module review:
| Module | Owner responsibility | May depend on | Must not own |
|---|---|---|---|
| <path> | <responsibility> | <allowed dependency> | <non-responsibility> |

Facade check:
- <stable entry point / not applicable / risk>

Verification:
- <commands/checks/manual verification>

Lifecycle:
- Plan closeout: needed/not needed/maybe; reason
- Capability/context-map update: needed/not needed/maybe; reason
- ADR gate: needed/not needed/maybe; reason
- Check gate: needed/not needed/maybe; reason

Next step:
- <dev-plan/dev-branch/user approval/direct implementation>
```

## Deferred

```md
Dev Split: deferred

Target:
- <file/module/scope>

Why not split now:
- <reason>

Future trigger:
- <event/fact/test/ownership decision that should reopen the split>

Non-goal:
- <what should not be pursued, such as line-count reduction>

Guardrail for current task:
- <where new code should or should not go>
- Do not add to: <path or none>

Next step:
- <dev-plan/direct implementation with guardrail>
```

## Split Proposal

```md
Dev Split: proposed split

Target files:
- <path>

Current entry points:
- <exports/API/routes/tests>

Responsibilities and side effects:
- <responsibility/state/API/database/filesystem/browser side effect>

Proposed boundary:
- <boundary name and rationale>

Code placement policy:
- New behavior owner: <path/module>
- Do not add to: <path/module>
- Shared module allowed: yes/no; reason
- Miscellaneous bucket risk: pass/fail; reason

Expected file changes:
- Add: <files or none>
- Move: <files or none>
- Modify: <files or none>

Owner module review:
| Module | Owner responsibility | May depend on | Must not own |
|---|---|---|---|
| <path> | <responsibility> | <allowed dependency> | <non-responsibility> |

API impact:
- <stable/changed with approval needed>

Verification:
- <commands/checks>

Lifecycle:
- <plan/audit/capability/context-map/ADR/check needs>

Approval gate:
- Wait for explicit user approval before modifying target code.
```

## Blocked

```md
Dev Split: blocked

Target:
- <file/module/scope>

Blocked by:
- <ownership/state/API/architecture/test decision>

Decision needed:
- <question>

Recommendation:
- <recommended route and reason>

After confirmation:
- <what Dev Split can classify or propose>
```
