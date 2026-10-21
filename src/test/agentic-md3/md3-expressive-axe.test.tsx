import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3VisualInput } from "@nucleux/md3-visual-input";
import { Md3HandwritingInput } from "@nucleux/md3-handwriting";
import { Md3GestureInput } from "@nucleux/md3-gesture";
import { Md3VoiceInput } from "@nucleux/md3-voice-input";
import {
  Md3StructuredInput,
  Md3StructuredInputSlots,
  Md3StructuredInputTags,
  Md3StructuredInputWizard,
} from "@nucleux/md3-structured-input";

const ink = [{ pointerType: "pen", points: [{ x: 10, y: 30, pressure: 0.6, t: 0 }, { x: 60, y: 12, pressure: 0.7, t: 16 }] }];
const file = (name: string) => ({ id: name, file: new File(["x"], name, { type: "image/png" }) });

const cases = [
  { name: "Md3VisualInput drag-drop with files", ui: <Md3VisualInput defaultFiles={[file("a.png"), { ...file("b.png"), status: "reading" as const }]} /> },
  { name: "Md3VisualInput camera with photo", ui: <Md3VisualInput variant="camera-capture" defaultFiles={[file("photo.png")]} /> },
  { name: "Md3HandwritingInput draw-pad", ui: <Md3HandwritingInput onRecognize={async () => ({ text: "x" })} /> },
  { name: "Md3HandwritingInput recognised + alternatives", ui: <Md3HandwritingInput defaultStrokes={ink} defaultRecognition={{ text: "Q2 revenue trend", alternatives: ["Q2 revenue flaw"] }} /> },
  { name: "Md3HandwritingInput annotation", ui: <Md3HandwritingInput variant="annotation-stroke" defaultStrokes={ink} defaultRecognition={{ text: "What's this?" }}><div className="aspect-video" /></Md3HandwritingInput> },
  { name: "Md3HandwritingInput typing", ui: <Md3HandwritingInput defaultMode="type" /> },
  { name: "Md3GestureInput pinch", ui: <Md3GestureInput variant="pinch-context" actions={[{ gesture: "pinch-out", label: "What spiked here?" }, { gesture: "pinch-in", label: "Zoom out" }]}><div className="aspect-video" /></Md3GestureInput> },
  { name: "Md3VoiceInput idle", ui: <Md3VoiceInput /> },
  { name: "Md3VoiceInput recording", ui: <Md3VoiceInput state="recording" duration="0:08" onPause={() => {}} /> },
  { name: "Md3VoiceInput mic-button", ui: <Md3VoiceInput variant="mic-button" state="recording" duration="0:08" /> },
  { name: "Md3VoiceInput transcribing", ui: <Md3VoiceInput state="transcribing" transcript="Draft a follow-up…" /> },
  { name: "Md3VoiceInput error", ui: <Md3VoiceInput state="error" onRetry={() => {}} onCancel={() => {}} /> },
  { name: "Md3VoiceInput stream paused", ui: <Md3VoiceInput variant="transcript-stream" state="paused" transcript="Find" onResume={() => {}} onCancel={() => {}} /> },
  { name: "Md3StructuredInput single", ui: <Md3StructuredInput question="Which audience?" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} allowOther onSubmit={() => {}} onSkip={() => {}} /> },
  { name: "Md3StructuredInput multi", ui: <Md3StructuredInput multiple question="Include?" defaultValue={["a"]} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} /> },
  { name: "Md3StructuredInputSlots", ui: <Md3StructuredInputSlots slots={[{ name: "audience", label: "Audience", options: [{ value: "execs", label: "Execs" }], suggested: "from the invite", helper: "Who reads it" }, { name: "topic", label: "Topic", placeholder: "Standup", wide: true }]} defaultValues={{ audience: "execs" }} freeform onSubmit={() => {}} /> },
  { name: "Md3StructuredInputTags", ui: <Md3StructuredInputTags defaultValue={[{ type: "text", text: "Update" }, { type: "tag", trigger: "@", value: "sam" }, { type: "tag", trigger: "p:", value: "Apollo" }]} onSubmit={() => {}} /> },
  { name: "Md3StructuredInputWizard", ui: <Md3StructuredInputWizard steps={["Intent", "Audience", "Tone"]} defaultStep={1} description="Who?" onSubmit={() => {}}><p>Fields</p></Md3StructuredInputWizard> },
];

describe("md3 axe (extra)", () => {
  for (const c of cases)
    it(c.name, async () => {
      const { container } = render(c.ui);
      expect(await axe(container)).toHaveNoViolations();
    });

  it("handwriting uncertain-word menu open passes axe and supports keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Md3HandwritingInput defaultStrokes={ink} defaultRecognition={{ text: "a flow", words: [{ text: "a" }, { text: "flow", uncertain: true, alternatives: ["trend"] }] }} />,
    );
    const trigger = screen.getByRole("button", { name: /flow — uncertain/ });
    await user.click(trigger);
    expect(screen.getByRole("menu", { name: "Did you write…" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("tag suggestions render as chips and pass axe", async () => {
    const user = userEvent.setup();
    const { container } = render(<Md3StructuredInputTags triggers={[{ trigger: "@", label: "Person", suggestions: ["sam", "priya"] }]} onSubmit={() => {}} />);
    await user.type(screen.getByRole("textbox"), "@s");
    expect(screen.getByRole("button", { name: "@sam" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("visual-input error alert passes axe", async () => {
    const { container } = render(<Md3VisualInput variant="paste-chip" maxSize={1} />);
    fireEvent.paste(screen.getByRole("group", { name: "Image input" }), { clipboardData: { files: [new File(["xx"], "big.png", { type: "image/png" })] } });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
