import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar, Home, ListChecks, Plus, Settings, Sparkles } from "lucide-react";
import {
  Avatar,
  Button,
  Input,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "../index";
import { MeetingDashboardBody } from "./meeting-dashboard";

/**
 * Full "day-0-dashboard" app shell — a Sidebar collapsed to icons plus a top
 * bar, wrapping the meeting dashboard body. Implementation of the source Figma
 * design (AI-UX-Pattern › day-0-dashboard).
 */
const meta = {
  title: "Examples/Day-0 Dashboard (App Shell)",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV = [
  { label: "Home", icon: Home, active: true },
  { label: "Assistant", icon: Sparkles },
  { label: "Calendar", icon: Calendar },
  { label: "Tasks", icon: ListChecks },
];

function BrandMark() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-brand text-sm font-semibold text-brand-foreground">
      P
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <SidebarProvider defaultOpen={false}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <BrandMark />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton variant="outline" tooltip="New recording">
                <Plus />
                <span>New recording</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ label, icon: Icon, active }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton isActive={active} tooltip={label}>
                      <Icon />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Settings">
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="h-svh overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <SidebarTrigger />
          <span className="text-base text-foreground">Heading</span>
          <Input type="search" aria-label="Search" placeholder="Search" className="mx-auto hidden w-72 sm:block" />
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon-lg" aria-label="Notifications">
                <Bell />
              </Button>
              <span className="absolute right-2 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
            </div>
            <Avatar name="Eric" className="size-8" />
          </div>
        </header>
        <MeetingDashboardBody />
      </SidebarInset>
    </SidebarProvider>
  ),
};
