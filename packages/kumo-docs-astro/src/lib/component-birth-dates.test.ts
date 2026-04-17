import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("node:child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("node:fs", () => ({
  readdirSync: vi.fn(),
}));

import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { getComponentBirthDates } from "./component-birth-dates";

const mockedExecSync = vi.mocked(execSync);
const mockedReaddirSync = vi.mocked(readdirSync);

const pad = (n: number) => String(n).padStart(2, "0");

// Returns an ISO timestamp `daysAgo` days before now, with an explicit timezone offset so it matches the shape of `git log --format=%aI` output.
function daysAgoISO(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

  // Format as YYYY-MM-DDTHH:mm:ss+00:00
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+00:00`
  );
}

// Build a minimal Dirent-like object for readdirSync with withFileTypes.
function direntFor(name: string, kind: "dir" | "file") {
  return {
    name,
    isDirectory: () => kind === "dir",
    isFile: () => kind === "file",
  } as unknown as ReturnType<typeof readdirSync>[number];
}

// Configure the execSync mock to handle both the shallow-clone probe and the git log call.
function setupExecSyncMock(opts: {
  isShallow?: boolean;
  gitLogOutput?: string;
  gitLogThrows?: boolean;
}) {
  const { isShallow = false, gitLogOutput = "", gitLogThrows = false } = opts;

  mockedExecSync.mockImplementation((cmd) => {
    const cmdStr = String(cmd);

    if (cmdStr.includes("--is-shallow-repository")) {
      return (isShallow ? "true\n" : "false\n") as never;
    }

    if (cmdStr.includes("--show-toplevel")) {
      return "/repo-root\n" as never;
    }

    if (cmdStr.includes("--diff-filter=A")) {
      if (gitLogThrows) throw new Error("git log failed");

      return gitLogOutput as never;
    }

    return "" as never;
  });
}

describe("getComponentBirthDates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedReaddirSync.mockReturnValue([] as never);
    mockedExecSync.mockReturnValue("" as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty maps on shallow clone", () => {
    setupExecSyncMock({ isShallow: true });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = getComponentBirthDates();

    expect(result).toEqual({ components: {}, blocks: {}, charts: {} });
    // Only the shallow-repo probe should have been invoked — no git log call.
    expect(mockedExecSync).toHaveBeenCalledTimes(1);
    expect(String(mockedExecSync.mock.calls[0][0])).toContain(
      "--is-shallow-repository",
    );
    // And we should not have scanned any directories.
    expect(mockedReaddirSync).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("includes entries within the cutoff and excludes older ones", () => {
    const recent = daysAgoISO(30);
    const old = daysAgoISO(90);

    const gitLogOutput = [
      recent,
      "",
      "packages/kumo/src/components/recent-component/RecentComponent.tsx",
      "",
      old,
      "",
      "packages/kumo/src/components/old-component/OldComponent.tsx",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ "recent-component": recent });
    expect(result.components).not.toHaveProperty("old-component");
    expect(result.blocks).toEqual({});
    expect(result.charts).toEqual({});
  });

  it("returns empty maps when git log throws", () => {
    setupExecSyncMock({ gitLogThrows: true });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getComponentBirthDates()).toEqual({
      components: {},
      blocks: {},
      charts: {},
    });
    warnSpy.mockRestore();
  });

  it("returns empty maps when git log output is empty", () => {
    setupExecSyncMock({ gitLogOutput: "" });

    const result = getComponentBirthDates();

    expect(result).toEqual({ components: {}, blocks: {}, charts: {} });
  });

  it("parses components and blocks correctly from a single git log output", () => {
    const recent = daysAgoISO(10);

    const gitLogOutput = [
      recent,
      "",
      "packages/kumo/src/components/my-component/MyComponent.tsx",
      "packages/kumo/src/components/my-component/index.ts",
      "packages/kumo/src/blocks/my-block/MyBlock.tsx",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ "my-component": recent });
    expect(result.blocks).toEqual({ "my-block": recent });
  });

  it("uses the oldest (first-added) date when multiple commits touch the same component", () => {
    // git log is newest-first; the last (oldest) date written to the map should win.
    const newer = daysAgoISO(10);
    const older = daysAgoISO(40);

    const gitLogOutput = [
      newer,
      "",
      "packages/kumo/src/components/shared/new-file.tsx",
      "",
      older,
      "",
      "packages/kumo/src/components/shared/original.tsx",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ shared: older });
  });

  it("only includes chart pages that currently exist on disk", () => {
    const recent = daysAgoISO(10);

    // The allowlist only has `timeseries` — `deleted` is in git log but no longer on disk.
    mockedReaddirSync.mockImplementation((dir) => {
      if (String(dir).endsWith("/pages/charts")) {
        return [
          direntFor("timeseries.mdx", "file"),
          direntFor("assets", "dir"),
          direntFor("notes.txt", "file"),
        ] as never;
      }

      return [] as never;
    });

    const gitLogOutput = [
      recent,
      "",
      "packages/kumo-docs-astro/src/pages/charts/timeseries.mdx",
      "packages/kumo-docs-astro/src/pages/charts/deleted.astro",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.charts).toEqual({ timeseries: recent });
    expect(result.charts).not.toHaveProperty("deleted");
  });

  it("skips malformed date lines without crashing", () => {
    const recent = daysAgoISO(5);

    // "not-a-date" doesn't match the ISO regex, so it shouldn't become currentDate
    // and the file line that follows should be ignored (no active date).
    // Then a valid date + file pair should still be picked up.
    const gitLogOutput = [
      "not-a-date",
      "",
      "packages/kumo/src/components/orphaned/orphan.tsx",
      "",
      recent,
      "",
      "packages/kumo/src/components/ok-component/OkComponent.tsx",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ "ok-component": recent });
    expect(result.components).not.toHaveProperty("orphaned");
  });

  it("ignores flat files inside the components and blocks directories", () => {
    const recent = daysAgoISO(10);

    const gitLogOutput = [
      recent,
      "",
      "packages/kumo/src/components/AGENTS.md",
      "packages/kumo/src/components/real/real.tsx",
      "packages/kumo/src/blocks/README.md",
      "packages/kumo/src/blocks/my-block/Block.tsx",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ real: recent });
    expect(result.components).not.toHaveProperty("AGENTS.md");
    expect(result.blocks).toEqual({ "my-block": recent });
    expect(result.blocks).not.toHaveProperty("README.md");
  });

  it("ignores paths outside the tracked prefixes", () => {
    const recent = daysAgoISO(10);

    const gitLogOutput = [
      recent,
      "",
      "packages/kumo/src/components/real/real.tsx",
      "packages/other/unrelated.ts",
      "README.md",
      "",
    ].join("\n");

    setupExecSyncMock({ gitLogOutput });

    const result = getComponentBirthDates();

    expect(result.components).toEqual({ real: recent });
    expect(result.blocks).toEqual({});
    expect(result.charts).toEqual({});
  });
});
