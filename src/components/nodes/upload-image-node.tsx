import { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";
import NextImage from "next/image";

export const UploadImageNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Use object URL for immediate local preview
    const localUrl = URL.createObjectURL(file);
    updateNodeData(id, { imageUrl: localUrl, fileName: file.name } as any);

    // Also try Transloadit if configured
    const transloaditKey = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY;
    if (transloaditKey) {
      import("@uppy/core").then(({ default: Uppy }) =>
        import("@uppy/transloadit").then(({ default: Transloadit }) => {
          const u = new Uppy({ id: `img-${id}-${Date.now()}`, autoProceed: true })
            .use(Transloadit, {
              assemblyOptions: {
                params: {
                  auth: { key: transloaditKey },
                  template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_IMAGE || "",
                },
              },
            });
          u.on("transloadit:result", (_: string, result: any) => {
            if (result.ssl_url) updateNodeData(id, { imageUrl: result.ssl_url } as any);
          });
          u.addFile({ name: file.name, type: file.type, data: file });
        })
      );
    }
  };

  const imageUrl = data.imageUrl as string | null;

  return (
    <NodeWrapper id={id} title={data.label || "Upload Image"} icon={ImageIcon} iconColor="text-blue-400" selected={selected}>
      <div className="flex flex-col gap-3 w-[260px]">
        {imageUrl ? (
          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#333] bg-[#111] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => updateNodeData(id, { imageUrl: null } as any)}
              className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
            {data.fileName && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-gray-300 px-2 py-1 truncate">
                {data.fileName as string}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full h-36 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#333] rounded-xl bg-[#111] hover:bg-[#161616] hover:border-blue-500/50 transition-all group cursor-pointer"
          >
            <UploadCloud className="w-7 h-7 text-gray-600 group-hover:text-blue-400 transition-colors" />
            <span className="text-[11px] text-gray-500 group-hover:text-gray-300 text-center px-4">
              Click to upload image
            </span>
            <span className="text-[9px] text-gray-700">JPG, PNG, WEBP, GIF</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <Handle type="source" position={Position.Right} id="output" className="w-3 h-3 bg-blue-500 border-2 border-[#0a0a0a]" />
      </div>
    </NodeWrapper>
  );
});
UploadImageNode.displayName = "UploadImageNode";
