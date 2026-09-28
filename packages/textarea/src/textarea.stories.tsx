import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./index";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { placeholder: "Write a message…" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: (args) => <Textarea {...args} className="w-72" /> };

export const Invalid: Story = { render: (args) => <Textarea {...args} invalid className="w-72" /> };
