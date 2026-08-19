import { AlertTriangle } from "lucide-react";
import { ChatMessage } from "@/types";
import { FacetMark } from "@/components/facet-mark";
import { ImageMessage } from "@/components/image-message";
import { formatMessageContent } from "@/lib/format-text";
import { cn } from "@/lib/utils";

const TOOL_TAG: Record<string, string> = {
  search: "🔎 Searched the web",
  calculate: "🧮 Calculated",
  time: "🌍 Checked the time",
  image: "🎨 Created an image",
};

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-message-in">
        <div className="max-w-[85%] md:max-w-[70%] rounded-2xl rounded-tr-sm bg-surface-raised border border-border px-4 py-2.5 text-[15px] leading-relaxed text-ivory">
          {formatMessageContent(message.content)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 animate-message-in">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised border border-border">
        <FacetMark size={16} tool={message.toolUsed} />
      </div>
      <div className="max-w-[85%] md:max-w-[70%] space-y-2.5">
        {message.isError ? (
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[15px] leading-relaxed text-ivory">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-danger" strokeWidth={1.75} />
            <span>{message.content}</span>
          </div>
        ) : (
          <div className="text-[15px] leading-relaxed text-ivory">
            {formatMessageContent(message.content)}
          </div>
        )}

        {message.imageUrl && <ImageMessage src={message.imageUrl} prompt={message.imagePrompt} />}

        {!message.isError && message.toolUsed && message.toolUsed !== "none" && (
          <p className={cn("font-mono text-[11px] uppercase tracking-wide text-ivory-faint")}>
            {TOOL_TAG[message.toolUsed]}
          </p>
        )}
      </div>
    </div>
  );
}
