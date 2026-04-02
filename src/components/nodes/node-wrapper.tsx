import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useWorkflowStore } from "@/store/workflow-store";
import { type ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface NodeWrapperProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  selected?: boolean;
  children: ReactNode;
  className?: string;
}

export function NodeWrapper({
  id,
  title,
  icon: Icon,
  iconColor = "text-gray-400",
  selected,
  children,
  className,
}: NodeWrapperProps) {
  const isRunning = useWorkflowStore(state => state.executionStatus[id] === "RUNNING");

  return (
    <div
      className={cn(
        "bg-[#1a1a1a] rounded-xl border border-[#333] shadow-lg min-w-[280px] overflow-visible transition-colors",
        selected && "border-indigo-500 shadow-indigo-500/20",
        isRunning && "node-running",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#333] bg-[#222] rounded-t-xl">
        <div className={cn("p-1.5 rounded-md bg-[#111]", iconColor)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="font-medium text-sm text-gray-200">{title}</div>
      </div>
      <div className="p-4 relative">
        {children}
      </div>
    </div>
  );
}
