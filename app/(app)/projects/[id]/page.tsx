import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { getDateStatus, STATUS_CLASSES, statusLabel } from "@/lib/date-status";
import { getDeliverableTemplate, DELIVERABLE_ORDER } from "@/lib/deliverable-templates";
import { getMilestoneTemplate } from "@/lib/milestone-templates";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import IssueLogSection from "./IssueLogSection";
import DeliverableRow from "./DeliverableRow";
import MilestoneRow from "./MilestoneRow";
import ProjectNotesEditor from "./ProjectNotesEditor";
import ProjectDetailActions from "./ProjectDetailActions";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD:     "bg-amber-100 text-amber-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-600",
};
const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, user, assignees] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: {
        milestones:   { orderBy: { type: "asc" } },
        deliverables: { orderBy: { type: "asc" } },
        tasks:        { orderBy: [{ status: "asc" }, { orderIndex: "asc" }] },
        salesOrders:  { orderBy: { salesOrderNumber: "asc" } },
      },
    }),
    getCurrentUser(),
    prisma.user.findMany({
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
  ]);
  if (!project) notFound();

  const canEdit = user ? can.editProject(user.role) : false;
  const canDelete = user ? can.deleteProject(user.role) : false;

  const sortedDeliverables = DELIVERABLE_ORDER.map(
    (type) => project.deliverables.find((d) => d.type === type)!
  ).filter(Boolean);

  const MILESTONE_ORDER = ["KICK_OFF", "PDR", "FDR"] as const;
  const sortedMilestones = MILESTONE_ORDER.map(
    (type) => project.milestones.find((m) => m.type === type)!
  ).filter(Boolean);

  const deliveryStatus = getDateStatus(project.plannedDeliveryDate, project.status === "COMPLETED");
  const dsc = STATUS_CLASSES[deliveryStatus];

  const assigneeOptions = assignees.map((u) => ({
    id: u.id,
    name: u.name || u.email,
    email: u.email,
  }));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <Link href="/projects" className="mt-1 text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-[#6b8cba] bg-[#f0f5fb] px-2 py-0.5 rounded">
              {project.projectNumber}
            </span>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_PILL[project.status]}`}>
              {STATUS_LABEL[project.status]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0d1f3c] mt-1">{project.clientName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {project.shipType} · {project.classSociety} · PM: {project.projectManagerName}
          </p>
          {(project.hullNumbers?.length > 0 || project.salesOrders?.length > 0) && (
            <p className="text-xs text-gray-500 mt-1">
              {project.hullNumbers?.length > 0 && (
                <span>Hull(s): {project.hullNumbers.join(", ")}</span>
              )}
              {project.hullNumbers?.length > 0 && project.salesOrders?.length > 0 && " · "}
              {project.salesOrders?.length > 0 && (
                <span>Sales order(s): {project.salesOrders.map((s) => s.salesOrderNumber).join(", ")}</span>
              )}
            </p>
          )}
        </div>
        {/* Delivery date */}
        {project.plannedDeliveryDate && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400">Planned Delivery</p>
            <p className={`text-sm font-semibold ${dsc.text}`}>
              {format(new Date(project.plannedDeliveryDate), "MMM d, yyyy")}
            </p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${dsc.badge}`}>
              {statusLabel(deliveryStatus, project.plannedDeliveryDate ? new Date(project.plannedDeliveryDate) : null)}
            </span>
          </div>
        )}
        {(canEdit || canDelete) && (
          <ProjectDetailActions projectId={project.id} canEdit={canEdit} canDelete={canDelete} />
        )}
      </div>

      {/* General notes */}
      <ProjectNotesEditor projectId={project.id} initialNotes={project.generalNotes ?? ""} canEdit={canEdit} />

      {/* ── Issue log ── */}
      <IssueLogSection
        projectId={project.id}
        initialIssues={[]}
        assignees={assigneeOptions}
        canEdit={canEdit}
      />

      {/* ── Deliverables ── */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0d1f3c]">Project Deliverables</h2>
          <p className="text-xs text-gray-400">8 standard tracking steps</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sortedDeliverables.map((d, i) => {
            const tmpl = getDeliverableTemplate(d.type);
            const ds = getDateStatus(d.dueDate, d.status === "COMPLETED");
            return (
              <DeliverableRow
                key={d.id}
                deliverable={d}
                template={tmpl}
                status={ds}
                stepNumber={i + 1}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      </section>

      {/* ── Milestones ── */}
      <section className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0d1f3c]">Engineering Review Meetings</h2>
          <p className="text-xs text-gray-400">3 milestones · placement fluid</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sortedMilestones.map((m) => {
            const tmpl = getMilestoneTemplate(m.type);
            const ms = getDateStatus(m.dueDate, m.status === "COMPLETED");
            return (
              <MilestoneRow
                key={m.id}
                milestone={m}
                template={tmpl}
                status={ms}
                canEdit={canEdit}
              />
            );
          })}
        </div>
      </section>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 text-xs text-gray-500 px-1 pb-2">
        <span className="flex items-center gap-1.5">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />
          Overdue
        </span>
        <span className="flex items-center gap-1.5">
          <ExclamationTriangleIcon className="w-3.5 h-3.5 text-amber-500" />
          Due within 7 days
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
          On track / Completed
        </span>
      </div>
    </div>
  );
}
