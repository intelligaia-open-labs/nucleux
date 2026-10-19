import type { Meta, StoryObj } from "@storybook/react";
import { Caveat } from "./index";

const meta = {
  title: "Agent/Caveat",
  component: Caveat,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Caveat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Custom: Story = {
  args: { children: "Figures are from the Q2 export and may be out of date." },
};
