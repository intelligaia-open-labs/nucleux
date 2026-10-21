import type { Meta, StoryObj } from "@storybook/react";
import { Md3VisualInput, type VisualInputFile } from "./index";

const meta = {
  title: "Material 3 Agent/Md3VisualInput",
  component: Md3VisualInput,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: { onFilesChange: () => {}, onReject: () => {} },
} satisfies Meta<typeof Md3VisualInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dashed drop zone for the right rail or canvas: drag a screenshot in, paste one, or browse. */
export const DragDrop: Story = {
  args: {
    variant: "drag-drop",
    accept: "image/*,.pdf",
    label: "Drop an image or paste a screenshot",
    hint: "PNG, JPG, PDF · up to 20 MB",
    seeText: "Aria will see this when you send",
    unsupportedText: "Aria can read images (PNG, JPG, HEIC) and PDFs.",
  },
};

const preview =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="hsl(222 90% 92%)"/><rect x="8" y="10" width="32" height="6" rx="2" fill="hsl(222 60% 70%)"/><rect x="8" y="22" width="22" height="4" rx="2" fill="hsl(222 40% 78%)"/></svg>',
  );

/** A pasted screenshot lands as a chip above the composer — paired with a prompt, never auto-sent. */
export const PasteChip: Story = {
  args: { variant: "paste-chip", seeText: "Aria will see this when you send" },
  render: (args) => {
    const shot: VisualInputFile = {
      id: "shot",
      file: new File(["…"], "screenshot.png", { type: "image/png" }),
      previewUrl: preview,
    };
    return (
      <Md3VisualInput {...args} defaultFiles={[shot]}>
        <textarea
          aria-label="Message Aria"
          placeholder="What can I help you find in this?"
          rows={2}
          className="w-full resize-none rounded-md-xl bg-md-surface-container-high px-4 py-3 text-sm text-md-on-surface outline-none placeholder:text-md-on-surface-variant focus-visible:ring-2 focus-visible:ring-md-primary"
        />
      </Md3VisualInput>
    );
  },
};

/** Camera capture for field, retail and lab use — opens the device camera via `<input capture>`. */
export const CameraCapture: Story = {
  args: {
    variant: "camera-capture",
    label: "Point your camera at the label and ask",
    cameraText: "Camera access lets Aria see what you choose to show. It’s on only while you take the photo.",
    seeText: "Aria will see this photo when you send",
  },
};
