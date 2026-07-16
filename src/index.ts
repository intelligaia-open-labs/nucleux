// Nucleux — agentic UI components for React.
// Import the stylesheet once in your app: `import "nucleux/styles.css";`

// Components
export { Avatar, type AvatarProps } from "./components/avatar";
export {
  CardContainer,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardDivider,
  type CardContainerProps,
} from "./components/card";
export { Badge, type BadgeProps, type BadgeVariant } from "./components/badge";
export { Chip, type ChipProps } from "./components/chip";
export { Alert, type AlertProps, type AlertVariant } from "./components/alert";
export { Switch, type SwitchProps, type SwitchSize } from "./components/switch";
export { Separator, type SeparatorProps } from "./components/separator";
export { Tooltip, type TooltipProps, type TooltipSide } from "./components/tooltip";
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./components/button";
export {
  IconButton,
  type IconButtonProps,
  type IconButtonVariant,
  type IconButtonSize,
} from "./components/icon-button";
export { LinkButton, type LinkButtonProps } from "./components/link-button";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from "./components/tabs";
export {
  Menu,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  type MenuItemProps,
} from "./components/menu";
export {
  Suggestions,
  SuggestionChip,
  type SuggestionsProps,
} from "./components/suggestions";
export {
  RichCheckboxGroup,
  RichCheckboxOption,
  type RichCheckboxGroupProps,
  type RichCheckboxOptionProps,
} from "./components/rich-checkbox-group";
export {
  RadioGroup,
  Radio,
  type RadioGroupProps,
  type RadioProps,
} from "./components/radio-group";
export { Select, type SelectProps } from "./components/select";
export {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  type DialogProps,
} from "./components/dialog";
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./components/table";
export { SearchInput, type SearchInputProps } from "./components/search-input";
export { GlobalNav, type GlobalNavProps } from "./components/global-nav";
export {
  Sidebar,
  SidebarItem,
  SidebarSeparator,
  type SidebarProps,
  type SidebarItemProps,
} from "./components/sidebar";
export { ActionTile, type ActionTileProps } from "./components/action-tile";
export {
  GettingStartedPill,
  type GettingStartedPillProps,
} from "./components/getting-started-pill";
export {
  ModularConsent,
  type ModularConsentProps,
  type ConsentPermission,
} from "./components/modular-consent";
export { AgentComposer, type AgentComposerProps } from "./components/agent-composer";
export {
  NavPanel,
  NavPanelHeader,
  NavSection,
  NavItem,
  type NavPanelHeaderProps,
  type NavSectionProps,
  type NavItemProps,
} from "./components/nav-panel";
export {
  Checklist,
  ChecklistItem,
  type ChecklistProps,
  type ChecklistItemProps,
} from "./components/checklist";
export { Message, type MessageProps } from "./components/message";
export { Thread, type ThreadProps } from "./components/thread";
export { StreamingText, type StreamingTextProps } from "./components/streaming-text";
export { TypingIndicator, type TypingIndicatorProps } from "./components/typing-indicator";
export { ToolCall, type ToolCallProps } from "./components/tool-call";
export { Reasoning, type ReasoningProps } from "./components/reasoning";
export { CodeBlock, type CodeBlockProps } from "./components/code-block";
export { InputBar, type InputBarProps } from "./components/input-bar";

// Hooks
export { useAutoScroll, type UseAutoScrollOptions } from "./hooks/use-auto-scroll";
export {
  useCopyToClipboard,
  type UseCopyToClipboardOptions,
} from "./hooks/use-copy-to-clipboard";

// Utilities
export { cn } from "./lib/utils";

// Types
export type {
  MessageRole,
  ToolCallStatus,
  ToolCall as ToolCallData,
  ChatMessage,
} from "./lib/types";
