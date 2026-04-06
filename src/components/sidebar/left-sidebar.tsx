"use client";

import { useWorkflowStore } from "@/store/workflow-store";
import { PlusCircle, Search, FileText, Image, Video, Cpu, Crop, Frame, ChevronLeft, PanelLeft } from "lucide-react";
import { generateNodeId } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NODE_TYPES = [
  { type: "textNode", label: "Text Prompt", icon: FileText, color: "text-gray-400" },
  { type: "uploadImageNode", label: "Uploader: Image", icon: Image, color: "text-blue-400" },
  { type: "uploadVideoNode", label: "Uploader: Video", icon: Video, color: "text-red-400" },
  { type: "llmNode", label: "Gemini AI Task", icon: Cpu, color: "text-indigo-400" },
  { type: "cropImageNode", label: "FFmpeg: Crop", icon: Crop, color: "text-green-400" },
  { type: "extractFrameNode", label: "FFmpeg: Frame", icon: Frame, color: "text-yellow-400" },
];

export function LeftSidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const collapsed = useWorkflowStore(state => state.leftSidebarCollapsed);
  const toggle = useWorkflowStore(state => state.toggleLeftSidebar);

  const onAddNode = (type: string, label: string) => {
    const id = generateNodeId();
    addNode({
      id,
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label },
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(!collapsed);
  };

  return (
    <aside className={cn(
      "bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col h-full z-10 shrink-0 transition-all duration-300 shadow-2xl relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between h-14">
        {!collapsed && <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Components</h2>}
        <button 
          onClick={handleToggle} 
          className={cn(
            "p-2 hover:bg-[#111] rounded-xl transition-all text-gray-500 hover:text-indigo-500",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
           {collapsed ? <PanelLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Search (Only when expanded) */}
      {!collapsed && (
        <div className="p-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search components..."
              className="w-full bg-[#111] text-white text-[11px] rounded-xl pl-9 pr-4 py-2 border border-[#1a1a1a] focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
        </div>
      )}
      
      {/* Components List */}
      <div className={cn("flex-1 overflow-y-auto", collapsed ? "p-4 space-y-4" : "p-4 space-y-1")}>
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          return (
            <button
              key={node.type}
              onClick={() => onAddNode(node.type, node.label)}
              className={cn(
                "flex items-center group transition-all duration-200",
                collapsed ? "justify-center p-0" : "gap-3 w-full p-2.5 rounded-xl hover:bg-[#111] border border-transparent hover:border-[#1a1a1a]"
              )}
              title={collapsed ? node.label : ""}
            >
              <div className={cn(
                "flex items-center justify-center rounded-xl bg-[#0a0a0a] group-hover:bg-[#161616] transition-all duration-300",
                collapsed ? "w-10 h-10 border border-[#1a1a1a] group-hover:border-indigo-500/50" : "w-8 h-8",
                node.color
              )}>
                <Icon className={cn(collapsed ? "w-5 h-5" : "w-4 h-4")} />
              </div>
              
              {!collapsed && (
                <>
                  <span className="text-[13px] text-gray-400 group-hover:text-gray-100 font-medium tracking-tight">
                    {node.label}
                  </span>
                  <PlusCircle className="w-3.5 h-3.5 ml-auto text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      {!collapsed && (
        <div className="p-4 mt-auto border-t border-[#1a1a1a]">
          <p className="text-[9px] text-gray-600 font-medium text-center uppercase tracking-widest">NextFlow Engine v1.0</p>
        </div>
      )}
    </aside>
  );
}
