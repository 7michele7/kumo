---
"@cloudflare/kumo-docs-astro": patch
---

docs(layer-card): RFC for first-class composition of `LayerCard.Secondary`

Adds a proposal page documenting a recommended composition pattern for the
`LayerCard.Secondary` slot — a fixed 56px height, `Title` and `Actions`
sub-components, and `render` prop support for whole-area linkable headers.
Prototype components are defined locally in the demo file; this page is the
design artifact for aligning before promoting the changes onto the real
`LayerCard`.
