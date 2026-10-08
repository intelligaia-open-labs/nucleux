import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./index";

const meta = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-1.5">
      <Label htmlFor="email">Email</Label>
      <input
        id="email"
        className="h-9 w-64 rounded-md border border-input bg-background px-3 text-sm text-foreground"
        placeholder="you@example.com"
      />
    </div>
  ),
};

export const Required: Story = {
  render: () => <Label required>Full name</Label>,
};
