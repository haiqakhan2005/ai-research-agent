"use client";

import { Menu, Plus, Trash2, X } from "lucide-react";
import { ChatSession } from "@/types";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({ sessions, activeId, open, onClose, onNewChat, onSwitch, onDelete }: SidebarProps) {
  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <button
          aria-label="Close session list"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden animate-fade-in"
        />
      )}

      <aside
        className={cn(
          "fixed z-40 inset-y-0 left-0 w-72 border-r border-border bg-surface",
          "flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Logo size="sm" />
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-md p-1 text-ivory-faint hover:text-ivory md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={onNewChat}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border border-border bg-surface-raised px-3 py-2.5",
              "text-sm text-ivory transition-colors hover:border-facet-teal/50 hover:bg-surface-hover active:scale-[0.98]"
            )}
          >
            <Plus size={16} strokeWidth={2} />
            New chat
          </button>
        </div>

        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {sessions.length === 0 && (
            <p className="px-2 py-6 text-center text-xs text-ivory-faint">
              Your conversations will appear here.
            </p>
          )}
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer",
                session.id === activeId
                  ? "bg-surface-hover text-ivory"
                  : "text-ivory-muted hover:bg-surface-hover/60 hover:text-ivory"
              )}
              onClick={() => onSwitch(session.id)}
            >
              <span className="flex-1 truncate">{session.title || "New chat"}</span>
              <button
                aria-label="Delete conversation"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="shrink-0 rounded p-1 text-ivory-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] leading-relaxed text-ivory-faint">
            Chats live in this browser tab only — nothing is saved to an account yet.
          </p>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Toggle sidebar"
      className="rounded-md p-1.5 text-ivory-muted hover:text-ivory md:hidden"
    >
      <Menu size={19} strokeWidth={1.75} />
    </button>
  );
}
