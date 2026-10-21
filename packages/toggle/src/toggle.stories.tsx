import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./index";

const meta = {
  title: "Primitives/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Toggle>Bold</Toggle> };

export const Outline: Story = {
  render: () => (
    <div className="flex gap-2">
      <Toggle variant="outline">Italic</Toggle>
      <Toggle variant="outline" defaultPressed>
        Underline
      </Toggle>
    </div>
  ),
};
