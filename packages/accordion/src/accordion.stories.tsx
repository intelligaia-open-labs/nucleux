import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./index";

const meta = {
  title: "Primitives/Accordion",
  component: Accordion,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" defaultValue="what">
      <AccordionItem value="what">
        <AccordionTrigger>What is Nucleux?</AccordionTrigger>
        <AccordionContent>An agentic UI component library for React.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="theme">
        <AccordionTrigger>Can I theme it?</AccordionTrigger>
        <AccordionContent>Yes — override the --nx-* CSS variables.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="a11y">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Every component ships with ARIA and keyboard support.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" defaultValue={["a", "b"]}>
      <AccordionItem value="a">
        <AccordionTrigger>First</AccordionTrigger>
        <AccordionContent>Both panels can stay open.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Second</AccordionTrigger>
        <AccordionContent>Independently collapsible.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
