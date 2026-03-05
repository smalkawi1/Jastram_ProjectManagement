import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { format } from "date-fns";
import {
  ArrowLeftIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import TeamMemberEditor from "./TeamMemberEditor";
import TeamMemberDeleteButton from "./TeamMemberDeleteButton";

export const dynamic = "force-dynamic";

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [member, user] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            task: {
              include: {
                project: {
                  select: { id: true, projectNumber: true, clientName: true },
                },
              },
            },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!member) notFound();

  const canEdit = user ? can.editTeamMember(user.role) : false;
  const canDelete = user ? can.deleteTeamMember(user.role) : false;

  const totalAllocated = member.assignments.reduce(
    (sum, a) => sum + Number(a.allocatedHours ?? 0),
    0
  );
  const capacity = Number(member.capacityHoursPerWeek);
  const utilization =
    capacity > 0 ? Math.round((totalAllocated / capacity) * 100) : 0;
  const isOver = totalAllocated > capacity;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Link
          href="/team"
          className="mt-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-[#e0eaf5] text-[#1a3a6e] flex items-center justify-center text-lg font-semibold shrink-0">
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0d1f3c]">
                {member.name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {capacity}h capacity per week
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <TeamMemberEditor
                memberId={member.id}
                initialName={member.name}
                initialCapacity={String(capacity)}
                canEdit={canEdit}
              />
              {canDelete && (
                <TeamMemberDeleteButton memberId={member.id} memberName={member.name} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#0d1f3c] mb-3">
          Weekly allocation
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOver
                  ? "bg-red-500"
                  : utilization > 90
                    ? "bg-amber-500"
                    : "bg-[#2453a0]"
              }`}
              style={{
                width: `${Math.min(100, (totalAllocated / capacity) * 100)}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 shrink-0">
            {totalAllocated.toFixed(1)}h / {capacity}h
            {isOver && (
              <span className="text-red-600 ml-1">
                (over by {(totalAllocated - capacity).toFixed(1)}h)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-[#0d1f3c]">Task assignments</h2>
          <p className="text-xs text-gray-400">
            {member.assignments.length} assignment
            {member.assignments.length !== 1 ? "s" : ""}
          </p>
        </div>
        {member.assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderOpenIcon className="w-10 h-10 text-[#bfd0e8] mb-2" />
            <p className="text-sm text-gray-500">No task assignments yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Assign this member to tasks from project detail pages.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {member.assignments.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/projects/${a.task.project.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0d1f3c] truncate">
                      {a.task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.task.project.projectNumber} · {a.task.project.clientName}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-700">
                      {Number(a.allocatedHours ?? 0).toFixed(1)}h
                    </p>
                    {a.task.dueAt && (
                      <p className="text-xs text-gray-400">
                        Due {format(new Date(a.task.dueAt), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
