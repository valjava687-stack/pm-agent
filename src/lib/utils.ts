import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function getSourceIcon(source: string): string {
  const icons: Record<string, string> = {
    Granola: "🎙️",
    Circleback: "🎙️",
    Linear: "🔷",
    Notion: "📄",
    Slack: "💬",
    "Google Calendar": "📅",
    "Internal CRM": "🏢",
    GitHub: "🐙",
  };
  return icons[source] ?? "📌";
}

export function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    Granola: "bg-purple-100 text-purple-800 border-purple-200",
    Circleback: "bg-purple-100 text-purple-800 border-purple-200",
    Linear: "bg-blue-100 text-blue-800 border-blue-200",
    Notion: "bg-gray-100 text-gray-800 border-gray-200",
    Slack: "bg-green-100 text-green-800 border-green-200",
    "Google Calendar": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Internal CRM": "bg-orange-100 text-orange-800 border-orange-200",
  };
  return colors[source] ?? "bg-slate-100 text-slate-800 border-slate-200";
}

export function getToolLabel(toolName: string): string {
  const labels: Record<string, string> = {
    search_meeting_transcripts: "Searching meeting transcripts",
    get_linear_tasks: "Querying Linear tasks",
    get_notion_docs: "Reading Notion docs",
    get_slack_messages: "Checking Slack messages",
    get_calendar_events: "Looking up calendar",
    get_all_clients: "Loading client portfolio",
    detect_conflicts: "Detecting conflicts across sources",
    generate_meeting_brief: "Generating meeting brief",
  };
  return labels[toolName] ?? toolName;
}

export function getToolIcon(toolName: string): string {
  const icons: Record<string, string> = {
    search_meeting_transcripts: "🎙️",
    get_linear_tasks: "🔷",
    get_notion_docs: "📄",
    get_slack_messages: "💬",
    get_calendar_events: "📅",
    get_all_clients: "🏢",
    detect_conflicts: "⚠️",
    generate_meeting_brief: "📋",
  };
  return icons[toolName] ?? "🔍";
}
