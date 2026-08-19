import { AgentPhase, ToolKind } from "@/types";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * MOCK AGENT — replace this file's internals with a real API call when you
 * wire up FastAPI. Everything below simulates what your Python `agent.run()`
 * (smolagents CodeAgent) would eventually do, so the UI never has to change.
 *
 * Real version will likely look like:
 *
 *   const res = await fetch(`${API_BASE}/chat`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ message }),
 *   });
 *   if (!res.ok) throw new Error("agent_unavailable");
 *   const data = await res.json();
 *   // data: { content: string, image_url?: string, tool_used?: ToolKind }
 *
 * If you stream tool status from FastAPI (SSE/WebSocket), call onPhase(...)
 * as events arrive instead of on fixed timers.
 * ─────────────────────────────────────────────────────────────────────────
 */

export interface AgentResult {
  content: string;
  imageUrl?: string;
  imagePrompt?: string;
  toolUsed: ToolKind;
}

export type PhaseCallback = (
  phase: AgentPhase,
  detail?: { tool?: ToolKind; label?: string }
) => void;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TIMEZONES: Record<string, string> = {
  lahore: "Asia/Karachi",
  karachi: "Asia/Karachi",
  pakistan: "Asia/Karachi",
  islamabad: "Asia/Karachi",
  tokyo: "Asia/Tokyo",
  japan: "Asia/Tokyo",
  london: "Europe/London",
  uk: "Europe/London",
  england: "Europe/London",
  paris: "Europe/Paris",
  france: "Europe/Paris",
  berlin: "Europe/Berlin",
  "new york": "America/New_York",
  nyc: "America/New_York",
  "los angeles": "America/Los_Angeles",
  la: "America/Los_Angeles",
  california: "America/Los_Angeles",
  dubai: "Asia/Dubai",
  uae: "Asia/Dubai",
  sydney: "Australia/Sydney",
  australia: "Australia/Sydney",
  singapore: "Asia/Singapore",
  toronto: "America/Toronto",
  beijing: "Asia/Shanghai",
  china: "Asia/Shanghai",
  moscow: "Europe/Moscow",
  delhi: "Asia/Kolkata",
  india: "Asia/Kolkata",
};

function classifyIntent(message: string): ToolKind {
  const m = message.toLowerCase();

  if (/(generate|create|draw|paint|design|make).{0,20}(image|picture|art|logo|illustration|photo)/.test(m) ||
      /^(image|draw|picture) of/.test(m)) {
    return "image";
  }
  const mentionsKnownCity = Object.keys(TIMEZONES).some((city) => m.includes(city));
  if (/\b(time|timezone|time zone|clock|what time)\b/.test(m) || (mentionsKnownCity && /time/.test(m))) {
    return "time";
  }
  if (/^[\s\d+\-*/().%^]+$/.test(m.trim()) && /\d/.test(m)) {
    return "calculate";
  }
  if (/(calculate|compute|what('s| is)) .*[\d+\-*/^%]/.test(m) || /\b\d+\s*[+\-*/^]\s*\d+/.test(m)) {
    return "calculate";
  }
  if (/(research|search|news|latest|who is|what is|explain|find out|look up)/.test(m)) {
    return "search";
  }
  return "search";
}

function extractExpression(message: string): string | null {
  const match = message.match(/[\d\s+\-*/().%^]{3,}/);
  if (!match) return null;
  const expr = match[0].trim();
  return /\d/.test(expr) ? expr : null;
}

function safeEval(expr: string): string | null {
  // Whitelist-only expression, mirrors the guard rails the backend `calculate`
  // tool would apply before eval().
  const cleaned = expr.replace(/\^/g, "**");
  if (!/^[\d\s+\-*/().%*]+$/.test(cleaned)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${cleaned});`)();
    if (typeof result === "number" && Number.isFinite(result)) {
      return Number.isInteger(result) ? String(result) : String(Math.round(result * 1e6) / 1e6);
    }
    return null;
  } catch {
    return null;
  }
}

function findTimezone(message: string): { key: string; tz: string } | null {
  const m = message.toLowerCase();
  for (const [city, tz] of Object.entries(TIMEZONES)) {
    if (m.includes(city)) return { key: city, tz };
  }
  return null;
}

function formatTimeAnswer(message: string): string {
  const found = findTimezone(message);
  const tz = found?.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date());
    const label = found ? found.key.replace(/\b\w/g, (c) => c.toUpperCase()) : "your local timezone";
    return `The current time in **${label}** (${tz}) is **${formatted}**.`;
  } catch {
    return "I couldn't resolve that timezone. Try a major city name, like \"Tokyo\" or \"London\".";
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Builds a self-contained SVG "generated image" placeholder so the demo
 * never depends on external image hosts. Swap for the real image URL
 * (converted from AgentImage on the backend) once FastAPI is wired up.
 */
export function generatePlaceholderImage(prompt: string): string {
  const hash = hashString(prompt || "agentia");
  const hueA = hash % 360;
  const hueB = (hueA + 46) % 360;
  const rotate = hash % 40;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="768" height="768" viewBox="0 0 768 768">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hueA} 42% 22%)" />
          <stop offset="100%" stop-color="hsl(${hueB} 38% 14%)" />
        </linearGradient>
      </defs>
      <rect width="768" height="768" fill="url(#g)" />
      <g transform="translate(384 384) rotate(${rotate})" opacity="0.9">
        <polygon points="0,-160 140,-40 90,140 -90,140 -140,-40" fill="hsl(${hueA} 55% 55%)" opacity="0.18" />
        <polygon points="0,-100 90,-24 55,90 -55,90 -90,-24" fill="hsl(${hueB} 60% 62%)" opacity="0.22" />
      </g>
      <text x="384" y="700" text-anchor="middle" font-family="monospace" font-size="16" fill="rgba(236,234,228,0.55)">
        ${(prompt || "generated image").slice(0, 60).replace(/[<>&]/g, "")}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mockSearchAnswer(message: string): string {
  return (
    `Here's a placeholder research summary for **"${message.trim()}"** — this is mock ` +
    `content standing in for your live DuckDuckGo-backed agent.\n\n` +
    `Once connected to FastAPI, this panel will show the real answer your ` +
    `\`CodeAgent\` composes after calling \`DuckDuckGoSearchTool\`, with sources ` +
    `pulled from its actual run.\n\n` +
    `_Mock sources: example.com, wikipedia.org, docs.reference.dev_`
  );
}

function mockGeneralAnswer(message: string): string {
  return (
    `I'm running on mock data right now, so I can't reason about that yet — but here's ` +
    `the shape of a normal reply to **"${message.trim()}"**.\n\n` +
    `Connect this frontend to your FastAPI wrapper around \`agent.run()\` and this ` +
    `response will come from Qwen2.5-Coder-32B instead.`
  );
}

export async function runMockAgent(
  message: string,
  onPhase: PhaseCallback
): Promise<AgentResult> {
  const trimmed = message.trim();

  if (/^\/error$/i.test(trimmed) || /simulate error/i.test(trimmed)) {
    onPhase("thinking");
    await wait(500);
    onPhase("error");
    throw new Error("agent_unavailable");
  }

  onPhase("thinking");
  await wait(500 + Math.random() * 350);

  const tool = classifyIntent(trimmed);

  if (tool === "calculate") {
    onPhase("using-tool", { tool, label: "Calculating…" });
    await wait(700);
    const expr = extractExpression(trimmed);
    const result = expr ? safeEval(expr) : null;
    onPhase("responding");
    await wait(250);
    return {
      toolUsed: "calculate",
      content:
        result !== null
          ? `\`${expr}\` = **${result}**`
          : `I couldn't safely evaluate that expression. Try something like \`25 * 4 + 10\`.`,
    };
  }

  if (tool === "time") {
    onPhase("using-tool", { tool, label: "Checking time…" });
    await wait(650);
    onPhase("responding");
    await wait(250);
    return { toolUsed: "time", content: formatTimeAnswer(trimmed) };
  }

  if (tool === "image") {
    onPhase("using-tool", { tool, label: "Creating image…" });
    await wait(1800 + Math.random() * 500);
    onPhase("responding");
    await wait(200);
    return {
      toolUsed: "image",
      content: `Here's a first pass — mock render standing in for your text-to-image tool.`,
      imageUrl: generatePlaceholderImage(trimmed),
      imagePrompt: trimmed,
    };
  }

  if (tool === "search") {
    onPhase("using-tool", { tool, label: "Searching the web…" });
    await wait(900);
    onPhase("using-tool", { tool, label: "Reading results…" });
    await wait(700);
    onPhase("responding");
    await wait(250);
    return { toolUsed: "search", content: mockSearchAnswer(trimmed) };
  }

  onPhase("responding");
  await wait(500);
  return { toolUsed: "none", content: mockGeneralAnswer(trimmed) };
}
