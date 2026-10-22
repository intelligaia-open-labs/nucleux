import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@nucleux/button";
import { Iconography } from "@nucleux/iconography";
import { Caveat, CaveatTooltip } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/Caveat",
  component: Caveat,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { name }) => (name === "Site Preview" ? <Story /> : <div className="w-[26rem]"><Story /></div>),
  ],
} satisfies Meta<typeof Caveat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A quiet caption under the composer, seen before anything is sent. */
export const BelowInput: Story = {
  args: { variant: "below-input", children: "Aria may make mistakes. Verify important info." },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <div className="flex h-9 items-center rounded-lg border border-border bg-background px-3.5 text-sm text-muted-foreground">
        Ask Aria anything…
      </div>
      <Caveat {...args} />
    </div>
  ),
};

/** Beneath output that will be acted on — repeated where the risk is highest. */
export const OutputFooter: Story = {
  args: { variant: "output-footer", children: "Verify before sharing — this is a generated summary." },
  render: (args) => (
    <div>
      <p className="text-sm text-foreground">
        Two of these accounts are flagged for renewal. Three are at risk of churn — I've pulled supporting context.
      </p>
      <Caveat {...args} />
    </div>
  ),
};

/** The strongest form: the specific gap, with the step that removes it. */
export const SpecificGap: Story = {
  args: { variant: "output-footer", children: "2 of 8 interviews could not be opened, so this summary reflects 6." },
  render: (args) => (
    <Caveat
      {...args}
      actions={
        <>
          <Button variant="ghost" size="sm">Review sources</Button>
          <Button variant="secondary" size="sm">Reconnect</Button>
        </>
      }
    />
  ),
};

/** On the action itself: available on hover and focus, never in the way. */
export const InfoTooltip: Story = {
  render: () => (
    <div className="pt-12">
      <CaveatTooltip content="Output may be inaccurate">
        <Iconography label="Generate" agentName="Aria" />
      </CaveatTooltip>
    </div>
  ),
};
