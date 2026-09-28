import type { Meta, StoryObj } from "@storybook/react";
import { Bell } from "lucide-react";
import { Md3Badge } from "./index";

const meta = {
  title: "Material 3/Badge",
  component: Md3Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnIcon: Story = {
  render: () => (
    <div className="flex items-center gap-8 bg-md-surface p-6 text-md-on-surface">
      <Md3Badge>
        <Bell className="h-6 w-6" />
      </Md3Badge>
      <Md3Badge content={8}>
        <Bell className="h-6 w-6" />
      </Md3Badge>
      <Md3Badge content={128} max={99}>
        <Bell className="h-6 w-6" />
      </Md3Badge>
    </div>
  ),
};
