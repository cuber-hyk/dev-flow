---
artifact_type: plan
status: draft
created: 2026-06-08
updated: 2026-06-08
owner: codex
---

# Dev Flow Brainstorm And Subagent Optimization Plan

## Goal

Add the missing upstream brainstorming capability and strengthen delivery review with subagent-aware gates, while preserving Dev Flow's core identity: low-noise orientation, explicit planning, bounded audits, reviewed branch work, changelog/distill/check closeout, and no automatic push.

## Background

The current Dev Flow lifecycle is strong after a task is already clear:

```text
dev-orient -> dev-plan / dev-audit -> dev-branch -> dev-changelog / dev-distill / dev-check -> review
```

The current gap is before and during delivery:

- Before planning: fuzzy ideas may enter `dev-plan` too early, forcing the agent to either ask ad hoc questions or silently make product/architecture choices.
- During delivery: `dev-branch` has gates, but review independence can be improved by a subagent-backed or explicitly simulated review pass.

Superpowers is a useful reference, but Dev Flow should not become a clone of Superpowers. Dev Flow should absorb the useful principles: hard gates, lifecycle routing, independent review, and validation, while keeping its simpler and documentation-aware workflow.

## Non-Goals

- Do not copy Superpowers' complete `subagent-driven-development` workflow in the first iteration.
- Do not introduce visual companion/server infrastructure.
- Do not create heavy new persistent document types unless the value is proven.
- Do not add compatibility fallbacks for multiple old workflow modes.
- Do not weaken existing Dev Flow rules around git push, status/diff review, changelog, distill, and check gates.

## Recommended Priority

| Priority | Work Item | Recommendation | Reason |
|---|---|---|---|
| P0 | Add `dev-brainstorm` | Do first | Fills the biggest upstream gap: fuzzy user intent before planning. |
| P1 | Add subagent-aware review gate inside `dev-branch` | Do second | Improves delivery quality without adding a full execution framework. |
| P2 | Extract reusable `dev-subagent-review` | Do after P1 stabilizes | Avoid premature abstraction; extract only once the gate proves useful. |
| P3 | Add `dev-subagent-branch` | Defer | High complexity; requires stronger plan format and subagent assumptions. |
| P4 | Add visual brainstorming companion | Defer indefinitely | Outside Dev Flow's current core identity. |

## Phase P0: Add `dev-brainstorm`

### Purpose

Create a front-door skill for turning fuzzy ideas into plan-ready task intent.

```text
fuzzy idea -> dev-brainstorm -> confirmed intent and decisions -> dev-plan / dev-audit / dev-orient
```

### Trigger Conditions

Use `dev-brainstorm` when:

- The user describes a new feature, workflow, product idea, architecture direction, or behavior change in fuzzy terms.
- Multiple reasonable approaches exist and the choice affects user experience, business meaning, data ownership, state lifecycle, or long-term architecture.
- Entering `dev-plan` immediately would require the agent to silently choose product or architecture decisions.
- The user asks to explore options, compare approaches, or refine an idea before planning.

### Boundary

`dev-brainstorm` does:

- Read minimal repository context needed to understand the idea.
- Ask concise clarifying questions.
- Identify goals, non-goals, constraints, and decision points.
- Offer 2-3 approaches with tradeoffs and a recommendation.
- Confirm decisions before routing to `dev-plan`, `dev-audit`, `dev-orient`, or more brainstorming.

`dev-brainstorm` does not:

- Write implementation code.
- Write an executable plan.
- Perform an audit.
- Create changelog/distill/check artifacts.
- Force every tiny idea into a persistent document.

### Output Shape

For chat-only brainstorming:

```md
Brainstorm readiness: ready / blocked

Goal:
- ...

Non-goals:
- ...

Known facts:
- ...

Decision points:
1. Question:
   - Recommendation:
   - Alternatives:
   - Impact:
   - Needs user confirmation:

Confirmed decisions:
- ...

Next step:
- dev-plan / dev-audit / dev-orient / continue brainstorming
```

### Persistence Rule

Initial recommendation: do not add `docs/briefs/` yet.

Use conversation output by default. Let `dev-plan` absorb confirmed decisions into its `Assumptions And Decisions` section when creating a persistent plan.

Revisit `docs/briefs/` only if repeated multi-turn brainstorming sessions need durable capture before planning.

### Implementation Tasks

1. Add `skills/dev-brainstorm/SKILL.md`.
   - Verification: file exists and frontmatter has `name: dev-brainstorm`.

2. Add `skills/dev-brainstorm/templates/output.md`.
   - Verification: template includes readiness, goal, non-goals, decision points, confirmed decisions, and next step.

3. Add `commands/dev-brainstorm.md`.
   - Verification: command routes to the `dev-brainstorm` skill.

4. Update `bin/dev-flow.js`.
   - Add `dev-brainstorm` to `skillNames`.
   - Ensure `npm run validate` requires its command, skill, OpenAI metadata, and template.
   - Verification: `npm run validate` passes.

5. Add `skills/dev-brainstorm/agents/openai.yaml`.
   - Use `interface.display_name` with the existing `Cuberhyk Dev Flow:` prefix.
   - Verification: existing metadata prefix validation passes.

6. Update plugin manifests and docs.
   - `.codex-plugin/plugin.json`
   - `.claude-plugin/plugin.json`
   - `.cursor-plugin/plugin.json`
   - `README.md`
   - `CLAUDE.md`
   - `GEMINI.md`
   - docs site pages if maintained manually.
   - Verification: docs mention `dev-brainstorm` as the route before `dev-plan` for fuzzy ideas.

7. Add prompt-level verification examples.
   - Fuzzy feature request should not jump into implementation.
   - Multi-route decision should produce options and request confirmation.
   - Clear small task may route directly to `dev-plan`.

## Phase P1: Add Subagent-Aware Review Gate To `dev-branch`

### Purpose

Strengthen `dev-branch` before the final review output by adding an independent review pass.

This should be a branch delivery gate, not a full subagent implementation system.

### Review Scope

The review gate should check:

- Plan compliance: did the implementation follow the plan?
- Audit finding coverage: if the branch comes from an audit, were relevant findings addressed?
- Related changes only: are there unrelated edits in the worktree?
- Verification evidence: were commands run and read?
- Changelog gate: is a release note needed?
- Distill gate: did stable knowledge change?
- Check gate: did docs/lifecycle structure need validation?
- Review readiness: are status and diff ready to show to the user?

### Subagent Behavior

If subagents are available:

```text
Dispatch a focused reviewer with:
- task goal
- plan/audit source if any
- git status
- git diff summary or commit range
- verification output
- expected gate output shape
```

If subagents are not available:

```text
Run the same review pass explicitly in the current agent context and label it as simulated/manual review.
```

This keeps the workflow usable across Codex surfaces without introducing multiple implementation paths.

### Output Shape

Add to `dev-branch` before approval output:

```md
Subagent review gate:
- Mode: subagent / manual
- Plan compliance: pass/fail/not applicable
- Audit coverage: pass/fail/not applicable
- Related changes only: pass/fail
- Verification evidence: pass/fail
- Changelog gate: needed/not needed - reason
- Distill gate: needed/not needed - reason
- Check gate: needed/not needed - reason
- Blocking issues:
  - ...
```

### Implementation Tasks

1. Update `skills/dev-branch/SKILL.md`.
   - Add review gate before final user approval.
   - Verification: skill explicitly says no commit/merge/push before review gate and user approval.

2. Update `skills/dev-branch/templates/output.md`.
   - Add `Subagent review gate` section.
   - Verification: template includes mode, compliance, coverage, related changes, verification, changelog, distill, check, blockers.

3. Update docs.
   - `README.md`
   - `CLAUDE.md`
   - `GEMINI.md`
   - docs site pages if needed.
   - Verification: workflow diagram/text mentions review-backed branch gate.

4. Add validation if practical.
   - Check template contains `Subagent review gate`.
   - Verification: `npm run validate` fails if the section is missing.

5. Test with scenarios.
   - Branch with plan source.
   - Branch with audit source.
   - Branch with unrelated dirty files.
   - Docs-changing branch that needs distill/check.

## Phase P2: Extract `dev-subagent-review`

### When To Do This

Only extract after P1 has been used enough to show repeated review logic.

Do not create this skill just because subagent review sounds clean. Extraction is justified when:

- `dev-branch` review gate grows too large.
- The same review logic is needed by `dev-plan` or `dev-audit`.
- Users explicitly ask for standalone review.

### Initial Scope

First version should support only:

```text
dev-subagent-review branch
```

Do not immediately add plan-review and audit-review profiles unless needed.

### Boundary

`dev-subagent-review` does:

- Review artifacts and diffs.
- Report pass/fail/not applicable gates.
- Identify blockers.
- Recommend whether `dev-branch` can proceed to approval output.

It does not:

- Implement fixes.
- Rewrite plans or audits.
- Run changelog/distill/check itself.
- Commit, merge, or push.

## Phase P3: Consider `dev-subagent-branch`

### Recommendation

Defer.

This is the equivalent of Superpowers' full subagent-driven development. It can be valuable, but it changes Dev Flow from lifecycle guidance into autonomous execution orchestration.

### Prerequisites

Do not start this phase until:

- `dev-plan` reliably produces small executable task tables.
- P1 review gate has proven useful.
- P2 standalone review exists or is clearly unnecessary.
- At least three real tasks show that subagent execution would reduce user burden without increasing drift.

### Possible Future Shape

```text
dev-plan -> dev-subagent-branch
  -> implementer per task
  -> plan compliance review
  -> code quality review
  -> verification
  -> changelog/distill/check
  -> review approval
```

## Phase P4: Visual Brainstorming

### Recommendation

Do not implement now.

Superpowers' visual companion is useful for UI-heavy design work, but Dev Flow's current identity is process, context, and documentation lifecycle. Adding browser/server state would increase maintenance cost and cross-platform complexity.

Revisit only if Dev Flow explicitly expands into UI/product design collaboration.

## Cross-Cutting Rules

### Documentation

Avoid double-track docs. When a new workflow is accepted, update docs to describe the current recommended route directly.

### Validation

Every new required skill should be visible to `npm run validate`.

Prefer script checks for:

- Required skill files.
- Required templates.
- OpenAI metadata prefix.
- Required template sections.
- Lifecycle status values.

### Git Safety

Do not change the existing push rule:

```text
Never push directly. Show status and diff, then wait for explicit approval.
```

### Skill Description Style

Descriptions should describe trigger conditions only.

Do not summarize the whole workflow in metadata, because agents may treat the description as enough and skip the skill body.

## Suggested Release Scope

### Release 0.8 Candidate

Include:

- `dev-brainstorm`
- `dev-branch` review gate
- validate updates
- docs updates

Exclude:

- `dev-subagent-review`
- `dev-subagent-branch`
- visual companion

### Acceptance Criteria

The release is successful when this flow works:

```text
fuzzy user idea
-> dev-brainstorm clarifies goal and decisions
-> dev-plan creates a single-route verifiable plan
-> dev-branch implements
-> review gate checks plan/audit/docs/git/verification
-> changelog/distill/check gates run or explain not needed
-> status + diff are shown for user approval
```

## Open Decisions

1. Should `dev-brainstorm` ever write a persistent artifact in the first version?
   - Recommendation: no; keep chat-only and let `dev-plan` persist confirmed decisions.

2. Should subagent review be mandatory in `dev-branch`?
   - Recommendation: the review gate is mandatory, but actual subagent dispatch is conditional on platform support. Manual/simulated review is acceptable.

3. Should the standalone skill be named `dev-subagent-review` or `dev-review`?
   - Recommendation: defer naming until P2. If extracted, prefer `dev-subagent-review` only if subagent behavior is central; otherwise `dev-review` is cleaner.

## Verification Plan

Run after P0/P1 implementation:

```powershell
npm run validate
npm run validate-docs
```

Manual prompt checks:

1. Fuzzy idea:
   - Expected: `dev-brainstorm` asks clarifying questions and does not write code.

2. Multi-option architecture request:
   - Expected: `dev-brainstorm` presents options and requests confirmation before `dev-plan`.

3. Clear plan execution:
   - Expected: `dev-branch` includes review gate before approval output.

4. Dirty worktree:
   - Expected: review gate identifies unrelated changes or asks user how to proceed.

5. Docs-changing branch:
   - Expected: changelog/distill/check gates are evaluated before final review.
