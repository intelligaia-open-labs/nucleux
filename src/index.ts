// Nucleux — agentic UI components for React.
// Import the stylesheet once in your app: `import "nucleux/styles.css";`

// Components
export { Avatar, type AvatarProps } from "./components/avatar";
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
