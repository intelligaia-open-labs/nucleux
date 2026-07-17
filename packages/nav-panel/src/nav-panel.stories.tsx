import type { Meta, StoryObj } from "@storybook/react";
import { NavItem, NavPanel, NavPanelHeader, NavSection } from "./index";

const meta = {
  title: "Navigation/NavPanel",
  component: NavPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NavPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Library: Story = {
  render: () => (
    <div className="flex h-screen">
      <NavPanel>
        <NavPanelHeader meta="84 patterns">Library</NavPanelHeader>
        <NavSection title="Onboarding" collapsible>
          <NavItem>Trust &amp; Disclosure</NavItem>
          <NavItem active>Disclosure</NavItem>
          <NavItem>Consent</NavItem>
          <NavItem>Caveat</NavItem>
        </NavSection>
        <NavSection title="Identity">
          <NavItem>Avatar</NavItem>
          <NavItem>Name</NavItem>
          <NavItem>Personality</NavItem>
        </NavSection>
        <NavSection title="During Interaction" collapsible defaultOpen={false}>
          <NavItem>Streaming</NavItem>
          <NavItem>Interruptions</NavItem>
        </NavSection>
      </NavPanel>
      <div className="flex-1 bg-background" />
    </div>
  ),
};
