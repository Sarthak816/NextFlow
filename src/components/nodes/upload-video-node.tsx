import { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Video as VideoIcon, UploadCloud, X } from "lucide-react";
import { NodeWrapper } from "./node-wrapper";
import { useWorkflowStore, type AppNode } from "@/store/workflow-store";

export const UploadVideoNode = memo(({ id, data, selected }: NodeProps<AppNode>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    // Immediate local preview via object URL
    const localUrl = URL.createObjectURL(file);
    updateNodeData(id, { videoUrl: localUrl, fileName: file.name } as any);

    // Try Transloadit in background if configured
    const transloaditKey = process.env.NEXT_PUBLIC_TRANSLOADIT_KEY;
    if (transloaditKey) {
      import("@uppy/core").then(({ default: Uppy }) =>
        import("@uppy/transloadit").then(({ default: Transloadit }) => {
          const u = new Uppy({ id: `vid-${id}-${Date.now()}`, autoProceed: true })
            .use(Transloadit, {
              assemblyOptions: {
                params: {
                  auth: { key: transloaditKey },
                  template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_VIDEO || "",
                },
              },
            });
          u.on("transloadit:result", (_: string, result: any) => {
            if (result.ssl_url) updateNodeData(id, { videoUrl: result.ssl_url } as any);
          });
          u.addFile({ name: file.name, type: file.type, data: file });
        })
      );
    }
  };

  const videoUrl = data.videoUrl as string | null;

  return (
    <NodeWrapper id={id} title={data.label || "Upload Video"} icon={VideoIcon} iconColor="text-red-400" selected={selected}>
      <div className="flex flex-col gap-3 w-[300px]">
        {videoUrl ? (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#333] bg-[#111] group">
            <video src={videoUrl} controls className="w-full h-full object-cover" />
            <button
              onClick={() => updateNodeData(id, { videoUrl: null } as any)}
              className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black text-white rounded-full p-1 transition-all opacity-0 group-hover:opacity-100 z-10"
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
            className="w-full aspect-video flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#333] rounded-xl bg-[#111] hover:bg-[#161616] hover:border-red-500/50 transition-all group cursor-pointer"
          >
            <VideoIcon className="w-8 h-8 text-gray-600 group-hover:text-red-400 transition-colors" />
            <span className="text-[11px] text-gray-500 group-hover:text-gray-300 text-center px-4">
              Click to upload video
            </span>
            <span className="text-[9px] text-gray-700">MP4, MOV, WEBM</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <Handle type="source" position={Position.Right} id="output" className="w-3 h-3 bg-red-500 border-2 border-[#0a0a0a]" />
      </div>
    </NodeWrapper>
  );
});
UploadVideoNode.displayName = "UploadVideoNode";
