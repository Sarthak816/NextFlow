import { task, batch } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { getExecutionPlan } from "@/lib/dag-utils";

export const workflowRunner = task({
  id: "workflow-runner",
  run: async ({ runId, workflowData, targetNodeIds }: { runId: string, workflowData: { nodes: any[], edges: any[] }, targetNodeIds?: string[] }) => {
    const { nodes, edges } = workflowData;
    
    // 1. Mark run as running
    await db.workflowRun.update({
      where: { id: runId },
      data: { status: "RUNNING" }
    });

    try {
      // 2. Get execution plan (topological sort levels)
      const executionPlan = getExecutionPlan(nodes, edges, targetNodeIds?.length ? targetNodeIds : undefined);
      
      // We will store node outputs in a map as we go, to pass them to downstream nodes
      const nodeOutputs: Record<string, any> = {};

      // 3. Execute level by level
      for (const level of executionPlan) {
        // Execute all nodes in the current level in parallel
        const batchPayload = level.nodes.map(nodeId => {
          const node = nodes.find((n: { id: string, type: string, data: any }) => n.id === nodeId);
          return {
            id: `execute-node-${node.type}`,
            payload: {
              runId,
              nodeId,
              nodeType: node.type,
              nodeData: node.data,
              edges, // to resolve upstream inputs
              previousOutputs: nodeOutputs,
            }
          };
        });

        // Some nodes like "Text" just pass through data, we don't need heavy tasks for them
        for (const taskPayload of batchPayload) {
           const { nodeId, nodeType, nodeData, previousOutputs, edges } = taskPayload.payload;
           
           // Create DB record
           await db.nodeExecution.create({
             data: {
               runId,
               nodeId,
               nodeType,
               nodeLabel: nodeData.label || "",
               status: "RUNNING",
               startedAt: new Date(),
             }
           });

           // Simulate execution based on nodeType
           let output = null;
           if (nodeType === "textNode") {
             output = nodeData.text;
           } else if (nodeType === "uploadImageNode") {
             output = nodeData.imageUrl;
           } else if (nodeType === "uploadVideoNode") {
             output = nodeData.videoUrl;
           } else {
             // For heavy tasks (LLM, Crop, Extract), we would call `tasks.triggerAndWait` or just a function
             // Here we simulate the external API calls by waiting
             await new Promise(resolve => setTimeout(resolve, 2000));
             output = `Result from ${nodeType}`;
           }

           nodeOutputs[nodeId] = output;

           await db.nodeExecution.updateMany({
             where: { runId, nodeId },
             data: {
               status: "COMPLETED",
               output: { result: output },
               completedAt: new Date(),
             }
           });
        }
      }

      await db.workflowRun.update({
        where: { id: runId },
        data: { status: "COMPLETED", completedAt: new Date() }
      });
      
      return { success: true, outputs: nodeOutputs };
    } catch (error: unknown) {
      console.error(error);
      await db.workflowRun.update({
        where: { id: runId },
        data: { status: "FAILED", completedAt: new Date() }
      });
      throw error;
    }
  }
});
