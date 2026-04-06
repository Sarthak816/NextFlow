"use client";

import { useEffect, useState } from "react";
import { History, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { useWorkflowStore } from "@/store/workflow-store";

export function RightSidebar() {
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadRunResults = useWorkflowStore(state => state.loadRunResults);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await fetch("/api/workflows/runs");
        const data = await res.json();
        setRuns(data);
      } catch (e) {
        console.error("Failed to fetch runs", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRuns();
    // Poll every 10s for updates
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-80 bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col h-full z-10 shrink-0">
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">Execution History</h2>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {runs.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-xs text-gray-500">No execution history yet.</p>
          </div>
        )}
        
        {runs.map((run) => (
          <div
            key={run.id}
            onClick={() => loadRunResults(run.id)}
            className="group flex flex-col gap-2 p-3 rounded-xl bg-[#111] hover:bg-[#161616] border border-[#222] hover:border-indigo-500/50 text-left transition-all cursor-pointer shadow-sm"
          >
            <div className="flex justify-between items-start w-full">
               <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-gray-200 line-clamp-1">
                    {run.workflow?.name || "Unnamed Workflow"}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                    ID: {run.id.slice(-8)}
                  </span>
               </div>
               <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  run.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                  run.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500 animate-pulse' :
                  'bg-red-500/10 text-red-500'
               }`}>
                  {run.status}
               </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-1 border-t border-[#222] pt-2">
               {run.nodeExecutions?.slice(0, 3).map((exec: any) => (
                  <div key={exec.id} className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 truncate flex-1">{exec.nodeLabel || exec.nodeType}</span>
                    {exec.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />}
                  </div>
               ))}
               {run.nodeExecutions?.length > 3 && (
                 <span className="text-[10px] text-gray-600 italic">+{run.nodeExecutions.length - 3} more nodes...</span>
               )}
            </div>

            <div className="flex items-center justify-between mt-1 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-gray-500">
                {formatTimestamp(new Date(run.startedAt))}
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">VIEW DETAILS</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
