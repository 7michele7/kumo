import { type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { LayerCard } from "../layer-card";
import { Text } from "../text";
import { ScrollMask } from "./scroll-mask";

/**
 * Card height cap — three-tier formula:
 *  1. Normal viewports: 100vh - 400px (compact card with comfortable bottom margin).
 *  2. Medium-short: holds at 320px floor so the card doesn't collapse.
 *  3. Very short: ceiling (100vh - content-top - 2rem) binds, filling available space.
 * The outer min() guarantees the card never overflows past content-top + 2rem.
 */
const DEFAULT_MAX_HEIGHT =
  "min(calc(100vh - var(--wizard-content-top, 180px) - 2rem), max(calc(100vh - 400px), 320px))";

export interface WizardPageProps {
  /** Card heading text. */
  title?: string;
  /** Description shown below the title. */
  description?: string | ReactNode;
  /** Footer content (e.g., navigation buttons). Rendered outside the primary card surface. */
  footer?: ReactNode;
  /**
   * Raw CSS value for the card's max-height (e.g. `"calc(100vh - 16rem)"`).
   * @default "min(calc(100vh - var(--wizard-content-top, 180px) - 2rem), max(calc(100vh - 400px), 320px))"
   */
  maxHeight?: string;
  /** Additional CSS classes for the card. */
  className?: string;
  /** Card body content. */
  children: ReactNode;
}

/**
 * Card layout inside a wizard step. Wraps content in a `LayerCard`
 * with optional title, description, scrollable body, and footer.
 *
 * @example
 * ```tsx
 * <Wizard.Page
 *   title="Create your account"
 *   description="Fill in the details below"
 *   footer={
 *     <>
 *       <Button variant="secondary">Back</Button>
 *       <Button>Continue</Button>
 *     </>
 *   }
 * >
 *   <form>...</form>
 * </Wizard.Page>
 * ```
 */
function WizardPage({
  title,
  description,
  footer,
  maxHeight = DEFAULT_MAX_HEIGHT,
  className,
  children,
}: WizardPageProps) {
  return (
    <>
      <LayerCard
        data-kumo-component="Wizard"
        data-kumo-part="page"
        data-wizard-card=""
        className={cn("relative flex flex-col rounded-xl", className)}
        style={{ maxHeight }}
      >
        <LayerCard.Primary className="min-h-0 flex-1 p-0">
          <ScrollMask className="min-h-0">
            <div className="flex flex-1 flex-col gap-6 p-4 @sm:p-6">
              {(title || description) && (
                <div className="flex flex-col gap-1">
                  {title && (
                    <Text as="h2" variant="body" size="lg" bold>
                      {title}
                    </Text>
                  )}
                  {description && (
                    <Text size="sm" variant="secondary">
                      {description}
                    </Text>
                  )}
                </div>
              )}
              {children}
            </div>
          </ScrollMask>
        </LayerCard.Primary>
        {footer && (
          <div className="-my-2 flex shrink-0 items-center justify-between gap-2 py-4 px-2">
            {footer}
          </div>
        )}
      </LayerCard>
    </>
  );
}

WizardPage.displayName = "Wizard.Page";

export { WizardPage };
