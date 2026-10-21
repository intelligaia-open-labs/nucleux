import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3VisualInput as VisualInput } from "@nucleux/md3-visual-input";
import { Md3HandwritingInput as HandwritingInput } from "@nucleux/md3-handwriting";
import { Md3GestureInput as GestureInput, recognizeSimpleGesture } from "@nucleux/md3-gesture";

// jsdom has no PointerEvent; give fireEvent one that carries coordinates.
if (!("PointerEvent" in window)) {
  class TestPointerEvent extends MouseEvent {
    pointerId: number;
    pointerType: string;
    pressure: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.pressure = init.pressure ?? 0.5;
    }
  }
  (window as unknown as { PointerEvent: unknown }).PointerEvent = TestPointerEvent;
}

const ink = [{ pointerType: "pen", points: [{ x: 10, y: 30, pressure: 0.6, t: 0 }, { x: 60, y: 12, pressure: 0.7, t: 16 }] }];

const cases = [
  {
    name: "VisualInput drag-drop",
    ui: <VisualInput variant="drag-drop" hint="PNG, JPG, PDF · up to 20 MB" accept="image/*,.pdf" />,
  },
  {
    name: "VisualInput paste-chip",
    ui: (
      <VisualInput
        variant="paste-chip"
        seeText="Aria will see this when you send"
        defaultFiles={[{ id: "1", file: new File(["x"], "screenshot.png", { type: "image/png" }) }]}
      />
    ),
  },
  { name: "VisualInput camera", ui: <VisualInput variant="camera-capture" cameraText="Camera is on only while you take the photo." /> },
  {
    name: "HandwritingInput live-ocr",
    ui: (
      <HandwritingInput
        variant="live-ocr"
        onRecognize={async () => ({ text: "" })}
        defaultStrokes={ink}
        defaultRecognition={{
          text: "Q2 revenue flow",
          words: [{ text: "Q2" }, { text: "revenue" }, { text: "flow", uncertain: true, alternatives: ["flaw", "trend"] }],
        }}
      />
    ),
  },
  {
    name: "GestureInput swipe-action",
    ui: (
      <GestureInput
        variant="swipe-action"
        actions={[
          { gesture: "swipe-left", label: "Summarise" },
          { gesture: "swipe-right", label: "File away" },
        ]}
      >
        <div className="rounded-lg border p-3">Slack thread: #renewals</div>
      </GestureInput>
    ),
  },
  {
    name: "GestureInput circle",
    ui: (
      <GestureInput variant="circle-to-select" actions={[{ gesture: "circle", label: "Enhance this" }]}>
        <div className="aspect-video bg-muted" />
      </GestureInput>
    ),
  },
];

describe("axe", () => {
  for (const c of cases)
    it(c.name, async () => {
      const { container } = render(c.ui);
      expect(await axe(container)).toHaveNoViolations();
    });
});

describe("VisualInput", () => {
  it("attaches a pasted image as a removable chip and refuses oversized files", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const onReject = vi.fn();
    render(<VisualInput variant="paste-chip" maxSize={1024} onFilesChange={onFilesChange} onReject={onReject} />);
    const region = screen.getByRole("group", { name: "Image input" });
    const shot = new File(["png"], "screenshot.png", { type: "image/png" });
    fireEvent.paste(region, { clipboardData: { files: [shot] } });
    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ file: shot, source: "paste" })]);
    expect(screen.getByText("screenshot.png")).toBeInTheDocument();

    const big = new File([new Uint8Array(4096)], "huge.png", { type: "image/png" });
    fireEvent.paste(region, { clipboardData: { files: [big] } });
    expect(screen.getByRole("alert")).toHaveTextContent("huge.png is larger than 1 KB.");
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "size" })]);

    await user.click(screen.getByRole("button", { name: "Remove screenshot.png" }));
    expect(onFilesChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByText("screenshot.png")).not.toBeInTheDocument();
  });

  it("browses with the file picker and rejects unsupported types with what can be used", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const onFilesChange = vi.fn();
    const { container } = render(
      <VisualInput onFilesChange={onFilesChange} unsupportedText="Aria can read PNG, JPG and HEIC." />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(input, [
      new File(["a"], "chart.png", { type: "image/png" }),
      new File(["b"], "notes.txt", { type: "text/plain" }),
    ]);
    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ source: "upload" })]);
    expect(screen.getByRole("alert")).toHaveTextContent("notes.txt can’t be attached. Aria can read PNG, JPG and HEIC.");
  });

  it("camera variant offers a capture input and a shutter button", () => {
    const { container } = render(<VisualInput variant="camera-capture" />);
    expect(container.querySelector('input[capture="environment"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Take photo" })).toBeInTheDocument();
  });
});

describe("HandwritingInput", () => {
  it("blocks Add to message until the uncertain word is settled, then hands back the chosen text", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(
      <HandwritingInput
        defaultStrokes={ink}
        onAccept={onAccept}
        defaultRecognition={{
          text: "Q2 revenue flow",
          words: [{ text: "Q2" }, { text: "revenue" }, { text: "flow", uncertain: true, alternatives: ["flaw", "trend"] }],
        }}
      />,
    );
    const add = screen.getByRole("button", { name: "Add to message" });
    expect(add).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /flow — uncertain/ }));
    await user.click(screen.getByRole("menuitem", { name: "trend" }));
    expect(screen.getByRole("textbox", { name: "Recognised text" })).toHaveValue("Q2 revenue trend");
    await user.click(add);
    expect(onAccept).toHaveBeenCalledWith("Q2 revenue trend", expect.objectContaining({ source: "handwriting", strokes: ink }));
  });

  it("calls onRecognize with the strokes and keeps the ink on failure with Retry", async () => {
    const user = userEvent.setup();
    const onRecognize = vi.fn().mockRejectedValueOnce(new Error("no")).mockResolvedValueOnce({ text: "Q2 revenue trend" });
    render(<HandwritingInput defaultStrokes={ink} onRecognize={onRecognize} />);
    await user.click(screen.getByRole("button", { name: "Recognise" }));
    expect(await screen.findByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(onRecognize.mock.calls[0][0].strokes).toEqual(ink);
    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("textbox", { name: "Recognised text" })).toHaveValue("Q2 revenue trend");
  });

  it("offers a typed fallback", async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(<HandwritingInput onAccept={onAccept} />);
    await user.click(screen.getByRole("button", { name: "Type instead" }));
    await user.type(screen.getByRole("textbox", { name: "Type your request" }), "Q2 revenue trend");
    await user.click(screen.getByRole("button", { name: "Add to message" }));
    expect(onAccept).toHaveBeenCalledWith("Q2 revenue trend", expect.objectContaining({ source: "typed" }));
  });

  it("draws with pointer events", () => {
    const onStrokesChange = vi.fn();
    render(<HandwritingInput onStrokesChange={onStrokesChange} />);
    const pad = screen.getByRole("img", { name: /Handwriting pad/ });
    fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "pen", clientX: 5, clientY: 5, pressure: 0.4 });
    fireEvent.pointerMove(pad, { pointerId: 1, pointerType: "pen", clientX: 25, clientY: 15, pressure: 0.6 });
    fireEvent.pointerUp(pad, { pointerId: 1 });
    expect(onStrokesChange).toHaveBeenCalledWith([expect.objectContaining({ points: expect.any(Array) })]);
    expect(onStrokesChange.mock.calls[0][0][0].points.length).toBe(2);
  });
});

describe("GestureInput", () => {
  it("keyboard equivalent captures, then Enter confirms the action", async () => {
    const user = userEvent.setup();
    const onGesture = vi.fn();
    render(
      <GestureInput
        actions={[
          { gesture: "swipe-left", label: "Summarise" },
          { gesture: "swipe-right", label: "File away" },
        ]}
        onGesture={onGesture}
      >
        <div>Slack thread: #renewals</div>
      </GestureInput>,
    );
    const target = screen.getByRole("group", { name: /Gesture area/ });
    target.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onGesture).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Swiped left · Summarise");
    await user.keyboard("{Enter}");
    expect(onGesture).toHaveBeenCalledWith(expect.objectContaining({ gesture: "swipe-left", source: "keyboard" }));
  });

  it("recognises a pointer swipe and can be dismissed", async () => {
    const user = userEvent.setup();
    const onGesture = vi.fn();
    const onDismiss = vi.fn();
    render(
      <GestureInput actions={[{ gesture: "swipe-right", label: "File away" }]} onGesture={onGesture} onDismiss={onDismiss}>
        <div>Card</div>
      </GestureInput>,
    );
    const target = screen.getByRole("group", { name: /Gesture area/ });
    fireEvent.pointerDown(target, { pointerId: 1, clientX: 10, clientY: 10, timeStamp: 0 });
    fireEvent.pointerMove(target, { pointerId: 1, clientX: 60, clientY: 12 });
    await act(async () => {
      fireEvent.pointerUp(target, { pointerId: 1, clientX: 120, clientY: 14 });
    });
    expect(screen.getByRole("status")).toHaveTextContent("Swiped right · File away");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
    expect(onGesture).not.toHaveBeenCalled();
  });

  it("confirm={false} fires immediately and offers Undo", async () => {
    const user = userEvent.setup();
    const onGesture = vi.fn();
    const onUndo = vi.fn();
    render(
      <GestureInput confirm={false} actions={[{ gesture: "circle", label: "Enhance this" }]} onGesture={onGesture} onUndo={onUndo}>
        <div>Image</div>
      </GestureInput>,
    );
    await user.click(screen.getByRole("button", { name: /Enhance this/ }));
    expect(onGesture).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalled();
  });

  it("built-in recogniser", () => {
    const p = (x: number, y: number) => ({ x, y, t: 0 });
    expect(recognizeSimpleGesture({ strokes: [[p(100, 0), p(10, 5)]], width: 200, height: 200 })).toBe("swipe-left");
    const circle = Array.from({ length: 25 }, (_, i) => p(100 + 50 * Math.cos((i / 24) * 2 * Math.PI), 100 + 50 * Math.sin((i / 24) * 2 * Math.PI)));
    expect(recognizeSimpleGesture({ strokes: [circle], width: 200, height: 200 })).toBe("circle");
    expect(recognizeSimpleGesture({ strokes: [[p(90, 90), p(40, 40)], [p(110, 110), p(160, 160)]], width: 200, height: 200 })).toBe("pinch-out");
  });
});
