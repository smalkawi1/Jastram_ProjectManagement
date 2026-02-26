"use client";

import { useState } from "react";
import { format } from "date-fns";
import { getDateStatus, STATUS_CLASSES, statusLabel } from "@/lib/date-status";
import type { MilestoneTemplate } from "@/lib/milestone-templates";
import type { DateStatus } from "@/lib/date-status";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

type Milestone = {
  id: string;
  type: string;
  dueDate: Date | null;
  status: string;
  notes: string | null;
};

const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"];
const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

const TYPE_COLORS: Record<string, string> = {
  KICK_OFF: "bg-[#1a3a6e] text-white",
  PDR:      "bg-[#2453a0] text-white",
  FDR:      "bg-[#3b6bbf] text-white",
};

export default function MilestoneRow({
  milestone,
  template,
  status,
}: {
  milestone: Milestone;
  template: MilestoneTemplate;
  status: DateStatus;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dueDate, setDueDate] = useState(
    milestone.dueDate ? format(new Date(milestone.dueDate), "yyyy-MM-dd") : ""
  );
  const [milStatus, setMilStatus] = useState(milestone.status);
  const [notes, setNotes] = useState(milestone.notes ?? "");
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentDueDate, setCurrentDueDate] = useState(milestone.dueDate);

  const sc = STATUS_CLASSES[currentStatus];

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: dueDate || null, status: milStatus, notes: notes || null }),
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
        {/* Type badge */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${TYPE_COLORS[milestone.type]}`}>
          {template.shortLabel}
        </span>

        {/* Chevron */}
        <span className="text-gray-300 shrink-0">
          {open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </span>

        {/* Label */}
        <span className="flex-1 text-sm font-medium text-gray-800 truncate">{template.label}</span>

        {/* Status pill */}
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${sc.badge}`}>
          {STATUS_LABEL[milStatus] ?? milStatus}
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
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(true); setOpen(true); }}
          className="shrink-0 p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#2453a0] transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded */}
      {open && (
        <div className="px-5 pb-4 pt-0 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500 mt-3 mb-2">{template.purpose}</p>
          <p className="text-xs text-[#6b8cba] italic mb-3">Timing: {template.timing}</p>

          {/* Participants */}
          {template.participants && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
                <UserGroupIcon className="w-3.5 h-3.5" /> Participants
              </p>
              <div className="flex flex-wrap gap-1.5">
                {template.participants.map((p) => (
                  <span key={p} className="text-xs bg-[#e0eaf5] text-[#1a3a6e] px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Agenda / Requirements */}
          {(template.agenda || template.requirements) && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-600 mb-1">
                {template.agenda ? "Agenda" : "Requirements"}
              </p>
              <ul className="space-y-0.5">
                {(template.agenda ?? template.requirements ?? []).map((item) => (
                  <li key={item} className="text-xs text-gray-500 flex gap-1.5">
                    <span className="text-[#94afd4] mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Outputs */}
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-600 mb-1">Outputs</p>
            <ul className="space-y-0.5">
              {template.outputs.map((item) => (
                <li key={item} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Risk note */}
          {template.riskNote && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
              ⚠ {template.riskNote}
            </div>
          )}

          {editing ? (
            <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Date</label>
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
                    value={milStatus}
                    onChange={(e) => setMilStatus(e.target.value)}
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
            notes && <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-3 py-2 mt-2">{notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
