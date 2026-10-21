import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Md3Search } from "./index";

const meta = {
  title: "Material 3/Search",
  component: Md3Search,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [q, setQ] = useState("");
    return (
      <div className="w-80 bg-md-surface p-6">
        <Md3Search value={q} onValueChange={setQ} aria-label="Search" />
      </div>
    );
  },
};
