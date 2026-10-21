import type { Meta, StoryObj } from "@storybook/react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Pause, SkipBack, SkipForward, Underline } from "lucide-react";
import { Md3ButtonGroup, Md3ButtonGroupItem } from "./index";

const meta = {
  title: "Material 3/ButtonGroup",
  component: Md3ButtonGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3ButtonGroup aria-label="Playback" size="md" buttonVariant="tonal">
        <Md3ButtonGroupItem icon={<SkipBack />} aria-label="Previous track" />
        <Md3ButtonGroupItem variant="filled" icon={<Pause />} aria-label="Pause" />
        <Md3ButtonGroupItem icon={<SkipForward />} aria-label="Next track" />
      </Md3ButtonGroup>
    </div>
  ),
};

export const StandardToggle: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3ButtonGroup aria-label="Text style" selectionMode="multiple" defaultValue={["bold"]}>
        <Md3ButtonGroupItem value="bold" icon={<Bold />} aria-label="Bold" />
        <Md3ButtonGroupItem value="italic" icon={<Italic />} aria-label="Italic" />
        <Md3ButtonGroupItem value="underline" icon={<Underline />} aria-label="Underline" />
      </Md3ButtonGroup>
    </div>
  ),
};

export const Connected: Story = {
  render: () => (
    <div className="w-[360px] bg-md-surface p-6">
      <Md3ButtonGroup
        aria-label="Time range"
        variant="connected"
        selectionMode="single"
        selectionRequired
        defaultValue="week"
        className="w-full"
      >
        <Md3ButtonGroupItem value="day">Day</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="week">Week</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="month">Month</Md3ButtonGroupItem>
      </Md3ButtonGroup>
    </div>
  ),
};

export const ConnectedOutlined: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3ButtonGroup
        aria-label="Alignment"
        variant="connected"
        buttonVariant="outlined"
        selectionMode="single"
        defaultValue="left"
      >
        <Md3ButtonGroupItem value="left" icon={<AlignLeft />} aria-label="Align left" />
        <Md3ButtonGroupItem value="center" icon={<AlignCenter />} aria-label="Align center" />
        <Md3ButtonGroupItem value="right" icon={<AlignRight />} aria-label="Align right" />
      </Md3ButtonGroup>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6 bg-md-surface p-6">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Md3ButtonGroup key={size} aria-label={`Size ${size}`} size={size} selectionMode="single" defaultValue="b">
          <Md3ButtonGroupItem value="a">Label</Md3ButtonGroupItem>
          <Md3ButtonGroupItem value="b">Label</Md3ButtonGroupItem>
          <Md3ButtonGroupItem value="c">Label</Md3ButtonGroupItem>
        </Md3ButtonGroup>
      ))}
    </div>
  ),
};

export const SquareShape: Story = {
  render: () => (
    <div className="bg-md-surface p-6">
      <Md3ButtonGroup aria-label="View" shape="square" size="md" buttonVariant="tonal" selectionMode="single" defaultValue="list">
        <Md3ButtonGroupItem value="list">List</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="grid">Grid</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="board">Board</Md3ButtonGroupItem>
      </Md3ButtonGroup>
    </div>
  ),
};
