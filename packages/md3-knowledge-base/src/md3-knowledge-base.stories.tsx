import type { Meta, StoryObj } from "@storybook/react";
import { Md3KnowledgeBase, Md3KnowledgeBaseCoverage, Md3KnowledgeBaseSources } from "./index";

const meta = {
  title: "Material 3 Agent/Md3KnowledgeBase",
  component: Md3KnowledgeBase,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: {
    defaultValue: ["claude"],
    onValueChange: () => {},
    sources: [
      { id: "claude", name: "CLAUDE.md", meta: "Markdown · project guide" },
      { id: "project", name: "project.json", meta: "JSON · config" },
      { id: "playbook", name: "Renewal Playbook.pdf", meta: "PDF · 12 pages" },
    ],
  },
} satisfies Meta<typeof Md3KnowledgeBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Right rail: pick which corpora Aria grounds in this session — chips with document counts. */
export const KbPicker: Story = {
  args: {
    variant: "chips",
    heading: "Grounded in",
    defaultValue: ["docs", "playbook"],
    onAdd: () => {},
    sources: [
      { id: "docs", name: "Product docs", count: 412 },
      { id: "playbook", name: "Sales playbook", count: 38 },
      { id: "legal", name: "Legal templates", count: 64 },
      { id: "wiki", name: "Engineering wiki", count: 1290, status: "processing" },
    ],
  },
};

/** Readiness as a word on each row, with the recovery on the row that failed. */
export const SourceStatus: Story = {
  args: {
    heading: "Active knowledge",
    defaultValue: ["crm", "drive"],
    onRefresh: () => {},
    sources: [
      { id: "crm", name: "CRM records", status: "ready", count: 18240, meta: "Live" },
      { id: "drive", name: "Google Drive", status: "stale", meta: "Captured 12 Sep" },
      { id: "slack", name: "Slack history", status: "processing" },
      { id: "msa", name: "MSA Template.pdf", status: "error", meta: "Password-protected" },
    ],
  },
};

/** Chat: under each answer — exactly which documents and sections the agent read. */
export const KbSourceList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="border-b border-md-outline-variant pb-3 text-sm text-md-on-surface">
        Renewals require 90 days notice unless waived by the AE.
      </p>
      <Md3KnowledgeBaseSources
        sources={[
          { id: "1", name: "Renewal Playbook v3", section: "§4.1", href: "#renewal-playbook" },
          { id: "2", name: "MSA Template", section: "§12" },
          { id: "3", name: "Sales Ops FAQ" },
        ]}
      />
    </div>
  ),
};

/** While the agent reads, the list says so (announced politely). */
export const KbSourcesReading: Story = {
  render: () => <Md3KnowledgeBaseSources reading baseName="Sales playbook" sources={[]} />,
};

/** Email: reassures that the draft is grounded — or warns when context is thin. */
export const KbCoverageBadge: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Md3KnowledgeBaseCoverage level="high" matches={14} />
      <Md3KnowledgeBaseCoverage level="partial" matches={3} />
      <Md3KnowledgeBaseCoverage level="low" matches={0} />
    </div>
  ),
};
