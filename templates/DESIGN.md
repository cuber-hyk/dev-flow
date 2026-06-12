---
artifact_type: design_system
status: current
updated: {{DATE}}
token_source: design-tokens.json
---

# {{PROJECT_NAME}} Design System

## Authority And Scope

- This file is the current UI design and implementation contract for agents and contributors.
- Record only confirmed reusable rules. Keep unconfirmed future scenarios under `Known Gaps`.
- Exact foundation values live in `design-tokens.json`.
- Shared component behavior lives in component code and visual examples.

## Sources

- Tokens: `design-tokens.json`
- Shared components: Add project-specific path
- Visual examples: Add Storybook, preview, screenshot, or visual-test path

## Design Principles

- Add principles confirmed through reviewed UI work.

## Foundations

- Reference semantic tokens from `design-tokens.json`.
- Do not introduce raw values when an applicable token exists.

## Layout Patterns

- Add confirmed page containers, grids, responsive rules, and composition patterns.

## Component Rules

- Search existing shared components before creating a new component.
- Reuse is based on semantic responsibility and behavior, not only visual similarity.

## Interaction Patterns

- Add confirmed reusable flows such as destructive confirmation, session exit, loading, empty, and error states.

## UI Implementation Rules

- Add project-specific component locations, styling rules, token usage, stories, and visual-test requirements.

## Accessibility

- Add confirmed keyboard, focus, contrast, semantic, touch-target, and motion requirements.

## Provisional Rules

- Add rules already used but awaiting broader confirmation.

## Known Gaps

- Add UI scenarios not yet encountered or confirmed. Do not design them prematurely.
