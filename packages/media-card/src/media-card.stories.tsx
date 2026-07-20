import type { Meta, StoryObj } from "@storybook/react";
import { Play } from "lucide-react";
import { MediaCard } from "./index";

const Poster = () => (
  <div className="flex size-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-950 text-background">
    <Play className="size-8 fill-current" />
  </div>
);

const meta = {
  title: "Patterns/MediaCard",
  component: MediaCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    title: "Variant 1",
    description: "A media card with an image, title, and description.",
    media: <Poster />,
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MediaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {};

export const Horizontal: Story = {
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
  args: { orientation: "horizontal" },
};

export const NoMedia: Story = { args: { media: undefined } };
