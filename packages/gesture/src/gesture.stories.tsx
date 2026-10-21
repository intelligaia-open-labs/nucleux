import type { Meta, StoryObj } from "@storybook/react";
import { GestureInput } from "./index";

const meta = {
  title: "Agent/GestureInput",
  component: GestureInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: { actions: [], onGesture: () => {}, onDismiss: () => {}, onUndo: () => {} },
} satisfies Meta<typeof GestureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Draw a loose circle around a region — the agent reads the circled area as the target. */
export const CircleToSelect: Story = {
  args: {
    variant: "circle-to-select",
    label: "Hero image — draw a circle to select",
    actions: [{ gesture: "circle", label: "Enhance this" }],
  },
  render: (args) => (
    <GestureInput {...args}>
      <div className="relative aspect-video rounded-xl bg-gradient-to-br from-destructive/20 to-brand-muted">
        <span className="absolute left-[30%] top-[25%] h-1/3 w-1/3 rounded-lg bg-background/60" />
      </div>
    </GestureInput>
  ),
};

/** Swipe a card left or right to fire an AI action — summarise or file away. */
export const SwipeAction: Story = {
  args: {
    variant: "swipe-action",
    label: "Slack thread: #renewals — swipe to act",
    actions: [
      { gesture: "swipe-left", label: "Summarise" },
      { gesture: "swipe-right", label: "File away" },
    ],
  },
  render: (args) => (
    <GestureInput {...args}>
      <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
        Slack thread: #renewals
        <p className="mt-1 text-xs text-muted-foreground">14 new messages · last from Priya, 2m ago</p>
      </div>
    </GestureInput>
  ),
};

/** Pinch-zoom on a chart, then ask the agent about the region you zoomed into. */
export const PinchContext: Story = {
  args: {
    variant: "pinch-context",
    label: "Weekly signups chart — pinch to zoom",
    actions: [
      { gesture: "pinch-out", label: "What spiked here?" },
      { gesture: "pinch-in", label: "Zoom out" },
    ],
  },
  render: (args) => (
    <GestureInput {...args}>
      <div className="aspect-[16/10] rounded-xl bg-success/10">
        <svg viewBox="0 0 200 120" className="size-full" aria-hidden="true">
          <polyline
            points="10,90 40,70 70,80 100,40 130,55 160,30 190,45"
            className="fill-none stroke-success"
            strokeWidth={2}
          />
        </svg>
      </div>
    </GestureInput>
  ),
};

/** `confirm={false}`: the action fires on the gesture and the feedback offers Undo. */
export const FireWithUndo: Story = {
  args: {
    variant: "swipe-action",
    confirm: false,
    actions: [{ gesture: "swipe-left", label: "Archive" }],
  },
  render: (args) => (
    <GestureInput {...args}>
      <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
        Invoice #4821 — Northwind
      </div>
    </GestureInput>
  ),
};
