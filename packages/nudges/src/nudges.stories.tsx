import type { Meta, StoryObj } from "@storybook/react";
import { Paperclip, Sparkles } from "lucide-react";
import { Button } from "@nucleux/button";
import { Nudge, NudgeAction } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/Nudge",
  component: Nudge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { message: "Try uploading a PDF — Aria can summarise it in seconds." },
} satisfies Meta<typeof Nudge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A bubble pointing at the upload button after three text-only sends. Closes on outside click or Escape. */
export const TooltipNudge: Story = {
  args: {
    variant: "tooltip-nudge",
    side: "right",
    reason: "You've sent three text-only messages in a row.",
  },
  render: (args) => (
    <div className="h-40 w-[30rem] pt-6">
      <Nudge {...args} onTry={() => {}} onSnooze={() => {}}>
        <Button variant="secondary" size="icon" aria-label="Attach a file">
          <Paperclip className="size-4" />
        </Button>
      </Nudge>
    </div>
  ),
};

/** A card slotted into the layout when a new capability ships — dismissible, not blinking. */
export const InlineTipCard: Story = {
  args: {
    variant: "inline-tip-card",
    title: "New: streaming summaries",
    message: "Aria now drafts as you watch. Want to try it?",
    reason: "You asked for three summaries this week.",
  },
  render: (args) => (
    <div className="w-[26rem]">
      <Nudge {...args} onTry={() => {}} onSnooze={() => {}} />
    </div>
  ),
};

/** A soft ring around a freshly launched tool; it stops once the tool is used. */
export const HighlightPulse: Story = {
  args: { variant: "highlight-pulse", message: "Generate drafts a reply from the thread." },
  render: (args) => (
    <Nudge {...args}>
      <Button leftIcon={<Sparkles className="size-3.5" />}>Generate</Button>
    </Nudge>
  ),
};

/** Custom actions through NudgeAction. */
export const WithCustomAction: Story = {
  args: { variant: "inline-tip-card", message: "You can ask Aria about text you select in a transcript." },
  render: (args) => (
    <div className="w-[26rem]">
      <Nudge {...args} actions={<NudgeAction>Show me how</NudgeAction>} />
    </div>
  ),
};
