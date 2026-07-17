import type { Meta, StoryObj } from "@storybook/react";
import { ArrowUpRight, Play, TrendingUp, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  CardAction,
  CardContainer,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
  LinkButton,
  Progress,
} from "../index";

/**
 * A gallery of card layouts ("card variations") — all built from the same
 * CardContainer primitive plus Badge, Avatar, Progress, and Button.
 */
const meta = {
  title: "Examples/Card Gallery",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function StatCard() {
  return (
    <CardContainer>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Meetings summarized</span>
          <TrendingUp className="size-4 text-success" />
        </div>
        <p className="text-3xl font-semibold tracking-tight text-foreground">128</p>
        <Badge variant="success">+12% this week</Badge>
      </CardContent>
    </CardContainer>
  );
}

function MediaCard() {
  return (
    <CardContainer className="overflow-hidden">
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md">
          <Play className="size-5 translate-x-0.5 fill-current" />
        </span>
      </div>
      <CardContent className="space-y-1">
        <CardTitle>CPQ Q3 scope review</CardTitle>
        <CardDescription>45:00 · Summarized</CardDescription>
      </CardContent>
    </CardContainer>
  );
}

function ProgressCard() {
  return (
    <CardContainer>
      <CardHeader>
        <div>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>2 of 3 steps</CardDescription>
        </div>
        <Badge>66%</Badge>
      </CardHeader>
      <CardDivider />
      <CardContent className="space-y-3">
        <Progress value={66} aria-label="Onboarding progress" />
        <LinkButton rightIcon={<ArrowUpRight />}>Continue setup</LinkButton>
      </CardContent>
    </CardContainer>
  );
}

function TeamCard() {
  return (
    <CardContainer>
      <CardHeader>
        <div>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>4 members</CardDescription>
        </div>
        <CardAction>Manage</CardAction>
      </CardHeader>
      <CardDivider />
      <CardContent className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {["Eric Idle", "Zoe Ray", "Ada Lin", "Sam Poe"].map((n) => (
            <Avatar key={n} name={n} className="size-8 ring-2 ring-background" />
          ))}
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Users className="size-4" />}>
          Invite
        </Button>
      </CardContent>
    </CardContainer>
  );
}

export const Default: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard />
      <MediaCard />
      <ProgressCard />
      <TeamCard />
    </div>
  ),
};
