import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sheet, SheetBody, SheetFooter, SheetHeader, SheetTitle } from "./index";
import { Button } from "@nucleux/button";

const meta = {
  title: "Overlays/Sheet",
  component: Sheet,
  parameters: { layout: "centered" },
  args: { open: false, onOpenChange: () => {}, children: null },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open sheet</Button>
        <Sheet open={open} onOpenChange={setOpen} side="right">
          <SheetHeader>
            <SheetTitle>Sources</SheetTitle>
          </SheetHeader>
          <SheetBody className="text-sm text-muted-foreground">
            Reference documents used for this answer appear here.
          </SheetBody>
          <SheetFooter>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </SheetFooter>
        </Sheet>
      </>
    );
  },
};
