import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Cpu, ChevronDown } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";

export const LLMNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const isRunning = useWorkflowStore(state => state.executionStatus[id] === "RUNNING");

  return (
    <NodeWrapper
      id={id}
      title={data.label || "LLM Execution"}
      icon={Cpu}
      iconColor="text-purple-400"
      selected={selected}
    >
      <div className="flex flex-col gap-4 w-[320px]">
        {/* Input Handles Section */}
        <div className="flex flex-col gap-3">
          {/* Target Handle Wrapper */}
          <div className="relative border border-[#333] rounded-md p-2 bg-[#111]">
            <Handle
              type="target"
              position={Position.Left}
              id="system_prompt"
              className="w-3 h-3 bg-gray-400 border-2 border-[#222]"
              style={{ top: "auto", bottom: "auto", marginTop: "-6px" }}
            />
            <div className="text-xs text-gray-400 ml-2">System Prompt (Optional)</div>
          </div>
          
          <div className="relative border border-[#333] rounded-md p-2 bg-[#111]">
            <Handle
              type="target"
              position={Position.Left}
              id="user_message"
              className="w-3 h-3 bg-gray-400 border-2 border-[#222]"
              style={{ top: "auto", bottom: "auto", marginTop: "-6px" }}
            />
            <div className="text-xs text-gray-400 ml-2 font-medium">User Message (Required)</div>
          </div>

          <div className="relative border border-[#333] rounded-md p-2 bg-[#111]">
            <Handle
              type="target"
              position={Position.Left}
              id="images"
              className="w-3 h-3 bg-blue-500 border-2 border-[#222]"
              style={{ top: "auto", bottom: "auto", marginTop: "-6px" }}
            />
            <div className="text-xs text-gray-400 ml-2">Images (Optional)</div>
          </div>
        </div>

        {/* Model Selector Settings */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 font-medium">Model</label>
          <div className="relative">
             <select 
               className="w-full bg-[#111] text-gray-200 border border-[#333] rounded-md pl-3 pr-8 py-2 text-sm appearance-none focus:outline-none focus:border-purple-500 transition-colors"
               value={data.model || "gemini-1.5-flash"}
               onChange={(e) => updateNodeData(id, { model: e.target.value })}
             >
               <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
               <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
             </select>
             <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Output Section */}
        {data.output && (
          <div className="mt-2 bg-[#1a1a1a] border border-[#333] rounded-md p-3 text-sm text-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
             {data.output}
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-purple-500 border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
LLMNode.displayName = "LLMNode";
