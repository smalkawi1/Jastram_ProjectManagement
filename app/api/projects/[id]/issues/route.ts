import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

function parseDueDate(
  dueDate: string | null | undefined
): Date | null | undefined {
  if (dueDate === undefined) return undefined;
  if (!dueDate) return null;

  // When the client sends a plain "YYYY-MM-DD" from a date input,
  // interpret it as a date-only value and normalise to noon UTC.
  // This avoids timezone shifts that can move the date backwards.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return new Date(`${dueDate}T12:00:00.000Z`);
  }

  return new Date(dueDate);
}

// List issues for a single project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const issues = await prisma.issue.findMany({
      where: { projectId: id },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(issues);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}

// Create a new issue for a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.createIssue(user.role)) return forbidden();

  try {
    const { id: projectId } = await params;
    const body = await req.json();

    const { title, description, assigneeId, dueDate, status }: {
      title?: string;
      description?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
      status?: "OPEN" | "IN_PROGRESS" | "CLOSED";
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const due = parseDueDate(dueDate);

    const issue = await prisma.issue.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        assigneeId: assigneeId || null,
        dueDate: due,
        status: status ?? "OPEN",
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}

