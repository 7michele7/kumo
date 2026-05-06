# Visual Regression

Screenshot regression runner for docs component pages. It compares production docs against a preview URL via the screenshot worker, then upserts a PR comment with before/after/diff images.

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Runner | `run-visual-regression.ts` | Env, git diff, worker IO, pixel diff, PR comment |
| Page/change config | `page-config.ts` | Component discovery, canaries, skip/full-impact patterns |
| Local screenshot output | `screenshots/.gitignore` | Keeps local/generated images out of git |

## RUNTIME CONTRACT

- CLI: `pnpm tsx ci/visual-regression/run-visual-regression.ts [--full]`.
- `BEFORE_URL` defaults to `https://kumo-ui.com`.
- `AFTER_URL` or `PREVIEW_URL` points at deployed docs preview.
- `SCREENSHOT_API_KEY` authenticates worker calls.
- `GITHUB_PR_NUMBER`/`PR_NUMBER`, `GITHUB_TOKEN`, and `GITHUB_REPOSITORY` enable PR comments.
- `PR_HEAD_SHA` is the trusted way to diff PR code when checkout points at `main`.

## WORKER CONTRACT

- Worker base URL is intentionally hardcoded and public; `SCREENSHOT_API_KEY` is the secret.
- `POST /batch` captures pages and returns base64 PNGs plus optional worker-hosted image URLs.
- `PUT /screenshots/{key}` uploads generated diff PNGs.
- Docs examples must expose `data-vr-demo`, `data-vr-section`, and `data-vr-title` for stable section screenshots.

## CHANGE CLASSIFICATION

- `--full` screenshots all discovered component pages.
- Diff failure also falls back to all components.
- Component-specific files screenshot matching components only.
- Broad-impact or unknown files run canaries only: `button`, `dialog`, `select`.
- Skippable-only changes exit without comment.
- Unknown files are broad-impact by default.

## CONVENTIONS

- Keep fork safety intact: workflows checkout VR code from `main`, fetch PR SHA separately, pass `PR_HEAD_SHA`.
- Add open-state interactions to `COMPONENT_ACTIONS`; prefer stable selectors over `main button` when available.
- Keep canaries representative: simple, overlay, layout/input-heavy.
- Preserve PR comment marker `<!-- kumo-visual-regression -->` for upserts.
- Fail on worker/API failures that make comparison untrustworthy; tolerate cosmetic diff upload failure only if intentional.

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| Running fork copy of VR with secrets | Secret exfiltration risk | Checkout `main`; pass preview URL and `PR_HEAD_SHA` |
| Shell-interpolated git refs | Ref injection risk | Use arg arrays if touching git code |
| Documenting screenshot branches | Stale behavior | Worker storage under `runs/pr-*/run-*` |
| Adding demo pages without `data-vr-*` | Full-page screenshots become unstable | Use `ComponentExample` VR props |
| Brittle action selectors | Wrong element opens or no-op | Add explicit demo hooks/selectors |

## NOTES

- Component discovery scrapes docs HTML links matching `/components/{slug}`.
- Buffer inequality currently marks changed before checking pixel count; be careful changing diff semantics.
- Missing before/after pairs are skipped today, not failed.
