"use client";

import { Eraser, Menu, SquarePen } from "lucide-react";

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onClearConversation: () => void;
  hasMessages: boolean;
}

export function Header({ title, onToggleSidebar, onNewChat, onClearConversation, hasMessages }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
          className="rounded-md p-1.5 -ml-1.5 text-ivory-muted hover:text-ivory md:hidden"
        >
          <Menu size={19} strokeWidth={1.75} />
        </button>
        <h1 className="truncate text-sm text-ivory-muted font-mono">{title}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onClearConversation}
          disabled={!hasMessages}
          aria-label="Clear conversation"
          title="Clear conversation"
          className="rounded-md p-2 text-ivory-muted transition-colors hover:text-ivory disabled:opacity-30 disabled:hover:text-ivory-muted"
        >
          <Eraser size={17} strokeWidth={1.75} />
        </button>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-ivory-muted transition-colors hover:border-facet-teal/50 hover:text-ivory active:scale-95"
        >
          <SquarePen size={15} strokeWidth={1.75} />
          <span className="hidden sm:inline">New chat</span>
        </button>
      </div>
    </header>
  );
}
