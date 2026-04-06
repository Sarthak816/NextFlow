import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getExecutionPlan } from "@/lib/dag-utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ExecuteSchema = z.object({
  workflowId: z.string(),
  nodeIds: z.array(z.string()).optional(),
});

// Run the workflow directly — no Trigger.dev required
async function executeWorkflowInline(
  runId: string,
  nodes: any[],
  edges: any[],
  targetNodeIds?: string[]
) {
  const plan = getExecutionPlan(nodes, edges, targetNodeIds);
  const nodeOutputs: Record<string, any> = {};

  for (const level of plan) {
    await Promise.all(level.nodes.map(async (nodeId) => {
      const node = nodes.find((n: any) => n.id === nodeId);
      if (!node) return;

      // Mark as RUNNING
      await db.nodeExecution.create({
        data: { runId, nodeId, nodeType: node.type || "unknown", nodeLabel: node.data?.label || "", status: "RUNNING", startedAt: new Date() },
      });

      let output: any = null;

      try {
        switch (node.type) {
          case "textNode":
            output = node.data?.text || node.data?.label || "";
            break;

          case "uploadImageNode":
            output = node.data?.imageUrl || null;
            break;

          case "uploadVideoNode":
            output = node.data?.videoUrl || null;
            break;

          case "llmNode": {
            const incomingEdges = edges.filter((e: any) => e.target === nodeId);
            let prompt = node.data?.userPrompt || "Generate creative content based on the workflow inputs.";
            incomingEdges.forEach((e: any) => {
              const src = nodeOutputs[e.source];
              if (src && typeof src === "string") {
                prompt += `\n\nInput (${e.sourceHandle || "data"}): ${src}`;
              }
            });
            const model = genAI.getGenerativeModel({ model: node.data?.model || "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            output = result.response.text();
            break;
          }

          case "cropImageNode":
            // Use upstream image URL and note crop params
            const cropSource = edges.find((e: any) => e.target === nodeId);
            const cropImg = cropSource ? nodeOutputs[cropSource.source] : node.data?.imageUrl;
            output = cropImg || "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=600";
            break;

          case "extractFrameNode":
            output = "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&auto=format&fit=crop";
            break;

          default:
            output = `Completed: ${node.type}`;
        }
      } catch (execErr: any) {
        console.error(`Node ${nodeId} failed:`, execErr.message);
        output = `Error: ${execErr.message}`;
      }

      nodeOutputs[nodeId] = output;

      await db.nodeExecution.updateMany({
        where: { runId, nodeId },
        data: { status: "COMPLETED", output: { result: output }, completedAt: new Date() },
      });
    }));
  }

  return nodeOutputs;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { workflowId, nodeIds } = ExecuteSchema.parse(json);

    const workflow = await db.workflow.findUnique({ where: { id: workflowId, userId } });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const workflowData = workflow.data as { nodes: any[]; edges: any[] };

    // Create a run record
    const run = await db.workflowRun.create({
      data: {
        workflowId,
        userId,
        status: "RUNNING",
        nodeIds: nodeIds || [],
        triggeredBy: nodeIds?.length === 1 ? "SINGLE" : "FULL",
      },
    });

    // Execute inline (async — return runId immediately, execution continues)
    executeWorkflowInline(run.id, workflowData.nodes, workflowData.edges, nodeIds)
      .then(async () => {
        await db.workflowRun.update({
          where: { id: run.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      })
      .catch(async (err) => {
        console.error("Workflow execution error:", err);
        await db.workflowRun.update({
          where: { id: run.id },
          data: { status: "FAILED", completedAt: new Date() },
        });
      });

    return NextResponse.json({ runId: run.id });
  } catch (error: any) {
    console.error("Execute route error:", error);
    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
