import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Video as VideoIcon, UploadCloud } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";

import { useUppy, FileInput } from "@uppy/react";
import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import "@uppy/core/css/style.min.css";
import "@uppy/file-input/css/style.min.css";

export const UploadVideoNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const uppy = useUppy(() => {
    const u = new Uppy({
      id: `vid-${id}`,
      autoProceed: true,
      restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ["video/*"] },
    }).use(Transloadit, {
      params: {
        auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY },
        template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_VIDEO,
      },
    });

    u.on("transloadit:result", (stepName, result) => {
      if (result.ssl_url) {
        updateNodeData(id, { videoUrl: result.ssl_url });
      }
    });

    return u;
  });

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
          <label className="w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#444] rounded-lg bg-[#111] hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
            <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs text-gray-400 max-w-[150px] text-center group-hover:text-gray-300">
              Click to upload MP4, MOV, WEBM
            </span>
            <FileInput uppy={uppy} className="hidden" />
          </label>
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
