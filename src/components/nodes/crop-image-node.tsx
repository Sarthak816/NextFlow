import { memo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "@xyflow/react";
import { Crop } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";
import { getConnectedInputHandles } from "@/lib/dag-utils";

export const CropImageNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const edges = useEdges();
  const connectedHandles = getConnectedInputHandles(id, edges);

  const isConnected = (handleId: string) => connectedHandles.has(handleId);

  return (
    <NodeWrapper
      id={id}
      title={data.label || "Crop Image"}
      icon={Crop}
      iconColor="text-green-400"
      selected={selected}
    >
      <div className="flex flex-col gap-3 w-[260px]">
        {/* Image Input Handle */}
        <div className="relative border border-[#333] rounded-md p-2 bg-[#111]">
          <Handle
            type="target"
            position={Position.Left}
            id="image_url"
            className="w-3 h-3 bg-blue-500 border-2 border-[#222]"
            style={{ top: "auto", bottom: "auto", marginTop: "-6px" }}
          />
          <div className="text-xs text-gray-400 ml-2 font-medium">Image URL (Required)</div>
        </div>

        {/* Number settings */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {["x_percent", "y_percent", "width_percent", "height_percent"].map((param) => {
            const label = param.split('_')[0].toUpperCase() + " %";
            const disabled = isConnected(param);
            return (
              <div key={param} className="flex flex-col gap-1 relative">
                <label className="text-[10px] text-gray-500 font-medium ml-1 flex justify-between">
                  {label}
                </label>
                <div className="relative">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={param}
                    className="w-full h-full opacity-0 z-10" // invisible handle covering input area
                  />
                  {/* Visually show the handle on the left edge of input */}
                  <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-500 border border-[#222]" />
                  
                  <input
                    type="number"
                    disabled={disabled}
                    min="0"
                    max="100"
                    placeholder={param.includes('width') || param.includes('height') ? "100" : "0"}
                    value={data[param] || ""}
                    onChange={(e) => updateNodeData(id, { [param]: e.target.value })}
                    className="w-full bg-[#111] text-gray-200 border border-[#333] rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-green-500 border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
CropImageNode.displayName = "CropImageNode";
