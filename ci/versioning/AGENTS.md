# Versioning Scripts

Shell orchestration for beta publish, manual production release, and docs deploys. These scripts mutate npm, git, and Cloudflare state; treat them as sensitive paths.

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Beta version mutation | `version-beta.sh` | Runs Changesets version, appends `-beta.<sha>` to changed package versions |
| Beta publish | `publish-beta.sh` | npm auth, git config, build, publish beta, verify, report |
| Production release | `release-production.sh` | Branch, version, build, commit, publish, tags, PR |
| Docs preview deploy | `deploy-kumo-docs-preview.sh` | Build, `wrangler versions upload`, derive preview URL, report |
| Docs staging deploy | `deploy-kumo-docs-staging.sh` | Build, `wrangler deploy --env staging` |

## CONVENTIONS

- Shell scripts use `#!/bin/bash` and `set -euo pipefail`.
- Shell owns orchestration and external CLIs; TS owns structured GitHub/report operations.
- Export data to TS report writers via env, e.g. `PACKAGE_VERSION`, `KUMO_DOCS_PREVIEW_URL`.
- Quote path-like variables and branch names.
- Verify publishes/deploys before writing success reports.

## HUMAN-ONLY RULES

- Do not run `release-production.sh` unless explicitly asked by a human.
- Use `DRY_RUN=true pnpm release:production` for inspection.
- Never run `pnpm version`, `pnpm release`, `pnpm publish:beta`, or production release scripts proactively.
- Production script uses `git push --no-verify`; do not copy that bypass into normal workflows.

## REQUIRED ENV

| Script | Required |
| ------ | -------- |
| `publish-beta.sh` | `NPM_TOKEN`; `GITHUB_SHA` optional for beta suffix |
| `release-production.sh` | `GITHUB_TOKEN`; npm auth must be available for publish |
| `deploy-kumo-docs-*.sh` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| Treating these as active workflow implementations | `release.yml`/preview workflows inline some logic | Check workflow call sites first |
| Publishing before build succeeds | Broken npm package | Build first, then publish |
| Assuming npm is instantly consistent | Registry propagation delay | Keep verify step; add retry if changing behavior |
| Writing success report before verification | False PR status | Report after verified output exists |
| Token in CLI args for new scripts | Process-list exposure | Use env vars |

## NOTES

- Beta verification sleeps 45s; production sleeps 30s; neither retries.
- Preview URL fallback constructs from Worker Version ID when wrangler omits the URL.
- `version-beta.sh` requires `jq`.
