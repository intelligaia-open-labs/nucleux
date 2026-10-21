import type { Meta, StoryObj } from "@storybook/react";
import { Md3Carousel, Md3CarouselItem } from "./index";

const meta = {
  title: "Material 3/Carousel",
  component: Md3Carousel,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { "aria-label": "Destinations" },
} satisfies Meta<typeof Md3Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const places = [
  { name: "Lisbon", tone: "bg-md-primary-container text-md-on-primary-container" },
  { name: "Kyoto", tone: "bg-md-secondary-container text-md-on-secondary-container" },
  { name: "Reykjavík", tone: "bg-md-tertiary-container text-md-on-tertiary-container" },
  { name: "Oaxaca", tone: "bg-md-surface-container-high text-md-on-surface" },
  { name: "Cape Town", tone: "bg-md-primary-container text-md-on-primary-container" },
  { name: "Hanoi", tone: "bg-md-secondary-container text-md-on-secondary-container" },
  { name: "Tbilisi", tone: "bg-md-tertiary-container text-md-on-tertiary-container" },
];

const tiles = places.map((p) => (
  <Md3CarouselItem key={p.name} label={p.name} className={p.tone}>
    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-md-surface/0 to-md-on-surface/10" />
  </Md3CarouselItem>
));

export const MultiBrowse: Story = {
  args: { "aria-label": "Destinations" },
  render: (args) => (
    <div className="max-w-2xl bg-md-surface py-4">
      <Md3Carousel {...args} layout="multi-browse" itemWidth={220}>
        {tiles}
      </Md3Carousel>
    </div>
  ),
};

export const Uncontained: Story = {
  args: { "aria-label": "Destinations" },
  render: (args) => (
    <div className="max-w-2xl bg-md-surface py-4">
      <Md3Carousel {...args} layout="uncontained" itemWidth={240}>
        {tiles}
      </Md3Carousel>
    </div>
  ),
};

export const Hero: Story = {
  args: { "aria-label": "Featured destinations" },
  render: (args) => (
    <div className="max-w-2xl bg-md-surface py-4">
      <Md3Carousel {...args} layout="hero" className="h-[280px]">
        {tiles}
      </Md3Carousel>
    </div>
  ),
};

export const HeroCentered: Story = {
  args: { "aria-label": "Featured destinations" },
  render: (args) => (
    <div className="max-w-2xl bg-md-surface py-4">
      <Md3Carousel {...args} layout="hero" alignment="center" className="h-[280px]">
        {tiles}
      </Md3Carousel>
    </div>
  ),
};

export const FullScreen: Story = {
  args: { "aria-label": "Gallery" },
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <Md3Carousel {...args} layout="full-screen" className="h-[480px] rounded-none">
      {tiles}
    </Md3Carousel>
  ),
};
