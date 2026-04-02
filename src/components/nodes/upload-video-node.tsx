import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Video as VideoIcon, UploadCloud } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";

export const UploadVideoNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [isUploading, setIsUploading] = useState(false);

  // Mock upload logic
  const handleUploadClick = () => {
    setIsUploading(true);
    setTimeout(() => {
      updateNodeData(id, { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4" });
      setIsUploading(false);
    }, 2000); // simulate upload
  };

  return (
    <NodeWrapper
      id={id}
      title={data.label || "Upload Video"}
      icon={VideoIcon}
      iconColor="text-red-400"
      selected={selected}
    >
      <div className="flex flex-col gap-3 w-[300px]">
        {data.videoUrl ? (
          <div className="relative w-full aspect-video rounded-lg bg-[#111] overflow-hidden border border-[#333]">
            <video 
              src={data.videoUrl} 
              controls 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={() => updateNodeData(id, { videoUrl: null })}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-black/80 z-10"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#444] rounded-lg bg-[#111] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span className="text-sm text-gray-400 animate-pulse">Uploading...</span>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-400 max-w-[150px] text-center">
                  Click to upload MP4, MOV, WEBM
                </span>
              </>
            )}
          </button>
        )}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-red-500 border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
UploadVideoNode.displayName = "UploadVideoNode";
