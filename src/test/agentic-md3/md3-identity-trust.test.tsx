import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Md3AiIcon, Md3AiIconProvider, Md3AiIcons } from "@nucleux/md3-ai-icons";
import { Md3AiColor, Md3AiColorHighlight } from "@nucleux/md3-color";
import { Md3Iconography } from "@nucleux/md3-iconography";
import { Md3AgentAvatar } from "@nucleux/md3-agent-avatar";
import { Md3AgentName } from "@nucleux/md3-name";
import { Md3Disclosure } from "@nucleux/md3-disclosure";
import { Md3Caveat, Md3CaveatTooltip } from "@nucleux/md3-caveat";
import { Md3Consent, Md3ConsentDialog, Md3ConsentToggle } from "@nucleux/md3-consent";
import { Md3Personality, Md3PersonalitySampleDialog, Md3PersonalityVoiceCard } from "@nucleux/md3-personality";

const cases: { name: string; ui: React.ReactElement }[] = [
  {
    name: "Md3AiIcons",
    ui: (
      <div>
        <Md3AiIcons variant="sparkle" label="AI" />
        <Md3AiIcons variant="thinking-orb" />
        <Md3AiIcons variant="branded-mark" label="Aria" />
        <Md3AiIcon role="ai-action" label="Rewrite" />
        <Md3AiIcon role="generated-content" label="Generated with AI" />
        <Md3AiIcon role="agent-working" label="Rewriting release note…" />
        <Md3AiIcon role="tool-use" label="Style guide checked" />
      </div>
    ),
  },
  {
    name: "Md3AiColor",
    ui: (
      <div>
        <Md3AiColor variant="accent-border" working label="Streaming">Analysing your Q2 numbers</Md3AiColor>
        <Md3AiColor variant="soft-glow" working label="Aria is working">Pulling the renewal numbers.</Md3AiColor>
        <Md3AiColor variant="background-tint" label="Aria suggests">
          Follow up with <Md3AiColorHighlight>Acme Corp</Md3AiColorHighlight>.
        </Md3AiColor>
      </div>
    ),
  },
  {
    name: "Md3Iconography",
    ui: (
      <div>
        <Md3Iconography label="Generate" agentName="Aria" iconOnly />
        <Md3Iconography label="Generate with Aria" />
        <Md3Iconography intent="transform" label="Rewrite" variant="secondary" working workingLabel="Rewriting…" />
      </div>
    ),
  },
  {
    name: "Md3AgentAvatar",
    ui: (
      <div>
        <Md3AgentAvatar name="Aria" />
        <Md3AgentAvatar name="Aria" working size="lg" />
        <Md3AgentAvatar name="Aria" status="online" statusLabel="Online · ready" shape="rounded" />
        <Md3AgentAvatar name="Aria" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
      </div>
    ),
  },
  {
    name: "Md3AgentName",
    ui: (
      <div>
        <Md3AgentName name="Aria" variant="wordmark" descriptor="Intelligaia agent" />
        <Md3AgentName name="Aria" variant="name-status" status="drafting" />
        <Md3AgentName name="Atlas" formerName="Aria" descriptor="Meeting Intelligence Agent" />
      </div>
    ),
  },
  {
    name: "Md3Disclosure",
    ui: (
      <div>
        <Md3Disclosure variant="header-badge" />
        <Md3Disclosure variant="footer-attribution" agentName="Aria" details="Used: Q2 export. Not checked: figures." />
        <Md3Disclosure variant="input-chip" agentName="Aria" />
        <Md3Disclosure variant="first-run-banner" agentName="Aria" policyHref="#p" onDismiss={() => {}} />
        <Md3Disclosure variant="pill" />
        <Md3Disclosure variant="banner" />
      </div>
    ),
  },
  {
    name: "Md3Caveat",
    ui: (
      <div>
        <Md3Caveat>Aria may make mistakes. Verify important info.</Md3Caveat>
        <Md3Caveat variant="output-footer" actions={<button type="button">Review sources</button>}>
          2 of 8 interviews could not be opened.
        </Md3Caveat>
        <Md3CaveatTooltip>
          <button type="button">Generate</button>
        </Md3CaveatTooltip>
      </div>
    ),
  },
  {
    name: "Md3Consent",
    ui: (
      <div>
        <Md3Consent
          title="Allow workspace access?"
          description="Choose what Aria can read."
          policyHref="#privacy"
          permissions={[{ id: "read", label: "Read selected files" }]}
        />
        <Md3ConsentToggle title="Help improve Aria with my data" description="Anonymised. Opt out anytime." />
      </div>
    ),
  },
  {
    name: "Md3ConsentDialog",
    ui: <Md3ConsentDialog open onOpenChange={() => {}} title="Allow data to improve Aria?" description="Inputs never leave your tenant." policyHref="#p" />,
  },
  {
    name: "Md3Personality",
    ui: (
      <div>
        <Md3Personality defaultValue="direct" />
        <Md3PersonalityVoiceCard quote="Here's what I found." tags={["calm", "proactive"]} />
        <Md3PersonalitySampleDialog
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
      <Md3AiIconProvider glyphs={{ "ai-action": "wand" }}>
        <Md3AiIcon role="agent-working" label="Rewriting release note…" />
        <Md3AiIcon role="ai-action" label="Rewrite" />
      </Md3AiIconProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Rewriting release note…");
    expect(screen.getByText("Rewrite").parentElement!.querySelector("svg")).toHaveAttribute("data-ai-glyph", "wand");
  });

  it("Iconography icon-only is named, and ignores clicks while working", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Md3Iconography label="Generate" agentName="Aria" iconOnly onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Generate with Aria" });
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(<Md3Iconography label="Generate" agentName="Aria" iconOnly onClick={onClick} working workingLabel="Generating…" />);
    await userEvent.click(screen.getByRole("button", { name: "Generating… with Aria" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  it("AgentAvatar names the agent as AI and announces its state", () => {
    render(<Md3AgentAvatar name="Aria" status="working" statusLabel="Generating…" />);
    expect(screen.getByRole("img", { name: "Aria, AI agent" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Generating…");
  });

  it("AgentName name-status reads 'Aria is drafting' in a live region", () => {
    render(<Md3AgentName name="Aria" variant="name-status" status="drafting" />);
    expect(screen.getByRole("status")).toHaveTextContent("Aria is drafting");
  });

  it("Disclosure details open in place and the first-run banner dismisses", async () => {
    const onDismiss = vi.fn();
    render(
      <>
        <Md3Disclosure variant="footer-attribution" agentName="Aria" details="Not checked: the figures." />
        <Md3Disclosure variant="first-run-banner" agentName="Aria" policyHref="#p" onDismiss={onDismiss} />
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
      <Md3CaveatTooltip content="Output may be inaccurate">
        <button type="button">Generate</button>
      </Md3CaveatTooltip>,
    );
    expect(screen.getByRole("button", { name: "Generate" })).toHaveAccessibleDescription("Output may be inaccurate");
  });

  it("ConsentDialog blocks Escape and closes after an answer", async () => {
    const onOpenChange = vi.fn();
    const onAllow = vi.fn();
    render(
      <Md3ConsentDialog open onOpenChange={onOpenChange} onAllow={onAllow} title="Allow data to improve Aria?" description="Inputs never leave your tenant." />,
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
    render(<Md3ConsentToggle title="Help improve Aria with my data" description="Anonymised." onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Help improve Aria with my data" });
    expect(sw).toHaveAccessibleDescription("Anonymised.");
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("Personality tone matrix moves with arrow keys (roving focus)", async () => {
    const onValueChange = vi.fn();
    render(<Md3Personality defaultValue="professional" onValueChange={onValueChange} />);
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
