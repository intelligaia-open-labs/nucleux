/** The author of a message in an agent conversation. */
export type MessageRole = "user" | "assistant" | "system" | "tool";

/** Lifecycle state of a tool / function call made by an agent. */
export type ToolCallStatus =
  | "pending"
  | "running"
  | "success"
  | "error";

/** A single tool invocation surfaced by the agent. */
export interface ToolCall {
  /** Stable id for the invocation. */
  id: string;
  /** Name of the tool/function being called. */
  name: string;
  /** Arguments passed to the tool (any JSON-serializable value). */
  args?: unknown;
  /** Result returned by the tool once it resolves. */
  result?: unknown;
  /** Current lifecycle state. */
  status: ToolCallStatus;
}

/** A message in an agent conversation. */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** True while the assistant is still streaming this message's content. */
  streaming?: boolean;
  /** Tool calls associated with this message, if any. */
  toolCalls?: ToolCall[];
  /** ISO timestamp or epoch millis for when the message was created. */
  createdAt?: string | number;
}
