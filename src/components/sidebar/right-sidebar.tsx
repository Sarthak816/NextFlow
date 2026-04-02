"use client";

import { useEffect, useState } from "react";
import { History, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { useWorkflowStore } from "@/store/workflow-store";

export function RightSidebar() {
  const [history, setHistory] = useState<any[]>([]);
  const loadRunResults = useWorkflowStore(state => state.loadRunResults);

  useEffect(() => {
    fetch("/api/workflows")
      .then(res => res.json())
      .then(data => {
        // In this demo, "History" refers to separate Workflow records
        setHistory(data);
      });
  }, []);

  return (
    <aside className="w-72 bg-[#111111] border-l border-[#222] flex flex-col h-full z-10 shrink-0">
      <div className="p-4 border-b border-[#222] flex items-center gap-2">
        <History className="w-5 h-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-200">Workflow Gallery</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
        {history.map((wf) => (
          <button
            key={wf.id}
            onClick={async () => {
              const data = typeof wf.data === 'string' ? JSON.parse(wf.data) : wf.data;
              useWorkflowStore.getState().setNodes(data.nodes);
              useWorkflowStore.getState().setEdges(data.edges);
              // If it's a specific run, we could also load results
              // For now, loading the saved workflow structure
            }}
            className="flex flex-col gap-1 p-3 rounded-lg hover:bg-[#222] text-left transition-colors border border-transparent hover:border-[#333]"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium text-gray-200">{wf.name}</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-xs text-gray-500">
              {formatTimestamp(new Date(wf.updatedAt))}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
