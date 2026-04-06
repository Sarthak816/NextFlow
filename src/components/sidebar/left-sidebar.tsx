"use client";

import { useWorkflowStore } from "@/store/workflow-store";
import {
  Search, FileText, Image, Video, Cpu, Crop, Frame,
  ChevronLeft, PanelLeft, PlusCircle
} from "lucide-react";
import { generateNodeId, cn } from "@/lib/utils";

const NODE_TYPES = [
  { type: "textNode",        label: "Text Prompt",    icon: FileText, color: "text-gray-400" },
  { type: "uploadImageNode", label: "Upload Image",   icon: Image,    color: "text-blue-400" },
  { type: "uploadVideoNode", label: "Upload Video",   icon: Video,    color: "text-red-400" },
  { type: "llmNode",         label: "Gemini AI",      icon: Cpu,      color: "text-indigo-400" },
  { type: "cropImageNode",   label: "Crop Image",     icon: Crop,     color: "text-green-400" },
  { type: "extractFrameNode","label": "Extract Frame", icon: Frame,    color: "text-yellow-400" },
];

export function LeftSidebar() {
  const addNode        = useWorkflowStore(s => s.addNode);
  const collapsed      = useWorkflowStore(s => s.leftSidebarCollapsed);
  const toggleLeft     = useWorkflowStore(s => s.toggleLeftSidebar);

  const onAddNode = (type: string, label: string) => {
    addNode({
      id: generateNodeId(),
      type,
      position: { x: 200 + Math.random() * 100, y: 150 + Math.random() * 150 },
      data: { label },
    });
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full z-20 shrink-0 bg-[#0a0a0a] border-r border-[#1a1a1a] transition-all duration-300",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-[#1a1a1a]">
        {!collapsed && (
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
            Components
          </span>
        )}
        <button
          onClick={() => toggleLeft(!collapsed)}
          className={cn(
            "p-2 rounded-xl hover:bg-[#111] text-gray-600 hover:text-indigo-500 transition-all",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Search (expanded only) ─────────────────────────────── */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-[#1a1a1a]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-700" />
            <input
              type="text"
              placeholder="Search…"
              className="w-full bg-[#111] text-xs text-gray-300 rounded-lg pl-7 pr-3 py-1.5 border border-[#1a1a1a] focus:outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Node List ──────────────────────────────────────────── */}
      <div className={cn("flex-1 overflow-y-auto", collapsed ? "py-3 flex flex-col items-center gap-2" : "py-3 px-2 flex flex-col gap-1")}>
        {NODE_TYPES.map(({ type, label, icon: Icon, color }) => (
          <button
            key={type}
            onClick={() => onAddNode(type, label)}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center transition-all group",
              collapsed
                ? "w-10 h-10 justify-center rounded-xl border border-[#1a1a1a] hover:border-indigo-500/50 hover:bg-[#111]"
                : "gap-3 w-full px-2.5 py-2 rounded-xl hover:bg-[#111] border border-transparent hover:border-[#1a1a1a]"
            )}
          >
            <div className={cn("flex items-center justify-center shrink-0", color)}>
              <Icon className={collapsed ? "w-4 h-4" : "w-3.5 h-3.5"} />
            </div>
            {!collapsed && (
              <>
                <span className="text-[12px] text-gray-400 group-hover:text-gray-100 font-medium truncate flex-1">
                  {label}
                </span>
                <PlusCircle className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
