import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Home, ListChecks, Settings, Sparkles } from "lucide-react";
import { Sidebar, SidebarItem, SidebarSeparator } from "./sidebar";

const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>
        <SidebarItem icon={<Home />} label="Home" active />
        <SidebarItem icon={<Sparkles />} label="Assistant" />
        <SidebarItem icon={<Calendar />} label="Calendar" />
        <SidebarSeparator />
        <SidebarItem icon={<ListChecks />} label="Tasks" />
      </Sidebar>
      <div className="flex-1 bg-muted/30" />
    </div>
  ),
};
