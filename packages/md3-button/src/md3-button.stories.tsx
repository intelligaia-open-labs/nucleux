import type { Meta, StoryObj } from "@storybook/react";
import { Md3Button } from "./index";

const meta = {
  title: "Material 3/Button",
  component: Md3Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 rounded-md-lg bg-md-surface p-6">
      <Md3Button variant="filled">Filled</Md3Button>
      <Md3Button variant="tonal">Tonal</Md3Button>
      <Md3Button variant="elevated">Elevated</Md3Button>
      <Md3Button variant="outlined">Outlined</Md3Button>
      <Md3Button variant="text">Text</Md3Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3Button disabled>Disabled</Md3Button>
    </div>
  ),
};
