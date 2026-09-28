import { createRef, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Home, Mic } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ActionTile,
  ActionConfirmation,
  ActionPlan,
  ActionPlanStep,
  ActivityLog,
  ActivityLogItem,
  AgentStep,
  AgentSteps,
  AiCaveat,
  AiDisclosure,
  AttachmentTile,
  AttachmentTray,
  AudioMessage,
  CapabilityOverview,
  Citation,
  ConnectorCard,
  ErrorState,
  InlineFeedback,
  MemorySummary,
  PrivacyNotice,
  KnowledgeBasePicker,
  ModelSelector,
  PromptTemplate,
  StructuredInput,
  VoiceInput,
  PromptEnhancer,
  ResponseComparison,
  RewriteMenu,
  ToneSelector,
  ConfidenceIndicator,
  SessionRecap,
  SourceItem,
  SourceList,
  AgentComposer,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FollowUp,
  GettingStartedPill,
  GlobalNav,
  IconButton,
  InputBar,
  LinkButton,
  Menu,
  MenuItem,
  MenuSeparator,
  MediaCard,
  Message,
  ModularConsent,
  NavItem,
  NavPanel,
  NavPanelHeader,
  NavSection,
  PageHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  Reasoning,
  RelatedPatternCard,
  RelatedPatternsGrid,
  RichCheckboxGroup,
  RichCheckboxOption,
  RightSidebar,
  RightSidebarAnchor,
  RightSidebarLabel,
  RightSidebarMeta,
  SearchInput,
  Select,
  Separator,
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  StreamingText,
  SuggestionChip,
  Suggestions,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Thread,
  Toast,
  ToastProvider,
  ToolCall,
  Tooltip,
  TypingIndicator,
  AlertDialog,
  AspectRatio,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  HoverCard,
  Input,
  Label,
  Pagination,
  ScrollArea,
  Skeleton,
  Slider,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Combobox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ContextMenu,
  ContextMenuItem,
  InputOtp,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Calendar,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  DataTable,
  DatePicker,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useToast,
} from "@nucleux/react";
import { useForm } from "react-hook-form";

/**
 * Every exported component with a valid, minimal render. Drives the smoke +
 * accessibility checks below. Adding a component here is the single step needed
 * to bring it under end-to-end validation.
 */
function FormDemo() {
  const form = useForm<{ username: string }>({ defaultValues: { username: "" } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormDescription>Your public name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

const dataTableColumns = [
  { accessorKey: "id", header: "Invoice" },
  { accessorKey: "amount", header: "Amount" },
];
const dataTableRows = [
  { id: "INV-001", amount: 250 },
  { id: "INV-002", amount: 150 },
];

const cases: { name: string; ui: ReactElement }[] = [
  { name: "Avatar", ui: <Avatar name="Eric Idle" /> },
  { name: "Citation", ui: <Citation index={4} aria-label="Source 4" /> },
  {
    name: "SourceList",
    ui: (
      <SourceList heading="2 sources">
        <SourceItem index={1} title="Renewal Playbook" meta="PDF · Section 4.1" href="#" />
        <SourceItem index={2} title="MSA Template" meta="DOCX" onOpen={() => {}} />
      </SourceList>
    ),
  },
  {
    name: "ConfidenceIndicator",
    ui: <ConfidenceIndicator value={68} label="Overall confidence" note="Review recommended." />,
  },
  {
    name: "ActivityLog",
    ui: (
      <ActivityLog heading="Footprints">
        <ActivityLogItem time="2m ago">Sent email to Sam</ActivityLogItem>
        <ActivityLogItem time="3m ago">Read 3 CRM records</ActivityLogItem>
      </ActivityLog>
    ),
  },
  {
    name: "SessionRecap",
    ui: <SessionRecap>Aria sent 3 emails and created 1 issue.</SessionRecap>,
  },
  {
    name: "AgentSteps",
    ui: (
      <AgentSteps>
        <AgentStep status="done" title="Reading skill doc" />
        <AgentStep status="active" title="Executing command" progress={60} />
        <AgentStep status="pending" title="Creating file" />
      </AgentSteps>
    ),
  },
  {
    name: "ActionPlan",
    ui: (
      <ActionPlan heading="Proposed plan" onAccept={() => {}} onReject={() => {}}>
        <ActionPlanStep title="Pull renewing accounts" />
        <ActionPlanStep title="Draft emails" />
      </ActionPlan>
    ),
  },
  {
    name: "ActionConfirmation",
    ui: (
      <ActionConfirmation
        title="Send 18 emails?"
        description="You can't undo this."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ),
  },
  {
    name: "InlineFeedback",
    ui: <InlineFeedback onCopy={() => {}} onRegenerate={() => {}} />,
  },
  { name: "RewriteMenu", ui: <RewriteMenu label="Rewrite" onAction={() => {}} /> },
  { name: "ToneSelector", ui: <ToneSelector defaultValue="professional" onValueChange={() => {}} /> },
  {
    name: "ResponseComparison",
    ui: (
      <ResponseComparison
        onPrefer={() => {}}
        options={[
          { id: "a", content: "Response A text" },
          { id: "b", content: "Response B text" },
        ]}
      />
    ),
  },
  {
    name: "PromptEnhancer",
    ui: <PromptEnhancer suggestions={["Make it professional"]} onEnhance={() => {}} onSelect={() => {}} />,
  },
  {
    name: "AttachmentTile",
    ui: (
      <AttachmentTray>
        <AttachmentTile name="Playbook.pdf" meta="PDF · 240 KB" onRemove={() => {}} />
      </AttachmentTray>
    ),
  },
  {
    name: "ModelSelector",
    ui: (
      <ModelSelector
        defaultValue="a"
        onValueChange={() => {}}
        models={[
          { value: "a", label: "Instant", description: "Fastest" },
          { value: "b", label: "Pro", description: "Deepest" },
        ]}
      />
    ),
  },
  { name: "VoiceInput", ui: <VoiceInput state="recording" duration="0:12" onCancel={() => {}} onConfirm={() => {}} /> },
  {
    name: "StructuredInput",
    ui: (
      <StructuredInput
        question="Which audience is this for?"
        options={[
          { value: "execs", label: "Executives" },
          { value: "eng", label: "Engineers" },
        ]}
        onSubmit={() => {}}
        onSkip={() => {}}
      />
    ),
  },
  {
    name: "ConnectorCard",
    ui: <ConnectorCard name="GitHub" description="Read issues and code" onConnect={() => {}} />,
  },
  {
    name: "KnowledgeBasePicker",
    ui: (
      <KnowledgeBasePicker
        defaultValue={["a"]}
        onValueChange={() => {}}
        sources={[
          { id: "a", name: "CLAUDE.md", meta: "project guide" },
          { id: "b", name: "project.json", meta: "config" },
        ]}
      />
    ),
  },
  {
    name: "PromptTemplate",
    ui: (
      <PromptTemplate
        onComplete={() => {}}
        segments={["Email ", { slot: "company", placeholder: "Company" }, " about renewals."]}
      />
    ),
  },
  { name: "AiDisclosure", ui: <AiDisclosure variant="banner" /> },
  { name: "AiCaveat", ui: <AiCaveat /> },
  {
    name: "CapabilityOverview",
    ui: (
      <CapabilityOverview
        heading="Meet your assistant"
        sections={[
          { title: "Examples", items: ["Summarize a contract"] },
          { title: "Capabilities", items: ["Reads your files"] },
          { title: "Limits", items: ["May be wrong"] },
        ]}
      />
    ),
  },
  {
    name: "MemorySummary",
    ui: (
      <MemorySummary
        updatedAt="Updated 1 minute ago"
        onRefresh={() => {}}
        onAdd={() => {}}
        groups={[{ title: "About you", items: ["Prefers concise answers"] }]}
      />
    ),
  },
  { name: "PrivacyNotice", ui: <PrivacyNotice variant="incognito" /> },
  {
    name: "ErrorState",
    ui: (
      <ErrorState
        variant="error"
        title="Something went wrong"
        description="Your prompt didn't go through."
        actions={<button type="button">Retry</button>}
      />
    ),
  },
  { name: "AudioMessage", ui: <AudioMessage duration="0:42" onPlayToggle={() => {}} /> },
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
  {
    name: "RadioGroup",
    ui: (
      <RadioGroup defaultValue="a" label="Choice">
        <Radio value="a" aria-label="A" />
        <Radio value="b" aria-label="B" />
      </RadioGroup>
    ),
  },
  {
    name: "Select",
    ui: (
      <Select aria-label="Speed" defaultValue="a">
        <option value="a">Instant</option>
        <option value="b">Balanced</option>
      </Select>
    ),
  },
  {
    name: "Table",
    ui: (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Sync</TableCell>
            <TableCell>Done</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    name: "Dialog",
    ui: (
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader>
          <DialogTitle>Save this as memory?</DialogTitle>
          <DialogDescription>This can personalize future actions.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <span>Footer</span>
        </DialogFooter>
      </Dialog>
    ),
  },
  {
    name: "ModularConsent",
    ui: (
      <ModularConsent
        title="Allow workspace access?"
        description="Choose what the assistant can access."
        permissions={[
          { id: "read", label: "Read files", description: "Attached files only", defaultChecked: true },
          { id: "act", label: "Run actions", description: "Ask before connecting tools" },
        ]}
      />
    ),
  },
  {
    name: "AgentComposer",
    ui: <AgentComposer value="" onValueChange={() => {}} onSubmit={() => {}} aria-label="Task" />,
  },
  {
    name: "NavPanel",
    ui: (
      <NavPanel>
        <NavPanelHeader meta="84 patterns">Library</NavPanelHeader>
        <NavSection title="Onboarding" collapsible>
          <NavItem active>Disclosure</NavItem>
          <NavItem>Consent</NavItem>
        </NavSection>
      </NavPanel>
    ),
  },
  { name: "Progress", ui: <Progress value={60} aria-label="Upload progress" /> },
  {
    name: "Breadcrumb",
    ui: (
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Details</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>
    ),
  },
  {
    name: "Accordion",
    ui: (
      <Accordion type="single" defaultValue="a">
        <AccordionItem value="a">
          <AccordionTrigger>Question</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    name: "Popover",
    ui: (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    ),
  },
  { name: "Toast", ui: <Toast title="Saved" description="Done" variant="success" onClose={() => {}} /> },
  {
    name: "FollowUp",
    ui: (
      <FollowUp
        answer="Three deals are at risk this quarter."
        assumption={{ label: "Assumed:", value: "Q3", hint: "tap to change" }}
      />
    ),
  },
  {
    name: "Sheet",
    ui: (
      <Sheet open onOpenChange={() => {}} side="right">
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
        </SheetHeader>
        <SheetBody>Body</SheetBody>
        <SheetFooter>
          <span>Footer</span>
        </SheetFooter>
      </Sheet>
    ),
  },
  {
    name: "MediaCard",
    ui: <MediaCard title="Variant 1" description="A media card." image="/x.png" imageAlt="" />,
  },
  {
    name: "PageHeader",
    ui: <PageHeader title="Disclosure" description="A clear AI label." />,
  },
  {
    name: "RelatedPatternsGrid",
    ui: (
      <RelatedPatternsGrid>
        <RelatedPatternCard href="#" title="Consent" meta="Onboarding" />
        <RelatedPatternCard href="#" title="Caveat" meta="Onboarding" />
      </RelatedPatternsGrid>
    ),
  },
  {
    name: "RightSidebar",
    ui: (
      <RightSidebar>
        <RightSidebarLabel>On this page</RightSidebarLabel>
        <RightSidebarAnchor href="#a" active>
          Patterns
        </RightSidebarAnchor>
        <RightSidebarMeta label="Stage" value="Onboarding" />
      </RightSidebar>
    ),
  },
  {
    name: "Label",
    ui: (
      <>
        <Label htmlFor="nm">Name</Label>
        <input id="nm" />
      </>
    ),
  },
  { name: "Input", ui: <Input aria-label="Name" /> },
  { name: "Textarea", ui: <Textarea aria-label="Message" /> },
  { name: "Skeleton", ui: <Skeleton className="h-4 w-20" /> },
  { name: "Toggle", ui: <Toggle aria-label="Bold">B</Toggle> },
  {
    name: "ToggleGroup",
    ui: (
      <ToggleGroup type="single" aria-label="Alignment" defaultValue="left">
        <ToggleGroupItem value="left" aria-label="Left">
          L
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Center">
          C
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  { name: "Slider", ui: <Slider aria-label="Volume" defaultValue={40} /> },
  { name: "AspectRatio", ui: <AspectRatio ratio={16 / 9} className="w-40 bg-muted" /> },
  {
    name: "Collapsible",
    ui: (
      <Collapsible defaultOpen>
        <CollapsibleTrigger>More</CollapsibleTrigger>
        <CollapsibleContent>Details</CollapsibleContent>
      </Collapsible>
    ),
  },
  {
    name: "HoverCard",
    ui: (
      <HoverCard
        trigger={<button type="button">@n</button>}
        content={<span>Agentic UI components.</span>}
      />
    ),
  },
  {
    name: "ScrollArea",
    ui: (
      <ScrollArea className="h-24 w-40">
        <div className="text-sm">Scrollable content</div>
      </ScrollArea>
    ),
  },
  { name: "Pagination", ui: <Pagination page={1} count={5} onPageChange={() => {}} /> },
  {
    name: "AlertDialog",
    ui: (
      <AlertDialog
        open
        onOpenChange={() => {}}
        destructive
        title="Delete this?"
        description="This cannot be undone."
        confirmLabel="Delete"
      />
    ),
  },
  {
    name: "Command",
    ui: (
      <Command className="w-72">
        <CommandInput aria-label="Command search" />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Suggestions">
            <CommandItem value="New chat">New chat</CommandItem>
            <CommandItem value="Open settings">Open settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },
  {
    name: "Combobox",
    ui: (
      <Combobox
        aria-label="Framework"
        options={[
          { value: "next", label: "Next.js" },
          { value: "vite", label: "Vite" },
        ]}
      />
    ),
  },
  {
    name: "ContextMenu",
    ui: (
      <ContextMenu content={<ContextMenuItem>Reload</ContextMenuItem>}>
        <div>Right-click area</div>
      </ContextMenu>
    ),
  },
  { name: "InputOtp", ui: <InputOtp length={4} aria-label="Verification code" /> },
  {
    name: "Menubar",
    ui: (
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
  },
  {
    name: "NavigationMenu",
    ui: (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#">Composer</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Docs</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  {
    name: "Resizable",
    ui: (
      <ResizablePanelGroup className="h-40 w-80">
        <ResizablePanel>Left</ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>Right</ResizablePanel>
      </ResizablePanelGroup>
    ),
  },
  { name: "Calendar", ui: <Calendar mode="single" /> },
  { name: "DatePicker", ui: <DatePicker aria-label="Deadline" /> },
  {
    name: "Carousel",
    ui: (
      <Carousel className="w-64">
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ),
  },
  {
    name: "Chart",
    ui: (
      <ChartContainer config={{ desktop: { label: "Desktop", color: "hsl(var(--nx-info))" } }} className="w-64">
        <div>chart</div>
      </ChartContainer>
    ),
  },
  {
    name: "DataTable",
    ui: <DataTable columns={dataTableColumns} data={dataTableRows} pageSize={0} />,
  },
  { name: "Form", ui: <FormDemo /> },
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

  it("ModularConsent returns granted permission ids on allow", async () => {
    const onAllow = vi.fn();
    render(
      <ModularConsent
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

  it("AgentComposer submits on Enter", async () => {
    const onSubmit = vi.fn();
    render(<AgentComposer value="do it" onValueChange={() => {}} onSubmit={onSubmit} />);
    screen.getByRole("textbox").focus();
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("do it");
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

  it("ToolCall toggles its details panel", async () => {
    render(
      <ToolCall toolCall={{ id: "1", name: "search", status: "running", args: { q: "x" } }} />,
    );
    const toggle = screen.getByRole("button", { expanded: false });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
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
