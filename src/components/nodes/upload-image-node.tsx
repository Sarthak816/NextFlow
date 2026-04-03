import { useState, useMemo, memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";
import Image from "next/image";

import Uppy from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import "@uppy/core/css/style.css";
import "@uppy/file-input/dist/style.css";

export const UploadImageNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  const uppy = useMemo(() => {
    const u = new Uppy({
      id: `img-${id}`,
      autoProceed: true,
      restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ["image/*"] },
    }).use(Transloadit, {
      assemblyOptions: {
        params: {
          auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "" },
          template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_IMAGE || "",
        },
      },
    });

    u.on("transloadit:result", (stepName, result) => {
      if (result.ssl_url) {
        updateNodeData(id, { imageUrl: result.ssl_url } as any);
      }
    });

    return u;
  }, [id, updateNodeData]);

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
              src={data.imageUrl as string}
              alt="Uploaded Preview"
              fill
              className="object-cover"
            />
            <button 
              onClick={() => updateNodeData(id, { imageUrl: null } as any)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="w-full h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#444] rounded-lg bg-[#111] hover:bg-[#1a1a1a] transition-colors cursor-pointer group">
            <UploadCloud className="w-6 h-6 text-gray-500 group-hover:text-indigo-400 transition-colors" />
            <span className="text-xs text-gray-400 max-w-[150px] text-center group-hover:text-gray-300">
              Click to upload JPG, PNG, WEBP
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uppy.addFile({
                    name: file.name,
                    type: file.type,
                    data: file,
                    source: "Local",
                  });
                }
              }}
            />
          </label>
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
