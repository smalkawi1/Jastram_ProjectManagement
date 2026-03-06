import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseInputDate } from "@/lib/date";

const VALID_MILESTONE_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

function isPrismaP2025(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.editMilestone(user.role)) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json();

    if (body.status !== undefined && !VALID_MILESTONE_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
    }

    const updated = await prisma.milestone.update({
      where: { id },
      data: {
        dueDate: body.dueDate !== undefined ? parseInputDate(body.dueDate) : undefined,
        status:  body.status,
        notes:   body.notes,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
