# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact lifecycle workflow plugin for coding agents. It provides six skills:

- `dev-init`: initialize the recommended Dev Flow memory structure.
- `dev-check`: validate documentation routing and lifecycle health.
- `dev-orient`: enter repository context without reading noise.
- `dev-plan`: define a minimal, verifiable task plan.
- `dev-audit`: review features, workflows, or docs and route findings to `docs/audits/`.
- `dev-distill`: preserve durable project knowledge after work is complete.

Open the visual usage guide:

```text
docs/usage.html
```

## Workflow

1. Init: create the recommended memory structure when a project has not adopted Dev Flow yet.
2. Check: validate documentation routing before or after important workflow changes.
3. Orient: understand project rules, context map, vocabulary, capability docs, relevant code entry points, and artifact destinations.
4. Plan: define goal, scope, assumptions, risks, steps, verification, and lifecycle closeout.
5. Audit: when the task is a review, write findings and evidence to `docs/audits/`.
6. Implement: make the smallest safe change and verify it.
7. Distill: update durable docs, ADRs, or tests; archive or delete process artifacts; discard process noise.
8. Check: run validation again after documentation changes.

## Repository Memory

Use the same destinations across all skills:

| Content | Destination |
|---|---|
| Agent rules and workflow | `AGENTS.md` or `CLAUDE.md` |
| Stable domain vocabulary | `CONTEXT.md` |
| AI context routing | `docs/ai/context-map.md` |
| Current module facts | `docs/capabilities/*.md` |
| Persistent task plans | `docs/plans/*.md` |
| Audit reports and review findings | `docs/audits/*.md` |
| Distilled audit history | `docs/audits/archived/*.md` |
| Hard-to-reverse decisions | `docs/adr/*.md` |
| Executable business rules | tests |

`docs/capabilities/` is for current facts only. Do not put task plans or audit reports there.

Lifecycle rules:

| Artifact | Status flow |
|---|---|
| Plan | `active` -> `completed`, `superseded`, or `archived` |
| Audit | `active` -> `distilled`, `archived`, or deleted |
| Capability | current facts only; no investigation logs |
| ADR | `proposed` -> `accepted`, `superseded`, or `deprecated` |

## Project Bootstrap

Initialize the recommended memory structure in a project:

```bash
npx cuberhyk-dev-flow init-project /path/to/project
```

`init-project` creates missing files only. Existing `AGENTS.md` is not overwritten; the command appends a marked Dev Flow section only when that section is absent.

Validate documentation routing:

```bash
npx cuberhyk-dev-flow validate-docs /path/to/project
```

The validator checks for missing memory directories, plan/audit metadata, ADR status, capability `source_of_truth`, process artifacts stored under `docs/capabilities/`, context-map references to missing paths, context maps that route default context to plans/audits/archived files, and gitignore rules that hide Dev Flow document paths.

## Templates

`init-project` installs concise templates:

| Template | Purpose |
|---|---|
| `AGENTS.md` Dev Flow block | Tells future agents how to enter the workflow without replacing local policy. |
| `CONTEXT.md` | Stable vocabulary and business concepts. |
| `docs/ai/context-map.md` | Low-noise context routing and default exclusion rules. |
| `docs/capabilities/_template.md` | Current module facts, fact sources, entry points, and verification notes. |
| `docs/plans/_template.md` | Goals, scope, assumptions, steps, verification, acceptance criteria, git visibility, and closeout. |
| `docs/audits/_template.md` | Scope, evidence, findings, verification, git visibility, and closeout. |
| `docs/adr/_template.md` | Context, decision, alternatives, consequences, and status history. |

## Skill Boundaries

| Skill | Use it for | It must not do | Typical next skill |
|---|---|---|---|
| `dev-init` | First-time setup and template installation | Overwrite project policy or write plans/audits | `dev-check` |
| `dev-check` | Validate routing, metadata, and lifecycle health | Deep business/code audit | `dev-init`, `dev-orient`, `dev-audit`, or `dev-distill` |
| `dev-orient` | Enter current context and choose relevant docs/code | Plan, audit, implement, or distill | `dev-plan` or `dev-audit` |
| `dev-plan` | Turn a task or audit finding into a persistent plan under `docs/plans/` | Audit, implement, or archive | implementation |
| `dev-audit` | Review correctness/completeness and write findings under `docs/audits/` | Implement fixes or update capability facts | `dev-plan` or `dev-distill` |
| `dev-distill` | Move stable knowledge to durable docs/tests and close artifacts | Re-plan, re-audit, or implement | `dev-check` |

## Persistent Artifacts

`dev-plan` may keep small, low-risk plans in conversation. It creates or updates `docs/plans/YYYY-MM-DD-short-topic.md` when the user asks for a plan document, repository workflow requires one, the task is high-risk/cross-module/multi-turn, or the plan comes from audit follow-up work.

For example, `dev-plan 制定相关计划` can stay chat-only for a tiny one-turn task, but should create `docs/plans/` for non-trivial implementation work.

`dev-audit` may keep small, low-risk reviews in conversation. It creates or updates `docs/audits/YYYY-MM-DD-topic-audit.md` when the user asks for an audit report, repository workflow requires one, the audit is non-trivial/cross-module/correctness-sensitive, or findings need follow-up.

For example, `dev-audit 请帮我审查 xxx` can stay chat-only for a tiny check, but should create `docs/audits/` when evidence, findings, or follow-up work matter.

After creating a persistent plan or audit, the agent must run:

```bash
git status --short --branch --untracked-files=all
```

If `.gitignore` hides the file, the agent must add the smallest safe allow rule or report that the artifact is not tracked.

## Command Flow

First-time project setup:

```bash
npx cuberhyk-dev-flow init-project /path/to/project
npx cuberhyk-dev-flow validate-docs /path/to/project
```

Feature development:

```text
dev-check -> dev-orient -> dev-plan -> implementation -> dev-distill -> dev-check
```

Audit-driven work:

```text
dev-check -> dev-orient -> dev-audit -> dev-plan -> implementation -> dev-distill -> dev-check
```

## Claude Code

Local test:

```bash
claude --plugin-dir /path/to/dev-flow
```

Invoke skills:

```text
/cuberhyk-dev-flow:dev-orient
/cuberhyk-dev-flow:dev-plan
/cuberhyk-dev-flow:dev-audit
/cuberhyk-dev-flow:dev-distill
/cuberhyk-dev-flow:dev-init
/cuberhyk-dev-flow:dev-check
```

Local marketplace install:

```text
/plugin marketplace add /path/to/dev-flow
/plugin install cuberhyk-dev-flow@cuberhyk-plugins
```

## npx Installer

After publishing to npm:

```bash
npx cuberhyk-dev-flow install
```

Local package test before publishing:

```bash
npm pack
npx ./cuberhyk-dev-flow-0.4.3.tgz install
```

The installer copies this plugin to:

```text
~/plugins/cuberhyk-dev-flow
```

and updates the Codex personal marketplace at:

```text
~/.agents/plugins/marketplace.json
```

## Codex

Install from a Codex marketplace or add the plugin to a personal marketplace.

The Codex plugin manifest lives at:

```text
.codex-plugin/plugin.json
```

## Cursor

The Cursor plugin manifest lives at:

```text
.cursor-plugin/plugin.json
```

## Gemini CLI

The Gemini extension manifest lives at:

```text
gemini-extension.json
```

## OpenCode

See:

```text
.opencode/INSTALL.md
```

## Design Principle

cuberhyk-dev-flow is not a large methodology bundle. It is a small lifecycle loop:

```text
dev-init -> dev-check -> dev-orient -> dev-plan/dev-audit -> implementation -> dev-distill -> dev-check
```
