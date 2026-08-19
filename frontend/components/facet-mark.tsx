"use client";

import { cn } from "@/lib/utils";
import { ToolKind } from "@/types";

interface FacetMarkProps {
  size?: number;
  active?: boolean;
  tool?: ToolKind;
  className?: string;
}

const TOOL_LEAN: Record<ToolKind, { a: string; b: string }> = {
  search: { a: "#4FA793", b: "#3B8A78" },
  calculate: { a: "#4FA793", b: "#D8A857" },
  time: { a: "#7FB8C9", b: "#4FA793" },
  image: { a: "#D8A857", b: "#C98F3F" },
  none: { a: "#4FA793", b: "#D8A857" },
};

/**
 * One mark, many facets — the visual thesis of "One agent. Many possibilities."
 * Reused as the app icon, the assistant's avatar, and the live thinking indicator.
 */
export function FacetMark({ size = 28, active = false, tool = "none", className }: FacetMarkProps) {
  const { a, b } = TOOL_LEAN[tool];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={cn(active && "animate-facet-spin")}
        style={{ transformOrigin: "50% 50%", transitionProperty: "opacity" }}
      >
        <polygon
          points="24,4 41,15 35,38 13,38 7,15"
          fill={a}
          opacity="0.9"
          className={active ? "animate-facet-breathe" : ""}
        />
        <polygon points="24,4 41,15 24,24" fill={b} opacity="0.95" />
        <polygon points="24,24 35,38 13,38" fill={b} opacity="0.55" />
        <polygon points="24,4 24,24 7,15" fill="#ECEAE4" opacity="0.12" />
      </svg>
    </div>
  );
}
