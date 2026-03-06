import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { parseInputDate } from "@/lib/date";

const VALID_PROJECT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

function isPrismaP2025(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        milestones:   { orderBy: { type: "asc" } },
        deliverables: { orderBy: { type: "asc" } },
        salesOrders:  { orderBy: { createdAt: "asc" } },
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
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.editProject(user.role)) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json();

    // Validate status enum if provided
    if (body.status !== undefined && !VALID_PROJECT_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
    }

    const deliveryDate =
      body.plannedDeliveryDate !== undefined
        ? parseInputDate(body.plannedDeliveryDate)
        : undefined;

    const hullList =
      body.hullNumbers !== undefined
        ? (Array.isArray(body.hullNumbers)
            ? body.hullNumbers.filter((h: unknown) => typeof h === "string").map((h: string) => h.trim()).filter(Boolean)
            : typeof body.hullNumbers === "string"
              ? body.hullNumbers.split(/[\s,]+/).map((s: string) => s.trim()).filter(Boolean)
              : []) as string[]
        : undefined;

    const imo =
      body.imoNumber !== undefined
        ? (typeof body.imoNumber === "string" && body.imoNumber.trim() ? body.imoNumber.trim() : null)
        : undefined;
    const diameterMm =
      body.upperRudderStockDiameterMm !== undefined
        ? (body.upperRudderStockDiameterMm != null && body.upperRudderStockDiameterMm !== ""
            ? Number(body.upperRudderStockDiameterMm)
            : null)
        : undefined;
    const diameterValid =
      diameterMm === null || diameterMm === undefined || (typeof diameterMm === "number" && !Number.isNaN(diameterMm) && diameterMm >= 0);

    // Update project + sync SHIPPING deliverable in one transaction
    const [updated] = await prisma.$transaction([
      prisma.project.update({
        where: { id },
        data: {
          projectNumber:       body.projectNumber,
          clientName:          body.clientName,
          shipType:            body.shipType,
          classSociety:        body.classSociety,
          projectManagerName:  body.projectManagerName,
          plannedDeliveryDate: deliveryDate,
          description:         body.description,
          generalNotes:        body.generalNotes,
          status:              body.status,
          ...(hullList !== undefined && { hullNumbers: hullList }),
          ...(imo !== undefined && { imoNumber: imo }),
          ...(diameterMm !== undefined && { upperRudderStockDiameterMm: diameterValid ? diameterMm : null }),
        },
      }),
      // Sync SHIPPING deliverable when plannedDeliveryDate is explicitly provided
      ...(body.plannedDeliveryDate !== undefined
        ? [
            prisma.projectDeliverable.updateMany({
              where: { projectId: id, type: "SHIPPING" },
              data:  { dueDate: deliveryDate },
            }),
          ]
        : []),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.deleteProject(user.role)) return forbidden();

  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (isPrismaP2025(error)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
