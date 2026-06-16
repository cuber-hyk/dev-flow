---
name: dev-design-system
description: Maintain a project's durable UI design system contract. Use after the user confirms an initial UI direction, when UI work establishes or changes reusable design rules, components, interaction patterns, tokens, layout rules, or UI code rules, or when checking implementation against DESIGN.md, design tokens, and shared components. Do not invent unconfirmed future UI scenarios.
---

# Dev Design System

Use this skill to keep a project's UI design rules executable, current, and useful to coding agents.

Core principle:

> `DESIGN.md` records confirmed UI intent and reuse rules; design tokens and shared components make
> those rules executable.

## Modes

- `initialize`: after the user approves an initial representative UI, create the first `DESIGN.md`
  and `design-tokens.json`.
- `update`: after a UI task confirms a reusable rule, update the current contract in place.
- `check`: compare a UI change against the contract, tokens, shared components, and named sources.

## Boundary

Dev Design System does:

- Read confirmed UI discussion, representative UI, existing tokens, shared components, stories, and
  UI-specific code rules.
- Separate confirmed rules from provisional rules and known gaps.
- Define when a shared component or interaction pattern must be reused.
- Keep exact foundation values in `design-tokens.json` and reference them from `DESIGN.md`.
- Record source paths for tokens, components, examples, and visual verification.
- Update current rules in place and remove stale rules.
- Check whether new UI reuses an existing semantic pattern before creating another implementation.

Dev Design System does not:

- Invent rules for UI scenarios that have not appeared or been confirmed.
- Treat every local UI choice as a project-wide rule.
- Replace task-level UI discussion, implementation plans, Storybook, tests, or component code.
- Duplicate component APIs or all token values in `DESIGN.md`.
- Maintain old and new design rules in parallel.

## Authority Model

| Concern | Source of truth |
|---|---|
| Design intent, usage rules, semantic patterns, prohibited variants | `DESIGN.md` |
| Exact colors, dimensions, typography, shadows, and motion values | `design-tokens.json` |
| Component structure, variants, and behavior | shared component code |
| Visual states and examples | Storybook, previews, screenshots, or visual tests |
| Runtime result | application code |

When sources disagree, report the conflict. Do not silently choose a new rule.

## Initialization Gate

Initialize only when:

- The product direction is known.
- The user has reviewed and approved a representative UI or an equivalent concrete visual direction.
- Confirmed UI decisions can be separated from guesses.

During initialization:

1. Read the approved UI discussion, PRD when relevant, representative UI, and existing implementation.
2. Extract only confirmed foundations, layout rules, components, interaction patterns, UI code rules,
   accessibility requirements, and prohibited patterns.
3. Put exact values in `design-tokens.json`.
4. Put intent, usage, reuse, and source routing in `DESIGN.md`.
5. Put uncertain but already-used rules under `Provisional Rules`.
6. Put unseen scenarios under `Known Gaps`; do not design them.
7. Ask for user review before treating the initial contract as confirmed.

## Update Gate

Update the design system when a UI task:

- Adds or changes a reusable foundation token.
- Establishes or changes a shared layout rule.
- Adds or changes a shared component variant.
- Confirms a reusable semantic interaction pattern.
- Changes UI implementation rules or accessibility requirements.

Do not update it for a page-local arrangement that has no reusable meaning.

Before creating a new component or pattern:

1. Search `DESIGN.md`, `design-tokens.json`, shared components, stories, and relevant UI code.
2. Decide whether an existing component or semantic pattern applies.
3. If it applies, reuse it.
4. If it does not apply, decide whether the new solution is local or reusable.
5. Require user confirmation before promoting a meaningful new design rule.

## Semantic Reuse Rule

Reuse is based on meaning and behavior, not only visual similarity.

For example, leaving an unfinished learning session and leaving an unfinished review session should
reuse one exit-session confirmation pattern, while allowing different copy and callbacks.

## Check Gate

For a UI change, verify:

- Applicable `DESIGN.md` rules were read.
- Existing semantic patterns and shared components were searched before adding new ones.
- Components use tokens instead of unexplained raw values when a token exists.
- New reusable rules are documented; local exceptions are not promoted without reason.
- Paths named in `DESIGN.md` exist.
- `design-tokens.json` is valid JSON and token entries use `$type` and `$value`.
- Visual, responsive, interaction, and accessibility checks appropriate to the task were run.

## Document Routing

| Information | Destination |
|---|---|
| Confirmed UI intent, layout, reuse, interaction, and UI code rules | `DESIGN.md` |
| Exact foundation values | `design-tokens.json` |
| Component behavior and variants | shared component code |
| Visual examples and states | Storybook, previews, screenshots, or visual tests |
| Hard-to-reverse project-wide UI decision | `docs/adr/` when the ADR gate passes |
| Task implementation sequence | `docs/plans/` through `dev-plan` |

## Workflow

1. Detect mode: initialize, update, or check.
2. Load only UI-relevant confirmed context and source files.
3. Identify applicable existing rules, reusable patterns, and gaps.
4. Separate confirmed rules, provisional rules, local choices, and unknown scenarios.
5. Create or update the smallest useful contract.
6. Validate JSON, referenced paths, reuse decisions, and appropriate UI checks.
7. Report changed rules, sources, unresolved conflicts, and the next Dev Flow step.

## Output Template

Use `templates/output.md`.

## Next-Step Prompt

End with one of these:

- "Initial design contract is ready for user review; confirm it before using `/dev-plan` for implementation."
- "Design system update is complete; continue the `/dev-branch` review gates."
- "Design system check found conflicts; resolve them before the review gate."
- "No reusable UI rule changed; no design system update is needed."
