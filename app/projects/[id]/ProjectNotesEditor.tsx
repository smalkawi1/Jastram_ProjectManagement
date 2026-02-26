"use client";

import { useState } from "react";
import { PencilSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProjectNotesEditor({
  projectId,
  initialNotes,
}: {
  projectId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generalNotes: draft }),
      });
      setNotes(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!notes && !editing) {
    return (
      <button
        onClick={() => { setEditing(true); setDraft(""); }}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#2453a0] transition-colors px-1"
      >
        <PencilSquareIcon className="w-4 h-4" />
        Add general notes (on hold, blockers, etc.)
      </button>
    );
  }

  if (editing) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-800 mb-2">📌 General Notes</p>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          autoFocus
          placeholder="e.g. Project on hold pending client approval of thruster specs…"
          className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
          >
            <CheckIcon className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => { setEditing(false); setDraft(notes); }}
            className="flex items-center gap-1.5 text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-amber-100"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="flex-1">
        <p className="text-xs font-semibold text-amber-800 mb-1">📌 General Notes</p>
        <p className="text-sm text-amber-900 whitespace-pre-wrap">{notes}</p>
      </div>
      <button
        onClick={() => { setEditing(true); setDraft(notes); }}
        className="shrink-0 p-1.5 rounded hover:bg-amber-100 text-amber-500 hover:text-amber-700 transition-colors"
      >
        <PencilSquareIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
