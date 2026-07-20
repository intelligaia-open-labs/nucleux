import type { Meta, StoryObj } from "@storybook/react";
import {
  RightSidebar,
  RightSidebarAnchor,
  RightSidebarLabel,
  RightSidebarMeta,
  RightSidebarSeparator,
} from "./index";

const meta = {
  title: "Navigation/RightSidebar",
  component: RightSidebar,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof RightSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex h-screen justify-end bg-background">
      <RightSidebar>
        <RightSidebarLabel>On this page</RightSidebarLabel>
        <RightSidebarAnchor href="#patterns" active>
          Patterns
        </RightSidebarAnchor>
        <RightSidebarAnchor href="#questions">The four questions</RightSidebarAnchor>
        <RightSidebarAnchor href="#related">Related patterns</RightSidebarAnchor>
        <RightSidebarSeparator />
        <RightSidebarMeta label="Stage" value="Onboarding" />
        <RightSidebarMeta label="Category" value="Trust & Disclosure" />
        <RightSidebarMeta label="User value" value="Critical" />
        <RightSidebarMeta label="Guideline" value="HAX-prelude" />
      </RightSidebar>
    </div>
  ),
};
