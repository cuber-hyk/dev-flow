# Installing cuberhyk-dev-flow for OpenCode

## Installation

Add cuberhyk-dev-flow to the `plugin` array in your `opencode.json`:

```json
{
  "plugin": ["cuberhyk-dev-flow@git+https://github.com/cuber-hyk/dev-flow.git"]
}
```

Restart OpenCode.

## Local Development

Until cuberhyk-dev-flow is published to GitHub, point OpenCode at the local plugin folder:

```json
{
  "plugin": ["C:/Users/胡运宽/plugins/dev-flow"]
}
```

## Usage

Use OpenCode's native skill tool to list and load skills:

```text
use skill tool to list skills
use skill tool to load cuberhyk-dev-flow/dev-init
use skill tool to load cuberhyk-dev-flow/dev-check
use skill tool to load cuberhyk-dev-flow/dev-orient
use skill tool to load cuberhyk-dev-flow/dev-plan
use skill tool to load cuberhyk-dev-flow/dev-audit
use skill tool to load cuberhyk-dev-flow/dev-distill
```
