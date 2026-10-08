import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import { Md3Banner } from "./index";
import { Md3Button } from "@nucleux/md3-button";

const meta = {
  title: "Material 3/Banner",
  component: Md3Banner,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Md3Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Md3Banner
      icon={<Info />}
      actions={
        <>
          <Md3Button variant="text">Dismiss</Md3Button>
          <Md3Button variant="text">Update</Md3Button>
        </>
      }
    >
      A new software update is available for download.
    </Md3Banner>
  ),
};
