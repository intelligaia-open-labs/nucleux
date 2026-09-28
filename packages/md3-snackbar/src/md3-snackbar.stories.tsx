import type { Meta, StoryObj } from "@storybook/react";
import { Md3Snackbar } from "./index";

const meta = {
  title: "Material 3/Snackbar",
  component: Md3Snackbar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { open: true, message: "" },
} satisfies Meta<typeof Md3Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = {
  args: { open: true, message: "" },
  render: () => (
    <div className="w-96 bg-md-surface p-6">
      <Md3Snackbar open message="Message archived" action="Undo" onAction={() => {}} />
    </div>
  ),
};
