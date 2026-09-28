import type { Meta, StoryObj } from "@storybook/react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./index";

const meta = {
  title: "Primitives/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Command className="w-80">
      <CommandInput />
      <CommandList>
        <CommandEmpty />
        <CommandGroup heading="Suggestions">
          <CommandItem value="New chat" onSelect={() => {}}>
            New chat
          </CommandItem>
          <CommandItem value="Search files" onSelect={() => {}}>
            Search files
          </CommandItem>
          <CommandItem value="Open settings" onSelect={() => {}}>
            Open settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="Invite teammate" onSelect={() => {}}>
            Invite teammate
          </CommandItem>
          <CommandItem value="Sign out" onSelect={() => {}}>
            Sign out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
