import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, unauthorized } from "@/lib/auth";

/**
 * GET /api/manual-printing?month=YYYY-MM
 * Returns projects shipping in the given month with their MANUAL deliverable details
 * for the monthly manual-printing reminder snapshot.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: "Query parameter 'month' required (YYYY-MM)" },
        { status: 400 }
      );
    }

    const [year, month] = monthParam.split("-").map(Number);
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const projects = await prisma.project.findMany({
      where: {
        plannedDeliveryDate: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { plannedDeliveryDate: "asc" },
      include: {
        deliverables: {
          where: { type: { in: ["MANUAL", "SHIPPING"] } },
        },
      },
    });

    type ManualRow = {
      projectId: string;
      projectNumber: string;
      clientName: string;
      shippingDate: string | null;
      manualDueDate: string | null;
      manualDeliverableId: string | null;
      copiesToPrint: number | null;
      readyForPrinting: boolean;
    };

    const rows: ManualRow[] = projects.map((p) => {
      const manual = p.deliverables.find((d) => d.type === "MANUAL");
      const shipping = p.deliverables.find((d) => d.type === "SHIPPING");
      const shippingDate = p.plannedDeliveryDate ?? (shipping?.dueDate ?? null);
      return {
        projectId: p.id,
        projectNumber: p.projectNumber,
        clientName: p.clientName,
        shippingDate: shippingDate ? shippingDate.toISOString() : null,
        manualDueDate: manual?.dueDate ? manual.dueDate.toISOString() : null,
        manualDeliverableId: manual?.id ?? null,
        copiesToPrint: manual?.copiesToPrint ?? null,
        readyForPrinting: manual?.readyForPrinting ?? false,
      };
    });

    return NextResponse.json({
      month: monthParam,
      rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch manual printing data" },
      { status: 500 }
    );
  }
}
