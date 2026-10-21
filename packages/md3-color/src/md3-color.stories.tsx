import type { Meta, StoryObj } from "@storybook/react";
import { Md3AiColor, Md3AiColorHighlight } from "./index";

const meta = {
  title: "Material 3 Agent/Md3AiColor",
  component: Md3AiColor,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
} satisfies Meta<typeof Md3AiColor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A coloured edge down a streaming AI reply — "in progress" is unmistakable. */
export const AccentBorder: Story = {
  args: { variant: "accent-border", working: true, label: "Streaming" },
  render: (args) => <Md3AiColor {...args}>Analysing your Q2 numbers</Md3AiColor>,
};

/** A diffuse halo around an active AI region: listening or generating. */
export const SoftGlow: Story = {
  args: { variant: "soft-glow", working: true, label: "Aria is working" },
  render: (args) => <Md3AiColor {...args}>I'm pulling the renewal numbers — give me a moment.</Md3AiColor>,
};

/** A faint fill behind the whole AI-generated region, scannable in a dense layout. */
export const BackgroundTint: Story = {
  args: { variant: "background-tint", label: "Aria suggests" },
  render: (args) => (
    <Md3AiColor {...args}>
      Send a follow-up to the three accounts at risk — <Md3AiColorHighlight>Acme Corp</Md3AiColorHighlight> is the most
      urgent. I've drafted them.
    </Md3AiColor>
  ),
};
