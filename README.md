# MCP Fundamentals — Icode Workshop host

Kent C. Dodds's MCP Fundamentals course, hosted by Icode Workshop on this branch. The original lesson MDX, starter and solution TypeScript, and assessment assertions are preserved. Epic workshop engine packages have been removed; this branch uses a pinned Icode engine source checkout.

## Start learning

Prerequisites: Git 2.18+, Node.js 24 LTS (course minimum 22.13), npm 8.16+, and Corepack with pnpm 10. Install Corepack separately if your Node distribution does not include it. No AI provider key is required for local assessments or Inspector.

```sh
git clone --branch feat/icode-workshop-host https://github.com/IcodeNet/mcp-fundamentals.git
cd mcp-fundamentals
npm run setup
npm run doctor
npm start
```

Open http://127.0.0.1:5173. Setup checks out the engine commit recorded in `icode/engine.json`, installs locked dependencies and creates the first persistent playground. Repeating setup preserves existing learner work. `ICODE_ENGINE_DIR` can point to an existing engine checkout for development.

Select a lesson, open Playground, edit and save, then Run tests. Starters are intentionally incomplete. Problem and Solution tests/previews use disposable copies. Use Solution → Preview → Start app to inspect a working reference. In MCP Inspector, click Connect. Use Stop app before switching to unrelated tools.

All 13 steps are mapped in order across ping, tools, resources, resource tools and prompts. Course/exercise introductions, solution explanations and wrap-ups remain available in the lesson panel. Original videos open at their author's site and may require authorised access; they are not bundled or claimed to play offline. Declarative MDX is adapted to Markdown, not executed as arbitrary JSX. Mermaid source remains readable in fenced blocks.

## Persistent work and external clients

Saved files and backups live under `.workshop/`. Progress is local and self-reported. Reset saves the current workspace in a backup; Restore Backup recovers its saved files and database. Reload file reads changes made in your external editor and asks before discarding unsaved browser edits.

To run a completed learner playground as a stdio MCP server:

```sh
node icode/run.mjs mcp 01
```

Use `node` and absolute arguments `[/absolute/path/to/course/icode/run.mjs, mcp, 01]` in your MCP client's stdio configuration. The host does not connect an external assistant automatically. `npm run inspect -- 01` opens the Inspector service for that playground; a starter cannot connect successfully until implemented.

## Acceptance evidence

The original pinned course is `9a5336cc825ae7f502bad57dcd3c89eb362bfe9b`. [Baseline CI](https://github.com/IcodeNet/mcp-fundamentals/actions/runs/46006634853) established 13 failing starters and 13 passing solutions. The exact exported outcomes and provenance are in `icode/baseline-results.json` and `icode/baseline-evidence.json`.

`npm test` runs all original assessments through Icode and compares these outcomes, checks all 38 instructional documents, protects authored sources and verifies learner editing, reset/restore and progress. Set `BASELINE_RESULTS=icode/baseline-results.json` when running it outside CI. The [course acceptance workflow](.github/workflows/validate.yml) also runs real browser/Inspector navigation and owned-process cleanup. Check its final commit result before treating this branch as accepted; successful baseline tests alone are not Icode compatibility evidence.

To reproduce the baseline, check out the pinned original in a separate directory, run `npm install --ignore-scripts`, then run `icode/baseline.mjs` with the original directory, output JSON path and absolute npm-cli.js path. The original lockfile was inconsistent with the registry-resolved dependency graph, so baseline installation refreshed it without changing course code or tests.

## Scope and attribution

This establishes compatibility for this course; it does not claim every Epic feature. It does not include Epic's account system, offline media or entitlement management. Code runs with your local permissions; use trusted course repositories.

Original course: [epicweb-dev/mcp-fundamentals](https://github.com/epicweb-dev/mcp-fundamentals), by [Kent C. Dodds](https://kentcdodds.com). Original course and lesson licence: GPL-3.0-only; see [LICENSE](LICENSE). Original media remains on [EpicAI.pro](https://www.epicai.pro/). Host implementation: [IcodeNet/Icode-workshop](https://github.com/IcodeNet/Icode-workshop).
