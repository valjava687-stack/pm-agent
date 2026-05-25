# PM Agent

An agentic PM that acts as the institutional memory layer for a growth agency managing multiple B2B clients in parallel.
Instead of founders spending half a day assembling project updates across meetings, Slack threads, tasks, and docs, they simply ask the agent.

---

## What it does

Answers questions like a senior PM who attended every meeting and read every document:

- *"How is TechFlow SaaS doing this week?"*
- *"What's pending with Nexora Health after the last meeting?"*
- *"Which projects are at risk right now?"*
- *"Prepare a brief for my meeting tomorrow with Arcana Finance."*
- *"What did we promise Logix Retail last month and what have we delivered?"*

When sources conflict — e.g. a meeting decided X, but Slack from two days later says Y — the agent surfaces the conflict explicitly with timestamps rather than silently picking one.

---

## Architecture

```
User query
    │
    ▼
Claude claude-sonnet-4-6 (agentic tool-use loop)
    │
    ├── search_meeting_transcripts  →  Granola / Circleback  (pre-indexed TF-IDF)
    ├── get_linear_tasks            →  Linear                (structured query)
    ├── get_notion_docs             →  Notion                (pre-indexed TF-IDF)
    ├── get_slack_messages          →  Slack                 (recency-weighted)
    ├── get_calendar_events         →  Google Calendar       (date filter)
    ├── get_all_clients             →  Portfolio overview
    ├── detect_conflicts            →  Cross-source temporal analysis
    └── generate_meeting_brief      →  Multi-source synthesis
    │
    ▼
Streaming response with source citations + freshness metadata
```

### Source freshness hierarchy

When sources conflict, the agent applies this precedence:

```
Slack (newest decision message)
  > Meeting transcript (what was decided and promised)
    > Linear (what is currently being executed)
      > Notion (written record — may be stale)
```

Conflicts are always surfaced explicitly. The agent never silently picks one version.

### Real-time vs pre-indexed

| Source | Strategy | Why |
|--------|----------|-----|
| Granola / Circleback | Pre-indexed at startup | Long documents, don't change post-generation — search value > recency |
| Notion | Pre-indexed at startup | Stable docs, updated infrequently |
| Slack | Pre-indexed + recency sort | High volume; newest messages weighted highest |
| Linear | Queried on demand | Task status changes hourly — stale state is worse than no state |
| Google Calendar | Queried on demand | Meeting times are exact facts — must be live |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| AI | Claude claude-sonnet-4-6 via Anthropic SDK |
| Search | In-memory TF-IDF (swap path: pgvector + real embeddings) |
| Streaming | Server-Sent Events |
| UI | React + Tailwind CSS v4 |
| Language | TypeScript |
| Deploy | Vercel |

---

## Getting started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com)

### Install

```bash
git clone https://github.com/valjava687-stack/pm-agent
cd pm-agent
npm install
```

### Configure

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

The `vercel.json` in this repo sets a 60s timeout on the chat API route to accommodate the agentic loop.

---

## Demo data

Five clients with realistic scenarios designed to demonstrate key agent behaviors:

| Client | Status | Key scenario |
|--------|--------|-------------|
| TechFlow SaaS | At Risk | Content strategy conflict across Granola/Slack/Linear; overdue API docs |
| Nexora Health | On Track | HubSpot email automation paused for HIPAA legal review |
| Logix Retail | Blocked | Creative deliverables 3 weeks overdue; CEO escalation imminent |
| Arcana Finance | On Track | Strong week-1 outbound results; expanding ICP to mid-market |
| Verdant Ops | On Track | Early-stage SEO engagement; SEO audit in review |

---

## Connecting real data sources

The tool layer in `src/lib/tool-handlers.ts` is the only file that changes when connecting real APIs. Each handler returns the same `ToolResult` shape — swap the mock data for real API calls:

| Source | Integration path |
|--------|-----------------|
| Linear | GraphQL API — `POST https://api.linear.app/graphql` |
| Notion | REST API — `GET /v1/databases/{id}/query` |
| Slack | Web API — `GET /api/conversations.history` |
| Granola | Webhook export or MCP server |
| Google Calendar | OAuth2 + `GET /calendars/{id}/events` |

For transcript and doc search at scale, replace the in-memory TF-IDF engine in `src/lib/vector-search.ts` with pgvector (Supabase) or Pinecone using real embeddings.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                 # Root — renders ChatInterface
│   ├── layout.tsx
│   ├── globals.css
│   └── api/chat/route.ts        # Streaming SSE endpoint + agentic loop
├── components/
│   ├── ChatInterface.tsx        # Main chat UI with SSE streaming
│   ├── ClientSidebar.tsx        # Client list + status indicators
│   ├── ToolCallIndicator.tsx    # Live tool call status badges
│   ├── SourceCitations.tsx      # Source pills with freshness metadata
│   └── MessageRenderer.tsx      # Markdown renderer
├── data/
│   └── mock-data.ts             # Demo data: 5 clients, transcripts, tasks, docs
└── lib/
    ├── agent.ts                 # System prompt + example queries
    ├── tools.ts                 # Tool definitions (Anthropic SDK format)
    ├── tool-handlers.ts         # Tool execution + source citation logic
    ├── vector-search.ts         # In-memory TF-IDF search engine
    └── utils.ts                 # Source icons, colors, formatting
```

## Future Improvements

- Real embeddings via pgvector or Pinecone
- Real-time Slack webhook ingestion
- OAuth + role-based access control
- Write-back actions (Linear task creation, Notion updates)
- Multi-agent workflow orchestration
- Long-term memory persistence
- WhatsApp ingestion pipeline
