import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { AiIcon, AiIconProvider, AiIcons } from "@nucleux/ai-icons";
import { AiColor, AiColorHighlight } from "@nucleux/color";
import { Iconography } from "@nucleux/iconography";
import { AgentAvatar } from "@nucleux/agent-avatar";
import { AgentName } from "@nucleux/name";
import { Disclosure } from "@nucleux/disclosure";
import { Caveat, CaveatTooltip } from "@nucleux/caveat";
import { Consent, ConsentDialog, ConsentToggle } from "@nucleux/consent";
import { Personality, PersonalitySampleDialog, PersonalityVoiceCard } from "@nucleux/personality";

const cases: { name: string; ui: React.ReactElement }[] = [
  {
    name: "AiIcons",
    ui: (
      <div>
        <AiIcons variant="sparkle" label="AI" />
        <AiIcons variant="thinking-orb" />
        <AiIcons variant="branded-mark" label="Aria" />
        <AiIcon role="ai-action" label="Rewrite" />
        <AiIcon role="generated-content" label="Generated with AI" />
        <AiIcon role="agent-working" label="Rewriting release note…" />
        <AiIcon role="tool-use" label="Style guide checked" />
      </div>
    ),
  },
  {
    name: "AiColor",
    ui: (
      <div>
        <AiColor variant="accent-border" working label="Streaming">Analysing your Q2 numbers</AiColor>
        <AiColor variant="soft-glow" working label="Aria is working">Pulling the renewal numbers.</AiColor>
        <AiColor variant="background-tint" label="Aria suggests">
          Follow up with <AiColorHighlight>Acme Corp</AiColorHighlight>.
        </AiColor>
      </div>
    ),
  },
  {
    name: "Iconography",
    ui: (
      <div>
        <Iconography label="Generate" agentName="Aria" iconOnly />
        <Iconography label="Generate with Aria" />
        <Iconography intent="transform" label="Rewrite" variant="secondary" working workingLabel="Rewriting…" />
      </div>
    ),
  },
  {
    name: "AgentAvatar",
    ui: (
      <div>
        <AgentAvatar name="Aria" />
        <AgentAvatar name="Aria" working size="lg" />
        <AgentAvatar name="Aria" status="online" statusLabel="Online · ready" shape="rounded" />
        <AgentAvatar name="Aria" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
      </div>
    ),
  },
  {
    name: "AgentName",
    ui: (
      <div>
        <AgentName name="Aria" variant="wordmark" descriptor="Intelligaia agent" />
        <AgentName name="Aria" variant="name-status" status="drafting" />
        <AgentName name="Atlas" formerName="Aria" descriptor="Meeting Intelligence Agent" />
      </div>
    ),
  },
  {
    name: "Disclosure",
    ui: (
      <div>
        <Disclosure variant="header-badge" />
        <Disclosure variant="footer-attribution" agentName="Aria" details="Used: Q2 export. Not checked: figures." />
        <Disclosure variant="input-chip" agentName="Aria" />
        <Disclosure variant="first-run-banner" agentName="Aria" policyHref="#p" onDismiss={() => {}} />
        <Disclosure variant="pill" />
        <Disclosure variant="banner" />
      </div>
    ),
  },
  {
    name: "Caveat",
    ui: (
      <div>
        <Caveat>Aria may make mistakes. Verify important info.</Caveat>
        <Caveat variant="output-footer" actions={<button type="button">Review sources</button>}>
          2 of 8 interviews could not be opened.
        </Caveat>
        <CaveatTooltip>
          <button type="button">Generate</button>
        </CaveatTooltip>
      </div>
    ),
  },
  {
    name: "Consent",
    ui: (
      <div>
        <Consent
          title="Allow workspace access?"
          description="Choose what Aria can read."
          policyHref="#privacy"
          permissions={[{ id: "read", label: "Read selected files" }]}
        />
        <ConsentToggle title="Help improve Aria with my data" description="Anonymised. Opt out anytime." />
      </div>
    ),
  },
  {
    name: "ConsentDialog",
    ui: <ConsentDialog open onOpenChange={() => {}} title="Allow data to improve Aria?" description="Inputs never leave your tenant." policyHref="#p" />,
  },
  {
    name: "Personality",
    ui: (
      <div>
        <Personality defaultValue="direct" />
        <PersonalityVoiceCard quote="Here's what I found." tags={["calm", "proactive"]} />
        <PersonalitySampleDialog
          agentName="Aria"
          turns={[
            { from: "user", text: "Summarise this thread." },
            { from: "agent", text: "Done. Want me to draft a reply?" },
            { from: "agent", text: "Aria will post the recap in #launch.", fixed: true },
          ]}
        />
      </div>
    ),
  },
];

describe("axe", () => {
  it.each(cases)("$name", async ({ ui }) => {
    const { container } = render(ui);
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});

describe("behaviour", () => {
  it("AiIcon agent-working announces its words in a polite status and honours the provider glyph", async () => {
    render(
      <AiIconProvider glyphs={{ "ai-action": "wand" }}>
        <AiIcon role="agent-working" label="Rewriting release note…" />
        <AiIcon role="ai-action" label="Rewrite" />
      </AiIconProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Rewriting release note…");
    expect(screen.getByText("Rewrite").parentElement!.querySelector("svg")).toHaveAttribute("data-ai-glyph", "wand");
  });

  it("Iconography icon-only is named, and ignores clicks while working", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Iconography label="Generate" agentName="Aria" iconOnly onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Generate with Aria" });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Iconography label="Generate" agentName="Aria" iconOnly onClick={onClick} working workingLabel="Generating…" />);
    await userEvent.click(screen.getByRole("button", { name: "Generating… with Aria" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  it("AgentAvatar names the agent as AI and announces its state", () => {
    render(<AgentAvatar name="Aria" status="working" statusLabel="Generating…" />);
    expect(screen.getByRole("img", { name: "Aria, AI agent" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  it("AgentName name-status reads 'Aria is drafting' in a live region", () => {
    render(<AgentName name="Aria" variant="name-status" status="drafting" />);
    expect(screen.getByRole("status")).toHaveTextContent("Aria is drafting");
  });

  it("Disclosure details open in place and the first-run banner dismisses", async () => {
    const onDismiss = vi.fn();
    render(
      <>
        <Disclosure variant="footer-attribution" agentName="Aria" details="Not checked: the figures." />
        <Disclosure variant="first-run-banner" agentName="Aria" policyHref="#p" onDismiss={onDismiss} />
      </>,
    );
    const toggle = screen.getByRole("button", { name: /Generated by Aria/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Not checked: the figures.")).not.toBeVisible();
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Not checked: the figures.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Read policy" })).toHaveAttribute("href", "#p");
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/You're chatting with Aria/)).not.toBeInTheDocument();
  });

  it("CaveatTooltip describes the action it rides on", () => {
    render(
      <CaveatTooltip content="Output may be inaccurate">
        <button type="button">Generate</button>
      </CaveatTooltip>,
    );
    expect(screen.getByRole("button", { name: "Generate" })).toHaveAccessibleDescription("Output may be inaccurate");
  });

  it("ConsentDialog blocks Escape and closes after an answer", async () => {
    const onOpenChange = vi.fn();
    const onAllow = vi.fn();
    render(
      <ConsentDialog open onOpenChange={onOpenChange} onAllow={onAllow} title="Allow data to improve Aria?" description="Inputs never leave your tenant." />,
    );
    expect(screen.getByRole("dialog", { name: "Allow data to improve Aria?" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Allow" }));
    expect(onAllow).toHaveBeenCalledWith([]);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ConsentToggle is a named, described switch", async () => {
    const onCheckedChange = vi.fn();
    render(<ConsentToggle title="Help improve Aria with my data" description="Anonymised." onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Help improve Aria with my data" });
    expect(sw).toHaveAccessibleDescription("Anonymised.");
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("Personality tone matrix moves with arrow keys (roving focus)", async () => {
    const onValueChange = vi.fn();
    render(<Personality defaultValue="professional" onValueChange={onValueChange} />);
    const first = screen.getByRole("radio", { name: "Professional" });
    expect(first).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("radio", { name: "Friendly" })).toHaveAttribute("tabindex", "-1");
    await userEvent.tab();
    expect(first).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Friendly" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Friendly" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("friendly");
  });
});
