import type { Meta, StoryObj } from "@storybook/react";
import { Combobox } from "./index";

const meta = {
  title: "Primitives/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { options: [] },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
  { value: "nuxt", label: "Nuxt" },
];

export const Default: Story = {
  args: { options: frameworks },
  render: (args) => <Combobox {...args} aria-label="Framework" placeholder="Select framework…" />,
};
