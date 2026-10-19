import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@nucleux/button";
import { Toaster, toast } from "./index";

const meta = {
  title: "Primitives/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Toaster />
      <Button
        variant="secondary"
        onClick={() => toast("Draft saved", { description: "Your reply is saved to Drafts." })}
      >
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success("Summary shared with the team")}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.error("Couldn't reach the calendar API")}>
        Error
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 1500)), {
            loading: "Generating summary…",
            success: "Summary ready",
            error: "Generation failed",
          })
        }
      >
        Promise
      </Button>
    </div>
  ),
};
