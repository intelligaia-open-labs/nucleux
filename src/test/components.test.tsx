import { createRef, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Home, Mic } from "lucide-react";

import {
  ActionTile,
  Avatar,
  Badge,
  Button,
  CardAction,
  CardContainer,
  CardContent,
  CardDescription,
  CardDivider,
  CardHeader,
  CardTitle,
  Checklist,
  ChecklistItem,
  CodeBlock,
  GettingStartedPill,
  GlobalNav,
  IconButton,
  InputBar,
  Message,
  Reasoning,
  SearchInput,
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  StreamingText,
  Thread,
  ToolCall,
  TypingIndicator,
} from "../index";

/**
 * Every exported component with a valid, minimal render. Drives the smoke +
 * accessibility checks below. Adding a component here is the single step needed
 * to bring it under end-to-end validation.
 */
const cases: { name: string; ui: ReactElement }[] = [
  { name: "Avatar", ui: <Avatar name="Eric Idle" /> },
  { name: "Badge", ui: <Badge>New</Badge> },
  { name: "Button", ui: <Button>Save</Button> },
  {
    name: "IconButton",
    ui: (
      <IconButton aria-label="Home">
        <Home />
      </IconButton>
    ),
  },
  {
    name: "CardContainer",
    ui: (
      <CardContainer>
        <CardHeader>
          <div>
            <CardTitle>Recent meeting</CardTitle>
            <CardDescription>1 in your library</CardDescription>
          </div>
          <CardAction>View all</CardAction>
        </CardHeader>
        <CardDivider />
        <CardContent>Body</CardContent>
      </CardContainer>
    ),
  },
  {
    name: "Checklist",
    ui: (
      <Checklist>
        <ChecklistItem done title="Step one" description="Done already" />
        <ChecklistItem
          title="Step two"
          description="Pending"
          action={<Button size="sm">Go</Button>}
        />
      </Checklist>
    ),
  },
  {
    name: "ActionTile",
    ui: <ActionTile icon={<Mic />} title="Record" description="Capture live." />,
  },
  { name: "GettingStartedPill", ui: <GettingStartedPill current={2} total={4} /> },
  { name: "SearchInput", ui: <SearchInput aria-label="Search" /> },
  {
    name: "GlobalNav",
    ui: <GlobalNav left={<span>Heading</span>} right={<Avatar name="Eric" />} />,
  },
  {
    name: "Sidebar",
    ui: (
      <Sidebar footer={<SidebarItem icon={<Home />} label="Settings" />}>
        <SidebarItem icon={<Home />} label="Home" active />
        <SidebarSeparator />
        <SidebarItem icon={<Home />} label="More" />
      </Sidebar>
    ),
  },
  { name: "StreamingText", ui: <StreamingText text="Hello" streaming /> },
  { name: "TypingIndicator", ui: <TypingIndicator /> },
  {
    name: "ToolCall",
    ui: (
      <ToolCall
        defaultOpen
        toolCall={{ id: "1", name: "search", status: "success", args: { q: "x" }, result: "ok" }}
      />
    ),
  },
  { name: "Reasoning", ui: <Reasoning content="thinking…" defaultOpen /> },
  { name: "CodeBlock", ui: <CodeBlock code="const x = 1;" language="ts" /> },
  {
    name: "InputBar",
    ui: (
      <InputBar aria-label="Message" value="" onValueChange={() => {}} onSubmit={() => {}} />
    ),
  },
  { name: "Message", ui: <Message role="assistant" content="Hi there" /> },
  {
    name: "Thread",
    ui: (
      <Thread>
        <Message role="user" content="Hello" />
        <Message role="assistant" content="Hi" />
      </Thread>
    ),
  },
];

describe("smoke: every component renders", () => {
  it.each(cases)("$name mounts and produces DOM", ({ ui }) => {
    const { container } = render(ui);
    expect(container.firstChild).toBeTruthy();
  });
});

describe("a11y: every component is accessible", () => {
  it.each(cases)("$name has no axe violations", async ({ ui }) => {
    const { container } = render(ui);
    // color-contrast needs real rendered CSS (not loaded in jsdom) — skip it here;
    // contrast is covered by the token system + Storybook visual review.
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});

describe("refs: forwardRef reaches the DOM node", () => {
  it("Button forwards to <button>", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("CardContainer forwards to its <div>", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CardContainer ref={ref}>Body</CardContainer>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("interaction: components behave", () => {
  it("Button fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("GettingStartedPill exposes expanded state and toggles via click", async () => {
    const onClick = vi.fn();
    render(<GettingStartedPill current={2} total={4} open={false} onClick={onClick} />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("InputBar submits trimmed value on Enter", async () => {
    const onSubmit = vi.fn();
    function Harness() {
      return <InputBar aria-label="Message" value="  hi  " onValueChange={() => {}} onSubmit={onSubmit} />;
    }
    render(<Harness />);
    const textarea = screen.getByRole("textbox", { name: "Message" });
    textarea.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hi");
  });

  it("ToolCall toggles its details panel", async () => {
    render(
      <ToolCall toolCall={{ id: "1", name: "search", status: "running", args: { q: "x" } }} />,
    );
    const toggle = screen.getByRole("button", { expanded: false });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
