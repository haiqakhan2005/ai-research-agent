"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AgentPhase, ChatMessage, ChatSession, ToolKind } from "@/types";
import { truncate, uid } from "@/lib/utils";

const STORAGE_KEY = "agentia:sessions:v1";

function createSession(): ChatSession {
  const now = Date.now();

  return {
    id: uid(),
    title: "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [activeTool, setActiveTool] = useState<ToolKind>("none");
  const [statusLabel, setStatusLabel] = useState<string>("");

  const hydrated = useRef(false);

  // ---------------------------------------------------------
  // HYDRATE SESSIONS
  // ---------------------------------------------------------

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {
      // Corrupted storage — ignore and start fresh.
    } finally {
      hydrated.current = true;
    }
  }, []);

  // ---------------------------------------------------------
  // PERSIST SESSIONS
  // ---------------------------------------------------------

  useEffect(() => {
    if (!hydrated.current) return;

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(sessions)
      );
    } catch {
      // Storage full/unavailable — non-fatal.
    }
  }, [sessions]);

  // ---------------------------------------------------------
  // ACTIVE SESSION
  // ---------------------------------------------------------

  const activeSession =
    sessions.find((s) => s.id === activeId) ?? null;

  // ---------------------------------------------------------
  // NEW CHAT
  // ---------------------------------------------------------

  const newChat = useCallback(() => {
    const session = createSession();

    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setPhase("idle");

    return session.id;
  }, []);

  // ---------------------------------------------------------
  // CLEAR CONVERSATION
  // ---------------------------------------------------------

  const clearConversation = useCallback(() => {
    if (!activeId) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? {
              ...s,
              messages: [],
              title: "New chat",
              updatedAt: Date.now(),
            }
          : s
      )
    );
  }, [activeId]);

  // ---------------------------------------------------------
  // DELETE SESSION
  // ---------------------------------------------------------

  const deleteSession = useCallback(
    (id: string) => {
      setSessions((prev) =>
        prev.filter((s) => s.id !== id)
      );

      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId]
  );

  // ---------------------------------------------------------
  // SWITCH SESSION
  // ---------------------------------------------------------

  const switchSession = useCallback((id: string) => {
    setActiveId(id);
    setPhase("idle");
  }, []);

  // ---------------------------------------------------------
  // SEND MESSAGE
  // ---------------------------------------------------------

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || phase !== "idle") {
        return;
      }

      // -----------------------------------------------------
      // CREATE SESSION IF NEEDED
      // -----------------------------------------------------

      let sessionId = activeId;

      if (!sessionId) {
        const session = createSession();

        setSessions((prev) => [
          session,
          ...prev,
        ]);

        sessionId = session.id;
        setActiveId(sessionId);
      }

      // -----------------------------------------------------
      // USER MESSAGE
      // -----------------------------------------------------

      const userMessage: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  userMessage,
                ],
                title:
                  s.messages.length === 0
                    ? truncate(trimmed)
                    : s.title,
                updatedAt: Date.now(),
              }
            : s
        )
      );

      // -----------------------------------------------------
      // SHOW THINKING STATE
      // -----------------------------------------------------

      setPhase("thinking");
      setActiveTool("none");
      setStatusLabel("Thinking…");

      try {
        // ---------------------------------------------------
        // CALL FASTAPI BACKEND
        // ---------------------------------------------------

        const response = await fetch(
          "http://127.0.0.1:8000/chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: trimmed,
            }),
          }
        );

        // ---------------------------------------------------
        // DAILY RATE LIMIT
        // ---------------------------------------------------

        if (response.status === 429) {
          const limitMessage: ChatMessage = {
            id: uid(),
            role: "assistant",
            content:
              "Daily limit reached. You can make up to 10 requests per day. Please try again tomorrow.",
            isError: true,
            createdAt: Date.now(),
          };

          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    messages: [
                      ...s.messages,
                      limitMessage,
                    ],
                    updatedAt: Date.now(),
                  }
                : s
            )
          );

          return;
        }

        // ---------------------------------------------------
        // OTHER BACKEND ERRORS
        // ---------------------------------------------------

        if (!response.ok) {
          throw new Error(
            "Backend request failed"
          );
        }

        // ---------------------------------------------------
        // READ RESPONSE
        // ---------------------------------------------------

        const data = await response.json();

        // ---------------------------------------------------
        // FORMAT RESULT
        // ---------------------------------------------------

        const result = {
          content:
            data.type === "text"
              ? data.response
              : "Image generated successfully.",

          imageUrl:
            data.type === "image"
              ? data.response.startsWith(
                  "data:image/"
                )
                ? data.response
                : `data:image/png;base64,${data.response}`
              : undefined,

          imagePrompt: undefined,

          toolUsed: undefined,
        };

        // ---------------------------------------------------
        // ASSISTANT MESSAGE
        // ---------------------------------------------------

        const assistantMessage: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: result.content,
          imageUrl: result.imageUrl,
          imagePrompt: result.imagePrompt,
          toolUsed: result.toolUsed,
          createdAt: Date.now(),
        };

        // ---------------------------------------------------
        // ADD ASSISTANT MESSAGE
        // ---------------------------------------------------

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    assistantMessage,
                  ],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      } catch {
        // ---------------------------------------------------
        // GENERAL ERROR
        // ---------------------------------------------------

        const errorMessage: ChatMessage = {
          id: uid(),
          role: "assistant",
          content:
            "Agentia couldn't complete that request. The agent may be busy or unreachable — please try again.",
          isError: true,
          createdAt: Date.now(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    errorMessage,
                  ],
                  updatedAt: Date.now(),
                }
              : s
          )
        );
      } finally {
        // ---------------------------------------------------
        // RESET UI STATE
        // ---------------------------------------------------

        setPhase("idle");
        setActiveTool("none");
        setStatusLabel("");
      }
    },
    [activeId, phase]
  );

  // ---------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------

  return {
    sessions,
    activeSession,
    activeId,
    phase,
    activeTool,
    statusLabel,
    newChat,
    clearConversation,
    deleteSession,
    switchSession,
    sendMessage,
  };
}