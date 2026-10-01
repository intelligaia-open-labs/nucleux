import type { Meta, StoryObj } from "@storybook/react";
import { InlineFeedback } from "./index";

const meta = {
  title: "Agent/InlineFeedback",
  component: InlineFeedback,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { onCopy: () => {}, onRegenerate: () => {}, onMore: () => {} },
} satisfies Meta<typeof InlineFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RatingsOnly: Story = {
  args: { onCopy: undefined, onRegenerate: undefined, onMore: undefined },
};
