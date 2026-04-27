import { useState } from "react";
import { CommandPalette, Button } from "@cloudflare/kumo";
import {
  GearIcon,
  FileIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  HouseIcon,
  ChartLineIcon,
  UsersIcon,
  BrainIcon,
  ShieldIcon,
  DatabaseIcon,
  CubeIcon,
  StackIcon,
  BuildingsIcon,
} from "@phosphor-icons/react";

// Types for our demo data
interface CommandItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
}

// Sample data
const sampleGroups: CommandGroup[] = [
  {
    id: "commands",
    label: "Commands",
    items: [
      {
        id: "new-project",
        title: "Create New Project",
        icon: <FolderIcon size={16} />,
      },
      { id: "settings", title: "Open Settings", icon: <GearIcon size={16} /> },
      {
        id: "search",
        title: "Search Files",
        icon: <MagnifyingGlassIcon size={16} />,
      },
    ],
  },
  {
    id: "pages",
    label: "Pages",
    items: [
      { id: "home", title: "Home", icon: <HouseIcon size={16} /> },
      {
        id: "dashboard",
        title: "Dashboard",
        icon: <ChartLineIcon size={16} />,
      },
      { id: "users", title: "Users", icon: <UsersIcon size={16} /> },
    ],
  },
];

// Helper to flatten groups into selectable items
const getSelectableItems = (groups: CommandGroup[]) =>
  groups.flatMap((group) => group.items);

// Helper to filter groups and their items based on search query
const filterGroupsWithItems = (
  groups: CommandGroup[],
  query: string,
): CommandGroup[] => {
  if (!query) return groups;
  const lowerQuery = query.toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(lowerQuery),
      ),
    }))
    .filter((group) => group.items.length > 0);
};

export function CommandPaletteBasicDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelect = (item: CommandItem) => {
    setSelectedItem(item.title);
    setOpen(false);
    setSearch("");
  };

  // Filter groups based on search
  const filteredGroups = filterGroupsWithItems(sampleGroups, search);

  return (
    <div className="flex flex-col items-start gap-4">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      {selectedItem && (
        <p className="text-sm text-kumo-subtle">
          Last selected:{" "}
          <span className="text-kumo-default">{selectedItem}</span>
        </p>
      )}

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={filteredGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        onSelect={(item, { newTab }) => {
          console.log("Selected:", item.title, newTab ? "(new tab)" : "");
          handleSelect(item);
        }}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Type a command or search..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: CommandGroup) => (
              <CommandPalette.Group key={group.id} items={group.items}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: CommandItem) => (
                    <CommandPalette.Item
                      key={item.id}
                      value={item}
                      onClick={() => handleSelect(item)}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon && (
                          <span className="text-kumo-subtle">{item.icon}</span>
                        )}
                        <span>{item.title}</span>
                      </span>
                    </CommandPalette.Item>
                  )}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No commands found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↵
            </kbd>
            <span>Select</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}

// Simple flat list example
interface SimpleItem {
  id: string;
  title: string;
}

const simpleItems: SimpleItem[] = [
  { id: "1", title: "Copy" },
  { id: "2", title: "Paste" },
  { id: "3", title: "Cut" },
  { id: "4", title: "Delete" },
  { id: "5", title: "Select All" },
];

export function CommandPaletteSimpleDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Simple Palette</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={simpleItems}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        onSelect={(item) => {
          console.log("Selected:", item.title);
          setOpen(false);
        }}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search actions..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SimpleItem) => (
              <CommandPalette.Item
                key={item.id}
                value={item}
                onClick={() => {
                  console.log("Clicked:", item.title);
                  setOpen(false);
                }}
              >
                {item.title}
              </CommandPalette.Item>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No actions found</CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// With loading state
export function CommandPaletteLoadingDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleOpen = () => {
    setOpen(true);
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  };

  // Filter groups based on search
  const filteredGroups = filterGroupsWithItems(sampleGroups, search);

  return (
    <div>
      <Button onClick={handleOpen}>Open with Loading</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={loading ? [] : filteredGroups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(group) => group.label}
        getSelectableItems={getSelectableItems}
      >
        <CommandPalette.Input placeholder="Search..." />
        <CommandPalette.List>
          {loading ? (
            <CommandPalette.Loading />
          ) : (
            <>
              <CommandPalette.Results>
                {(group: CommandGroup) => (
                  <CommandPalette.Group key={group.id} items={group.items}>
                    <CommandPalette.GroupLabel>
                      {group.label}
                    </CommandPalette.GroupLabel>
                    <CommandPalette.Items>
                      {(item: CommandItem) => (
                        <CommandPalette.Item
                          key={item.id}
                          value={item}
                          onClick={() => setOpen(false)}
                        >
                          <span className="flex items-center gap-3">
                            {item.icon && (
                              <span className="text-kumo-subtle">
                                {item.icon}
                              </span>
                            )}
                            <span>{item.title}</span>
                          </span>
                        </CommandPalette.Item>
                      )}
                    </CommandPalette.Items>
                  </CommandPalette.Group>
                )}
              </CommandPalette.Results>
              <CommandPalette.Empty>No results found</CommandPalette.Empty>
            </>
          )}
        </CommandPalette.List>
      </CommandPalette.Root>
    </div>
  );
}

// Cloudflare Dashboard demo — reproduces the dashboard's command palette:
// a "Go to" group with breadcrumb-style navigation results, plus a
// "Search tips" group of `prefix:` shortcuts that drill into account-scoped
// resources (e.g. `aig:my-gateway` searches AI Gateways in the current account).

type DashboardItemKind = "nav" | "tip" | "resource" | "account";

interface DashboardItem {
  id: string;
  kind: DashboardItemKind;
  // Common
  icon?: React.ReactNode;
  // nav
  title?: string;
  breadcrumbs?: string[];
  titleHighlights?: [number, number][];
  breadcrumbHighlights?: [number, number][][];
  // tip
  prefix?: string;
  description?: string;
  // resource
  scopeLabel?: string;
  // account
  accountName?: string;
  isCurrent?: boolean;
}

interface DashboardGroup {
  id: string;
  label: string;
  items: DashboardItem[];
}

interface NavEntry {
  id: string;
  title: string;
  breadcrumbs: string[];
  icon: React.ReactNode;
}

interface TipEntry {
  prefix: string;
  description: string;
  icon: React.ReactNode;
  // For each account, the resources that this prefix searches.
  resources: Record<string, { id: string; name: string }[]>;
}

// Nav entries mirror the Cloudflare dashboard command palette. Only entries
// that have been observed in the dashboard UI are included here — adding
// invented routes will surface as wrong-looking results.
const navEntries: NavEntry[] = [
  { id: "domains", title: "Domains", breadcrumbs: [], icon: <CubeIcon size={16} /> },
  { id: "domains-overview", title: "Overview", breadcrumbs: ["Domains"], icon: <CubeIcon size={16} /> },
  { id: "domains-registrations", title: "Registrations", breadcrumbs: ["Domains"], icon: <CubeIcon size={16} /> },
  { id: "domains-transfers", title: "Transfers", breadcrumbs: ["Domains"], icon: <CubeIcon size={16} /> },
  { id: "compute-containers", title: "Containers", breadcrumbs: ["Build", "Compute"], icon: <CubeIcon size={16} /> },
  { id: "compute-email", title: "Email Service", breadcrumbs: ["Build", "Compute"], icon: <StackIcon size={16} /> },
  { id: "compute-email-sending", title: "Email Sending", breadcrumbs: ["Build", "Compute", "Email Service"], icon: <StackIcon size={16} /> },
  { id: "ai-models", title: "Models", breadcrumbs: ["Build", "AI"], icon: <BrainIcon size={16} /> },
  { id: "ai-vectorize", title: "Vectorize", breadcrumbs: ["Build", "AI"], icon: <BrainIcon size={16} /> },
  { id: "ai-workers-ai", title: "Workers AI", breadcrumbs: ["Build", "AI"], icon: <BrainIcon size={16} /> },
  { id: "ai-gateway", title: "AI Gateway", breadcrumbs: ["Build", "AI"], icon: <BrainIcon size={16} /> },
  { id: "ai-search", title: "AI Search", breadcrumbs: ["Build", "AI"], icon: <BrainIcon size={16} /> },
  { id: "zt-insights-gateway", title: "Gateway", breadcrumbs: ["Zero Trust", "Insights"], icon: <ShieldIcon size={16} /> },
  { id: "zt-logs-gateway", title: "Gateway", breadcrumbs: ["Zero Trust", "Logs"], icon: <ShieldIcon size={16} /> },
];

const tipEntries: TipEntry[] = [
  {
    prefix: "access:",
    description: "Search Access applications",
    icon: <ShieldIcon size={16} />,
    resources: {
      "Personal": [
        { id: "internal", name: "Internal Tools" },
        { id: "billing", name: "Billing Portal" },
      ],
      Kumo: [{ id: "kumo-admin", name: "Kumo Admin" }],
      Foo: [{ id: "foo-admin", name: "Foo Admin" }],
      Bar: [],
    },
  },
  {
    prefix: "aig:",
    description: "Search AI Gateways",
    icon: <BrainIcon size={16} />,
    resources: {
      "Personal": [
        { id: "personal-gpt", name: "personal-gpt" },
        { id: "claude-router", name: "claude-router" },
      ],
      Kumo: [
        { id: "kumo-prod", name: "kumo-production" },
        { id: "kumo-experiments", name: "kumo-experiments" },
      ],
      Foo: [{ id: "foo-prod", name: "foo-prod-gateway" }],
      Bar: [
        { id: "bar-staging", name: "bar-staging" },
        { id: "bar-prod", name: "bar-prod" },
      ],
    },
  },
  {
    prefix: "ais:",
    description: "Search AI Search instances",
    icon: <MagnifyingGlassIcon size={16} />,
    resources: {
      "Personal": [{ id: "docs-search", name: "docs-search" }],
      Kumo: [{ id: "kumo-docs", name: "kumo-docs-search" }],
      Foo: [],
      Bar: [{ id: "bar-knowledge", name: "bar-knowledge-base" }],
    },
  },
  {
    prefix: "containers:",
    description: "Search Container applications",
    icon: <CubeIcon size={16} />,
    resources: {
      "Personal": [{ id: "side-project", name: "side-project-api" }],
      Kumo: [{ id: "kumo-api", name: "kumo-api" }],
      Foo: [{ id: "foo-web", name: "foo-web" }],
      Bar: [],
    },
  },
  {
    prefix: "d1:",
    description: "Search D1 databases",
    icon: <DatabaseIcon size={16} />,
    resources: {
      "Personal": [
        { id: "notes", name: "notes-db" },
        { id: "blog", name: "blog-db" },
      ],
      Kumo: [{ id: "kumo-analytics", name: "kumo-analytics" }],
      Foo: [{ id: "foo-users", name: "foo-users" }],
      Bar: [{ id: "bar-events", name: "bar-events" }],
    },
  },
];

const ACCOUNTS = ["Personal", "Kumo", "Foo", "Bar"] as const;
type AccountName = (typeof ACCOUNTS)[number];

// Find subsequence of `query` in `text`. Returns one [start, end] range per
// matched character, or null when the query can't be matched.
function findSubsequenceCF(
  text: string,
  query: string,
): [number, number][] | null {
  if (!query) return [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const ranges: [number, number][] = [];
  let cursor = 0;
  for (const char of lowerQuery) {
    if (char === " ") continue;
    const found = lowerText.indexOf(char, cursor);
    if (found === -1) return null;
    ranges.push([found, found]);
    cursor = found + 1;
  }
  return ranges;
}

// Highlight a literal substring (case-insensitive). Returns null if no match.
function findSubstring(
  text: string,
  query: string,
): [number, number] | null {
  if (!query) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;
  return [idx, idx + query.length - 1];
}

// Build a "Go to" nav match for a given account + nav entry, threading the
// account through breadcrumbs as the leading crumb so highlights stay aligned.
function makeNavItem(
  entry: NavEntry,
  account: AccountName,
  scopeQuery: string,
  navQuery: string,
): DashboardItem | null {
  const navTrail = [account, ...entry.breadcrumbs];

  // Scope matches the account crumb (only when `>` is present); nav query
  // matches the title or any of the inner breadcrumbs.
  const accountMatch = scopeQuery
    ? findSubsequenceCF(account, scopeQuery)
    : null;
  if (scopeQuery && accountMatch === null) return null;

  let titleMatch: [number, number][] | null = null;
  const innerBreadcrumbMatches: ([number, number][] | null)[] = entry.breadcrumbs.map(
    () => null,
  );

  if (navQuery) {
    titleMatch = findSubsequenceCF(entry.title, navQuery);
    entry.breadcrumbs.forEach((crumb, i) => {
      innerBreadcrumbMatches[i] = findSubsequenceCF(crumb, navQuery);
    });
    const anyMatch =
      titleMatch !== null || innerBreadcrumbMatches.some((m) => m !== null);
    if (!anyMatch) return null;
  }

  return {
    id: `nav-${account}-${entry.id}`,
    kind: "nav",
    title: entry.title,
    breadcrumbs: navTrail,
    icon: entry.icon,
    titleHighlights: titleMatch ?? [],
    breadcrumbHighlights: [
      accountMatch ?? [],
      ...innerBreadcrumbMatches.map((m) => m ?? []),
    ],
  };
}

function buildDashboardGroups(
  query: string,
  currentAccount: AccountName,
): DashboardGroup[] {
  const trimmed = query.trim();

  // --- `xxx:` resource drill-down (uses currently selected account) ---
  for (const tip of tipEntries) {
    if (trimmed.toLowerCase().startsWith(tip.prefix)) {
      const sub = trimmed.slice(tip.prefix.length).trim();
      const resources = tip.resources[currentAccount] ?? [];
      const matched = resources
        .map<DashboardItem | null>((r) => {
          const titleMatch = sub ? findSubstring(r.name, sub) : null;
          if (sub && titleMatch === null) return null;
          return {
            id: `${tip.prefix}-${r.id}`,
            kind: "resource",
            title: r.name,
            scopeLabel: tip.description.replace(/^Search /, ""),
            icon: tip.icon,
            titleHighlights: titleMatch ? [titleMatch] : [],
          };
        })
        .filter((x): x is DashboardItem => x !== null);

      return [
        {
          id: "scope",
          label: `${tip.description.replace(/^Search /, "")} — ${currentAccount}`,
          items: matched,
        },
      ];
    }
  }

  // --- `account:` switcher ---
  if (trimmed.toLowerCase().startsWith("account:")) {
    const sub = trimmed.slice("account:".length).trim();
    const items: DashboardItem[] = ACCOUNTS.filter((a) =>
      sub ? findSubstring(a, sub) !== null : true,
    ).map((a) => ({
      id: `account-${a}`,
      kind: "account",
      accountName: a,
      isCurrent: a === currentAccount,
      icon: <BuildingsIcon size={16} />,
      titleHighlights: sub
        ? ([findSubstring(a, sub)!] as [number, number][])
        : [],
    }));
    return [{ id: "accounts", label: "Switch account", items }];
  }

  // --- `>` token splits an account scope from the nav query ---
  // Examples: "ku > gateway" → scope="ku", nav="gateway"
  //           "kumo > " → scope="kumo", nav=""  (list everything in Kumo)
  //           "gateway"  → scope="", nav="gateway"  (within current account)
  const hasScope = query.includes(">");
  const [rawScope, ...rest] = query.split(">");
  const scopeQuery = hasScope ? rawScope.trim() : "";
  const navQuery = (hasScope ? rest.join(">") : query).trim();

  // Pick which accounts to search.
  const accountsInScope: AccountName[] = hasScope
    ? ACCOUNTS.filter((a) => findSubsequenceCF(a, scopeQuery) !== null)
    : [currentAccount];

  const groups: DashboardGroup[] = [];

  if (trimmed === "") {
    // Empty input → just the search tips.
  } else {
    const navMatches: DashboardItem[] = [];
    for (const account of accountsInScope) {
      for (const entry of navEntries) {
        const item = makeNavItem(entry, account, scopeQuery, navQuery);
        if (item) navMatches.push(item);
      }
    }
    if (navMatches.length > 0) {
      groups.push({ id: "go-to", label: "Go to", items: navMatches });
    }
  }

  // Search tips: always show on empty input, otherwise show only when the
  // query matches a prefix or description (and `>` isn't being used).
  const tipMatches: DashboardItem[] = [];
  for (const tip of tipEntries) {
    if (trimmed) {
      if (hasScope) continue;
      const inPrefix = findSubstring(tip.prefix, trimmed);
      const inDesc = findSubstring(tip.description, trimmed);
      if (inPrefix === null && inDesc === null) continue;
    }
    tipMatches.push({
      id: `tip-${tip.prefix}`,
      kind: "tip",
      prefix: tip.prefix,
      description: tip.description,
      icon: tip.icon,
    });
  }
  if (tipMatches.length > 0) {
    groups.push({ id: "tips", label: "Search tips", items: tipMatches });
  }

  return groups;
}

export function CommandPaletteDashboardDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [account, setAccount] = useState<AccountName>("Personal");
  const [lastAction, setLastAction] = useState<string | null>(null);

  const groups = buildDashboardGroups(search, account);

  const getAllSelectable = (gs: DashboardGroup[]): DashboardItem[] =>
    gs.flatMap((g) => g.items);

  const handleSelect = (item: DashboardItem) => {
    if (item.kind === "account" && item.accountName) {
      setAccount(item.accountName as AccountName);
      setSearch("");
      return;
    }
    if (item.kind === "tip" && item.prefix) {
      setSearch(item.prefix);
      return;
    }
    if (item.kind === "nav") {
      setLastAction(
        `Go to: ${[...(item.breadcrumbs ?? []), item.title].join(" › ")}`,
      );
    } else if (item.kind === "resource") {
      setLastAction(`${item.scopeLabel}: ${item.title} (${account})`);
    }
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => setOpen(true)}>Open Dashboard Palette</Button>
        <span className="flex items-center gap-2 rounded-md border border-kumo-hairline bg-kumo-elevated px-2.5 py-1.5 text-xs text-kumo-strong">
          <BuildingsIcon size={14} />
          <span>{account}</span>
        </span>
      </div>
      {lastAction && (
        <p className="text-sm text-kumo-subtle">
          Last action: <span className="text-kumo-default">{lastAction}</span>
        </p>
      )}

      <CommandPalette.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
        items={groups}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(g) => g.label}
        filter={() => true}
        getSelectableItems={getAllSelectable}
        onSelect={(item) => handleSelect(item)}
      >
        <CommandPalette.Input placeholder="Search products, pages, and features..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(group: DashboardGroup) => (
              <CommandPalette.Group key={group.id} items={group.items}>
                <CommandPalette.GroupLabel>
                  {group.label}
                </CommandPalette.GroupLabel>
                <CommandPalette.Items>
                  {(item: DashboardItem) => {
                    if (item.kind === "nav") {
                      return (
                        <CommandPalette.ResultItem
                          key={item.id}
                          value={item}
                          title={item.title ?? ""}
                          breadcrumbs={item.breadcrumbs}
                          titleHighlights={item.titleHighlights}
                          breadcrumbHighlights={item.breadcrumbHighlights}
                          icon={item.icon}
                          onClick={() => handleSelect(item)}
                        />
                      );
                    }
                    if (item.kind === "resource") {
                      return (
                        <CommandPalette.ResultItem
                          key={item.id}
                          value={item}
                          title={item.title ?? ""}
                          breadcrumbs={
                            item.scopeLabel ? [item.scopeLabel] : undefined
                          }
                          titleHighlights={item.titleHighlights}
                          icon={item.icon}
                          showArrow={false}
                          onClick={() => handleSelect(item)}
                        />
                      );
                    }
                    if (item.kind === "account") {
                      return (
                        <CommandPalette.Item
                          key={item.id}
                          value={item}
                          onClick={() => handleSelect(item)}
                        >
                          <span className="flex w-full items-center gap-3">
                            <span className="text-kumo-subtle">{item.icon}</span>
                            <span className="flex-1">{item.accountName}</span>
                            {item.isCurrent && (
                              <span className="text-[10px] uppercase tracking-wide text-kumo-subtle">
                                Current
                              </span>
                            )}
                          </span>
                        </CommandPalette.Item>
                      );
                    }
                    // tip
                    return (
                      <CommandPalette.Item
                        key={item.id}
                        value={item}
                        onClick={() => handleSelect(item)}
                      >
                        <span className="flex w-full items-center gap-3">
                          <span className="text-kumo-subtle">{item.icon}</span>
                          <span className="font-mono text-sm">
                            {item.prefix}
                          </span>
                          <span className="text-kumo-subtle">—</span>
                          <span className="text-kumo-subtle">
                            {item.description}
                          </span>
                        </span>
                      </CommandPalette.Item>
                    );
                  }}
                </CommandPalette.Items>
              </CommandPalette.Group>
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No results found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>navigate</span>
            <kbd className="ml-2 rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↵
            </kbd>
            <span>select</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              {">"}
            </kbd>
            <span>scope to account</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}

// ResultItem with breadcrumbs and highlights
interface SearchResult {
  id: string;
  title: string;
  breadcrumbs: string[];
  icon?: React.ReactNode;
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "Button",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "2",
    title: "Dialog",
    breadcrumbs: ["Components"],
    icon: <FileIcon size={16} />,
  },
  {
    id: "3",
    title: "Page Header",
    breadcrumbs: ["Blocks"],
    icon: <FileIcon size={16} />,
  },
];

export function CommandPaletteResultItemDemo() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open with ResultItem</Button>

      <CommandPalette.Root
        open={open}
        onOpenChange={setOpen}
        items={searchResults}
        value={search}
        onValueChange={setSearch}
        itemToStringValue={(item) => item.title}
        getSelectableItems={(items) => items}
      >
        <CommandPalette.Input placeholder="Search documentation..." />
        <CommandPalette.List>
          <CommandPalette.Results>
            {(item: SearchResult) => (
              <CommandPalette.ResultItem
                key={item.id}
                value={item}
                title={item.title}
                breadcrumbs={item.breadcrumbs}
                icon={item.icon}
                onClick={() => {
                  console.log("Navigate to:", item.title);
                  setOpen(false);
                }}
              />
            )}
          </CommandPalette.Results>
          <CommandPalette.Empty>No pages found</CommandPalette.Empty>
        </CommandPalette.List>
        <CommandPalette.Footer>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <kbd className="rounded border border-kumo-hairline bg-kumo-base px-1.5 py-0.5 text-[10px]">
              ⌘↵
            </kbd>
            <span>Open in new tab</span>
          </span>
        </CommandPalette.Footer>
      </CommandPalette.Root>
    </div>
  );
}
