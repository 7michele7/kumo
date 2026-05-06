# CI Scripts

Executable TypeScript entrypoints. Keep orchestration thin: parse inputs, call `reporters/` or `utils/`, print actionable output, exit with correct status.

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Changeset validation | `validate-kumo-changeset.ts` | PR/local pre-push diff, newly added changesets only |
| Changeset config guard | `ensure-changeset-config.ts` | Restores missing `.changeset/config.json` before `pnpm changeset` |
| Write npm report | `write-npm-report.ts` | Env to `npmReleaseReporter` to artifact |
| Write docs report | `write-kumo-docs-report.ts` | Env to `kumoDocsPreviewReporter` to artifact |
| Post report | `post-pr-report.ts` | Reads artifacts, posts consolidated PR comment |
| Create release PR | `create-release-pr.ts` | Called by `versioning/release-production.sh` |

## CONVENTIONS

- Use `#!/usr/bin/env tsx` for runnable TS scripts.
- Validate required env/CLI inputs near the top and fail loudly for CI-required paths.
- Keep env parsing in the script, not deep utilities, unless it belongs in `buildContextFromEnv()`.
- Keep release PR descriptions compatible with root PR validation if they are meant to pass normal checks.
- Keep changeset validation scoped to `packages/kumo/`; other package policies live elsewhere.

## CHANGESET VALIDATOR RULES

- `changeset-release/*` PR branches skip validation by design.
- Only newly added `.changeset/*.md` files count.
- Existing changesets in the base branch must not satisfy a new `packages/kumo/` change.
- If diff detection fails, validator assumes kumo changed and requires a changeset.

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| Passing tokens as CLI args | Process-list exposure | Prefer env vars for new scripts |
| Direct GitHub API scattered across scripts | Duplicates auth/repo handling | Use `utils/github-api.ts` unless special API needed |
| Type assertions after CLI/env parse | Hides invalid inputs | Parse into a discriminated/validated shape |
| Warning-only missing required inputs | False green CI | Exit non-zero for required CI paths |
| Adding release automation without PR checklist awareness | PR validation may fail | Include required checklist or label strategy |

## NOTES

- `post-pr-report.ts` only comments when at least one artifact parsed successfully.
- `create-release-pr.ts` currently accepts `--token=...`; avoid copying that pattern.
