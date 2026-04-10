import { useRef, useState, useEffect, type ReactNode } from "react";
import { Breadcrumbs, Button } from "@cloudflare/kumo";
import { Menu } from "@cloudflare/kumo/primitives/menu";
import {
  HouseIcon,
  DotsThreeIcon,
  CaretRightIcon,
  DatabaseIcon,
} from "@phosphor-icons/react";

export function BreadcrumbsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithIconsDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<HouseIcon size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Projects</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Current Project</Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsLoadingDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#" icon={<HouseIcon size={16} />}>
        Home
      </Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current loading></Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsRootDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Current icon={<HouseIcon size={16} />}>
        Worker Analytics
      </Breadcrumbs.Current>
    </Breadcrumbs>
  );
}

export function BreadcrumbsWithClipboardDemo() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
      <Breadcrumbs.Separator />
      <Breadcrumbs.Current>Breadcrumbs</Breadcrumbs.Current>
      <Breadcrumbs.Clipboard text="#" />
    </Breadcrumbs>
  );
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-kumo-base"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-kumo-tip-shadow"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="fill-kumo-tip-stroke"
      />
    </svg>
  );
}

// ============================================================================
// PROTOTYPE: Overflow Breadcrumbs
// ============================================================================

type BreadcrumbItem = {
  label: string;
  /** Anchor navigation (renders a real `<a>` via `Menu.LinkItem`). */
  href?: string;
  /** Override the underlying element (e.g. router `Link`). */
  render?: React.ReactElement;
  icon?: ReactNode;
};

/**
 * Overflow menu list that visually shows a breadcrumb path as an indented tree.
 *
 * Uses Base UI `Menu.Item` for keyboard navigation, with a single SVG overlay
 * to draw the connector lines. This keeps the semantics and interaction intact
 * while letting us fully control the visual.
 */
function TreeMenu({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  // Keep these in sync with the Menu.Item layout below.
  const ROW_H = 32; // `h-8`
  const BASE_X = 6; // root spine x (keep left of root label)
  const INDENT = 14; // per-level indent (relaxed depth)
  const BRANCH = 6; // horizontal branch into label (shorter)
  const TEXT_GAP = 10; // space between branch and text

  const totalHeight = items.length * ROW_H;
  const yCenter = (index: number) => index * ROW_H + ROW_H / 2;
  const xLevel = (level: number) => BASE_X + level * INDENT;
  const xText = (level: number) => xLevel(level) + BRANCH + TEXT_GAP;

  return (
    <div className="relative" style={{ height: totalHeight }}>
      <svg
        className="pointer-events-none absolute inset-0"
        aria-hidden
        focusable="false"
      >
        {/*
          One full L-connector per item.
          This avoids overlapping stroke caps at joints (which can darken pixels
          when using opacity) and keeps the connectors crisp.
        */}
        {items.map((_, i) => {
          if (i === 0) return null;

          const x1 = xLevel(i - 1);
          const x2 = xLevel(i) + BRANCH;
          const y2 = yCenter(i);
          // Avoid drawing through the root label: start below row 0 for the first connector.
          const y1 = i === 1 ? yCenter(0) + ROW_H / 2 : yCenter(i - 1);

          return (
            <path
              key={`l-${i}`}
              d={`M ${x1} ${y1} V ${y2} H ${x2}`}
              stroke="var(--color-kumo-line)"
              strokeWidth="1"
              strokeLinecap="butt"
              strokeLinejoin="miter"
              fill="none"
            />
          );
        })}
      </svg>

      <div className="relative flex flex-col">
        {items.map((item, i) =>
          item.render ? (
            <Menu.Item
              key={i}
              render={item.render}
              label={item.label}
              closeOnClick
              className={
                // Keep layout deterministic for the SVG overlay (avoid margins).
                // Match Select/Combobox interaction styling (highlight-driven).
                "flex h-8 min-w-0 cursor-pointer items-center rounded px-2 text-sm text-kumo-default outline-none select-none " +
                // Use a little alpha so connector lines stay visible when highlighted.
                "data-highlighted:bg-kumo-tint/60"
              }
              style={{ paddingLeft: i === 0 ? 8 : xText(i) }}
            >
              <span className="min-w-0 truncate">{item.label}</span>
            </Menu.Item>
          ) : (
            <Menu.LinkItem
              key={i}
              href={item.href ?? "#"}
              label={item.label}
              closeOnClick
              className={
                "flex h-8 min-w-0 cursor-pointer items-center rounded px-2 text-sm text-kumo-default outline-none select-none " +
                "data-highlighted:bg-kumo-tint/60"
              }
              style={{ paddingLeft: i === 0 ? 8 : xText(i) }}
            >
              <span className="min-w-0 truncate">{item.label}</span>
            </Menu.LinkItem>
          ),
        )}
      </div>
    </div>
  );
}

/**
 * Prototype: Data-driven breadcrumbs with overflow collapse.
 * Items that don't fit collapse into a dropdown menu.
 *
 * API inspired by Blueprint JS:
 * - `items`: Array of breadcrumb data
 * - `collapseFrom`: "start" (default) or "end"
 * - `minVisibleItems`: Minimum items to always show
 */
function OverflowBreadcrumbs({
  items,
  currentItem,
  collapseFrom = "start",
  minVisibleItems = 1,
  className,
}: {
  items: BreadcrumbItem[];
  currentItem: BreadcrumbItem;
  collapseFrom?: "start" | "end";
  minVisibleItems?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [currentItemWidth, setCurrentItemWidth] = useState(0);
  const [measured, setMeasured] = useState(false);

  // Measure all items once on mount
  useEffect(() => {
    if (!measureRef.current) return;

    const measureContainer = measureRef.current;
    const itemEls = measureContainer.querySelectorAll("[data-measure-item]");
    const currentEl = measureContainer.querySelector("[data-measure-current]");

    const widths = Array.from(itemEls).map(
      (el) => el.getBoundingClientRect().width,
    );
    const currentWidth = currentEl?.getBoundingClientRect().width ?? 100;

    setItemWidths(widths);
    setCurrentItemWidth(currentWidth);
    setMeasured(true);
  }, [items, currentItem]);

  // Compute overflow based on cached widths
  useEffect(() => {
    if (!measured || !containerRef.current) return;

    const computeOverflow = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const overflowButtonWidth = 36;
      const separatorWidth = 20;

      // Start with space needed for current item only
      let usedWidth = currentItemWidth;
      let visibleCount = 0;

      // Measure from the end (items closest to current) to preserve parent context
      for (let i = items.length - 1; i >= 0; i--) {
        const itemWidth = itemWidths[i] ?? 80;
        // Each visible item needs: separator before it + the item itself
        const neededWidth = separatorWidth + itemWidth;

        // If we have overflow, we need space for the overflow button + its separator
        const itemsBeforeThis = i;
        const willHaveOverflow = itemsBeforeThis > 0;
        const overflowSpace = willHaveOverflow
          ? overflowButtonWidth + separatorWidth
          : 0;

        // Check if adding this item (plus overflow button if needed) fits
        if (usedWidth + neededWidth + overflowSpace <= containerWidth) {
          usedWidth += neededWidth;
          visibleCount++;
        } else {
          // Can't fit this item - check if we need overflow button space
          // All remaining items go to overflow
          break;
        }
      }

      // Don't enforce minVisibleItems if it would cause overflow/truncation
      // Only apply it if there's actually room
      const overflowNeeded = items.length - visibleCount;
      if (overflowNeeded > 0 && overflowNeeded < items.length) {
        // We have some overflow - check if minVisibleItems fits
        const minVisible = Math.min(minVisibleItems, items.length);
        if (visibleCount < minVisible) {
          // Check if forcing minVisibleItems would actually fit
          let testWidth =
            currentItemWidth + overflowButtonWidth + separatorWidth;
          for (let i = items.length - minVisible; i < items.length; i++) {
            testWidth += separatorWidth + (itemWidths[i] ?? 80);
          }
          if (testWidth <= containerWidth) {
            visibleCount = minVisible;
          }
        }
      }

      setOverflowCount(items.length - visibleCount);
    };

    computeOverflow();

    const observer = new ResizeObserver(computeOverflow);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measured, items.length, itemWidths, currentItemWidth, minVisibleItems]);

  // Split items into overflow and visible
  const overflowItems =
    collapseFrom === "start"
      ? items.slice(0, overflowCount)
      : items.slice(items.length - overflowCount);

  const visibleItems =
    collapseFrom === "start"
      ? items.slice(overflowCount)
      : items.slice(0, items.length - overflowCount);

  return (
    <>
      {/* Hidden measurement container - renders all items to measure their natural width */}
      <div
        ref={measureRef}
        className="pointer-events-none absolute flex items-center gap-1 text-sm opacity-0"
        aria-hidden
      >
        {items.map((item, index) => (
          <span
            key={index}
            data-measure-item
            className="flex shrink-0 items-center gap-1 whitespace-nowrap"
          >
            {item.icon}
            <span>{item.label}</span>
          </span>
        ))}
        <span
          data-measure-current
          className="flex shrink-0 items-center gap-1 font-medium whitespace-nowrap"
        >
          {currentItem.icon}
          <span>{currentItem.label}</span>
        </span>
      </div>

      <nav
        ref={containerRef}
        className={`flex items-center gap-1 text-sm ${className ?? ""}`}
        aria-label="Breadcrumb"
      >
        {/* Overflow dropdown */}
        {overflowItems.length > 0 && (
          <>
            <Menu.Root>
              <Menu.Trigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Show collapsed breadcrumbs"
                    icon={<DotsThreeIcon weight="bold" size={16} />}
                    className="shrink-0"
                  ></Button>
                }
              />
              <Menu.Portal>
                <Menu.Positioner sideOffset={8} align="start">
                  <Menu.Popup
                    className={
                      "min-w-48 rounded-lg p-2 " +
                      // Match Kumo DropdownMenu styling (no arrow).
                      "bg-kumo-control text-kumo-default shadow-lg ring ring-kumo-line"
                    }
                  >
                    <TreeMenu
                      items={
                        collapseFrom === "start"
                          ? overflowItems
                          : [...overflowItems].reverse()
                      }
                    />
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
            <Separator />
          </>
        )}

        {/* Visible items */}
        {visibleItems.map((item, index) => (
          <span key={index} className="contents">
            <a
              href={item.href}
              className="flex shrink-0 items-center gap-1 text-kumo-subtle hover:text-kumo-default whitespace-nowrap"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
            <Separator />
          </span>
        ))}

        {/* Current item (never collapses) */}
        <span className="flex shrink-0 items-center gap-1 font-medium whitespace-nowrap">
          {currentItem.icon}
          <span>{currentItem.label}</span>
        </span>
      </nav>
    </>
  );
}

function Separator() {
  return (
    <CaretRightIcon
      size={16}
      className="shrink-0 text-kumo-inactive"
      aria-hidden
    />
  );
}

/**
 * Interactive demo showing breadcrumbs with overflow behavior.
 * Drag the slider to resize and watch items collapse into a dropdown.
 */
export function BreadcrumbsOverflowDemo() {
  const [width, setWidth] = useState(500);

  // Realistic Cloudflare dashboard route: D1 database settings
  const items: BreadcrumbItem[] = [
    {
      label: "Acme Corp",
      href: "#",
      icon: <HouseIcon size={16} className="shrink-0" />,
    },
    { label: "Workers & Pages", href: "#" },
    { label: "D1 SQL Databases", href: "#" },
    { label: "production-db", href: "#" },
  ];

  const currentItem: BreadcrumbItem = {
    label: "Settings",
    href: "#",
    icon: <DatabaseIcon size={16} className="shrink-0" />,
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-kumo-subtle whitespace-nowrap">
          Container width:
        </label>
        <input
          type="range"
          min={200}
          max={600}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          className="flex-1 max-w-48"
        />
        <span className="text-sm text-kumo-subtle tabular-nums w-14">
          {width}px
        </span>
      </div>

      <div
        className="border border-kumo-line rounded-lg p-5 bg-kumo-base"
        style={{ width }}
      >
        <OverflowBreadcrumbs
          items={items}
          currentItem={currentItem}
          collapseFrom="start"
          minVisibleItems={1}
        />
      </div>
    </div>
  );
}
