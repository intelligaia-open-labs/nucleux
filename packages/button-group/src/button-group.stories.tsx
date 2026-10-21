import type { Meta, StoryObj } from "@storybook/react";
import { ArrowLeft, ArrowRight, ChevronDown, Copy, Scissors, ClipboardPaste } from "lucide-react";
import { Button } from "@nucleux/button";
import { Input } from "@nucleux/input";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./index";

const meta = {
  title: "Primitives/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ButtonGroup aria-label="Message actions" {...args}>
      <ButtonGroup>
        <Button variant="secondary" size="icon" aria-label="Previous">
          <ArrowLeft className="size-4" />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Next">
          <ArrowRight className="size-4" />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="secondary">Archive</Button>
        <Button variant="secondary">Report</Button>
        <Button variant="secondary" size="icon" aria-label="More options">
          <ChevronDown className="size-4" />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" aria-label="Clipboard">
      <Button variant="secondary" leftIcon={<Scissors className="size-4" />}>Cut</Button>
      <Button variant="secondary" leftIcon={<Copy className="size-4" />}>Copy</Button>
      <Button variant="secondary" leftIcon={<ClipboardPaste className="size-4" />}>Paste</Button>
    </ButtonGroup>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <ButtonGroup aria-label="Edit">
      <Button variant="primary">Copy</Button>
      <ButtonGroupSeparator />
      <Button variant="primary">Paste</Button>
    </ButtonGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <ButtonGroup aria-label="Website URL" className="w-80">
      <ButtonGroupText asChild>
        <label htmlFor="bg-url">https://</label>
      </ButtonGroupText>
      <Input id="bg-url" placeholder="nucleux.in" />
      <Button variant="secondary">Go</Button>
    </ButtonGroup>
  ),
};
