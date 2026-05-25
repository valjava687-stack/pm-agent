"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ClientSidebar } from "./ClientSidebar";
import { ToolCallIndicator } from "./ToolCallIndicator";
import { SourceCitations } from "./SourceCitations";
import { MessageRenderer } from "./MessageRenderer";
import { EXAMPLE_QUERIES } from "@/lib/agent";
import type { SourceCitation } from "@/lib/tool-handlers";
import type { StreamChunk } from "@/app/api/chat/route";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  toolCalls?: { toolName: string; status: "calling" | "done" }[];
  isStreaming?: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeClient, setActiveClient] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (query: string) => {
      if (!query.trim() || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: query.trim(),
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        toolCalls: [],
        sources: [],
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }));

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...history, { role: "user", content: query.trim() }],
          }),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const chunk: StreamChunk = JSON.parse(data);

              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role !== "assistant") return prev;

                switch (chunk.type) {
                  case "text":
                    return [
                      ...updated.slice(0, -1),
                      { ...lastMsg, content: lastMsg.content + (chunk.content ?? "") },
                    ];
                  case "tool_call":
                    return [
                      ...updated.slice(0, -1),
                      {
                        ...lastMsg,
                        toolCalls: [
                          ...(lastMsg.toolCalls ?? []),
                          { toolName: chunk.toolName!, status: "calling" as const },
                        ],
                      },
                    ];
                  case "tool_result":
                    return [
                      ...updated.slice(0, -1),
                      {
                        ...lastMsg,
                        toolCalls: (lastMsg.toolCalls ?? []).map((tc) =>
                          tc.toolName === chunk.toolName ? { ...tc, status: "done" as const } : tc
                        ),
                      },
                    ];
                  case "sources":
                    return [
                      ...updated.slice(0, -1),
                      { ...lastMsg, sources: chunk.sources ?? [] },
                    ];
                  case "done":
                    return [
                      ...updated.slice(0, -1),
                      { ...lastMsg, isStreaming: false },
                    ];
                  case "error":
                    return [
                      ...updated.slice(0, -1),
                      {
                        ...lastMsg,
                        content: `**Error:** ${chunk.error}`,
                        isStreaming: false,
                      },
                    ];
                }
                return prev;
              });
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === "assistant") {
            return [
              ...updated.slice(0, -1),
              {
                ...lastMsg,
                content: `**Error:** ${err instanceof Error ? err.message : "Unknown error"}`,
                isStreaming: false,
              },
            ];
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  // Called when user clicks a client name in the sidebar — sets context, focuses input
  const handleClientSelect = useCallback((clientName: string) => {
    setActiveClient(clientName);
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // Called when user clicks a quick-query shortcut in the sidebar — fires immediately
  const handleQuickQuery = useCallback(
    (query: string) => {
      sendMessage(query);
    },
    [sendMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = activeClient ? `[${activeClient}] ${input}` : input;
    sendMessage(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = activeClient ? `[${activeClient}] ${input}` : input;
      sendMessage(query);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  const placeholder = activeClient
    ? `Ask anything about ${activeClient}...`
    : "Ask about any client, project, decision, or risk...";

  return (
    <div className="flex h-screen bg-white">
      <ClientSidebar
        activeClient={activeClient}
        onClientSelect={handleClientSelect}
        onQuickQuery={handleQuickQuery}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
          <div>
            <h1 className="text-base font-semibold text-slate-900">PM Agent</h1>
            <p className="text-xs text-slate-500">
              Institutional memory for all 5 clients · Today: May 25, 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeClient && (
              <button
                onClick={() => setActiveClient(null)}
                className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <span className="font-medium">{activeClient}</span>
                <span className="opacity-60">×</span>
              </button>
            )}
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="max-w-lg text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🤖</span>
                </div>
                {activeClient ? (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      Context set: {activeClient}
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                      Your questions will be scoped to this client. Type anything below.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        `How is ${activeClient} doing this week?`,
                        `What's pending with ${activeClient} after the last meeting?`,
                        `What are the open blockers for ${activeClient}?`,
                        `Prepare a brief for my next meeting with ${activeClient}.`,
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(`[${activeClient}] ${q}`)}
                          className="text-left px-4 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-slate-700 hover:text-indigo-700 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">
                      What do you need to know?
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                      Select a client from the sidebar to focus, or ask about anything across all clients.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {EXAMPLE_QUERIES.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-left px-4 py-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-sm text-slate-700 hover:text-indigo-700 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mr-3 mt-0.5">
                      <span className="text-white text-xs">🤖</span>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5"
                        : "bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <>
                        {(message.toolCalls?.length ?? 0) > 0 && (
                          <ToolCallIndicator toolCalls={message.toolCalls ?? []} />
                        )}
                        {message.content ? (
                          <MessageRenderer content={message.content} />
                        ) : message.isStreaming ? (
                          <div className="flex items-center gap-2 py-1">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 150}ms` }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">Thinking...</span>
                          </div>
                        ) : null}
                        {!message.isStreaming && (message.sources?.length ?? 0) > 0 && (
                          <SourceCitations sources={message.sources ?? []} />
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 px-6 py-4 bg-white">
          <div className="max-w-3xl mx-auto">
            {/* Active client badge above input */}
            {activeClient && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-500">Context:</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  {activeClient}
                </span>
                <button
                  onClick={() => setActiveClient(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  clear
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={1}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 bg-white"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                )}
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Querying: Granola transcripts · Linear tasks · Notion docs · Slack · Calendar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
