/**
 * PROPOSAL: First-class composition for `LayerCard.Secondary`
 *
 * Audit of `LayerCard.Secondary` usage across our largest consumer found
 * ~360 usages across ~140 files. ~40 of those reimplement `flex items-center
 * justify-between` with two grouping `<div>`s by hand, plus a long tail of
 * inline icons, tooltips, badges, switches, tabs, and pagination crammed
 * into the same slot.
 *
 * The recommendation in this file rests on three claims:
 *
 *   1. `Secondary` must have a fixed height (56px / `h-14`). Every secondary
 *      header strip in the product should be the same size, regardless of
 *      content. Anything that doesn't fit is the child's problem to solve
 *      (see "Required component tweaks" in the docs page).
 *
 *   2. Two new sub-components, `LayerCard.Title` and `LayerCard.Actions`,
 *      retire the hand-rolled flex layout. Composition only — no slot props.
 *
 *   3. The "entire header is a link" case uses the `render` prop pattern
 *      already idiomatic in kumo (`LayerCard` root, `Tooltip`, etc.). NOT a
 *      separate `SecondaryLink` component. Hover/focus affordances activate
 *      automatically via Tailwind attribute selectors when `render={<a/>}`
 *      is used.
 *
 * Until `LayerCard` itself is updated, this file uses a local `Secondary`
 * stand-in (NOT exported, NOT a public name) that simulates the proposed
 * defaults. Every demo callsite reads exactly as it will under the proposed
 * API once promoted, modulo the `LayerCard.` namespace prefix.
 */

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from "react";
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BookOpenIcon,
  CodeIcon,
  InfoIcon,
} from "@phosphor-icons/react";

import {
  Badge,
  Button,
  LayerCard,
  LinkButton,
  Loader,
  Select,
  SkeletonLine,
  Switch,
  Tabs,
  Tooltip,
  TooltipProvider,
} from "@cloudflare/kumo";

// Tiny local class joiner so this file has no internal-path imports.
const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/* -------------------------------------------------------------------------- */
/*  Stand-in `Secondary` reflecting the proposed defaults                     */
/* -------------------------------------------------------------------------- */

/**
 * Proposed base classes for `LayerCard.Secondary`:
 *
 *   - `h-14` — fixed 56px height. The single most important change.
 *   - `px-4 py-0` — vertical sizing comes from `h-14`, not padding, so
 *     content height variation does NOT affect the strip height.
 *   - `[&[href]]:cursor-pointer [&[href]]:hover:bg-kumo-fill-hover
 *      [&[href]]:focus-visible:outline ...` — link affordances baked in,
 *     scoped with the attribute selector so they only activate when the
 *     rendered element has an `href` (i.e., when consumers use
 *     `render={<a />}`). These are no-ops on the default `<div>` rendering.
 *
 * Plus the existing base classes (`-my-2 flex items-center gap-2
 * bg-kumo-elevated text-base font-medium text-kumo-subtle`).
 */
const PROPOSED_SECONDARY_CLASSES = cn(
  "-my-2 flex h-14 items-center gap-2 bg-kumo-elevated px-4 py-0 text-base font-medium text-kumo-subtle",
  "[&[href]]:cursor-pointer [&[href]]:no-underline [&[href]]:transition-colors",
  "[&[href]]:hover:bg-kumo-fill-hover",
  "[&[href]]:focus-visible:outline-2 [&[href]]:focus-visible:-outline-offset-2 [&[href]]:focus-visible:outline-kumo-focus",
);

/**
 * File-local stand-in for the proposed `LayerCard.Secondary`. Not exported.
 * Demo callsites read `<Secondary>` so this code matches the eventual public
 * API shape (`<LayerCard.Secondary>`) modulo namespace.
 *
 * Supports `render` for the polymorphic case — the real `LayerCard.Secondary`
 * does not yet, and adding it is part of this proposal.
 */
type SecondaryProps = {
  className?: string;
  children: ReactNode;
  /**
   * Render-as element. When passed an `<a>` (or any element with `href`),
   * the link affordances baked into the base classes activate automatically.
   */
  render?: ReactElement;
};

function Secondary({ className, children, render }: SecondaryProps) {
  if (render && isValidElement<{ className?: string; children?: ReactNode }>(render)) {
    return cloneElement(render, {
      className: cn(PROPOSED_SECONDARY_CLASSES, render.props.className, className),
      children,
    });
  }
  return (
    <LayerCard.Secondary className={cn(PROPOSED_SECONDARY_CLASSES, className)}>
      {children}
    </LayerCard.Secondary>
  );
}

/* -------------------------------------------------------------------------- */
/*  Prototype sub-components                                                  */
/* -------------------------------------------------------------------------- */

/**
 * `LayerCard.Title`
 *
 * Semantic, styled label for a Secondary section. Inherits the muted label
 * treatment, but renders a real heading element so screen readers can
 * navigate the page structure.
 *
 * Composition only. No `icon` / `tooltip` / `badge` props — place those as
 * inline children. This keeps the API one-axis (children) and avoids the
 * "what wins, prop or child?" broken state.
 */
type TitleProps<As extends ElementType = "h3"> = {
  as?: As;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<As>, "as" | "className" | "children">;

function Title<As extends ElementType = "h3">({
  as,
  className,
  children,
  ...rest
}: TitleProps<As>) {
  const Tag = (as ?? "h3") as ElementType;
  return (
    <Tag
      className={cn(
        "flex items-center gap-1.5 text-base font-medium text-kumo-subtle",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * `LayerCard.Actions`
 *
 * Trailing action group. Uses `ml-auto` so it pushes itself to the right
 * within Secondary's existing flex container. This deliberately avoids
 * forcing `justify-between` on `Secondary`, which would break the moment
 * a third group needs to appear.
 *
 * JSX order = visual order.
 */
function Actions({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("ml-auto flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Recommended composition: `Title` + `Actions` inside `Secondary`. Replaces
 * the hand-rolled `flex items-center justify-between` + two grouping divs
 * pattern that appears ~40 times in production usage.
 */
export function LayerCardSecondaryProposalDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <Title>Cache Reserve</Title>
        <Actions>
          <Button variant="secondary" size="sm">
            Configure
          </Button>
        </Actions>
      </Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Persistent storage on Cloudflare's network for cached assets.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Archetype demos                                                           */
/* -------------------------------------------------------------------------- */

/** Label-only — the simplest case. `Title` adds the semantic heading. */
export function LayerCardSecondaryLabelOnlyDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <Title>Documentation</Title>
      </Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Quick start guide for new users.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Title with a leading icon and inline info tooltip — composed as siblings,
 * not slot props. The `gap-1.5` on `Title` keeps icon/text/tooltip cohesive.
 */
export function LayerCardSecondaryTitleAdornmentsDemo() {
  return (
    <TooltipProvider>
      <LayerCard className="w-[420px]">
        <Secondary>
          <Title>
            <CodeIcon size={16} />
            Quick start
            <Tooltip
              content="Code snippets for common languages."
              render={
                <span className="text-kumo-subtle">
                  <InfoIcon size={14} />
                </span>
              }
            />
          </Title>
          <Actions>
            <LinkButton
              variant="secondary"
              size="xs"
              href="https://developers.cloudflare.com"
              external
              aria-label="Open documentation"
            >
              <BookOpenIcon size={14} />
            </LinkButton>
          </Actions>
        </Secondary>
        <LayerCard.Primary>
          <p className="text-sm text-kumo-subtle">
            curl https://api.cloudflare.com/...
          </p>
        </LayerCard.Primary>
      </LayerCard>
    </TooltipProvider>
  );
}

/** Status badge alongside title (Beta, New). Just a sibling. */
export function LayerCardSecondaryWithBadgeDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <Title>
          AI Gateway
          <Badge variant="beta">Beta</Badge>
        </Title>
        <Actions>
          <LinkButton variant="secondary" size="sm" href="#">
            View settings
          </LinkButton>
        </Actions>
      </Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Gateway requests through Cloudflare for analytics and caching.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Settings-with-toggle archetype (~30 instances in production usage). Same
 * composition — no `justify-between`, no two grouping divs.
 */
export function LayerCardSecondaryToggleDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <Title>
          Polish
          <Badge variant="beta">Beta</Badge>
        </Title>
        <Actions>
          <Loader size="sm" />
          <Switch size="sm" />
        </Actions>
      </Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Apply lossy or lossless compression to images served from your zone.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Toolbar / filter chrome — segmented `<Tabs>` as the trailing affordance.
 * Tabs go in `Actions`. Note: as of today, kumo Tabs do not have a size
 * variant tuned for the 56px `Secondary` strip. Promoting this proposal
 * requires adding a small Tabs variant — see "Required component tweaks"
 * in the docs page.
 */
export function LayerCardSecondaryToolbarDemo() {
  return (
    <LayerCard className="w-[480px]">
      <Secondary>
        <Title as="h2">Operations</Title>
        <Actions>
          <Tabs
            variant="segmented"
            tabs={[
              { value: "rps", label: "RPS" },
              { value: "total", label: "Total" },
            ]}
            defaultValue="rps"
          />
        </Actions>
      </Secondary>
      <LayerCard.Primary>
        <div className="h-24 rounded bg-kumo-fill" />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Same toolbar use-case as above, but with a `size="sm"` `Select` instead of
 * `Tabs`. This is the recommended alternative *today* — `Select` already has
 * a small variant tuned to fit the 56px `Secondary` strip, whereas `Tabs`
 * does not. For a binary or small ordinal set, prefer `Tabs` once the small
 * variant lands; for 3+ options or longer labels, prefer `Select` regardless.
 */
export function LayerCardSecondaryToolbarSelectDemo() {
  return (
    <LayerCard className="w-[480px]">
      <Secondary>
        <Title as="h2">Operations</Title>
        <Actions>
          <Select
            aria-label="Metric"
            size="sm"
            defaultValue="rps"
            items={{ rps: "RPS", total: "Total" }}
          />
        </Actions>
      </Secondary>
      <LayerCard.Primary>
        <div className="h-24 rounded bg-kumo-fill" />
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Whole-area linkable header. Pure composition via the `render` prop —
 * already idiomatic in kumo (`LayerCard` root, `Tooltip`, `Button`, etc.).
 *
 * Crucially:
 *   - `Secondary` IS the `<a>`, not wrapped in one. Valid HTML.
 *   - Hover, focus-visible, and cursor affordances activate automatically
 *     via Tailwind attribute selectors (`[&[href]]:...`) baked into
 *     Secondary's base classes. Nothing inline.
 *   - Works with React Router: `render={<Link to="/foo" />}`.
 *
 * The trailing affordance is a plain icon, NOT an `Actions` block — a
 * linked Secondary cannot contain interactive children (`<button>` inside
 * `<a>` is invalid HTML). Lint/runtime guard for this is a follow-up.
 */
export function LayerCardSecondaryAsLinkDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary render={<a href="/components/layer-card" aria-label="Browse docs" />}>
        <Title>Browse docs</Title>
        <ArrowRightIcon size={16} className="ml-auto" />
      </Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Step-by-step guides for every Cloudflare product.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Footer pattern — same component, placed below `Primary`. Visually
 * identical to a header, deliberately. Use `render={<footer />}` to
 * communicate the semantic role to assistive tech.
 *
 * Right-aligned actions: just `<Actions>`. No leading `Title`.
 */
export function LayerCardSecondaryFooterDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <Title as="h2">Create namespace</Title>
      </Secondary>
      <LayerCard.Primary>
        <div className="h-12 rounded bg-kumo-fill" />
      </LayerCard.Primary>
      <Secondary render={<footer />}>
        <Actions>
          <LinkButton variant="secondary" size="sm" href="#">
            Cancel
          </LinkButton>
          <Button variant="primary" size="sm">
            Create
          </Button>
        </Actions>
      </Secondary>
    </LayerCard>
  );
}

/**
 * Loading state. No `loading` prop — compose `SkeletonLine` in place of the
 * title content. Replaces the ~10 hand-rolled `animate-pulse` divs in the
 * audit.
 */
export function LayerCardSecondarySkeletonDemo() {
  return (
    <LayerCard className="w-[420px]">
      <Secondary>
        <SkeletonLine className="w-28" />
      </Secondary>
      <LayerCard.Primary>
        <div className="space-y-2">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine className="w-3/4" />
        </div>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Height consistency proof. Stacks every archetype that should fit in the
 * fixed-height `Secondary` strip. If any of these rows is visibly taller or
 * shorter than the others, the recommendation has failed and the offending
 * child needs a smaller variant in kumo.
 */
export function LayerCardSecondaryHeightConsistencyDemo() {
  return (
    <TooltipProvider>
      <div className="flex w-[480px] flex-col gap-3">
        <LayerCard>
          <Secondary>
            <Title>Plain title</Title>
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary>
            <Title>
              <CodeIcon size={16} />
              Adornments
              <Badge variant="beta">Beta</Badge>
              <Tooltip
                content="Help"
                render={
                  <span className="text-kumo-subtle">
                    <InfoIcon size={14} />
                  </span>
                }
              />
            </Title>
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary>
            <Title>Trailing button</Title>
            <Actions>
              <Button variant="secondary" size="sm">
                Configure
              </Button>
            </Actions>
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary>
            <Title>Trailing switch</Title>
            <Actions>
              <Switch size="sm" />
            </Actions>
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary>
            <Title>Trailing select</Title>
            <Actions>
              <Select
                aria-label="Metric"
                size="sm"
                defaultValue="rps"
                items={{ rps: "RPS", total: "Total" }}
              />
            </Actions>
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary>
            <SkeletonLine className="w-28" />
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>

        <LayerCard>
          <Secondary render={<a href="/components/layer-card" aria-label="Browse docs" />}>
            <Title>Linked header</Title>
            <ArrowRightIcon size={16} className="ml-auto" />
          </Secondary>
          <LayerCard.Primary>
            <p className="text-sm text-kumo-subtle">Body</p>
          </LayerCard.Primary>
        </LayerCard>
      </div>
    </TooltipProvider>
  );
}

/**
 * Anti-pattern — what we're trying to retire. Shown for contrast in the docs.
 * ~40 usages in production currently look like this. Note the height of this
 * Secondary varies with content; in the height-consistency demo above, every
 * row is exactly 56px.
 */
export function LayerCardSecondaryAntiPatternDemo() {
  return (
    <LayerCard className="w-[420px]">
      <LayerCard.Secondary className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Cache Reserve</span>
          <Badge variant="beta">Beta</Badge>
          <LinkButton
            className="rounded-full px-2"
            variant="secondary"
            size="xs"
            href="#"
            external
            aria-label="Docs"
          >
            <ArrowSquareOutIcon size={14} />
          </LinkButton>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Loader size="sm" />
          <Switch size="sm" />
        </div>
      </LayerCard.Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Two grouping divs, an inline override of base styling, and no
          semantic heading. This file extracts no shared structure.
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}
