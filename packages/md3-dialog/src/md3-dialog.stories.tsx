import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3Dialog } from "./index";
import { Md3Button } from "@nucleux/md3-button";

const meta = {
  title: "Material 3/Dialog",
  component: Md3Dialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { open: false, onOpenChange: () => {}, headline: "" },
} satisfies Meta<typeof Md3Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: { open: false, onOpenChange: () => {}, headline: "" },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="bg-md-surface p-6">
        <Md3Button onClick={() => setOpen(true)}>Open dialog</Md3Button>
        <Md3Dialog
          open={open}
          onOpenChange={setOpen}
          headline="Reset settings?"
          actions={
            <>
              <Md3Button variant="text" onClick={() => setOpen(false)}>
                Cancel
              </Md3Button>
              <Md3Button variant="text" onClick={() => setOpen(false)}>
                Reset
              </Md3Button>
            </>
          }
        >
          This will restore all settings to their default values.
        </Md3Dialog>
      </div>
    );
  },
};
