import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

function parseDueDate(
  dueDate: string | null | undefined
): Date | null | undefined {
  if (dueDate === undefined) return undefined;
  if (!dueDate) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return new Date(`${dueDate}T12:00:00.000Z`);
  }

  return new Date(dueDate);
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

    const { title, description, assigneeId, dueDate, status }: {
      title?: string;
      description?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
    } = body;

    const due = parseDueDate(dueDate);

    const updated = await prisma.issue.update({
      where: { id },
      data: {
        title,
        description,
        assigneeId: assigneeId ?? null,
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
    return NextResponse.json(
      { error: "Failed to delete issue" },
      { status: 500 }
    );
  }
}

