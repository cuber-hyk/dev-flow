# Dev Flow

Dev Flow is a compact workflow plugin for coding agents. It provides three skills:

- `dev-orient`: enter repository context without reading noise.
- `dev-plan`: define a minimal, verifiable task plan.
- `dev-distill`: preserve durable project knowledge after work is complete.

## Workflow

1. Orient: understand project rules, context map, vocabulary, capability docs, and relevant code entry points.
2. Plan: define goal, scope, assumptions, risks, steps, and verification.
3. Implement: make the smallest safe change and verify it.
4. Distill: update durable docs, ADRs, or tests; discard process noise.

## Claude Code

Local test:

```bash
claude --plugin-dir /path/to/dev-flow
```

Invoke skills:

```text
/dev-flow:dev-orient
/dev-flow:dev-plan
/dev-flow:dev-distill
```

Local marketplace install:

```text
/plugin marketplace add /path/to/dev-flow
/plugin install dev-flow@dev-flow-local
```

## npx Installer

After publishing to npm:

```bash
npx cuber-hyk-dev-flow install
```

Local package test before publishing:

```bash
npm pack
npx ./cuber-hyk-dev-flow-0.1.0.tgz install
```

The installer copies this plugin to:

```text
~/plugins/dev-flow
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

Dev Flow is not a large methodology bundle. It is a small control loop:

```text
dev-orient -> dev-plan -> implementation -> dev-distill
```
