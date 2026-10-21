import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { AlertDialog } from "./index";

const meta = {
  title: "Primitives/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Destructive: Story = {
  args: { open: false, onOpenChange: () => {}, title: "" },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground"
          onClick={() => setOpen(true)}
        >
          Delete account
        </button>
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          destructive
          title="Delete your account?"
          description="This permanently removes your data. This action cannot be undone."
          confirmLabel="Delete"
        />
      </>
    );
  },
};
