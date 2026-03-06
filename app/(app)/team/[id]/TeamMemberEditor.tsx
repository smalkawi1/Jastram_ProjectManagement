"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function TeamMemberEditor({
  memberId,
  initialName,
  initialCapacity,
  canEdit = false,
}: {
  memberId: string;
  initialName: string;
  initialCapacity: string;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [capacity, setCapacity] = useState(initialCapacity);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function save() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          capacityHoursPerWeek: capacity ? Number(capacity) : 40,
        }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save");
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    if (!canEdit) return null;
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2453a0] px-3 py-1.5 rounded-lg hover:bg-[#f0f5fb] transition-colors"
      >
        <PencilSquareIcon className="w-4 h-4" />
        Edit
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border border-gray-300 rounded px-2.5 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
      />
      <input
        type="number"
        min={0}
        step={0.5}
        value={capacity}
        onChange={(e) => setCapacity(e.target.value)}
        placeholder="40"
        className="border border-gray-300 rounded px-2.5 py-1.5 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
      />
      <span className="text-xs text-gray-400">h/week</span>
      <button
        onClick={save}
        disabled={saving || !name.trim()}
        className="p-1.5 rounded text-[#2453a0] hover:bg-[#e0eaf5] disabled:opacity-50"
      >
        <CheckIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setEditing(false);
          setName(initialName);
          setCapacity(initialCapacity);
          setSaveError("");
        }}
        className="p-1.5 rounded text-gray-500 hover:bg-gray-100"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
      {saveError && (
        <p className="text-xs text-red-600 ml-1">{saveError}</p>
      )}
    </div>
  );
}
