import type { Meta, StoryObj } from "@storybook/react";
import { Md3Reasoning } from "./index";

const meta = {
  title: "Material 3/Reasoning",
  component: Md3Reasoning,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { content: "" },
} satisfies Meta<typeof Md3Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { content: "" },
  render: () => (
    <div className="w-96 bg-md-surface p-6">
      <Md3Reasoning
        defaultOpen
        content={"The user asked about renewals.\nI'll check usage trends, then rank by risk."}
      />
    </div>
  ),
};
