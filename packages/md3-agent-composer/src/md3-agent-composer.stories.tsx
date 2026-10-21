import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3AgentComposer } from "./index";

const meta = {
  title: "Material 3/AgentComposer",
  component: Md3AgentComposer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof Md3AgentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[32rem] bg-md-surface p-6">
        <Md3AgentComposer value={value} onValueChange={setValue} onSubmit={() => setValue("")} />
      </div>
    );
  },
};
