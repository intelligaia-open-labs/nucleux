import type { Meta, StoryObj } from "@storybook/react";
import { GettingStartedPill } from "./getting-started-pill";

const meta = {
  title: "Patterns/GettingStartedPill",
  component: GettingStartedPill,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Getting Started", current: 2, total: 4, open: false },
} satisfies Meta<typeof GettingStartedPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {};

export const Expanded: Story = { args: { open: true } };

export const Complete: Story = { args: { current: 4, total: 4 } };
