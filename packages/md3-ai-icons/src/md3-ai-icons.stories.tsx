import type { Meta, StoryObj } from "@storybook/react";
import { Md3AiIcon, Md3AiIconProvider, Md3AiIcons } from "./index";

const meta = {
  title: "Material 3 Agent/Md3AiIcons",
  component: Md3AiIcons,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3AiIcons>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The lingua franca for AI: a four-point sparkle, solid and outline. */
export const Sparkle: Story = {
  args: { variant: "sparkle", size: "lg", label: "AI" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <Md3AiIcons {...args} tone="solid" />
      <Md3AiIcons {...args} tone="outline" />
    </div>
  ),
};

/** The animated mark for active, listening or generating states — always with words. */
export const ThinkingOrb: Story = {
  args: { variant: "thinking-orb", size: "lg" },
  render: (args) => (
    <div className="flex items-center gap-3.5">
      <Md3AiIcons {...args} />
      <span role="status" className="text-xs text-md-on-surface-variant">
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
      <Md3AiIcons {...args} glyph="a" />
      <span className="text-sm font-medium text-md-on-surface">Aria</span>
    </div>
  ),
};

/** Four meanings, four marks — each with words. */
export const Roles: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Md3AiIcon role="ai-action" label="Rewrite" />
      <Md3AiIcon role="generated-content" label="Generated with AI" />
      <Md3AiIcon role="agent-working" label="Rewriting release note…" />
      <Md3AiIcon role="tool-use" label="Style guide checked" />
    </div>
  ),
};

/** One approved alternative glyph per role, set once for the whole product. */
export const ProductGlyphs: Story = {
  render: () => (
    <Md3AiIconProvider glyphs={{ "ai-action": "wand" }}>
      <div className="flex items-center gap-3">
        <Md3AiIcons size="lg" label="AI" />
        <Md3AiIcon role="ai-action" label="Rewrite" />
      </div>
    </Md3AiIconProvider>
  ),
};
