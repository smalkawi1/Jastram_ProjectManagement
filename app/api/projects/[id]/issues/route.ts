import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseInputDate } from "@/lib/date";

const VALID_ISSUE_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

// List issues for a single project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

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

    if (status !== undefined && !VALID_ISSUE_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const due = dueDate !== undefined ? parseInputDate(dueDate) : undefined;

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

