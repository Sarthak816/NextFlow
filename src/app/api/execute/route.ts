import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const ExecuteSchema = z.object({
  workflowId: z.string(),
  nodeIds: z.array(z.string()).optional(), 
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in to execute workflows." }, { status: 401 });
    }

    const json = await req.json();
    const { workflowId, nodeIds } = ExecuteSchema.parse(json);

    // Verify workflow ownership
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId, userId },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found or access denied." }, { status: 404 });
    }

    // 1. Create WorkflowRun record
    const run = await db.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "PENDING",
        nodeIds: nodeIds || [],
        triggeredBy: nodeIds ? (nodeIds.length === 1 ? "SINGLE" : "SELECTION") : "FULL"
      }
    });

    if (!process.env.TRIGGER_SECRET_KEY) {
       console.error("CRITICAL: TRIGGER_SECRET_KEY is missing from environment variables.");
       return NextResponse.json({ error: "Server configuration error: Trigger service not configured." }, { status: 500 });
    }

    // 2. Trigger the Trigger.dev v3 task
    try {
      const triggerHandle = await tasks.trigger("workflow-runner", {
        runId: run.id,
        workflowData: workflow.data,
        targetNodeIds: nodeIds,
      });

      return NextResponse.json({ runId: run.id, triggerId: triggerHandle.id });
    } catch (triggerError: any) {
      console.error("Trigger.dev task trigger failed:", triggerError);
      
      // Update run status to failed immediately
      await db.workflowRun.update({
        where: { id: run.id },
        data: { status: "FAILED", completedAt: new Date() }
      });

      return NextResponse.json({ 
        error: `Execution engine failure: ${triggerError.message || "Unknown error"}. Check if tasks are deployed.` 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("API Execute Route Error:", error);
    return NextResponse.json({ error: `System error: ${error.message || "An unexpected error occurred."}` }, { status: 500 });
  }
}
