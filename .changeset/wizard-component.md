---
"@cloudflare/kumo": minor
---

Add `Wizard` — a fullscreen, multi-step flow built as a single composable compound component.

- compound API — `Wizard.Fullscreen`/`Wizard.Grid`/`Wizard`/`Wizard.Steps`/`Wizard.Step`/`Wizard.Page`, plus `useWizard` and `useWizardGrid` hooks
- non-linear step navigation via `goToStep` and a declarative `when` prop, so steps can branch rather than only go linear next/back
- fullscreen overlay with scroll lock, esc to dismiss, and a close button
- optional left-side title (via `Wizard.Grid` `title`) and right-side step indicator (`sidebar` prop, on by default)
- optional decorative wireframe grid
- i18n-ready — the aria-labels are overridable via `labels` props

```tsx
import { Wizard, useWizard, useWizardGrid } from "@cloudflare/kumo";

function CreateWorker({ open, onClose }) {
  const { gridProps, onActiveStepElementChange } = useWizardGrid();

  return (
    <Wizard.Fullscreen open={open} onClose={onClose}>
      <Wizard.Grid title="Create a Worker" {...gridProps}>
        <Wizard onActiveStepElementChange={onActiveStepElementChange}>
          <Wizard.Steps>
            <Wizard.Step stepKey="method" label="Select a method">
              <Wizard.Page title="Ship something new" footer={<Footer />}>
                {/* ... */}
              </Wizard.Page>
            </Wizard.Step>
            {/* ...more steps */}
          </Wizard.Steps>
        </Wizard>
      </Wizard.Grid>
    </Wizard.Fullscreen>
  );
}
```
