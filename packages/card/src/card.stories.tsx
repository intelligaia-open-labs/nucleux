import type { Meta, StoryObj } from "@storybook/react";
import {
  CardContainer,
  CardAction,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
} from "./index";
import { Avatar } from "@nucleux/avatar";
import { Badge } from "@nucleux/badge";

const meta = {
  title: "Primitives/CardContainer",
  component: CardContainer,
  parameters: { layout: "centered" },
} satisfies Meta<typeof CardContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecentMeeting: Story = {
  render: () => (
    <CardContainer className="w-[36rem]">
      <CardHeader>
        <div>
          <CardTitle>Recent meeting</CardTitle>
          <CardDescription>1 in your library</CardDescription>
        </div>
        <CardAction>View all</CardAction>
      </CardHeader>
      <CardDivider />
      <CardContent className="flex items-center gap-3">
        <Avatar shape="rounded" name="Zuora" className="size-9" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Zuora · CPQ Q3 scope review</p>
          <p className="text-xs text-muted-foreground">CPQ · Q3 redesign · 45:00</p>
        </div>
        <Badge variant="outline">5 action items</Badge>
        <Badge variant="success">Summarized</Badge>
        <span className="text-xs text-muted-foreground">2h ago</span>
      </CardContent>
    </CardContainer>
  ),
};
