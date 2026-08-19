# Agentia — Frontend

A standalone Next.js + Tailwind frontend for **Agentia**, a multipurpose AI
agent ("One agent. Many possibilities."). This project is UI-only for now —
it runs entirely on mock data so you can preview and refine the experience
before wiring it to your Python/smolagents backend.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What's real vs. mock right now

- **Real:** all UI, animations, state management, session history (per
  browser tab, via `sessionStorage`), calculator math, and timezone lookups
  (computed client-side with `Intl`, for a handful of known cities).
- **Mock:** search/research answers, general conversation, and image
  generation — these return canned/placeholder content so the tool-activity
  states and image reveal can be previewed without a backend.

## Where to connect FastAPI

Everything funnels through **one file**: `lib/mock-agent.ts`. It exports
`runMockAgent(message, onPhase)`, which the UI calls and never touches
directly otherwise. To go live:

1. Stand up a small FastAPI wrapper around your existing `agent.run()`:

   ```python
   from fastapi import FastAPI
   from fastapi.middleware.cors import CORSMiddleware
   from pydantic import BaseModel
   from smolagents import AgentImage
   import base64
   from io import BytesIO

   app = FastAPI()
   app.add_middleware(CORSMiddleware, allow_origins=["*"])  # tighten in prod

   class ChatRequest(BaseModel):
       message: str

   @app.post("/chat")
   def chat(req: ChatRequest):
       result = agent.run(req.message)  # your existing agent, unchanged

       if isinstance(result, AgentImage):
           buf = BytesIO()
           result.to_raw().save(buf, format="PNG")
           b64 = base64.b64encode(buf.getvalue()).decode()
           return {
               "content": "Here's what I created.",
               "image_url": f"data:image/png;base64,{b64}",
               "tool_used": "image",
           }

       return {"content": str(result), "tool_used": "none"}
   ```

   This mirrors exactly what `app.py`'s `run_agent()` already does for
   Gradio — same `AgentImage` handling, just returned as JSON instead of a
   Gradio output tuple.

2. In `lib/mock-agent.ts`, replace the body of `runMockAgent` with a real
   `fetch("http://localhost:8000/chat", ...)` call (see the comment block
   at the top of the file for the exact shape). Keep the function signature
   — `(message, onPhase) => Promise<AgentResult>` — identical, and nothing
   else in the app needs to change.

3. If you want live tool-activity status (rather than the simulated
   timings), stream phase updates from FastAPI over SSE or a WebSocket and
   call `onPhase(...)` as events arrive instead of on fixed timers.

4. Add a `NEXT_PUBLIC_API_BASE` env var for the FastAPI URL instead of
   hardcoding it.

## Project structure

```
app/                 Next.js App Router entry (layout, page, global styles)
components/          UI components (welcome screen, chat view, composer, ...)
hooks/use-chat.ts    Session + message state, sessionStorage persistence
lib/mock-agent.ts    ← swap this for the real FastAPI call
lib/format-text.tsx  Minimal safe markdown-ish renderer (bold/code/paragraphs)
types/               Shared TypeScript types
```

## Notes

- No database, auth, or permanent storage — conversations live in
  `sessionStorage` for the current browser tab only, matching the current
  project scope.
- The brand mark (`components/facet-mark.tsx`) is reused as the app icon,
  the assistant's avatar, and the animated thinking indicator — one mark,
  many facets, echoing "One agent. Many possibilities."
- Respects `prefers-reduced-motion`.
