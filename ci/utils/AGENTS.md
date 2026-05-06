# CI Utilities

Shared helpers for git refs/diffs, GitHub API calls, and PR markdown posting. Utilities should be reusable by scripts without reading unrelated env or performing hidden side effects.

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Git refs and changed files | `git-operations.ts` | CI PR refs plus local merge-base fallback |
| GitHub API | `github-api.ts` | Octokit wrapper, hardcoded `cloudflare/kumo` |
| PR comment markdown/posting | `pr-reporter.ts` | Sorts `ReportItem`s, posts consolidated comment |

## CONVENTIONS

- Use `execFileSync` with argument arrays for process calls; never shell-interpolate refs or filenames.
- Keep git helpers dual-mode: GitHub Actions env first, local `origin/main` fallback second.
- Hardcoded repo constants are intentional for this repo unless the caller explicitly needs multi-repo behavior.
- Missing credentials in a required CI path should be failure, not silent success.
- Keep markdown generation deterministic: sort by priority, stable section titles, stable footer.

## GIT DIFF MODEL

- PR CI uses `GITHUB_BASE_REF` and a locally resolvable head ref.
- Local validation uses merge-base with `origin/main` to avoid including unrelated main changes.
- Shallow clones use two-dot diff because merge-base may be unavailable.
- Fork/preview security paths may check out `main`; pass the PR commit as `PR_HEAD_SHA` rather than trusting `HEAD`.

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| `execSync(\`git ... ${ref}\`)` | Env-derived ref injection risk | `execFileSync("git", ["diff", ...])` |
| Utility reads arbitrary `process.env` | Hidden coupling | Pass context from script boundary |
| Returning typed data via `as Type` | Violates repo type-safety standard | Parse/check unknown data |
| Posting duplicate PR comments unintentionally | PR noise | Use marker/upsert when comment is recurring |
| Generalizing hardcoded repo casually | More inputs, more failure modes | Keep repo-local until needed |

## NOTES

- `pr-reporter.ts` currently creates a new comment; visual regression has its own marker/upsert logic.
- `github-api.ts` ignores `CIContext.repository` by design today.
