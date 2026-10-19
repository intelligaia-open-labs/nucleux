import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar, Home, ListChecks, Settings, Sparkles } from "lucide-react";
import {
  Avatar,
  Button,
  Caveat,
  GlobalNav,
  Input,
  Message,
  MessageScroller,
  OpenInput,
  Sidebar,
  SidebarItem,
  SuggestedPrompts,
} from "../index";

/**
 * A full agent chat screen assembled from Nucleux primitives — app shell, a
 * message list with a streaming reply, suggested prompts, the open input, and
 * the fallibility caveat.
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
    return (
      <div className="flex h-screen flex-col bg-background">
        <GlobalNav
          left={<span className="text-base font-medium text-foreground">Nebula</span>}
          center={<Input type="search" aria-label="Search" placeholder="Search" className="w-72" />}
          right={
            <>
              <Button variant="ghost" size="icon-lg" aria-label="Notifications">
                <Bell />
              </Button>
              <Avatar name="Eric" className="size-8" />
            </>
          }
        />

        <div className="flex min-h-0 flex-1">
          <Sidebar footer={<SidebarItem icon={<Settings />} label="Settings" />}>
            <SidebarItem icon={<Home />} label="Home" />
            <SidebarItem icon={<Sparkles />} label="Assistant" active />
            <SidebarItem icon={<Calendar />} label="Calendar" />
            <SidebarItem icon={<ListChecks />} label="Tasks" />
          </Sidebar>

          <main className="flex min-w-0 flex-1 flex-col">
            <MessageScroller className="mx-auto w-full max-w-3xl">
              <Message role="user" content="Summarize the CPQ Q3 scope review and list the action items." />
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
          </main>
        </div>
      </div>
    );
  },
};
