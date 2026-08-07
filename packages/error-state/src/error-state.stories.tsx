import type { Meta, StoryObj } from "@storybook/react";
import { Inbox } from "lucide-react";
import { ErrorState } from "./index";

const meta = {
  title: "Agent/ErrorState",
  component: ErrorState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[28rem]"><Story /></div>],
  args: { title: "Nothing here yet" },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

const btn =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const primary =
  "rounded-lg bg-info px-3 py-2 text-sm font-medium text-info-foreground transition-colors hover:bg-info/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const PromptFailed: Story = {
  args: {
    variant: "error",
    title: "Something went wrong",
    description: "Your prompt didn't go through. Your draft is saved.",
    actions: (
      <>
        <button type="button" className={btn}>Edit prompt</button>
        <button type="button" className={primary}>Retry</button>
      </>
    ),
  },
};

export const Empty: Story = {
  args: {
    icon: <Inbox />,
    title: "No results found",
    description: "Try adjusting your filters.",
    actions: <button type="button" className={btn}>Clear filters</button>,
  },
};
