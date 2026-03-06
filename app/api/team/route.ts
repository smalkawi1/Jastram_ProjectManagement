import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { assignments: true } },
      },
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.createTeamMember(user.role)) return forbidden();

  try {
    const body = await req.json();
    const { name, capacityHoursPerWeek } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const capacity =
      capacityHoursPerWeek != null ? Number(capacityHoursPerWeek) : 40;
    if (Number.isNaN(capacity)) {
      return NextResponse.json({ error: "Invalid capacityHoursPerWeek" }, { status: 400 });
    }
    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        capacityHoursPerWeek: Math.max(0, capacity),
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
