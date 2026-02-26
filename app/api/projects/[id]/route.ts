import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones:   { orderBy: { type: "asc" } },
        deliverables: { orderBy: { type: "asc" } },
        tasks:        { orderBy: [{ status: "asc" }, { orderIndex: "asc" }] },
      },
    });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        projectNumber:      body.projectNumber,
        clientName:         body.clientName,
        shipType:           body.shipType,
        classSociety:       body.classSociety,
        projectManagerName: body.projectManagerName,
        plannedDeliveryDate: body.plannedDeliveryDate ? new Date(body.plannedDeliveryDate) : undefined,
        description:        body.description,
        generalNotes:       body.generalNotes,
        status:             body.status,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
