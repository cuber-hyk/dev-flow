{{AGENT_SECTION_START}}
# Dev Flow Protocol

Use cuberhyk-dev-flow for non-trivial development work:

1. `dev-init`: create missing repository memory structure.
2. `dev-check`: validate documentation routing and lifecycle health.
3. `dev-orient`: enter low-noise project context.
4. `dev-plan`: produce a minimal, verifiable plan when the task is non-trivial.
5. `dev-audit`: write structured review findings to `docs/audits/` when the task is an audit.
6. Implement and verify the smallest safe change.
7. `dev-distill`: preserve stable knowledge and close process artifacts.
8. `dev-check`: re-check routing after documentation changes.

Document routing:

- Stable vocabulary -> `CONTEXT.md`
- Context routing -> `docs/ai/context-map.md`
- Current module facts -> `docs/capabilities/*.md`
- Plans -> `docs/plans/*.md`
- Audits -> `docs/audits/*.md`
- Decisions -> `docs/adr/*.md`
- Executable business rules -> tests

Default context rules:

- Do not read `docs/plans/` by default.
- Do not read `docs/audits/` by default.
- Do not read archived files by default.
- Treat code and tests as the source of truth when documents disagree.
{{AGENT_SECTION_END}}
