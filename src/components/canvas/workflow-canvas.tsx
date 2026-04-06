"use client";

import { useCallback } from "react";
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
  Upload 
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
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useWorkflowStore();

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
    let currentId = id;
    if (!currentId) {
       currentId = await handleSave();
       if (!currentId) return; // Error handled in handleSave
    }
    
    // Auto-toggle to hide sidebars on run to maximize canvas
    if (leftSidebarOpen) toggleLeftSidebar();
    if (rightSidebarOpen) toggleRightSidebar();

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

        return runData.status === "COMPLETED" || runData.status === "FAILED";
      };

      const interval = setInterval(async () => {
        const done = await poll();
        if (done) clearInterval(interval);
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Execution failed to start");
    }
  };

  const handlePaneClick = useCallback(() => {
    if (leftSidebarOpen) toggleLeftSidebar();
    if (rightSidebarOpen) toggleRightSidebar();
  }, [leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar]);

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
        <Background color="#333" gap={20} size={1.5} variant={BackgroundVariant.Dots} />
        <Controls className="bg-[#1a1a1a] border border-[#333] fill-gray-400 text-gray-400" showInteractive={false} />
        
        <Panel position="top-left" className="flex gap-2">
           <button 
             onClick={toggleLeftSidebar}
             className="bg-[#111] border border-[#333] p-2 rounded-md hover:bg-[#222] text-gray-400 transition-colors"
             title="Toggle History"
           >
              {leftSidebarOpen ? <PanelLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
           </button>
        </Panel>

        <Panel position="top-right" className="bg-[#111] border border-[#333] rounded-md p-1 px-2 shadow-lg flex gap-2 items-center">
           <input 
             value={name}
             onChange={(e) => setMetadata(id, e.target.value)}
             className="bg-transparent text-xs text-gray-200 border-none outline-none w-32 px-1 focus:ring-0"
             placeholder="Workflow name"
           />
           <div className="w-[1px] bg-[#333] h-6 mx-1" />
           <button 
             onClick={handleRun}
             className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5"
           >
              <Play className="w-3 h-3 fill-current" /> Run
           </button>
           <button 
             onClick={handleSave}
             className="p-1.5 hover:bg-[#222] rounded-md transition-colors text-gray-400 hover:text-green-400"
             title="Save Workflow"
           >
              <Save className="w-4 h-4" />
           </button>
           <button
             onClick={exportWorkflow}
             className="p-1.5 hover:bg-[#222] rounded-md transition-colors text-gray-400"
             title="Export JSON"
           >
              <Download className="w-4 h-4" />
           </button>
           <div className="w-[1px] bg-[#333] h-6 mx-1" />
           <button 
             onClick={toggleRightSidebar}
             className="bg-[#111] border border-[#333] p-1.5 rounded-md hover:bg-[#222] text-gray-400"
             title="Toggle Gallery"
           >
              {rightSidebarOpen ? <PanelRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
           </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
