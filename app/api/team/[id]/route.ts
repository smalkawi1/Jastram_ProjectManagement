import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

function isPrismaP2025(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            task: {
              include: {
                project: { select: { id: true, projectNumber: true, clientName: true } },
              },
            },
          },
        },
      },
    });
    if (!member)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch team member" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.editTeamMember(user.role)) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name: body.name != null ? String(body.name).trim() : undefined,
        capacityHoursPerWeek:
          body.capacityHoursPerWeek != null
            ? Math.max(0, Number(body.capacityHoursPerWeek))
            : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.deleteTeamMember(user.role)) return forbidden();

  try {
    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 });
  }
}
