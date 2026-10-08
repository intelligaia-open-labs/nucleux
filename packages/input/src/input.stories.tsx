import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./index";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { placeholder: "Type here…" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Input {...args} className="w-64" /> };

export const Invalid: Story = {
  render: (args) => <Input {...args} invalid className="w-64" defaultValue="not-an-email" />,
};

export const Disabled: Story = { render: (args) => <Input {...args} disabled className="w-64" /> };
