import type { Meta, StoryObj } from "@storybook/react";
import type { PresetStyle, PresetStyleDraft } from "@nucleux/preset-styles";
import { PresetStyles } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

/** Image-output presets (the Style grid): token tones, no raw colours. */
const outputStyles: PresetStyle[] = [
  { id: "photo", name: "Photo", swatch: "destructive", description: "Photographic, natural light." },
  { id: "illustration", name: "Illustration", swatch: "info", description: "Flat, drawn shapes." },
  { id: "isometric", name: "Isometric", swatch: "success", description: "3D at a fixed angle." },
  { id: "sketch", name: "Sketch", swatch: "warning", description: "Loose pencil lines." },
];

/** Reply-writing styles (Use style), each with a sample answer to the same request. */
const writingStyles: PresetStyle[] = [
  {
    id: "normal",
    name: "Normal",
    description: "Aria’s default replies.",
    sample:
      "October shipped 14 of 17 planned items. Exports are up to twice as fast, shared links no longer expire early, and shared dashboards are live. SSO for Teams, CSV column order and Android checkout latency move to November.",
  },
  {
    id: "concise",
    name: "Concise",
    description: "Shorter, more direct replies.",
    sample:
      "14 of 17 shipped: faster exports, shared-link fix, shared dashboards. Moved to November: SSO, CSV order, Android latency.",
  },
  {
    id: "formal",
    name: "Formal",
    description: "Clear, polished, professional replies.",
    sample:
      "The October release delivered 14 of the 17 planned items, including improved export performance, a correction to shared-link expiry and the introduction of shared dashboards. Three items have been deferred to November.",
  },
  {
    id: "explanatory",
    name: "Explanatory",
    description: "Teaches as it answers — context and the reasons why.",
    sample:
      "Fourteen of seventeen items shipped. The biggest change is exports: they are up to twice as fast because they now run in the background. Three items slipped to November, mostly because SSO for Teams depends on identity work that is still in review.",
  },
];

const houseDraft: PresetStyleDraft = {
  name: "Release notes voice",
  description: "One line per change, the benefit first, plain verbs, no marketing words.",
  instructions:
    "Write one short line per change. Start each line with New, Faster, Fixed or Next month. Lead with what the reader can now do. Use plain verbs; avoid marketing words and exclamation marks.",
  sample:
    "New: shared dashboards — your whole team sees the same numbers. Faster: exports take half the time. Fixed: shared links stay open until you close them. Next month: SSO for Teams.",
};

const menuArgs = {
  variant: "menu" as const,
  styles: writingStyles,
  agentName: "Aria",
  previewPrompt: "Summarize the October release.",
  defaultMessage: "Summarize the October release.",
  onSubmit: () => {},
  onSaveStyle: () => {},
  onGenerateStyle: () => new Promise<PresetStyleDraft>((resolve) => setTimeout(() => resolve(houseDraft), 1200)),
};

/** Room above the composer for the menu, which opens upward. */
const composerFrame = (Story: () => JSX.Element) => (
  <div className="flex min-h-[36rem] w-[40rem] max-w-full flex-col justify-end">
    <Story />
  </div>
);

const meta = {
  title: "Agent/PresetStyles",
  component: PresetStyles,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { styles: outputStyles, onValueChange: () => {} },
} satisfies Meta<typeof PresetStyles>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** Creative canvas: pick the look before generating — swatches, a reference-image drop, and the style locked for the project. */
export const StyleGrid: Story = {
  args: { variant: "grid", defaultValue: "photo", allowReference: true, lockable: true, defaultLocked: true },
  render: (args) => <div className="w-[30rem] max-w-full"><PresetStyles {...args} /></div>,
};

/** Chat: "Use style" open from the composer's Style control, previewing Concise — nothing changes until they choose. */
export const UseStyleMenu: Story = {
  args: { ...menuArgs, defaultView: "menu", defaultPreview: "concise" },
  decorators: [composerFrame],
};

/** Right rail: a short list of brand-agreed presets the team shares. */
export const NamedPresets: Story = {
  args: {
    variant: "list",
    label: "Brand presets",
    defaultValue: "brand",
    styles: [
      { id: "brand", name: "Brand · default", swatch: "brand", description: "Our colours, clean product shots." },
      { id: "editorial", name: "Editorial", swatch: "neutral", description: "Muted, magazine-style layouts." },
      { id: "playful", name: "Playful", swatch: "warning", description: "Bright colour, rounded shapes." },
    ],
  },
  render: (args) => <div className="w-[22rem] max-w-full"><PresetStyles {...args} /></div>,
};

/** Chat: a reference image is attached — the next generation matches its aesthetic. */
export const ReferenceImage: Story = {
  args: { variant: "grid", defaultValue: "illustration", allowReference: true, defaultReference: { name: "reference.jpg" } },
  render: (args) => <div className="w-[30rem] max-w-full"><PresetStyles {...args} /></div>,
};

/** No style chosen: Aria writes as usual and the Style control waits in the composer. */
export const Normal: Story = {
  args: { ...menuArgs },
  decorators: [composerFrame],
};

/** They chose Concise: the chip names it, × goes back to Normal, and one line says where it applies. */
export const StyleApplied: Story = {
  args: { ...menuArgs, defaultValue: "concise", defaultNotice: "applied" },
  decorators: [composerFrame],
};

/** Mid-conversation switch to Formal — earlier replies keep the style they were written in. */
export const StyleSwitched: Story = {
  args: {
    ...menuArgs,
    defaultValue: "formal",
    defaultNotice: "applied",
    earlierReplies: true,
    defaultMessage: "Now draft the customer email about it.",
  },
  decorators: [composerFrame],
};

/** × on the chip: back to Normal, with Undo. */
export const BackToNormal: Story = {
  args: { ...menuArgs, defaultNotice: "reset" },
  decorators: [composerFrame],
};

/** Create & edit styles: start from writing they like (or a description); Generate style is the only AI step. */
export const CreateStyle: Story = {
  args: { ...menuArgs, defaultView: "create" },
  decorators: [composerFrame],
};

/** The generated style, marked as Aria's: rename, adjust, read the instructions, preview — then Save or Save and use. */
export const StyleGenerated: Story = {
  args: { ...menuArgs, defaultView: "review", defaultGenerated: houseDraft },
  decorators: [composerFrame],
};

/** Their own style listed under "Your styles", tagged as made from their writing. */
export const WithCustomStyle: Story = {
  args: {
    ...menuArgs,
    defaultView: "menu",
    defaultValue: "house",
    styles: [
      ...writingStyles,
      { id: "house", name: houseDraft.name, description: houseDraft.description, sample: houseDraft.sample, custom: true },
    ],
  },
  decorators: [composerFrame],
};

/** Request settings: no Style control up front — the tune control carries a dot and “Style Concise” in its accessible name; its menu lists Style with the value, and that row opens Use style (with a close ×). */
export const RequestSettings: Story = {
  args: { ...menuArgs, trigger: "settings", defaultValue: "concise" },
  decorators: [composerFrame],
};
