import { useState, type MouseEvent, type ReactNode } from "react";
import { Bell, FolderKanban, LayoutDashboard, Menu as MenuIcon, Settings, Users } from "lucide-react";
import {
  Avatar,
  Button,
  GlobalNav,
  Input,
  NavItem,
  NavPanel,
  NavSection,
  Sheet,
  SheetBody,
  SheetHeader,
  SheetTitle,
} from "@nucleux/react";

export interface ShellLink {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

export const SHELL_LINKS: ShellLink[] = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: <LayoutDashboard className="size-4" /> },
  { id: "projects", label: "Projects", href: "/projects", icon: <FolderKanban className="size-4" /> },
  { id: "team", label: "Team", href: "/team", icon: <Users className="size-4" /> },
  { id: "settings", label: "Settings", href: "/settings", icon: <Settings className="size-4" /> },
];

export interface AppShellProps {
  /** id of the active link. */
  current: string;
  /** Called with the link's href; wire it to your router (e.g. `navigate(href)`). */
  onNavigate: (href: string) => void;
  links?: ShellLink[];
  children: ReactNode;
}

/** One nav list, rendered both in the desktop column and in the mobile sheet. */
function ShellNav({
  links,
  current,
  onSelect,
}: {
  links: ShellLink[];
  current: string;
  onSelect: (href: string) => void;
}) {
  return (
    <NavSection title="Workspace">
      {links.map((link) => (
        <NavItem
          key={link.id}
          href={link.href}
          active={link.id === current}
          className="h-9 gap-2 text-sm"
          onClick={(e: MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            onSelect(link.href);
          }}
        >
          {link.icon}
          {link.label}
        </NavItem>
      ))}
    </NavSection>
  );
}

/**
 * Application shell: persistent left navigation on large screens, a top bar
 * with search and account, and a slide-in navigation sheet on small screens.
 * Page content renders inside `<main>`.
 */
export function AppShell({ current, onNavigate, links = SHELL_LINKS, children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const go = (href: string) => {
    setMobileOpen(false);
    onNavigate(href);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <NavPanel aria-label="Primary" className="hidden lg:flex">
        <div className="px-4 text-sm font-semibold text-foreground">Acme Projects</div>
        <ShellNav links={links} current={current} onSelect={go} />
      </NavPanel>

      <div className="flex min-w-0 flex-1 flex-col">
        <GlobalNav
          className="px-4 sm:px-6"
          left={
            <>
              <Button variant="ghost" size="icon" aria-label="Open navigation" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                <MenuIcon className="size-5" />
              </Button>
              <span className="truncate text-sm font-semibold lg:hidden">Acme Projects</span>
            </>
          }
          center={
            <Input
              type="search"
              aria-label="Search projects and tasks"
              placeholder="Search projects and tasks"
              className="hidden w-full max-w-md sm:block"
            />
          }
          right={
            <>
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="size-5" />
              </Button>
              <Avatar role="user" name="Dana Kim" initials="DK" />
            </>
          }
        />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <SheetHeader>
          <SheetTitle>Acme Projects</SheetTitle>
        </SheetHeader>
        <SheetBody className="px-0">
          <nav aria-label="Primary">
            <ShellNav links={links} current={current} onSelect={go} />
          </nav>
        </SheetBody>
      </Sheet>
    </div>
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
