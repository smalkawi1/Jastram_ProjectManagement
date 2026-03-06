/**
 * Shared project-status display maps used across project list, detail, and edit pages.
 */
export const PROJECT_STATUS_PILL: Record<string, string> = {
  NOT_STARTED: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD:     "bg-amber-100 text-amber-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-600",
};

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  ON_HOLD:     "On Hold",
  COMPLETED:   "Completed",
  CANCELLED:   "Cancelled",
};
