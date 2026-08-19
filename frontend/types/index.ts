export type ToolKind = "search" | "calculate" | "time" | "image" | "none";

export type AgentPhase =
  | "idle"
  | "thinking"
  | "using-tool"
  | "responding"
  | "error";

export interface ToolActivityStep {
  tool: ToolKind;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  /** Plain text content. For image messages this is the caption/response text. */
  content: string;
  /** Present when the assistant returned a generated image (mirrors AgentImage on the backend). */
  imageUrl?: string;
  imagePrompt?: string;
  toolUsed?: ToolKind;
  isError?: boolean;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface CapabilitySuggestion {
  key: ToolKind;
  label: string;
  icon: string;
  prompt: string;
}
