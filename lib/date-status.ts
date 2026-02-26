import { differenceInCalendarDays, isPast, isToday } from "date-fns";

export type DateStatus = "overdue" | "approaching" | "ok" | "done" | "none";

const APPROACHING_DAYS = 7;

export function getDateStatus(
  dueDate: Date | null | undefined,
  isCompleted: boolean
): DateStatus {
  if (!dueDate) return "none";
  if (isCompleted) return "done";
  if (isToday(dueDate) || isPast(dueDate)) return "overdue";
  const daysLeft = differenceInCalendarDays(dueDate, new Date());
  if (daysLeft <= APPROACHING_DAYS) return "approaching";
  return "ok";
}

export const STATUS_CLASSES: Record<DateStatus, { badge: string; card: string; text: string }> = {
  overdue: {
    badge: "bg-red-100 text-red-700 border border-red-300",
    card:  "border-l-4 border-l-red-500",
    text:  "text-red-600 font-semibold",
  },
  approaching: {
    badge: "bg-amber-100 text-amber-700 border border-amber-300",
    card:  "border-l-4 border-l-amber-400",
    text:  "text-amber-600 font-semibold",
  },
  ok: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    card:  "border-l-4 border-l-green-400",
    text:  "text-green-700",
  },
  done: {
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    card:  "border-l-4 border-l-gray-300",
    text:  "text-gray-400 line-through",
  },
  none: {
    badge: "bg-gray-50 text-gray-400 border border-gray-200",
    card:  "border-l-4 border-l-gray-200",
    text:  "text-gray-400",
  },
};

export function statusLabel(status: DateStatus, dueDate?: Date | null): string {
  if (status === "none") return "No date set";
  if (status === "done") return "Completed";
  if (status === "overdue") return "Overdue";
  if (status === "approaching") {
    if (!dueDate) return "Due soon";
    const days = differenceInCalendarDays(dueDate, new Date());
    return days === 0 ? "Due today" : `Due in ${days}d`;
  }
  if (!dueDate) return "On track";
  const days = differenceInCalendarDays(dueDate, new Date());
  return `Due in ${days}d`;
}
