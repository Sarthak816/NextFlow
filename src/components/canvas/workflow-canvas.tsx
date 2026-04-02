"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionMode,
  ColorMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/store/workflow-store";

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
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setExecutionStatus,
    clearExecutionStatus,
    exportWorkflow,
    importWorkflow,
    name,
    setMetadata,
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
        alert("Workflow saved successfully!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save workflow");
    }
  };

  const handleRun = async () => {
    clearExecutionStatus();
    
    // Quick mock execution simulation for UI
    for (const node of nodes) {
      setExecutionStatus(node.id, "RUNNING");
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
      setExecutionStatus(node.id, "COMPLETED");
    }
  };

  return (
    <div className="flex-1 h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        minZoom={0.1}
        maxZoom={2}
        className="bg-[#000]"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background 
          color="#333" 
          gap={20} 
          size={1.5} 
          variant={BackgroundVariant.Dots} 
        />
        <Controls 
          className="bg-[#1a1a1a] border border-[#333] fill-gray-400 text-gray-400"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor="#333" 
          maskColor="rgba(0,0,0,0.7)"
          className="bg-[#111] border border-[#222]" 
        />
        
        <Panel position="top-right" className="bg-[#111] border border-[#333] rounded-md p-2 shadow-lg flex gap-2 overflow-hidden">
           <div className="flex flex-col justify-center px-2 border-r border-[#333]">
              <input 
                value={name}
                onChange={(e) => setMetadata(null, e.target.value)}
                className="bg-transparent text-xs text-gray-200 border-none outline-none w-32"
                placeholder="Workflow name"
              />
           </div>
           <button 
             onClick={handleRun}
             className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-full font-medium transition-colors"
           >
              Run Workflow
           </button>
           <button 
             onClick={handleSave}
             className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-full font-medium transition-colors"
           >
              Save
           </button>
           <div className="w-[1px] bg-[#333] mx-1 h-8 self-center" />
           <button
             onClick={exportWorkflow}
             className="bg-[#222] hover:bg-[#333] text-gray-300 text-xs px-3 py-1.5 rounded-md transition-colors"
           >
             Export JSON
           </button>
           <label className="bg-[#222] hover:bg-[#333] text-gray-300 text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer inline-block">
             Import JSON
             <input
               type="file"
               className="hidden"
               accept=".json"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onload = (re) => {
                     const json = re.target?.result as string;
                     importWorkflow(json);
                   };
                   reader.readAsText(file);
                 }
               }}
             />
           </label>
        </Panel>
      </ReactFlow>
    </div>
  );
}
