import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, "../..");

// Items added within this window are flagged as "new".
export const NEW_ITEM_CUTOFF_DAYS = 60;

export interface NewItems {
  components: Record<string, string>;
  blocks: Record<string, string>;
  charts: Record<string, string>;
}

// Paths relative to repo root — passed as cwd to git log below.
const COMPONENTS_REL_PATH = "packages/kumo/src/components/";
const BLOCKS_REL_PATH = "packages/kumo/src/blocks/";
const CHART_PAGES_REL_PATH = "packages/kumo-docs-astro/src/pages/charts/";

const CHART_PAGE_EXTENSIONS = [".mdx", ".astro"] as const;

// Matches lines like "2026-04-15T10:00:00+01:00".
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

// Build the set of chart page basenames (without extension) that currently exist on disk.
// Used as an allowlist when parsing git log output, so we don't surface dates for files
// that have since been deleted or renamed (e.g. an old `.astro` file replaced by `.mdx`).
function getPresentChartPages(): Set<string> {
  const chartPagesDir = resolve(PACKAGE_ROOT, "src/pages/charts");
  try {
    const entries = readdirSync(chartPagesDir, { withFileTypes: true });
    const names = new Set<string>();
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = CHART_PAGE_EXTENSIONS.find((e) => entry.name.endsWith(e));
      if (!ext) continue;
      names.add(entry.name.slice(0, -ext.length));
    }
    return names;
  } catch {
    return new Set();
  }
}

// Returns first-commit dates for components, blocks, and chart pages added within NEW_ITEM_CUTOFF_DAYS.
export function getComponentBirthDates(): NewItems {
  try {
    const isShallow =
      execSync("git rev-parse --is-shallow-repository", {
        encoding: "utf-8",
      }).trim() === "true";
    if (isShallow) {
      console.warn(
        '[kumo-docs-astro] Shallow clone detected — skipping "New" badge detection.',
      );
      return { components: {}, blocks: {}, charts: {} };
    }

    const presentChartPages = getPresentChartPages();

    // Resolve repo root so the git log path arguments (which are relative to the
    // working directory) are interpreted correctly regardless of where the build
    // is invoked from.
    const repoRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();

    // One git log call gets the first-added date for every file under the tracked paths.
    // --diff-filter=A selects only commits where the file was added.
    // --name-only prints paths; --format=%aI prints the author ISO date before each commit's files.
    // Output is newest-first, so by writing into a Map we let the last (oldest) write win.
    const gitOutput = execSync(
      `git log --diff-filter=A --name-only --format=%aI -- ${COMPONENTS_REL_PATH} ${BLOCKS_REL_PATH} ${CHART_PAGES_REL_PATH}`,
      { encoding: "utf-8", cwd: repoRoot },
    );

    const components = new Map<string, string>();
    const blocks = new Map<string, string>();
    const charts = new Map<string, string>();

    let currentDate: string | null = null;
    for (const rawLine of gitOutput.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;

      if (ISO_DATE_RE.test(line)) {
        currentDate = line;
        continue;
      }

      if (!currentDate) continue;

      if (line.startsWith(COMPONENTS_REL_PATH)) {
        const rest = line.slice(COMPONENTS_REL_PATH.length);
        // Only accept files inside a component subdirectory (must contain a "/").
        // Flat files like `components/AGENTS.md` are not component entries.
        const slashIdx = rest.indexOf("/");
        if (slashIdx <= 0) continue; // skip flat files (no slash) and edge cases
        const key = rest.slice(0, slashIdx);
        components.set(key, currentDate);
      } else if (line.startsWith(BLOCKS_REL_PATH)) {
        const rest = line.slice(BLOCKS_REL_PATH.length);
        const slashIdx = rest.indexOf("/");
        if (slashIdx <= 0) continue; // skip flat files (no slash) and edge cases
        const key = rest.slice(0, slashIdx);
        blocks.set(key, currentDate);
      } else if (line.startsWith(CHART_PAGES_REL_PATH)) {
        const filename = line.slice(CHART_PAGES_REL_PATH.length);
        // Chart pages are flat files at the top of the charts dir — ignore anything nested.
        if (filename.includes("/")) continue;
        const ext = CHART_PAGE_EXTENSIONS.find((e) => filename.endsWith(e));
        if (!ext) continue;
        const key = filename.slice(0, -ext.length);
        if (!presentChartPages.has(key)) continue;
        charts.set(key, currentDate);
      }
    }

    const cutoff = new Date(
      Date.now() - NEW_ITEM_CUTOFF_DAYS * 24 * 60 * 60 * 1000,
    );

    const withinCutoff = (map: Map<string, string>): Record<string, string> => {
      const out: Record<string, string> = {};
      for (const [key, iso] of map) {
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) continue;
        if (parsed >= cutoff) out[key] = iso;
      }
      return out;
    };

    return {
      components: withinCutoff(components),
      blocks: withinCutoff(blocks),
      charts: withinCutoff(charts),
    };
  } catch (error) {
    console.warn(
      "[kumo-docs-astro] Could not retrieve component birth dates:",
      error instanceof Error ? error.message : error,
    );
    console.warn(
      "[kumo-docs-astro] This may happen with shallow clones. Set GIT_DEPTH=0 or fetch-depth: 0 in CI.",
    );

    return { components: {}, blocks: {}, charts: {} };
  }
}
