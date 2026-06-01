import { LayerCard, Switch, Tabs, Text } from "@cloudflare/kumo";
import type { WizardWidth } from "@cloudflare/kumo";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";

export interface WizardPlaygroundProps {
  width: WizardWidth;
  onWidthChange: (v: WizardWidth) => void;
  sidebar: boolean;
  onSidebarChange: (v: boolean) => void;
  wireframe: boolean;
  onWireframeChange: (v: boolean) => void;
  header: boolean;
  onHeaderChange: (v: boolean) => void;
}

// Playground panel for the Wizard docs demo.
// Controls width, sidebar, and wireframe toggles.
export function WizardPlayground({
  width,
  onWidthChange,
  sidebar,
  onSidebarChange,
  wireframe,
  onWireframeChange,
  header,
  onHeaderChange,
}: WizardPlaygroundProps) {
  return (
    <LayerCard className="absolute bottom-4 start-4 z-10 hidden p-4 md:block">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon size={14} className="text-kumo-subtle" />
          <Text variant="secondary" size="sm" bold>
            Playground
          </Text>
        </div>
        <Tabs
          variant="segmented"
          size="sm"
          tabs={[
            { value: "narrow", label: "Narrow" },
            { value: "wide", label: "Wide" },
          ]}
          value={width}
          onValueChange={(v) => onWidthChange(v as WizardWidth)}
        />
        <Switch
          label="Wireframe"
          size="sm"
          checked={wireframe}
          onCheckedChange={onWireframeChange}
        />
        <Switch
          label="Header"
          size="sm"
          checked={header}
          onCheckedChange={onHeaderChange}
        />
        <Switch
          label="Sidebar"
          size="sm"
          checked={sidebar}
          onCheckedChange={onSidebarChange}
        />
      </div>
    </LayerCard>
  );
}
