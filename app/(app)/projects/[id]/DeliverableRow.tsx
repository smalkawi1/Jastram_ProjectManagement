"use client";

import { useState } from "react";
import { format } from "date-fns";
import { getDateStatus, STATUS_CLASSES, statusLabel } from "@/lib/date-status";
import type { DeliverableTemplate } from "@/lib/deliverable-templates";
import type { DateStatus } from "@/lib/date-status";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type Deliverable = {
  id: string;
  type: string;
  dueDate: Date | null;
  status: string;
  notes: string | null;
};

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "ON_HOLD"];
const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not Started", IN_PROGRESS: "In Progress",
  SUBMITTED: "Submitted", COMPLETED: "Completed", ON_HOLD: "On Hold",
};

export default function DeliverableRow({
  deliverable,
  template,
  status,
  stepNumber,
  canEdit = true,
}: {
  deliverable: Deliverable;
  template: DeliverableTemplate;
  status: DateStatus;
  stepNumber: number;
  canEdit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dueDate, setDueDate] = useState(
    deliverable.dueDate ? format(new Date(deliverable.dueDate), "yyyy-MM-dd") : ""
  );
  const [delStatus, setDelStatus] = useState(deliverable.status);
  const [notes, setNotes] = useState(deliverable.notes ?? "");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDueDate, setCurrentDueDate] = useState(deliverable.dueDate);

  const sc = STATUS_CLASSES[currentStatus];

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/deliverables/${deliverable.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueDate: dueDate || null,
          status:  delStatus,
          notes:   notes || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentDueDate(updated.dueDate ? new Date(updated.dueDate) : null);
        setCurrentStatus(getDateStatus(updated.dueDate ? new Date(updated.dueDate) : null, updated.status === "COMPLETED"));
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`${sc.card} transition-colors`}>
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none hover:bg-gray-50"
        onClick={() => !editing && setOpen((o) => !o)}
      >
        {/* Step number */}
        <span className="w-6 h-6 rounded-full bg-[#e0eaf5] text-[#1a3a6e] text-xs font-bold flex items-center justify-center shrink-0">
          {stepNumber}
        </span>

        {/* Chevron */}
        <span className="text-gray-300 shrink-0">
          {open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </span>

        {/* Label */}
        <span className="flex-1 text-sm font-medium text-gray-800 truncate">{template.label}</span>

        {/* Status pill */}
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${sc.badge}`}>
          {STATUS_LABEL[delStatus] ?? delStatus}
        </span>

        {/* Due date */}
        <div className="shrink-0 text-right min-w-[90px]">
          {currentDueDate ? (
            <>
              <p className={`text-xs font-medium ${sc.text}`}>
                {format(new Date(currentDueDate), "MMM d, yyyy")}
              </p>
              <p className="text-[10px] text-gray-400">
                {statusLabel(currentStatus, currentDueDate ? new Date(currentDueDate) : null)}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400">No date</p>
          )}
        </div>

        {/* Edit button */}
        {canEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); setOpen(true); }}
            className="shrink-0 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#2453a0] transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expanded content */}
      {open && (
        <div className="px-5 pb-4 pt-0 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mt-3 mb-3">{template.description}</p>
          {template.notes && (
            <p className="text-xs text-[#6b8cba] italic mb-3">Note: {template.notes}</p>
          )}

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select
                    value={delStatus}
                    onChange={(e) => setDelStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-[#2453a0] text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  <CheckIcon className="w-3.5 h-3.5" />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1.5 text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            notes && <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-3 py-2">{notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
