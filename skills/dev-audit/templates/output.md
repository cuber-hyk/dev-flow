# Dev Audit Output Template

```md
Audit scope: <scope>

Persistent audit: yes/no
Audit file: docs/audits/YYYY-MM-DD-topic-audit.md or none

Conclusion: <short conclusion>

Context loaded:
- <file or source>

Findings:
- [P1/P2/P3, Confirmed/Strong/Risk] <finding>
  Evidence: <file/function/command/runtime result>
  Impact: <user/business/technical impact>
  Fix direction: <short direction or none>
- or No findings.

Verification:
- <command/check/manual verification>

Not verified:
- <gap or none>

Artifact routing:
- Fix plan: dev-plan needed/not needed; reason
- Implementation: dev-branch needed/not needed; reason
- Stable knowledge / ADR gate: needed/not needed/maybe; reason

Git visibility:
- <status when a persistent audit is created; otherwise not applicable>

Next step: <recommended next skill or action>
```
