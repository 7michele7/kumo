import fs from "fs";
import path from "path";

export default function (plop) {
  // Custom action: inject a nav item alphabetically into the componentItems array
  plop.setActionType("inject-nav-item", (answers, config) => {
    const filePath = config.path;
    const content = fs.readFileSync(filePath, "utf8");
    const label = config.label;
    const href = config.href;
    const newItem = `  { label: "${label}", href: "${href}" },`;

    // Find the marker
    const markerLine = "  // PLOP_INJECT_NAV_ITEM";
    if (!content.includes(markerLine)) {
      throw new Error(`PLOP_INJECT_NAV_ITEM marker not found in ${filePath}`);
    }

    // Find all existing nav items between "const componentItems" and the marker
    const lines = content.split("\n");
    const markerIndex = lines.findIndex((l) =>
      l.includes("PLOP_INJECT_NAV_ITEM"),
    );

    // Collect all existing item lines
    const itemLines = [];
    for (let i = 0; i < markerIndex; i++) {
      if (
        lines[i].match(/^\s*\{ label: ".*", href: "\/components\/.*" \},?$/)
      ) {
        itemLines.push({
          lineIndex: i,
          label: lines[i].match(/label: "([^"]+)"/)[1],
        });
      }
    }

    // Determine where to insert: find the first existing item that sorts after the
    // new label and insert before it. If all existing items sort before, insert
    // just before the marker (end of the list).
    let insertIndex = markerIndex;
    for (const item of itemLines) {
      if (label.toLowerCase() < item.label.toLowerCase()) {
        insertIndex = item.lineIndex;
        break;
      }
    }

    // Insert the new item
    lines.splice(insertIndex, 0, newItem);
    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
    return `Injected nav item "${label}" into ${filePath}`;
  });

  // Docs page generator
  plop.setGenerator("docs-page", {
    description: "Scaffold a new component documentation page",
    prompts: [
      {
        type: "input",
        name: "name",
        message: 'Component name (e.g., "My Component" or "my-component"):',
        validate: (value) => {
          if (!value) return "Component name is required";
          if (value.length < 2)
            return "Component name must be at least 2 characters";
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "One-line description shown under the page title:",
        validate: (value) => {
          if (!value) return "Description is required";
          return true;
        },
      },
      {
        type: "confirm",
        name: "hasBaseUI",
        message: "Is this component backed by a Base UI primitive?",
        default: false,
      },
      {
        type: "input",
        name: "baseUISlug",
        message: 'Base UI component slug (e.g. "switch", "dialog", "select"):',
        when: (answers) => answers.hasBaseUI,
        validate: (value) => {
          if (!value) return "Base UI slug is required";
          return true;
        },
      },
      {
        type: "confirm",
        name: "isCompound",
        message:
          "Is this a compound component (e.g. Dialog.Root, Dialog.Trigger)?",
        default: false,
      },
      {
        type: "confirm",
        name: "needsClientLoad",
        message:
          "Does this component need client:load hydration? (overlays, toasts, interactive dialogs — most use client:visible)",
        default: false,
      },
    ],
    actions: (data) => {
      const actions = [];
      const kebabName = plop.getHelper("kebabCase")(data.name);
      const pascalName = plop.getHelper("pascalCase")(data.name);
      const titleName = data.name
        .split(/[-\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      // 1. Create the MDX page
      actions.push({
        type: "add",
        path: "src/pages/components/{{kebabCase name}}.mdx",
        templateFile: "plop-templates/component-page.mdx.hbs",
        data: {
          titleName,
          hasBaseUI: !!data.hasBaseUI,
          baseUISlug: data.baseUISlug || "",
          isCompound: !!data.isCompound,
          clientDirective: data.needsClientLoad
            ? "client:load"
            : "client:visible",
        },
      });

      // 2. Create the Demo file
      actions.push({
        type: "add",
        path: "src/components/demos/{{pascalCase name}}Demo.tsx",
        templateFile: "plop-templates/component-demo.tsx.hbs",
        data: {
          hasBaseUI: !!data.hasBaseUI,
          isCompound: !!data.isCompound,
          clientDirective: data.needsClientLoad
            ? "client:load"
            : "client:visible",
        },
      });

      // 3. Inject nav item alphabetically into SidebarNav.tsx
      actions.push({
        type: "inject-nav-item",
        path: "src/components/SidebarNav.tsx",
        label: titleName,
        href: `/components/${kebabName}`,
      });

      // 4. Success message
      actions.push(() => {
        const docsRelPath = `packages/kumo-docs-astro`;
        console.log("\n Component docs page scaffolded successfully!");
        console.log(`\n Files created:`);
        console.log(`   - src/pages/components/${kebabName}.mdx`);
        console.log(`   - src/components/demos/${pascalName}Demo.tsx`);
        console.log(`\n Files updated:`);
        console.log(
          `   - src/components/SidebarNav.tsx  (nav item added alphabetically)`,
        );
        console.log(`\n Next steps:`);
        console.log(
          `   1. Fill in the demo functions in src/components/demos/${pascalName}Demo.tsx`,
        );
        console.log(
          `      Each exported function ending in "Demo" becomes a live example.`,
        );
        console.log(
          `   2. Replace the TODO code snippets in src/pages/components/${kebabName}.mdx`,
        );
        console.log(`   3. Run codegen to pick up your new demos:`);
        console.log(
          `      pnpm --filter @cloudflare/kumo-docs-astro codegen:demos`,
        );
        console.log(`      pnpm --filter @cloudflare/kumo codegen:registry`);
        console.log(`   4. Start the dev server: pnpm dev`);
        if (data.isCompound) {
          console.log(`\n   Compound component tip:`);
          console.log(
            `      Add a <PropsTable component="${pascalName}.Root" /> block for each sub-component.`,
          );
        }
        return "Docs page created successfully";
      });

      return actions;
    },
  });
}
