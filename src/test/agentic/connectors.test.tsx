import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Connector, ConnectorList, ConnectorScopePicker, ConnectorLivePill } from "@nucleux/connectors";

describe("Connectors review", () => {
  it("list, scope picker and live pill pass axe", async () => {
    const { container } = render(
      <div>
        <ConnectorList>
          <Connector name="Google Drive" connected account="sam@acme.com" onDisconnect={() => {}} />
          <Connector name="Slack" status="expired" onReconnect={() => {}} />
          <Connector name="Notion" scopes={["Read pages you share"]} onConnect={() => {}} />
        </ConnectorList>
        <ConnectorScopePicker scopes={[{ id: "a", label: "#renewals" }]} onAllowWriteChange={() => {}} />
        <ConnectorLivePill source="Drive" count={12} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("offers Reconnect for an expired sign-in and announces the status", async () => {
    const user = userEvent.setup();
    const onReconnect = vi.fn();
    render(<Connector name="Slack" status="expired" account="sam@acme.com" onReconnect={onReconnect} />);
    expect(screen.getByRole("status")).toHaveTextContent("Sign-in expired");
    await user.click(screen.getByRole("button", { name: "Reconnect" }));
    expect(onReconnect).toHaveBeenCalled();
  });

  it("scope picker starts from nothing and grants one scope at a time", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ConnectorScopePicker
        agentName="Aria"
        onValueChange={onValueChange}
        scopes={[{ id: "pipeline", label: "#sales-pipeline" }, { id: "general", label: "#general" }]}
      />,
    );
    expect(screen.getByRole("group", { name: "Aria can read from:" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "#general" })).toHaveAttribute("aria-checked", "false");
    await user.click(screen.getByRole("checkbox", { name: "#sales-pipeline" }));
    expect(onValueChange).toHaveBeenCalledWith(["pipeline"]);
  });
});
