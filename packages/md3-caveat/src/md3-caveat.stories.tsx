import type { Meta, StoryObj } from "@storybook/react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3Iconography } from "@nucleux/md3-iconography";
import { Md3Caveat, Md3CaveatTooltip } from "./index";

const meta = {
  title: "Material 3 Agent/Md3Caveat",
  component: Md3Caveat,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
} satisfies Meta<typeof Md3Caveat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A quiet caption under the composer, seen before anything is sent. */
export const BelowInput: Story = {
  args: { variant: "below-input", children: "Aria may make mistakes. Verify important info." },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <div className="flex h-9 items-center rounded-full border border-md-outline-variant bg-md-surface-container px-3.5 text-sm text-md-on-surface-variant">
        Ask Aria anything…
      </div>
      <Md3Caveat {...args} />
    </div>
  ),
};

/** Beneath output that will be acted on — repeated where the risk is highest. */
export const OutputFooter: Story = {
  args: { variant: "output-footer", children: "Verify before sharing — this is a generated summary." },
  render: (args) => (
    <div>
      <p className="text-sm text-md-on-surface">
        Two of these accounts are flagged for renewal. Three are at risk of churn — I've pulled supporting context.
      </p>
      <Md3Caveat {...args} />
    </div>
  ),
};

/** The strongest form: the specific gap, with the step that removes it. */
export const SpecificGap: Story = {
  args: { variant: "output-footer", children: "2 of 8 interviews could not be opened, so this summary reflects 6." },
  render: (args) => (
    <Md3Caveat
      {...args}
      actions={
        <>
          <Md3Button variant="text" className="h-8 px-3">Review sources</Md3Button>
          <Md3Button variant="tonal" className="h-8 px-4">Reconnect</Md3Button>
        </>
      }
    />
  ),
};

/** On the action itself: available on hover and focus, never in the way. */
export const InfoTooltip: Story = {
  render: () => (
    <div className="pt-12">
      <Md3CaveatTooltip content="Output may be inaccurate">
        <Md3Iconography label="Generate" agentName="Aria" />
      </Md3CaveatTooltip>
    </div>
  ),
};
