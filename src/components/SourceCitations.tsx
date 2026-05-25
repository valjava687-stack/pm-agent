"use client";

import type { SourceCitation } from "@/lib/tool-handlers";
import { getSourceIcon, getSourceColor, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="text-xs text-slate-400 font-medium mb-1.5">Sources</div>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium",
              getSourceColor(s.source)
            )}
            title={s.freshnessNote ? `${s.label} — ${s.freshnessNote}` : s.label}
          >
            <span>{getSourceIcon(s.source)}</span>
            <span>{s.source}</span>
            {s.date && <span className="opacity-60">· {formatDate(s.date)}</span>}
            {s.confidence === "low" && <span className="opacity-60 italic">(low confidence)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
