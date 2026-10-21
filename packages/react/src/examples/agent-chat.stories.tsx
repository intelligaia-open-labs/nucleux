import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar, FileText, Home, ListChecks, Settings, Sparkles } from "lucide-react";
import {
  Avatar,
  Button,
  Caveat,
  Input,
  Message,
  MessageScroller,
  OpenInput,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SuggestedPrompts,
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../index";

/**
 * A full agent chat screen assembled from Nucleux primitives — sidebar app
 * shell, a message list with the agent's trace and a streaming reply, suggested
 * prompts, the open input, and the fallibility caveat.
 */
const meta = {
  title: "Examples/Agent Chat",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    const nav = [
      { label: "Home", icon: Home },
      { label: "Assistant", icon: Sparkles, active: true },
      { label: "Calendar", icon: Calendar },
      { label: "Tasks", icon: ListChecks },
      { label: "Settings", icon: Settings },
    ];
    return (
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <span className="px-2 text-base font-medium text-foreground group-data-[collapsible=icon]:sr-only">Nebula</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map(({ label, icon: Icon, active }) => (
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
        </Sidebar>

        <SidebarInset className="h-svh">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
            <SidebarTrigger />
            <Input type="search" aria-label="Search" placeholder="Search" className="hidden w-72 sm:block" />
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell />
              </Button>
              <Avatar name="Eric" className="size-8" />
            </div>
          </header>

          <MessageScroller className="mx-auto w-full max-w-3xl">
            <Message role="user" content="Summarize the CPQ Q3 scope review and list the action items." />
            <Trace className="px-4">
              <TraceCollapsible defaultOpen>
                <TraceCollapsibleTrigger>
                  <TraceLine>
                    <TraceIcon>
                      <FileText />
                    </TraceIcon>
                    <TraceTitle>Read the meeting transcript</TraceTitle>
                    <TraceDescription>214 turns · 45 min</TraceDescription>
                  </TraceLine>
                </TraceCollapsibleTrigger>
                <TraceCollapsibleContent>zuora-cpq-q3 · decisions and owners extracted</TraceCollapsibleContent>
              </TraceCollapsible>
            </Trace>
            <Message
              role="assistant"
              content="Here's the summary: the team aligned on a phased CPQ rollout, with pricing rules landing first. Three action items were captured."
            />
            <Message role="assistant" streaming content="Drafting the action item list" />
          </MessageScroller>

          <div className="mx-auto w-full max-w-3xl space-y-3 p-4">
            <SuggestedPrompts
              items={["List action items", "Draft a follow-up email", "Show decisions"]}
              onSelect={setValue}
            />
            <OpenInput value={value} onValueChange={setValue} onSubmit={() => setValue("")} />
            <Caveat />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};
