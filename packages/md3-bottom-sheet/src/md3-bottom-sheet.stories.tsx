import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3BottomSheet } from "./index";
import { Md3Button } from "@nucleux/md3-button";

const meta = {
  title: "Material 3/BottomSheet",
  component: Md3BottomSheet,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { open: false, onOpenChange: () => {} },
} satisfies Meta<typeof Md3BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { open: false, onOpenChange: () => {} },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="bg-md-surface p-6">
        <Md3Button onClick={() => setOpen(true)}>Open sheet</Md3Button>
        <Md3BottomSheet open={open} onOpenChange={setOpen}>
          <h2 className="mb-2 text-lg">Share</h2>
          <p className="text-sm text-md-on-surface-variant">Choose how you'd like to share this item.</p>
        </Md3BottomSheet>
      </div>
    );
  },
};
