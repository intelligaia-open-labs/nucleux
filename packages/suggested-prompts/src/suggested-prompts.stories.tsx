import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, PenLine, Search } from "lucide-react";
import { SuggestedPrompts } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/SuggestedPrompts",
  component: SuggestedPrompts,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { name }) =>
      name === "Site Preview" ? (
        <Story />
      ) : (
        <div className="w-[32rem]">
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof SuggestedPrompts>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A horizontal row of pills above the composer — one tap places the prompt. */
export const ChipRow: Story = {
  args: {
    variant: "chip-row",
    label: "Try asking:",
    items: ["Summarise renewal risks this week", "Draft a follow-up to Acme Corp", "Which accounts need attention?"],
  },
};

/** With icons, as the email compose helper's quick prompts. */
export const ChipRowWithIcons: Story = {
  args: { variant: "chip-row", items: [] },
  render: (args) => (
    <SuggestedPrompts
      {...args}
      items={[
        { title: "Draft a reply", icon: <PenLine /> },
        { title: "Summarise data", icon: <BarChart3 /> },
        { title: "Find anomalies", icon: <Search /> },
      ]}
    />
  ),
};

/** Stacked cards with a supporting line — for the assistant panel before anyone types. */
export const CardList: Story = {
  args: {
    variant: "card-list",
    afterSelect: "mark",
    items: [
      { title: "Draft a follow-up", description: "For the three at-risk accounts", prompt: "Draft a follow-up email for each of the three at-risk accounts." },
      { title: "Summarise the standup", description: "From yesterday's recording", prompt: "Summarise yesterday's standup recording in five bullets." },
    ],
  },
};

/** Floats by the selection with one relevant action; Escape or × dismisses it. */
export const ContextualTooltip: Story = {
  args: { variant: "contextual-tooltip", items: ["Rewrite this selection?"] },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div className="relative pt-12">
        {open && <SuggestedPrompts {...args} onDismiss={() => setOpen(false)} className="absolute left-3 top-0" />}
        <div className="rounded-md bg-brand-muted px-3.5 py-2.5 text-sm text-foreground">
          Selected: “The team agreed to ship by Friday…”
        </div>
      </div>
    );
  },
};

/** Remove once tapped: the chosen chip leaves the row. */
export const RemoveOnSelect: Story = {
  args: {
    afterSelect: "remove",
    items: ["Shorten", "Soften the tone", "Expand the second paragraph", "Add a call to action"],
  },
};
