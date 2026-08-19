"use client";

import { useState } from "react";
import { Logo } from "@/components/logo";
import { Composer } from "@/components/composer";
import { CapabilitySuggestion } from "@/types";
import { cn } from "@/lib/utils";

const CAPABILITIES: CapabilitySuggestion[] = [
  { key: "search", icon: "🔎", label: "Research", prompt: "Research the latest developments in AI agents" },
  { key: "calculate", icon: "🧮", label: "Calculate", prompt: "Calculate 18% tip on a $142.50 bill" },
  { key: "time", icon: "🌍", label: "Time", prompt: "What time is it right now in Tokyo?" },
  { key: "image", icon: "🎨", label: "Create", prompt: "Create an image of a lighthouse at dawn" },
];

interface WelcomeScreenProps {
  onSend: (text: string) => void;
}

export function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  const [injected, setInjected] = useState<{ text: string; version: number }>({
    text: "",
    version: 0,
  });

  const fillWith = (prompt: string) =>
    setInjected((prev) => ({ text: prompt, version: prev.version + 1 }));

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="animate-rise-in" style={{ animationDelay: "0ms" }}>
            <Logo size="lg" />
          </div>
          <p
            className="mt-4 text-balance font-display italic text-lg text-ivory-muted animate-rise-in opacity-0"
            style={{ animationDelay: "90ms" }}
          >
            One agent. Many possibilities.
          </p>
          <p
            className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-ivory-faint animate-rise-in opacity-0"
            style={{ animationDelay: "160ms" }}
          >
            Research · Calculate · Explore · Create
          </p>
        </div>

        <div
          className="mt-10 animate-rise-in opacity-0"
          style={{ animationDelay: "240ms" }}
        >
          <Composer
            onSend={onSend}
            variant="hero"
            placeholder="Ask Agentia anything…"
            injectedText={injected.text}
            injectVersion={injected.version}
          />
        </div>

        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-2 animate-rise-in opacity-0"
          style={{ animationDelay: "320ms" }}
        >
          {CAPABILITIES.map((cap) => (
            <button
              key={cap.key}
              type="button"
              onClick={() => fillWith(cap.prompt)}
              className={cn(
                "group flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5",
                "text-sm text-ivory-muted transition-all duration-200",
                "hover:border-facet-teal/50 hover:text-ivory hover:-translate-y-0.5 active:translate-y-0"
              )}
            >
              <span aria-hidden="true">{cap.icon}</span>
              {cap.label}
            </button>
          ))}
        </div>

        <p
          className="mt-8 text-center text-xs text-ivory-faint animate-rise-in opacity-0"
          style={{ animationDelay: "380ms" }}
        >
          Try: <span className="font-mono">&ldquo;Research the latest AI news&rdquo;</span>
        </p>
      </div>
    </div>
  );
}
