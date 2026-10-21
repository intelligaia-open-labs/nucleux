import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./index";

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={40} aria-label="Volume" />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [v, setV] = useState(25);
    return (
      <div className="w-64 space-y-2">
        <Slider value={v} onValueChange={setV} aria-label="Temperature" step={5} />
        <p className="text-sm text-muted-foreground">Value: {v}</p>
      </div>
    );
  },
};
