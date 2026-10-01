import type { Meta, StoryObj } from "@storybook/react";
import { Md3ToolCall } from "./index";

const meta = {
  title: "Material 3/ToolCall",
  component: Md3ToolCall,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { toolCall: { id: "1", name: "search", status: "success" } },
} satisfies Meta<typeof Md3ToolCall>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Completed: Story = {
  args: { toolCall: { id: "1", name: "search", status: "success" } },
  render: () => (
    <div className="w-96 bg-md-surface p-6">
      <Md3ToolCall
        defaultOpen
        toolCall={{
          id: "1",
          name: "search_web",
          status: "success",
          args: { query: "Q3 renewals at risk" },
          result: "3 accounts found",
        }}
      />
    </div>
  ),
};
