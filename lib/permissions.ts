/**
 * Pure role-based permission helpers — no DB calls.
 * Derived from the permissions matrix in plan Section 9.3.
 *
 * Usage:
 *   import { can } from "@/lib/permissions"
 *   if (!can.createProject(user.role)) return forbidden()
 */

import { atLeast } from "@/lib/auth";
import type { UserRole } from "@/app/generated/prisma";

export const can = {
  // ── Projects ────────────────────────────────────────────────────────────────
  viewProjects:  (_role: UserRole) => true,
  createProject: (role: UserRole)  => atLeast(role, "EDITOR"),
  editProject:   (role: UserRole)  => atLeast(role, "EDITOR"),
  deleteProject: (role: UserRole)  => atLeast(role, "ADMIN"),

  // ── Sales Orders ────────────────────────────────────────────────────────────
  viewSalesOrders:   (_role: UserRole) => true,
  createSalesOrder:  (role: UserRole)  => atLeast(role, "EDITOR"),
  editSalesOrder:    (role: UserRole)  => atLeast(role, "EDITOR"),
  deleteSalesOrder:  (role: UserRole)  => atLeast(role, "ADMIN"),

  // ── Deliverables & Milestones ───────────────────────────────────────────────
  viewDeliverables:  (_role: UserRole) => true,
  editDeliverable:   (role: UserRole)  => atLeast(role, "EDITOR"),
  editMilestone:     (role: UserRole)  => atLeast(role, "EDITOR"),

  // ── Tasks ───────────────────────────────────────────────────────────────────
  viewTasks:   (_role: UserRole) => true,
  createTask:  (role: UserRole)  => atLeast(role, "EDITOR"),
  editTask:    (role: UserRole)  => atLeast(role, "EDITOR"),
  deleteTask:  (role: UserRole)  => atLeast(role, "ADMIN"),

  // ── Issues (project issue log) ──────────────────────────────────────────────
  viewIssues:   (_role: UserRole) => true,
  createIssue:  (role: UserRole)  => atLeast(role, "EDITOR"),
  editIssue:    (role: UserRole)  => atLeast(role, "EDITOR"),
  deleteIssue:  (role: UserRole)  => atLeast(role, "ADMIN"),

  // ── Team ────────────────────────────────────────────────────────────────────
  viewTeam:           (_role: UserRole) => true,
  createTeamMember:   (role: UserRole)  => atLeast(role, "EDITOR"),
  editTeamMember:     (role: UserRole)  => atLeast(role, "EDITOR"),
  deleteTeamMember:   (role: UserRole)  => atLeast(role, "ADMIN"),
  manageAssignments:  (role: UserRole)  => atLeast(role, "EDITOR"),

  // ── Settings ────────────────────────────────────────────────────────────────
  viewSettings: (role: UserRole) => atLeast(role, "ADMIN"),
  editSettings: (role: UserRole) => atLeast(role, "ADMIN"),
};
