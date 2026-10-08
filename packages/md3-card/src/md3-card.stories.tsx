import type { Meta, StoryObj } from "@storybook/react";
import { Md3Card } from "./index";

const meta = {
  title: "Material 3/Card",
  component: Md3Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4 bg-md-surface p-6">
      {(["elevated", "filled", "outlined"] as const).map((v) => (
        <Md3Card key={v} variant={v} className="w-48 p-4">
          <h3 className="text-base font-medium capitalize">{v}</h3>
          <p className="mt-1 text-sm text-md-on-surface-variant">Material 3 card surface.</p>
        </Md3Card>
      ))}
    </div>
  ),
};
