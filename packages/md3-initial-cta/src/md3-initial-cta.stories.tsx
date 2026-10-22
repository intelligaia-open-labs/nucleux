import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Md3Randomize } from "@nucleux/md3-randomize";
import { Md3InitialCta } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3InitialCta",
  component: Md3InitialCta,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // The site preview sizes itself; the other stories sit in a 36rem column.
  decorators: [
    (Story, ctx) =>
      ctx.id.endsWith("--site-preview") ? <div className="w-[40rem]"><Story /></div> : <div className="w-[36rem]"><Story /></div>,
  ],
  args: { onSubmit: () => {}, "aria-label": "Message Aria" },
} satisfies Meta<typeof Md3InitialCta>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

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
    <Md3InitialCta
      {...args}
      avatar={
        <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-md-primary-container text-sm font-medium text-md-on-primary-container">
          A
        </span>
      }
    />
  ),
};

/** A tonal primary-container surface behind the input — the surface is the brand moment. */
export const GradientCta: Story = {
  args: { variant: "gradient-cta", headline: "Try Aria", placeholder: "Summarise, draft, find anything…" },
};

/** Mic, file and image affordances in one row — bring anything in. */
export const MultiModalRow: Story = {
  args: { variant: "multi-modal-row", headline: "Start with Aria", onVoice: () => {}, onAttachFile: () => {}, onAddImage: () => {} },
};

/** Composed with Md3Randomize in the composer's actions — the same composer, three entry points. */
export const WithRandomize: Story = {
  args: { variant: "centered-hero", suggestions: ["Summarise renewal risks", "Draft a follow-up to Acme"] },
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Md3InitialCta
        {...args}
        value={value}
        onValueChange={setValue}
        actions={
          <Md3Randomize
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
