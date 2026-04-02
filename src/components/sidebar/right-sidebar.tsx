"use client";

import { History, PlayCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";

// Mock history data for now
const MOCK_HISTORY = [
  { id: "run-1", label: "Run #125", time: new Date(), status: "COMPLETED", nodes: 1 },
  { id: "run-2", label: "Run #124", time: new Date(Date.now() - 3600000), status: "COMPLETED", nodes: 2 },
  { id: "run-3", label: "Run #123", time: new Date(Date.now() - 7200000), status: "FAILED", nodes: 4 },
];

export function RightSidebar() {
  return (
    <aside className="w-72 bg-[#111111] border-l border-[#222] flex flex-col h-full z-10 shrink-0">
      <div className="p-4 border-b border-[#222] flex items-center gap-2">
        <History className="w-5 h-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-200">Workflow History</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {MOCK_HISTORY.map((run) => (
          <button
            key={run.id}
            className="flex flex-col gap-1 p-3 rounded-lg hover:bg-[#222] text-left transition-colors border border-transparent hover:border-[#333]"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium text-gray-200">{run.label}</span>
              {run.status === "COMPLETED" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {run.status === "FAILED" && <XCircle className="w-4 h-4 text-red-500" />}
              {run.status === "RUNNING" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
            </div>
            <div className="text-xs text-gray-500">
              {formatTimestamp(run.time)} ({run.nodes} node{run.nodes !== 1 ? 's' : ''})
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
