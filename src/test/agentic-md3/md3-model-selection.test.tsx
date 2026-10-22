import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3ModelSelection as ModelSelection } from "@nucleux/md3-model-selection";

const models = [
  { value: "opus", label: "Opus", quality: "Best quality", speed: "Slower", cost: "$$$" },
  { value: "sonnet", label: "Sonnet", quality: "Balanced", speed: "Medium", cost: "$$", recommended: true },
  { value: "haiku", label: "Haiku", quality: "Good enough", speed: "Fastest", cost: "$", disabled: true, unavailableReason: "Not in your plan" },
];

describe("ModelSelection review", () => {
  it("tradeoff and auto-route render cases pass axe", async () => {
    const { container } = render(
      <div>
        <ModelSelection variant="tradeoff" label="Model" models={models} defaultValue="sonnet" />
        <ModelSelection variant="auto-route" routedModel="Sonnet" models={models} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("dropdown is keyboard operable and returns focus on Escape", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ModelSelection models={models} defaultValue="opus" onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: "Model" });
    await user.click(trigger);
    expect(screen.getByRole("option", { name: /Opus/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /Sonnet/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /Opus/ })).toHaveFocus(); // Haiku is unavailable, skipped
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: /Haiku/ }));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("option", { name: /Sonnet/ }));
    expect(onValueChange).toHaveBeenCalledWith("sonnet");
  });

  it("auto-route is on by default and switching it off reveals the picker", async () => {
    const user = userEvent.setup();
    const onAutoRouteChange = vi.fn();
    render(<ModelSelection variant="auto-route" routedModel="Sonnet" models={models} onAutoRouteChange={onAutoRouteChange} />);
    expect(screen.getByText("currently Sonnet")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Model" })).toBeNull();
    await user.click(screen.getByRole("switch", { name: "Auto-route" }));
    expect(onAutoRouteChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("button", { name: "Model" })).toBeInTheDocument();
  });

  it("[md3 extra] open dropdown passes axe", async () => {
    const user = userEvent.setup();
    const { container } = render(<ModelSelection models={models} defaultValue="sonnet" />);
    await user.click(screen.getByRole("button", { name: "Model" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
