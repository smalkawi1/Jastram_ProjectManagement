import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProjectEditForm from "./ProjectEditForm";

export const dynamic = "force-dynamic";

const CLASS_SOCIETIES = ["ABS", "BV", "DNV", "LR", "RINA", "ClassNK", "CCS", "RMRS", "Other"];
const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"] as const;

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, user] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        milestones:   { orderBy: { type: "asc" } },
        deliverables: { orderBy: { type: "asc" } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!project) notFound();
  if (!user || !can.editProject(user.role)) notFound();

  const initial = {
    projectNumber:      project.projectNumber,
    clientName:         project.clientName,
    shipType:           project.shipType,
    classSociety:      project.classSociety,
    projectManagerName: project.projectManagerName,
    plannedDeliveryDate: project.plannedDeliveryDate
      ? new Date(project.plannedDeliveryDate).toISOString().slice(0, 10)
      : "",
    description:        project.description ?? "",
    generalNotes:       project.generalNotes ?? "",
    status:             project.status,
    hullNumbers:        (project.hullNumbers ?? []).join(", "),
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/projects/${id}`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Edit Project</h1>
          <p className="text-sm text-gray-500">
            {project.projectNumber} · {project.clientName}
          </p>
        </div>
      </div>

      <ProjectEditForm projectId={id} initial={initial} classSocieties={CLASS_SOCIETIES} statuses={STATUSES} />
    </div>
  );
}
