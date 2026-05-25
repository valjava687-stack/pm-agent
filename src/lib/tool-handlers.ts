import {
  clients,
  transcripts,
  linearTasks,
  notionDocs,
  slackMessages,
  calendarEvents,
  getClientById,
  getTranscriptsByClient,
  getTasksByClient,
  getDocsByClient,
  getSlackByClient,
  getUpcomingMeetings,
} from "@/data/mock-data";
import { getSearchEngine } from "./vector-search";

export interface ToolResult {
  data: unknown;
  sources: SourceCitation[];
  timestamp: string;
}

export interface SourceCitation {
  source: string;
  label: string;
  date: string;
  url?: string;
  confidence: "high" | "medium" | "low";
  freshnessNote?: string;
}

function resolveClientId(input?: string): string | undefined {
  if (!input) return undefined;
  if (clients.find((c) => c.id === input)) return input;
  const match = clients.find(
    (c) =>
      c.name.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
  );
  return match?.id ?? input;
}

export function handle_search_meeting_transcripts(input: {
  query: string;
  clientId?: string;
  limit?: number;
}): ToolResult {
  const engine = getSearchEngine();
  const resolvedClientId = resolveClientId(input.clientId);
  const results = engine.search(input.query, { clientId: resolvedClientId, topK: input.limit ?? 3, type: "transcript" });

  const enrichedResults = results.map((r) => {
    const transcriptId = (r.document.metadata as Record<string, unknown>).transcriptId as string;
    const transcript = transcripts.find((t) => t.id === transcriptId);
    return {
      score: Math.round(r.score * 100) / 100,
      relevantTerms: r.matchedTerms,
      transcript: transcript
        ? {
            id: transcript.id,
            date: transcript.date,
            source: transcript.source,
            participants: transcript.participants,
            summary: transcript.summary,
            decisions: transcript.decisions,
            actionItems: transcript.actionItems,
            rawExcerpts: transcript.rawExcerpts,
          }
        : null,
    };
  });

  return {
    data: enrichedResults,
    sources: results.map((r) => ({
      source: r.document.source === "granola" ? "Granola" : "Circleback",
      label: r.document.title,
      date: r.document.date,
      confidence: r.score > 0.3 ? "high" : r.score > 0.1 ? "medium" : ("low" as const),
      freshnessNote: getDaysAgo(r.document.date),
    })),
    timestamp: new Date().toISOString(),
  };
}

export function handle_get_linear_tasks(input: {
  clientId?: string;
  status?: string;
  priority?: string;
  label?: string;
}): ToolResult {
  let tasks = [...linearTasks];
  const resolvedClientId = resolveClientId(input.clientId);

  if (resolvedClientId) tasks = tasks.filter((t) => t.clientId === resolvedClientId);
  if (input.status && input.status !== "all") tasks = tasks.filter((t) => t.status === input.status);
  if (input.priority && input.priority !== "all") tasks = tasks.filter((t) => t.priority === input.priority);
  if (input.label) tasks = tasks.filter((t) => t.labels.includes(input.label!));

  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => {
    const diff = (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    return diff !== 0 ? diff : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const clientNames = new Set(tasks.map((t) => getClientById(t.clientId)?.name ?? t.clientId));

  return {
    data: tasks,
    sources: [
      {
        source: "Linear",
        label: `Tasks for ${Array.from(clientNames).join(", ")}`,
        date: new Date().toISOString().split("T")[0],
        confidence: "high",
        freshnessNote: "Real-time (simulated)",
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function handle_get_notion_docs(input: {
  clientId?: string;
  query?: string;
  docType?: string;
}): ToolResult {
  let docs = [...notionDocs];
  const resolvedClientId = resolveClientId(input.clientId);

  if (resolvedClientId) docs = docs.filter((d) => d.clientId === resolvedClientId);
  if (input.docType && input.docType !== "all") docs = docs.filter((d) => d.type === input.docType);

  if (input.query) {
    const engine = getSearchEngine();
    const results = engine.search(input.query, { clientId: resolvedClientId, type: "notion", topK: 5 });
    const matchedIds = new Set(results.map((r) => (r.document.metadata as Record<string, unknown>).docId as string));
    docs = docs.filter((d) => matchedIds.has(d.id) || docs.length <= 3);
  }

  return {
    data: docs,
    sources: docs.map((d) => ({
      source: "Notion",
      label: d.title,
      date: d.lastUpdated,
      confidence: "medium" as const,
      freshnessNote: `Last updated ${getDaysAgo(d.lastUpdated)} — may lag behind Slack/Linear`,
    })),
    timestamp: new Date().toISOString(),
  };
}

export function handle_get_slack_messages(input: {
  clientId?: string;
  query?: string;
  decisionsOnly?: boolean;
  limit?: number;
}): ToolResult {
  let messages = [...slackMessages];
  const resolvedClientId = resolveClientId(input.clientId);

  if (resolvedClientId) messages = messages.filter((m) => m.clientId === resolvedClientId);
  if (input.decisionsOnly) messages = messages.filter((m) => m.isDecision);
  if (input.query) {
    const q = input.query.toLowerCase();
    messages = messages.filter((m) => m.text.toLowerCase().includes(q) || m.author.toLowerCase().includes(q));
  }

  messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  messages = messages.slice(0, input.limit ?? 10);

  return {
    data: messages,
    sources: [
      {
        source: "Slack",
        label: `#${[...new Set(messages.map((m) => m.channel))].join(", #")}`,
        date: messages[0]?.timestamp?.split("T")[0] ?? new Date().toISOString().split("T")[0],
        confidence: "high",
        freshnessNote: "Most recent source — minutes latency",
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function handle_get_calendar_events(input: {
  clientId?: string;
  upcoming?: boolean;
  limit?: number;
}): ToolResult {
  const now = new Date("2026-05-25");
  const resolvedClientId = resolveClientId(input.clientId);
  const filterUpcoming = input.upcoming !== false;

  let events = calendarEvents.filter((e) => {
    if (resolvedClientId && e.clientId !== resolvedClientId) return false;
    if (filterUpcoming && new Date(e.date) < now) return false;
    return true;
  });

  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  events = events.slice(0, input.limit ?? 5);

  return {
    data: events,
    sources: [
      {
        source: "Google Calendar",
        label: `Upcoming meetings — ${resolvedClientId ? getClientById(resolvedClientId)?.name : "all clients"}`,
        date: new Date().toISOString().split("T")[0],
        confidence: "high",
        freshnessNote: "Synced in real-time",
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function handle_get_all_clients(input: { statusFilter?: string }): ToolResult {
  const result = input.statusFilter && input.statusFilter !== "all"
    ? clients.filter((c) => c.status === input.statusFilter)
    : [...clients];

  return {
    data: result,
    sources: [
      {
        source: "Internal CRM",
        label: "All active clients",
        date: new Date().toISOString().split("T")[0],
        confidence: "high",
        freshnessNote: "Live",
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function handle_detect_conflicts(input: { clientId: string; topic: string }): ToolResult {
  const engine = getSearchEngine();
  const resolvedClientId = resolveClientId(input.clientId);

  const transcriptResults = engine.search(input.topic, { clientId: resolvedClientId, type: "transcript", topK: 3 });
  const slackResults = engine.search(input.topic, { clientId: resolvedClientId, type: "slack", topK: 3 });
  const linearResults = engine.search(input.topic, { clientId: resolvedClientId, type: "task", topK: 3 });
  const notionResults = engine.search(input.topic, { clientId: resolvedClientId, type: "notion", topK: 2 });

  return {
    data: {
      client: getClientById(resolvedClientId ?? input.clientId)?.name,
      topic: input.topic,
      bySource: {
        transcripts: transcriptResults.map((r) => ({ date: r.document.date, content: r.document.content.slice(0, 300), title: r.document.title, source: r.document.source, score: r.score })),
        slack: slackResults.map((r) => ({ date: r.document.date, content: r.document.content, title: r.document.title, timestamp: (r.document.metadata as Record<string, unknown>).timestamp, isDecision: (r.document.metadata as Record<string, unknown>).isDecision, score: r.score })),
        linear: linearResults.map((r) => ({ date: r.document.date, content: r.document.content.slice(0, 300), title: r.document.title, status: (r.document.metadata as Record<string, unknown>).status, score: r.score })),
        notion: notionResults.map((r) => ({ date: r.document.date, content: r.document.content.slice(0, 300), title: r.document.title, score: r.score })),
      },
      // Slack (newest decision) > transcript > Linear > Notion — surface conflicts explicitly, never pick silently
      conflictResolutionRules: "1. Slack decision (newest) wins. 2. Transcript = what was promised. 3. Linear = what is being done. 4. Notion = historical record (may be stale). 5. Always surface conflicts explicitly.",
    },
    sources: [
      { source: "Granola", label: "Meeting transcripts", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Slack", label: "Team channel messages", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Linear", label: "Task tracker", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Notion", label: "Project docs", date: new Date().toISOString().split("T")[0], confidence: "medium" },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function handle_generate_meeting_brief(input: { clientId: string; meetingDate?: string }): ToolResult {
  const resolvedClientId = resolveClientId(input.clientId) ?? input.clientId;
  const recentTranscripts = getTranscriptsByClient(resolvedClientId).slice(0, 2);
  const openTasks = getTasksByClient(resolvedClientId).filter((t) => t.status !== "done" && t.status !== "cancelled");
  const notionWiki = getDocsByClient(resolvedClientId).find((d) => d.type === "wiki" || d.type === "project-brief");

  return {
    data: {
      client: getClientById(resolvedClientId),
      upcomingMeeting: getUpcomingMeetings(resolvedClientId)[0] ?? null,
      lastMeeting: recentTranscripts[0] ?? null,
      openActionItems: recentTranscripts.flatMap((t) => t.actionItems.filter((a) => a.status === "open" || a.status === "overdue")),
      blockedTasks: openTasks.filter((t) => t.labels.includes("blocked") || t.labels.includes("at-risk")),
      openTasks: openTasks.slice(0, 5),
      recentSlackContext: getSlackByClient(resolvedClientId).slice(0, 5),
      projectContext: notionWiki,
    },
    sources: [
      { source: "Granola", label: "Last meeting transcript", date: recentTranscripts[0]?.date ?? "", confidence: "high" },
      { source: "Linear", label: "Open tasks", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Slack", label: "Recent team discussion", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Google Calendar", label: "Upcoming meeting", date: new Date().toISOString().split("T")[0], confidence: "high" },
      { source: "Notion", label: "Project brief", date: notionWiki?.lastUpdated ?? "", confidence: "medium", freshnessNote: "May not reflect latest decisions" },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function executeToolCall(toolName: string, input: Record<string, unknown>): ToolResult {
  switch (toolName) {
    case "search_meeting_transcripts": return handle_search_meeting_transcripts(input as Parameters<typeof handle_search_meeting_transcripts>[0]);
    case "get_linear_tasks":           return handle_get_linear_tasks(input as Parameters<typeof handle_get_linear_tasks>[0]);
    case "get_notion_docs":            return handle_get_notion_docs(input as Parameters<typeof handle_get_notion_docs>[0]);
    case "get_slack_messages":         return handle_get_slack_messages(input as Parameters<typeof handle_get_slack_messages>[0]);
    case "get_calendar_events":        return handle_get_calendar_events(input as Parameters<typeof handle_get_calendar_events>[0]);
    case "get_all_clients":            return handle_get_all_clients(input as Parameters<typeof handle_get_all_clients>[0]);
    case "detect_conflicts":           return handle_detect_conflicts(input as Parameters<typeof handle_detect_conflicts>[0]);
    case "generate_meeting_brief":     return handle_generate_meeting_brief(input as Parameters<typeof handle_generate_meeting_brief>[0]);
    default:                           return { data: { error: `Unknown tool: ${toolName}` }, sources: [], timestamp: new Date().toISOString() };
  }
}

function getDaysAgo(dateStr: string): string {
  const diffDays = Math.floor((new Date("2026-05-25").getTime() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  return `${Math.floor(diffDays / 7)} weeks ago`;
}
