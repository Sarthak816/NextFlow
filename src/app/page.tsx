"use client";

import { useState } from "react";
import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false);

  if (!showWorkspace) {
    return <LandingPage onEnter={() => setShowWorkspace(true)} />;
  }

  return (
    <div className="flex w-full h-full text-white bg-black overflow-hidden">
      <LeftSidebar />
      <WorkflowCanvas />
      <RightSidebar />
    </div>
  );
}
