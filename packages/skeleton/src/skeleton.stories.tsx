import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./index";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  render: () => (
    <div className="flex w-72 items-center gap-3">
      <Skeleton circle className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
};
