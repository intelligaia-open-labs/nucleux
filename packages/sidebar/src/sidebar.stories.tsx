import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, FolderKanban, Home, MoreHorizontal, Plus, Settings, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  type SidebarProps,
} from "./index";

const meta = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV = [
  { label: "Home", icon: Home, active: true },
  { label: "Assistant", icon: Sparkles, badge: "3" },
  { label: "Calendar", icon: Calendar },
];

function Shell(props: SidebarProps) {
  return (
    <SidebarProvider>
      <Sidebar {...props}>
        <SidebarHeader>
          <div className="px-2 text-sm font-semibold">Acme</div>
          <SidebarInput type="search" aria-label="Search" placeholder="Search" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ label, icon: Icon, active, badge }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild isActive={active} tooltip={label}>
                      <a href={`#${label.toLowerCase()}`}>
                        <Icon />
                        <span>{label}</span>
                      </a>
                    </SidebarMenuButton>
                    {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupAction aria-label="Add project">
              <Plus />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Website redesign">
                    <FolderKanban />
                    <span>Website redesign</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction showOnHover aria-label="More for Website redesign">
                    <MoreHorizontal />
                  </SidebarMenuAction>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#board" isActive>
                        Board
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton href="#timeline">Timeline</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
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
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <span className="text-sm font-medium">Home</span>
        </header>
        <div className="p-6 text-sm text-muted-foreground">Page content. Press ⌘B / Ctrl+B to toggle the sidebar.</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Default: Story = { render: (args) => <Shell {...args} /> };
export const CollapsesToIcons: Story = { args: { collapsible: "icon" }, render: (args) => <Shell {...args} /> };
export const Floating: Story = { args: { variant: "floating" }, render: (args) => <Shell {...args} /> };
export const Inset: Story = { args: { variant: "inset" }, render: (args) => <Shell {...args} /> };
