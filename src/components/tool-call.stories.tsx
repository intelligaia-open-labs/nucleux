import type { Meta, StoryObj } from "@storybook/react";
import { ToolCall } from "./tool-call";

const meta = {
  title: "Agent/ToolCall",
  component: ToolCall,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = {
  args: {
    defaultOpen: true,
    toolCall: {
      id: "1",
      name: "search_web",
      status: "running",
      args: { query: "latest Nucleux release notes", limit: 5 },
    },
  },
};

export const Success: Story = {
  args: {
    defaultOpen: true,
    toolCall: {
      id: "2",
      name: "get_weather",
      status: "success",
      args: { city: "Tokyo" },
      result: { tempC: 24, condition: "clear" },
    },
  },
};

export const Error: Story = {
  args: {
    defaultOpen: true,
    toolCall: {
      id: "3",
      name: "charge_card",
      status: "error",
      args: { amount: 4200, currency: "USD" },
      result: "PaymentError: card declined",
    },
  },
};
