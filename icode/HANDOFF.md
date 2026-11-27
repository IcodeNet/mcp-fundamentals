# Implementation handoff — 27 November 2026

Goal: replace the Epic Workshop engine with Icode in MCP Fundamentals without weakening or rewriting the original lessons, starter/solution TypeScript or assessment assertions. Keep both PRs unmerged unless explicitly authorised.

## Repositories

- Engine: `IcodeNet/Icode-workshop`, branch `feat/mcp-course-compatibility`, PR https://github.com/IcodeNet/Icode-workshop/pull/4.
- Engine pinned commit: `482f7fa6ce03b05c9b32eee19e3d07d55ca10ed0`; recorded in `icode/engine.json`.
- Engine CI passed: https://github.com/IcodeNet/Icode-workshop/actions/runs/46007110939.
- Course: `IcodeNet/mcp-fundamentals`, branch `feat/icode-workshop-host`, PR https://github.com/IcodeNet/mcp-fundamentals/pull/1.
- Broader 44-capability audit is separate: https://github.com/IcodeNet/Icode-workshop/pull/3. This course acceptance does not close every audit gap.

## Confirmed acceptance

Course commit `718d7dbec2824e77f18b5b25a0a9fcfbd5d539dd` passed the full workflow:
https://github.com/IcodeNet/mcp-fundamentals/actions/runs/46007612300
Job `140534677696` completed successfully.

This includes setup, original source-integrity checks, all 26 variant outcomes matching the verified original baseline, 38 instructional documents, learner failing-to-passing edit, reset/restore/progress, browser navigation through 13 steps, a real official Inspector connection, restart and owned-port cleanup.

Original baseline is pinned to `9a5336cc825ae7f502bad57dcd3c89eb362bfe9b`: 13 failing starters and 13 passing solutions. Actual exported evidence is committed in `icode/baseline-results.json` and `icode/baseline-evidence.json`. Do not regenerate it unnecessarily.

## This follow-up commit

Adds two acceptance checks that were previously uncommitted:

1. `icode/acceptance.mjs`: reject any retained Epic workshop engine packages in the course lockfile.
2. `icode/browser.mjs`: click the lesson file link, simulate an external editor change, reload it into the browser and restore the saved file.

Both scripts passed syntax checks and the diff passed whitespace checks before pushing. These additions need their own final-commit CI confirmation; the green run above precedes them.

## Next actions

1. Check CI for the current course PR head. Fix any failures without weakening original assertions.
2. Update both draft PR descriptions with final SHAs, exact evidence and remaining boundaries. Their current descriptions still say acceptance is pending.
3. Confirm clean checkouts and that the course still pins the verified engine commit.
4. Report completion on these feature branches. Do not claim merge or publication.

## Boundaries and tooling

Original video links remain external and may require authorisation. General executable MDX, all Epic product features, live tutor/Langfuse/Cosmos and an external assistant connection are not claimed. The learner's course MCP server is distinct from Icode's read-only assistant MCP.

Local tsx Unix IPC and system Chromium launch were blocked by the execution environment; GitHub CI is the successful real-course/browser environment. Connected GitHub tools can create trees/commits and update refs with an expected-head check. No force pushes. Fetch pushed commits before synchronising local history. Workspace maintenance can remove temporary files; all required source and baseline evidence are in GitHub.
