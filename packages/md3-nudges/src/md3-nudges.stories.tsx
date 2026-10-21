import type { Meta, StoryObj } from "@storybook/react";
import { Paperclip, Sparkles } from "lucide-react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3Nudge, Md3NudgeAction } from "./index";

const meta = {
  title: "Material 3 Agent/Md3Nudge",
  component: Md3Nudge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { message: "Try uploading a PDF — Aria can summarise it in seconds." },
} satisfies Meta<typeof Md3Nudge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bubble pointing at the upload button after three text-only sends. Closes on outside click or Escape. */
export const TooltipNudge: Story = {
  args: {
    variant: "tooltip-nudge",
    side: "right",
    reason: "You've sent three text-only messages in a row.",
  },
  render: (args) => (
    <div className="h-48 w-[32rem] pt-6">
      <Md3Nudge {...args} onTry={() => {}} onSnooze={() => {}}>
        <Md3IconButton variant="outlined" aria-label="Attach a file">
          <Paperclip />
        </Md3IconButton>
      </Md3Nudge>
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
      <Md3Nudge {...args} onTry={() => {}} onSnooze={() => {}} />
    </div>
  ),
};

/** A soft ring around a freshly launched tool; it stops once the tool is used. */
export const HighlightPulse: Story = {
  args: { variant: "highlight-pulse", message: "Generate drafts a reply from the thread." },
  render: (args) => (
    <Md3Nudge {...args}>
      <Md3Button icon={<Sparkles />}>Generate</Md3Button>
    </Md3Nudge>
  ),
};

/** Custom actions through Md3NudgeAction. */
export const WithCustomAction: Story = {
  args: { variant: "inline-tip-card", message: "You can ask Aria about text you select in a transcript." },
  render: (args) => (
    <div className="w-[26rem]">
      <Md3Nudge {...args} actions={<Md3NudgeAction>Show me how</Md3NudgeAction>} />
    </div>
  ),
};
