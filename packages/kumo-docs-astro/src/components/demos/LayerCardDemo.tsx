"use client";

import { useState } from "react";
import { LayerCard, Badge, DropdownMenu } from "@cloudflare/kumo";
import {
  ArrowRightIcon,
  PlusIcon,
  DotsThreeIcon,
  StarIcon,
  FunnelIcon,
} from "@phosphor-icons/react";

export function LayerCardDemo() {
  return (
    <LayerCard>
      <LayerCard.Secondary
        actions={
          <LayerCard.Action icon={ArrowRightIcon} label="Go to next steps" />
        }
      >
        Next Steps
      </LayerCard.Secondary>
      <LayerCard.Primary>Get started with Kumo</LayerCard.Primary>
    </LayerCard>
  );
}

export function LayerCardBasicDemo() {
  return (
    <LayerCard className="w-[250px]">
      <LayerCard.Secondary>Getting Started</LayerCard.Secondary>
      <LayerCard.Primary>
        <p className="text-sm text-kumo-subtle">
          Quick start guide for new users
        </p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

export function LayerCardMultipleDemo() {
  return (
    <div className="flex gap-4">
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Components</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">Browse all components</p>
        </LayerCard.Primary>
      </LayerCard>
      <LayerCard className="w-[200px]">
        <LayerCard.Secondary>Examples</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">View code examples</p>
        </LayerCard.Primary>
      </LayerCard>
    </div>
  );
}

/**
 * LayerCard with badge in the header.
 */
export function LayerCardWithBadgeDemo() {
  return (
    <LayerCard className="w-[300px]">
      <LayerCard.Secondary>
        Domains
        <Badge variant="neutral">3</Badge>
      </LayerCard.Secondary>
      <LayerCard.Primary>
        <p className="text-sm">example.com</p>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * LayerCard with multiple actions.
 */
export function LayerCardWithActionsDemo() {
  return (
    <LayerCard className="w-[350px]">
      <LayerCard.Secondary
        actions={
          <>
            <LayerCard.Action icon={StarIcon} label="Star" />
            <LayerCard.Action
              icon={PlusIcon}
              label="Add domain"
              variant="secondary"
            />
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <LayerCard.Action icon={DotsThreeIcon} label="More actions" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item>Edit</DropdownMenu.Item>
                <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>Delete</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </>
        }
      >
        Domains
        <Badge variant="neutral">1</Badge>
      </LayerCard.Secondary>
      <LayerCard.Primary>
        <div className="flex items-center gap-2">
          <span className="text-kumo-success">✓</span>
          <span className="text-sm">api.example.com</span>
        </div>
      </LayerCard.Primary>
    </LayerCard>
  );
}

/**
 * Side by side comparison: with and without actions.
 */
export function LayerCardComparisonDemo() {
  return (
    <div className="flex gap-4 items-start">
      <LayerCard className="w-[250px]">
        <LayerCard.Secondary>No Actions</LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">Same header height</p>
        </LayerCard.Primary>
      </LayerCard>
      <LayerCard className="w-[250px]">
        <LayerCard.Secondary
          actions={<LayerCard.Action icon={PlusIcon} label="Add" />}
        >
          With Actions
        </LayerCard.Secondary>
        <LayerCard.Primary>
          <p className="text-sm">Consistent alignment</p>
        </LayerCard.Primary>
      </LayerCard>
    </div>
  );
}

/**
 * LayerCard with view filter using dropdown radio (instead of tabs).
 */
export function LayerCardWithFilterDemo() {
  const [view, setView] = useState("all");

  const items = {
    all: ["api.example.com", "dashboard.example.com", "archived.example.com"],
    active: ["api.example.com", "dashboard.example.com"],
    archived: ["archived.example.com"],
  };

  const filtered = items[view as keyof typeof items];

  return (
    <LayerCard className="w-[350px]">
      <LayerCard.Secondary
        actions={
          <DropdownMenu>
            <DropdownMenu.Trigger>
              <LayerCard.Action icon={FunnelIcon} label="Filter view" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.RadioGroup value={view} onValueChange={setView}>
                <DropdownMenu.RadioItem value="all">
                  All
                  <DropdownMenu.RadioItemIndicator />
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="active">
                  Active
                  <DropdownMenu.RadioItemIndicator />
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="archived">
                  Archived
                  <DropdownMenu.RadioItemIndicator />
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
        }
      >
        Domains
        <Badge variant="neutral">{filtered.length}</Badge>
      </LayerCard.Secondary>
      <LayerCard.Primary>
        <div className="space-y-1">
          {filtered.map((domain) => (
            <div key={domain} className="flex items-center gap-2">
              <span className="text-kumo-success">✓</span>
              <span className="text-sm">{domain}</span>
            </div>
          ))}
        </div>
      </LayerCard.Primary>
    </LayerCard>
  );
}
