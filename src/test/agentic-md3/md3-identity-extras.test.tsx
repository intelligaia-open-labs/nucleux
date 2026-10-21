import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiIconProvider } from "@nucleux/ai-icons";
import { Md3AiIcon, Md3AiSparkleIcon } from "@nucleux/md3-ai-icons";
import { Md3Iconography } from "@nucleux/md3-iconography";
import { Md3Consent } from "@nucleux/md3-consent";
import { Md3AgentAvatar } from "@nucleux/md3-agent-avatar";
import { Md3Personality } from "@nucleux/md3-personality";

describe("md3 identity extras", () => {
  it("one AiIconProvider choice reaches the Md3 icons", () => {
    render(
      <AiIconProvider glyphs={{ "ai-action": "wand" }}>
        <Md3AiIcon role="ai-action" label="Rewrite" />
      </AiIconProvider>,
    );
    expect(screen.getByText("Rewrite").parentElement!.querySelector("svg")).toHaveAttribute("data-ai-glyph", "wand");
  });
  it("Md3AiSparkleIcon forwards refs and draws the reserved sparkle", () => {
    const ref = React.createRef<SVGSVGElement>();
    render(<Md3AiSparkleIcon ref={ref} aria-label="AI" />);
    expect(ref.current).toHaveAttribute("data-ai-glyph", "sparkle");
    expect(screen.getByRole("img", { name: "AI" })).toBeInTheDocument();
  });
  it("Md3Iconography maps twin variants and sizes onto M3 buttons", () => {
    render(
      <>
        <Md3Iconography label="Rewrite" variant="secondary" size="sm" />
        <Md3Iconography label="Go" iconOnly size="icon-sm" />
      </>,
    );
    const b = screen.getByRole("button", { name: "Rewrite" });
    expect(b.className).toContain("bg-md-secondary-container");
    expect(b.className).toContain("h-8");
    expect(b.className).not.toContain("h-10");
    const i = screen.getByRole("button", { name: "Go with AI" });
    expect(i.className).toContain("size-8");
    expect(i.className).not.toContain("w-10");
  });
  it("Md3Consent grants each permission separately via its row", async () => {
    const onAllow = vi.fn();
    render(
      <Md3Consent
        title="Allow?"
        permissions={[
          { id: "read", label: "Read files", description: "Only attached ones." },
          { id: "draft", label: "Draft edits" },
        ]}
        onAllow={onAllow}
      />,
    );
    const read = screen.getByRole("checkbox", { name: "Read files" });
    expect(read).toHaveAccessibleDescription("Only attached ones.");
    expect(read).toHaveAttribute("aria-checked", "false");
    await userEvent.click(screen.getByText("Read files"));
    expect(read).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("checkbox", { name: "Draft edits" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Draft edits" }));
    await userEvent.click(screen.getByRole("button", { name: "Allow selected" }));
    expect(onAllow).toHaveBeenCalledWith(["read"]);
  });
  it("Md3AgentAvatar shows the working ring only while working", () => {
    const { container, rerender } = render(<Md3AgentAvatar name="Aria" working />);
    expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
    rerender(<Md3AgentAvatar name="Aria" />);
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
  });
  it("Md3Personality Home / End and wrap-around", async () => {
    const onValueChange = vi.fn();
    render(<Md3Personality defaultValue="professional" onValueChange={onValueChange} />);
    await userEvent.tab();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("radio", { name: "Playful" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Professional" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("professional");
  });
});
