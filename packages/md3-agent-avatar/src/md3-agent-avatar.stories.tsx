import type { Meta, StoryObj } from "@storybook/react";
import { SitePreview as SitePreviewDemo } from "./site-preview";
import { Avatar } from "@nucleux/avatar";
import { Md3AgentAvatar } from "./index";

const meta = {
  title: "Material 3 Agent/Md3AgentAvatar",
  component: Md3AgentAvatar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { name: "Aria" },
} satisfies Meta<typeof Md3AgentAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** The default: a round mark with the reserved glyph (or a letter), at 24 / 32 / 40. */
export const CircularMark: Story = {
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <Md3AgentAvatar {...args} size="sm" />
      <Md3AgentAvatar {...args} size="md" />
      <Md3AgentAvatar {...args} size="lg" />
      <Md3AgentAvatar {...args} size="lg" glyph="A" />
      <div>
        <div className="text-sm font-medium text-md-on-surface">Aria</div>
        <div className="text-xs text-md-on-surface-variant">Intelligaia agent</div>
      </div>
    </div>
  ),
};

/** Pulses gently while the agent is working — the ring stops the moment work stops. */
export const AnimatedMark: Story = {
  args: { working: true, size: "lg", statusLabel: "Generating…" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <Md3AgentAvatar {...args} />
      <div>
        <div className="text-sm font-medium text-md-on-surface">Aria</div>
        <div aria-hidden="true" className="text-xs font-medium text-md-on-surface">Generating…</div>
      </div>
    </div>
  ),
};

/** A dot surfaces live state; the words travel with it. */
export const StatusAware: Story = {
  args: { status: "online", size: "lg", statusLabel: "Online · ready" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <Md3AgentAvatar {...args} />
      <div>
        <div className="text-sm font-medium text-md-on-surface">Aria</div>
        <div aria-hidden="true" className="text-xs text-md-on-surface-variant">Online · ready</div>
      </div>
    </div>
  ),
};

/** The agent beside a person: the shapes do the sorting. */
export const BesideAPerson: Story = {
  args: { shape: "rounded" },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Md3AgentAvatar {...args} />
      <Avatar role="user" name="Maya Chen" className="bg-md-surface-container-high text-md-on-surface-variant" />
    </div>
  ),
};
