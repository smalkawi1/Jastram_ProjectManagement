import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { getDateStatus, STATUS_CLASSES } from "@/lib/date-status";
import { getDeliverableTemplate } from "@/lib/deliverable-templates";
import { getMilestoneTemplate } from "@/lib/milestone-templates";
import { ChevronLeftIcon, ChevronRightIcon, FolderOpenIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarEvent = {
  id: string;
  type: "milestone" | "deliverable";
  label: string;
  dueDate: Date;
  projectId: string;
  projectNumber: string;
  status: "overdue" | "approaching" | "ok" | "done" | "none";
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const monthParam = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
  const month = Math.max(1, Math.min(12, monthParam));
  const viewDate = new Date(year, month - 1, 1);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  // Show full weeks: start from Sunday of the week containing month start
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay()));
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const milestones = await prisma.milestone.findMany({
    where: { dueDate: { gte: calendarStart, lte: calendarEnd } },
    include: { project: { select: { id: true, projectNumber: true } } },
  });
  const deliverables = await prisma.projectDeliverable.findMany({
    where: { dueDate: { gte: calendarStart, lte: calendarEnd } },
    include: { project: { select: { id: true, projectNumber: true } } },
  });

  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const m of milestones) {
    if (!m.dueDate) continue;
    const d = new Date(m.dueDate);
    const key = format(d, "yyyy-MM-dd");
    const status = getDateStatus(d, m.status === "COMPLETED");
    const template = getMilestoneTemplate(m.type);
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push({
      id: m.id,
      type: "milestone",
      label: template.shortLabel,
      dueDate: d,
      projectId: m.project.id,
      projectNumber: m.project.projectNumber,
      status,
    });
  }
  for (const d of deliverables) {
    if (!d.dueDate) continue;
    const date = new Date(d.dueDate);
    const key = format(date, "yyyy-MM-dd");
    const status = getDateStatus(date, d.status === "COMPLETED");
    const template = getDeliverableTemplate(d.type);
    if (!eventsByDay.has(key)) eventsByDay.set(key, []);
    eventsByDay.get(key)!.push({
      id: d.id,
      type: "deliverable",
      label: template.shortLabel,
      dueDate: date,
      projectId: d.project.id,
      projectNumber: d.project.projectNumber,
      status,
    });
  }
  for (const [, list] of eventsByDay) {
    list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  const prevMonth = subMonths(viewDate, 1);
  const nextMonth = addMonths(viewDate, 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Milestones and deliverables by due date
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/calendar?month=${prevMonth.getMonth() + 1}&year=${prevMonth.getFullYear()}`}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <span className="text-base font-semibold text-[#0d1f3c] min-w-[160px] text-center">
            {format(viewDate, "MMMM yyyy")}
          </span>
          <Link
            href={`/calendar?month=${nextMonth.getMonth() + 1}&year=${nextMonth.getFullYear()}`}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const events = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, viewDate);
            const today = isToday(day);
            return (
              <div
                key={key}
                className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${
                  inMonth ? "bg-white" : "bg-gray-50/80"
                } ${today ? "ring-1 ring-inset ring-[#2453a0]" : ""}`}
              >
                <p
                  className={`text-sm font-medium mb-1 ${
                    inMonth ? "text-gray-800" : "text-gray-400"
                  } ${today ? "text-[#2453a0]" : ""}`}
                >
                  {format(day, "d")}
                </p>
                <div className="space-y-1">
                  {events.map((ev) => {
                    const sc = STATUS_CLASSES[ev.status];
                    return (
                      <Link
                        key={`${ev.type}-${ev.id}`}
                        href={`/projects/${ev.projectId}`}
                        className={`block text-xs px-2 py-1 rounded truncate border ${sc.badge} hover:opacity-90 transition-opacity`}
                        title={`${ev.label} · ${ev.projectNumber}`}
                      >
                        <span className="font-medium">{ev.label}</span>
                        <span className="text-[10px] opacity-80 ml-1">
                          {ev.projectNumber}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <span className="text-gray-500 font-medium">Status:</span>
        <span className="px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200">
          Overdue
        </span>
        <span className="px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
          Due soon
        </span>
        <span className="px-2 py-0.5 rounded border bg-green-50 text-green-700 border-green-200">
          On track
        </span>
        <span className="px-2 py-0.5 rounded border bg-gray-100 text-gray-500 border-gray-200">
          Completed
        </span>
      </div>

      {milestones.length === 0 && deliverables.filter((d) => d.dueDate).length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-100">
          <FolderOpenIcon className="w-12 h-12 text-[#bfd0e8] mb-3" />
          <p className="text-sm text-gray-500">
            No milestones or deliverables due in {format(viewDate, "MMMM yyyy")}.
          </p>
          <Link href="/projects" className="mt-2 text-sm text-[#2453a0] hover:underline">
            View projects →
          </Link>
        </div>
      )}
    </div>
  );
}
