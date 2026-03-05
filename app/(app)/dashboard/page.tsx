import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDateStatus } from "@/lib/date-status";
import { FolderOpenIcon, ExclamationTriangleIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    include: { deliverables: true, milestones: true },
  });

  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completed  = projects.filter((p) => p.status === "COMPLETED").length;
  const onHold     = projects.filter((p) => p.status === "ON_HOLD").length;

  let overdueItems = 0, warnItems = 0;
  for (const p of projects) {
    for (const d of p.deliverables) {
      const s = getDateStatus(d.dueDate, d.status === "COMPLETED");
      if (s === "overdue") overdueItems++;
      if (s === "approaching") warnItems++;
    }
    for (const m of p.milestones) {
      const s = getDateStatus(m.dueDate, m.status === "COMPLETED");
      if (s === "overdue") overdueItems++;
      if (s === "approaching") warnItems++;
    }
  }

  const stats = [
    { label: "Total Projects",  value: total,      icon: FolderOpenIcon,          color: "text-[#2453a0] bg-[#e0eaf5]" },
    { label: "In Progress",     value: inProgress, icon: ClockIcon,               color: "text-blue-700 bg-blue-100" },
    { label: "Overdue Items",   value: overdueItems,icon: ExclamationTriangleIcon, color: "text-red-700 bg-red-100" },
    { label: "Due This Week",   value: warnItems,  icon: ExclamationTriangleIcon,  color: "text-amber-700 bg-amber-100" },
    { label: "Completed",       value: completed,  icon: CheckCircleIcon,          color: "text-green-700 bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0d1f3c]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of all projects and key dates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm px-5 py-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0d1f3c]">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects needing attention */}
      {overdueItems + warnItems > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-[#0d1f3c] mb-4">Needs Attention</h2>
          <div className="space-y-2">
            {projects.filter((p) => {
              return (
                [...p.deliverables, ...p.milestones].some((item) => {
                  const s = getDateStatus(item.dueDate, "status" in item ? (item as {status:string}).status === "COMPLETED" : false);
                  return s === "overdue" || s === "approaching";
                })
              );
            }).map((p) => {
              const pOverdue = [...p.deliverables, ...p.milestones].filter((i) =>
                getDateStatus(i.dueDate, (i as {status:string}).status === "COMPLETED") === "overdue"
              ).length;
              const pWarn = [...p.deliverables, ...p.milestones].filter((i) =>
                getDateStatus(i.dueDate, (i as {status:string}).status === "COMPLETED") === "approaching"
              ).length;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0d1f3c] truncate">{p.clientName}</p>
                    <p className="text-xs text-gray-400">{p.projectNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    {pOverdue > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full">
                        {pOverdue} overdue
                      </span>
                    )}
                    {pWarn > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full">
                        {pWarn} due soon
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All projects quick list */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0d1f3c]">All Projects</h2>
          <Link href="/projects" className="text-xs text-[#2453a0] hover:underline">View all →</Link>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No projects yet. <Link href="/projects/new" className="text-[#2453a0] underline">Create one</Link></p>
        ) : (
          <div className="space-y-1">
            {projects.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-mono text-[#6b8cba] w-24 shrink-0">{p.projectNumber}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{p.clientName}</span>
                <span className="text-xs text-gray-400 shrink-0">{p.shipType}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
