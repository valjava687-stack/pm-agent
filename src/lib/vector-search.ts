export interface SearchDocument {
  id: string;
  clientId: string;
  type: "transcript" | "notion" | "slack" | "task";
  title: string;
  content: string;
  date: string;
  source: string;
  metadata: Record<string, unknown>;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  matchedTerms: string[];
}

class InMemoryVectorSearch {
  private documents: SearchDocument[] = [];
  private tfidfIndex: Map<string, Map<string, number>> = new Map();
  private docFrequency: Map<string, number> = new Map();

  addDocument(doc: SearchDocument) {
    this.documents.push(doc);
    this.indexDocument(doc);
  }

  addDocuments(docs: SearchDocument[]) {
    docs.forEach((d) => this.addDocument(d));
    this.buildIDF();
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t));
  }

  private indexDocument(doc: SearchDocument) {
    const text = `${doc.title} ${doc.content}`;
    const tokens = this.tokenize(text);
    const termFreq = new Map<string, number>();

    tokens.forEach((t) => termFreq.set(t, (termFreq.get(t) ?? 0) + 1));

    termFreq.forEach((freq, term) => {
      if (!this.tfidfIndex.has(term)) this.tfidfIndex.set(term, new Map());
      this.tfidfIndex.get(term)!.set(doc.id, freq / tokens.length);
      this.docFrequency.set(term, (this.docFrequency.get(term) ?? 0) + 1);
    });
  }

  private buildIDF() {
    const N = this.documents.length;
    this.tfidfIndex.forEach((docMap, term) => {
      const df = this.docFrequency.get(term) ?? 1;
      const idf = Math.log(N / df + 1);
      docMap.forEach((tf, docId) => {
        docMap.set(docId, tf * idf);
      });
    });
  }

  search(query: string, options?: { clientId?: string; topK?: number; type?: string }): SearchResult[] {
    const { clientId, topK = 5, type } = options ?? {};
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) return [];

    const scores = new Map<string, number>();
    const matchedTerms = new Map<string, Set<string>>();

    queryTokens.forEach((term) => {
      const docMap = this.tfidfIndex.get(term);
      if (!docMap) return;
      docMap.forEach((tfidf, docId) => {
        scores.set(docId, (scores.get(docId) ?? 0) + tfidf);
        if (!matchedTerms.has(docId)) matchedTerms.set(docId, new Set());
        matchedTerms.get(docId)!.add(term);
      });
    });

    const results: SearchResult[] = [];

    scores.forEach((score, docId) => {
      const doc = this.documents.find((d) => d.id === docId);
      if (!doc) return;
      if (clientId && doc.clientId !== clientId) return;
      if (type && doc.type !== type) return;
      results.push({ document: doc, score, matchedTerms: Array.from(matchedTerms.get(docId) ?? []) });
    });

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  getAllDocuments(clientId?: string): SearchDocument[] {
    if (!clientId) return this.documents;
    return this.documents.filter((d) => d.clientId === clientId);
  }

  getDocumentsByType(type: string, clientId?: string): SearchDocument[] {
    return this.documents.filter(
      (d) => d.type === type && (!clientId || d.clientId === clientId)
    );
  }
}

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
  "was", "one", "our", "had", "him", "his", "has", "its", "that", "this",
  "with", "they", "from", "will", "been", "have", "more", "when", "who",
  "their", "said", "each", "she", "which", "how", "were", "there", "about",
  "out", "into", "then", "than", "also", "some", "what", "time", "after",
  "just", "over", "back", "should", "because", "come", "could", "did",
  "get", "got", "let", "like", "make", "need", "now", "see", "take",
  "use", "want", "way", "well", "would", "your",
]);

let searchEngine: InMemoryVectorSearch | null = null;

export function getSearchEngine(): InMemoryVectorSearch {
  if (!searchEngine) {
    searchEngine = new InMemoryVectorSearch();
    seedSearchEngine(searchEngine);
  }
  return searchEngine;
}

function seedSearchEngine(engine: InMemoryVectorSearch) {
  const { transcripts, notionDocs, slackMessages, linearTasks } = require("@/data/mock-data");

  transcripts.forEach((t: import("@/data/mock-data").MeetingTranscript) => {
    engine.addDocument({
      id: `transcript-${t.id}`,
      clientId: t.clientId,
      type: "transcript",
      title: `Meeting ${t.date} — ${t.participants.slice(0, 2).join(", ")}`,
      content: [t.summary, t.decisions.join(". "), t.actionItems.map((a) => a.description).join(". "), t.rawExcerpts.join(" ")].join(" "),
      date: t.date,
      source: t.source,
      metadata: { participants: t.participants, decisions: t.decisions, actionItems: t.actionItems, transcriptId: t.id },
    });
  });

  notionDocs.forEach((d: import("@/data/mock-data").NotionDoc) => {
    engine.addDocument({
      id: `notion-${d.id}`,
      clientId: d.clientId,
      type: "notion",
      title: d.title,
      content: d.content,
      date: d.lastUpdated,
      source: "Notion",
      metadata: { docType: d.type, author: d.author, docId: d.id },
    });
  });

  slackMessages.forEach((m: import("@/data/mock-data").SlackMessage) => {
    engine.addDocument({
      id: `slack-${m.id}`,
      clientId: m.clientId,
      type: "slack",
      title: `Slack #${m.channel} — ${m.author}`,
      content: m.text,
      date: m.timestamp.split("T")[0],
      source: "Slack",
      metadata: { author: m.author, channel: m.channel, timestamp: m.timestamp, isDecision: m.isDecision, messageId: m.id },
    });
  });

  linearTasks.forEach((t: import("@/data/mock-data").LinearTask) => {
    engine.addDocument({
      id: `linear-${t.id}`,
      clientId: t.clientId,
      type: "task",
      title: t.title,
      content: `${t.description} Status: ${t.status}. Priority: ${t.priority}. Assignee: ${t.assignee}. Labels: ${t.labels.join(", ")}. ${t.linkedDecision ?? ""}`,
      date: t.updatedAt,
      source: "Linear",
      metadata: { status: t.status, priority: t.priority, assignee: t.assignee, dueDate: t.dueDate, labels: t.labels, taskId: t.id },
    });
  });

  engine.addDocuments([]);
}
