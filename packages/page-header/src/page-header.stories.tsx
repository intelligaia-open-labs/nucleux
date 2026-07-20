import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./index";
import { Badge } from "@nucleux/badge";
import { Button } from "@nucleux/button";

const meta = {
  title: "Patterns/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  args: {
    title: "Disclosure",
    description:
      "A clear, visible label that tells the user they are interacting with an AI, not a person.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    badges: (
      <>
        <Badge variant="destructive">Critical</Badge>
        <Badge variant="outline">HAX-prelude · GDPR · SOC2</Badge>
        <Badge variant="success">Documented</Badge>
      </>
    ),
    actions: <Button variant="secondary">Edit</Button>,
  },
};
