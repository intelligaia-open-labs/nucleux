import type { Meta, StoryObj } from "@storybook/react";
import { KnowledgeBase, KnowledgeBaseCoverage, KnowledgeBaseSources } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Agent/KnowledgeBase",
  component: KnowledgeBase,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story, { id }) => <div className={id.endsWith("--site-preview") ? "w-[30rem]" : "w-[26rem]"}><Story /></div>],
  args: {
    defaultValue: ["claude"],
    onValueChange: () => {},
    sources: [
      { id: "claude", name: "CLAUDE.md", meta: "Markdown · project guide" },
      { id: "project", name: "project.json", meta: "JSON · config" },
      { id: "playbook", name: "Renewal Playbook.pdf", meta: "PDF · 12 pages" },
    ],
  },
} satisfies Meta<typeof KnowledgeBase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

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
      <p className="border-b border-border pb-3 text-sm text-foreground">
        Renewals require 90 days notice unless waived by the AE.
      </p>
      <KnowledgeBaseSources
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
  render: () => <KnowledgeBaseSources reading baseName="Sales playbook" sources={[]} />,
};

/** Email: reassures that the draft is grounded — or warns when context is thin. */
export const KbCoverageBadge: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <KnowledgeBaseCoverage level="high" matches={14} />
      <KnowledgeBaseCoverage level="partial" matches={3} />
      <KnowledgeBaseCoverage level="low" matches={0} />
    </div>
  ),
};
