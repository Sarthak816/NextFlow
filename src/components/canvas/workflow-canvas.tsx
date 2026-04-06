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
  Loader2 
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
    } catch (e) {
      console.error(e);
      alert("Failed to save workflow");
    }
    return null;
  };

  const handleRun = async () => {
    if (isRunning) return;
    
    let currentId = useWorkflowStore.getState().id;
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
      
      if (!res.ok) throw new Error("Failed to trigger execution");
      const { runId } = await res.json();

      const poll = async () => {
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
        if (isDone) setIsRunning(false);
        return isDone;
      };

      const interval = setInterval(async () => {
        const done = await poll();
        if (done) clearInterval(interval);
      }, 2000);

    } catch (err) {
      console.error(err);
      setIsRunning(false);
      alert("Run failed to start. Check if Trigger.dev is active.");
    }
  };

  const handlePaneClick = useCallback(() => {
    toggleLeftSidebar(true);
    toggleRightSidebar(true);
  }, [toggleLeftSidebar, toggleRightSidebar]);

  return (
    <div className="flex-1 h-full w-full relative">
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
        minZoom={0.1}
        maxZoom={2}
        className="bg-[#000]"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background color="#111" gap={20} size={1} variant={BackgroundVariant.Dots} />
        <Controls className="bg-[#111] border border-[#222] fill-gray-600" showInteractive={false} />
        
        <Panel position="top-left" className="flex gap-2">
           <button 
             onClick={() => toggleLeftSidebar(!leftSidebarCollapsed)}
             className="bg-[#111] border border-[#222] p-2 rounded-lg hover:bg-[#161616] text-gray-500 transition-colors"
           >
              {leftSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
           </button>
        </Panel>

        <Panel position="top-right" className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-1 px-2 shadow-2xl flex gap-2 items-center cursor-pointer hover:bg-[#111] transition-colors" onClick={(e) => {
             // Clicking the panel bar also toggles if not on inputs
             if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                toggleLeftSidebar(true);
                toggleRightSidebar(true);
             }
        }}>
           <input 
             value={name}
             onChange={(e) => setMetadata(id, e.target.value)}
             className="bg-transparent text-[11px] font-bold text-gray-400 border-none outline-none w-32 px-1 focus:ring-0 uppercase tracking-widest"
             placeholder="UNTITLED WORKFLOW"
             onClick={(e) => e.stopPropagation()}
           />
           <div className="w-[1px] bg-[#222] h-6 mx-1" />
           <button 
             onClick={(e) => { e.stopPropagation(); handleRun(); }}
             disabled={isRunning}
             className={`bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] px-5 py-1.5 rounded-full font-bold transition-all flex items-center gap-2 uppercase tracking-tighter shadow-indigo-500/20 ${isRunning ? 'opacity-50 cursor-not-allowed' : 'shadow-lg'}`}
           >
              {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-2.5 h-2.5 fill-current" />}
              {isRunning ? 'Executing...' : 'Run Workflow'}
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleSave(); }}
             className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-500 hover:text-green-500"
             title="Save Workflow"
           >
              <Save className="w-4 h-4" />
           </button>
           <button
             onClick={(e) => { e.stopPropagation(); exportWorkflow(); }}
             className="p-2 hover:bg-[#222] rounded-lg transition-colors text-gray-500"
             title="Export JSON"
           >
              <Download className="w-4 h-4" />
           </button>
           <div className="w-[1px] bg-[#222] h-6 mx-1" />
           <button 
             onClick={(e) => { e.stopPropagation(); toggleRightSidebar(!rightSidebarCollapsed); }}
             className="bg-[#111] border border-[#222] p-2 rounded-lg hover:bg-[#161616] text-gray-500"
           >
              {rightSidebarCollapsed ? <PanelRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
           </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
