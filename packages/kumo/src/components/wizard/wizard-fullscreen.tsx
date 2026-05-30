import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { XIcon } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import {
  KumoPortalProvider,
  usePortalContainer,
  type PortalContainer,
} from "../../utils/portal-provider";

export interface WizardFullscreenContextValue {
  /** Ref to the close button, used by Wizard's focus trap to include it. */
  closeButtonRef: RefObject<HTMLButtonElement | null> | null;
}

export const WizardFullscreenContext =
  createContext<WizardFullscreenContextValue>({
    closeButtonRef: null,
  });

/**
 * Hook to access the fullscreen container context.
 *
 * @example
 * ```tsx
 * const { closeButtonRef } = useWizardFullscreen();
 * ```
 */
export function useWizardFullscreen(): WizardFullscreenContextValue {
  return useContext(WizardFullscreenContext);
}

// Labels for internationalization of Wizard.Fullscreen aria-labels.
// All fields are optional with English defaults.
export interface WizardFullscreenLabels {
  // Aria label for the close button. @default "Close"
  close?: string;
}

const DEFAULT_FULLSCREEN_LABELS: Required<WizardFullscreenLabels> = {
  close: "Close",
};

export interface WizardFullscreenProps {
  /**
   * Accessible name for the dialog container (screen-reader only).
   * Sets `aria-label` on the `role="dialog"` element.
   * @default "Fullscreen container"
   */
  "aria-label"?: string;
  /** Wizard content. */
  children: ReactNode;
  /** Override content wrapper classes. */
  className?: string;
  /**
   * Container element for the portal. Use this to render the wizard inside
   * a Shadow DOM or custom container. Overrides `KumoPortalProvider` context.
   * @default document.body (or KumoPortalProvider container if set)
   */
  container?: PortalContainer;
  // Labels for internationalization of aria-labels. All labels have English defaults.
  labels?: WizardFullscreenLabels;
  /** Callback when the container requests close (Escape key or close button). */
  onClose?: () => void;
  /** Controls visibility. Returns `null` when `false`. */
  open?: boolean;
  /** Whether to show the close button. @default true */
  showCloseButton?: boolean;
}

let scrollLockCount = 0;

function lockScroll() {
  if (typeof document === "undefined") return;
  scrollLockCount++;
  if (scrollLockCount === 1) {
    document.body.classList.add("overflow-hidden");
  }
}

function unlockScroll() {
  if (typeof document === "undefined") return;
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.classList.remove("overflow-hidden");
  }
}

/**
 * Fullscreen modal container for wizard flows. Renders via `createPortal`
 * with `role="dialog"`, `aria-modal`, scroll lock, Escape-to-close, and a
 * floating close button. Portals into the resolved container
 * (prop → KumoPortalProvider → document.body).
 *
 * @example
 * ```tsx
 * <Wizard.Fullscreen open={isOpen} onClose={handleClose}>
 *   <Wizard step={step} onStepChange={setStep}>...</Wizard>
 * </Wizard.Fullscreen>
 * ```
 */
export const WizardFullscreen = forwardRef<
  HTMLDivElement,
  WizardFullscreenProps
>(function WizardFullscreen(
  {
    "aria-label": ariaLabel = "Fullscreen container",
    children,
    className,
    container: containerProp,
    labels: labelsProp,
    onClose,
    open,
    showCloseButton = true,
  },
  ref,
) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const portalContainerRef = useRef<HTMLDivElement>(null);

  // Resolve portal container: prop → KumoPortalProvider context → document.body
  // Matches the convention used by Dialog, Popover, Tooltip, etc.
  const contextContainer = usePortalContainer();
  const resolvedContainer =
    containerProp ??
    contextContainer ??
    (typeof document !== "undefined" ? document.body : null);

  // Merge provided labels with defaults
  const labels = useMemo<Required<WizardFullscreenLabels>>(
    () => ({ ...DEFAULT_FULLSCREEN_LABELS, ...labelsProp }),
    [labelsProp],
  );

  // closeButtonRef is a ref object — its identity never changes across renders,
  // so the empty dependency array is intentionally correct.
  const contextValue = useMemo(() => ({ closeButtonRef }), []);

  // Scroll lock — ref-counted so multiple overlays coexist
  useEffect(() => {
    if (!open) return;

    lockScroll();

    return () => unlockScroll();
  }, [open]);

  // Escape-to-close — handled via effect so the dialog element doesn't
  // need an inline onKeyDown (which triggers no-noninteractive-element-interactions).
  useEffect(() => {
    if (!open || !onClose) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose!();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Don't render when closed, or during SSR
  if (!open) return null;

  if (typeof document === "undefined") return null;

  const rootClassName =
    "fixed inset-0 isolate bg-kumo-canvas flex flex-col outline-none";

  function renderShellContents() {
    return (
      <>
        {showCloseButton && (
          <div className="absolute end-4 top-4 z-10">
            <Button
              aria-label={labels.close}
              icon={<XIcon weight="bold" className="text-kumo-subtle size-4" />}
              onClick={onClose}
              ref={closeButtonRef}
              shape="square"
              variant="ghost"
            />
          </div>
        )}
        <WizardFullscreenContext.Provider value={contextValue}>
          <div className={cn("grow overflow-hidden", className)}>
            {children}
          </div>
        </WizardFullscreenContext.Provider>
      </>
    );
  }

  const rootElement = (
    <div
      aria-label={ariaLabel}
      aria-modal="true"
      className={rootClassName}
      ref={(node) => {
        // Merge forwarded ref and portal container ref
        portalContainerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      role="dialog"
      tabIndex={-1}
    >
      {renderShellContents()}
    </div>
  );

  // Resolve the actual DOM node from the container (which may be a ref)
  const portalTarget =
    resolvedContainer && "current" in resolvedContainer
      ? resolvedContainer.current
      : resolvedContainer;

  if (!portalTarget) return null;

  return createPortal(
    <KumoPortalProvider container={portalContainerRef}>
      {rootElement}
    </KumoPortalProvider>,
    portalTarget,
  );
});

WizardFullscreen.displayName = "Wizard.Fullscreen";
