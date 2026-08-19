"use client";

import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { Header } from "@/components/header";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ChatView } from "@/components/chat-view";

export default function Home() {
  const {
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
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasMessages = (activeSession?.messages.length ?? 0) > 0;

  return (
    <div className="flex h-dvh overflow-hidden bg-ink">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={() => {
          newChat();
          setSidebarOpen(false);
        }}
        onSwitch={(id) => {
          switchSession(id);
          setSidebarOpen(false);
        }}
        onDelete={deleteSession}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {hasMessages ? (
          <>
            <Header
              title={activeSession?.title ?? "New chat"}
              onToggleSidebar={() => setSidebarOpen(true)}
              onNewChat={newChat}
              onClearConversation={clearConversation}
              hasMessages={hasMessages}
            />
            <ChatView
              messages={activeSession?.messages ?? []}
              phase={phase}
              activeTool={activeTool}
              statusLabel={statusLabel}
              onSend={sendMessage}
            />
          </>
        ) : (
          <>
            <div className="flex items-center px-4 py-4 md:hidden">
              <SidebarToggle onClick={() => setSidebarOpen(true)} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <WelcomeScreen onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
