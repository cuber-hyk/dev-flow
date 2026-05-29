# cuberhyk-dev-flow

cuberhyk-dev-flow is a compact workflow plugin for coding agents. It provides three skills:

- `dev-orient`: enter repository context without reading noise.
- `dev-plan`: define a minimal, verifiable task plan.
- `dev-distill`: preserve durable project knowledge after work is complete.

Open the visual usage guide:

```text
docs/usage.html
```

## Workflow

1. Orient: understand project rules, context map, vocabulary, capability docs, relevant code entry points, and artifact destinations.
2. Plan: define goal, scope, assumptions, risks, steps, verification, and lifecycle closeout.
3. Implement: make the smallest safe change and verify it.
4. Distill: update durable docs, ADRs, or tests; archive or delete process artifacts; discard process noise.

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

Validate documentation routing:

```bash
npx cuberhyk-dev-flow validate-docs /path/to/project
```

The validator checks for missing memory directories, plan/audit files without status, process artifacts stored under `docs/capabilities/`, and context maps that route default context to plans, audits, or archived files.

## Claude Code

Local test:

```bash
claude --plugin-dir /path/to/dev-flow
```

Invoke skills:

```text
/cuberhyk-dev-flow:dev-orient
/cuberhyk-dev-flow:dev-plan
/cuberhyk-dev-flow:dev-distill
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
npx ./cuberhyk-dev-flow-0.2.0.tgz install
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

cuberhyk-dev-flow is not a large methodology bundle. It is a small control loop:

```text
dev-orient -> dev-plan -> implementation -> dev-distill
```
