// Rich mock data simulating a growth agency with 5 active B2B clients

export interface Client {
  id: string;
  name: string;
  industry: string;
  accountLead: string;
  status: "on-track" | "at-risk" | "blocked" | "completed";
  startDate: string;
  contractValue: number;
  description: string;
}

export interface MeetingTranscript {
  id: string;
  clientId: string;
  date: string;
  participants: string[];
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
  rawExcerpts: string[];
  source: "granola" | "circleback";
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: "open" | "done" | "overdue";
  createdAt: string;
}

export interface LinearTask {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: "backlog" | "in-progress" | "in-review" | "done" | "cancelled";
  priority: "urgent" | "high" | "medium" | "low";
  assignee: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  labels: string[];
  cycle?: string;
  linkedDecision?: string;
}

export interface NotionDoc {
  id: string;
  clientId: string;
  title: string;
  type: "project-brief" | "meeting-notes" | "proposal" | "wiki" | "retrospective";
  content: string;
  lastUpdated: string;
  author: string;
}

export interface SlackMessage {
  id: string;
  clientId: string;
  channel: string;
  author: string;
  timestamp: string;
  text: string;
  threadId?: string;
  isDecision?: boolean;
}

export interface CalendarEvent {
  id: string;
  clientId: string;
  title: string;
  date: string;
  duration: number; // minutes
  attendees: string[];
  type: "weekly-sync" | "strategy" | "review" | "onboarding";
  meetingLink?: string;
}

// ─── CLIENTS ─────────────────────────────────────────────────────────────────

export const clients: Client[] = [
  {
    id: "client-a",
    name: "TechFlow SaaS",
    industry: "B2B SaaS",
    accountLead: "Sofia Reyes",
    status: "at-risk",
    startDate: "2026-01-15",
    contractValue: 48000,
    description: "Product-led growth strategy + content engine for a DevOps automation SaaS. Goal: 3x MQL by Q3.",
  },
  {
    id: "client-b",
    name: "Nexora Health",
    industry: "HealthTech",
    accountLead: "Marcus Chen",
    status: "on-track",
    startDate: "2026-02-01",
    contractValue: 72000,
    description: "Full-funnel demand gen + HubSpot implementation for a B2B telemedicine platform.",
  },
  {
    id: "client-c",
    name: "Logix Retail",
    industry: "Retail Tech",
    accountLead: "Sofia Reyes",
    status: "blocked",
    startDate: "2025-11-01",
    contractValue: 36000,
    description: "Performance marketing + CRO for e-commerce logistics SaaS. Blocked on client creative approvals.",
  },
  {
    id: "client-d",
    name: "Arcana Finance",
    industry: "FinTech",
    accountLead: "Jordan Park",
    status: "on-track",
    startDate: "2026-03-01",
    contractValue: 90000,
    description: "Go-to-market strategy and outbound sales infrastructure for a B2B payments startup.",
  },
  {
    id: "client-e",
    name: "Verdant Ops",
    industry: "PropTech",
    accountLead: "Marcus Chen",
    status: "on-track",
    startDate: "2026-04-01",
    contractValue: 30000,
    description: "SEO + inbound playbook for a property management SaaS. Early stage engagement.",
  },
];

// ─── MEETING TRANSCRIPTS (Granola / Circleback) ────────────────────────────

export const transcripts: MeetingTranscript[] = [
  {
    id: "t-001",
    clientId: "client-a",
    date: "2026-05-20",
    participants: ["Sofia Reyes", "Alex Muno (client)", "Dana Wu (client)"],
    source: "granola",
    summary:
      "Weekly sync with TechFlow. Main discussion around the content strategy pivot — client wants to shift from long-form blog to video-first. Sofia pushed back, agreed to test both formats over 3 weeks. Dev team reported the analytics dashboard integration is 2 weeks behind due to API changes on TechFlow's side.",
    decisions: [
      "Run a 3-week A/B test: 2 long-form posts vs. 2 video shorts per week",
      "TechFlow will provide updated API docs by May 23rd",
      "Delay launch of SEO module to June 10th to align with content test results",
    ],
    actionItems: [
      {
        id: "ai-001",
        description: "Produce 2 long-form blog posts for A/B test",
        assignee: "Sofia Reyes",
        dueDate: "2026-05-27",
        status: "open",
        createdAt: "2026-05-20",
      },
      {
        id: "ai-002",
        description: "Provide updated API documentation for analytics integration",
        assignee: "Dana Wu (client)",
        dueDate: "2026-05-23",
        status: "overdue",
        createdAt: "2026-05-20",
      },
      {
        id: "ai-003",
        description: "Reschedule SEO module launch to June 10th in Linear",
        assignee: "Sofia Reyes",
        dueDate: "2026-05-21",
        status: "done",
        createdAt: "2026-05-20",
      },
    ],
    rawExcerpts: [
      "Alex: 'We really want to lean into video. Our LinkedIn video posts are killing it organically.'",
      "Sofia: 'I hear you but we shouldn't abandon the SEO content entirely — let's test both and let the data decide in 3 weeks.'",
      "Alex: 'Fair. Dana, can you get us those API docs by Friday?' Dana: 'Should be doable.'",
    ],
  },
  {
    id: "t-002",
    clientId: "client-a",
    date: "2026-05-13",
    participants: ["Sofia Reyes", "Alex Muno (client)"],
    source: "granola",
    summary:
      "Bi-weekly strategy review. Discussed Q2 MQL performance — currently at 47% of target. Root cause identified as weak top-of-funnel content. Agreed to double content velocity starting next sprint.",
    decisions: [
      "Double content output from 2 to 4 pieces per week",
      "Hire freelance technical writer to support content volume",
      "Sofia to present revised Q2 forecast by EOW",
    ],
    actionItems: [
      {
        id: "ai-004",
        description: "Post freelance technical writer job on Toptal",
        assignee: "Sofia Reyes",
        dueDate: "2026-05-16",
        status: "done",
        createdAt: "2026-05-13",
      },
      {
        id: "ai-005",
        description: "Deliver revised Q2 MQL forecast",
        assignee: "Sofia Reyes",
        dueDate: "2026-05-16",
        status: "done",
        createdAt: "2026-05-13",
      },
    ],
    rawExcerpts: [
      "Alex: 'We're at 47% of MQL target. That's not great.'",
      "Sofia: 'The top-of-funnel is starved. We need more content volume. I can get us to 4 pieces a week if we bring in a freelancer.'",
    ],
  },
  {
    id: "t-003",
    clientId: "client-b",
    date: "2026-05-21",
    participants: ["Marcus Chen", "Rachel Kim (client)", "Tom Bauer (client CTO)"],
    source: "circleback",
    summary:
      "HubSpot implementation checkpoint. Pipeline fully migrated, 3 workflows live. CTO flagged a HIPAA compliance concern about contact data syncing to HubSpot — need legal sign-off before activating email automation. Everything else on track.",
    decisions: [
      "Pause email automation activation pending legal review",
      "Legal team will assess HubSpot data handling by May 28th",
      "All other HubSpot workflows remain active",
    ],
    actionItems: [
      {
        id: "ai-006",
        description: "Draft data handling memo for legal team",
        assignee: "Marcus Chen",
        dueDate: "2026-05-23",
        status: "done",
        createdAt: "2026-05-21",
      },
      {
        id: "ai-007",
        description: "Legal team sign-off on HubSpot HIPAA compliance",
        assignee: "Rachel Kim (client)",
        dueDate: "2026-05-28",
        status: "open",
        createdAt: "2026-05-21",
      },
    ],
    rawExcerpts: [
      "Tom: 'Before we flip on email automation, I need our legal team to look at how contact data flows into HubSpot. HIPAA exposure.'",
      "Marcus: 'Totally valid. I'll draft a memo for them — can your team turn it around by the 28th?'",
      "Rachel: 'Yes, I'll make sure they prioritize it.'",
    ],
  },
  {
    id: "t-004",
    clientId: "client-c",
    date: "2026-05-19",
    participants: ["Sofia Reyes", "Ben Torres (client)"],
    source: "granola",
    summary:
      "Logix Retail catch-up. Third consecutive week the client has not delivered approved ad creatives. Campaign launch is now blocked. Sofia escalated — if creatives aren't delivered by May 26th, Q2 performance targets are unachievable. Client acknowledged the delay is on their marketing manager who is out sick.",
    decisions: [
      "Hard deadline: creatives must be delivered by May 26th or Q2 targets are at risk",
      "If deadline missed, Sofia will escalate to Logix CEO",
      "Consider offering Muno Labs creative production as add-on service",
    ],
    actionItems: [
      {
        id: "ai-008",
        description: "Deliver approved ad creatives for Q2 campaigns",
        assignee: "Ben Torres (client)",
        dueDate: "2026-05-26",
        status: "open",
        createdAt: "2026-05-19",
      },
      {
        id: "ai-009",
        description: "Prepare escalation email draft to Logix CEO if deadline missed",
        assignee: "Sofia Reyes",
        dueDate: "2026-05-26",
        status: "open",
        createdAt: "2026-05-19",
      },
    ],
    rawExcerpts: [
      "Sofia: 'Ben, this is the third week. Without creatives, we literally cannot launch. Q2 is at risk.'",
      "Ben: 'I know, I know. Maria is out sick. I'm covering but it's chaos.'",
      "Sofia: 'I need a hard commitment: May 26th. If we miss that, I'll need to talk to your CEO directly.'",
    ],
  },
  {
    id: "t-005",
    clientId: "client-d",
    date: "2026-05-22",
    participants: ["Jordan Park", "Priya Nair (client CEO)", "Sam Liu (client VP Sales)"],
    source: "circleback",
    summary:
      "Arcana Finance sprint review. Outbound sequence V1 is live — 127 prospects contacted, 11 replies, 3 demos booked. Client is happy. Discussion about expanding ICP to include mid-market CFOs. Jordan proposed a LinkedIn content play to support outbound. Agreed to start LinkedIn content in June.",
    decisions: [
      "Expand ICP research to include mid-market CFOs (from SMB only)",
      "Begin LinkedIn thought leadership content for Priya in June",
      "Maintain current outbound cadence — don't scale until demo-to-close rate confirmed",
    ],
    actionItems: [
      {
        id: "ai-010",
        description: "Research mid-market CFO persona and update ICP doc",
        assignee: "Jordan Park",
        dueDate: "2026-05-29",
        status: "open",
        createdAt: "2026-05-22",
      },
      {
        id: "ai-011",
        description: "Draft LinkedIn content calendar for June (Priya Nair's voice)",
        assignee: "Jordan Park",
        dueDate: "2026-05-30",
        status: "open",
        createdAt: "2026-05-22",
      },
    ],
    rawExcerpts: [
      "Priya: '127 outreach, 11 replies, 3 demos — I'm genuinely impressed for week one.'",
      "Sam: 'The messaging is resonating. I want to see what happens if we go mid-market.'",
      "Jordan: 'Let's validate the demo-to-close rate first before we scale. But I love adding LinkedIn — let's talk June.'",
    ],
  },
  {
    id: "t-006",
    clientId: "client-a",
    date: "2026-05-06",
    participants: ["Sofia Reyes", "Alex Muno (client)", "Dana Wu (client)"],
    source: "granola",
    summary:
      "Month 4 strategy review. Decided to invest heavily in SEO content as primary growth channel. Engineering to build analytics dashboard for content performance tracking. Alex committed to 6-month contract extension.",
    decisions: [
      "SEO content to be primary growth channel for Q2/Q3",
      "Build proprietary analytics dashboard — target launch May 20th",
      "Contract extended 6 months through December 2026",
    ],
    actionItems: [
      {
        id: "ai-012",
        description: "Build analytics dashboard MVP",
        assignee: "Muno Dev Team",
        dueDate: "2026-05-20",
        status: "overdue",
        createdAt: "2026-05-06",
      },
    ],
    rawExcerpts: [
      "Alex: 'SEO is where we want to double down. The organic stuff is working.'",
      "Sofia: 'Agreed. We'll make it the primary channel. Let's build a proper dashboard to track it.'",
    ],
  },
];

// ─── LINEAR TASKS ──────────────────────────────────────────────────────────

export const linearTasks: LinearTask[] = [
  // TechFlow SaaS tasks
  {
    id: "tf-001",
    clientId: "client-a",
    title: "Analytics Dashboard — API Integration",
    description: "Connect TechFlow's content analytics to our reporting dashboard. Blocked waiting for their new API docs (v2.1).",
    status: "in-progress",
    priority: "urgent",
    assignee: "Dev Team",
    createdAt: "2026-05-06",
    updatedAt: "2026-05-22",
    dueDate: "2026-06-10",
    labels: ["technical", "blocked"],
    cycle: "Sprint 8",
    linkedDecision: "Delayed from May 20 to June 10 due to API changes on client side",
  },
  {
    id: "tf-002",
    clientId: "client-a",
    title: "Content A/B Test — Long-form vs Video",
    description: "Set up tracking for 3-week content format test. Long-form (2/wk) vs video shorts (2/wk). Measure: MQL conversion, time-on-page, LinkedIn engagement.",
    status: "in-progress",
    priority: "high",
    assignee: "Sofia Reyes",
    createdAt: "2026-05-20",
    updatedAt: "2026-05-20",
    dueDate: "2026-06-10",
    labels: ["content", "experiment"],
    cycle: "Sprint 8",
  },
  {
    id: "tf-003",
    clientId: "client-a",
    title: "Hire Freelance Technical Writer",
    description: "Post on Toptal, interview, and onboard technical writer to support 4x/week content cadence.",
    status: "in-review",
    priority: "high",
    assignee: "Sofia Reyes",
    createdAt: "2026-05-13",
    updatedAt: "2026-05-18",
    labels: ["hiring", "content"],
    cycle: "Sprint 7",
  },
  {
    id: "tf-004",
    clientId: "client-a",
    title: "SEO Module Launch",
    description: "Launch SEO optimization module. Delayed to June 10th pending content test results.",
    status: "backlog",
    priority: "medium",
    assignee: "Dev Team",
    createdAt: "2026-04-01",
    updatedAt: "2026-05-20",
    dueDate: "2026-06-10",
    labels: ["seo", "technical"],
    cycle: "Sprint 9",
  },
  // Nexora Health tasks
  {
    id: "nh-001",
    clientId: "client-b",
    title: "HubSpot Email Automation — HIPAA Review",
    description: "Email automation setup complete but activation paused pending legal HIPAA review of contact data sync. Resume after sign-off (target: May 28).",
    status: "in-progress",
    priority: "high",
    assignee: "Marcus Chen",
    createdAt: "2026-05-21",
    updatedAt: "2026-05-21",
    dueDate: "2026-05-28",
    labels: ["hubspot", "compliance", "blocked"],
    cycle: "Sprint 5",
  },
  {
    id: "nh-002",
    clientId: "client-b",
    title: "HubSpot Pipeline Migration",
    description: "Full migration of existing CRM data to HubSpot. 3 workflows configured and live.",
    status: "done",
    priority: "urgent",
    assignee: "Marcus Chen",
    createdAt: "2026-04-15",
    updatedAt: "2026-05-15",
    labels: ["hubspot", "migration"],
    cycle: "Sprint 4",
  },
  {
    id: "nh-003",
    clientId: "client-b",
    title: "Demand Gen Campaign — Q2 Launch",
    description: "Full-funnel campaign: LinkedIn + Google Ads targeting healthcare administrators. Budget: $15k/month.",
    status: "in-progress",
    priority: "high",
    assignee: "Marcus Chen",
    createdAt: "2026-05-01",
    updatedAt: "2026-05-20",
    dueDate: "2026-05-30",
    labels: ["paid-media", "demand-gen"],
    cycle: "Sprint 5",
  },
  // Logix Retail tasks
  {
    id: "lr-001",
    clientId: "client-c",
    title: "Q2 Performance Campaigns — BLOCKED",
    description: "Campaign strategy ready, ad sets configured. BLOCKED: waiting for client to deliver approved creatives. Hard deadline May 26th or Q2 targets are unachievable.",
    status: "in-progress",
    priority: "urgent",
    assignee: "Sofia Reyes",
    createdAt: "2026-04-20",
    updatedAt: "2026-05-19",
    dueDate: "2026-05-26",
    labels: ["paid-media", "blocked", "at-risk"],
    cycle: "Sprint 6",
  },
  {
    id: "lr-002",
    clientId: "client-c",
    title: "CRO Audit — Landing Pages",
    description: "Audit and optimize 4 key landing pages. Waiting for campaign launch before implementing CRO changes.",
    status: "backlog",
    priority: "medium",
    assignee: "Sofia Reyes",
    createdAt: "2026-05-01",
    updatedAt: "2026-05-01",
    labels: ["cro", "on-hold"],
    cycle: "Sprint 7",
  },
  // Arcana Finance tasks
  {
    id: "af-001",
    clientId: "client-d",
    title: "Outbound Sequence V2 — Mid-market CFO",
    description: "Expand outbound to mid-market CFOs. Requires new ICP research and updated messaging framework.",
    status: "backlog",
    priority: "high",
    assignee: "Jordan Park",
    createdAt: "2026-05-22",
    updatedAt: "2026-05-22",
    dueDate: "2026-06-15",
    labels: ["outbound", "icp"],
    cycle: "Sprint 3",
  },
  {
    id: "af-002",
    clientId: "client-d",
    title: "Outbound Sequence V1 — Active",
    description: "Initial outbound to SMB finance decision-makers. 127 contacted, 11 replies, 3 demos booked. Maintaining cadence.",
    status: "in-progress",
    priority: "high",
    assignee: "Jordan Park",
    createdAt: "2026-05-01",
    updatedAt: "2026-05-22",
    labels: ["outbound", "active"],
    cycle: "Sprint 2",
  },
  {
    id: "af-003",
    clientId: "client-d",
    title: "LinkedIn Content Calendar — Priya Nair",
    description: "Draft 4-week LinkedIn thought leadership content for CEO Priya Nair. Voice: data-driven, founder perspective. Start June.",
    status: "backlog",
    priority: "medium",
    assignee: "Jordan Park",
    createdAt: "2026-05-22",
    updatedAt: "2026-05-22",
    dueDate: "2026-05-30",
    labels: ["content", "linkedin"],
    cycle: "Sprint 3",
  },
  // Verdant Ops tasks
  {
    id: "vo-001",
    clientId: "client-e",
    title: "SEO Audit & Keyword Strategy",
    description: "Full technical SEO audit + 90-day keyword targeting strategy for property management vertical.",
    status: "in-review",
    priority: "high",
    assignee: "Marcus Chen",
    createdAt: "2026-04-15",
    updatedAt: "2026-05-18",
    labels: ["seo", "strategy"],
    cycle: "Sprint 2",
  },
  {
    id: "vo-002",
    clientId: "client-e",
    title: "Inbound Content Playbook",
    description: "Build 12-week editorial calendar targeting property managers. First 3 articles drafted.",
    status: "in-progress",
    priority: "medium",
    assignee: "Marcus Chen",
    createdAt: "2026-05-01",
    updatedAt: "2026-05-20",
    dueDate: "2026-06-01",
    labels: ["content", "inbound"],
    cycle: "Sprint 2",
  },
];

// ─── NOTION DOCS ───────────────────────────────────────────────────────────

export const notionDocs: NotionDoc[] = [
  {
    id: "nd-001",
    clientId: "client-a",
    title: "TechFlow SaaS — Project Wiki",
    type: "wiki",
    content: `# TechFlow SaaS — Account Wiki

## Status
Primary growth channel: SEO content (decided May 6)
Current sprint focus: Content A/B test (long-form vs video)

## Key Contacts
- Alex Muno (CEO) — decision maker
- Dana Wu (Head of Product) — technical liaison

## Promises & Commitments
- Analytics dashboard launch: originally May 20, now June 10 (API delay)
- Content volume: 4 pieces/week (up from 2)
- SEO as primary channel through Q2/Q3

## Risks
- Analytics dashboard 2 weeks behind due to TechFlow API v2 changes
- MQL target at 47% as of May 13 (content volume was root cause, now addressing)
`,
    lastUpdated: "2026-05-14",
    author: "Sofia Reyes",
  },
  {
    id: "nd-002",
    clientId: "client-a",
    title: "TechFlow — Growth Strategy Q2/Q3",
    type: "project-brief",
    content: `# TechFlow Growth Strategy Q2/Q3 2026

## Objective
3x MQL from 150/month to 450/month by end Q3.

## Primary Channel: SEO Content
Strategy: Long-form technical content targeting DevOps and platform engineering personas.
Cadence: 4 pieces/week (mix of blog, case study, comparison).

## Secondary Channel: LinkedIn (TBD — pending content test results)
Testing video shorts vs long-form. Decision by June 10.

## Metrics
- MQLs: 150 → 450 (Q3 target)
- Organic traffic: 10k → 40k sessions/month
- Content pieces published: 4/week
`,
    lastUpdated: "2026-05-06",
    author: "Sofia Reyes",
  },
  {
    id: "nd-003",
    clientId: "client-b",
    title: "Nexora Health — HubSpot Implementation Plan",
    type: "project-brief",
    content: `# Nexora Health — HubSpot Implementation

## Status: Phase 2 Active

## Completed
- CRM migration (all contacts, companies, deals migrated)
- 3 core workflows live (lead nurture, trial, demo request)
- Sales pipeline configured

## In Progress
- Email automation: built and ready, activation PAUSED for HIPAA legal review
- Legal review deadline: May 28

## Upcoming
- Launch email automation post-legal approval
- Q2 campaign reporting dashboard

## HIPAA Note
Contact data sync to HubSpot requires legal sign-off per client CTO (Tom Bauer).
Do not activate email automation until confirmed.
`,
    lastUpdated: "2026-05-21",
    author: "Marcus Chen",
  },
  {
    id: "nd-004",
    clientId: "client-c",
    title: "Logix Retail — Q2 Campaign Plan",
    type: "project-brief",
    content: `# Logix Retail — Q2 Performance Campaign

## Status: BLOCKED

## Campaign Overview
- Platforms: Google Ads, Meta Ads
- Budget: $8,000/month
- Targets: 200 MQLs in Q2

## Blocker
Ad creatives not delivered by client (3rd week running).
Marketing Manager (Maria) is out sick.
Hard deadline: May 26 — otherwise escalate to CEO.

## Ready to Launch
- Campaign structure: complete
- Audience targeting: configured
- Landing pages: ready (CRO pending)
- Ad copy: written

## Risks
If creatives not received by May 26, Q2 targets (200 MQLs) are unachievable.
`,
    lastUpdated: "2026-05-19",
    author: "Sofia Reyes",
  },
  {
    id: "nd-005",
    clientId: "client-d",
    title: "Arcana Finance — GTM Strategy",
    type: "project-brief",
    content: `# Arcana Finance — GTM Strategy

## Overview
B2B payments startup targeting CFOs and finance teams at SMB companies.
Engagement start: March 2026.

## Phase 1: Outbound Infrastructure (Complete)
- Built ICP definition: SMB CFOs, 50-500 employees, SaaS/tech companies
- Built outbound sequences (Apollo + custom)
- Launched May 2026

## Phase 1 Results (Week 1)
- 127 prospects contacted
- 11 replies (8.7% reply rate — strong)
- 3 demos booked

## Phase 2: Scale + Expand (June)
- Expand ICP to mid-market CFOs
- Add LinkedIn content layer (CEO Priya Nair)

## Promises to Client
- Outbound sequence live by May 1 — DELIVERED
- ICP doc delivered — DELIVERED
- LinkedIn content plan — June 1 target
`,
    lastUpdated: "2026-05-22",
    author: "Jordan Park",
  },
];

// ─── SLACK MESSAGES ────────────────────────────────────────────────────────

export const slackMessages: SlackMessage[] = [
  // TechFlow thread — the conflict scenario
  {
    id: "sm-001",
    clientId: "client-a",
    channel: "#client-techflow",
    author: "Sofia Reyes",
    timestamp: "2026-05-22T14:23:00Z",
    text: "Heads up team — Alex just DM'd me. He wants to move the entire content strategy to video-only. Not just the A/B test, he wants to cancel long-form entirely.",
    threadId: "thread-001",
    isDecision: false,
  },
  {
    id: "sm-002",
    clientId: "client-a",
    channel: "#client-techflow",
    author: "Marcus Chen",
    timestamp: "2026-05-22T14:31:00Z",
    text: "Whoa. That contradicts what we agreed on Tuesday. The A/B test was supposed to be the decision mechanism.",
    threadId: "thread-001",
  },
  {
    id: "sm-003",
    clientId: "client-a",
    channel: "#client-techflow",
    author: "Sofia Reyes",
    timestamp: "2026-05-22T14:45:00Z",
    text: "Agreed. I'm going to push back and reframe it as 'let's let the data decide' — but flagging that this might change direction after June 10. Keeping the A/B test as agreed for now.",
    threadId: "thread-001",
    isDecision: true,
  },
  {
    id: "sm-004",
    clientId: "client-a",
    channel: "#client-techflow",
    author: "Jordan Park",
    timestamp: "2026-05-22T15:02:00Z",
    text: "Makes sense. Also — has anyone confirmed that Dana sent the API docs? The dashboard is blocked without them and the May 23 deadline passed.",
    threadId: "thread-001",
  },
  {
    id: "sm-005",
    clientId: "client-a",
    channel: "#client-techflow",
    author: "Sofia Reyes",
    timestamp: "2026-05-22T15:10:00Z",
    text: "No, Dana has NOT sent the API docs yet. I've emailed twice. I'll escalate to Alex if nothing by tomorrow morning.",
    threadId: "thread-001",
    isDecision: false,
  },
  // Nexora Health
  {
    id: "sm-006",
    clientId: "client-b",
    channel: "#client-nexora",
    author: "Marcus Chen",
    timestamp: "2026-05-23T09:15:00Z",
    text: "Legal memo sent to Nexora's legal team this morning. Rachel confirmed they'll prioritize it. Expecting sign-off by May 28 as agreed.",
    isDecision: false,
  },
  // Logix Retail — recent escalation discussion
  {
    id: "sm-007",
    clientId: "client-c",
    channel: "#client-logix",
    author: "Sofia Reyes",
    timestamp: "2026-05-24T10:00:00Z",
    text: "Logix situation is critical. May 26 deadline is in 2 days and nothing from Ben. I've prepped the escalation email to the CEO. @jordan do you think we should loop in the founder before sending?",
    threadId: "thread-002",
    isDecision: false,
  },
  {
    id: "sm-008",
    clientId: "client-c",
    channel: "#client-logix",
    author: "Jordan Park",
    timestamp: "2026-05-24T10:22:00Z",
    text: "Yes, loop the founder. This is a relationship call, not just an ops issue. If we escalate cold it could backfire.",
    threadId: "thread-002",
    isDecision: true,
  },
  // Arcana Finance
  {
    id: "sm-009",
    clientId: "client-d",
    channel: "#client-arcana",
    author: "Jordan Park",
    timestamp: "2026-05-22T18:00:00Z",
    text: "Great call with Arcana today. 3 demos booked in week 1! Priya is thrilled. Starting ICP expansion research now. LinkedIn content plan draft by May 30.",
    isDecision: false,
  },
];

// ─── CALENDAR EVENTS ───────────────────────────────────────────────────────

export const calendarEvents: CalendarEvent[] = [
  {
    id: "ce-001",
    clientId: "client-a",
    title: "TechFlow Weekly Sync",
    date: "2026-05-27T14:00:00Z",
    duration: 60,
    attendees: ["Sofia Reyes", "Alex Muno", "Dana Wu"],
    type: "weekly-sync",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "ce-002",
    clientId: "client-b",
    title: "Nexora Health — HubSpot Review",
    date: "2026-05-28T15:00:00Z",
    duration: 45,
    attendees: ["Marcus Chen", "Rachel Kim", "Tom Bauer"],
    type: "review",
    meetingLink: "https://meet.google.com/nex-ora-hlt",
  },
  {
    id: "ce-003",
    clientId: "client-c",
    title: "Logix Retail — Escalation Call",
    date: "2026-05-26T10:00:00Z",
    duration: 30,
    attendees: ["Sofia Reyes", "Ben Torres"],
    type: "review",
  },
  {
    id: "ce-004",
    clientId: "client-d",
    title: "Arcana Finance — Sprint 3 Kickoff",
    date: "2026-05-27T11:00:00Z",
    duration: 60,
    attendees: ["Jordan Park", "Priya Nair", "Sam Liu"],
    type: "strategy",
    meetingLink: "https://meet.google.com/arc-ana-fin",
  },
  {
    id: "ce-005",
    clientId: "client-e",
    title: "Verdant Ops — Bi-weekly Check-in",
    date: "2026-05-29T13:00:00Z",
    duration: 30,
    attendees: ["Marcus Chen", "Lisa Wong"],
    type: "weekly-sync",
  },
  {
    id: "ce-006",
    clientId: "client-a",
    title: "TechFlow — May 20 Sync (past)",
    date: "2026-05-20T14:00:00Z",
    duration: 60,
    attendees: ["Sofia Reyes", "Alex Muno", "Dana Wu"],
    type: "weekly-sync",
  },
  {
    id: "ce-007",
    clientId: "client-d",
    title: "Arcana Finance — Sprint 2 Review (past)",
    date: "2026-05-22T11:00:00Z",
    duration: 60,
    attendees: ["Jordan Park", "Priya Nair", "Sam Liu"],
    type: "review",
  },
];

// ─── HELPER: get client by ID ──────────────────────────────────────────────

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getClientByName(name: string): Client | undefined {
  return clients.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
}

export function getTranscriptsByClient(clientId: string): MeetingTranscript[] {
  return transcripts
    .filter((t) => t.clientId === clientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getTasksByClient(clientId: string): LinearTask[] {
  return linearTasks.filter((t) => t.clientId === clientId);
}

export function getDocsByClient(clientId: string): NotionDoc[] {
  return notionDocs.filter((d) => d.clientId === clientId);
}

export function getSlackByClient(clientId: string): SlackMessage[] {
  return slackMessages
    .filter((m) => m.clientId === clientId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getUpcomingMeetings(clientId?: string): CalendarEvent[] {
  const now = new Date("2026-05-25");
  return calendarEvents
    .filter((e) => {
      const eventDate = new Date(e.date);
      return eventDate >= now && (!clientId || e.clientId === clientId);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
