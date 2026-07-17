import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRight } from "lucide-react";
import { LinkButton } from "./index";

const meta = {
  title: "Primitives/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { children: "Learn More" },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithArrow: Story = { args: { rightIcon: <ArrowUpRight /> } };
export const AsLink: Story = { args: { href: "#", rightIcon: <ArrowUpRight /> } };
