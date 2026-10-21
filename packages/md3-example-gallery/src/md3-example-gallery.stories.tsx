import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarChart3, Code2, Mail, Megaphone, NotebookPen, Search } from "lucide-react";
import { Md3ExampleGallery, type ExampleGalleryExample } from "./index";

const examples: ExampleGalleryExample[] = [
  {
    title: "Brand intro",
    description: "A 90-word company intro in our voice",
    prompt: "Write a 90-word introduction to Nucleux for a partner newsletter, in our brand voice.",
    category: "Drafts",
    output: "Nucleux helps product teams ship AI features people trust…",
  },
  {
    title: "Q2 recap",
    description: "Revenue, churn and the three biggest wins",
    prompt: "Summarise Q2: revenue vs plan, churn, and the three biggest wins.",
    category: "Summaries",
    output: "Revenue closed at 104% of plan; churn fell to 2.1%…",
  },
  {
    title: "Outreach",
    description: "A follow-up for a lapsed account",
    prompt: "Draft a follow-up email to Acme Corp about their lapsed renewal.",
    category: "Drafts",
    needs: "Uses your CRM",
  },
  {
    title: "Code review",
    description: "Risks and missing tests in a pull request",
    prompt: "Review this pull request for risky changes and missing tests.",
    category: "Code",
  },
  {
    title: "Find anomalies",
    description: "Unusual spikes in this week's signups",
    prompt: "Find anomalies in this week's signup numbers and explain them.",
    category: "Analysis",
  },
  {
    title: "Meeting notes",
    description: "Decisions and owners from the standup",
    prompt: "List the decisions and owners from yesterday's standup.",
    category: "Summaries",
    needs: "Needs a meeting with a transcript",
  },
];

const icons = [<Megaphone key="a" />, <BarChart3 key="b" />, <Mail key="c" />, <Code2 key="d" />, <Search key="e" />, <NotebookPen key="f" />];

const meta = {
  title: "Material 3 Agent/Md3ExampleGallery",
  component: Md3ExampleGallery,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[34rem]"><Story /></div>],
  args: { examples: [] },
} satisfies Meta<typeof Md3ExampleGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: Partial<React.ComponentProps<typeof Md3ExampleGallery>>) {
  const [draft, setDraft] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Md3ExampleGallery examples={examples.map((e, i) => ({ ...e, icon: icons[i] }))} onSelect={setDraft} {...props} />
      <textarea
        aria-label="Message Aria"
        className="min-h-16 rounded-md-md border border-md-outline-variant bg-md-surface-container-high p-3 text-sm text-md-on-surface placeholder:text-md-on-surface-variant"
        placeholder="Or describe your own task…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
    </div>
  );
}

/** A grid of curated examples; each card places the prompt that produced it. */
export const CardGrid: Story = {
  args: { variant: "card-grid" },
  render: (args) => <Demo variant={args.variant} />,
};

/** A scrollable row for tight vertical space, at the top of an empty panel. */
export const HorizontalStrip: Story = {
  args: { variant: "horizontal-strip" },
  render: (args) => <Demo variant={args.variant} />,
};

/** Tabs above the gallery filter by intent — drafts, summaries, code, analysis. */
export const CategorizedTabs: Story = {
  args: { variant: "categorized-tabs" },
  render: (args) => <Demo variant={args.variant} />,
};

/** Each card opens the prompt and the output first; "Use this prompt" places it. */
export const PreviewFirst: Story = {
  args: { selectBehavior: "preview" },
  render: (args) => <Demo selectBehavior={args.selectBehavior} />,
};

/** Once work has started the gallery folds into a single button. */
export const Collapsed: Story = {
  args: { collapsed: true },
  render: () => {
    const [collapsed, setCollapsed] = useState(true);
    return <Demo collapsed={collapsed} onExpand={() => setCollapsed(false)} />;
  },
};
