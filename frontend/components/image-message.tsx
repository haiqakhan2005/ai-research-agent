"use client";

import { useState } from "react";
import { ImageOff, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageMessageProps {
  src: string;
  prompt?: string;
}

/**
 * Renders a generated image with a tasteful blur-up reveal.
 *
 * Integration note: on the backend, convert the smolagents `AgentImage`
 * before it reaches this component — e.g. `image.to_raw()` inside a
 * FastAPI response, or base64-encode it: `base64.b64encode(...)`. Never pass
 * the raw AgentImage object through JSON. This component only ever expects
 * a normal <img> src (a URL or a data: URI).
 */
export function ImageMessage({ src, prompt }: ImageMessageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-10 text-ivory-faint">
        <ImageOff size={22} strokeWidth={1.5} />
        <p className="text-xs">Couldn&apos;t load the generated image.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative">
        {!loaded && (
          <div className="absolute inset-0 shimmer-surface" aria-hidden="true" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={prompt || "Agentia generated image"}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "block w-full aspect-square object-cover transition-all duration-700 ease-out",
            loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[1.02] blur-md"
          )}
        />
      </div>
      {prompt && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
          <p className="truncate text-xs text-ivory-faint font-mono" title={prompt}>
            {prompt}
          </p>
          <a
            href={src}
            download="agentia-image.png"
            className="shrink-0 text-ivory-faint hover:text-facet-gold transition-colors"
            aria-label="Download image"
          >
            <Download size={14} strokeWidth={1.75} />
          </a>
        </div>
      )}
    </div>
  );
}
