import type { Meta, StoryObj } from "@storybook/react";
import { Eye, Flag, Lightbulb, Mic, NotebookPen, Plus, Search } from "lucide-react";
import { Md3Button } from "@nucleux/md3-button";
import { Md3IconButton } from "@nucleux/md3-icon-button";
import { Md3Modes, type Md3ModeOption, type Md3ModesProps } from "./index";

/** The site's Material 3 modes: how Aria approaches the task, separate from the model. */
const MODES: Md3ModeOption[] = [
  { id: "brainstorm", name: "Brainstorm", icon: <Lightbulb />, description: "Explore several possible directions before choosing one." },
  {
    id: "research",
    name: "Research",
    icon: <Search />,
    description: "Gather and compare information from the web, with sources.",
    unavailable: "Not available in this workspace — web access is turned off.",
  },
  { id: "draft", name: "Draft", icon: <NotebookPen />, description: "Write a first version you can edit." },
  { id: "review", name: "Review", icon: <Eye />, description: "Check existing work and point out gaps and risks." },
  { id: "plan", name: "Plan", icon: <Flag />, description: "Break the work into steps with owners and dates." },
];

/** Per-story sample data (ids are family-specific, so they live here rather than in args). */
const SAMPLE: Record<string, Partial<Md3ModesProps>> = {
  LivePreview: { defaultValue: "plan" },
  NoMode: {},
  PickerOpen: { defaultValue: "plan" },
  ModeChanged: { defaultValue: "review", defaultNotice: { type: "changed", from: "plan" } },
  ModeUnavailable: { defaultNotice: { type: "unavailable", id: "research" } },
  Segmented: { defaultValue: "plan", modes: MODES.filter((m) => m.id !== "research") },
  ModePickerDropdown: { defaultValue: "plan" },
  ModeChip: { defaultValue: "plan" },
};

const story = (name: string): Story["render"] =>
  function Render(args) {
    return (
      <Md3Modes
        {...args}
        modes={MODES}
        defaultDraft="Help me prepare the next product release."
        {...SAMPLE[name]}
        composerLeading={
          <Md3IconButton aria-label="Attach a file">
            <Plus />
          </Md3IconButton>
        }
        composerActions={
          <>
            <Md3Button variant="text" aria-label="Model Balanced, effort High" className="px-3">
              <span className="font-semibold">Balanced</span>{" "}
              <span className="font-normal">High</span>
            </Md3Button>
            <Md3IconButton aria-label="Voice input">
              <Mic />
            </Md3IconButton>
          </>
        }
      />
    );
  };

const meta = {
  title: "Material 3 Agent/Md3Modes",
  component: Md3Modes,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[34rem] w-[42rem] items-end justify-center bg-md-surface p-6">
        <Story />
      </div>
    ),
  ],
  args: { modes: [], placeholder: "Ask Aria…", onValueChange: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof Md3Modes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The site's live preview: "Mode Plan" set in the composer, beside the model chip; text untouched. */
export const LivePreview: Story = { args: { variant: "composer" }, render: story("LivePreview") };

/** No mode chosen yet: an outlined Mode chip; Aria works the general way. */
export const NoMode: Story = { args: { variant: "composer" }, render: story("NoMode") };

/** The picker grows up from the composer: each mode with what changes, an unavailable one with why, and "No mode". */
export const PickerOpen: Story = { args: { variant: "composer", defaultOpen: true }, render: story("PickerOpen") };

/** Just switched Plan → Review: the chip updates and one quiet line says so, with Undo. */
export const ModeChanged: Story = {
  args: { variant: "composer", defaultDraft: "Help me prepare the next product release." },
  render: story("ModeChanged"),
};

/** Research was chosen but web access is off: not applied, the picker says why. */
export const ModeUnavailable: Story = {
  args: { variant: "composer", defaultOpen: true },
  render: story("ModeUnavailable"),
};

/** Variant: a Material 3 segmented button of modes. */
export const Segmented: Story = { args: { variant: "segmented" }, render: story("Segmented") };

/** Variant: the mode rows on their own, with what each changes. */
export const ModePickerDropdown: Story = { args: { variant: "list" }, render: story("ModePickerDropdown") };

/** Variant: only the Mode chip and its picker. */
export const ModeChip: Story = { args: { variant: "chip" }, render: story("ModeChip") };
