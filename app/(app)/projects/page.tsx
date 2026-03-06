import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { getDateStatus, STATUS_CLASSES, statusLabel } from "@/lib/date-status";
import { PROJECT_STATUS_PILL, PROJECT_STATUS_LABEL } from "@/lib/constants";
import { PlusIcon, FolderOpenIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, user] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        deliverables: true,
        milestones:   true,
      },
    }),
    getCurrentUser(),
  ]);

  const canCreate = user ? can.createProject(user.role) : false;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        {canCreate && (
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-[#2453a0] hover:bg-[#1e4080] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderOpenIcon className="w-14 h-14 text-[#bfd0e8] mb-4" />
          <h2 className="text-lg font-semibold text-[#0d1f3c] mb-1">No projects yet</h2>
          <p className="text-sm text-gray-500 mb-6">Create your first project to get started.</p>
          {canCreate && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-[#2453a0] text-white text-sm font-medium px-4 py-2.5 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              New Project
            </Link>
          )}
        </div>
      )}

      {/* Project cards */}
      <div className="grid gap-4">
        {projects.map((project) => {
          const deliveryStatus = getDateStatus(
            project.plannedDeliveryDate,
            project.status === "COMPLETED"
          );
          const sc = STATUS_CLASSES[deliveryStatus];
          const overdueCount = project.deliverables.filter((d) => {
            const s = getDateStatus(d.dueDate, d.status === "COMPLETED");
            return s === "overdue";
          }).length;
          const warnCount = project.deliverables.filter((d) => {
            const s = getDateStatus(d.dueDate, d.status === "COMPLETED");
            return s === "approaching";
          }).length;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden ${sc.card}`}
            >
              <div className="px-5 py-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-[#6b8cba] bg-[#f0f5fb] px-2 py-0.5 rounded">
                        {project.projectNumber}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PROJECT_STATUS_PILL[project.status]}`}>
                        {PROJECT_STATUS_LABEL[project.status]}
                      </span>
                    </div>
                    <h2 className="mt-1.5 text-base font-semibold text-[#0d1f3c] truncate">
                      {project.clientName}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {project.shipType} · {project.classSociety} · PM: {project.projectManagerName}
                    </p>
                  </div>

                  {/* Delivery date badge */}
                  <div className="shrink-0 text-right">
                    {project.plannedDeliveryDate ? (
                      <>
                        <p className="text-xs text-gray-400">Delivery</p>
                        <p className={`text-sm font-semibold mt-0.5 ${sc.text}`}>
                          {format(new Date(project.plannedDeliveryDate), "MMM d, yyyy")}
                        </p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${sc.badge}`}>
                          {statusLabel(deliveryStatus, project.plannedDeliveryDate ? new Date(project.plannedDeliveryDate) : null)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">No delivery date</span>
                    )}
                  </div>
                </div>

                {/* Alert chips */}
                {(overdueCount > 0 || warnCount > 0) && (
                  <div className="flex gap-2 mt-3">
                    {overdueCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full font-medium">
                        {overdueCount} overdue
                      </span>
                    )}
                    {warnCount > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
                        {warnCount} due soon
                      </span>
                    )}
                  </div>
                )}

                {/* General notes snippet */}
                {project.generalNotes && (
                  <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 line-clamp-2">
                    📌 {project.generalNotes}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
