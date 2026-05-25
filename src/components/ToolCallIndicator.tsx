"use client";

import { getToolLabel, getToolIcon } from "@/lib/utils";

interface ToolCall {
  toolName: string;
  status: "calling" | "done";
}

interface ToolCallIndicatorProps {
  toolCalls: ToolCall[];
}

export function ToolCallIndicator({ toolCalls }: ToolCallIndicatorProps) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {toolCalls.map((tc, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
            tc.status === "calling"
              ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
        >
          <span>{getToolIcon(tc.toolName)}</span>
          <span>{getToolLabel(tc.toolName)}</span>
          {tc.status === "calling" && (
            <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
          )}
          {tc.status === "done" && <span className="text-emerald-500">✓</span>}
        </div>
      ))}
    </div>
  );
}
