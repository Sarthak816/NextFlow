import { LeftSidebar } from "@/components/sidebar/left-sidebar";
import { RightSidebar } from "@/components/sidebar/right-sidebar";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";

export default function Home() {
  return (
    <div className="flex w-full h-full text-white bg-black overflow-hidden">
      <LeftSidebar />
      <WorkflowCanvas />
      <RightSidebar />
    </div>
  );
}
