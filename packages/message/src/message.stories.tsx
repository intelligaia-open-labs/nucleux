import type { Meta, StoryObj } from "@storybook/react";
import { Message } from "./index";

const meta = {
  title: "Chat/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    role: "assistant",
    content: "Hi! I'm an agent built with Nucleux. How can I help you today?",
  },
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Assistant: Story = {};

export const User: Story = {
  args: { role: "user", content: "Summarize the last quarterly report." },
};

export const System: Story = {
  args: { role: "system", content: "You are a helpful, concise assistant." },
};

export const Streaming: Story = {
  args: {
    role: "assistant",
    streaming: true,
    content: "Let me look that up for you",
  },
};

export const Conversation: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-4">
      <Message role="user" content="What's the weather in Tokyo?" />
      <Message role="assistant" content="It's 24°C and clear in Tokyo right now." />
      <Message role="user" content="And tomorrow?" />
      <Message role="assistant" streaming content="Tomorrow looks like light rain" />
    </div>
  ),
};
