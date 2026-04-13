---
"@cloudflare/kumo": minor
---

feat(LayerCard): Add `actions` prop to `LayerCard.Secondary` and `LayerCard.Action` component

- `LayerCard.Secondary` now accepts an `actions` prop for header actions (buttons, menus)
- New `LayerCard.Action` component enforces consistent sizing (sm) and shape (square)
- `LayerCard.Action` supports a `render` prop for custom elements (e.g., links)
- Header height is now consistent (`min-h-10`) whether actions are present or not
