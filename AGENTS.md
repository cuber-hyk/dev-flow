CLAUDE.md

## Dev Branch Subagent Authorization

For `dev-branch` implementation, the agent is pre-authorized to decide whether to delegate focused worker subagents. The agent does not need to ask the user again before using worker subagents when the task can be split into clear, non-overlapping ownership areas.

Worker subagents may edit files only within their assigned ownership scope. They must not commit, merge, delete branches, clean up lifecycle artifacts outside their scope, push, or revert changes made by others.

For `dev-branch` independent review, the agent is pre-authorized to decide whether to delegate a focused read-only subagent reviewer. The agent does not need to ask the user again before using a subagent for this review gate.

The reviewer subagent may inspect the task goal, plan or audit source, repository state, diff, and verification evidence. The reviewer subagent must not implement fixes, edit files, commit, merge, delete branches, clean up artifacts, or push.

The main agent remains responsible for task decomposition, integrating worker outputs, resolving conflicts, verifying the final result, and owning the final diff. The main agent must independently verify every reviewer subagent finding before treating it as a blocker.
