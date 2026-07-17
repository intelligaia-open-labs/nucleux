import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar, Home, ListChecks, Plus, Settings, Sparkles } from "lucide-react";
import {
  Avatar,
  GlobalNav,
  IconButton,
  SearchInput,
  Sidebar,
  SidebarItem,
  SidebarSeparator,
} from "../index";
import { MeetingDashboardBody } from "./meeting-dashboard";

/**
 * Full "day-0-dashboard" app shell — GlobalNav + collapsed Sidebar wrapping the
 * meeting dashboard body. Faithful implementation of the source Figma design
 * (AI-UX-Pattern › day-0-dashboard).
 */
const meta = {
  title: "Examples/Day-0 Dashboard (App Shell)",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function BrandMark() {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-emerald-400 via-teal-500 to-violet-600 text-sm font-semibold text-white">
      P
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div className="flex h-screen flex-col bg-background">
      <GlobalNav
        left={<span className="text-base text-foreground">Heading</span>}
        center={<SearchInput containerClassName="w-72" />}
        right={
          <>
            <div className="relative">
              <IconButton aria-label="Notifications" size="lg">
                <Bell />
              </IconButton>
              <span className="absolute right-2 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </div>
            <Avatar name="Eric" className="size-8" />
          </>
        }
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>
          <BrandMark />
          <IconButton aria-label="New recording" variant="solid">
            <Plus />
          </IconButton>
          <SidebarSeparator />
          <SidebarItem icon={<Home />} label="Home" active />
          <SidebarItem icon={<Sparkles />} label="Assistant" />
          <SidebarItem icon={<Calendar />} label="Calendar" />
          <SidebarItem icon={<ListChecks />} label="Tasks" />
          <SidebarSeparator />
          <SidebarItem icon={<Plus />} label="Add" />
        </Sidebar>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <MeetingDashboardBody />
        </main>
      </div>
    </div>
  ),
};
