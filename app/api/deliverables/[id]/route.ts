import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DeliverableStatus } from "@/app/generated/prisma";
import { getCurrentUser, unauthorized, forbidden } from "@/lib/auth";
import { can } from "@/lib/permissions";

const THREE_WEEKS_MS = 21 * 24 * 60 * 60 * 1000;

function parseDueDate(
  dueDate: string | null | undefined
): Date | null | undefined {
  if (dueDate === undefined) return undefined;
  if (!dueDate) return null;

  // Handle plain "YYYY-MM-DD" from date inputs without timezone shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return new Date(`${dueDate}T12:00:00.000Z`);
  }

  return new Date(dueDate);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (!can.editDeliverable(user.role)) return forbidden();

  try {
    const { id } = await params;
    const body = await req.json();

    const dueDate = parseDueDate(body.dueDate);

    const data: {
      dueDate?: Date | null;
      status?: DeliverableStatus;
      notes?: string | null;
      copiesToPrint?: number | null;
      readyForPrinting?: boolean | null;
    } = {
      dueDate: dueDate !== undefined ? dueDate : undefined,
      status: body.status as DeliverableStatus | undefined,
      notes: body.notes,
    };
    if (body.copiesToPrint !== undefined) data.copiesToPrint = body.copiesToPrint == null ? null : Number(body.copiesToPrint);
    if (body.readyForPrinting !== undefined) data.readyForPrinting = body.readyForPrinting == null ? null : Boolean(body.readyForPrinting);

    const updated = await prisma.projectDeliverable.update({
      where: { id },
      data,
    });

    // Sync Project.plannedDeliveryDate when SHIPPING deliverable dueDate changes
    if (updated.type === "SHIPPING" && body.dueDate !== undefined) {
      await prisma.project.update({
        where: { id: updated.projectId },
        data:  { plannedDeliveryDate: dueDate },
      });

      // If System Manual deliverable does not yet have a due date,
      // default it to 3 weeks before the SHIPPING date.
      if (dueDate) {
        const manual = await prisma.projectDeliverable.findFirst({
          where: { projectId: updated.projectId, type: "MANUAL" },
        });

        if (manual && manual.dueDate === null) {
          await prisma.projectDeliverable.update({
            where: { id: manual.id },
            data: {
              dueDate: new Date(dueDate.getTime() - THREE_WEEKS_MS),
            },
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update deliverable" }, { status: 500 });
  }
}
