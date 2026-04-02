"use client";

import { useWorkflowStore } from "@/store/workflow-store";
import { PlusCircle, Search, FileText, Image, Video, Cpu, Crop, Frame } from "lucide-react";
import { generateNodeId } from "@/lib/utils";
import type { NodeType } from "@/lib/handle-types";

const NODE_TYPES = [
  { type: "textNode", label: "Text", icon: FileText, color: "text-gray-400" },
  { type: "uploadImageNode", label: "Upload Image", icon: Image, color: "text-blue-400" },
  { type: "uploadVideoNode", label: "Upload Video", icon: Video, color: "text-red-400" },
  { type: "llmNode", label: "Run Any LLM", icon: Cpu, color: "text-purple-400" },
  { type: "cropImageNode", label: "Crop Image", icon: Crop, color: "text-green-400" },
  { type: "extractFrameNode", label: "Extract Frame", icon: Frame, color: "text-yellow-400" },
];

export function LeftSidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);

  const onAddNode = (type: string, label: string) => {
    const id = generateNodeId();
    addNode({
      id,
      type,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label },
    });
  };

  return (
    <aside className="w-64 bg-[#111111] border-r border-[#222] flex flex-col h-full z-10 shrink-0">
      <div className="p-4 border-b border-[#222]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full bg-[#222] text-white text-sm rounded-full pl-9 pr-4 py-2 border border-[#333] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Access
        </h3>
        <div className="flex flex-col gap-2">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <button
                key={node.type}
                onClick={() => onAddNode(node.type, node.label)}
                className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-[#222] transition-colors text-left group"
              >
                <div className={`p-1.5 rounded-md bg-[#222] group-hover:bg-[#333] transition-colors ${node.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white font-medium">
                  {node.label}
                </span>
                <PlusCircle className="w-4 h-4 ml-auto text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
