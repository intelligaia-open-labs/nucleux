import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OpenInput } from "@nucleux/open-input";
import { Md3OpenInput } from "@nucleux/md3-open-input";
import { Md3AgentComposer } from "@nucleux/md3-agent-composer";

// Ten explicit lines: more than the default 8-line ceiling (jsdom has no layout,
// so overflow is judged from explicit lines there).
const LONG = Array.from({ length: 10 }, (_, i) => `Line ${i + 1} of the request`).join("\n");

describe.each([
  ["OpenInput", OpenInput],
  ["Md3OpenInput", Md3OpenInput],
] as const)("%s composer height", (_name, Composer) => {
  it("shows Expand only once the text overflows 8 lines, and toggles to Collapse", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Composer aria-label="Message Aria" defaultValue="Short ask" onSubmit={() => {}} />);
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
    unmount();

    const { container } = render(<Composer aria-label="Message Aria" defaultValue={LONG} onSubmit={() => {}} />);
    const expand = screen.getByRole("button", { name: "Expand" });
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(expand).toHaveAttribute("aria-controls", screen.getByRole("textbox", { name: "Message Aria" }).id);
    await user.click(expand);
    const collapse = screen.getByRole("button", { name: "Collapse" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: "Message Aria" })).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
    await user.click(collapse);
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute("aria-expanded", "false");
  });

  it("sending empties the field and collapses it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Composer aria-label="Message Aria" defaultValue={LONG} onSubmit={onSubmit} />);
    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(onSubmit).toHaveBeenCalledWith(LONG);
    expect(screen.getByRole("textbox", { name: "Message Aria" })).toHaveValue("");
    expect(screen.queryByRole("button", { name: /^(Expand|Collapse)$/ })).toBeNull();
    // A new long request starts collapsed.
    await user.type(screen.getByRole("textbox", { name: "Message Aria" }), "a{Shift>}{Enter}{/Shift}".repeat(9));
    expect(screen.getByRole("button", { name: "Expand" })).toHaveAttribute("aria-expanded", "false");
  });

  it("respects maxLines, expandable={false} and the single-line variant", () => {
    const four = "one\ntwo\nthree\nfour";
    const { unmount } = render(<Composer aria-label="Message Aria" defaultValue={four} maxLines={3} onSubmit={() => {}} />);
    expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument();
    unmount();
    const r2 = render(<Composer aria-label="Message Aria" defaultValue={LONG} expandable={false} onSubmit={() => {}} />);
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
    r2.unmount();
    render(<Composer variant="single-line" aria-label="Message Aria" defaultValue={LONG} onSubmit={() => {}} />);
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
  });
});

describe("Md3AgentComposer composer height", () => {
  it("offers Expand past 8 lines and collapses when sending empties it", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    function Harness() {
      const [value, setValue] = useState(LONG);
      return (
        <Md3AgentComposer
          value={value}
          onValueChange={setValue}
          onSubmit={(v) => {
            onSubmit(v);
            setValue("");
          }}
        />
      );
    }
    const { container } = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Expand" }));
    expect(screen.getByRole("button", { name: "Collapse" })).toHaveAttribute("aria-expanded", "true");
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledWith(LONG);
    expect(screen.queryByRole("button", { name: /^(Expand|Collapse)$/ })).toBeNull();
  });

  it("never offers Expand with expandable={false} or a short request", () => {
    const { unmount } = render(
      <Md3AgentComposer value={LONG} onValueChange={() => {}} onSubmit={() => {}} expandable={false} />,
    );
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
    unmount();
    render(<Md3AgentComposer value="Short" onValueChange={() => {}} onSubmit={() => {}} />);
    expect(screen.queryByRole("button", { name: "Expand" })).toBeNull();
  });
});
