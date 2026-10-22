import type { Meta, StoryObj } from "@storybook/react";
import { ProactiveSuggestion } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/ProactiveSuggestion",
  component: ProactiveSuggestion,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story, { parameters }) => (parameters.bare ? <Story /> : <div className="w-[30rem]"><Story /></div>)],
  args: { agentName: "Aria", title: "Three renewals expire this week", actionLabel: "Draft emails" },
} satisfies Meta<typeof ProactiveSuggestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo />, parameters: { bare: true } };

/** At the top of a surface: the finding, the evidence, one action, Not now and ×. */
export const ContextualBanner: Story = {
  args: {
    variant: "contextual-banner",
    description: "Want Aria to draft outreach for each?",
    reason: "Acme, Globex and Initech renew before Friday and have no open conversation.",
  },
  render: (args) => (
    <ProactiveSuggestion {...args} onAction={() => new Promise((r) => setTimeout(r, 1200))} onSnooze={() => {}} />
  ),
};

/** Beside the row it is about. */
export const InlineSuggestion: Story = {
  args: { variant: "inline-suggestion", title: "Acme Corp renewal is due Apr 30", actionLabel: "Draft outreach" },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <div className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground">
        Acme Corp · renewal due Apr 30
      </div>
      <ProactiveSuggestion {...args} />
    </div>
  ),
};

/** From the corner — interruptive but easy to dismiss. Positioned statically here for the canvas. */
export const SideToast: Story = {
  args: {
    variant: "side-toast",
    title: "Your reply to Sam mentions a date that's passed",
    description: "It says “by April 12”. Update it before sending?",
    actionLabel: "Fix the date",
    snoozeLabel: "Remind me tomorrow",
    className: "static",
  },
  render: (args) => <ProactiveSuggestion {...args} onSnooze={() => {}} />,
};

/** The reason went away: it says so and drops its actions. */
export const Resolved: Story = {
  args: { variant: "contextual-banner", resolved: true, title: "Two release blockers had no owner" },
};
