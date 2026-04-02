import { memo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { Frame } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";
import { getConnectedInputHandles } from "@/lib/dag-utils";

export const ExtractFrameNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const edges = useEdges();
  const connectedHandles = getConnectedInputHandles(id, edges);

  const timestampConnected = connectedHandles.has("timestamp");

  return (
    <NodeWrapper
      id={id}
      title={data.label || "Extract Frame"}
      icon={Frame}
      iconColor="text-yellow-400"
      selected={selected}
    >
      <div className="flex flex-col gap-3 w-[260px]">
        {/* Video Input Handle */}
        <div className="relative border border-[#333] rounded-md p-2 bg-[#111]">
          <Handle
            type="target"
            position={Position.Left}
            id="video_url"
            className="w-3 h-3 bg-red-500 border-2 border-[#222]"
            style={{ top: "auto", bottom: "auto", marginTop: "-6px" }}
          />
          <div className="text-xs text-gray-400 ml-2 font-medium">Video URL (Required)</div>
        </div>

        {/* Timestamp setting */}
        <div className="flex flex-col gap-1 relative mt-2">
          <label className="text-[10px] text-gray-500 font-medium ml-1">Timestamp</label>
          <div className="relative">
            <Handle
              type="target"
              position={Position.Left}
              id="timestamp"
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 border-2 border-[#222]"
              style={{ top: "50%", marginTop: "-4px" }}
            />
            
            <input
              type="text"
              disabled={timestampConnected}
              placeholder="e.g. 50% or 00:01:23"
              value={data.timestamp || ""}
              onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
              className="w-full bg-[#111] text-gray-200 border border-[#333] rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed pl-3"
            />
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-yellow-500 border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
ExtractFrameNode.displayName = "ExtractFrameNode";
