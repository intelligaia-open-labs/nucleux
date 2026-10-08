// NOTE: fixtures mirror the render cases in src/test/components.test.tsx. They
// drive the HTML-snippet generator (scripts/gen-html-snippets.mjs). Keep the two
// in sync when adding components.
import type { ReactElement } from "react";
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
  Md3Button,
  Md3Card,
  Md3Chip,
  Md3Fab,
  Md3IconButton,
  Md3Switch,
  Md3TextField,
  Md3Checkbox,
  Md3Radio,
  Md3RadioGroup,
  Md3Slider,
  Md3Tabs,
  Md3TabsList,
  Md3Tab,
  Md3TabPanel,
  Md3NavigationBar,
  Md3NavigationBarItem,
  Md3NavigationRail,
  Md3NavigationRailItem,
  Md3Menu,
  Md3MenuItem,
  Md3Dialog,
  Md3Snackbar,
  Md3List,
  Md3ListItem,
  Md3TopAppBar,
  Md3NavigationDrawer,
  Md3NavigationDrawerItem,
  Md3BottomSheet,
  Md3SegmentedButton,
  Md3SegmentedButtonItem,
  Md3Badge,
  Md3Tooltip,
  Md3LinearProgress,
  Md3CircularProgress,
  Md3Divider,
  Md3DatePicker,
  Md3TimePicker,
  Md3Search,
  Md3Banner,
  Md3Message,
  Md3ToolCall,
  Md3ActionPlan,
  Md3ActionPlanStep,
  Md3AgentComposer,
  Md3Reasoning,
  Md3AgentStep,
  Md3AgentSteps,
  Md3ActivityLog,
  Md3ActivityLogItem,
  Md3Thread,
  Md3ActionConfirmation,
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

export const cases: { name: string; ui: ReactElement }[] = [
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
        <Input id="nm" />
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
  { name: "Md3Button", ui: <Md3Button variant="filled">Save</Md3Button> },
  {
    name: "Md3IconButton",
    ui: (
      <Md3IconButton aria-label="Favorite">
        <Home />
      </Md3IconButton>
    ),
  },
  { name: "Md3Fab", ui: <Md3Fab icon={<Home />} aria-label="Add" /> },
  { name: "Md3TextField", ui: <Md3TextField label="Email" supportingText="Required" /> },
  { name: "Md3Card", ui: <Md3Card className="p-4">Card body</Md3Card> },
  {
    name: "Md3Chip",
    ui: (
      <div className="flex gap-2">
        <Md3Chip variant="assist">Assist</Md3Chip>
        <Md3Chip variant="filter" selected>
          Filter
        </Md3Chip>
        <Md3Chip variant="input" onRemove={() => {}}>
          Input
        </Md3Chip>
      </div>
    ),
  },
  { name: "Md3Switch", ui: <Md3Switch defaultChecked aria-label="Wi-Fi" /> },
  { name: "Md3Checkbox", ui: <Md3Checkbox defaultChecked aria-label="Accept" /> },
  {
    name: "Md3Radio",
    ui: (
      <Md3RadioGroup defaultValue="a" label="Choice">
        <Md3Radio value="a" aria-label="A" />
        <Md3Radio value="b" aria-label="B" />
      </Md3RadioGroup>
    ),
  },
  { name: "Md3Slider", ui: <Md3Slider defaultValue={50} aria-label="Level" /> },
  {
    name: "Md3Tabs",
    ui: (
      <Md3Tabs defaultValue="a">
        <Md3TabsList>
          <Md3Tab value="a">A</Md3Tab>
          <Md3Tab value="b">B</Md3Tab>
        </Md3TabsList>
        <Md3TabPanel value="a">Panel A</Md3TabPanel>
        <Md3TabPanel value="b">Panel B</Md3TabPanel>
      </Md3Tabs>
    ),
  },
  {
    name: "Md3NavigationBar",
    ui: (
      <Md3NavigationBar defaultValue="home">
        <Md3NavigationBarItem value="home" icon={<Home />} label="Home" />
        <Md3NavigationBarItem value="search" icon={<Mic />} label="Search" />
      </Md3NavigationBar>
    ),
  },
  {
    name: "Md3NavigationRail",
    ui: (
      <Md3NavigationRail defaultValue="home">
        <Md3NavigationRailItem value="home" icon={<Home />} label="Home" />
        <Md3NavigationRailItem value="search" icon={<Mic />} label="Search" />
      </Md3NavigationRail>
    ),
  },
  {
    name: "Md3Menu",
    ui: (
      <Md3Menu>
        <Md3MenuItem>New</Md3MenuItem>
        <Md3MenuItem>Open</Md3MenuItem>
      </Md3Menu>
    ),
  },
  {
    name: "Md3Dialog",
    ui: (
      <Md3Dialog open onOpenChange={() => {}} headline="Reset settings?">
        This will restore defaults.
      </Md3Dialog>
    ),
  },
  { name: "Md3Snackbar", ui: <Md3Snackbar open message="Message archived" action="Undo" onAction={() => {}} /> },
  {
    name: "Md3List",
    ui: (
      <Md3List>
        <Md3ListItem headline="Primary" supportingText="24 new" />
        <Md3ListItem headline="Starred" supportingText="3 items" trailing="3" />
      </Md3List>
    ),
  },
  { name: "Md3TopAppBar", ui: <Md3TopAppBar headline="Inbox" /> },
  {
    name: "Md3NavigationDrawer",
    ui: (
      <Md3NavigationDrawer defaultValue="inbox">
        <Md3NavigationDrawerItem value="inbox" icon={<Home />}>
          Inbox
        </Md3NavigationDrawerItem>
        <Md3NavigationDrawerItem value="sent" icon={<Mic />}>
          Sent
        </Md3NavigationDrawerItem>
      </Md3NavigationDrawer>
    ),
  },
  {
    name: "Md3BottomSheet",
    ui: (
      <Md3BottomSheet open onOpenChange={() => {}} aria-label="Share options">
        Sheet body
      </Md3BottomSheet>
    ),
  },
  {
    name: "Md3SegmentedButton",
    ui: (
      <Md3SegmentedButton type="single" defaultValue="week">
        <Md3SegmentedButtonItem value="day">Day</Md3SegmentedButtonItem>
        <Md3SegmentedButtonItem value="week">Week</Md3SegmentedButtonItem>
      </Md3SegmentedButton>
    ),
  },
  {
    name: "Md3Badge",
    ui: (
      <Md3Badge content={8}>
        <span>Inbox</span>
      </Md3Badge>
    ),
  },
  {
    name: "Md3Tooltip",
    ui: (
      <Md3Tooltip content="Info">
        <button type="button">Trigger</button>
      </Md3Tooltip>
    ),
  },
  { name: "Md3LinearProgress", ui: <Md3LinearProgress value={60} aria-label="Upload" /> },
  { name: "Md3CircularProgress", ui: <Md3CircularProgress value={60} aria-label="Sync" /> },
  { name: "Md3Divider", ui: <Md3Divider /> },
  { name: "Md3DatePicker", ui: <Md3DatePicker label="Date" /> },
  { name: "Md3TimePicker", ui: <Md3TimePicker /> },
  { name: "Md3Search", ui: <Md3Search aria-label="Search" /> },
  { name: "Md3Banner", ui: <Md3Banner>Update available</Md3Banner> },
  { name: "Md3Message", ui: <Md3Message role="assistant" content="Hi there" /> },
  {
    name: "Md3ToolCall",
    ui: (
      <Md3ToolCall
        defaultOpen
        toolCall={{ id: "1", name: "search", status: "success", args: { q: "x" }, result: "ok" }}
      />
    ),
  },
  {
    name: "Md3ActionPlan",
    ui: (
      <Md3ActionPlan onAccept={() => {}} onReject={() => {}}>
        <Md3ActionPlanStep title="Pull accounts" />
        <Md3ActionPlanStep title="Draft emails" />
      </Md3ActionPlan>
    ),
  },
  {
    name: "Md3AgentComposer",
    ui: <Md3AgentComposer value="" onValueChange={() => {}} onSubmit={() => {}} aria-label="Task" />,
  },
  { name: "Md3Reasoning", ui: <Md3Reasoning content="thinking…" defaultOpen /> },
  {
    name: "Md3AgentSteps",
    ui: (
      <Md3AgentSteps>
        <Md3AgentStep status="done" title="Read doc" />
        <Md3AgentStep status="active" title="Executing" progress={60} />
        <Md3AgentStep status="pending" title="Create file" />
      </Md3AgentSteps>
    ),
  },
  {
    name: "Md3ActivityLog",
    ui: (
      <Md3ActivityLog heading="Footprints">
        <Md3ActivityLogItem time="2m ago">Sent email to Sam</Md3ActivityLogItem>
        <Md3ActivityLogItem time="3m ago">Read 3 CRM records</Md3ActivityLogItem>
      </Md3ActivityLog>
    ),
  },
  {
    name: "Md3Thread",
    ui: (
      <Md3Thread>
        <Md3Message role="user" content="Hello" />
        <Md3Message role="assistant" content="Hi" />
      </Md3Thread>
    ),
  },
  {
    name: "Md3ActionConfirmation",
    ui: (
      <Md3ActionConfirmation
        title="Send 18 emails?"
        description="You can't undo this."
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    ),
  },
];

