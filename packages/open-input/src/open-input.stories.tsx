import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Paperclip } from "lucide-react";
import { Button } from "@nucleux/button";
import { OpenInput } from "./index";

const meta = {
  title: "Agent/OpenInput",
  component: OpenInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[30rem]"><Story /></div>],
  args: { onSubmit: () => {}, "aria-label": "Message Aria" },
} satisfies Meta<typeof OpenInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default composer: starts as one line, grows with the prompt, counter only near the limit. */
export const ExpandingArea: Story = {
  args: {
    variant: "expanding-area",
    label: "Ask Aria",
    placeholder: "What do you want to know?",
    maxLength: 4000,
    defaultValue: "Summarise yesterday's standup notes for the leadership review tomorrow.",
  },
  render: (args) => {
    const [log, setLog] = useState<string[]>([]);
    return (
      <div className="space-y-3">
        <OpenInput
          {...args}
          actions={
            <Button variant="ghost" size="icon-sm" aria-label="Add context">
              <Paperclip className="size-4" />
            </Button>
          }
          onSubmit={(v) => setLog((l) => [...l, v])}
        />
        <ul className="space-y-1 text-sm text-muted-foreground">
          {log.map((m, i) => (
            <li key={i}>→ {m}</li>
          ))}
        </ul>
      </div>
    );
  },
};

/** Compact one-row pill for dense layouts such as a docked side panel. */
export const SingleLine: Story = {
  args: { variant: "single-line", placeholder: "Type a question…" },
};

/** The field and an explicit send button — ⌘/Ctrl+Enter sends, Enter is a newline. */
export const InputWithSend: Story = {
  args: { variant: "input-with-send", sendKey: "mod-enter", placeholder: "What would you like to do?" },
};

/** Near the limit the counter appears; it turns destructive at the limit. */
export const NearLimit: Story = {
  args: { maxLength: 80, defaultValue: "Draft a renewal note to Acme Corp that mentions the Q3 usage dip and the new SSO." },
};

/** A failed send keeps the text, says what happened and offers Retry. */
export const SendFailed: Story = {
  args: { defaultValue: "Find unresolved decisions from this week's meetings." },
  render: (args) => (
    <OpenInput {...args} onSubmit={() => Promise.reject(new Error("offline"))} />
  ),
};

/** While the agent answers, Send becomes Stop. */
export const Loading: Story = {
  args: { loading: true, defaultValue: "Generating a response…" },
};
