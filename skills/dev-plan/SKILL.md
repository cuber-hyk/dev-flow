---
name: dev-plan
description: Create a minimal, verifiable development plan after repository orientation. Use for non-trivial bug fixes, features, refactors, docs work, tests, audit follow-up, reviewable branch work, or explicit dev-plan requests when goals, scope, decisions, and validation need to be confirmed before implementation. Ask for user confirmation when product, data, state, cleanup, UX, or architecture decisions are unresolved.
---
# Dev Plan

Use this skill to enter the relevant project context, then turn the task or audit findings into a
confirmed, verifiable execution plan.

## Language Policy

- Default to Chinese for user-facing replies and documents created by this workflow.
- Follow an explicit user language request or a documented existing repository language convention instead.
- Keep code, commands, APIs, identifiers, paths, configuration keys, and required schema/status values in English.

Core principle:

> Plan files are for confirmed execution routes, not unresolved product or architecture disagreements.

## Boundary

Dev Plan does:

- Run a low-noise orientation gate before planning unless the same context was already loaded in this turn.
- Confirm whether the task is ready to plan.
- Identify decision points before writing a formal plan.
- Separate code facts, engineering recommendations, and product/business decisions.
- Ask the user to decide when a decision cannot be derived from code facts.
- Convert confirmed decisions into a verifiable goal, scope, steps, risks, validation, and acceptance criteria.
- Decide whether the plan can stay in conversation or must be written to `docs/plans/`.
- Create or update a persistent plan under `docs/plans/` only when the task is plan-ready and the persistence rule applies.
- Verify that any created plan file exists and is visible to git.
- Recommend whether implementation can start directly or should use the `/dev-branch` skill.
- Use or recommend `/dev-split` when planning reveals large-file, module-boundary, or code-placement risk.

Dev Plan does not:

- Replace the standalone `/dev-orient` skill for context-only sessions or deep repository mapping.
- Refine fuzzy ideas or compare early approaches; use the `/dev-brainstorm` skill before planning.
- Read broad unrelated context, old plans, old audits, or archived files by default.
- Perform audits or write findings; use the `/dev-audit` skill.
- Perform large-file or module-boundary evaluation; use the `/dev-split` skill and embed its result.
- Edit implementation code.
- Store plans, audits, or findings in `docs/capabilities/`.
- Hide product or business decisions as assumptions.
- Create an executable plan while critical decisions are still unresolved.
- Archive final knowledge; the `/dev-branch` skill runs changelog, distill, and check gates before review, or use the `/dev-distill` skill standalone for knowledge-only closeout.

## Orient Gate

The `/dev-plan` skill includes the practical subset of the `/dev-orient` skill so users do not have to run two commands for normal planning.

Before the plan readiness gate, do this:

1. Read repository instructions such as `AGENTS.md`, `CLAUDE.md`, or equivalent agent guidance.
2. Read `CONTEXT.md` when present to learn stable vocabulary.
3. Read `docs/ai/context-map.md` when present to identify relevant capability docs and code entry points.
4. Read only task-relevant `docs/capabilities/*.md`.
5. Inspect only the code, tests, routes, schemas, or configs needed to understand the task.
6. Identify likely artifact destinations: plan, audit, capability, ADR, changelog, tests, or none.
7. For UI tasks, read `DESIGN.md` when present and inspect relevant tokens, shared components, and examples.

Do not read these by default:

- `docs/plans/` except the active plan for this exact task.
- `docs/audits/` except the active audit that directly produced this planning task.
- `archived/` directories.
- Generated files, build output, dependency folders, or unrelated historical notes.

If the repository has no Dev Flow structure, recommend the `/dev-init` skill before creating persistent artifacts.

If orientation reveals that the task is actually a fuzzy idea, recommend the `/dev-brainstorm` skill before forcing a plan.

If orientation reveals that the task is actually an audit, recommend the
`/dev-audit` skill instead of forcing a plan.

If orientation reveals large-file, module-boundary, or code-placement risk, use or recommend the
`/dev-split` skill before writing the executable plan. Examples include:

- The task touches an already large or high-churn file.
- The task may add substantial behavior to a central module.
- The task changes ownership boundaries, shared state, side effects, routing, services, or tests.
- The user mentions splitting, modularization, refactor, file size, code organization, or avoiding large files.

Do not recreate `/dev-split` logic inside the plan. Bring its classification, owner modules,
code-placement constraints, defer conditions, verification, and lifecycle notes into the plan.

## Plan Readiness Gate

Before writing a formal plan, check whether the route is confirmed.

Plan readiness requires:

- Goal is clear.
- Scope and non-goals are clear enough to prevent drift.
- Relevant source of truth is known or discoverable from code/docs.
- No critical decision point is unresolved.
- Validation path is known or can be defined.
- For UI tasks, applicable design rules and the reuse/new-pattern decision are known.
- For split-sensitive tasks, `/dev-split` classification and code-placement constraints are known.

If readiness fails because the idea is not yet shaped enough to choose a route, output a recommendation
to use `/dev-brainstorm` instead of writing a formal plan.

If readiness fails because a decision is unresolved, output a decision request instead of a formal
plan. Do not create or update a plan file yet.

## Decision Point Rule

Explicitly identify a decision point when any of these are true:

- Multiple reasonable approaches exist.
- The choice affects product experience.
- The choice affects business semantics.
- The choice affects data meaning, data ownership, or source of truth.
- The choice affects state transitions or lifecycle rules.
- The choice performs irreversible or hard-to-undo cleanup.
- The choice changes long-term architecture direction.
- The choice changes user habits or visible workflows.
- The choice may require an ADR later.

For each decision point, state:

- Decision question.
- Recommended option.
- Alternative options.
- Impact and tradeoffs.
- What can be inferred from code facts.
- What requires user confirmation.
- ADR gate: needed/not needed/maybe.

Recommendations are allowed, but must be labeled as recommendations. Do not present them as
confirmed decisions.

## Decision Request Output

When decision points block planning, stop before creating the plan and use this shape:

```md
Plan readiness: blocked by decision points

Goal:
- ...

Known facts:
- ...

Decision points:
1. Question:
   - Recommendation:
   - Alternatives:
   - Impact:
   - Needs user confirmation because:
   - ADR gate:

After you confirm:
- I will create/update the executable plan under docs/plans/... if persistence is needed.
```

Ask only the minimum number of questions needed to unblock the plan. Prefer one concise question
when possible.

## Confirmed Decisions In Plans

After the user confirms a decision:

- Move the decision into `Assumptions And Decisions`.
- Record the chosen route and why.
- Remove unresolved `Option A / Option B` branches from executable steps.
- Keep the plan single-route and actionable.
- Mark ADR gate when the confirmed decision is hard to reverse or long-lived.

## Persistent Plan Rule

Small, low-risk plans may stay in conversation.

Create or update `docs/plans/YYYY-MM-DD-short-topic.md` when any of these are true:

- The user explicitly asks for a plan file, persistent plan, detailed plan document, TODO document, or written plan.
- Repository workflow instructions require plan artifacts under `docs/plans/`.
- The task is high-risk, cross-module, architecture-affecting, audit-follow-up work, expected to span multiple turns, or likely to need later review.
- The user asks to use a branch/task workflow that needs a reviewable plan before implementation.
- A previous `/dev-audit` skill run produced findings that need implementation sequencing.

Keep the plan in conversation when all of these are true:

- The task is small, low-risk, and likely completed in one turn.
- The user did not ask for a plan document or persistent TODO.
- Repository workflow does not require a plan file for this kind of task.
- No audit finding or branch workflow requires a reviewable artifact.

If a persistent plan is required and `docs/plans/` is missing, recommend or run the `/dev-init` skill when appropriate, then create the plan. If initialization is not allowed, report that the persistent plan cannot be written.

When creating a plan file:

1. Confirm the plan readiness gate passed.
2. Use `docs/plans/YYYY-MM-DD-short-topic.md`.
3. Keep it actionable: goal, scope, assumptions and decisions, fact sources, steps, verification, risks, acceptance criteria, artifact routing, and closeout.
4. Include frontmatter with `artifact_type`, `status`, `created`, `updated`, and `owner`.
5. Confirm the file exists after writing it.
6. Run `git status --short --branch --untracked-files=all`.
7. If the file is not visible because `.gitignore` excludes it, either add the smallest safe allow rule or report that the plan is not tracked and ask before changing ignore policy.

## Document Routing

| Artifact                   | Destination                                  | Rule                                                                                        |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Decision request           | Conversation only                            | Use when decisions block planning; do not write as executable plan.                         |
| Task plan                  | `docs/plans/YYYY-MM-DD-short-topic.md`     | Create only after plan readiness passes and the persistent plan rule applies.               |
| Audit/review report        | `docs/audits/YYYY-MM-DD-topic-audit.md`    | Do not write audit findings here unless using the `/dev-audit` skill.                     |
| Current module facts       | `docs/capabilities/*.md`                   | Do not write plans or audit findings here.                                                  |
| Split guidance             | Conversation or plan section                | Use `/dev-split`; embed only the chosen constraints and proposed route in the plan.          |
| Important decision         | `docs/adr/YYYY-MM-DD-short-title.md`       | Recommend only when there is a real tradeoff; the `/dev-distill` skill runs the ADR gate. |
| Executable rule            | tests                                        | Prefer tests over prose-only rules when practical.                                          |
| Confirmed reusable UI rule | `DESIGN.md` through `/dev-design-system` | Update only when the task establishes or changes a project-level rule.                      |

## Workflow

1. Run the orient gate:

   - Load repository instructions and stable vocabulary.
   - Use `docs/ai/context-map.md` and capability docs to find relevant source files.
   - Avoid historical plan/audit noise unless directly relevant.
   - Report the key context sources used.
2. Confirm the task frame:

   - Task type: bug, feature, refactor, audit follow-up, docs, test, or research.
   - Goal in one sentence.
   - Non-goals in one sentence when scope could drift.
3. Run the plan readiness gate:

   - Goal clear?
   - Scope clear?
   - Source of truth known?
   - Critical decisions confirmed?
   - Validation path known?
4. Identify decision points:

   - List only decisions that affect implementation route.
   - Separate code facts from recommendations and user-owned decisions.
   - If unresolved decisions block execution, output the decision request and stop.
5. Decide plan persistence after decisions are confirmed:

   - If the persistent plan rule applies, set `persistent_plan: yes`.
   - If the plan can stay in conversation, set `persistent_plan: no` and explain why it is small enough.
   - If creating a persistent plan, use `docs/plans/YYYY-MM-DD-short-topic.md`.
   - If a relevant active plan already exists, update it instead of creating a duplicate.
6. Make assumptions and decisions explicit:

   - List only assumptions that affect implementation.
   - List confirmed decisions, including user-confirmed product/business choices.
   - Ask the user if an assumption is risky and cannot be resolved from code.
   - If the plan comes from an audit, record the source audit path and the exact finding IDs covered
     by this plan.
7. Identify fact sources:

   - Relevant docs.
   - Relevant files, APIs, tables, state stores, or tests.
   - The single source of truth if the task touches business logic.
   - For UI tasks: applicable `DESIGN.md` rules, tokens, shared components, stories, and visual checks.
8. Run split guidance when needed:

   - If the task has large-file or module-boundary risk, use or recommend `/dev-split`.
   - Embed the result as plan constraints: classification, owner modules, code-placement rules, defer triggers, verification, and lifecycle closeout.
   - If `/dev-split` proposes a split that needs approval, stop before writing implementation steps that assume the split is approved.
   - If `/dev-split` says no split or defer, keep the plan focused on the current task and include the guardrails.
9. Create the smallest useful plan:

   - 3 to 7 steps.
   - Each executable step has `todo`, `done`, or `blocked` status.
   - Each step has a verification method.
   - Prefer proving the existing issue before modifying code.
   - Do not include unresolved option branches in executable steps.
10. Define artifact routing:

   - State whether the task will create or update a plan, audit, capability doc, ADR, tests, or none.
   - If the task comes from an audit, reference the audit path, list `covered_findings`, list
     `deferred_findings`, and keep findings in `docs/audits/`.
   - Include whether `docs/ai/context-map.md` may need an update after implementation.
   - For UI tasks, state `design_system_impact: none | update | unresolved`, existing components to
     reuse, and the visual/accessibility verification path.
   - If the task involves a hard-to-reverse decision, fact-source change, architecture choice,
     algorithm policy, or cross-module rule, flag that the `/dev-distill` skill must run the ADR gate.
11. Verify plan file when created:

- Confirm the path exists.
- Run `git status --short --branch --untracked-files=all`.
- Report whether git sees the file.
- If ignored, add a minimal allow rule only when safe; otherwise ask the user.

12. Decide execution readiness:

- Ready: continue implementing.
- Blocked by decisions: ask the user to confirm the decision points.
- Needs branch/spec: tell the user why before creating long-lived artifacts.

## Output Template

Use `templates/output.md` for the final response shape.

When blocked by decisions, use the `Blocked By Decisions` template and stop before creating or updating a plan file.

## Next-Step Prompt

End with one of these:

- "Decision points block a reliable plan; confirm the listed choices, then I will create the executable plan."
- "Plan readiness passed and the plan is small enough to stay in conversation; next step is the `/dev-branch` skill for reviewed implementation."
- "Persistent plan created and git visibility checked; next step is the `/dev-branch` skill for reviewed implementation."
- "Split-sensitive planning needs `/dev-split`; classify the module boundary before writing implementation steps."
- "Plan file is ignored by git; fix tracking before implementation or confirm that the plan should remain untracked."
- "This is audit follow-up work; use the `/dev-branch` skill so implementation, verification, changelog, distill, and review happen in one branch."
