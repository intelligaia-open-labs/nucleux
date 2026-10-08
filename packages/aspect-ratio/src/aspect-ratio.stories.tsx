import type { Meta, StoryObj } from "@storybook/react";
import { AspectRatio } from "./index";

const meta = {
  title: "Primitives/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Widescreen: Story = {
  render: () => (
    <div className="w-72">
      <AspectRatio ratio={16 / 9} className="grid place-items-center rounded-md bg-muted text-sm text-muted-foreground">
        16 / 9
      </AspectRatio>
    </div>
  ),
};
