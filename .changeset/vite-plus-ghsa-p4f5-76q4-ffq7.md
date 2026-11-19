---
"@cloudflare/kumo": minor
---

Use native elements instead of ARIA roles where oxlint 1.93's `prefer-tag-over-role` and interaction rules flag them. Accessible roles and names are unchanged unless noted:

- `ButtonGroup` renders a `<fieldset>` (native `group` role). Its ref and props are now typed for `HTMLFieldSetElement` instead of `HTMLDivElement`.
- `Loader` wraps its `<svg>` in an `<output>` (native `status` role). The svg is `aria-hidden`, and `className` still applies to the svg.
- `Sidebar.Loading` keeps its root `<div>` and announces its label through a visually hidden `<output>`. The skeleton is `aria-hidden`.
- `Sidebar.CollapsibleContent` no longer sets an unnamed `role="region"`.
- `CloudflareLogo` is named by an SVG `<title>` instead of `role="img"` and `aria-label`. A consumer `aria-label` still overrides it.
- `TimeseriesChart`'s loading skeleton renders as an `<output>`.
- `GlobeMap` keyboard rotation moves from the focusable svg to two visually hidden native range inputs (`<label> longitude` and `<label> latitude`), with a focus ring on the globe. The svg no longer has `role="group"` or `tabIndex`.
