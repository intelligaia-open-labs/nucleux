import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Randomize } from "@nucleux/randomize";
import { InitialCta } from "./index";

const meta = {
  title: "Agent/InitialCta",
  component: InitialCta,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[36rem]"><Story /></div>],
  args: { onSubmit: () => {}, "aria-label": "Message Aria" },
} satisfies Meta<typeof InitialCta>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A wide composer dominating the empty thread, with suggestions beneath. */
export const CenteredHero: Story = {
  args: {
    variant: "centered-hero",
    headline: "What can I help with today?",
    description: "Ask about your accounts, draft emails, or analyse data.",
    placeholder: "Ask Aria anything…",
    suggestions: [
      { title: "Summarise renewal risks", prompt: "Summarise the renewal risks across my accounts this week." },
      { title: "Draft a follow-up to Acme", prompt: "Draft a follow-up email to Acme Corp about their renewal." },
      { title: "Which accounts need attention?", prompt: "Which of my accounts need attention this week, and why?" },
    ],
  },
  render: (args) => (
    <InitialCta
      {...args}
      avatar={
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-brand text-sm font-semibold text-brand-foreground">
          A
        </span>
      }
    />
  ),
};

/** A subtle accent gradient behind the input — the surface is the brand moment. */
export const GradientCta: Story = {
  args: { variant: "gradient-cta", headline: "Try Aria", placeholder: "Summarise, draft, find anything…" },
};

/** Mic, file and image affordances in one row — bring anything in. */
export const MultiModalRow: Story = {
  args: { variant: "multi-modal-row", headline: "Start with Aria", onVoice: () => {}, onAttachFile: () => {}, onAddImage: () => {} },
};

/** Composed with Randomize in the composer's actions — the same composer, three entry points. */
export const WithRandomize: Story = {
  args: { variant: "centered-hero", suggestions: ["Summarise renewal risks", "Draft a follow-up to Acme"] },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <InitialCta
        {...args}
        value={value}
        onValueChange={setValue}
        actions={
          <Randomize
            showLabel={false}
            draft={value}
            prompts={[
              "Draft a one-paragraph product brief for an idea you haven't shipped.",
              "Write three subject lines for the spring launch email.",
              "Plan a 30-minute team retro with one surprising question.",
            ]}
            onSelect={(p, { mode }) => setValue((v) => (mode === "append" ? `${v}\n\n${p}` : p))}
          />
        }
      />
    );
  },
};
