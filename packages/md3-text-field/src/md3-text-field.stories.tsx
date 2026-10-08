import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { Md3TextField } from "./index";

const meta = {
  title: "Material 3/TextField",
  component: Md3TextField,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { label: "Label" },
} satisfies Meta<typeof Md3TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: { label: "Label" },
  render: () => (
    <div className="flex w-80 flex-col gap-6 bg-md-surface p-6">
      <Md3TextField variant="filled" label="Email" supportingText="We'll never share it." />
      <Md3TextField variant="outlined" label="Search" leadingIcon={<Search />} />
      <Md3TextField variant="outlined" label="Password" error supportingText="Required" />
    </div>
  ),
};
