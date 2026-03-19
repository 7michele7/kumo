/**
 * demo-source.ts
 *
 * Server-side utility (Astro build time only) that resolves the JSX source
 * string for a named demo function directly from its *Demo.tsx file.
 *
 * Given a name like "ButtonPrimaryDemo" it will:
 *   1. Derive the file path: src/components/demos/ButtonDemo.tsx
 *   2. Parse that file with the TypeScript AST (same logic as extract-demo-examples.ts)
 *   3. Return the JSX return body, dedented so indentation starts at column 0
 *
 * This runs at Astro build time — no intermediate JSON file required.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const demosDir = join(__dirname, "../components/demos");

// ---------------------------------------------------------------------------
// AST helpers (mirrored from scripts/extract-demo-examples.ts)
// ---------------------------------------------------------------------------

function getNodeText(node: ts.Node, sourceFile: ts.SourceFile): string {
  return node.getText(sourceFile);
}

function dedent(code: string): string {
  const lines = code.split("\n");
  // Find the minimum indentation among all non-empty lines (skip the first
  // line — it has already been stripped of its leading indent by getText()).
  const indents = lines
    .slice(1)
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^(\s*)/)?.[1].length ?? 0);
  const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
  if (minIndent === 0) return code;
  return lines.map((l, i) => (i === 0 ? l : l.slice(minIndent))).join("\n");
}

function cleanupJSX(jsx: string): string {
  jsx = jsx.trim();
  if (jsx.startsWith("(") && jsx.endsWith(")")) {
    jsx = jsx.slice(1, -1).trim();
  }
  return dedent(jsx);
}

function extractReturnJSX(
  body: ts.Block,
  sourceFile: ts.SourceFile,
): string | null {
  let result: string | null = null;
  ts.forEachChild(body, (child) => {
    if (ts.isReturnStatement(child) && child.expression) {
      result = cleanupJSX(getNodeText(child.expression, sourceFile));
    }
  });
  return result;
}

function extractArrowFunctionJSX(
  node: ts.ArrowFunction,
  sourceFile: ts.SourceFile,
): string | null {
  if (ts.isBlock(node.body)) {
    return extractReturnJSX(node.body, sourceFile);
  }
  return cleanupJSX(getNodeText(node.body, sourceFile));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given a demo function name like "ButtonPrimaryDemo", return the verbatim
 * JSX source string of its return value.
 *
 * Returns null if the demo file or function cannot be found.
 */
export function getDemoSource(demoName: string): string | null {
  // "ButtonPrimaryDemo" → component prefix is everything before the last
  // run of capitalised words that ends in "Demo".
  // Simplest reliable heuristic: strip trailing "Demo", then find the
  // matching *Demo.tsx file by trying progressively shorter prefixes.
  if (!demoName.endsWith("Demo")) return null;

  const withoutSuffix = demoName.slice(0, -4); // strip "Demo"

  // Build candidate file names by splitting on each capital letter boundary.
  // e.g. "ButtonPrimary" → tries "ButtonPrimaryDemo.tsx", "ButtonDemo.tsx"
  const candidates: string[] = [];
  // Always try the full name first (handles e.g. "BadgeVariantsDemo" where
  // the file is "BadgeDemo.tsx" not "BadgeVariantsDemo.tsx")
  const words = withoutSuffix.match(/[A-Z][a-z0-9]*/g) ?? [];
  for (let i = words.length; i >= 1; i--) {
    candidates.push(words.slice(0, i).join("") + "Demo.tsx");
  }

  for (const fileName of candidates) {
    const filePath = join(demosDir, fileName);
    let content: string;
    try {
      content = readFileSync(filePath, "utf-8");
    } catch {
      continue; // file doesn't exist, try next candidate
    }

    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    let found: string | null = null;

    ts.forEachChild(sourceFile, (node) => {
      if (found) return;

      // export function FooDemo() { ... }
      if (
        ts.isFunctionDeclaration(node) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
        node.name?.text === demoName &&
        node.body
      ) {
        found = extractReturnJSX(node.body, sourceFile);
        return;
      }

      // export const FooDemo = () => { ... }
      if (
        ts.isVariableStatement(node) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const decl of node.declarationList.declarations) {
          if (
            ts.isIdentifier(decl.name) &&
            decl.name.text === demoName &&
            decl.initializer &&
            ts.isArrowFunction(decl.initializer)
          ) {
            found = extractArrowFunctionJSX(decl.initializer, sourceFile);
            break;
          }
        }
      }
    });

    if (found) return found;
  }

  return null;
}

/**
 * Derive a vrSection slug from a demo function name.
 * "ButtonPrimaryDemo" → "variant-primary" is too lossy to guess,
 * so we produce a reasonable kebab-case slug from the non-component words.
 *
 * "ButtonPrimaryDemo"    → "primary"
 * "BadgeVariantsDemo"    → "variants"
 * "DialogWithSelectDemo" → "with-select"
 * "ButtonIconOnlyDemo"   → "icon-only"
 */
export function deriveVrSection(demoName: string): string {
  if (!demoName.endsWith("Demo")) return demoName.toLowerCase();

  const withoutSuffix = demoName.slice(0, -4);
  const words = withoutSuffix.match(/[A-Z][a-z0-9]*/g) ?? [withoutSuffix];

  // Drop the first word (it's the component name, e.g. "Button")
  const rest = words.slice(1);
  if (rest.length === 0) return "basic";

  return rest.map((w) => w.toLowerCase()).join("-");
}
