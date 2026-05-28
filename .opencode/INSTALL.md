# Installing Dev Flow for OpenCode

## Installation

Add Dev Flow to the `plugin` array in your `opencode.json`:

```json
{
  "plugin": ["dev-flow@git+https://github.com/dev-flow/dev-flow.git"]
}
```

Restart OpenCode.

## Local Development

Until Dev Flow is published to GitHub, point OpenCode at the local plugin folder:

```json
{
  "plugin": ["C:/Users/胡运宽/plugins/dev-flow"]
}
```

## Usage

Use OpenCode's native skill tool to list and load skills:

```text
use skill tool to list skills
use skill tool to load dev-flow/dev-orient
use skill tool to load dev-flow/dev-plan
use skill tool to load dev-flow/dev-distill
```
