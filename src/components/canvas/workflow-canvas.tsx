"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Panel,
  ConnectionMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/store/workflow-store";
import { 
  ChevronRight, 
  PanelRight, 
  Play, 
  Save, 
  Download, 
  Loader2,
} from "lucide-react";

import { TextNode } from "@/components/nodes/text-node";
import { UploadImageNode } from "@/components/nodes/upload-image-node";
import { UploadVideoNode } from "@/components/nodes/upload-video-node";
import { LLMNode } from "@/components/nodes/llm-node";
import { CropImageNode } from "@/components/nodes/crop-image-node";
import { ExtractFrameNode } from "@/components/nodes/extract-frame-node";

const nodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  llmNode: LLMNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
}; 

export function WorkflowCanvas() {
  const {
    id,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setExecutionStatus,
    clearExecutionStatus,
    updateNodeData,
    exportWorkflow,
    name,
    setMetadata,
    rightSidebarCollapsed,
    toggleRightSidebar,
    toggleLeftSidebar,
  } = useWorkflowStore();

  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const handleSave = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({ name, nodes, edges }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        console.error("Save failed:", response.statusText);
        return null;
      }
      const data = await response.json();
      setMetadata(data.id, data.name);
      return data.id as string;
    } catch (e) {
      console.error("Save error:", e);
      return null;
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setRunError(null);

    // Save first to get/refresh the workflow ID
    const savedId = await handleSave();
    if (!savedId) {
      setRunError("Save failed — check auth & DB.");
      return;
    }

    setIsRunning(true);
    // Collapse sidebars for max canvas space
    toggleLeftSidebar(true);
    toggleRightSidebar(true);
    clearExecutionStatus();

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({ workflowId: savedId }),
        headers: { "Content-Type": "application/json" },
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Execute API returned an error");
      }

      const { runId } = resData;

      // Poll every 2s for status updates
      const interval = setInterval(async () => {
        try {
          const runRes = await fetch(`/api/workflows/runs/${runId}`);
          if (!runRes.ok) return;
          const runData = await runRes.json();

          runData.nodeExecutions?.forEach((exec: any) => {
            setExecutionStatus(exec.nodeId, exec.status);
            if (exec.status === "COMPLETED") {
              const outputVal = exec.output?.result;
              const node = nodes.find(n => n.id === exec.nodeId);
              if (node) {
                if (node.type === "llmNode") {
                  updateNodeData(exec.nodeId, { output: outputVal });
                } else if (["uploadImageNode", "cropImageNode", "extractFrameNode"].includes(node.type ?? "")) {
                  updateNodeData(exec.nodeId, { imageUrl: outputVal });
                } else if (node.type === "uploadVideoNode") {
                  updateNodeData(exec.nodeId, { videoUrl: outputVal });
                }
              }
            }
          });

          if (runData.status === "COMPLETED" || runData.status === "FAILED") {
            clearInterval(interval);
            setIsRunning(false);
            if (runData.status === "FAILED") setRunError("Run failed — check Trigger.dev logs");
          }
        } catch (e) {
          console.error("Poll error:", e);
        }
      }, 2000);

    } catch (err: any) {
      setIsRunning(false);
      setRunError(err.message || "Unknown run error");
      console.error("Run error:", err);
    }
  };

  // Tap on empty canvas collapses both sidebars
  const handlePaneClick = useCallback(() => {
    toggleLeftSidebar(true);
    toggleRightSidebar(true);
  }, [toggleLeftSidebar, toggleRightSidebar]);

  return (
    <div className="flex-1 h-full w-full relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        className="bg-black"
      >
        <Background color="#111" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="bg-[#111] border border-[#222] fill-gray-600" showInteractive={false} />

        {/* Top bar — no left toggle here, that lives inside LeftSidebar */}
        <Panel position="top-right" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-1.5 px-3 shadow-2xl flex gap-2 items-center">
          <input
            value={name}
            onChange={(e) => setMetadata(id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-transparent text-[10px] font-black text-gray-500 border-none outline-none w-36 px-1 focus:ring-0 uppercase tracking-widest placeholder:text-gray-800"
            placeholder="UNTITLED WORKFLOW"
          />

          <div className="w-[1px] bg-[#1a1a1a] h-6 mx-1" />

          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] px-5 py-2 rounded-full font-black transition-all uppercase tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]`}
          >
            {isRunning
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Running…</>
              : <><Play className="w-2.5 h-2.5 fill-current" /> Run</>
            }
          </button>

          <button
            onClick={handleSave}
            className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-all text-gray-500 hover:text-green-500"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={exportWorkflow}
            className="p-2 hover:bg-[#1a1a1a] rounded-xl transition-all text-gray-500 hover:text-indigo-400"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <div className="w-[1px] bg-[#1a1a1a] h-6 mx-1" />

          {/* Right sidebar toggle only */}
          <button
            onClick={() => toggleRightSidebar(!rightSidebarCollapsed)}
            className="bg-[#111] border border-[#222] p-2 rounded-xl hover:bg-[#161616] text-gray-500 hover:text-indigo-500 transition-all"
            title="Toggle History"
          >
            {rightSidebarCollapsed ? <PanelRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </Panel>

        {/* Error toast */}
        {runError && (
          <Panel position="bottom-center">
            <div className="bg-red-900/80 border border-red-500/50 text-red-300 text-xs px-4 py-2 rounded-xl font-mono backdrop-blur">
              ⚠ {runError}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
