"use client";

import { useEffect, useState } from "react";
import { History, CheckCircle2, Loader2, ChevronRight, PanelRight } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { useWorkflowStore } from "@/store/workflow-store";

export function RightSidebar() {
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadRunResults = useWorkflowStore(state => state.loadRunResults);
  const collapsed = useWorkflowStore(state => state.rightSidebarCollapsed);
  const toggle = useWorkflowStore(state => state.toggleRightSidebar);

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
    const interval = setInterval(fetchRuns, 10000);
    return () => clearInterval(interval);
  }, []);

  if (collapsed) {
    return (
      <aside className="w-16 bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col items-center py-4 gap-4 transition-all">
        <button onClick={() => toggle(false)} className="p-2 hover:bg-[#111] rounded-md text-gray-500">
           <PanelRight className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-2">
           {runs.slice(0, 5).map(run => (
             <div key={run.id} className={`w-2 h-2 rounded-full ${run.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
           ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col h-full z-10 shrink-0 transition-all">
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider text-xs">Run History</h2>
        </div>
        <button onClick={() => toggle(true)} className="p-1 hover:bg-[#111] rounded text-gray-500">
           <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {runs.length === 0 && !isLoading && (
          <div className="text-center py-10 text-xs text-gray-500">No runs.</div>
        )}
        
        {runs.map((run) => (
          <div
            key={run.id}
            onClick={() => loadRunResults(run.id)}
            className="group flex flex-col gap-2 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm"
          >
            <div className="flex justify-between items-start">
               <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-200 truncate w-32">
                    {run.workflow?.name || "Flow"}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono italic">#{run.id.slice(-6)}</span>
               </div>
               <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                  run.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500' :
                  run.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500' :
                  'bg-red-500/10 text-red-500'
               }`}>
                  {run.status}
               </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
