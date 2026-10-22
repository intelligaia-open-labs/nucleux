import type { Meta, StoryObj } from "@storybook/react";
import { SitePreview as SitePreviewDemo } from "./site-preview";
import { Avatar } from "@nucleux/avatar";
import { AgentAvatar } from "./index";

const meta = {
  title: "Agent/AgentAvatar",
  component: AgentAvatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { name: "Aria" },
} satisfies Meta<typeof AgentAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** The default: a round mark with the reserved glyph (or a letter), at 24 / 32 / 40. */
export const CircularMark: Story = {
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AgentAvatar {...args} size="sm" />
      <AgentAvatar {...args} size="md" />
      <AgentAvatar {...args} size="lg" />
      <AgentAvatar {...args} size="lg" glyph="A" />
      <div>
        <div className="text-sm font-semibold text-foreground">Aria</div>
        <div className="text-xs text-muted-foreground">Intelligaia agent</div>
      </div>
    </div>
  ),
};

/** Pulses gently while the agent is working — the ring stops the moment work stops. */
export const AnimatedMark: Story = {
  args: { working: true, size: "lg", statusLabel: "Generating…" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AgentAvatar {...args} />
      <div>
        <div className="text-sm font-semibold text-foreground">Aria</div>
        <div aria-hidden="true" className="text-xs font-medium text-foreground">Generating…</div>
      </div>
    </div>
  ),
};

/** A dot surfaces live state; the words travel with it. */
export const StatusAware: Story = {
  args: { status: "online", size: "lg", statusLabel: "Online · ready" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AgentAvatar {...args} />
      <div>
        <div className="text-sm font-semibold text-foreground">Aria</div>
        <div aria-hidden="true" className="text-xs text-muted-foreground">Online · ready</div>
      </div>
    </div>
  ),
};

/** The agent beside a person: the shapes do the sorting. */
export const BesideAPerson: Story = {
  args: { shape: "rounded" },
  render: (args) => (
    <div className="flex items-center gap-3">
      <AgentAvatar {...args} />
      <Avatar role="user" name="Maya Chen" />
    </div>
  ),
};
