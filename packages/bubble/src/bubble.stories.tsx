import type { Meta, StoryObj } from "@storybook/react";
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "./index";

const meta = {
  title: "Primitives/Bubble",
  component: Bubble,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { variant: "default", align: "start" },
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex w-96 flex-col">
      <Bubble {...args}>
        <BubbleContent>Can you summarise the attached report?</BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Conversation: Story = {
  render: () => (
    <div className="flex w-[28rem] flex-col gap-4">
      <BubbleGroup>
        <Bubble align="end">
          <BubbleContent>Can you summarise the attached report?</BubbleContent>
        </Bubble>
        <Bubble align="end" className="mb-4">
          <BubbleContent>Focus on the revenue section.</BubbleContent>
          <BubbleReactions align="start">
            <span role="img" aria-label="thumbs up">👍</span>
          </BubbleReactions>
        </Bubble>
      </BubbleGroup>
      <Bubble variant="muted">
        <BubbleContent>Revenue grew 12% quarter over quarter, led by the enterprise tier.</BubbleContent>
      </Bubble>
      <Bubble variant="destructive">
        <BubbleContent>I couldn&apos;t read page 4 of the PDF.</BubbleContent>
      </Bubble>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      {(["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const).map((variant) => (
        <Bubble key={variant} variant={variant}>
          <BubbleContent>{variant} bubble</BubbleContent>
        </Bubble>
      ))}
    </div>
  ),
};

export const Clickable: Story = {
  render: () => (
    <div className="flex w-96 flex-col">
      <Bubble variant="outline">
        <BubbleContent asChild>
          <button type="button">Show me the revenue chart</button>
        </BubbleContent>
      </Bubble>
    </div>
  ),
};
