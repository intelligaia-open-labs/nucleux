import type { Meta, StoryObj } from "@storybook/react";
import {
  Eye,
  Flag,
  Lightbulb,
  MessagesSquare,
  NotebookPen,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import { Md3OpenInputModelChip } from "@nucleux/md3-open-input";
import { Md3Modes, type Md3ModeOption, type Md3ModesProps } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

/** The site's Material 3 modes: how Aria approaches the task, separate from the model. */
const MODES: Md3ModeOption[] = [
  {
    id: "brainstorm",
    name: "Brainstorm",
    icon: <Lightbulb />,
    description: "Explore several possible directions before choosing one.",
  },
  {
    id: "research",
    name: "Research",
    icon: <Search />,
    description: "Gather and compare information from the web, with sources.",
    unavailable: "Not available in this workspace — web access is turned off.",
  },
  {
    id: "draft",
    name: "Draft",
    icon: <NotebookPen />,
    description: "Write a first version you can edit.",
  },
  {
    id: "review",
    name: "Review",
    icon: <Eye />,
    description: "Check existing work and point out gaps and risks.",
  },
  {
    id: "plan",
    name: "Plan",
    icon: <Flag />,
    description: "Break the work into steps with owners and dates.",
  },
];

/** Per-story sample data (ids are family-specific, so they live here rather than in args). */
const SAMPLE: Record<string, Partial<Md3ModesProps>> = {
  LivePreview: {
    defaultValue: "plan",
    trigger: "settings",
    settingsItems: [
      { id: "tone", label: "Tone", icon: <MessagesSquare />, value: "Default" },
      { id: "style", label: "Style", icon: <PenLine />, value: "Normal" },
      { id: "improve", label: "Improve prompt", icon: <Sparkles /> },
    ],
  },
  NoMode: {},
  PickerOpen: { defaultValue: "plan" },
  ModeChanged: { defaultValue: "review", defaultNotice: { type: "changed", from: "plan" } },
  ModeUnavailable: { defaultNotice: { type: "unavailable", id: "research" } },
  Segmented: { defaultValue: "plan", modes: MODES.filter((m) => m.id !== "research") },
  ModePickerDropdown: { defaultValue: "plan" },
  ModeChip: { defaultValue: "plan" },
  RequestSettings: { defaultValue: "plan" },
};

const story = (name: string): Story["render"] =>
  function Render(args) {
    return (
      <div className="flex min-h-[34rem] w-[42rem] items-end justify-center p-6">
        <Md3Modes
          {...args}
          modes={MODES}
          defaultDraft="Help me prepare the next product release."
          {...SAMPLE[name]}
          onAdd={() => {}}
          model={<Md3OpenInputModelChip name="Balanced" detail="High" />}
          onVoice={() => {}}
        />
      </div>
    );
  };

const meta = {
  title: "Material 3 Agent/Md3Modes",
  component: Md3Modes,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { modes: [], placeholder: "Ask Aria…", onValueChange: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof Md3Modes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** The site's live preview: Mode Plan set — no chip up front; a dot on the tune control right after + says a setting is on, and its menu lists Mode with the value. Text untouched. */
export const LivePreview: Story = { args: { variant: "composer" }, render: story("LivePreview") };

/** No mode chosen yet: an outlined Mode chip; Aria works the general way. */
export const NoMode: Story = { args: { variant: "composer" }, render: story("NoMode") };

/** The picker grows up from the composer: each mode with what changes, an unavailable one with why, and "No mode". */
export const PickerOpen: Story = {
  args: { variant: "composer", defaultOpen: true },
  render: story("PickerOpen"),
};

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
export const ModePickerDropdown: Story = {
  args: { variant: "list" },
  render: story("ModePickerDropdown"),
};

/** Variant: only the Mode chip and its picker. */
export const ModeChip: Story = { args: { variant: "chip" }, render: story("ModeChip") };

/** Request settings: no Mode chip up front — the tune control right after + carries a dot, names the mode in its accessible name, and its menu lists Mode with the value; that row opens the picker (with a close ×). */
export const RequestSettings: Story = {
  args: { variant: "composer", trigger: "settings" },
  render: story("RequestSettings"),
};
