# CI/CD Scripts

**Generated:** 2026-05-06 | **Commit:** 691301f94 | **Branch:** rozenmd/screenshot-worker-refactor-pt8

TypeScript entrypoints plus shell orchestration for PR validation, release reporting, docs deployment, npm publishing, and visual regression. Workflows live in `.github/workflows/`; this directory holds repo-local helpers invoked by workflows, package scripts, and lefthook.

## STRUCTURE

```
ci/
|-- reporters/             # ReportItem artifact bus and PR summary sections
|-- scripts/               # tsx entrypoints called by workflows/package scripts
|-- utils/                 # GitHub, git diff, PR comment helpers
|-- versioning/            # Shell release/deploy orchestration; sensitive paths
|-- visual-regression/     # Screenshot worker client, diffing, PR report comment
`-- tsconfig.json          # Strict ES2022 Node config for ci/**/*.ts
```

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Kumo changeset gate | `scripts/validate-kumo-changeset.ts` | Called by `pullrequest.yml`, `lefthook.yml`, and `packages/kumo` script |
| Reporter artifact contract | `reporters/types.ts` | `ci/reports/{id}.json`, `ReportItem`, `CIContext` |
| Reporter registry | `reporters/index.ts` | Add every reporter here or it is invisible to registry users |
| Consolidated PR report | `scripts/post-pr-report.ts`, `utils/pr-reporter.ts` | Reads artifacts, builds markdown, posts comment |
| Git diff helpers | `utils/git-operations.ts` | CI refs plus local `origin/main` merge-base fallback |
| GitHub API | `utils/github-api.ts` | Hardcoded `cloudflare/kumo` wrapper |
| Beta package release | `versioning/publish-beta.sh` | Versions, builds, publishes beta, verifies npm, writes report |
| Production release | `versioning/release-production.sh` | Human-only; branch, publish, tags, PR |
| Docs preview deploy | `versioning/deploy-kumo-docs-preview.sh` | Older package-script path; workflows now deploy inline |
| Visual regression | `visual-regression/run-visual-regression.ts` | Worker capture, pixelmatch diff, direct PR comment |

## WORKFLOW MAP

| Workflow | Trigger | ci/ usage |
| -------- | ------- | --------- |
| `pullrequest.yml` | PR, `opencode/**` push | Runs changeset validator; build artifact feeds lint/typecheck/test |
| `preview.yml` | PR, `opencode/**`, `changeset-release/main` | Builds docs, deploys internal previews, runs VR from `main` checkout |
| `preview-deploy.yml` | `workflow_run(Preview)` | Fork preview deploy; runs only main-branch config/scripts with secrets |
| `release.yml` | push to `main` | Uses Changesets action directly, not `ci/versioning/*` |
| `validate-pr-description.yml` | PR description/label events | Uses `tools/deployments/validate-pr-description.ts`, outside `ci/` |
| `semgrep.yml` | PR, main/master, schedule, manual | No `ci/` helpers |
| `bonk*.yml`, `reviewer.yml` | comments/reviews | AI automation, no `ci/` helpers |

## CONVENTIONS

- TS scripts are `tsx` entrypoints: parse env/CLI, call `reporters/` or `utils/`, exit non-zero on real failure.
- Shell scripts orchestrate side effects: npm auth, git config, builds, `wrangler`, npm publish.
- Reporter data crosses job boundaries as JSON files under `ci/reports/`; env crosses shell to TS via exported variables.
- Prefer `buildContextFromEnv()` for reporter env; if reading env directly, keep it at an entrypoint boundary.
- Prefer `execFileSync`/argument arrays for git/process calls. Do not interpolate refs into shell strings.
- Keep fork PR secret boundary intact: run trusted code from `main`, pass untrusted PR state as data (`PR_HEAD_SHA`, deployed preview URL).

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| Running `release-production.sh` as an agent | Publishes, pushes tags/branches, opens PR | Human only; use `DRY_RUN=true` for inspection |
| Adding reporter without `reporters/index.ts` | Registry consumers miss it | Register and export it |
| Falling back to old changesets | Lets unrelated changeset satisfy validation | Only newly added `.changeset/*.md` count |
| Running fork code with secrets | Secret exfiltration risk | Checkout `main`, use artifacts/data from fork |
| Treating `ci/versioning/*` as current workflow path | Most are package/manual scripts | Check workflow call sites first |
| Silent missing-token no-op in required paths | False green CI | Fail loudly unless local preview behavior is intentional |

## COMMANDS

```bash
pnpm tsx ci/scripts/validate-kumo-changeset.ts
pnpm tsx ci/scripts/post-pr-report.ts
DRY_RUN=true pnpm release:production
pnpm publish:beta
pnpm deploy:kumo-docs-preview
pnpm tsx ci/visual-regression/run-visual-regression.ts --full
```

## NOTES

- Repo currently has 10 workflow YAMLs; only some invoke `ci/` helpers.
- `ci/reports/` is runtime output, not a tracked directory.
- `reporters/visual-regression.ts` is registered but the active VR workflow posts directly from `run-visual-regression.ts`.
- npm verification is fixed sleep only: beta 45s, production 30s, no retry loop.
- Screenshot storage now goes through the worker API; do not document old `vr-screenshots-*` branch behavior.
