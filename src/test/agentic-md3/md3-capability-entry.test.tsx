import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3OpenInput } from "@nucleux/md3-open-input";
import { Md3SuggestedPrompts, Md3SuggestedPrompt } from "@nucleux/md3-suggested-prompts";
import { Md3Templates, Md3TemplatesList, Md3TemplatesBrowser } from "@nucleux/md3-templates";
import { Md3ExampleGallery } from "@nucleux/md3-example-gallery";
import { Md3Nudge } from "@nucleux/md3-nudges";
import { Md3Disclaimer } from "@nucleux/md3-disclaimer";
import { Md3InitialCta } from "@nucleux/md3-initial-cta";
import { Md3ProactiveSuggestion } from "@nucleux/md3-proactive";
import { Md3Randomize } from "@nucleux/md3-randomize";
import { Md3Button } from "@nucleux/md3-button";

const examples = [
  { title: "Summarise renewal risks", description: "Which accounts need attention this week", prompt: "Summarise the renewal risks across my accounts this week.", category: "Summaries", output: "3 accounts at risk: Acme, Globex, Initech." },
  { title: "Draft outreach email", description: "A follow-up for a lapsed account", prompt: "Draft a follow-up email to Acme Corp about their renewal.", category: "Drafts" },
];

const cases = [
  { name: "Md3OpenInput", ui: <Md3OpenInput aria-label="Message Aria" value="" onValueChange={() => {}} onSubmit={() => {}} /> },
  { name: "Md3OpenInput label+error", ui: <Md3OpenInput label="Ask Aria" defaultValue="hi" maxLength={10} counterThreshold={0} error="Couldn't send." onSubmit={() => {}} /> },
  { name: "Md3OpenInput single-line", ui: <Md3OpenInput variant="single-line" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "Md3OpenInput input-with-send", ui: <Md3OpenInput variant="input-with-send" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "Md3SuggestedPrompts", ui: <Md3SuggestedPrompts label="Try asking:" items={["Summarise renewal risks this week", "Draft a follow-up to Acme Corp", "Which accounts need attention?"]} /> },
  { name: "Md3SuggestedPrompts card-list", ui: <Md3SuggestedPrompts variant="card-list" afterSelect="mark" items={[{ title: "Draft a follow-up", description: "For the three at-risk accounts" }]} /> },
  { name: "Md3SuggestedPrompts tooltip", ui: <Md3SuggestedPrompts variant="contextual-tooltip" onDismiss={() => {}} items={["Rewrite this selection?"]} /> },
  { name: "Md3SuggestedPrompt", ui: <Md3SuggestedPrompt>Show highlights</Md3SuggestedPrompt> },
  { name: "Md3Templates", ui: <Md3Templates segments={["Summarise ", { slot: "meeting", placeholder: "the standup", options: ["the standup", "the board meeting"], required: true }, " for ", { slot: "aud", placeholder: "the team" }, "."]} /> },
  { name: "Md3TemplatesList", ui: <Md3TemplatesList aria-label="Templates" items={["Draft a follow-up to the at-risk accounts", "Summarise yesterday's standup in 3 bullets"]} /> },
  { name: "Md3TemplatesBrowser", ui: <Md3TemplatesBrowser categories={[{ id: "sales", label: "Sales", templates: ["Outreach to cold lead", "Renewal nudge"] }, { id: "eng", label: "Eng", templates: ["Code review"] }]} /> },
  { name: "Md3ExampleGallery", ui: <Md3ExampleGallery examples={examples} /> },
  { name: "Md3ExampleGallery strip", ui: <Md3ExampleGallery variant="horizontal-strip" examples={examples} /> },
  { name: "Md3ExampleGallery tabs", ui: <Md3ExampleGallery variant="categorized-tabs" examples={examples} /> },
  { name: "Md3ExampleGallery collapsed", ui: <Md3ExampleGallery collapsed examples={examples} /> },
  { name: "Md3Nudge inline", ui: <Md3Nudge title="New: streaming summaries" message="Aria now drafts as you watch. Want to try it?" reason="You asked for three summaries today." onTry={() => {}} onSnooze={() => {}} /> },
  { name: "Md3Nudge tooltip", ui: <Md3Nudge variant="tooltip-nudge" message="Try uploading a PDF — Aria can summarise it in seconds." onTry={() => {}}><Md3Button aria-label="Upload a file">+</Md3Button></Md3Nudge> },
  { name: "Md3Nudge pulse", ui: <Md3Nudge variant="highlight-pulse" message="Generate drafts a reply for you."><Md3Button>Generate</Md3Button></Md3Nudge> },
  { name: "Md3Disclaimer", ui: <Md3Disclaimer agentName="Aria" items={["Summarise documents and threads", "Draft replies and emails", "Pull from connected sources", "Search the web"]} cutoff="Apr 2026" learnMoreHref="#about" /> },
  { name: "Md3Disclaimer limits", ui: <Md3Disclaimer variant="limitations-card" agentName="Aria" items={["Give legal advice"]} groups={[{ label: "Needs your approval", items: ["Sending email"] }]} /> },
  { name: "Md3Disclaimer cutoff", ui: <Md3Disclaimer variant="cutoff-note" agentName="Aria" cutoff="April 2026" /> },
  { name: "Md3InitialCta", ui: <Md3InitialCta aria-label="Message Aria" description="Ask about your accounts, draft emails, or analyse data." suggestions={["Summarise renewal risks", "Draft a follow-up"]} onSubmit={() => {}} /> },
  { name: "Md3InitialCta gradient", ui: <Md3InitialCta variant="gradient-cta" headline="Try Aria" aria-label="Message Aria" onSubmit={() => {}} /> },
  { name: "Md3InitialCta multimodal", ui: <Md3InitialCta variant="multi-modal-row" aria-label="Message Aria" onVoice={() => {}} onAttachFile={() => {}} onAddImage={() => {}} onSubmit={() => {}} /> },
  { name: "Md3ProactiveSuggestion", ui: <Md3ProactiveSuggestion agentName="Aria" title="Three renewals expire this week" description="Want Aria to draft outreach for each?" actionLabel="Draft emails" onSnooze={() => {}} /> },
  { name: "Md3ProactiveSuggestion inline", ui: <Md3ProactiveSuggestion variant="inline-suggestion" agentName="Aria" title="Acme Corp renewal is due Apr 30" actionLabel="Draft outreach" /> },
  { name: "Md3ProactiveSuggestion toast", ui: <Md3ProactiveSuggestion variant="side-toast" agentName="Aria" title="Your reply to Sam mentions a date that's passed" actionLabel="Fix the date" /> },
  { name: "Md3Randomize", ui: <Md3Randomize prompts={["Draft a product brief"]} onSelect={() => {}} /> },
  { name: "Md3Randomize bar", ui: <Md3Randomize variant="shuffle-bar" prompts={["Draft a product brief"]} onSelect={() => {}} /> },
  { name: "Md3Randomize card", ui: <Md3Randomize variant="random-card" prompts={["Draft a one-paragraph product brief for an idea you haven't shipped."]} onSelect={() => {}} /> },
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
    render(<Md3OpenInput aria-label="Message" value="  hi  " onValueChange={() => {}} onSubmit={onSubmit} />);
    screen.getByRole("textbox", { name: "Message" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hi");
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("  hi  ");
  });
  it("old axe cases", async () => {
    const { container } = render(<div>
      <Md3OpenInput aria-label="Message" value="" onValueChange={() => {}} onSubmit={() => {}} />
      <Md3SuggestedPrompts items={["Highlights", "Action items"]} />
      <Md3Templates onComplete={() => {}} segments={["Email ", { slot: "company", placeholder: "Company" }, " about renewals."]} />
    </div>);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("SuggestedPrompts string items still call onSelect(value)", async () => {
    const onSelect = vi.fn();
    render(<Md3SuggestedPrompts items={["Highlights"]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Highlights" }));
    expect(onSelect.mock.calls[0][0]).toBe("Highlights");
  });
  it("Templates without required slots interpolates placeholders", async () => {
    const onComplete = vi.fn();
    render(<Md3Templates onComplete={onComplete} segments={["Email ", { slot: "company", placeholder: "Company" }, "."]} />);
    await userEvent.click(screen.getByRole("button", { name: "Use this prompt" }));
    expect(onComplete).toHaveBeenCalledWith("Email Company.", {});
  });
});

describe("behaviour", () => {
  it("OpenInput keeps the text and offers Retry when a send fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    render(<Md3OpenInput aria-label="Message Aria" onSubmit={onSubmit} />);
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
    render(<Md3OpenInput aria-label="Message Aria" sendKey="mod-enter" onSubmit={onSubmit} />);
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
    render(<Md3OpenInput aria-label="Message Aria" maxLength={10} onSubmit={() => {}} />);
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
      <Md3SuggestedPrompts
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
    render(<Md3SuggestedPrompts variant="contextual-tooltip" items={["Rewrite this selection?"]} onDismiss={onDismiss} />);
    screen.getByRole("button", { name: "Rewrite this selection?" }).focus();
    await user.keyboard("{Escape}");
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("Templates holds Use until required slots are filled, then completes", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <Md3Templates
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
      <Md3TemplatesBrowser
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
    render(<Md3ExampleGallery examples={examples} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: /Draft outreach email/ }));
    expect(onSelect).toHaveBeenCalledWith("Draft a follow-up email to Acme Corp about their renewal.", examples[1]);
  });

  it("ExampleGallery preview opens the prompt and output, and Use this prompt fills it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Md3ExampleGallery examples={examples} selectBehavior="preview" onSelect={onSelect} />);
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
    render(<Md3ExampleGallery variant="categorized-tabs" examples={examples} />);
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
    const { unmount } = render(<Md3Nudge nudgeId="pdf" message="Try uploading a PDF." onDismiss={onDismiss} />);
    await user.click(await screen.findByRole("button", { name: "Dismiss tip" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole("note", { name: "Tip" })).not.toBeInTheDocument();
    unmount();
    render(<Md3Nudge nudgeId="pdf" message="Try uploading a PDF." />);
    render(<Md3Nudge nudgeId="voice" message="You can dictate instead." />);
    await waitFor(() => expect(screen.queryByRole("note", { name: "Tip" })).not.toBeInTheDocument());
  });

  it("Nudge reveals why it appeared and Try it fires once", async () => {
    const user = userEvent.setup();
    const onTry = vi.fn();
    render(<Md3Nudge variant="tooltip-nudge" message="Try uploading a PDF." reason="You've sent three text-only messages." onTry={onTry}><Md3Button>Upload</Md3Button></Md3Nudge>);
    expect(screen.getByRole("button", { name: "Upload" })).toHaveAccessibleDescription(/Try uploading a PDF/);
    await user.click(screen.getByRole("button", { name: "Why this tip?" }));
    expect(screen.getByText("You've sent three text-only messages.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try it" }));
    expect(onTry).toHaveBeenCalledOnce();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });

  it("Disclaimer keeps to three points until Show all", async () => {
    const user = userEvent.setup();
    render(<Md3Disclaimer agentName="Aria" items={["Summarise", "Draft", "Pull sources", "Translate"]} />);
    expect(screen.getByRole("note", { name: "What Aria can do" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Show all (4)" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("InitialCta places a suggestion in the field, focused and unsent, then hides suggestions once edited", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Md3InitialCta
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
    render(<Md3InitialCta aria-label="Message Aria" headline="What can I help with today?" onSubmit={() => {}} />);
    expect(screen.getByRole("region", { name: "What can I help with today?" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "What can I help with today?" })).toBeInTheDocument();
  });

  it("ProactiveSuggestion: one action, dismiss is remembered for the evidence", async () => {
    const user = userEvent.setup();
    localStorage.clear();
    sessionStorage.clear();
    const onAction = vi.fn();
    const { unmount } = render(
      <Md3ProactiveSuggestion agentName="Aria" evidenceKey="renewals-w17" title="Three renewals expire this week" actionLabel="Draft emails" onAction={onAction} />,
    );
    await user.click(await screen.findByRole("button", { name: "Draft emails" }));
    expect(onAction).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Dismiss suggestion" }));
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    unmount();
    render(<Md3ProactiveSuggestion agentName="Aria" evidenceKey="renewals-w17" title="Three renewals expire this week" actionLabel="Draft emails" />);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Draft emails" })).not.toBeInTheDocument());
  });

  it("ProactiveSuggestion shows a pending state while the action works, and Escape dismisses", async () => {
    const user = userEvent.setup();
    let resolve!: () => void;
    const onDismiss = vi.fn();
    render(
      <Md3ProactiveSuggestion title="Two blockers have no owner" actionLabel="Review" onDismiss={onDismiss} onAction={() => new Promise<void>((r) => (resolve = r))} />,
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
    const { rerender } = render(<Md3Randomize prompts={["Draft a product brief"]} onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(onSelect).toHaveBeenLastCalledWith("Draft a product brief", { mode: "replace" });
    rerender(<Md3Randomize prompts={["Draft a product brief"]} onSelect={onSelect} draft="My own idea" />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Replace" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Add below" }));
    expect(onSelect).toHaveBeenLastCalledWith("Draft a product brief", { mode: "append" });
  });

  it("Randomize card picks another without repeating, and can step back", async () => {
    const user = userEvent.setup();
    const pool = ["Alpha brief", "Beta brief", "Gamma brief"];
    render(<Md3Randomize variant="random-card" prompts={pool} onSelect={() => {}} />);
    const shown = () => pool.find((p) => screen.queryByText(`“${p}”`))!;
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
    render(<Md3Randomize variant="shuffle-bar" generate={generate} onSelect={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Surprise me" }));
    expect(await screen.findByRole("button", { name: "Try again" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("“Launch through customer stories”")).toBeInTheDocument();
    expect(generate).toHaveBeenLastCalledWith([]);
  });
});
