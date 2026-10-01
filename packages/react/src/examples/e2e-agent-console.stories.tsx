import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  // MD3 agentic set (discovered via the MCP server)
  Md3Thread,
  Md3Message,
  Md3ToolCall,
  Md3AgentStep,
  Md3AgentSteps,
  Md3ActionPlan,
  Md3ActionPlanStep,
  Md3AgentComposer,
  Md3Reasoning,
  // shadcn agentic set (same APIs)
  Thread,
  Message,
  ToolCall,
  ActionPlan,
  ActionPlanStep,
  AgentComposer,
} from "@nucleux/react";

/**
 * End-to-end page assembled from components discovered via the @nucleux/mcp
 * server. Mirrors examples/e2e/agent-console.html (the HTML build) — same
 * components, React side.
 */
const meta = {
  title: "Examples/E2E Agent Console",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Console() {
  const [value, setValue] = useState("");
  return (
    <div className="flex h-[32rem] flex-col rounded-md-lg bg-md-surface">
      <Md3Thread className="flex-1">
        <Md3Message role="user" content="Which Q3 renewals are at risk?" />
        <Md3Reasoning content={"Check usage decline, then rank accounts by risk."} defaultOpen />
        <Md3ToolCall
          defaultOpen
          toolCall={{
            id: "1",
            name: "search_crm",
            status: "success",
            args: { window: "90d", stage: "renewal" },
            result: "3 accounts",
          }}
        />
        <Md3AgentSteps>
          <Md3AgentStep status="done" title="Pulled renewing accounts" />
          <Md3AgentStep status="active" title="Scoring churn risk" progress={70} />
          <Md3AgentStep status="pending" title="Draft outreach" />
        </Md3AgentSteps>
        <Md3Message role="assistant" content="Three enterprise accounts are trending toward churn." />
        <Md3ActionPlan onAccept={() => {}} onEdit={() => {}} onReject={() => {}}>
          <Md3ActionPlanStep title="Pull renewing accounts" />
          <Md3ActionPlanStep title="Draft outreach emails" />
        </Md3ActionPlan>
      </Md3Thread>
      <div className="p-3">
        <Md3AgentComposer value={value} onValueChange={setValue} onSubmit={() => setValue("")} />
      </div>
    </div>
  );
}

/** The MD3 agent console (React), built from MCP-discovered components. */
export const MaterialUI3: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl p-6">
      <Console />
    </div>
  ),
};

/** The same shadcn agentic components, and again under the Material UI 3 theme. */
export const BothLooks: Story = {
  render: () => (
    <div className="grid gap-6 p-6 md:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-medium text-foreground">shadcn</p>
        <Thread className="h-72">
          <Message role="user" content="Draft outreach for the at-risk accounts." />
          <ToolCall
            defaultOpen
            toolCall={{ id: "1", name: "draft_email", status: "success", args: { n: 3 }, result: "3 drafts" }}
          />
          <ActionPlan onAccept={() => {}} onReject={() => {}}>
            <ActionPlanStep title="Review drafts" />
          </ActionPlan>
        </Thread>
        <AgentComposer value="" onValueChange={() => {}} onSubmit={() => {}} />
      </div>
      <div className="nx-theme-mui space-y-4 rounded-md-lg bg-md-surface p-4">
        <p className="text-sm font-medium text-md-on-surface">Material UI 3 (same shadcn components, themed)</p>
        <Thread className="h-72">
          <Message role="user" content="Draft outreach for the at-risk accounts." />
          <ToolCall
            defaultOpen
            toolCall={{ id: "1", name: "draft_email", status: "success", args: { n: 3 }, result: "3 drafts" }}
          />
          <ActionPlan onAccept={() => {}} onReject={() => {}}>
            <ActionPlanStep title="Review drafts" />
          </ActionPlan>
        </Thread>
        <AgentComposer value="" onValueChange={() => {}} onSubmit={() => {}} />
      </div>
    </div>
  ),
};
