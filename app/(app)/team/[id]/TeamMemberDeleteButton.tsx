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

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/team");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <>
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
          onClick={() => setConfirmDelete(false)}
          className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
        >
          Cancel
        </button>
      )}
    </>
  );
}
