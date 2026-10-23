import type { Meta, StoryObj } from "@storybook/react";
import { Modes, type ModeOption, type ModesProps } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

/** The site's live-preview modes: speed/depth presets with expected latency. */
const MODES: ModeOption[] = [
  { id: "fast", name: "Fast", icon: "⚡", meta: "~3 seconds", description: "everyday asks and quick lookups" },
  { id: "balanced", name: "Balanced", icon: "⚖️", meta: "~15 seconds", description: "most tasks" },
  { id: "deep", name: "Deep research", shortName: "Deep", icon: "🧠", meta: "~1 minute", description: "multi-source, high-stakes" },
];
const WITH_OFF: ModeOption[] = [
  ...MODES,
  {
    id: "web",
    name: "Web research",
    icon: "🔎",
    meta: "~2 minutes",
    description: "sources from the web",
    unavailable: "Not available in this workspace — web access is turned off.",
  },
];

/** Per-story sample data (ids are family-specific, so they live here rather than in args). */
const SAMPLE: Record<string, Partial<ModesProps>> = {
  LivePreview: { defaultValue: "fast" },
  NoMode: {},
  PickerOpen: { defaultValue: "fast" },
  ModeChanged: { defaultValue: "balanced", defaultNotice: { type: "changed", from: "fast" } },
  ModeUnavailable: { modes: WITH_OFF, defaultValue: "fast", defaultNotice: { type: "unavailable", id: "web" } },
  Segmented: { defaultValue: "fast" },
  ModePickerDropdown: { defaultValue: "fast", modes: WITH_OFF },
  ModeChip: { defaultValue: "fast" },
  RequestSettings: { defaultValue: "fast" },
};

const story = (name: string): Story["render"] =>
  function Render(args) {
    return (
      <Modes
        {...args}
        modes={MODES}
        {...SAMPLE[name]}
        onAdd={() => {}}
        onVoice={() => {}}
      />
    );
  };

const meta = {
  title: "Agent/Modes",
  component: Modes,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <Story />
      ) : (
        <div className="flex min-h-[30rem] w-[34rem] items-end justify-center bg-background p-6">
          <Story />
        </div>
      ),
  ],
  args: { modes: [], placeholder: "Ask Aria…", onValueChange: () => {}, onSubmit: () => {} },
} satisfies Meta<typeof Modes>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** The site's live preview: segmented control, the rich mode list and the mode chip in the composer, Fast active. */
export const LivePreview: Story = { args: { variant: "composer" }, render: story("LivePreview") };

/** No mode chosen yet: the chip reads "Mode" and the agent works the general way. */
export const NoMode: Story = { args: { variant: "composer" }, render: story("NoMode") };

/** The chip's picker open above the composer: each mode with what changes, and "No mode". */
export const PickerOpen: Story = { args: { variant: "composer", defaultOpen: true }, render: story("PickerOpen") };

/** Just switched: the chip updates and one quiet line says so, with Undo. The text is untouched. */
export const ModeChanged: Story = {
  args: { variant: "composer", defaultDraft: "Help me prepare the next product release." },
  render: story("ModeChanged"),
};

/** A mode this workspace can't support was chosen: not applied, the picker says why. */
export const ModeUnavailable: Story = {
  args: { variant: "composer", defaultOpen: true },
  render: story("ModeUnavailable"),
};

/** Variant: three labelled segments — pick a mode like a tab (right-rail, code). */
export const Segmented: Story = { args: { variant: "segmented" }, render: story("Segmented") };

/** Variant: rich rows with name, what it's for and expected speed (generation settings). */
export const ModePickerDropdown: Story = { args: { variant: "list" }, render: story("ModePickerDropdown") };

/** Variant: only the chip, switchable on the fly (chat, email compose toolbars). */
export const ModeChip: Story = { args: { variant: "chip" }, render: story("ModeChip") };

/** Request settings: no Mode chip up front — the tune control right after + carries a dot, names the mode in its accessible name, and its menu lists Mode with the value; that row opens the picker (with a close ×). */
export const RequestSettings: Story = { args: { variant: "composer", trigger: "settings" }, render: story("RequestSettings") };
