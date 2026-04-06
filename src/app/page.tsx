"use client";

import { useState } from "react";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";
import { LandingPage } from "@/components/landing/LandingPage";
import { useWorkflowStore } from "@/store/workflow-store";

export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const leftSidebarOpen = useWorkflowStore(state => state.leftSidebarOpen);
  const rightSidebarOpen = useWorkflowStore(state => state.rightSidebarOpen);

  if (!showWorkspace) {
    return <LandingPage onEnter={() => setShowWorkspace(true)} />;
  }

  return (
    <div className="flex w-full h-full text-white bg-black overflow-hidden animate-in fade-in duration-500">
      {leftSidebarOpen && <LeftSidebar />}
      <WorkflowCanvas />
      {rightSidebarOpen && <RightSidebar />}
    </div>
  );
}
