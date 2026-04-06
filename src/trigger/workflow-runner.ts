import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { getExecutionPlan } from "@/lib/dag-utils";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const workflowRunner = task({
  id: "workflow-runner",
  run: async ({ runId, workflowData, targetNodeIds }: { runId: string, workflowData: { nodes: any[], edges: any[] }, targetNodeIds?: string[] }) => {
    const { nodes, edges } = workflowData;
    
    await db.workflowRun.update({
      where: { id: runId },
      data: { status: "RUNNING" }
    });

    try {
      const executionPlan = getExecutionPlan(nodes, edges, targetNodeIds?.length ? targetNodeIds : undefined);
      const nodeOutputs: Record<string, any> = {};

      for (const level of executionPlan) {
        // Parallel execution of nodes in this level
        await Promise.all(level.nodes.map(async (nodeId) => {
          const node = nodes.find((n: any) => n.id === nodeId);
          if (!node) return;

          // Record start
          await db.nodeExecution.create({
            data: {
              runId,
              nodeId,
              nodeType: node.type || "unknown",
              nodeLabel: node.data?.label || "",
              status: "RUNNING",
              startedAt: new Date(),
            }
          });

          // Execute based on type
          let output: any = null;
          
          try {
            switch(node.type) {
              case "textNode":
                output = node.data?.text || "";
                break;
              case "uploadImageNode":
                output = node.data?.imageUrl || "";
                break;
              case "uploadVideoNode":
                output = node.data?.videoUrl || "";
                break;
              case "llmNode": {
                // Find input from edges
                const incomingEdges = edges.filter(e => e.target === nodeId);
                let fullPrompt = node.data?.userPrompt || "Generate content based on inputs.";
                
                // Add outputs from upstream nodes
                incomingEdges.forEach(e => {
                  const sourceOutput = nodeOutputs[e.source];
                  if (sourceOutput) {
                    fullPrompt += `\nInput from ${e.sourceHandle}: ${sourceOutput}`;
                  }
                });

                const model = genAI.getGenerativeModel({ model: node.data?.model || "gemini-1.5-flash" });
                const result = await model.generateContent(fullPrompt);
                output = result.response.text();
                break;
              }
              case "cropNode":
                // Simulate FFmpeg logic but more realistically (delay + output)
                await new Promise(r => setTimeout(r, 2000));
                output = `Cropped: ${node.data?.imageUrl || "default_image"}`;
                break;
              case "extractFrameNode":
                await new Promise(r => setTimeout(r, 2000));
                output = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800";
                break;
              default:
                output = "Task completed";
            }
          } catch (e: any) {
             console.error(`Task fail for ${nodeId}`, e);
             throw e;
          }

          nodeOutputs[nodeId] = output;

          // Record completion
          await db.nodeExecution.updateMany({
            where: { runId, nodeId },
            data: {
              status: "COMPLETED",
              output: { result: output },
              completedAt: new Date(),
            }
          });
        }));
      }

      await db.workflowRun.update({
        where: { id: runId },
        data: { status: "COMPLETED", completedAt: new Date() }
      });
      
      return { success: true, outputs: nodeOutputs };
    } catch (error) {
      await db.workflowRun.update({
        where: { id: runId },
        data: { status: "FAILED", completedAt: new Date() }
      });
      throw error;
    }
  }
});
