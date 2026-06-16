---
name: dev-brainstorm
description: Refine fuzzy ideas before planning. Use when the user wants to explore a feature, workflow change, product direction, UI direction, or architecture option; compare approaches; clarify goals and non-goals; or surface product, data, state, UX, or architecture decisions that should not be chosen silently.
---

# Dev Brainstorm

Use this skill to turn an unclear idea into a plan-ready task frame.

Core principle:

> Brainstorming confirms intent and decisions; it does not create an executable plan.

## Boundary

Dev Brainstorm does:

- Enter only enough repository context to understand the idea.
- Clarify user intent, goals, non-goals, constraints, and success signals.
- Identify product, business, data, lifecycle, user-experience, and architecture decisions before planning.
- For UI discussions, identify whether the result confirms a reusable project-level design rule.
- Offer 2 to 3 approaches with tradeoffs and a recommendation when multiple routes are reasonable.
- Ask concise questions when decisions cannot be inferred from code facts.
- Route the result to `/dev-plan`, `/dev-audit`, `/dev-orient`, `/dev-exploratory-review`, or continued brainstorming.

Dev Brainstorm does not:

- Write implementation code.
- Create an executable plan; use the `/dev-plan` skill after decisions are confirmed.
- Produce audit findings; use the `/dev-audit` or `/dev-exploratory-review` skill.
- Create changelog, distill, check, branch, or lifecycle artifacts.
- Persist every idea as a document.
- Hide unresolved decisions as assumptions.

## When To Use

Use Dev Brainstorm when:

- The user describes a feature, workflow, product idea, behavior change, or architecture direction in fuzzy terms.
- The user asks to explore, compare, refine, or think through an idea before planning.
- Multiple reasonable routes exist and the choice changes user experience, business semantics, data meaning, state lifecycle, or long-term architecture.
- A direct `/dev-plan` run would require the agent to silently decide product or architecture choices.
- The likely next step is unclear between plan, audit, exploratory review, or context-only orientation.

Do not use Dev Brainstorm when:

- The task goal, scope, route, and validation are already clear enough for `/dev-plan`.
- The user asks for a bounded review or findings; use `/dev-audit`.
- The problem location is unknown and the agent must map risks and verify failures; use `/dev-exploratory-review`.
- The user asks to implement an approved plan; use `/dev-branch`.

## Orient Gate

Before asking detailed questions, load only low-noise context:

1. Read repository instructions such as `AGENTS.md`, `CLAUDE.md`, or equivalent guidance.
2. Read `CONTEXT.md` when present for stable vocabulary.
3. Read `docs/ai/context-map.md` when present to identify relevant capability docs and code entry points.
4. Read only capability docs, code, routes, schemas, tests, or configs needed to understand the idea.
5. Avoid old plans, old audits, archived files, generated output, and broad repository browsing.

If the repository has no Dev Flow memory structure and the idea is likely to become persistent work,
recommend the `/dev-init` skill before long-lived planning.

## Idea Readiness Gate

Before routing to `/dev-plan`, confirm:

- Goal is understandable in one sentence.
- Non-goals are clear enough to prevent drift.
- Known facts are separated from recommendations.
- Critical decisions are confirmed or explicitly listed as open.
- The next skill is clear.

If critical decisions remain unresolved, stop with a decision request. Do not route to `/dev-plan` as
if the route were confirmed.

## Decision Point Rule

Call out a decision point when any of these are true:

- Multiple reasonable approaches exist.
- The choice affects user experience or visible workflow.
- The choice affects business semantics.
- The choice affects data meaning, source of truth, ownership, or migration policy.
- The choice affects state transitions or lifecycle rules.
- The choice changes long-term architecture direction.
- The choice changes user habits.
- The choice may need an ADR later.

For each decision point, state:

- Question.
- Recommendation.
- Alternatives.
- Tradeoffs.
- What code/docs imply.
- What needs user confirmation.
- ADR gate: needed/not needed/maybe.

## Approach Exploration

When multiple routes are possible:

1. Present 2 to 3 approaches.
2. Lead with the recommended option.
3. Explain tradeoffs in terms of scope, risk, validation, maintainability, and user impact.
4. Avoid open-ended option trees once the user confirms a route.
5. Keep the final route single and plan-ready.

## Persistence Rule

Default: keep brainstorm output in conversation.

Do not create `docs/briefs/` in the first version of this workflow. Confirmed decisions that need
persistence should be absorbed by `/dev-plan` under `Assumptions And Decisions` when a persistent
plan is created.

If the user explicitly asks for a written brainstorm, write it to the user-specified path. If no path
is specified and the content is temporary, prefer `temp/plans/`.

## Document Routing

| Output | Destination | Rule |
|---|---|---|
| Brainstorm summary | Conversation by default | Use when the idea can proceed directly to the next skill. |
| Temporary brainstorm document | `temp/plans/` | Use when the user asks for a written long-form plan or brainstorm without requesting a persistent Dev Flow artifact. |
| Task plan | `docs/plans/YYYY-MM-DD-short-topic.md` | Use `/dev-plan` only after decisions are confirmed. |
| Audit report | `docs/audits/YYYY-MM-DD-topic-audit.md` | Use `/dev-audit`; do not write findings from this skill. |
| ADR | `docs/adr/YYYY-MM-DD-short-title.md` | Recommend only when the confirmed decision is hard to reverse or long-lived. |
| Confirmed project-level UI rule | `DESIGN.md` through `/dev-design-system` | Route after the user approves a representative UI or reusable pattern. |

## Workflow

1. Confirm the task frame:
   - Idea type: feature, workflow, product direction, architecture option, docs/process change, or unclear.
   - Goal in one sentence if possible.
   - Non-goals when scope could drift.

2. Run the orient gate:
   - Load only stable guidance and relevant context.
   - Report the context used.

3. Identify decision points:
   - Separate facts from recommendations.
   - Ask for user confirmation when code facts cannot decide.
   - Prefer one concise question when a single answer unblocks the route.

4. Explore approaches when needed:
   - Give 2 to 3 routes.
   - Recommend one route.
   - State tradeoffs and validation implications.

5. Confirm brainstorm readiness:
   - Ready: decisions are confirmed and the next skill is clear.
   - Blocked: user decision is needed.
   - Continue: the idea still needs more clarification.

6. Route next step:
   - `/dev-design-system` when the user has approved an initial UI direction or a reusable UI rule.
   - `/dev-plan` when the task is ready for a verifiable plan.
   - `/dev-audit` when the user wants bounded findings.
   - `/dev-exploratory-review` when the problem location is unknown.
   - `/dev-orient` when the user only needs context.
   - Continue brainstorming when key intent remains unclear.

## Output Template

Use `templates/output.md` for the final response shape.

## Next-Step Prompt

End with one of these:

- "Brainstorm readiness passed; use the `/dev-plan` skill to create the executable plan."
- "Brainstorming is blocked by decisions; confirm the listed choices, then I will route this to `/dev-plan`."
- "This is review work; use the `/dev-audit` or `/dev-exploratory-review` skill instead of planning."
- "Context is still insufficient; continue brainstorming with the listed question."
