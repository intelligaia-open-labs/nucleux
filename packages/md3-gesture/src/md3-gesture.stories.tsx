import type { Meta, StoryObj } from "@storybook/react";
import { Md3GestureInput } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3GestureInput",
  component: Md3GestureInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <div className="flex w-[44rem] max-w-full justify-center">
          <Story />
        </div>
      ) : (
        <div className="w-[26rem]"><Story /></div>
      ),
  ],
  args: { actions: [], onGesture: () => {}, onDismiss: () => {}, onUndo: () => {} },
} satisfies Meta<typeof Md3GestureInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Draw a loose circle around a region — the agent reads the circled area as the target. */
export const CircleToSelect: Story = {
  args: {
    variant: "circle-to-select",
    label: "Hero image — draw a circle to select",
    actions: [{ gesture: "circle", label: "Enhance this" }],
  },
  render: (args) => (
    <Md3GestureInput {...args}>
      <div className="relative aspect-video rounded-md-lg bg-gradient-to-br from-md-tertiary-container to-md-primary-container">
        <span className="absolute left-[30%] top-[25%] h-1/3 w-1/3 rounded-md-sm bg-md-surface/60" />
      </div>
    </Md3GestureInput>
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
    <Md3GestureInput {...args}>
      <div className="rounded-md-md border border-md-outline-variant bg-md-surface-container-low px-4 py-3 text-sm text-md-on-surface">
        Slack thread: #renewals
        <p className="mt-1 text-xs text-md-on-surface-variant">14 new messages · last from Priya, 2m ago</p>
      </div>
    </Md3GestureInput>
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
    <Md3GestureInput {...args}>
      <div className="aspect-[16/10] rounded-md-lg bg-md-secondary-container">
        <svg viewBox="0 0 200 120" className="size-full" aria-hidden="true">
          <polyline
            points="10,90 40,70 70,80 100,40 130,55 160,30 190,45"
            className="fill-none stroke-md-secondary"
            strokeWidth={2}
          />
        </svg>
      </div>
    </Md3GestureInput>
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
    <Md3GestureInput {...args}>
      <div className="rounded-md-md border border-md-outline-variant bg-md-surface-container-low px-4 py-3 text-sm text-md-on-surface">
        Invoice #4821 — Northwind
      </div>
    </Md3GestureInput>
  ),
};
