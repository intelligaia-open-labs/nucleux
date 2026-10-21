import type { Meta, StoryObj } from "@storybook/react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./index";

const meta = {
  title: "Data/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72 px-8">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }, (_, i) => (
            <CarouselItem key={i}>
              <div className="grid h-40 place-items-center rounded-md border border-border bg-muted/40 text-2xl font-semibold text-foreground">
                {i + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
