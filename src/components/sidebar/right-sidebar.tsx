"use client";

import { useEffect, useState } from "react";
import { History, CheckCircle2, Loader2, ChevronRight, PanelRight, Clock } from "lucide-react";
import { formatTimestamp, cn } from "@/lib/utils";
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(!collapsed);
  };

  return (
    <aside className={cn(
      "bg-[#0a0a0a] border-l border-[#1a1a1a] flex flex-col h-full z-10 shrink-0 transition-all duration-300 shadow-2xl relative",
      collapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between h-14">
        <button 
          onClick={handleToggle} 
          className={cn(
            "p-2 hover:bg-[#111] rounded-xl transition-all text-gray-500 hover:text-indigo-500",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand Sidepanel" : "Collapse Sidepanel"}
        >
           {collapsed ? <PanelRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {!collapsed && <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-auto">History</h2>}
      </div>

      {/* History Items */}
      <div className={cn("flex-1 overflow-y-auto", collapsed ? "p-4 space-y-4" : "p-4 space-y-2")}>
        {isLoading && !collapsed && (
          <div className="flex items-center justify-center py-20 text-gray-700 animate-pulse">
             <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        
        {runs.length === 0 && !isLoading && !collapsed && (
          <div className="text-center py-10 text-[10px] text-gray-700 font-bold uppercase tracking-widest bg-[#111]/30 rounded-2xl border border-dashed border-[#1a1a1a]">
            No Runs Yet
          </div>
        )}
        
        {runs.map((run) => (
          <button
            key={run.id}
            onClick={() => !collapsed && loadRunResults(run.id)}
            className={cn(
              "flex flex-col group transition-all duration-300 relative",
              collapsed ? "items-center" : "w-full p-3.5 rounded-2xl bg-[#111] border border-[#1a1a1a] hover:border-indigo-500/50 hover:bg-[#151515] text-left shadow-lg overflow-hidden"
            )}
            title={collapsed ? `${run.workflow?.name || "Run"} - ${run.status}` : ""}
          >
            {collapsed ? (
               <div className={cn(
                 "w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300",
                 run.status === 'COMPLETED' ? 'border-green-500/20 bg-green-500/5 text-green-500' : 
                 run.status === 'RUNNING' ? 'border-blue-500/20 bg-blue-500/5 text-blue-500 animate-pulse' :
                 'border-red-500/20 bg-red-500/5 text-red-500'
               )}>
                  <Clock className="w-5 h-5" />
               </div>
            ) : (
               <>
                 <div className="flex justify-between items-start w-full relative z-10">
                    <div className="flex flex-col">
                       <span className="text-[12px] font-black text-gray-200 truncate w-32 tracking-tight group-hover:text-white transition-colors">
                         {run.workflow?.name || "FLOW RUN"}
                       </span>
                       <span className="text-[9px] text-gray-600 font-bold font-mono tracking-widest mt-0.5 group-hover:text-gray-400">
                         {run.id.slice(-8).toUpperCase()}
                       </span>
                    </div>
                    
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter transition-all duration-300 ring-1",
                      run.status === 'COMPLETED' ? 'bg-green-500/10 text-green-500 ring-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' :
                      run.status === 'RUNNING' ? 'bg-blue-500/10 text-blue-500 ring-blue-500/30 animate-pulse' :
                      'bg-red-500/10 text-red-500 ring-red-500/30'
                    )}>
                       {run.status}
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between mt-3 opacity-30 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                       {formatTimestamp(new Date(run.startedAt))}
                    </span>
                    <div className="h-[1px] bg-[#1a1a1a] flex-1 mx-2" />
                    <span className="text-[8px] text-indigo-500 font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">
                       VIEW
                    </span>
                 </div>
               </>
            )}
          </button>
        ))}
      </div>
      
      {!collapsed && (
        <div className="p-4 mt-auto border-t border-[#1a1a1a] bg-black/50">
           <div className="flex items-center gap-2 px-3 py-2 bg-[#111] rounded-xl border border-[#1a1a1a]">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Live Engine Active</span>
           </div>
        </div>
      )}
    </aside>
  );
}
