"use client";

import { ArrowUp } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "hero" | "docked";
  /** Bump `injectVersion` with a new `injectedText` to programmatically fill the input (e.g. capability chips). */
  injectedText?: string;
  injectVersion?: number;
}

export function Composer({
  onSend,
  disabled,
  placeholder = "Ask Agentia anything…",
  autoFocus,
  variant = "docked",
  injectedText,
  injectVersion,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (injectVersion === undefined) return;
    if (injectedText === undefined) return;
    setValue(injectedText);
    ref.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [injectVersion]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 rounded-2xl border bg-surface px-3 py-2.5 transition-colors",
        "border-border focus-within:border-facet-teal/60",
        variant === "hero" && "shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]"
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        disabled={disabled}
        placeholder={placeholder}
        aria-label="Message Agentia"
        className={cn(
          "composer-input flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-ivory placeholder:text-ivory-faint",
          "outline-none disabled:opacity-50 max-h-[200px]"
        )}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          "bg-facet-teal text-ink disabled:bg-surface-hover disabled:text-ivory-faint",
          "enabled:hover:brightness-110 enabled:active:scale-90"
        )}
      >
        <ArrowUp size={18} strokeWidth={2} />
      </button>
    </div>
  );
}
