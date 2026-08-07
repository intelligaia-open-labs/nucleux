import type { Meta, StoryObj } from "@storybook/react";
import { Citation, SourceList, SourceItem } from "./index";

const meta = {
  title: "Agent/Citation",
  component: Citation,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Citation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineChip: Story = {
  render: () => (
    <p className="max-w-md text-base leading-relaxed text-foreground">
      The renewal auto-extends for 12 months unless cancelled 30 days prior{" "}
      <Citation index={4} aria-label="Source 4" />, and price increases are capped at 5%{" "}
      <Citation label="msa.pdf" aria-label="Source: msa.pdf" />.
    </p>
  ),
};

export const Sources: Story = {
  render: () => (
    <div className="w-[26rem]">
      <SourceList heading="3 sources · 1 missing policy">
        <SourceItem index={1} title="Renewal Playbook" meta="Source · PDF · Section 4.1" href="#" />
        <SourceItem index={2} title="MSA Template" meta="Source · DOCX · Clause 8" href="#" />
        <SourceItem index={3} title="wikipedia.org" meta="Web · Retrieved today" onOpen={() => {}} />
      </SourceList>
    </div>
  ),
};
