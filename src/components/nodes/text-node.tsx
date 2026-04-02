import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileText } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";

export const TextNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore(state => state.updateNodeData);

  return (
    <NodeWrapper
      id={id}
      title={data.label || "Text Node"}
      icon={FileText}
      iconColor="text-gray-400"
      selected={selected}
    >
      <div className="flex flex-col gap-2">
        <textarea
          className="w-full h-24 bg-[#111] border border-[#333] rounded-md p-2 text-sm text-gray-200 resize-none focus:outline-none focus:border-indigo-500"
          placeholder="Enter text..."
          value={data.text || ""}
          onChange={(e) => updateNodeData(id, { text: e.target.value })}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-[#555] border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
TextNode.displayName = "TextNode";
