import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar, Home, ListChecks, Mic, Paperclip, Settings, Sparkles } from "lucide-react";
import {
  AgentComposer,
  Avatar,
  Badge,
  GlobalNav,
  IconButton,
  Message,
  Reasoning,
  SearchInput,
  Sidebar,
  SidebarItem,
  Suggestions,
  Thread,
  ToolCall,
} from "../index";

/**
 * A full agent chat screen assembled from Nucleux primitives — app shell +
 * transcript with reasoning, a tool call, streaming, suggestions, and the
 * agent composer.
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
          center={<SearchInput containerClassName="w-72" />}
          right={
            <>
              <IconButton aria-label="Notifications" size="lg">
                <Bell />
              </IconButton>
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
            <Thread className="mx-auto w-full max-w-3xl">
              <Message role="user" content="Summarize the CPQ Q3 scope review and list the action items." />

              <div className="flex w-full max-w-3xl flex-col gap-2">
                <Reasoning
                  defaultOpen
                  content="The user wants a summary plus action items. I'll pull the transcript, extract decisions, then format owners and due dates."
                />
                <ToolCall
                  defaultOpen
                  toolCall={{
                    id: "t1",
                    name: "get_transcript",
                    status: "success",
                    args: { meetingId: "zuora-cpq-q3" },
                    result: { turns: 214, durationSec: 2700 },
                  }}
                />
              </div>

              <Message
                role="assistant"
                content="Here's the summary: the team aligned on a phased CPQ rollout, with pricing rules landing first. Three action items were captured."
              />
              <Message role="assistant" streaming content="Drafting the action item list" />
            </Thread>

            <div className="mx-auto w-full max-w-3xl space-y-3 p-4">
              <Suggestions
                items={["List action items", "Draft a follow-up email", "Show decisions"]}
                onSelect={setValue}
              />
              <AgentComposer
                value={value}
                onValueChange={setValue}
                onSubmit={() => setValue("")}
                leftActions={
                  <IconButton aria-label="Attach" size="sm">
                    <Paperclip />
                  </IconButton>
                }
                rightActions={
                  <>
                    <Badge variant="secondary">Opus 4.8</Badge>
                    <IconButton aria-label="Voice" size="sm">
                      <Mic />
                    </IconButton>
                  </>
                }
              />
            </div>
          </main>
        </div>
      </div>
    );
  },
};
