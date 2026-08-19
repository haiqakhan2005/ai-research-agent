"use client";

import { useEffect, useRef } from "react";
import { AgentPhase, ChatMessage, ToolKind } from "@/types";
import { MessageBubble } from "@/components/message-bubble";
import { ToolActivity } from "@/components/tool-activity";
import { Composer } from "@/components/composer";

interface ChatViewProps {
  messages: ChatMessage[];
  phase: AgentPhase;
  activeTool: ToolKind;
  statusLabel: string;
  onSend: (text: string) => void;
}

export function ChatView({ messages, phase, activeTool, statusLabel, onSend }: ChatViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, phase]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <ToolActivity phase={phase} tool={activeTool} label={statusLabel} />
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border bg-ink/95 px-4 py-4 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <Composer onSend={onSend} disabled={phase !== "idle"} autoFocus />
          <p className="mt-2 text-center text-[11px] text-ivory-faint">
            Agentia can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
