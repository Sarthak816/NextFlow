import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const run = await db.workflowRun.findUnique({
      where: { id: runId },
      include: {
        nodeExecutions: true,
      },
    });

    if (!run || run.userId !== userId) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
