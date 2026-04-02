---
"@cloudflare/kumo": patch
---

Fix dropdown scroll behavior for long lists

- Add `max-h-[var(--available-height)]` to constrain popup to viewport
- Add inner scroll container with `overflow-y-auto` and `overscroll-contain`
- Prevents content from overflowing viewport on mobile/touch devices
- Matches Base UI's Combobox scroll pattern
