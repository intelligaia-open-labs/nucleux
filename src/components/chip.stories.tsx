import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./chip";

const meta = {
  title: "Primitives/Chip",
  component: Chip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Design" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDot: Story = { args: { dot: true, dotClassName: "bg-success", children: "Active" } };
export const Removable: Story = { args: { children: "TypeScript", onRemove: () => {} } };

export const Group: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Chip dot dotClassName="bg-success">Online</Chip>
      <Chip dot dotClassName="bg-warning">Away</Chip>
      <Chip dot dotClassName="bg-muted-foreground">Offline</Chip>
      <Chip onRemove={() => {}}>Filter: React</Chip>
    </div>
  ),
};
