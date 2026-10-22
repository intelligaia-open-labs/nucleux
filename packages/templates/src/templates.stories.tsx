import type { Meta, StoryObj } from "@storybook/react";
import { Templates, TemplatesBrowser, TemplatesList } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/Templates",
  component: Templates,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[34rem]"><Story /></div>],
  args: { segments: [] },
} satisfies Meta<typeof Templates>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Fill-in-the-blank: a sentence with slots that reads like a real prompt once filled. */
export const FillBlanks: Story = {
  args: {
    onComplete: () => {},
    segments: [
      "Summarise ",
      { slot: "meeting", placeholder: "meeting", label: "Meeting", options: ["the standup", "the board review", "the customer call"], required: true },
      " in ",
      { slot: "length", placeholder: "3 bullets", label: "Length", options: ["3 bullets", "one paragraph", "a table"] },
      " for ",
      { slot: "audience", placeholder: "execs", label: "Audience", options: ["execs", "the team", "the customer"], required: true },
      ".",
    ],
  },
};

/** The original mad-lib, with optional slots that fall back to their placeholder. */
export const MadLib: Story = {
  args: {
    onComplete: () => {},
    segments: [
      "Write a cold email to ",
      { slot: "company", placeholder: "Company" },
      " about their ",
      { slot: "painpoint", placeholder: "pain point" },
      ", signed off from ",
      { slot: "name", placeholder: "your name" },
      ".",
    ],
  },
};

/** Prefilled list: fully written prompts, run with one tap. */
export const PrefilledList: Story = {
  render: () => (
    <TemplatesList
      aria-label="Templates"
      onSelect={() => {}}
      items={[
        "Draft a follow-up to the at-risk accounts",
        "Summarise yesterday's standup in 3 bullets",
        "Find anomalies in Q2 numbers",
      ]}
    />
  ),
};

/** Categorised browser: a library grouped by domain, a vertical tab per category. */
export const CategorizedBrowser: Story = {
  render: () => (
    <TemplatesBrowser
      onSelect={() => {}}
      categories={[
        { id: "sales", label: "Sales", templates: ["Outreach to cold lead", "Renewal nudge", "Quarterly recap"] },
        { id: "support", label: "Support", templates: ["Apologise for an outage", "Explain a billing change"] },
        { id: "eng", label: "Eng", templates: ["Review this pull request", "Write release notes"] },
      ]}
    />
  ),
};
