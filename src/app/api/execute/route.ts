import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const ExecuteSchema = z.object({
  workflowId: z.string(),
  nodeIds: z.array(z.string()).optional(), // if we only want to run specific nodes
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { workflowId, nodeIds } = ExecuteSchema.parse(json);

    const workflow = await db.workflow.findUnique({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // 1. Create WorkflowRun in DB
    const run = await db.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "PENDING",
        nodeIds: nodeIds || [],
        triggeredBy: nodeIds ? (nodeIds.length === 1 ? "SINGLE" : "SELECTION") : "FULL"
      }
    });

    // 2. Trigger the orchestrator task
    const triggerHandle = await tasks.trigger("workflow-runner", {
      runId: run.id,
      workflowData: workflow.data,
      targetNodeIds: nodeIds,
    });

    return NextResponse.json({ runId: run.id, triggerId: triggerHandle.id });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json({ error: "Failed to execute" }, { status: 500 });
  }
}
