import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { PM_TOOLS } from "@/lib/tools";
import { executeToolCall, type SourceCitation } from "@/lib/tool-handlers";
import { SYSTEM_PROMPT } from "@/lib/agent";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChunk {
  type: "text" | "tool_call" | "tool_result" | "sources" | "done" | "error";
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  sources?: SourceCitation[];
  error?: string;
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: AgentMessage[] } = await req.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(chunk: StreamChunk) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }

        try {
          const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
            role: m.role,
            content: m.content,
          }));

          let allSources: SourceCitation[] = [];
          let iterations = 0;
          const maxIterations = 10;

          while (iterations < maxIterations) {
            iterations++;

            const response = await anthropic.messages.create({
              model: "claude-sonnet-4-6",
              max_tokens: 4096,
              system: SYSTEM_PROMPT,
              tools: PM_TOOLS,
              messages: anthropicMessages,
            });

            const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

            for (const block of response.content) {
              if (block.type === "text") {
                send({ type: "text", content: block.text });
              } else if (block.type === "tool_use") {
                toolUseBlocks.push(block);
              }
            }

            if (response.stop_reason === "end_turn" && toolUseBlocks.length === 0) break;

            if (toolUseBlocks.length > 0) {
              for (const toolUse of toolUseBlocks) {
                send({ type: "tool_call", toolName: toolUse.name, toolInput: toolUse.input as Record<string, unknown> });
              }

              const toolResults: Anthropic.ToolResultBlockParam[] = [];

              for (const toolUse of toolUseBlocks) {
                const result = executeToolCall(toolUse.name, toolUse.input as Record<string, unknown>);
                allSources.push(...result.sources);
                toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result.data) });
                send({ type: "tool_result", toolName: toolUse.name, sources: result.sources });
              }

              anthropicMessages.push({ role: "assistant", content: response.content });
              anthropicMessages.push({ role: "user", content: toolResults });
              continue;
            }

            break;
          }

          const uniqueSources = deduplicateSources(allSources);
          if (uniqueSources.length > 0) send({ type: "sources", sources: uniqueSources });
          send({ type: "done" });
        } catch (err) {
          send({ type: "error", error: err instanceof Error ? err.message : "Unknown error" });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function deduplicateSources(sources: SourceCitation[]): SourceCitation[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const key = `${s.source}-${s.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
