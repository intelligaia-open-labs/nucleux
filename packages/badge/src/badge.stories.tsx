import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "./index";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  // `icon` is a ReactNode — kept out of `args` (Storybook serializes args and
  // would strip the element) and injected via `render`; hide its control.
  argTypes: { icon: { control: false } },
  args: { children: "Badge", variant: "default" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: "1/3 Done" } };
export const Outline: Story = { args: { variant: "outline", children: "5 action items" } };
export const Success: Story = {
  args: { variant: "success", children: "Summarized" },
  render: (args) => <Badge {...args} icon={<CheckCircle2 className="size-3.5" />} />,
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="success" icon={<CheckCircle2 className="size-3.5" />}>
        Success
      </Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};
