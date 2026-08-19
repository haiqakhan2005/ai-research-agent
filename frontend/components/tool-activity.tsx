"use client";

import { AgentPhase, ToolKind } from "@/types";
import { FacetMark } from "@/components/facet-mark";

const TOOL_ICON: Record<ToolKind, string> = {
  search: "🔎",
  calculate: "🧮",
  time: "🌍",
  image: "🎨",
  none: "✦",
};

const TOOL_DEFAULT_LABEL: Record<ToolKind, string> = {
  search: "Searching…",
  calculate: "Calculating…",
  time: "Checking time…",
  image: "Creating image…",
  none: "Thinking…",
};

interface ToolActivityProps {
  phase: AgentPhase;
  tool: ToolKind;
  label?: string;
}

export function ToolActivity({ phase, tool, label }: ToolActivityProps) {
  if (phase === "idle" || phase === "error") return null;

  const isToolPhase = phase === "using-tool";
  const displayLabel = label || (isToolPhase ? TOOL_DEFAULT_LABEL[tool] : "Thinking…");
  const icon = isToolPhase ? TOOL_ICON[tool] : "✦";

  return (
    <div className="flex items-start gap-3 animate-message-in">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-border">
        <FacetMark size={16} active tool={tool} />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-ivory-muted">
        <span aria-hidden="true">{icon}</span>
        <span className="font-mono text-xs tracking-wide">{displayLabel}</span>
        <span className="flex items-center gap-0.5 pl-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-1 rounded-full bg-ivory-muted animate-dot-pulse"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
