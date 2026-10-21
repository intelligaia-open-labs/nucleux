import type { ReactElement } from "react";
import { Home, Mic } from "lucide-react";

import {
  AiIcons,
  AiIcon,
  AiColor,
  AiColorHighlight,
  Iconography,
  AgentAvatar,
  AgentName,
  ExampleGallery,
  Nudge,
  Disclaimer,
  InitialCta,
  ProactiveSuggestion,
  Randomize,
  Autocomplete,
  Attachments,
  AttachmentsTray,
  AttachmentsTrigger,
  McpConnection,
  McpConnectionTools,
  VisualInput,
  HandwritingInput,
  GestureInput,
  Md3ButtonGroup,
  Md3ButtonGroupItem,
  Md3SplitButton,
  Md3Toolbar,
  Md3ToolbarIconButton,
  Md3FabMenu,
  Md3FabMenuItem,
  Md3LoadingIndicator,
  Md3SideSheet,
  Md3SideSheetHeader,
  Md3SideSheetBody,
  Md3SideSheetActions,
  Md3Carousel,
  Md3CarouselItem,
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
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
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
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  DirectionProvider,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Kbd,
  KbdGroup,
  Marker,
  MarkerContent,
  MarkerIcon,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  Spinner,
  Toaster,
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Caveat,
  Disclosure,
  Attachment,
  AttachmentGroup,
  Connector,
  KnowledgeBase,
  ModelSelection,
  Templates,
  StructuredInput,
  VoiceInput,
  Personality,
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
  CodeBlock,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  OpenInput,
  Message,
  Consent,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  NativeSelect,
  Separator,
  Sheet,
  SheetBody,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarSeparator,
  SuggestedPrompt,
  SuggestedPrompts,
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
  MessageScroller,
  Toast,
  Tooltip,
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
  Md3AgentComposer,
  Md3ActionConfirmation,
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

/**
 * One render case per component: used by the smoke/a11y/ref tests and, via
 * packages/mcp/gen/fixtures.tsx, by the MCP server's HTML snippets.
 */
export const cases: { name: string; ui: ReactElement }[] = [
  { name: "Avatar", ui: <Avatar name="Eric Idle" /> },
  { name: "Personality", ui: <Personality defaultValue="professional" onValueChange={() => {}} /> },
  {
    name: "Attachment",
    ui: (
      <AttachmentGroup>
        <Attachment name="Playbook.pdf" meta="PDF · 240 KB" onRemove={() => {}} />
      </AttachmentGroup>
    ),
  },
  {
    name: "ModelSelection",
    ui: (
      <ModelSelection
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
    name: "Connector",
    ui: <Connector name="GitHub" description="Read issues and code" onConnect={() => {}} />,
  },
  {
    name: "KnowledgeBase",
    ui: (
      <KnowledgeBase
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
    name: "Templates",
    ui: (
      <Templates
        onComplete={() => {}}
        segments={["Email ", { slot: "company", placeholder: "Company" }, " about renewals."]}
      />
    ),
  },
  { name: "Disclosure", ui: <Disclosure variant="banner" /> },
  {
    name: "DropdownMenu",
    ui: (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Task</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    name: "Empty",
    ui: (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Home />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>Create a project to start tracking tasks.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>New project</Button>
        </EmptyContent>
      </Empty>
    ),
  },
  { name: "Button (link, asChild)", ui: <Button variant="link" asChild><a href="/docs">Docs</a></Button> },
  { name: "Caveat", ui: <Caveat /> },
  { name: "Badge", ui: <Badge>New</Badge> },
  { name: "Button", ui: <Button>Save</Button> },
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
  {
    name: "Sidebar",
    ui: (
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>Acme</SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive tooltip="Home">
                      <a href="#home">
                        <Home />
                        <span>Home</span>
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <SidebarTrigger />
        </SidebarInset>
      </SidebarProvider>
    ),
  },
  {
    name: "Select",
    ui: (
      <Select defaultValue="b" open>
        <SelectTrigger aria-label="Model">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Models</SelectLabel>
            <SelectItem value="a">Alpha</SelectItem>
            <SelectItem value="b">Beta</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="c" disabled>
            Gamma
          </SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  { name: "Sonner", ui: <Toaster /> },
  {
    name: "AiIcons",
    ui: (
      <div>
        <AiIcons variant="sparkle" label="AI" />
        <AiIcons variant="thinking-orb" />
        <AiIcon role="ai-action" label="Rewrite" />
        <AiIcon role="agent-working" label="Rewriting release note…" />
      </div>
    ),
  },
  {
    name: "AiColor",
    ui: (
      <AiColor variant="background-tint" label="Aria suggests">
        Follow up with <AiColorHighlight>Acme Corp</AiColorHighlight>.
      </AiColor>
    ),
  },
  { name: "Iconography", ui: <Iconography label="Generate" agentName="Aria" iconOnly /> },
  { name: "AgentAvatar", ui: <AgentAvatar name="Aria" status="online" statusLabel="Online · ready" /> },
  { name: "AgentName", ui: <AgentName name="Aria" variant="name-status" status="drafting" /> },
  {
    name: "ExampleGallery",
    ui: (
      <ExampleGallery
        examples={[
          { title: "Summarise renewal risks", description: "Which accounts need attention this week", prompt: "Summarise the renewal risks across my accounts this week." },
          { title: "Draft outreach email", prompt: "Draft a follow-up email to Acme Corp about their renewal." },
        ]}
      />
    ),
  },
  { name: "Nudge", ui: <Nudge message="Try uploading a PDF — Aria can summarise it in seconds." onTry={() => {}} persist="none" /> },
  {
    name: "Disclaimer",
    ui: <Disclaimer agentName="Aria" items={["Summarise documents and threads", "Draft replies and emails", "Pull from connected sources"]} cutoff="Apr 2026" />,
  },
  {
    name: "InitialCta",
    ui: <InitialCta aria-label="Message Aria" suggestions={["Summarise renewal risks", "Draft a follow-up"]} onSubmit={() => {}} />,
  },
  {
    name: "ProactiveSuggestion",
    ui: <ProactiveSuggestion agentName="Aria" title="Three renewals expire this week" description="Want Aria to draft outreach for each?" actionLabel="Draft emails" persist="none" />,
  },
  { name: "Randomize", ui: <Randomize variant="random-card" prompts={["Draft a one-paragraph product brief."]} onSelect={() => {}} /> },
  {
    name: "Autocomplete",
    ui: <Autocomplete label="Prompt" defaultValue="Thanks for the quick turnaround on the deck." suggestion=" I've shared it with the team." />,
  },
  {
    name: "Attachments",
    ui: (
      <Attachments
        onRemove={() => {}}
        onRetry={() => {}}
        items={[
          { id: "1", name: "Q2-renewals.csv", size: 49152, type: "text/csv", status: "ready" },
          { id: "2", name: "deck.pdf", size: 4200000, type: "application/pdf", status: "uploading", progress: 40 },
        ]}
      >
        <AttachmentsTray />
        <AttachmentsTrigger />
      </Attachments>
    ),
  },
  {
    name: "McpConnection",
    ui: (
      <McpConnection name="Linear MCP" address="https://mcp.linear.app/sse" status="connected" scopes={["Read issues"]} onDisconnect={() => {}}>
        <McpConnectionTools tools={[{ id: "read_issue", title: "Read issue", risk: "read" }]} onToolEnabledChange={() => {}} />
      </McpConnection>
    ),
  },
  { name: "VisualInput", ui: <VisualInput variant="drag-drop" /> },
  { name: "HandwritingInput", ui: <HandwritingInput defaultMode="type" /> },
  {
    name: "GestureInput",
    ui: (
      <GestureInput variant="swipe-action" actions={[{ gesture: "swipe-left", label: "Summarise" }]}>
        <div>Slack thread: #renewals</div>
      </GestureInput>
    ),
  },
  {
    name: "Md3ButtonGroup",
    ui: (
      <Md3ButtonGroup aria-label="Time range" variant="connected" selectionMode="single" defaultValue="week">
        <Md3ButtonGroupItem value="day">Day</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="week">Week</Md3ButtonGroupItem>
        <Md3ButtonGroupItem value="month">Month</Md3ButtonGroupItem>
      </Md3ButtonGroup>
    ),
  },
  {
    name: "Md3SplitButton",
    ui: (
      <Md3SplitButton
        icon={<Home />}
        menuLabel="More save options"
        defaultOpen
        menu={
          <>
            <Md3MenuItem>Save a copy</Md3MenuItem>
            <Md3MenuItem>Export as PDF</Md3MenuItem>
          </>
        }
      >
        Save
      </Md3SplitButton>
    ),
  },
  {
    name: "Md3Toolbar",
    ui: (
      <Md3Toolbar type="floating" color="vibrant" aria-label="Text formatting">
        <Md3ToolbarIconButton aria-label="Bold" selected>
          <Home />
        </Md3ToolbarIconButton>
        <Md3ToolbarIconButton aria-label="Italic">
          <Mic />
        </Md3ToolbarIconButton>
      </Md3Toolbar>
    ),
  },
  {
    name: "Md3FabMenu",
    ui: (
      <Md3FabMenu label="Create" icon={<Home />} defaultOpen>
        <Md3FabMenuItem icon={<Mic />}>Document</Md3FabMenuItem>
        <Md3FabMenuItem icon={<Home />}>Image</Md3FabMenuItem>
      </Md3FabMenu>
    ),
  },
  {
    name: "Md3LoadingIndicator",
    ui: (
      <div>
        <Md3LoadingIndicator aria-label="Loading messages" />
        <Md3LoadingIndicator variant="contained" aria-label="Generating a reply" />
      </div>
    ),
  },
  {
    name: "Md3SideSheet",
    ui: (
      <Md3SideSheet divider>
        <Md3SideSheetHeader onBack={() => {}}>Filters</Md3SideSheetHeader>
        <Md3SideSheetBody>Narrow the product list.</Md3SideSheetBody>
        <Md3SideSheetActions>
          <button type="button">Apply</button>
        </Md3SideSheetActions>
      </Md3SideSheet>
    ),
  },
  {
    name: "Md3Carousel",
    ui: (
      <Md3Carousel aria-label="Destinations" layout="multi-browse">
        <Md3CarouselItem label="Lisbon" />
        <Md3CarouselItem label="Kyoto" />
        <Md3CarouselItem label="Oaxaca" />
      </Md3Carousel>
    ),
  },
  {
    name: "Drawer",
    ui: (
      <Drawer>
        <DrawerTrigger>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Agent budget</DrawerTitle>
            <DrawerDescription>Set how many tool calls the agent may make.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ),
  },
  {
    name: "Questionnaire",
    ui: (
      <Questionnaire shortcuts="letters">
        <QuestionnaireProgress />
        <QuestionnaireItem name="direction" required>
          <QuestionnaireTitle>What should we prototype next?</QuestionnaireTitle>
          <QuestionnaireDescription>Choose one direction.</QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="delegation">
              Sub-agent delegation
              <QuestionnaireChoiceDescription>Show delegated work.</QuestionnaireChoiceDescription>
            </QuestionnaireChoice>
            <QuestionnaireChoice value="questions">Question prompts</QuestionnaireChoice>
            <QuestionnaireInput aria-label="Another direction" placeholder="Type another direction…" />
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip />
          <QuestionnaireNext />
          <QuestionnaireSubmit />
        </QuestionnaireActions>
      </Questionnaire>
    ),
  },
  { name: "Kbd", ui: <KbdGroup><Kbd>Ctrl</Kbd><span>+</span><Kbd>K</Kbd></KbdGroup> },
  { name: "Spinner", ui: <Spinner /> },
  { name: "DirectionProvider", ui: <DirectionProvider dir="rtl"><p dir="rtl">مرحبا</p></DirectionProvider> },
  {
    name: "ButtonGroup",
    ui: (
      <ButtonGroup aria-label="Text formatting">
        <ButtonGroupText>Style</ButtonGroupText>
        <Button variant="secondary">Bold</Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">Italic</Button>
      </ButtonGroup>
    ),
  },
  {
    name: "Item",
    ui: (
      <ItemGroup>
        <Item variant="outline">
          <ItemHeader>Header</ItemHeader>
          <ItemMedia variant="icon">
            <Home />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Security alert</ItemTitle>
            <ItemDescription>New sign-in from Berlin.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="secondary">
              Review
            </Button>
          </ItemActions>
          <ItemFooter>Footer</ItemFooter>
        </Item>
        <ItemSeparator />
        <Item asChild size="sm">
          <a href="#x">Link item</a>
        </Item>
      </ItemGroup>
    ),
  },
  {
    name: "Marker",
    ui: (
      <Marker variant="separator">
        <MarkerIcon>
          <Home />
        </MarkerIcon>
        <MarkerContent>Yesterday</MarkerContent>
      </Marker>
    ),
  },
  {
    name: "Bubble",
    ui: (
      <BubbleGroup>
        <Bubble align="end">
          <BubbleContent>Hello there</BubbleContent>
          <BubbleReactions>
            <span role="img" aria-label="thumbs up">
              👍
            </span>
          </BubbleReactions>
        </Bubble>
        <Bubble variant="outline">
          <BubbleContent asChild>
            <button type="button">Clickable</button>
          </BubbleContent>
        </Bubble>
      </BubbleGroup>
    ),
  },
  {
    name: "Field",
    ui: (
      <FieldGroup>
        <Field data-invalid="true">
          <FieldLabel htmlFor="f-email">Email</FieldLabel>
          <Input id="f-email" aria-invalid="true" aria-describedby="f-email-err" />
          <FieldDescription>We never share it.</FieldDescription>
          <FieldError id="f-email-err" errors={[{ message: "Required" }]} />
        </Field>
        <FieldSeparator>Or</FieldSeparator>
      </FieldGroup>
    ),
  },
  {
    name: "InputGroup",
    ui: (
      <InputGroup>
        <InputGroupInput aria-label="Search" placeholder="Search…" />
        <InputGroupAddon>
          <Home />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupText>12 results</InputGroupText>
          <InputGroupButton size="icon-xs" aria-label="Copy">
            <Home />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    ),
  },
  {
    name: "Trace",
    ui: (
      <Trace>
        <TraceLine>
          <TraceIcon>
            <Home />
          </TraceIcon>
          <TraceTitle>Searched the web</TraceTitle>
          <TraceDescription>8 results</TraceDescription>
        </TraceLine>
        <TraceCollapsible defaultOpen>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceTitle>Read 3 files</TraceTitle>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>src/index.tsx</TraceCollapsibleContent>
        </TraceCollapsible>
        <TraceLine status="running">
          <TraceTitle>Drafting</TraceTitle>
        </TraceLine>
      </Trace>
    ),
  },
  { name: "CodeBlock", ui: <CodeBlock code="const x = 1;" language="ts" /> },
  {
    name: "OpenInput",
    ui: (
      <OpenInput aria-label="Message" value="" onValueChange={() => {}} onSubmit={() => {}} />
    ),
  },
  { name: "Message", ui: <Message role="assistant" content="Hi there" /> },
  {
    name: "MessageScroller",
    ui: (
      <MessageScroller>
        <Message role="user" content="Hello" />
        <Message role="assistant" content="Hi" />
      </MessageScroller>
    ),
  },
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
  { name: "SuggestedPrompts", ui: <SuggestedPrompts items={["Highlights", "Action items"]} /> },
  { name: "SuggestedPrompt", ui: <SuggestedPrompt>Show highlights</SuggestedPrompt> },
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
    name: "NativeSelect",
    ui: (
      <NativeSelect aria-label="Speed" defaultValue="a">
        <option value="a">Instant</option>
        <option value="b">Balanced</option>
      </NativeSelect>
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
    name: "Consent",
    ui: (
      <Consent
        title="Allow workspace access?"
        description="Choose what the assistant can access."
        permissions={[
          { id: "read", label: "Read files", description: "Attached files only", defaultChecked: true },
          { id: "act", label: "Run actions", description: "Ask before connecting tools" },
        ]}
      />
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
          <CommandGroup heading="SuggestedPrompts">
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
    name: "Md3AgentComposer",
    ui: <Md3AgentComposer value="" onValueChange={() => {}} onSubmit={() => {}} aria-label="Task" />,
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
