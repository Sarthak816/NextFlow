"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/store/workflow-store";
import { 
  ChevronLeft, 
  ChevronRight, 
  PanelLeft, 
  PanelRight, 
  Play, 
  Save, 
  Download, 
  Loader2,
  AlertCircle
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
    importWorkflow,
    name,
    setMetadata,
    leftSidebarCollapsed,
    rightSidebarCollapsed,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useWorkflowStore();

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({ name, nodes, edges }),
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        setMetadata(data.id, data.name);
        return data.id;
      }
      throw new Error(`Save failed: ${response.statusText}`);
    } catch (e: any) {
      console.error(e);
      setError(`Save error: ${e.message}`);
      return null;
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setError(null);
    
    let currentId = id;
    if (!currentId) {
       currentId = await handleSave();
       if (!currentId) return; 
    }
    
    setIsRunning(true);
    
    // Auto-collapse sidebars on run to maximize building area
    toggleLeftSidebar(true);
    toggleRightSidebar(true);

    clearExecutionStatus();
    
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({ workflowId: currentId }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to trigger task");
      }
      
      const { runId } = await res.json();

      const poll = async () => {
        try {
          const runRes = await fetch(`/api/workflows/runs/${runId}`);
          if (!runRes.ok) return false;
          const runData = await runRes.json();

          runData.nodeExecutions?.forEach((exec: any) => {
            setExecutionStatus(exec.nodeId, exec.status);
            
            if (exec.status === "COMPLETED") {
               const outputVal = exec.output?.result;
               const node = nodes.find(n => n.id === exec.nodeId);
               if (node) {
                  if (node.type === 'llmNode') {
                     updateNodeData(exec.nodeId, { output: outputVal });
                  } else if (node.type === 'uploadImageNode' || node.type === 'cropNode' || node.type === 'extractFrameNode') {
                     updateNodeData(exec.nodeId, { imageUrl: outputVal });
                  } else if (node.type === 'uploadVideoNode') {
                     updateNodeData(exec.nodeId, { videoUrl: outputVal });
                  }
               }
            }
          });

          const isDone = runData.status === "COMPLETED" || runData.status === "FAILED";
          if (isDone) {
            setIsRunning(false);
            if (runData.status === "FAILED") setError("Workflow run failed.");
          }
          return isDone;
        } catch (e) {
          console.error("Poll error", e);
          return false;
        }
      };

      const interval = setInterval(async () => {
        const done = await poll();
        if (done) clearInterval(interval);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setIsRunning(false);
      setError(`Run error: ${err.message}`);
    }
  };

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
        
        <Panel position="top-left" className="flex gap-2">
           <button 
             onClick={() => toggleLeftSidebar(!leftSidebarCollapsed)}
             className="bg-[#111] border border-[#222] p-2.5 rounded-xl hover:bg-[#161616] text-gray-400 transition-all shadow-lg"
           >
              {leftSidebarCollapsed ? <PanelLeft className="w-5 h-5 text-indigo-500" /> : <ChevronLeft className="w-5 h-5" />}
           </button>
        </Panel>

        <Panel position="top-right" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-1.5 px-3 shadow-2xl flex gap-3 items-center backdrop-blur-md" onClick={(e) => {
             if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                handlePaneClick();
             }
        }}>
           <div className="flex flex-col">
              <input 
                value={name}
                onChange={(e) => setMetadata(id, e.target.value)}
                className="bg-transparent text-[10px] font-black text-gray-500 border-none outline-none w-32 px-1 focus:ring-0 uppercase tracking-widest placeholder:text-gray-800"
                placeholder="UNTITLED"
                onClick={(e) => e.stopPropagation()}
              />
              {error && (
                <div className="flex items-center gap-1 text-[8px] text-red-500 font-bold ml-1 uppercase">
                   <AlertCircle className="w-2 h-2" /> {error.slice(0, 20)}...
                </div>
              )}
           </div>
           
           <div className="w-[1px] bg-[#1a1a1a] h-8 mx-1" />
           
           <button 
             onClick={(e) => { e.stopPropagation(); handleRun(); }}
             disabled={isRunning}
             className={`bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-6 py-2 rounded-full font-black transition-all flex items-center gap-2.5 uppercase tracking-wide ${isRunning ? 'opacity-50 cursor-not-allowed' : 'shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]'}`}
           >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-2.5 h-2.5 fill-current" />}
              {isRunning ? 'RUNNING' : 'RUN'}
           </button>
           
           <div className="flex items-center gap-1">
             <button 
               onClick={(e) => { e.stopPropagation(); handleSave(); }}
               className="p-2.5 hover:bg-[#1a1a1a] rounded-xl transition-all text-gray-500 hover:text-green-500"
               title="Save"
             >
                <Save className="w-4.5 h-4.5" />
             </button>
             <button
               onClick={(e) => { e.stopPropagation(); exportWorkflow(); }}
               className="p-2.5 hover:bg-[#1a1a1a] rounded-xl transition-all text-gray-500 hover:text-indigo-400"
               title="Export"
             >
                <Download className="w-4.5 h-4.5" />
             </button>
           </div>

           <div className="w-[1px] bg-[#1a1a1a] h-8 mx-1" />
           
           <button 
             onClick={(e) => { e.stopPropagation(); toggleRightSidebar(!rightSidebarCollapsed); }}
             className="bg-[#111] border border-[#222] p-2.5 rounded-xl hover:bg-[#161616] text-gray-400 transition-all shadow-lg"
           >
              {rightSidebarCollapsed ? <PanelRight className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5" />}
           </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
