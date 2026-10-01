import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRight } from "lucide-react";
import { LinkButton } from "./index";

const meta = {
  title: "Primitives/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // Icon slots are ReactNodes — kept out of `args` (Storybook serializes args
  // and would strip the element) and injected via `render`; hide their controls.
  argTypes: { leftIcon: { control: false }, rightIcon: { control: false } },
  args: { children: "Learn More" },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithArrow: Story = {
  render: (args) => <LinkButton {...args} rightIcon={<ArrowUpRight />} />,
};
export const AsLink: Story = {
  args: { href: "#" },
  render: (args) => <LinkButton {...args} rightIcon={<ArrowUpRight />} />,
};
