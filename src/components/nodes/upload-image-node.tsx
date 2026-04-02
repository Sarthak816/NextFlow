import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";
import Image from "next/image";

export const UploadImageNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const [isUploading, setIsUploading] = useState(false);

  // Note: we will integrate real Transloadit Uppy logic here later.
  // For now we mock the UI upload behavior.
  const handleUploadClick = () => {
    setIsUploading(true);
    setTimeout(() => {
      updateNodeData(id, { imageUrl: "https://picsum.photos/400/300" });
      setIsUploading(false);
    }, 1500); // simulate upload
  };

  return (
    <NodeWrapper
      id={id}
      title={data.label || "Upload Image"}
      icon={ImageIcon}
      iconColor="text-blue-400"
      selected={selected}
    >
      <div className="flex flex-col gap-3">
        {data.imageUrl ? (
          <div className="relative w-full h-32 rounded-lg bg-[#111] overflow-hidden border border-[#333]">
            <Image
              src={data.imageUrl}
              alt="Uploaded Preview"
              fill
              className="object-cover"
            />
            <button 
              onClick={() => updateNodeData(id, { imageUrl: null })}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#444] rounded-lg bg-[#111] hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <span className="text-sm text-gray-400 animate-pulse">Uploading...</span>
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-400 max-w-[150px] text-center">
                  Click to upload JPG, PNG, WEBP
                </span>
              </>
            )}
          </button>
        )}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="w-3 h-3 bg-blue-500 border-2 border-[#222]"
        />
      </div>
    </NodeWrapper>
  );
});
UploadImageNode.displayName = "UploadImageNode";
