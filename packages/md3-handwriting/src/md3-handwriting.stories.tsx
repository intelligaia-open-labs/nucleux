import type { Meta, StoryObj } from "@storybook/react";
import { Md3HandwritingInput, type HandwritingRecognition, type HandwritingStroke } from "./index";
import { SitePreview as SitePreviewDemo } from "./site-preview";

const meta = {
  title: "Material 3 Agent/Md3HandwritingInput",
  component: Md3HandwritingInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story, { id }) =>
      id.endsWith("--site-preview") ? (
        <div className="flex w-[44rem] max-w-full justify-center">
          <Story />
        </div>
      ) : (
        <div className="w-[26rem]"><Story /></div>
      ),
  ],
  args: { onAccept: () => {} },
} satisfies Meta<typeof Md3HandwritingInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** As nucleux.in's live preview shows it. */
export const SitePreview: Story = { render: () => <SitePreviewDemo /> };

/** A wavy line of "writing" — stands in for real ink in the static stories. */
const scribble = (y: number, from = 20, to = 330): HandwritingStroke => ({
  pointerType: "pen",
  points: Array.from({ length: 40 }, (_, i) => {
    const x = from + ((to - from) * i) / 39;
    return { x, y: y + Math.sin(i / 2.2) * 9 - (i % 7 === 0 ? 6 : 0), pressure: 0.35 + (i % 5) / 10, t: i * 16 };
  }),
});

/** Demo recogniser: the app supplies this — Nucleux never recognises on its own. */
const demoRecognize = async (): Promise<HandwritingRecognition> => {
  await new Promise((r) => setTimeout(r, 900));
  return {
    text: "Q2 revenue flow",
    words: [{ text: "Q2" }, { text: "revenue" }, { text: "flow", uncertain: true, alternatives: ["trend", "flaw"] }],
    alternatives: ["Q2 revenue trend", "Q2 revenue flaw"],
  };
};

/** A pad for stylus or finger. Write, then Recognise; uncertain words stop for a look. */
export const DrawPad: Story = {
  args: { variant: "draw-pad", placeholder: "Draw or write…" },
  render: (args) => <Md3HandwritingInput {...args} onRecognize={demoRecognize} />,
};

/** The reading streams in under the ink after a pause; one uncertain word blocks Add to message. */
export const LiveOcr: Story = {
  args: {
    variant: "live-ocr",
    statusText: "Recognising your writing…",
    defaultStrokes: [scribble(70)],
    defaultRecognition: {
      text: "Q2 revenue flow",
      words: [{ text: "Q2" }, { text: "revenue" }, { text: "flow", uncertain: true, alternatives: ["trend", "flaw"] }],
      alternatives: ["Q2 revenue trend"],
    },
  },
  render: (args) => <Md3HandwritingInput {...args} onRecognize={demoRecognize} />,
};

const ring: HandwritingStroke = {
  pointerType: "pen",
  points: Array.from({ length: 48 }, (_, i) => {
    const a = (i / 46) * Math.PI * 2 - 0.3;
    return { x: 150 + Math.cos(a) * 70, y: 95 + Math.sin(a) * 45, pressure: 0.6, t: i * 16 };
  }),
};

/** Draw on top of a diagram — the agent reads the mark as an instruction. */
export const AnnotationStroke: Story = {
  args: {
    variant: "annotation-stroke",
    label: "Schema diagram — draw to annotate",
    defaultStrokes: [ring],
    defaultRecognition: { text: "What's this?" },
    acceptLabel: "Ask Aria",
  },
  render: (args) => (
    <Md3HandwritingInput
      {...args}
      onRecognize={async () => ({ text: "What's this?", alternatives: ["Why is this here?"] })}
    >
      <div className="grid aspect-video grid-cols-3 gap-3 bg-md-primary-container p-6">
        <span className="rounded-md-sm bg-md-surface/80" />
        <span className="rounded-md-sm bg-md-surface/80" />
        <span className="rounded-md-sm bg-md-surface/50" />
      </div>
    </Md3HandwritingInput>
  ),
};

/** The keyboard path: the same component, typed. */
export const TypingFallback: Story = {
  args: { defaultMode: "type", typingLabel: "Type your request" },
};
