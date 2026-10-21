import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUp, Copy, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./index";

const meta = {
  title: "Primitives/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex w-[26rem] flex-col gap-4">
      <InputGroup>
        <InputGroupInput placeholder="Search conversations…" aria-label="Search conversations" />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput defaultValue="nucleux.in" aria-label="Website" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label="Copy URL">
            <Copy />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="email" defaultValue="ada@" aria-label="Email" aria-invalid="true" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Invalid</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const Composer: Story = {
  render: () => (
    <InputGroup className="w-[30rem]">
      <InputGroupTextarea placeholder="Ask anything…" aria-label="Message" />
      <InputGroupAddon align="block-end">
        <InputGroupText>Shift + Enter for a new line</InputGroupText>
        <InputGroupButton variant="primary" size="icon-xs" className="ml-auto rounded-full" aria-label="Send">
          <ArrowUp />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};
