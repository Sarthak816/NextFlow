import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const runs = await db.workflowRun.findMany({
    where: { userId },
    include: {
      workflow: {
        select: { name: true }
      },
      nodeExecutions: true
    },
    orderBy: { startedAt: "desc" },
    take: 20
  });

  return NextResponse.json(runs);
}
