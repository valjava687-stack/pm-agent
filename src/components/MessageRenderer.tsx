"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageRendererProps {
  content: string;
}

export function MessageRenderer({ content }: MessageRendererProps) {
  return (
    <div className="text-sm text-slate-800 space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 mt-3 mb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-800 mt-3 mb-1 border-b border-slate-100 pb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-slate-700 mt-2 mb-0.5">{children}</h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 space-y-0.5 my-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 space-y-0.5 my-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed text-slate-700">{children}</li>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-slate-800 my-1">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-600">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-400 pl-3 text-slate-600 italic my-2 bg-amber-50 rounded-r py-1">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs overflow-x-auto my-2">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono border border-indigo-100">
                {children}
              </code>
            );
          },
          hr: () => <hr className="border-slate-200 my-3" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="text-xs w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="text-left px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold border border-slate-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 border border-slate-100 text-slate-700">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
