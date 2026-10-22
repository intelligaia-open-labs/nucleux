import type { Meta, StoryObj } from "@storybook/react";
import { Md3Disclaimer } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3Disclaimer",
  component: Md3Disclaimer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story, { parameters }) => (parameters.bare ? <Story /> : <div className="w-[26rem]"><Story /></div>)],
  args: { agentName: "Aria" },
} satisfies Meta<typeof Md3Disclaimer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo />, parameters: { bare: true } };

/** What Aria can do — on the welcome screen, so the first thing read is what to ask for. */
export const CapabilitiesList: Story = {
  args: {
    variant: "capabilities-list",
    items: ["Summarise documents and threads", "Draft replies and emails", "Pull from connected sources", "Translate into 30 languages"],
    cutoff: "Apr 2026",
    learnMoreHref: "#about-aria",
  },
};

/** The boundaries, for regulated or high-stakes contexts. */
export const LimitationsCard: Story = {
  args: {
    variant: "limitations-card",
    items: [
      "Give legal, medical or financial advice",
      "Take destructive actions without confirmation",
      "Access content outside your workspace",
    ],
  },
};

/** One-line caption that travels with the agent. */
export const CutoffNote: Story = {
  args: { variant: "cutoff-note", cutoff: "April 2026" },
};

/** The short statement with labelled rows: can, can't, needs approval, may get wrong. */
export const FullStatement: Story = {
  args: {
    variant: "capabilities-list",
    title: "What Aria can and can't do",
    children: "Aria summarises and drafts. It can be wrong.",
    groups: [
      { label: "Can", items: ["Draft tasks and summaries from your meetings"] },
      { label: "Can't", items: ["Create Jira tasks until Jira is connected"] },
      { label: "Needs your approval", items: ["Sending email on your behalf"] },
      { label: "May get wrong", items: ["Names and figures in poor-quality recordings"] },
    ],
  },
};
