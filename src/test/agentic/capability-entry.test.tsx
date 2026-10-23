import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { OpenInput } from "@nucleux/open-input";
import { SuggestedPrompts, SuggestedPrompt } from "@nucleux/suggested-prompts";
import { Templates, TemplatesList, TemplatesBrowser } from "@nucleux/templates";
import { ExampleGallery } from "@nucleux/example-gallery";
import { Nudge } from "@nucleux/nudges";
import { Disclaimer } from "@nucleux/disclaimer";
import { InitialCta } from "@nucleux/initial-cta";
import { ProactiveSuggestion } from "@nucleux/proactive";
import { Randomize } from "@nucleux/randomize";
import { Button } from "@nucleux/button";

const examples = [
  { title: "Summarise renewal risks", description: "Which accounts need attention this week", prompt: "Summarise the renewal risks across my accounts this week.", category: "Summaries", output: "3 accounts at risk: Acme, Globex, Initech." },
  { title: "Draft outreach email", description: "A follow-up for a lapsed account", prompt: "Draft a follow-up email to Acme Corp about their renewal.", category: "Drafts" },
];

const cases = [
  { name: "OpenInput", ui: <OpenInput aria-label="Message Aria" value="" onValueChange={() => {}} onSubmit={() => {}} /> },
  { name: "OpenInput label+error", ui: <OpenInput label="Ask Aria" defaultValue="hi" maxLength={10} counterThreshold={0} error="Couldn't send." onSubmit={() => {}} /> },
  { name: "OpenInput single-line", ui: <OpenInput variant="single-line" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "OpenInput input-with-send", ui: <OpenInput variant="input-with-send" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "SuggestedPrompts", ui: <SuggestedPrompts label="Try asking:" items={["Summarise renewal risks this week", "Draft a follow-up to Acme Corp", "Which accounts need attention?"]} /> },
  { name: "SuggestedPrompts card-list", ui: <SuggestedPrompts variant="card-list" afterSelect="mark" items={[{ title: "Draft a follow-up", description: "For the three at-risk accounts" }]} /> },
  { name: "SuggestedPrompts tooltip", ui: <SuggestedPrompts variant="contextual-tooltip" onDismiss={() => {}} items={["Rewrite this selection?"]} /> },
  { name: "SuggestedPrompt", ui: <SuggestedPrompt>Show highlights</SuggestedPrompt> },
  { name: "Templates", ui: <Templates segments={["Summarise ", { slot: "meeting", placeholder: "the standup", options: ["the standup", "the board meeting"], required: true }, " for ", { slot: "aud", placeholder: "the team" }, "."]} /> },
  { name: "TemplatesList", ui: <TemplatesList aria-label="Templates" items={["Draft a follow-up to the at-risk accounts", "Summarise yesterday's standup in 3 bullets"]} /> },
  { name: "TemplatesBrowser", ui: <TemplatesBrowser categories={[{ id: "sales", label: "Sales", templates: ["Outreach to cold lead", "Renewal nudge"] }, { id: "eng", label: "Eng", templates: ["Code review"] }]} /> },
  { name: "ExampleGallery", ui: <ExampleGallery examples={examples} /> },
  { name: "ExampleGallery strip", ui: <ExampleGallery variant="horizontal-strip" examples={examples} /> },
  { name: "ExampleGallery tabs", ui: <ExampleGallery variant="categorized-tabs" examples={examples} /> },
  { name: "ExampleGallery collapsed", ui: <ExampleGallery collapsed examples={examples} /> },
  { name: "Nudge inline", ui: <Nudge title="New: streaming summaries" message="Aria now drafts as you watch. Want to try it?" reason="You asked for three summaries today." onTry={() => {}} onSnooze={() => {}} /> },
  { name: "Nudge tooltip", ui: <Nudge variant="tooltip-nudge" message="Try uploading a PDF — Aria can summarise it in seconds." onTry={() => {}}><Button aria-label="Upload a file">+</Button></Nudge> },
  { name: "Nudge pulse", ui: <Nudge variant="highlight-pulse" message="Generate drafts a reply for you."><Button>Generate</Button></Nudge> },
  { name: "Disclaimer", ui: <Disclaimer agentName="Aria" items={["Summarise documents and threads", "Draft replies and emails", "Pull from connected sources", "Search the web"]} cutoff="Apr 2026" learnMoreHref="#about" /> },
  { name: "Disclaimer limits", ui: <Disclaimer variant="limitations-card" agentName="Aria" items={["Give legal advice"]} groups={[{ label: "Needs your approval", items: ["Sending email"] }]} /> },
  { name: "Disclaimer cutoff", ui: <Disclaimer variant="cutoff-note" agentName="Aria" cutoff="April 2026" /> },
  { name: "InitialCta", ui: <InitialCta aria-label="Message Aria" description="Ask about your accounts, draft emails, or analyse data." suggestions={["Summarise renewal risks", "Draft a follow-up"]} onSubmit={() => {}} /> },
  { name: "InitialCta gradient", ui: <InitialCta variant="gradient-cta" headline="Try Aria" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "InitialCta multimodal", ui: <InitialCta variant="multi-modal-row" aria-label="Message Aria" onVoice={() => {}} onAttachFile={() => {}} onAddImage={() => {}} onSubmit={() => {}} /> },
  { name: "ProactiveSuggestion", ui: <ProactiveSuggestion agentName="Aria" title="Three renewals expire this week" description="Want Aria to draft outreach for each?" actionLabel="Draft emails" onSnooze={() => {}} /> },
  { name: "ProactiveSuggestion inline", ui: <ProactiveSuggestion variant="inline-suggestion" agentName="Aria" title="Acme Corp renewal is due Apr 30" actionLabel="Draft outreach" /> },
  { name: "ProactiveSuggestion toast", ui: <ProactiveSuggestion variant="side-toast" agentName="Aria" title="Your reply to Sam mentions a date that's passed" actionLabel="Fix the date" /> },
  { name: "Randomize", ui: <Randomize prompts={["Draft a product brief"]} onSelect={() => {}} /> },
  { name: "Randomize bar", ui: <Randomize variant="shuffle-bar" prompts={["Draft a product brief"]} onSelect={() => {}} /> },
  { name: "Randomize card", ui: <Randomize variant="random-card" prompts={["Draft a one-paragraph product brief for an idea you haven't shipped."]} onSelect={() => {}} /> },
];

describe("axe", () => {
  for (const c of cases) {
    it(c.name, async () => {
      const { container } = render(c.ui);
      expect(await axe(container)).toHaveNoViolations();
    });
  }
});

describe("existing contracts", () => {
  it("OpenInput submits trimmed value on Enter (controlled)", async () => {
    const onSubmit = vi.fn();
    render(<OpenInput aria-label="Message" value="  hi  " onValueChange={() => {}} onSubmit={onSubmit} />);
    screen.getByRole("textbox", { name: "Message" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hi");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("  hi  ");
  });
  it("old axe cases", async () => {
    const { container } = render(<div>
      <OpenInput aria-label="Message" value="" onValueChange={() => {}} onSubmit={() => {}} />
      <SuggestedPrompts items={["Highlights", "Action items"]} />
      <Templates onComplete={() => {}} segments={["Email ", { slot: "company", placeholder: "Company" }, " about renewals."]} />
    </div>);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("SuggestedPrompts string items still call onSelect(value)", async () => {
    const onSelect = vi.fn();
    render(<SuggestedPrompts items={["Highlights"]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Highlights" }));
    expect(onSelect.mock.calls[0][0]).toBe("Highlights");
  });
  it("Templates without required slots interpolates placeholders", async () => {
    const onComplete = vi.fn();
    render(<Templates onComplete={onComplete} segments={["Email ", { slot: "company", placeholder: "Company" }, "."]} />);
    await userEvent.click(screen.getByRole("button", { name: "Use this prompt" }));
    expect(onComplete).toHaveBeenCalledWith("Email Company.", {});
  });
});

describe("behaviour", () => {
  it("OpenInput keeps the text and offers Retry when a send fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    render(<OpenInput aria-label="Message Aria" onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox", { name: "Message Aria" });
    await user.type(field, "Summarise the standup{Enter}");
    expect(await screen.findByRole("alert")).toHaveTextContent("still here");
    expect(field).toHaveValue("Summarise the standup");
    expect(field).toHaveAttribute("aria-invalid", "true");
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(field).toHaveValue(""));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("OpenInput with sendKey mod-enter inserts a newline on Enter and sends on Ctrl+Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<OpenInput aria-label="Message Aria" sendKey="mod-enter" onSubmit={onSubmit} />);
    const field = screen.getByRole("textbox", { name: "Message Aria" });
    await user.type(field, "line one{Enter}line two");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(field).toHaveValue("line one\nline two");
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledWith("line one\nline two");
    expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute("aria-keyshortcuts", "Meta+Enter Control+Enter");
  });

  it("OpenInput shows the counter only near maxLength", async () => {
    const user = userEvent.setup();
    render(<OpenInput aria-label="Message Aria" maxLength={10} onSubmit={() => {}} />);
    const field = screen.getByRole("textbox", { name: "Message Aria" });
    await user.type(field, "abcdefg");
    expect(screen.queryByText("7 / 10")).not.toBeInTheDocument();
    await user.type(field, "h");
    expect(screen.getByText("8 / 10")).toBeInTheDocument();
  });

  it("SuggestedPrompts caps at max, passes the fuller prompt, and removes the chosen one", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SuggestedPrompts
        label="Try asking:"
        afterSelect="remove"
        onSelect={onSelect}
        items={[
          { title: "Find unresolved decisions", prompt: "Find the unresolved decisions blocking the September release." },
          "Two", "Three", "Four", "Five", "Six",
        ]}
      />,
    );
    const list = screen.getByRole("list", { name: "Try asking:" });
    expect(list.querySelectorAll("li")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Find unresolved decisions" }));
    expect(onSelect).toHaveBeenCalledWith(
      "Find the unresolved decisions blocking the September release.",
      expect.objectContaining({ title: "Find unresolved decisions" }),
    );
    expect(screen.queryByRole("button", { name: "Find unresolved decisions" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Six" })).toBeInTheDocument();
  });

  it("SuggestedPrompts contextual tooltip dismisses on Escape", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<SuggestedPrompts variant="contextual-tooltip" items={["Rewrite this selection?"]} onDismiss={onDismiss} />);
    screen.getByRole("button", { name: "Rewrite this selection?" }).focus();
    await user.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("Templates holds Use until required slots are filled, then completes", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <Templates
        onComplete={onComplete}
        segments={["Summarise ", { slot: "meeting", placeholder: "meeting", required: true }, " in ", { slot: "length", placeholder: "3 bullets" }, "."]}
      />,
    );
    const use = screen.getByRole("button", { name: "Use this prompt" });
    expect(use).toBeDisabled();
    expect(screen.getByText("1 blank left")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "meeting" }), "the standup");
    expect(screen.getByText("Ready to use")).toBeInTheDocument();
    await user.click(use);
    expect(onComplete).toHaveBeenCalledWith("Summarise the standup in 3 bullets.", { meeting: "the standup" });
  });

  it("TemplatesBrowser switches categories and selects a template", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <TemplatesBrowser
        onSelect={onSelect}
        categories={[
          { id: "sales", label: "Sales", templates: ["Outreach to cold lead"] },
          { id: "support", label: "Support", templates: [{ title: "Apologise for an outage", prompt: "Draft an apology for today's outage." }] },
        ]}
      />,
    );
    await user.click(screen.getByRole("tab", { name: "Support" }));
    await user.click(screen.getByRole("button", { name: "Apologise for an outage" }));
    expect(onSelect).toHaveBeenCalledWith("Draft an apology for today's outage.", expect.anything(), "support");
  });

  it("ExampleGallery fills the prompt on click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ExampleGallery examples={examples} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Draft outreach email/ }));
    expect(onSelect).toHaveBeenCalledWith("Draft a follow-up email to Acme Corp about their renewal.", examples[1]);
  });

  it("ExampleGallery preview opens the prompt and output, and Use this prompt fills it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ExampleGallery examples={examples} selectBehavior="preview" onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Summarise renewal risks/ }));
    const dialog = screen.getByRole("dialog", { name: "Summarise renewal risks" });
    expect(dialog).toHaveTextContent("3 accounts at risk");
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Use this prompt" }));
    expect(onSelect).toHaveBeenCalledWith(examples[0].prompt, examples[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ExampleGallery categorised tabs filter by intent", async () => {
    const user = userEvent.setup();
    render(<ExampleGallery variant="categorized-tabs" examples={examples} />);
    expect(screen.getByRole("button", { name: /Summarise renewal risks/ })).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Drafts" }));
    expect(screen.queryByRole("button", { name: /Summarise renewal risks/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Draft outreach email/ })).toBeInTheDocument();
  });

  it("Nudge dismisses with its button, remembers it, and is capped per session", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    localStorage.clear();
    sessionStorage.clear();
    const { unmount } = render(<Nudge nudgeId="pdf" message="Try uploading a PDF." onDismiss={onDismiss} />);
    await user.click(await screen.findByRole("button", { name: "Dismiss tip" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole("note", { name: "Tip" })).not.toBeInTheDocument();
    unmount();
    render(<Nudge nudgeId="pdf" message="Try uploading a PDF." />);
    render(<Nudge nudgeId="voice" message="You can dictate instead." />);
    await waitFor(() => expect(screen.queryByRole("note", { name: "Tip" })).not.toBeInTheDocument());
  });

  it("Nudge reveals why it appeared and Try it fires once", async () => {
    const user = userEvent.setup();
    const onTry = vi.fn();
    render(<Nudge variant="tooltip-nudge" message="Try uploading a PDF." reason="You've sent three text-only messages." onTry={onTry}><Button>Upload</Button></Nudge>);
    expect(screen.getByRole("button", { name: "Upload" })).toHaveAccessibleDescription(/Try uploading a PDF/);
    await user.click(screen.getByRole("button", { name: "Why this tip?" }));
    expect(screen.getByText("You've sent three text-only messages.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(onTry).toHaveBeenCalledOnce();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("Disclaimer keeps to three points until Show all", async () => {
    const user = userEvent.setup();
    render(<Disclaimer agentName="Aria" items={["Summarise", "Draft", "Pull sources", "Translate"]} />);
    expect(screen.getByRole("note", { name: "What Aria can do" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show all (4)" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("InitialCta places a suggestion in the field, focused and unsent, then hides suggestions once edited", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <InitialCta
        aria-label="Message Aria"
        onSubmit={onSubmit}
        suggestions={[{ title: "Find unresolved decisions", prompt: "Find the unresolved decisions from this week's meetings." }]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Find unresolved decisions" }));
    const field = screen.getByRole("textbox", { name: "Message Aria" });
    expect(field).toHaveValue("Find the unresolved decisions from this week's meetings.");
    expect(field).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Find unresolved decisions" })).toHaveAttribute("aria-pressed", "true");
    await user.type(field, " Include owners.");
    expect(screen.queryByRole("button", { name: "Find unresolved decisions" })).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("Find the unresolved decisions from this week's meetings. Include owners.");
    expect(field).toHaveValue("");
  });

  it("InitialCta headline names the section", () => {
    render(<InitialCta aria-label="Message Aria" headline="What can I help with today?" onSubmit={() => {}} />);
    expect(screen.getByRole("region", { name: "What can I help with today?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "What can I help with today?" })).toBeInTheDocument();
  });

  it("ProactiveSuggestion: one action, dismiss is remembered for the evidence", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    sessionStorage.clear();
    const onAction = vi.fn();
    const { unmount } = render(
      <ProactiveSuggestion agentName="Aria" evidenceKey="renewals-w17" title="Three renewals expire this week" actionLabel="Draft emails" onAction={onAction} />,
    );
    await user.click(await screen.findByRole("button", { name: "Draft emails" }));
    expect(onAction).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Dismiss suggestion" }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    unmount();
    render(<ProactiveSuggestion agentName="Aria" evidenceKey="renewals-w17" title="Three renewals expire this week" actionLabel="Draft emails" />);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Draft emails" })).not.toBeInTheDocument());
  });

  it("ProactiveSuggestion shows a pending state while the action works, and Escape dismisses", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onDismiss = vi.fn();
    render(
      <ProactiveSuggestion title="Two blockers have no owner" actionLabel="Review" onDismiss={onDismiss} onAction={() => new Promise<void>((r) => (resolve = r))} />,
    );
    await user.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getByRole("button", { name: "Preparing…" })).toHaveAttribute("aria-busy", "true");
    resolve();
    expect(await screen.findByRole("button", { name: "Review" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("Randomize dice places a prompt, and asks before replacing the person's words", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(<Randomize prompts={["Draft a product brief"]} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(onSelect).toHaveBeenLastCalledWith("Draft a product brief", { mode: "replace" });
    rerender(<Randomize prompts={["Draft a product brief"]} onSelect={onSelect} draft="My own idea" />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Replace" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Add below" }));
    expect(onSelect).toHaveBeenLastCalledWith("Draft a product brief", { mode: "append" });
  });

  it("Randomize card picks another without repeating, and can step back", async () => {
    const user = userEvent.setup();
    const pool = ["Alpha brief", "Beta brief", "Gamma brief"];
    render(<Randomize variant="random-card" prompts={pool} onSelect={() => {}} />);
    const shown = () => pool.find((p) => screen.queryByText(`"${p}"`))!;
    const first = shown();
    await user.click(screen.getByRole("button", { name: "Pick another" }));
    const second = shown();
    expect(second).not.toBe(first);
    await user.click(screen.getByRole("button", { name: "Previous prompt" }));
    expect(shown()).toBe(first);
  });

  it("Randomize async generate shows working, then error with Try again", async () => {
    const user = userEvent.setup();
    const generate = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce("Launch through customer stories");
    render(<Randomize variant="shuffle-bar" generate={generate} onSelect={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("“Launch through customer stories”")).toBeInTheDocument();
    expect(generate).toHaveBeenLastCalledWith([]);
  });
});
