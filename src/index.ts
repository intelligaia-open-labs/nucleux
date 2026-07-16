// Nucleux — agentic UI components for React.
// Import the stylesheet once in your app: `import "nucleux/styles.css";`

// Components
export { Avatar, type AvatarProps } from "./components/avatar";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardDivider,
  type CardProps,
} from "./components/card";
export { Badge, type BadgeProps, type BadgeVariant } from "./components/badge";
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./components/button";
export { ActionTile, type ActionTileProps } from "./components/action-tile";
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
export { PromptInput, type PromptInputProps } from "./components/prompt-input";

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
