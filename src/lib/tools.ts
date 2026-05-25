import type { Tool } from "@anthropic-ai/sdk/resources/messages";

export const PM_TOOLS: Tool[] = [
  {
    name: "search_meeting_transcripts",
    description:
      "Search Granola and Circleback meeting transcripts. Use this to find: decisions made in meetings, what was promised to a client, action items from past meetings, or context about why something was decided. Always call this when the user asks about past meetings, promises, or decisions.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Natural language search query. e.g. 'what was decided about content strategy'",
        },
        clientId: {
          type: "string",
          description: "Filter by client ID (e.g. client-a, client-b). If omitted, searches all clients.",
        },
        limit: {
          type: "number",
          description: "Max number of results to return. Default: 3",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_linear_tasks",
    description:
      "Get tasks and project status from Linear. Use this to find: current sprint tasks, what's in progress, what's blocked, what was recently completed, or task assignments. This is the most current view of what the team is actually working on.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Filter by client ID. Required if querying a specific client.",
        },
        status: {
          type: "string",
          enum: ["backlog", "in-progress", "in-review", "done", "cancelled", "all"],
          description: "Filter by task status. Use 'all' for everything.",
        },
        priority: {
          type: "string",
          enum: ["urgent", "high", "medium", "low", "all"],
          description: "Filter by priority level.",
        },
        label: {
          type: "string",
          description: "Filter by label (e.g. 'blocked', 'at-risk', 'hubspot')",
        },
      },
      required: [],
    },
  },
  {
    name: "get_notion_docs",
    description:
      "Retrieve project documentation from Notion. Use this to find: project briefs, current strategy, wiki content, meeting minutes, and written commitments. Notion is the 'official' record but may be less current than Slack or Linear.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Filter by client ID.",
        },
        query: {
          type: "string",
          description: "Search within Notion docs. Optional.",
        },
        docType: {
          type: "string",
          enum: ["project-brief", "meeting-notes", "proposal", "wiki", "retrospective", "all"],
          description: "Filter by document type.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_slack_messages",
    description:
      "Get recent Slack messages for a client channel. Use this to find: quick decisions made outside meetings, team discussions, escalations, and the most recent context. Slack is the MOST RECENT source and should be weighted heavily for current status.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Filter by client ID.",
        },
        query: {
          type: "string",
          description: "Search within Slack messages.",
        },
        decisionsOnly: {
          type: "boolean",
          description: "If true, return only messages marked as decisions.",
        },
        limit: {
          type: "number",
          description: "Max messages to return. Default: 10",
        },
      },
      required: [],
    },
  },
  {
    name: "get_calendar_events",
    description:
      "Get upcoming and past calendar events. Use this to find: when the next meeting with a client is, who attended past meetings, or to prepare a meeting brief.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Filter by client ID.",
        },
        upcoming: {
          type: "boolean",
          description: "If true, return only future meetings. Default: true",
        },
        limit: {
          type: "number",
          description: "Max events to return. Default: 5",
        },
      },
      required: [],
    },
  },
  {
    name: "get_all_clients",
    description:
      "Get a list of all active clients and their current status. Use this when the user asks about all projects, which projects are at risk, or wants an overview of the agency's portfolio.",
    input_schema: {
      type: "object" as const,
      properties: {
        statusFilter: {
          type: "string",
          enum: ["on-track", "at-risk", "blocked", "completed", "all"],
          description: "Filter by project status. Use 'all' for all clients.",
        },
      },
      required: [],
    },
  },
  {
    name: "detect_conflicts",
    description:
      "Detect conflicting information about a topic across sources (transcripts, Linear, Slack, Notion). Use this when you see inconsistencies between what was decided in a meeting vs. what Linear shows vs. what Slack says. Always call this if you notice conflicting signals before giving a final answer.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Client to check for conflicts.",
        },
        topic: {
          type: "string",
          description: "The specific topic to check for conflicts (e.g. 'content strategy', 'API docs deadline').",
        },
      },
      required: ["clientId", "topic"],
    },
  },
  {
    name: "generate_meeting_brief",
    description:
      "Generate a structured pre-meeting brief for an upcoming client meeting. Pulls together: last meeting summary, open action items, current blockers, topics to discuss. Use this when the user asks to 'prepare a brief' or 'prep for a meeting'.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientId: {
          type: "string",
          description: "Client to generate the brief for.",
        },
        meetingDate: {
          type: "string",
          description: "Date of the upcoming meeting (ISO format). Used to identify the right calendar event.",
        },
      },
      required: ["clientId"],
    },
  },
];
