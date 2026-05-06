# CI Reporters

Reporters turn CI environment/context into `ReportItem` JSON artifacts for later PR comments. They are a small artifact bus, not a general notification framework.

## WHERE TO LOOK

| Task | Location | Notes |
| ---- | -------- | ----- |
| Core contract | `types.ts` | `ReportItem`, `Reporter`, `CIContext`, artifact IO |
| Registry | `index.ts` | Import, list, and export every reporter |
| npm beta report | `npm-release.ts` | Install commands for published beta versions |
| Docs preview report | `kumo-docs-preview.ts` | Preview URL section, skipped when URL missing |
| VR report adapter | `visual-regression.ts` | Registered but not wired into active VR workflow |

## ARTIFACT BUS

- Producers write exactly one `ReportItem` JSON file to `ci/reports/{id}.json`.
- `id` must be stable, unique, and match the reporter id.
- Lower `priority` renders earlier in the consolidated comment.
- Current effective priorities: npm `10`, visual regression `25`, docs `30`.
- `collect(context)` returns `null` to skip, not a failed placeholder.

## CONVENTIONS

- Keep reporters pure: `CIContext` in, markdown `ReportItem` out.
- Keep env reads in `buildContextFromEnv()` or script entrypoints.
- If a new env field is needed, add it to `CIContext` and `buildContextFromEnv()` together.
- Runtime artifact parsing is a boundary; validate unknown JSON before trusting shape when changing this code.
- Use `writeReportArtifact()` rather than ad hoc file writes.

## ANTI-PATTERNS

| Pattern | Why | Instead |
| ------- | --- | ------- |
| Reporter not registered in `index.ts` | Registry consumers miss it | Add import, array entry, export |
| Duplicate report ids | Later comments become ambiguous | One id per report type |
| Direct GitHub API from a reporter | Breaks artifact bus | Write artifact, let final poster comment |
| Cwd-sensitive new paths | CI jobs run from repo root today only by convention | Resolve intentionally or document cwd |
| Markdown assembly in producers | Duplicates formatter logic | Return `ReportItem.content` only |

## NOTES

- `success` exists on `ReportItem` but current markdown assembly does not branch on it.
- `readReportArtifacts()` records parse failures, but if no valid items remain then `post-pr-report.ts` skips the comment.
