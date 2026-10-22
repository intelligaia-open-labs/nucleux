import type { Meta, StoryObj } from "@storybook/react";
import { SitePreview as SitePreviewDemo } from "./site-preview";
import { AiColor, AiColorHighlight } from "./index";

const meta = {
  title: "Agent/AiColor",
  component: AiColor,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story, ctx) => (ctx.id.endsWith("--site-preview") ? <Story /> : <div className="w-[26rem]"><Story /></div>)],
} satisfies Meta<typeof AiColor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A coloured edge down a streaming AI reply — "in progress" is unmistakable. */
export const AccentBorder: Story = {
  args: { variant: "accent-border", working: true, label: "Streaming" },
  render: (args) => <AiColor {...args}>Analysing your Q2 numbers</AiColor>,
};

/** A diffuse halo around an active AI region: listening or generating. */
export const SoftGlow: Story = {
  args: { variant: "soft-glow", working: true, label: "Aria is working" },
  render: (args) => <AiColor {...args}>I'm pulling the renewal numbers — give me a moment.</AiColor>,
};

/** A faint fill behind the whole AI-generated region, scannable in a dense layout. */
export const BackgroundTint: Story = {
  args: { variant: "background-tint", label: "Aria suggests" },
  render: (args) => (
    <AiColor {...args}>
      Send a follow-up to the three accounts at risk — <AiColorHighlight>Acme Corp</AiColorHighlight> is the most
      urgent. I've drafted them.
    </AiColor>
  ),
};
