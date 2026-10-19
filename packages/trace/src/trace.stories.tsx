import type { Meta, StoryObj } from "@storybook/react";
import { AlertCircle, Check, FileText, Globe, Loader2, Search } from "lucide-react";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "./index";

const meta = {
  title: "Primitives/Trace",
  component: Trace,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Trace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Trace className="w-[28rem]">
      <TraceLine>
        <TraceIcon>
          <Check />
        </TraceIcon>
        <TraceTitle>Read the brief</TraceTitle>
        <TraceDescription>0.4s</TraceDescription>
      </TraceLine>
      <TraceCollapsible defaultOpen>
        <TraceCollapsibleTrigger>
          <TraceLine>
            <TraceIcon>
              <Search />
            </TraceIcon>
            <TraceTitle>Searched the web for “EU AI Act timeline”</TraceTitle>
            <TraceDescription>8 results</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>
          <Trace>
            <a href="#source-1">
              <TraceLine>
                <TraceIcon>
                  <Globe />
                </TraceIcon>
                <TraceTitle>europa.eu — AI Act enters into force</TraceTitle>
              </TraceLine>
            </a>
            <a href="#source-2">
              <TraceLine>
                <TraceIcon>
                  <FileText />
                </TraceIcon>
                <TraceTitle>Implementation timeline (PDF)</TraceTitle>
              </TraceLine>
            </a>
          </Trace>
        </TraceCollapsibleContent>
      </TraceCollapsible>
      <TraceLine status="error">
        <TraceIcon>
          <AlertCircle />
        </TraceIcon>
        <TraceTitle>Fetch failed: timeout</TraceTitle>
      </TraceLine>
      <TraceLine status="running">
        <TraceIcon>
          <Loader2 className="animate-spin" />
        </TraceIcon>
        <TraceTitle>Drafting the summary</TraceTitle>
      </TraceLine>
      <TraceLine status="pending">
        <TraceTitle>Check citations</TraceTitle>
      </TraceLine>
    </Trace>
  ),
};
