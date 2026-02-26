import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DELIVERABLE_ORDER } from "@/lib/deliverable-templates";
import { MilestoneType } from "@/app/generated/prisma";

const MILESTONE_TYPES: MilestoneType[] = ["KICK_OFF", "PDR", "FDR"];

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        deliverables: { orderBy: { type: "asc" } },
        milestones:   { orderBy: { type: "asc" } },
        _count:       { select: { tasks: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectNumber,
      clientName,
      shipType,
      classSociety,
      projectManagerName,
      plannedDeliveryDate,
      description,
      generalNotes,
    } = body;

    if (!projectNumber || !clientName || !shipType || !classSociety || !projectManagerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        projectNumber: projectNumber.trim(),
        clientName:    clientName.trim(),
        shipType:      shipType.trim(),
        classSociety:  classSociety.trim(),
        projectManagerName: projectManagerName.trim(),
        plannedDeliveryDate: plannedDeliveryDate ? new Date(plannedDeliveryDate) : null,
        description:   description?.trim() || null,
        generalNotes:  generalNotes?.trim() || null,
        // Auto-create 3 milestones
        milestones: {
          create: MILESTONE_TYPES.map((type) => ({ type })),
        },
        // Auto-create 8 deliverables in standard order
        deliverables: {
          create: DELIVERABLE_ORDER.map((type) => ({ type })),
        },
      },
      include: {
        milestones:   true,
        deliverables: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "Project number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
