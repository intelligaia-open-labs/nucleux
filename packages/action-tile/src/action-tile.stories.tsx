import type { Meta, StoryObj } from "@storybook/react";
import { CloudUpload, Link2, Mic } from "lucide-react";
import { ActionTile } from "./index";

const meta = {
  title: "Patterns/ActionTile",
  component: ActionTile,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `icon` is a ReactNode — never place it in `args` (Storybook serializes args
  // and would strip the element to `{}`, crashing the render). Inject it via
  // `render` and hide the docgen-inferred control.
  argTypes: { icon: { control: false } },
  args: {
    // `icon` is required; `null` is a serializable placeholder — `render` injects
    // the real icon node so this value is never actually rendered.
    icon: null,
    title: "Record a meeting",
    description: "Capture live from your browser.",
  },
  render: (args) => <ActionTile {...args} icon={<Mic className="size-5" />} />,
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ActionTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Row: Story = {
  render: () => (
    <div className="grid w-[48rem] grid-cols-3 gap-4">
      <ActionTile icon={<Mic className="size-5" />} title="Record a meeting" description="Capture live from your browser." />
      <ActionTile
        icon={<CloudUpload className="size-6" />}
        title="Upload a recording"
        description="From your desktop or Google Drive — audio or video file."
      />
      <ActionTile
        icon={<Link2 className="size-6" />}
        title="Paste a link"
        description="A Zoom/Meet recording URL, a Drive file, or a YouTube link."
      />
    </div>
  ),
};
