"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function TeamMemberDeleteButton({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/team");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete member");
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete member");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            confirmDelete
              ? "bg-red-600 text-white hover:bg-red-700"
              : "text-red-600 hover:bg-red-50"
          } disabled:opacity-60`}
        >
          <TrashIcon className="w-4 h-4" />
          {confirmDelete ? (deleting ? "Deleting…" : `Delete ${memberName}`) : "Delete"}
        </button>
        {confirmDelete && (
          <button
            type="button"
            onClick={() => { setConfirmDelete(false); setDeleteError(""); }}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancel
          </button>
        )}
      </div>
      {deleteError && (
        <p className="text-xs text-red-600">{deleteError}</p>
      )}
    </div>
  );
}
