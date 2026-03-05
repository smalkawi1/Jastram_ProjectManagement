import Link from "next/link";
import { prisma } from "@/lib/db";
import { PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [members, user] = await Promise.all([
    prisma.teamMember.findMany({
      orderBy: { name: "asc" },
      include: {
        assignments: { include: { task: true } },
      },
    }),
    getCurrentUser(),
  ]);

  const canAddMember = user ? can.createTeamMember(user.role) : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Capacity and assignments
          </p>
        </div>
        {canAddMember && (
          <Link
            href="/team/new"
            className="inline-flex items-center gap-2 bg-[#2453a0] hover:bg-[#1e4080] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </Link>
        )}
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-100">
          <UserCircleIcon className="w-14 h-14 text-[#bfd0e8] mb-4" />
          <h2 className="text-lg font-semibold text-[#0d1f3c] mb-1">No team members yet</h2>
          <p className="text-sm text-gray-500 mb-6">Add team members to track capacity and task assignments.</p>
          {canAddMember && (
            <Link
              href="/team/new"
              className="inline-flex items-center gap-2 bg-[#2453a0] text-white text-sm font-medium px-4 py-2.5 rounded-lg"
            >
              <PlusIcon className="w-4 h-4" />
              Add Member
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {members.map((member) => {
            const totalAllocated = member.assignments.reduce(
              (sum, a) => sum + Number(a.allocatedHours ?? 0),
              0
            );
            const capacity = Number(member.capacityHoursPerWeek);
            const utilization =
              capacity > 0 ? Math.round((totalAllocated / capacity) * 100) : 0;
            const isOver = totalAllocated > capacity;

            return (
              <Link
                key={member.id}
                href={`/team/${member.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                <div className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#e0eaf5] text-[#1a3a6e] flex items-center justify-center text-sm font-semibold shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[#0d1f3c] truncate">
                      {member.name}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {member.assignments.length} assignment
                      {member.assignments.length !== 1 ? "s" : ""} ·{" "}
                      {totalAllocated.toFixed(1)}h / {capacity}h per week
                    </p>
                  </div>
                  <div className="shrink-0 w-24">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
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
                    <p
                      className={`text-xs font-medium mt-1 ${
                        isOver ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {utilization}% used
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
