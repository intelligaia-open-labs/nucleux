import type { Meta, StoryObj } from "@storybook/react";
import { StructuredInput, StructuredInputSlots, StructuredInputTags, StructuredInputWizard } from "./index";

const meta = {
  title: "Agent/StructuredInput",
  component: StructuredInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: { question: "Who is this for?", options: [], onSubmit: () => {}, onSkip: () => {} },
} satisfies Meta<typeof StructuredInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleChoice: Story = {
  args: {
    question: "Which audience is this for?",
    options: [
      { value: "execs", label: "Executives" },
      { value: "eng", label: "Engineers" },
      { value: "customers", label: "Customers" },
    ],
    allowOther: true,
  },
};

export const MultiChoice: Story = {
  args: {
    question: "What should the summary include?",
    multiple: true,
    options: [
      { value: "highlights", label: "Highlights" },
      { value: "actions", label: "Action items" },
      { value: "risks", label: "Risks" },
    ],
  },
};

/** `named-slots`: a short set of labelled fields that fill a prompt template — never all required. */
export const NamedSlots: Story = {
  args: { question: "", options: [] },
  render: () => (
    <StructuredInputSlots
      slots={[
        {
          name: "audience",
          label: "Audience",
          options: [
            { value: "execs", label: "Execs" },
            { value: "eng", label: "Engineering" },
            { value: "customers", label: "Customers" },
          ],
          suggested: "from the meeting invite",
        },
        { name: "length", label: "Length", placeholder: "3 bullets" },
        { name: "topic", label: "Topic", placeholder: "Yesterday's standup", wide: true },
      ]}
      defaultValues={{ audience: "execs" }}
      freeform
      onSubmit={() => {}}
    />
  ),
};

/** `tag-input`: type `@` for a person, `p:` for a project, `/` for a file — each becomes a chip. */
export const TagInput: Story = {
  args: { question: "", options: [] },
  render: () => (
    <StructuredInputTags
      triggers={[
        { trigger: "@", label: "Person", suggestions: ["sam", "priya", "lee"] },
        { trigger: "p:", label: "Project", suggestions: ["Apollo", "Atlas"] },
        { trigger: "/", label: "File" },
      ]}
      defaultValue={[
        { type: "text", text: "Update" },
        { type: "tag", trigger: "@", value: "sam" },
        { type: "text", text: "on" },
        { type: "tag", trigger: "p:", value: "Apollo" },
        { type: "text", text: "before Friday" },
      ]}
      onSubmit={() => {}}
    />
  ),
};

/** `wizard-step`: a multi-step frame for high-stakes drafts — legal, HR, enterprise. */
export const WizardStep: Story = {
  args: { question: "", options: [] },
  render: () => (
    <StructuredInputWizard
      steps={["Intent", "Audience", "Tone"]}
      defaultStep={1}
      description="Who is the brief for?"
      onSubmit={() => {}}
    >
      <StructuredInput
        className="border-0 p-0"
        question="Choose an audience"
        options={[
          { value: "legal", label: "Legal review" },
          { value: "hr", label: "HR partner" },
          { value: "staff", label: "All staff" },
        ]}
      />
    </StructuredInputWizard>
  ),
};
