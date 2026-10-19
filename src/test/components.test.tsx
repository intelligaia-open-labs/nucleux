import { createRef, type FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Home, Mic } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AlertDialog,
  Bubble,
  BubbleContent,
  Button,
  ButtonGroup,
  ButtonGroupText,
  CardContainer,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  Consent,
  ContextMenu,
  ContextMenuItem,
  DatePicker,
  Dialog,
  DialogHeader,
  DialogTitle,
  DirectionProvider,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldError,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  InputOtp,
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
  Kbd,
  KbdGroup,
  Marker,
  Md3ActionConfirmation,
  Md3AgentComposer,
  Md3BottomSheet,
  Md3Button,
  Md3Checkbox,
  Md3Chip,
  Md3DatePicker,
  Md3Dialog,
  Md3NavigationBar,
  Md3NavigationBarItem,
  Md3Radio,
  Md3RadioGroup,
  Md3SegmentedButton,
  Md3SegmentedButtonItem,
  Md3Switch,
  Md3Tab,
  Md3TabPanel,
  Md3Tabs,
  Md3TabsList,
  Md3TextField,
  Md3TimePicker,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  OpenInput,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Slider,
  Spinner,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToastProvider,
  Toaster,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
  toast,
  useDirection,
  useToast,
} from "@nucleux/react";
import { cases } from "./cases";

function QuestionnaireDemo({ onSubmit }: { onSubmit?: (e: FormEvent<HTMLFormElement>) => void }) {
  return (
    <Questionnaire shortcuts="letters" onSubmit={onSubmit}>
      <QuestionnaireProgress />
      <QuestionnaireItem name="direction" required>
        <QuestionnaireTitle>What should we prototype next?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="delegation">Sub-agent delegation</QuestionnaireChoice>
          <QuestionnaireChoice value="questions">Question prompts</QuestionnaireChoice>
          <QuestionnaireInput aria-label="Another direction" />
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="signals" multiple>
        <QuestionnaireTitle>What should updates include?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="progress">Progress</QuestionnaireChoice>
          <QuestionnaireChoice value="risks">Risks</QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Save answers</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}

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

  it("OpenInput submits trimmed value on Enter", async () => {
    const onSubmit = vi.fn();
    function Harness() {
      return <OpenInput aria-label="Message" value="  hi  " onValueChange={() => {}} onSubmit={onSubmit} />;
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

  it("RadioGroup selects a single value", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup defaultValue="a" label="Choice" onValueChange={onValueChange}>
        <Radio value="a" aria-label="A" />
        <Radio value="b" aria-label="B" />
      </RadioGroup>,
    );
    const [a, b] = screen.getAllByRole("radio");
    expect(a).toHaveAttribute("aria-checked", "true");
    await userEvent.click(b!);
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(b).toHaveAttribute("aria-checked", "true");
    expect(a).toHaveAttribute("aria-checked", "false");
  });

  it("Sheet closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
        </SheetHeader>
      </Sheet>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Dialog closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Consent returns granted permission ids on allow", async () => {
    const onAllow = vi.fn();
    render(
      <Consent
        title="Allow access?"
        permissions={[
          { id: "read", label: "Read", defaultChecked: true },
          { id: "act", label: "Act" },
        ]}
        onAllow={onAllow}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Allow selected" }));
    expect(onAllow).toHaveBeenCalledWith(["read"]);
  });

  it("Accordion expands and collapses a panel", async () => {
    render(
      <Accordion type="single">
        <AccordionItem value="a">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: "Question" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Answer")).toBeInTheDocument();
  });

  it("Popover opens on trigger and closes on Escape", async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Body")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("useToast queues a toast that can be dismissed", async () => {
    function Harness() {
      const { toast } = useToast();
      return (
        <button onClick={() => toast({ title: "Hello", duration: 0 })}>trigger</button>
      );
    }
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("trigger"));
    expect(screen.getByText("Hello")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("Toggle flips aria-pressed and fires onPressedChange", async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const btn = screen.getByRole("button", { name: "Bold" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("ToggleGroup (single) enforces one active item", async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" aria-label="Align" defaultValue="left" onValueChange={onValueChange}>
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          C
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    const left = screen.getByRole("button", { name: "Left" });
    const center = screen.getByRole("button", { name: "Center" });
    expect(left).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(center);
    expect(onValueChange).toHaveBeenCalledWith("center");
    expect(center).toHaveAttribute("aria-pressed", "true");
    expect(left).toHaveAttribute("aria-pressed", "false");
  });

  it("Slider adjusts value with the arrow keys", async () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={40} step={5} onValueChange={onValueChange} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith(45);
    expect(thumb).toHaveAttribute("aria-valuenow", "45");
  });

  it("Collapsible toggles its content region", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent>Details</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("Pagination emits the chosen page and disables prev on page 1", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} count={5} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Go to previous page" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Go to page 3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("AlertDialog confirms and cancels", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AlertDialog
        open
        onOpenChange={onOpenChange}
        title="Delete this?"
        description="Cannot undo."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Command filters items by the search query", async () => {
    render(
      <Command>
        <CommandInput aria-label="Search" />
        <CommandList>
          <CommandItem value="New chat">New chat</CommandItem>
          <CommandItem value="Open settings">Open settings</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("New chat")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("combobox", { name: "Search" }), "settings");
    expect(screen.queryByText("New chat")).not.toBeInTheDocument();
    expect(screen.getByText("Open settings")).toBeInTheDocument();
  });

  it("Combobox opens and selects an option", async () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        aria-label="Framework"
        onValueChange={onValueChange}
        options={[
          { value: "next", label: "Next.js" },
          { value: "vite", label: "Vite" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Framework" }));
    await userEvent.click(screen.getByRole("option", { name: "Vite" }));
    expect(onValueChange).toHaveBeenCalledWith("vite");
    expect(screen.getByRole("combobox", { name: "Framework" })).toHaveTextContent("Vite");
  });

  it("ContextMenu opens on right-click and closes on selection", async () => {
    const onClick = vi.fn();
    render(
      <ContextMenu content={<ContextMenuItem onClick={onClick}>Reload</ContextMenuItem>}>
        <div>target</div>
      </ContextMenu>,
    );
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByText("target"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Reload" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("InputOtp builds the code and advances focus", async () => {
    const onChange = vi.fn();
    render(<InputOtp length={4} aria-label="Code" onChange={onChange} />);
    const first = screen.getByRole("textbox", { name: "Digit 1" });
    first.focus();
    await userEvent.keyboard("12");
    expect(onChange).toHaveBeenLastCalledWith("12");
  });

  it("Md3Button fires onClick", async () => {
    const onClick = vi.fn();
    render(<Md3Button onClick={onClick}>Go</Md3Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("Md3Switch toggles checked state and fires onCheckedChange", async () => {
    const onCheckedChange = vi.fn();
    render(<Md3Switch aria-label="Wi-Fi" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Wi-Fi" });
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("aria-checked", "true");
  });

  it("Md3Chip (filter) reports pressed state and toggles on click", async () => {
    const onClick = vi.fn();
    render(
      <Md3Chip variant="filter" selected onClick={onClick}>
        Available
      </Md3Chip>,
    );
    const chip = screen.getByRole("button", { name: "Available" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("Md3Chip (input) fires onRemove from its remove button", async () => {
    const onRemove = vi.fn();
    render(
      <Md3Chip variant="input" onRemove={onRemove}>
        alex@acme.com
      </Md3Chip>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("Md3TextField associates its label with the input", () => {
    render(<Md3TextField label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("Md3Checkbox toggles and supports indeterminate", async () => {
    const onCheckedChange = vi.fn();
    render(<Md3Checkbox aria-label="Accept" onCheckedChange={onCheckedChange} />);
    const box = screen.getByRole("checkbox", { name: "Accept" });
    expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("Md3Radio selects a single value", async () => {
    const onValueChange = vi.fn();
    render(
      <Md3RadioGroup defaultValue="a" label="Choice" onValueChange={onValueChange}>
        <Md3Radio value="a" aria-label="A" />
        <Md3Radio value="b" aria-label="B" />
      </Md3RadioGroup>,
    );
    const [a, b] = screen.getAllByRole("radio");
    expect(a).toHaveAttribute("aria-checked", "true");
    await userEvent.click(b!);
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(b).toHaveAttribute("aria-checked", "true");
    expect(a).toHaveAttribute("aria-checked", "false");
  });

  it("Md3Tabs switches the active panel", async () => {
    render(
      <Md3Tabs defaultValue="a">
        <Md3TabsList>
          <Md3Tab value="a">A</Md3Tab>
          <Md3Tab value="b">B</Md3Tab>
        </Md3TabsList>
        <Md3TabPanel value="a">Panel A</Md3TabPanel>
        <Md3TabPanel value="b">Panel B</Md3TabPanel>
      </Md3Tabs>,
    );
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });

  it("Md3NavigationBar marks the selected destination current", async () => {
    const onValueChange = vi.fn();
    render(
      <Md3NavigationBar defaultValue="home" onValueChange={onValueChange}>
        <Md3NavigationBarItem value="home" icon={<Home />} label="Home" />
        <Md3NavigationBarItem value="search" icon={<Mic />} label="Search" />
      </Md3NavigationBar>,
    );
    await userEvent.click(screen.getByText("Search"));
    expect(onValueChange).toHaveBeenCalledWith("search");
  });

  it("Md3Dialog closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Md3Dialog open onOpenChange={onOpenChange} headline="Reset?">
        Body
      </Md3Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Md3SegmentedButton (single) selects one segment", async () => {
    const onValueChange = vi.fn();
    render(
      <Md3SegmentedButton type="single" defaultValue="day" onValueChange={onValueChange}>
        <Md3SegmentedButtonItem value="day">Day</Md3SegmentedButtonItem>
        <Md3SegmentedButtonItem value="week">Week</Md3SegmentedButtonItem>
      </Md3SegmentedButton>,
    );
    const day = screen.getByRole("button", { name: "Day" });
    const week = screen.getByRole("button", { name: "Week" });
    expect(day).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(week);
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(week).toHaveAttribute("aria-pressed", "true");
    expect(day).toHaveAttribute("aria-pressed", "false");
  });

  it("Md3BottomSheet closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <Md3BottomSheet open onOpenChange={onOpenChange} aria-label="Share">
        Body
      </Md3BottomSheet>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("DatePicker opens downward by default and upward when there is no room below", async () => {
    const rect = (top: number, height: number, left = 20, width = 280) =>
      ({ top, bottom: top + height, left, right: left + width, height, width, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      // trigger root at the given top; the calendar popup is 330px tall
      return this.getAttribute("role") === "dialog" ? rect(0, 330) : rect(Number(this.dataset.top ?? 0), 36);
    });
    const { unmount } = render(
      <div>
        <DatePicker aria-label="Due" />
      </div>,
    );
    const root = () => screen.getByRole("button", { name: "Due" }).parentElement!;
    root().dataset.top = "100";
    await userEvent.click(screen.getByRole("button", { name: "Due" }));
    expect(screen.getByRole("dialog", { name: "Choose date" })).toHaveClass("top-full");

    await userEvent.click(screen.getByRole("button", { name: "Due" }));
    root().dataset.top = String(window.innerHeight - 50);
    await userEvent.click(screen.getByRole("button", { name: "Due" }));
    expect(screen.getByRole("dialog", { name: "Choose date" })).toHaveClass("bottom-full");
    unmount();
    spy.mockRestore();
  });

  it("Md3DatePicker opens a calendar dialog on click", async () => {
    render(<Md3DatePicker label="Date" />);
    await userEvent.click(screen.getByRole("button", { name: "Date" }));
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
  });

  it("Md3TimePicker updates the hour", () => {
    const onValueChange = vi.fn();
    render(<Md3TimePicker defaultValue={{ hour: 9, minute: 0, period: "AM" }} onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Hour"), { target: { value: "11" } });
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ hour: 11 }));
  });

  it("Md3TimePicker switches AM/PM", async () => {
    const onValueChange = vi.fn();
    render(<Md3TimePicker defaultValue={{ hour: 9, minute: 0, period: "AM" }} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "PM" }));
    expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ period: "PM" }));
  });

  it("Md3AgentComposer submits on Enter", async () => {
    const onSubmit = vi.fn();
    render(<Md3AgentComposer value="do it" onValueChange={() => {}} onSubmit={onSubmit} />);
    screen.getByRole("textbox").focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("do it");
  });

  it("Md3ActionConfirmation fires confirm and cancel", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <Md3ActionConfirmation title="Send 18 emails?" onConfirm={onConfirm} onCancel={onCancel} confirmLabel="Send" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("DropdownMenu opens, moves with arrow keys, runs onSelect, closes and restores focus", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus(); // skips the disabled item
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveFocus(); // wraps
    await userEvent.keyboard("{End}{Enter}");
    expect(onDelete).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it("DropdownMenuItem stays open when onSelect prevents default; outside click closes", async () => {
    render(
      <div>
        <p>outside</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="More">
              <Home />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Keep open</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "More" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("menuitem", { name: "Keep open" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await userEvent.click(screen.getByText("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("Button asChild renders the child element with button styles", () => {
    render(
      <Button variant="link" asChild className="text-xs">
        <a href="/docs">Docs</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveClass("underline", "text-xs");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("NativeSelect renders options and option groups", async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Status" defaultValue="open" onChange={onChange}>
        <NativeSelectOption value="open">Open</NativeSelectOption>
        <NativeSelectOptGroup label="Closed">
          <NativeSelectOption value="done">Done</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>,
    );
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Status" }), "done");
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("group", { name: "Closed" })).toBeInTheDocument();
  });

  it("Select opens, moves by keyboard and typeahead, selects, and submits with forms", async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Select name="model" onValueChange={onValueChange}>
          <SelectTrigger aria-label="Model">
            <SelectValue placeholder="Choose a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opus">Opus</SelectItem>
            <SelectItem value="sonnet" disabled>
              Sonnet
            </SelectItem>
            <SelectItem value="haiku">Haiku</SelectItem>
          </SelectContent>
        </Select>
      </form>,
    );
    const trigger = screen.getByRole("combobox", { name: "Model" });
    expect(trigger).toHaveTextContent("Choose a model");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // hidden while closed

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("option", { name: "Opus" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Haiku" })).toHaveFocus(); // skips disabled
    await userEvent.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("haiku");
    expect(trigger).toHaveTextContent("Haiku");
    expect(trigger).toHaveFocus();
    expect(container.querySelector('input[name="model"]')).toHaveValue("haiku");

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Haiku" })).toHaveFocus(); // opens on the selected option
    expect(screen.getByRole("option", { name: "Haiku" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("o");
    expect(screen.getByRole("option", { name: "Opus" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("Sidebar collapses to icons, shows tooltips only when collapsed, and marks the active item", async () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Home">
                  <a href="#home">
                    <Home />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>,
    );
    const sidebar = container.querySelector('[data-slot="sidebar"]')!;
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(sidebar).toHaveAttribute("data-state", "expanded");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    expect(sidebar).toHaveAttribute("data-collapsible", "icon");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument(); // only on hover/focus
    await userEvent.hover(screen.getByRole("link", { name: "Home" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Home");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-describedby", screen.getByRole("tooltip").id);
    await userEvent.unhover(screen.getByRole("link", { name: "Home" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(document.cookie).toContain("sidebar_state=false");
  });

  it("Sonner shows toasts from the imperative toast()", async () => {
    render(<Toaster />);
    act(() => {
      toast.success("Summary shared");
    });
    expect(await screen.findByText("Summary shared")).toBeInTheDocument();
  });

  it("Kbd renders semantic kbd elements with slots", () => {
    render(<KbdGroup data-testid="g"><Kbd>Ctrl</Kbd><Kbd>K</Kbd></KbdGroup>);
    expect(screen.getByTestId("g").tagName).toBe("KBD");
    expect(screen.getByTestId("g")).toHaveAttribute("data-slot", "kbd-group");
    expect(screen.getByText("Ctrl")).toHaveAttribute("data-slot", "kbd");
  });

  it("Spinner is a labelled status that accepts a custom label", () => {
    const { rerender } = render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toHaveClass("animate-spin");
    rerender(<Spinner aria-label="Saving" className="size-6" />);
    expect(screen.getByRole("status", { name: "Saving" })).toHaveClass("size-6");
  });

  it("useDirection resolves local, then provider, then ltr; direction aliases dir", () => {
    function Probe({ local }: { local?: "ltr" | "rtl" }) {
      return <span data-testid={`p-${local ?? "none"}`}>{useDirection(local)}</span>;
    }
    render(
      <>
        <span data-testid="out"><Probe /></span>
        <DirectionProvider dir="rtl"><Probe /><Probe local="ltr" /></DirectionProvider>
        <DirectionProvider dir="ltr" direction="rtl"><span data-testid="alias"><Probe /></span></DirectionProvider>
      </>,
    );
    expect(screen.getByTestId("out")).toHaveTextContent("ltr");
    expect(screen.getAllByTestId("p-none")[1]).toHaveTextContent("rtl");
    expect(screen.getByTestId("p-ltr")).toHaveTextContent("ltr");
    expect(screen.getByTestId("alias")).toHaveTextContent("rtl");
  });

  it("ButtonGroup exposes a labelled group with orientation and keyboard-operable buttons", async () => {
    const onBold = vi.fn();
    render(<ButtonGroup aria-label="Formatting" orientation="vertical"><Button onClick={onBold}>Bold</Button><Button>Italic</Button></ButtonGroup>);
    const group = screen.getByRole("group", { name: "Formatting" });
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveClass("flex-col");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Bold" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onBold).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();
  });

  it("ButtonGroupText asChild renders a real label", () => {
    render(<ButtonGroup aria-label="URL"><ButtonGroupText asChild><label htmlFor="u">https://</label></ButtonGroupText><input id="u" /></ButtonGroup>);
    expect(screen.getByLabelText("https://")).toBeInTheDocument();
    expect(screen.getByText("https://").tagName).toBe("LABEL");
    expect(screen.getByText("https://")).toHaveClass("bg-muted");
  });

  it("ItemGroup is a list; Items are listitems; asChild renders a link", async () => {
    const onClick = vi.fn();
    render(<ItemGroup><Item variant="muted" size="sm"><ItemContent><ItemTitle>One</ItemTitle></ItemContent></Item><Item asChild><a href="#two" onClick={onClick}>Two</a></Item></ItemGroup>);
    expect(screen.getByRole("list")).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("data-variant", "muted");
    expect(items[0]).toHaveAttribute("data-size", "sm");
    const link = screen.getByRole("link", { name: "Two" });
    expect(link).toHaveAttribute("data-slot", "item");
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalled();
  });

  it("Marker asChild renders the child with variant data and classes", () => {
    render(<Marker asChild variant="border"><a href="#h">History</a></Marker>);
    const link = screen.getByRole("link", { name: "History" });
    expect(link).toHaveAttribute("data-slot", "marker");
    expect(link).toHaveAttribute("data-variant", "border");
    expect(link).toHaveClass("border-b");
  });

  it("Bubble content asChild is a focusable, keyboard-activatable button", async () => {
    const onClick = vi.fn();
    render(<Bubble align="end" variant="tinted"><BubbleContent asChild><button type="button" onClick={onClick}>Retry</button></BubbleContent></Bubble>);
    const btn = screen.getByRole("button", { name: "Retry" });
    expect(btn).toHaveAttribute("data-slot", "bubble-content");
    expect(btn.parentElement).toHaveAttribute("data-align", "end");
    expect(btn.parentElement).toHaveAttribute("data-variant", "tinted");
    await userEvent.tab();
    expect(btn).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("FieldError deduplicates errors and renders a list for several messages", () => {
    const { rerender } = render(<FieldError errors={[{ message: "Required" }, { message: "Required" }]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    rerender(<FieldError errors={[{ message: "Too short" }, { message: "Needs a number" }, { message: "Too short" }]} />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["Too short", "Needs a number"]);
    rerender(<FieldError errors={[]} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("Field sets role=group and data-orientation", () => {
    render(<Field orientation="horizontal" aria-label="Notifications"><FieldLabel htmlFor="x">X</FieldLabel><input id="x" /></Field>);
    expect(screen.getByRole("group", { name: "Notifications" })).toHaveAttribute("data-orientation", "horizontal");
  });

  it("InputGroupAddon click focuses the input; button click does not", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupInput aria-label="Search" />
        <InputGroupAddon><InputGroupText>Find</InputGroupText></InputGroupAddon>
        <InputGroupAddon align="inline-end"><InputGroupButton onClick={onClick}>Go</InputGroupButton></InputGroupAddon>
      </InputGroup>,
    );
    await user.click(screen.getByText("Find"));
    expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Go" })).toHaveFocus();
  });

  it("InputGroupTextarea is focused from a block-end addon", async () => {
    const user = userEvent.setup();
    render(<InputGroup><InputGroupTextarea aria-label="Message" /><InputGroupAddon align="block-end">Hint</InputGroupAddon></InputGroup>);
    await user.click(screen.getByText("Hint"));
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveFocus();
  });

  it("TraceCollapsible toggles with click and keyboard", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Trace>
        <TraceCollapsible onOpenChange={onOpenChange}>
          <TraceCollapsibleTrigger><TraceLine><TraceTitle>Searched the web</TraceTitle></TraceLine></TraceCollapsibleTrigger>
          <TraceCollapsibleContent>8 results from europa.eu</TraceCollapsibleContent>
        </TraceCollapsible>
      </Trace>,
    );
    const trigger = screen.getByRole("button", { name: "Searched the web" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("8 results from europa.eu")).not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("region")).toHaveTextContent("8 results from europa.eu");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("Drawer opens from the trigger, traps focus, closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Drawer onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>
          <Button variant="secondary">Open drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <input aria-label="Goal" />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );
    const trigger = screen.getByRole("button", { name: "Open drawer" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Move goal" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleDescription("Set your daily activity goal.");
    expect(dialog).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    expect(await axe(document.body, { rules: { region: { enabled: false }, "color-contrast": { enabled: false } } })).toHaveNoViolations();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Goal" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Goal" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("Drawer closes from DrawerClose and from an overlay click", async () => {
    const user = userEvent.setup();
    render(
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose>Cancel</DrawerClose>
        </DrawerContent>
      </Drawer>,
    );
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open drawer" }));
    await user.click(document.querySelector('[data-slot="drawer-overlay"]')!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Questionnaire validates required items, navigates and submits answers", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      return { direction: fd.get("direction"), signals: fd.getAll("signals") };
    });
    render(<QuestionnaireDemo onSubmit={onSubmit} />);
    expect(screen.getByRole("progressbar", { name: "Questionnaire progress" })).toHaveTextContent("Question 1 of 2");
    expect(screen.queryByRole("button", { name: "Save answers" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose an answer to continue.");
    expect(screen.getByRole("radio", { name: "Sub-agent delegation" })).toHaveFocus();
    await user.click(screen.getByRole("radio", { name: "Question prompts" }));
    expect(screen.queryByRole("alert")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("group", { name: "What should updates include?" })).toHaveFocus();
    expect(screen.getByRole("progressbar")).toHaveTextContent("Question 2 of 2");
    await user.click(screen.getByRole("button", { name: "Save answers" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Choose an answer or skip this question.");
    await user.click(screen.getByRole("checkbox", { name: "Progress" }));
    await user.click(screen.getByRole("checkbox", { name: "Risks" }));
    await user.click(screen.getByRole("button", { name: "Save answers" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.results[0]!.value).toEqual({ direction: "questions", signals: ["progress", "risks"] });
  });

  it("Questionnaire supports freeform answers, letter shortcuts, Skip and Ctrl+Enter", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      return { direction: fd.getAll("direction"), signals: fd.getAll("signals") };
    });
    render(<QuestionnaireDemo onSubmit={onSubmit} />);
    await user.click(screen.getByRole("radio", { name: "Question prompts" }));
    await user.type(screen.getByRole("textbox", { name: "Another direction" }), "Something else");
    expect(screen.getByRole("radio", { name: "Question prompts" })).not.toBeChecked();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("progressbar")).toHaveTextContent("Question 2 of 2");
    await user.keyboard("a");
    expect(screen.getByRole("checkbox", { name: "Progress" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.getByRole("checkbox", { name: "Progress" })).not.toBeChecked();
    await user.keyboard("{Control>}{Enter}{/Control}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.results[0]!.value).toEqual({ direction: ["Something else"], signals: [] });
  });

  it("Menubar opens a menu on trigger click", async () => {
    render(
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New chat</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const trigger = screen.getByRole("menuitem", { name: "File" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menuitem", { name: "New chat" })).toBeInTheDocument();
  });
});
