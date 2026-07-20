import type { Meta, StoryObj } from "@storybook/react";
import { RelatedPatternCard, RelatedPatternsGrid } from "./index";

const meta = {
  title: "Patterns/RelatedPatternsGrid",
  component: RelatedPatternsGrid,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RelatedPatternsGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RelatedPatternsGrid>
      <RelatedPatternCard href="#" title="Consent" meta="Onboarding · Trust & Disclosure" />
      <RelatedPatternCard href="#" title="Caveat" meta="Onboarding · Trust & Disclosure" />
      <RelatedPatternCard href="#" title="Watermark" meta="Over Time · Privacy & Control" />
      <RelatedPatternCard href="#" title="Provenance" meta="Over Time · Privacy & Control" />
    </RelatedPatternsGrid>
  ),
};
