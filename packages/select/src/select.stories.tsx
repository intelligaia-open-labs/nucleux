import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./index";

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: null },
  render: () => (
    <div className="h-80 w-56">
      <Select defaultValue="claude-opus">
        <SelectTrigger aria-label="Model">
          <SelectValue placeholder="Choose a model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Anthropic</SelectLabel>
            <SelectItem value="claude-opus">Claude Opus</SelectItem>
            <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
            <SelectItem value="claude-haiku">Claude Haiku</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Local</SelectLabel>
            <SelectItem value="local" disabled>
              On-device (unavailable)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const Placeholder: Story = {
  args: { children: null },
  render: () => (
    <div className="h-64 w-56">
      <Select>
        <SelectTrigger size="sm" aria-label="Status">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in-progress">In progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
