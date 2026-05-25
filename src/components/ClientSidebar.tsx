"use client";

import { clients } from "@/data/mock-data";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  "on-track": { label: "On Track", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "at-risk":  { label: "At Risk",  dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  blocked:    { label: "Blocked",  dot: "bg-red-500",     badge: "bg-red-50 text-red-700 border-red-200" },
  completed:  { label: "Done",     dot: "bg-gray-400",    badge: "bg-gray-50 text-gray-600 border-gray-200" },
};

interface ClientSidebarProps {
  activeClient: string | null;
  onClientSelect: (clientName: string) => void;
  onQuickQuery: (query: string) => void;
}

export function ClientSidebar({ activeClient, onClientSelect, onQuickQuery }: ClientSidebarProps) {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Muno Labs PM</div>
            <div className="text-xs text-slate-500">Agency Intelligence</div>
          </div>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Active Clients ({clients.length})
        </div>

        <div className="space-y-1">
          {clients.map((client) => {
            const status = STATUS_CONFIG[client.status];
            const isActive = activeClient === client.name;

            return (
              <button
                key={client.id}
                onClick={() => onClientSelect(client.name)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg transition-all border",
                  isActive
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "hover:bg-white hover:shadow-sm border-transparent hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", status.dot)} />
                  <span
                    className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-indigo-700" : "text-slate-800"
                    )}
                  >
                    {client.name}
                  </span>
                </div>
                <div className="ml-4 mt-0.5 flex items-center gap-1.5">
                  <span className={cn("text-xs px-1.5 py-0.5 rounded border font-medium", status.badge)}>
                    {status.label}
                  </span>
                  <span className="text-xs text-slate-400 truncate">{client.accountLead.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Quick Queries
        </div>
        <div className="space-y-1">
          {[
            { icon: "⚠️", label: "Projects at risk",    query: "Which projects are at risk right now?" },
            { icon: "🚧", label: "All open blockers",   query: "What are all the current blockers across all clients?" },
            { icon: "✅", label: "This week's updates", query: "Give me a summary of what happened with all clients this week." },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => onQuickQuery(item.query)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-all text-xs text-slate-600 hover:text-slate-900 flex items-center gap-2 border border-transparent hover:border-slate-200"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
