import {
  forwardRef,
  type FC,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { Button, buttonVariants } from "../button";
import type { Icon } from "@phosphor-icons/react";

/** LayerCard variant definitions (currently empty, reserved for future additions). */
export const KUMO_LAYER_CARD_VARIANTS = {
  // LayerCard currently has no variant options but structure is ready for future additions
} as const;

export const KUMO_LAYER_CARD_DEFAULT_VARIANTS = {} as const;

// Derived types from KUMO_LAYER_CARD_VARIANTS
export interface KumoLayerCardVariantsProps {}

export function layerCardVariants(_props: KumoLayerCardVariantsProps = {}) {
  return cn(
    // Base styles
    "flex w-full flex-col overflow-hidden rounded-lg bg-kumo-elevated text-base ring ring-kumo-hairline",
  );
}

/**
 * LayerCard component props.
 *
 * @example
 * ```tsx
 * <LayerCard>
 *   <LayerCard.Secondary>Next Steps</LayerCard.Secondary>
 *   <LayerCard.Primary>Get started with Kumo</LayerCard.Primary>
 * </LayerCard>
 * ```
 */
export type LayerCardProps = PropsWithChildren<
  KumoLayerCardVariantsProps & {
    /** Additional CSS classes merged via `cn()`. */
    className?: string;
  }
>;

/**
 * LayerCard.Secondary props with optional actions slot.
 */
export type LayerCardSecondaryProps = PropsWithChildren<
  KumoLayerCardVariantsProps & {
    /** Additional CSS classes merged via `cn()`. */
    className?: string;
    /** Actions to display on the right side of the header (e.g., buttons, menus) */
    actions?: ReactNode;
  }
>;

/**
 * Elevated card with primary/secondary content layers for dashboard widgets.
 *
 * @example
 * ```tsx
 * <LayerCard>
 *   <LayerCard.Secondary>Getting Started</LayerCard.Secondary>
 *   <LayerCard.Primary>Quick start guide</LayerCard.Primary>
 * </LayerCard>
 * ```
 *
 * @example With actions
 * ```tsx
 * <LayerCard>
 *   <LayerCard.Secondary
 *     actions={
 *       <Button variant="ghost" size="sm" shape="square" aria-label="Add">
 *         <PlusIcon />
 *       </Button>
 *     }
 *   >
 *     Domains
 *   </LayerCard.Secondary>
 *   <LayerCard.Primary>example.com</LayerCard.Primary>
 * </LayerCard>
 * ```
 */
function LayerCardRoot({ children, className }: LayerCardProps) {
  return <div className={cn(layerCardVariants(), className)}>{children}</div>;
}

function LayerCardSecondary({
  children,
  className,
  actions,
}: LayerCardSecondaryProps) {
  return (
    <div
      className={cn(
        // min-h-10 (40px) accommodates sm buttons (32px) with breathing room
        "flex min-h-10 items-center justify-between gap-3 px-4 bg-kumo-elevated",
        "text-base font-medium text-kumo-strong",
        className,
      )}
    >
      <div className="flex items-center gap-2">{children}</div>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
  );
}

function LayerCardPrimary({ children, className }: LayerCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 overflow-hidden rounded-lg bg-kumo-base p-4 pr-3 text-inherit no-underline ring ring-kumo-fill",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Props passed to the render prop function.
 */
export interface LayerCardActionRenderProps {
  className: string;
  "aria-label": string;
  children: React.ReactNode;
}

/**
 * LayerCard.Action props - pre-configured icon button for header actions.
 */
export interface LayerCardActionProps {
  /** Phosphor icon component */
  icon: Icon;
  /** Accessible label (required) */
  label: string;
  /** Button variant */
  variant?: "ghost" | "secondary";
  /** Click handler (for button) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Render prop for custom elements (e.g., links). Receives className, aria-label, and children. */
  render?: (props: LayerCardActionRenderProps) => React.ReactNode;
}

/**
 * Pre-configured action button for LayerCard headers.
 * Enforces consistent sizing (sm) and shape (square).
 *
 * @example Button
 * ```tsx
 * <LayerCard.Action icon={PlusIcon} label="Add" onClick={handleAdd} />
 * ```
 *
 * @example Link (with render prop)
 * ```tsx
 * <LayerCard.Action
 *   icon={ArrowRightIcon}
 *   label="View details"
 *   render={(props) => <Link to="/details" {...props} />}
 * />
 * ```
 */
const LayerCardAction = forwardRef<HTMLButtonElement, LayerCardActionProps>(
  (
    {
      icon: IconComponent,
      label,
      variant = "ghost",
      onClick,
      disabled,
      render,
    },
    ref,
  ) => {
    const iconNode = <IconComponent size={16} />;

    // Render prop for custom elements (links, etc.)
    if (render) {
      return (
        <>
          {render({
            className: buttonVariants({ variant, size: "sm", shape: "square" }),
            "aria-label": label,
            children: iconNode,
          })}
        </>
      );
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size="sm"
        shape="square"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
      >
        {iconNode}
      </Button>
    );
  },
);

LayerCardAction.displayName = "LayerCard.Action";

type LayerCardComponent = FC<LayerCardProps> & {
  Primary: FC<LayerCardProps>;
  Secondary: FC<LayerCardSecondaryProps>;
  Action: typeof LayerCardAction;
};

const LayerCard = Object.assign(LayerCardRoot, {
  Primary: LayerCardPrimary,
  Secondary: LayerCardSecondary,
  Action: LayerCardAction,
}) as LayerCardComponent;

export { LayerCard };
