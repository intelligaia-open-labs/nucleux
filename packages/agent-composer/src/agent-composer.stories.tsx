import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Mic, Plus, SlidersHorizontal } from "lucide-react";
import { AgentComposer } from "./index";
import { IconButton } from "@nucleux/icon-button";
import { Badge } from "@nucleux/badge";

const meta = {
  title: "Agent/AgentComposer",
  component: AgentComposer,
  parameters: { layout: "centered" },
} satisfies Meta<typeof AgentComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: "", onValueChange: () => {}, onSubmit: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-[34rem]">
        <AgentComposer
          value={value}
          onValueChange={setValue}
          onSubmit={() => setValue("")}
          leftActions={
            <IconButton aria-label="Attach" size="sm">
              <Plus />
            </IconButton>
          }
          rightActions={
            <>
              <Badge variant="secondary">Model 2</Badge>
              <IconButton aria-label="Settings" size="sm">
                <SlidersHorizontal />
              </IconButton>
              <IconButton aria-label="Voice" size="sm">
                <Mic />
              </IconButton>
            </>
          }
        />
      </div>
    );
  },
};
