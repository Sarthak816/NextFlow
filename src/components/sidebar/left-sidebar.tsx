"use client";

import { useWorkflowStore } from "@/store/workflow-store";
import { PlusCircle, Search, FileText, Image, Video, Cpu, Crop, Frame, ChevronLeft, PanelLeft } from "lucide-react";
import { generateNodeId } from "@/lib/utils";

const NODE_TYPES = [
  { type: "textNode", label: "Text", icon: FileText, color: "text-gray-400" },
  { type: "uploadImageNode", label: "Upload Image", icon: Image, color: "text-blue-400" },
  { type: "uploadVideoNode", label: "Upload Video", icon: Video, color: "text-red-400" },
  { type: "llmNode", label: "LLM", icon: Cpu, color: "text-purple-400" },
  { type: "cropImageNode", label: "Crop", icon: Crop, color: "text-green-400" },
  { type: "extractFrameNode", label: "Frame", icon: Frame, color: "text-yellow-400" },
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

  if (collapsed) {
    return (
      <aside className="w-16 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col items-center py-4 gap-4 transition-all">
        <button onClick={() => toggle(false)} className="p-2 hover:bg-[#111] rounded-md text-gray-500">
           <PanelLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-3">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type, node.label)}
                title={node.label}
                className={`p-2 rounded-lg hover:bg-[#222] transition-colors ${node.color}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col h-full z-10 shrink-0 transition-all shadow-xl">
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Library</h2>
        <button onClick={() => toggle(true)} className="p-1 hover:bg-[#111] rounded text-gray-500">
           <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#111] text-white text-xs rounded-lg pl-9 pr-4 py-1.5 border border-[#1a1a1a] focus:outline-none focus:border-indigo-500/50 transition-all"
          />
        </div>
      </div>
      
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1.5">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type, node.label)}
                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[#111] border border-transparent hover:border-[#1a1a1a] transition-all text-left group"
              >
                <div className={`p-1.5 rounded-md bg-[#0a0a0a] group-hover:bg-[#161616] transition-colors ${node.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[13px] text-gray-400 group-hover:text-gray-100 font-medium whitespace-nowrap">
                  {node.label}
                </span>
                <PlusCircle className="w-3.5 h-3.5 ml-auto text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
