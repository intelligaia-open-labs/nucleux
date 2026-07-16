import { createRef, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Home, Mic } from "lucide-react";

import {
  ActionTile,
  Alert,
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
  Checkbox,
  Checklist,
  ChecklistItem,
  Chip,
  CodeBlock,
  GettingStartedPill,
  GlobalNav,
  IconButton,
  InputBar,
  LinkButton,
  Menu,
  MenuItem,
  MenuSeparator,
  Message,
  Reasoning,
  RichCheckboxGroup,
  RichCheckboxOption,
  SearchInput,
  Separator,
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  StreamingText,
  SuggestionChip,
  Suggestions,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Thread,
  ToolCall,
  Tooltip,
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
  { name: "Chip", ui: <Chip dot>Design</Chip> },
  { name: "Chip (removable)", ui: <Chip onRemove={() => {}}>React</Chip> },
  { name: "Alert", ui: <Alert variant="info" title="Heads up">Body text</Alert> },
  { name: "Switch", ui: <Switch defaultChecked aria-label="Toggle" /> },
  { name: "Separator", ui: <Separator /> },
  {
    name: "Tooltip",
    ui: (
      <Tooltip content="Ask Nebula">
        <Button>Trigger</Button>
      </Tooltip>
    ),
  },
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
  { name: "LinkButton", ui: <LinkButton href="#">Learn more</LinkButton> },
  { name: "Checkbox", ui: <Checkbox defaultChecked aria-label="Accept" /> },
  {
    name: "Tabs",
    ui: (
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>
    ),
  },
  {
    name: "Menu",
    ui: (
      <Menu>
        <MenuItem>Try again</MenuItem>
        <MenuSeparator />
        <MenuItem>Delete</MenuItem>
      </Menu>
    ),
  },
  { name: "Suggestions", ui: <Suggestions items={["Highlights", "Action items"]} /> },
  { name: "SuggestionChip", ui: <SuggestionChip>Show highlights</SuggestionChip> },
  {
    name: "RichCheckboxGroup",
    ui: (
      <RichCheckboxGroup label="Include">
        <RichCheckboxOption label="Summary" description="AI summary" defaultChecked />
        <RichCheckboxOption label="Transcript" description="Full text" />
      </RichCheckboxGroup>
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

  it("Switch toggles checked state and fires onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Toggle" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("Checkbox toggles checked state", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("Tabs switches the active panel on trigger click", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel A</TabsContent>
        <TabsContent value="b">Panel B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("Panel B")).toBeInTheDocument();
    expect(screen.queryByText("Panel A")).not.toBeInTheDocument();
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
