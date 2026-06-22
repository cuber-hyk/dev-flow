---
name: dev-split
description: Evaluate and govern large-file, module-boundary, and code-organization risk before planning or implementation. Use when a task may touch large files, add substantial logic to an existing module, change ownership boundaries, split code, modularize code, or needs rules to prevent new large files. Produces no implementation by default; it classifies no split, local cleanup, defer, or proposed split, and gives coding constraints for dev-plan/dev-branch.
---

# Dev Split

Use this skill to keep code organization deliberate when a task may grow large files or blur module boundaries.

Core principle:

> Line count is only a candidate signal. The real decision is whether module boundaries, ownership,
> readability, verification, and change isolation improve.

## Boundary

Dev Split does:

- Scan for candidate large files and large top-level blocks.
- Inspect only the smallest relevant set of files, callers, exports, tests, and capability docs.
- Classify each target as `no split`, `local cleanup`, `defer`, or `proposed split`.
- Define code and module placement constraints that prevent new large files.
- Identify owner modules, facade responsibilities, state ownership, side effects, and testing boundaries.
- Produce split guidance that `/dev-plan` can embed into a plan and `/dev-branch` can execute.
- Route lifecycle closeout when split work produces plan, audit, capability, context-map, or ADR changes.

Dev Split does not:

- Implement code by default.
- Split files before the user approves the proposed split route.
- Treat line count as a target or success metric.
- Create `utils`, `helpers`, `common`, `misc`, `part1`, or mechanical chunks.
- Replace `/dev-plan` for sequencing or `/dev-branch` for implementation.
- Archive or distill final knowledge; use `/dev-distill` for lifecycle closeout.

## Trigger Rules

Use Dev Split before or during `/dev-plan` when any of these are true:

- The task mentions large files, splitting, modularization, refactor, file size, code organization, or module boundaries.
- A planned change would add substantial behavior to an already large or high-churn file.
- The task touches state ownership, side effects, routing, database access, UI regions, services, parsers, or tests in a way that may blur responsibilities.
- The plan needs guidance on where new code should live so it does not accumulate in a central file.
- Existing candidates appear in scan output and are directly relevant to the task.

Use Dev Split during `/dev-branch` only when implementation reveals a new large-file or ownership risk that was not known during planning. In that case, stop broad edits, run Dev Split, then update or confirm the plan route.

## Workflow

1. Define the structural question:
   - Target files or modules.
   - Requested behavior or planned change.
   - Why large-file or boundary risk may matter.
   - Non-goal, especially if line count reduction is not the goal.

2. Scan candidates:
   - Prefer this skill's bundled script at `scripts/check_large_code_files.py`, resolved relative to this `SKILL.md`.
   - Run it from the repository root or the narrow target directory.
   - Treat output as triage only.

3. Read before judging:
   - Read exports, direct callers, direct tests, shared utilities, and relevant capability docs.
   - Do not read unrelated old plans, old audits, archived files, generated output, or the whole repository by default.
   - If patterns conflict, choose the more recent or better-tested pattern and flag the other for future cleanup.

4. Classify:
   - `no split`: the file is cohesive or splitting would raise risk.
   - `local cleanup`: small in-place organization reduces immediate cost without new modules.
   - `defer`: splitting may be right later, but not under current facts.
   - `proposed split`: a clear owner boundary exists and verification can prove behavior unchanged.

5. Define code placement constraints:
   - Name where new behavior should be written.
   - Name where it must not be added.
   - Identify the owner module for each new or changed responsibility.
   - State whether a facade remains a stable entry point or whether it risks becoming a glue center.
   - State whether tests should move with owner modules or remain as integration tests.

6. For `defer`, record all of:
   - Why not split now.
   - Future trigger for reevaluation.
   - Non-goal, such as "do not pursue line-count reduction as the target".
   - Any guardrail that keeps the current task from making the future split harder.

7. For `proposed split`, write a split proposal and stop for approval before code edits:
   - Target files.
   - Current entry points and API stability expectations.
   - Responsibilities, shared state, and side effects.
   - Proposed owner modules and file names.
   - Expected imports/exports direction.
   - Files expected to be added, moved, or changed.
   - Test and build verification.
   - Lifecycle closeout needs.

8. Close the Dev Split pass:
   - Provide the classification and coding constraints.
   - Say whether `/dev-plan` should embed the result.
   - Say whether `/dev-branch` can execute directly after plan approval.
   - Say whether `/dev-distill` or `/dev-check` will be needed after implementation.

## Classification Rules

### No Split

Choose `no split` when:

- The target has a single cohesive responsibility.
- It is a state machine, protocol map, generated file, schema, migration, constant table, or strong sequential algorithm.
- Splitting would introduce cycles, parameter tunneling, duplicate state, or a new coordination center.
- The current task is narrow and structural work would expand risk.

Output the reason and any coding constraint needed to prevent the file from growing further.

### Local Cleanup

Choose `local cleanup` when:

- A small in-place move, naming correction, or local helper extraction reduces immediate cost.
- A new module would be premature.
- The cleanup can be verified with the same tests as the main task.

Do not turn local cleanup into broad refactoring.

### Defer

Choose `defer` when:

- A future split is plausible, but current ownership, behavior boundaries, or tests are not clear enough.
- Splitting now would require unresolved product, state, data, or architecture decisions.
- The candidate is large but currently cohesive, and the planned change does not cross a clear new boundary.

Every defer result must include the future trigger and the non-goal.

### Proposed Split

Choose `proposed split` only when all are true:

- The split boundary is clear and can be named by responsibility, business capability, flow stage, technical layer, UI region, or state owner.
- Dependency direction becomes clearer.
- The split reduces understanding, modification, testing, or conflict cost.
- The external API can stay stable or the API change is explicitly approved.
- Verification can prove behavior did not change.

If the split creates four or more related helper files, prefer a same-name directory unless the repository already has a stronger feature-directory convention.

## Coding Constraints

When the task adds code, always answer:

- Which existing file or new module owns the new behavior?
- Which file should not receive more behavior?
- Is a new module justified now, or should the change stay local?
- What imports are allowed across the boundary?
- Where do side effects live?
- Where does shared state live?
- What test owns the behavior?

Avoid:

- New generic shared modules for one consumer.
- Facades that become new coordination centers.
- Compatibility branches for old and new structures without a current business need.
- Mechanical line-count redistribution.
- Moving code without a verification route.

## Code Placement Policy

Use this policy to prevent miscellaneous code files from forming during planning and implementation.

- New files must be named by business capability, workflow stage, technical layer, UI region, state owner, or another concrete responsibility.
- Every new module must have exactly one owner responsibility.
- Do not create a generic bucket first and let later edits fill it.
- Do not create `utils`, `helpers`, `common`, `misc`, `shared`, or similar modules unless the repository already has that convention and the new item has multiple real consumers.
- A shared module is allowed only when at least two current consumers need the same behavior, or when an existing repository convention already owns that category.
- If a helper has one consumer, keep it near that consumer or inside the owner module.
- If a facade exists, keep it as a stable entry point; do not move new behavior there merely because it is easy to import.
- Split guidance or plans for risky files must include `Do not add to: <path>` when a file should not receive more behavior.
- When no clear owner exists, stop and classify the task as blocked or defer instead of creating a miscellaneous module.
- Tests should follow behavior ownership. Do not create test helper buckets unless multiple tests already use or will immediately use the helper.

## Owner Module Review

Before finishing any proposed split or split-aware plan, list each new or changed module:

| Module | Owner responsibility | May depend on | Must not own |
|---|---|---|---|
| `<path>` | `<single responsibility>` | `<allowed dependencies>` | `<explicit non-responsibility>` |

Confirm:

- Every new file has one clear responsibility.
- There is no generic module created only to hold shared code.
- The facade remains an entry point, not a new glue center.
- Tests align with behavior boundaries rather than current implementation trivia.

## Branch Guidance

For complex split work:

- Prefer one task branch per ownership boundary.
- Each branch should move one responsibility boundary.
- Merge or review one boundary before starting the next.
- Move plan, audit, capability, and context-map updates with the branch that owns them.
- Do not leave plan or audit artifacts active after the split work completes unless a concrete follow-up remains.

## Lifecycle Closeout

When split work is implemented:

- If a plan drove the work, `/dev-distill` must archive, delete, or explicitly keep it active with a reason.
- If an audit drove the work, `/dev-distill` must run the audit closeout gate.
- If module ownership, entry points, capability docs, context-map routing, or ADR-worthy architecture changed, `/dev-distill` must update the durable artifact before review.
- If docs or lifecycle artifacts changed, `/dev-check` must validate routing and lifecycle health.

## Script Usage

Run from the repository root, resolving the script relative to this skill directory:

```powershell
python skills/dev-split/scripts/check_large_code_files.py --root .
```

Scan a narrow directory:

```powershell
python skills/dev-split/scripts/check_large_code_files.py --root src
```

Output JSON:

```powershell
python skills/dev-split/scripts/check_large_code_files.py --root . --json
```

Adjust the candidate threshold:

```powershell
python skills/dev-split/scripts/check_large_code_files.py --root . --max-lines 900
```

Default extensions cover common source files. Markdown, JSON, YAML, XML, HTML, CSS, and SCSS are excluded by default because they are often configuration, markup, or generated content. Include them only when the task explicitly needs that:

```powershell
python skills/dev-split/scripts/check_large_code_files.py --root . --extensions .md,.json,.yaml,.yml,.html,.css,.scss
```

For split patterns, read `references/splitting-patterns.md` only after a candidate enters manual judgment.

## Output Template

Use `templates/output.md` for the final response shape.

## Next-Step Prompt

End with one of these:

- "Dev Split classified the target; embed these coding constraints in `/dev-plan` before implementation."
- "Split proposal is ready; wait for user approval before `/dev-branch` implements it."
- "No split is recommended; continue with `/dev-plan` or direct implementation using the listed code-placement constraints."
- "Split decision is blocked; confirm the listed ownership, state, or architecture decision before planning."
