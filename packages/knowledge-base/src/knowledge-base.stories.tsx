import type { Meta, StoryObj } from "@storybook/react";
import { KnowledgeBase } from "./index";

const meta = {
  title: "Agent/KnowledgeBase",
  component: KnowledgeBase,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-[26rem]"><Story /></div>],
  args: {
    defaultValue: ["claude"],
    onValueChange: () => {},
    sources: [
      { id: "claude", name: "CLAUDE.md", meta: "Markdown · project guide" },
      { id: "project", name: "project.json", meta: "JSON · config" },
      { id: "playbook", name: "Renewal Playbook.pdf", meta: "PDF · 12 pages" },
    ],
  },
} satisfies Meta<typeof KnowledgeBase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
