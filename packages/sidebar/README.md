# @nucleux/sidebar

Sidebar — collapsible application sidebar (offcanvas, icon or fixed) with groups, menus and a phone sheet — Nucleux agentic UI for React.

Part of **[Nucleux](https://github.com/intelligaia-open-labs/nucleux)** — agentic UI components for React. Install a single component, or the full kit via [`@nucleux/react`](https://www.npmjs.com/package/@nucleux/react).


## Exports

- **`SidebarProvider`** — wraps the layout; `defaultOpen`/`open`/`onOpenChange`; ⌘B / Ctrl+B toggles; remembers state in the `sidebar_state` cookie
- **`Sidebar`** — `side` (left/right), `variant` (sidebar/floating/inset), `collapsible` (offcanvas/icon/none); a Sheet below `md`
- **`SidebarTrigger`**, **`SidebarRail`**, **`SidebarInset`** (the page), **`SidebarInput`**
- **`SidebarHeader`**, **`SidebarContent`**, **`SidebarFooter`**, **`SidebarSeparator`**
- **`SidebarGroup`**, **`SidebarGroupLabel`**, **`SidebarGroupAction`**, **`SidebarGroupContent`**
- **`SidebarMenu`**, **`SidebarMenuItem`**, **`SidebarMenuButton`** (`isActive`, `tooltip`, `asChild`, `variant`, `size`), **`SidebarMenuAction`**, **`SidebarMenuBadge`**, **`SidebarMenuSkeleton`**
- **`SidebarMenuSub`**, **`SidebarMenuSubItem`**, **`SidebarMenuSubButton`**
- **`useSidebar()`**, **`useIsMobile()`**, **`sidebarMenuButtonVariants()`**

## Install

```bash
pnpm add @nucleux/sidebar @nucleux/tokens
```

`react` / `react-dom` are peer dependencies.

## Usage

```tsx
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger,
} from "@nucleux/sidebar";

<SidebarProvider>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive tooltip="Home">
              <a href="/"><Home /><span>Home</span></a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <header><SidebarTrigger /></header>
    {/* page */}
  </SidebarInset>
</SidebarProvider>
```

Requires the theme once in your app: `import "@nucleux/tokens/styles.css";`
and the Tailwind preset from `@nucleux/tokens/preset`.

## License

MIT © Nucleux
