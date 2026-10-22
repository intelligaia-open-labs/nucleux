import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  McpConnection,
  McpConnectionTools,
  McpConnectionPermission,
  McpConnectionActionPreview,
} from "@nucleux/mcp-connection";

const tools = [
  { id: "read_issue", title: "Read issue", description: "Fetch issue details", risk: "read" as const, schema: { type: "object", properties: { id: { type: "string" } } } },
  { id: "create_issue", title: "Create issue", description: "File a new bug", risk: "write" as const },
  { id: "delete_issue", title: "Delete issue", description: "Remove an issue", risk: "destructive" as const, enabled: false },
];

describe("McpConnection", () => {
  it("render case passes axe", async () => {
    const { container } = render(
      <div>
        <McpConnection
          name="Linear MCP"
          address="https://mcp.linear.app/sse"
          meta="3 tools"
          status="connected"
          account="OAuth · sam@acme.com"
          scopes={["Read issues", "Create issues"]}
          onDisconnect={() => {}}
        >
          <McpConnectionTools tools={tools} onToolEnabledChange={() => {}} />
          <McpConnectionPermission subject="Linear" defaultValue="always" />
          <McpConnectionActionPreview
            tool="linear.create_issue"
            args={{ title: "Renewal flow broken", team: "Apollo" }}
            onApprove={() => {}}
            onEdit={() => {}}
            onDeny={() => {}}
          />
        </McpConnection>
        <McpConnection name="Jira MCP" status="error" stage="authenticate" error="The sign-in expired." onAuthenticate={() => {}} onDisconnect={() => {}} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows named steps while connecting and says which one failed", () => {
    const { rerender } = render(<McpConnection name="Jira MCP" status="connecting" stage="discover" />);
    const steps = within(screen.getByRole("list", { name: "Connection steps" })).getAllByRole("listitem");
    expect(steps.map((s) => s.textContent)).toEqual([
      "Reach server — done",
      "Sign in — done",
      "Discover tools — in progress",
    ]);
    expect(screen.getByRole("status")).toHaveTextContent("Connecting");
    rerender(<McpConnection name="Jira MCP" status="error" stage="authenticate" onRetry={() => {}} />);
    expect(screen.getByText(/Sign in/).closest("li")).toHaveAttribute("data-step-state", "failed");
    expect(screen.getByRole("status")).toHaveTextContent("Can't connect");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("groups tools by risk, inspects a schema, and toggles one tool", async () => {
    const user = userEvent.setup();
    const onToolEnabledChange = vi.fn();
    render(<McpConnectionTools tools={tools} onToolEnabledChange={onToolEnabledChange} />);
    expect(screen.getByRole("list", { name: /Destructive/ })).toHaveTextContent("Off");
    expect(screen.getByRole("list", { name: /Changes things/ })).toHaveTextContent("Approval required");
    await user.click(screen.getByRole("button", { name: /Read issue/ }));
    expect(screen.getByRole("region", { name: /Read issue/ })).toHaveTextContent('"id"');
    await user.click(screen.getByRole("switch", { name: "Delete issue — Destructive" }));
    expect(onToolEnabledChange).toHaveBeenCalledWith("delete_issue", true);
  });

  it("previews the call and drops Always for a destructive tool", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(
      <>
        <McpConnectionActionPreview tool="git.push" args={{ force: true }} risk="destructive" onApprove={onApprove} onEdit={() => {}} onDeny={() => {}} />
        <McpConnectionPermission subject="git push" risk="destructive" />
      </>,
    );
    expect(
      screen.getByText((_, el) => el?.tagName === "CODE" && el.textContent?.replace(/\s+/g, " ") === 'git.push({ "force": true })'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Never allow" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((r) => r.closest("label")?.textContent)).toEqual(["Just this once", "Don't allow"]);
  });
});
