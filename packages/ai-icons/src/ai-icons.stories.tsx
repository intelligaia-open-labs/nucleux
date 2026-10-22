import type { Meta, StoryObj } from "@storybook/react";
import { SitePreview as SitePreviewDemo } from "./site-preview";
import { AiIcon, AiIconLegend, AiIconProvider, AiIcons } from "./index";

const meta = {
  title: "Agent/AiIcons",
  component: AiIcons,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AiIcons>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** The lingua franca for AI: a four-point sparkle, solid and outline. */
export const Sparkle: Story = {
  args: { variant: "sparkle", size: "lg", label: "AI" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AiIcons {...args} tone="solid" />
      <AiIcons {...args} tone="outline" />
    </div>
  ),
};

/** The animated mark for active, listening or generating states — always with words. */
export const ThinkingOrb: Story = {
  args: { variant: "thinking-orb", size: "lg" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AiIcons {...args} />
      <span role="status" className="text-xs text-muted-foreground">
        Aria is thinking…
      </span>
    </div>
  ),
};

/** Your product's own mark — once learned, faster to parse than any label. */
export const BrandedMark: Story = {
  args: { variant: "branded-mark", size: "lg" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <AiIcons {...args} glyph="a" />
      <span className="text-sm font-semibold text-foreground">Aria</span>
    </div>
  ),
};

/** Four meanings, four marks — each with words. */
export const Roles: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <AiIcon role="ai-action" label="Rewrite" />
      <AiIcon role="generated-content" label="Generated with AI" />
      <AiIcon role="agent-working" label="Rewriting release note…" />
      <AiIcon role="tool-use" label="Style guide checked" />
    </div>
  ),
};

/** One approved alternative glyph per role, set once for the whole product. */
export const ProductGlyphs: Story = {
  render: () => (
    <AiIconProvider glyphs={{ "ai-action": "wand" }}>
      <div className="flex items-center gap-3">
        <AiIcons size="lg" label="AI" />
        <AiIcon role="ai-action" label="Rewrite" />
      </div>
    </AiIconProvider>
  ),
};

/** The icon language written down: each meaning, its mark at 24 / 20 / 16 and what it tells people. */
export const IconLanguage: Story = {
  render: () => <AiIconLegend current="ai-action" className="w-[37.5rem] max-w-full" />,
};
