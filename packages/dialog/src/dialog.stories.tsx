import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./index";
import { Button } from "@nucleux/button";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MemorySaveConsent: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Save memory…</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Save this as memory?</DialogTitle>
            <DialogDescription>
              This preference can personalize future conversations and actions.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-accent p-3 text-sm text-foreground">
            Prefers concise product copy, dark-mode screenshots, and approval before file changes.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary">Edit</Button>
            <Button onClick={() => setOpen(false)}>Save</Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
};
