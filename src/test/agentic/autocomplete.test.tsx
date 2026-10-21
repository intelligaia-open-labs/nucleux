import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Autocomplete } from "@nucleux/autocomplete";

describe("Autocomplete", () => {
  it("render case passes axe", async () => {
    const { container } = render(
      <Autocomplete
        label="Prompt"
        variant="sentence-completion"
        defaultValue="Thanks for the quick turnaround on the deck."
        suggestion=" I've shared it with the team and we'll come back with feedback by Friday."
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
    expect(screen.getByRole("status")).toHaveTextContent(/Suggestion:.*Tab to accept/);
  });

  it("shows the provider's suggestion as ghost text and Tab accepts it without submitting", async () => {
    const user = userEvent.setup();
    const getSuggestion = vi.fn(async (text: string) =>
      text.endsWith("following up on") ? " our conversation last Tuesday" : null,
    );
    const onAccept = vi.fn();
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Autocomplete aria-label="Reply" getSuggestion={getSuggestion} debounceMs={0} onAccept={onAccept} />
      </form>,
    );
    const field = screen.getByRole("textbox", { name: "Reply" });
    await user.type(field, "Hi Sam, following up on");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Suggestion:"));
    await user.keyboard("{Tab}");
    expect(field).toHaveValue("Hi Sam, following up on our conversation last Tuesday");
    expect(field).toHaveFocus();
    expect(onAccept).toHaveBeenCalledWith(" our conversation last Tuesday");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("follows along while typing the same words, and Escape dismisses until cleared", async () => {
    const user = userEvent.setup();
    const getSuggestion = vi.fn(() => " renewal risk for Acme Corp");
    const { container } = render(
      <Autocomplete aria-label="Prompt" getSuggestion={getSuggestion} debounceMs={0} />,
    );
    const ghost = () => container.querySelector('[data-slot="autocomplete-ghost"]');
    const field = screen.getByRole("textbox", { name: "Prompt" });
    await user.type(field, "Summarize the");
    await waitFor(() => expect(ghost()).toHaveTextContent("renewal risk for Acme Corp"));
    const calls = getSuggestion.mock.calls.length;
    await user.type(field, " renewal");
    expect(ghost()).toHaveTextContent(/^risk for Acme Corp/);
    expect(getSuggestion).toHaveBeenCalledTimes(calls);
    await user.keyboard("{Escape}");
    expect(ghost()).toBeNull();
    await user.type(field, " x");
    expect(ghost()).toBeNull();
  });
});
