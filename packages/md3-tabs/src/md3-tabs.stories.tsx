import type { Meta, StoryObj } from "@storybook/react";
import { Md3Tab, Md3TabPanel, Md3Tabs, Md3TabsList } from "./index";

const meta = {
  title: "Material 3/Tabs",
  component: Md3Tabs,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Md3Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-96 overflow-hidden rounded-md-md bg-md-surface">
      <Md3Tabs defaultValue="overview">
        <Md3TabsList>
          <Md3Tab value="overview">Overview</Md3Tab>
          <Md3Tab value="specs">Specs</Md3Tab>
          <Md3Tab value="reviews">Reviews</Md3Tab>
        </Md3TabsList>
        <Md3TabPanel value="overview">Overview content</Md3TabPanel>
        <Md3TabPanel value="specs">Specs content</Md3TabPanel>
        <Md3TabPanel value="reviews">Reviews content</Md3TabPanel>
      </Md3Tabs>
    </div>
  ),
};
