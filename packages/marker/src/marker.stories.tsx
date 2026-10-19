import type { Meta, StoryObj } from "@storybook/react";
import { GitBranch, Sparkles } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "./index";

const meta = {
  title: "Primitives/Marker",
  component: Marker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { variant: "default" },
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-96">
      <Marker {...args}>
        <MarkerIcon>
          <Sparkles />
        </MarkerIcon>
        <MarkerContent>Switched model to Opus</MarkerContent>
      </Marker>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <Marker>
        <MarkerIcon>
          <GitBranch />
        </MarkerIcon>
        <MarkerContent>
          Branched from <a href="#original">the original conversation</a>
        </MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerContent>Earlier messages were summarised</MarkerContent>
      </Marker>
    </div>
  ),
};
