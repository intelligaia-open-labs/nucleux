import { useState, type MouseEvent, type ReactNode } from "react";
import { Bell, FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";
import {
  Avatar,
  Button,
  Input,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@nucleux/react";

export interface ShellLink {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

export const SHELL_LINKS: ShellLink[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: <LayoutDashboard /> },
  { id: "projects", label: "Projects", href: "/projects", icon: <FolderKanban /> },
  { id: "team", label: "Team", href: "/team", icon: <Users /> },
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings /> },
];

export interface AppShellProps {
  /** id of the active link. */
  current: string;
  /** Called with the link's href; wire it to your router (e.g. `navigate(href)`). */
  onNavigate: (href: string) => void;
  links?: ShellLink[];
  children: ReactNode;
}

/** The nav list. On phones the sidebar is a sheet, so close it after navigating. */
function ShellNav({ links, current, onNavigate }: { links: ShellLink[]; current: string; onNavigate: (href: string) => void }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.id}>
              <SidebarMenuButton asChild isActive={link.id === current} tooltip={link.label}>
                <a
                  href={link.href}
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault();
                    if (isMobile) setOpenMobile(false);
                    onNavigate(link.href);
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

/**
 * Application shell: a Sidebar that collapses to icons on desktop (⌘B / Ctrl+B
 * or the trigger) and becomes a sheet below md, plus a top bar with search
 * and account inside SidebarInset. Page content renders below the bar.
 */
export function AppShell({ current, onNavigate, links = SHELL_LINKS, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="truncate px-2 py-1 text-sm font-semibold text-foreground group-data-[collapsible=icon]:sr-only">
            Acme Projects
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav aria-label="Primary">
            <ShellNav links={links} current={current} onNavigate={onNavigate} />
          </nav>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sm:px-6">
          <SidebarTrigger aria-label="Toggle navigation" />
          <Input
            type="search"
            aria-label="Search projects and tasks"
            placeholder="Search projects and tasks"
            className="hidden max-w-md sm:block"
          />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Avatar role="user" name="Dana Kim" initials="DK" />
          </div>
        </header>
        <div className="min-h-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppShellExample() {
  const [current, setCurrent] = useState("dashboard");
  return (
    <AppShell
      current={current}
      onNavigate={(href) => setCurrent(SHELL_LINKS.find((l) => l.href === href)?.id ?? "dashboard")}
    >
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-muted-foreground">Page content renders here.</p>
      </div>
    </AppShell>
  );
}
