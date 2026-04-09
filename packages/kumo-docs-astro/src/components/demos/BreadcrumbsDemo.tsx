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

// ============================================================================
// PROTOTYPE: Overflow Breadcrumbs
// ============================================================================

type BreadcrumbItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

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
        className={`flex items-center gap-1 overflow-hidden text-sm ${className ?? ""}`}
        aria-label="Breadcrumb"
      >
        {/* Overflow dropdown */}
        {overflowItems.length > 0 && (
          <>
            <Menu.Root>
              <Menu.Trigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label="Show collapsed breadcrumbs"
                    className="shrink-0"
                  >
                    <DotsThreeIcon weight="bold" size={16} />
                  </Button>
                }
              />
              <Menu.Portal>
                <Menu.Positioner className="z-50">
                  <Menu.Popup className="bg-kumo-elevated border border-kumo-line rounded-lg shadow-lg py-3 px-4 min-w-48">
                    {(collapseFrom === "start"
                      ? overflowItems
                      : [...overflowItems].reverse()
                    ).map((item, i, arr) => {
                      const isLast = i === arr.length - 1;
                      const indent = i * 20;

                      return (
                        <div key={i} className="relative flex items-center">
                          {/* Vertical line - runs full height except stops at middle on last item */}
                          {i > 0 && (
                            <div
                              className="absolute left-[9px] w-px bg-kumo-line"
                              style={{
                                top: 0,
                                height: isLast ? "50%" : "100%",
                              }}
                            />
                          )}
                          {/* Horizontal branch */}
                          {i > 0 && (
                            <div
                              className="absolute top-1/2 h-px bg-kumo-line"
                              style={{
                                left: 9,
                                width: indent - 9 + 6,
                              }}
                            />
                          )}
                          <Menu.Item
                            render={<a href={item.href} />}
                            className="py-2 px-2 text-sm text-kumo-default hover:text-kumo-brand rounded cursor-pointer outline-none"
                            style={{ marginLeft: indent }}
                          >
                            {item.label}
                          </Menu.Item>
                        </div>
                      );
                    })}
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
        className="border border-kumo-line rounded-lg p-3 bg-kumo-base"
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
