import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DELIVERABLE_ORDER } from "@/lib/deliverable-templates";
import { MilestoneType } from "@/app/generated/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

const MILESTONE_TYPES: MilestoneType[] = ["KICK_OFF", "PDR", "FDR"];
const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

function parsePlannedDeliveryDate(
  plannedDeliveryDate: string | null | undefined
): Date | null {
  if (!plannedDeliveryDate || typeof plannedDeliveryDate !== "string") return null;
  const s = plannedDeliveryDate.trim();
  if (!s) return null;

  // Handle plain "YYYY-MM-DD" from date inputs without timezone shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(`${s}T12:00:00.000Z`);
  }
  // Handle "DD/MM/YYYY" or "MM/DD/YYYY" from some browsers/locales
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, y] = slashMatch;
    const month = parseInt(a!, 10);
    const day = parseInt(b!, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const iso = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return new Date(`${iso}T12:00:00.000Z`);
    }
  }

  const d = new Date(plannedDeliveryDate);
  return Number.isNaN(d.getTime()) ? null : d;
}

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
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.createProject(user.role)) return forbidden();

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
      hullNumbers,
      salesOrderNumbers,
    } = body;

    if (!projectNumber || !clientName || !shipType || !classSociety || !projectManagerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const deliveryDate = parsePlannedDeliveryDate(plannedDeliveryDate);
    const manualDate =
      deliveryDate != null
        ? new Date(deliveryDate.getTime() - THREE_WEEKS_MS)
        : null;

    // Normalize optional arrays: hullNumbers and salesOrderNumbers
    const hullList: string[] = Array.isArray(hullNumbers)
      ? hullNumbers.filter((h): h is string => typeof h === "string").map((h) => h.trim()).filter(Boolean)
      : typeof hullNumbers === "string" && hullNumbers.trim()
        ? hullNumbers.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
        : [];
    const orderList: string[] = Array.isArray(salesOrderNumbers)
      ? salesOrderNumbers.filter((o): o is string => typeof o === "string").map((o) => o.trim()).filter(Boolean)
      : typeof salesOrderNumbers === "string" && salesOrderNumbers.trim()
        ? salesOrderNumbers.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean)
        : [];

    const project = await prisma.project.create({
      data: {
        projectNumber: projectNumber.trim(),
        clientName:    clientName.trim(),
        shipType:      shipType.trim(),
        classSociety:  classSociety.trim(),
        projectManagerName: projectManagerName.trim(),
        plannedDeliveryDate: deliveryDate,
        description:   description?.trim() || null,
        generalNotes:  generalNotes?.trim() || null,
        hullNumbers:   hullList,
        milestones: {
          create: MILESTONE_TYPES.map((type) => ({ type })),
        },
        deliverables: {
          create: DELIVERABLE_ORDER.map((type) => ({
            type,
            // Sync SHIPPING deliverable with plannedDeliveryDate
            ...(type === "SHIPPING" && deliveryDate ? { dueDate: deliveryDate } : {}),
            // Default System Manual Completion to 3 weeks before shipping
            ...(type === "MANUAL" && manualDate ? { dueDate: manualDate } : {}),
          })),
        },
        salesOrders: orderList.length
          ? { create: orderList.map((salesOrderNumber) => ({ salesOrderNumber })) }
          : undefined,
      },
      include: {
        milestones:   true,
        deliverables: true,
        salesOrders:  true,
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
    const message =
      error instanceof Error ? error.message : typeof error === "string" ? error : "Failed to create project";
    return NextResponse.json(
      { error: "Failed to create project", details: message },
      { status: 500 }
    );
  }
}
