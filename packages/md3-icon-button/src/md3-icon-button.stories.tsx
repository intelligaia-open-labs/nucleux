import type { Meta, StoryObj } from "@storybook/react";
import { Heart } from "lucide-react";
import { Md3IconButton } from "./index";

const meta = {
  title: "Material 3/IconButton",
  component: Md3IconButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: { "aria-label": "Favorite" },
} satisfies Meta<typeof Md3IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: { "aria-label": "Favorite" },
  render: () => (
    <div className="flex items-center gap-3 bg-md-surface p-6">
      <Md3IconButton variant="standard" aria-label="Favorite">
        <Heart />
      </Md3IconButton>
      <Md3IconButton variant="filled" aria-label="Favorite">
        <Heart />
      </Md3IconButton>
      <Md3IconButton variant="tonal" aria-label="Favorite">
        <Heart />
      </Md3IconButton>
      <Md3IconButton variant="outlined" aria-label="Favorite">
        <Heart />
      </Md3IconButton>
    </div>
  ),
};
