import type { Meta, StoryObj } from "@storybook/react";
import { RewriteMenu } from "./index";

const meta = {
  title: "Agent/RewriteMenu",
  component: RewriteMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Rewrite", onAction: () => {} },
} satisfies Meta<typeof RewriteMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
