---
name: dev-changelog
description: Maintain a human-readable CHANGELOG.md using Keep a Changelog conventions. Use when the user asks to update changelog, maintain release notes, record user-visible changes, prepare a release, move Unreleased items into a version, or when dev-branch determines a completed change affects users, operators, public behavior, data, security, install, configuration, compatibility, or release notes. Writes concise entries under Unreleased by category and avoids logging tiny internal-only changes. Do not replace git history, capability docs, ADRs, or task plans.
---

# Dev Changelog

Use this skill to maintain `CHANGELOG.md` as human-facing release notes.

Core principle:

> A changelog is for people, not a dump of commits.

## Boundary

Dev Changelog does:

- Create `CHANGELOG.md` when it is missing.
- Keep a `## [Unreleased]` section at the top.
- Add concise entries under standard categories.
- Move `Unreleased` entries into a version section during release preparation.
- Record only changes with user, operator, release, data, security, install, config, or compatibility value.
- Report when a change does not need a changelog entry.

Dev Changelog does not:

- Record every commit, typo, formatting tweak, test-only change, or internal refactor.
- Store architecture rationale; use ADRs.
- Store current module behavior; use capability docs.
- Store implementation plans or audit findings.
- Replace `dev-distill`.

## Format

Follow Keep a Changelog style:

```md
# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning when applicable.

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
```

Released versions use ISO dates:

```md
## [0.7.0] - 2026-05-31
```

Keep newest versions first.

## Categories

| Category | Use for |
|---|---|
| `Added` | New user-visible features, commands, skills, APIs, options, or documented capabilities. |
| `Changed` | User-visible behavior changes, workflow changes, compatibility changes, defaults, install/config changes. |
| `Deprecated` | Features, APIs, commands, config, or behavior that still exists but should stop being used. |
| `Removed` | Removed features, APIs, commands, config, files, or behavior. |
| `Fixed` | Bug fixes that affect users, business results, data correctness, install, or operations. |
| `Security` | Vulnerability fixes, secret handling, auth, permissions, or data exposure changes. |

## Changelog Gate

Write a changelog entry when the change affects any of these:

- Users or visible product behavior.
- Operators, installation, setup, configuration, or deployment.
- Public APIs, commands, skills, plugin manifests, or package behavior.
- Data meaning, migrations, compatibility, or persistence.
- Security, auth, permissions, secrets, or data exposure.
- Release notes or upgrade behavior.

Usually do not write a changelog entry for:

- Pure internal refactors with no visible behavior change.
- Formatting, comments, or naming cleanup.
- Test-only changes.
- Documentation wording fixes with no workflow change.
- Tiny visual tweaks users do not need to know about.
- Process artifacts such as temporary plans or audits.

If not writing, report:

```text
Changelog: not needed - <reason>
```

## Workflow

1. Inspect the change:
   - Identify user-visible behavior, operator impact, public API/command impact, data impact, security impact, and release impact.

2. Decide whether an entry is needed:
   - If no gate condition passes, do not edit `CHANGELOG.md`.
   - Explain the reason briefly.

3. Ensure `CHANGELOG.md` exists:
   - If missing, create it from the standard template.
   - Keep `## [Unreleased]` at the top.

4. Add entries:
   - Add under the most specific category.
   - Use concise past-tense or outcome-oriented bullets.
   - Mention the user-facing result, not internal implementation trivia.
   - Avoid duplicate entries.

5. Prepare release when asked:
   - Move current `Unreleased` entries to `## [VERSION] - YYYY-MM-DD`.
   - Create a fresh empty `## [Unreleased]`.
   - Keep newest version first.
   - Do not invent a version number if the user did not provide one and it cannot be inferred.

6. Verify:
   - Confirm `CHANGELOG.md` exists.
   - Run `git status --short --branch --untracked-files=all`.
   - Report whether git sees the file.

## Output Shape

```md
Changelog: updated/not needed
File: CHANGELOG.md or none
Category: Added/Changed/Deprecated/Removed/Fixed/Security or none
Entry:
- ...
Reason:
- ...
Git visibility:
- ...
```
