import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseInputDate } from "@/lib/date";

const VALID_ISSUE_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

function isPrismaP2025(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}

// Update an existing issue
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.editIssue(user.role)) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json();

    const { title, description, assigneeId, dueDate, status } = body;

    if (status !== undefined && !VALID_ISSUE_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const due = dueDate !== undefined ? parseInputDate(dueDate) : undefined;

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        title,
        description,
        assigneeId: assigneeId !== undefined ? (assigneeId ?? null) : undefined,
        dueDate: due,
        status,
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update issue" },
      { status: 500 }
    );
  }
}

// Delete an issue
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.deleteIssue(user.role)) return forbidden();

  try {
    const { id } = await params;
    await prisma.issue.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}
