import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { assembleMadlibsPrompt, parseMadlibsTemplate } from "@nucleux/madlibs";
import { Plus } from "lucide-react";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3Madlibs, type Md3MadlibsProps } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const TEMPLATE = "Summarize {document} for {audience}[, focusing on {topic}].";
const BLANKS = [
  { id: "document", label: "Document", options: ["Q3 Customer Research", "September release notes", "Onboarding survey results"] },
  { id: "audience", label: "Audience", options: ["Leadership", "Engineering", "Customer success"] },
  { id: "topic", label: "Topic", options: ["Onboarding issues", "Pricing feedback", "Top feature requests"] },
];
const FILLED = { document: "Q3 Customer Research", audience: "Leadership", topic: "Onboarding issues" };

/** The scaffold above the shared composer: Use prompt places the sentence there (with Undo); nothing is sent from the scaffold. */
function WithComposer(props: Md3MadlibsProps) {
  const initial = props.defaultPlaced
    ? assembleMadlibsPrompt(parseMadlibsTemplate(props.template), props.defaultValues ?? {})
    : "";
  const [draft, setDraft] = React.useState(initial);
  const previous = React.useRef("");
  return (
    <div className="flex w-[40rem] max-w-full flex-col gap-3">
      <Md3Madlibs
        {...props}
        onUse={(prompt) => {
          previous.current = draft;
          setDraft(prompt);
        }}
        onUndo={() => setDraft(previous.current)}
      />
      <Md3AgentComposer
        placeholder="Or write your own request…"
        leftActions={
          <Md3IconButton aria-label="Attach a file">
            <Plus />
          </Md3IconButton>
        }
        value={draft}
        onValueChange={setDraft}
        onSubmit={() => setDraft("")}
      />
    </div>
  );
}

const meta = {
  title: "Material 3 Agent/Md3Madlibs",
  component: Md3Madlibs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    template: TEMPLATE,
    blanks: BLANKS,
    description: "Fill in the blanks — you can edit the whole sentence before sending.",
  },
} satisfies Meta<typeof Md3Madlibs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** nucleux.in's live preview: the document chosen, audience and the optional topic still to fill, above the composer. */
export const LivePreview: Story = {
  render: (args) => <WithComposer {...args} defaultValues={{ document: "Q3 Customer Research" }} />,
};

/** Empty scaffold: labelled blanks, the optional one marked; the preview shows what is still missing. */
export const EmptyScaffold: Story = {
  render: (args) => <WithComposer {...args} />,
};

/** Partially completed: a filled blank reads as part of the sentence; the rest are still marked. */
export const PartiallyCompleted: Story = {
  args: { defaultValues: { document: "Q3 Customer Research" } },
  render: (args) => <WithComposer {...args} />,
};

/** AI suggestion available: the agent's value is marked and not part of the request until kept. */
export const AiSuggestion: Story = {
  args: {
    defaultValues: { document: "Q3 Customer Research" },
    agentName: "Aria",
    suggestion: { blank: "audience", value: "Leadership", reason: "the document's owner is the leadership team." },
  },
  render: (args) => <WithComposer {...args} />,
};

/** Complete: every required blank has a value; the sentence reads cleanly. */
export const Complete: Story = {
  args: { defaultValues: FILLED },
  render: (args) => <WithComposer {...args} />,
};

/** Validation needed: the missing blank is flagged in words; nothing entered is cleared. */
export const ValidationNeeded: Story = {
  args: { defaultValues: { audience: "Leadership", topic: "Onboarding issues" }, defaultShowErrors: true },
  render: (args) => <WithComposer {...args} />,
};

/** Ready to use: the sentence is in the composer — editable, unsent — with Undo. */
export const ReadyToUse: Story = {
  args: { defaultValues: FILLED, defaultPlaced: true },
  render: (args) => <WithComposer {...args} />,
};

/** Form-row layout: one labelled row per blank, for when each slot needs room. */
export const FormRows: Story = {
  args: { variant: "form-rows", defaultValues: { document: "Q3 Customer Research" } },
  render: (args) => <WithComposer {...args} />,
};

/** Chip builder: tap a chip to fill the next blank; tap a filled chip to remove it. */
export const ChipBuilder: Story = {
  args: { variant: "chip-builder", defaultValues: { document: "Q3 Customer Research" } },
  render: (args) => <WithComposer {...args} />,
};

/** Underlined blanks inside the sentence. */
export const UnderlineBlanks: Story = {
  args: { blankStyle: "underline", defaultValues: { document: "Q3 Customer Research" } },
  render: (args) => <WithComposer {...args} />,
};

/** Compact density. */
export const Compact: Story = {
  args: { density: "compact", defaultValues: { document: "Q3 Customer Research" } },
  render: (args) => <WithComposer {...args} />,
};
