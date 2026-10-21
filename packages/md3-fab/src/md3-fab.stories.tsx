import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { Md3Fab } from "./index";

const meta = {
  title: "Material 3/Fab",
  component: Md3Fab,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { icon: null },
} satisfies Meta<typeof Md3Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  args: { icon: null },
  render: () => (
    <div className="flex items-center gap-4 bg-md-surface p-6">
      <Md3Fab size="small" icon={<Plus />} aria-label="Add" />
      <Md3Fab size="regular" icon={<Plus />} aria-label="Add" />
      <Md3Fab size="large" icon={<Plus />} aria-label="Add" />
      <Md3Fab size="extended" icon={<Plus />}>
        Compose
      </Md3Fab>
    </div>
  ),
};
