"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ProjectDetailActions({
  projectId,
  canEdit,
  canDelete,
}: {
  projectId: string;
  canEdit: boolean;
  canDelete: boolean;
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
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/projects");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {canEdit && (
        <Link
          href={`/projects/${projectId}/edit`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#2453a0] px-3 py-2 rounded-lg hover:bg-[#f0f5fb] transition-colors"
        >
          <PencilSquareIcon className="w-4 h-4" />
          Edit project
        </Link>
      )}
      {canDelete && (
        <>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
              confirmDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "text-red-600 hover:bg-red-50"
            } disabled:opacity-60`}
          >
            <TrashIcon className="w-4 h-4" />
            {confirmDelete ? (deleting ? "Deleting…" : "Confirm delete") : "Delete"}
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
      )}
    </div>
  );
}
