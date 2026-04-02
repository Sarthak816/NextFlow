import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const saveSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { name, nodes, edges } = saveSchema.parse(body);

    const workflow = await db.workflow.upsert({
      where: { 
        id: body.id || "new-id", 
      },
      update: {
        name,
        data: { nodes, edges },
      },
      create: {
        name,
        userId,
        data: { nodes, edges },
      },
    });

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("[WORKFLOW_SAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const workflows = await db.workflow.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" }
        });

        return NextResponse.json(workflows);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
