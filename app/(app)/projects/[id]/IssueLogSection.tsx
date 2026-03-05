"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ExclamationTriangleIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { getDateStatus, STATUS_CLASSES, statusLabel } from "@/lib/date-status";

type IssueStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";

type IssueAssignee = {
  id: string;
  name: string;
  email: string;
};

type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: IssueStatus;
  dueDate: string | Date | null;
  assigneeId: string | null;
  assignee?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

const STATUS_LABEL: Record<IssueStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
};

export default function IssueLogSection({
  projectId,
  initialIssues = [],
  assignees,
  canEdit = true,
}: {
  projectId: string;
  initialIssues?: Issue[];
  assignees: IssueAssignee[];
  canEdit?: boolean;
}) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues || []);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | "new" | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("OPEN");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | "">("");

  // Load latest issues from API when project loads
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/projects/${projectId}/issues`);
        if (!res.ok) return;
        const data: Issue[] = await res.json();
        if (!cancelled) {
          setIssues(data);
        }
      } catch {
        // ignore for now; UI will just show whatever is in state
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("OPEN");
    setDueDate("");
    setAssigneeId("");
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    resetForm();
  }

  function startEdit(issue: Issue) {
    setEditingId(issue.id);
    setAdding(false);
    setTitle(issue.title);
    setDescription(issue.description ?? "");
    setStatus(issue.status);
    setDueDate(
      issue.dueDate ? format(new Date(issue.dueDate), "yyyy-MM-dd") : ""
    );
    setAssigneeId(issue.assigneeId ?? "");
  }

  async function handleSaveNew() {
    if (!title.trim()) return;

    setSavingId("new");
    try {
      const res = await fetch(`/api/projects/${projectId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      });
      if (res.ok) {
        const created: Issue = await res.json();
        setIssues((prev) => [created, ...prev]);
        setAdding(false);
        resetForm();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleSaveEdit(id: string) {
    if (!title.trim()) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          status,
          dueDate: dueDate || null,
          assigneeId: assigneeId || null,
        }),
      });
      if (res.ok) {
        const updated: Issue = await res.json();
        setIssues((prev) =>
          prev.map((iss) => (iss.id === id ? updated : iss))
        );
        setEditingId(null);
        resetForm();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this issue?")) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/issues/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIssues((prev) => prev.filter((iss) => iss.id !== id));
      }
    } finally {
      setSavingId(null);
    }
  }

  const issuesWithStatus = useMemo(
    () =>
      issues.map((issue) => {
        const date =
          issue.dueDate != null ? new Date(issue.dueDate) : (null as Date | null);
        const ds = getDateStatus(date, issue.status === "CLOSED");
        const sc = STATUS_CLASSES[ds];
        return { issue, date, ds, sc };
      }),
    [issues]
  );

  function assigneeLabel(issue: Issue) {
    if (issue.assignee) {
      return issue.assignee.name || issue.assignee.email;
    }
    const opt = assignees.find((a) => a.id === issue.assigneeId);
    if (opt) return opt.name;
    return "Unassigned";
  }

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[#0d1f3c]">Issue Log</h2>
          <p className="text-xs text-gray-400">
            Track project issues, owners, and deadlines.
          </p>
        </div>
        {canEdit && (
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 bg-[#2453a0] hover:bg-[#1e4080] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            New issue
          </button>
        )}
      </div>

      <div className="px-5 py-3 space-y-3">
        {!issues.length && !adding && (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            No issues logged for this project.
          </p>
        )}

        {adding && canEdit && (
          <IssueFormRow
            mode="create"
            title={title}
            description={description}
            status={status}
            dueDate={dueDate}
            assigneeId={assigneeId}
            assignees={assignees}
            saving={savingId === "new"}
            onChange={{
              title: setTitle,
              description: setDescription,
              status: (s) => setStatus(s),
              dueDate: setDueDate,
              assigneeId: setAssigneeId,
            }}
            onCancel={() => {
              setAdding(false);
              resetForm();
            }}
            onSave={handleSaveNew}
          />
        )}

        {issuesWithStatus.map(({ issue, date, ds, sc }) => {
          const isEditing = editingId === issue.id;
          return (
            <div
              key={issue.id}
              className={`border border-gray-100 rounded-lg bg-white ${sc.card}`}
            >
              {isEditing && canEdit ? (
                <IssueFormRow
                  mode="edit"
                  title={title}
                  description={description}
                  status={status}
                  dueDate={dueDate}
                  assigneeId={assigneeId}
                  assignees={assignees}
                  saving={savingId === issue.id}
                  onChange={{
                    title: setTitle,
                    description: setDescription,
                    status: (s) => setStatus(s),
                    dueDate: setDueDate,
                    assigneeId: setAssigneeId,
                  }}
                  onCancel={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                  onSave={() => handleSaveEdit(issue.id)}
                />
              ) : (
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-[#0d1f3c] truncate">
                        {issue.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {STATUS_LABEL[issue.status] ?? issue.status}
                      </span>
                    </div>
                    {issue.description && (
                      <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
                        {issue.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-600">
                          Owner:
                        </span>{" "}
                        {assigneeLabel(issue)}
                      </span>
                      <span>
                        <span className="font-semibold text-gray-600">
                          Due:
                        </span>{" "}
                        {date ? (
                          <>
                            <span className={sc.text}>
                              {format(date, "MMM d, yyyy")}
                            </span>
                            <span className="ml-1 text-[10px] text-gray-400">
                              {statusLabel(ds, date)}
                            </span>
                          </>
                        ) : (
                          "No date"
                        )}
                      </span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex flex-col items-end gap-1">
                      <button
                        onClick={() => startEdit(issue)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#2453a0]"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id)}
                        disabled={savingId === issue.id}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 disabled:opacity-60"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function IssueFormRow({
  mode,
  title,
  description,
  status,
  dueDate,
  assigneeId,
  assignees,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  mode: "create" | "edit";
  title: string;
  description: string;
  status: IssueStatus;
  dueDate: string;
  assigneeId: string | "";
  assignees: IssueAssignee[];
  saving: boolean;
  onChange: {
    title: (v: string) => void;
    description: (v: string) => void;
    status: (v: IssueStatus) => void;
    dueDate: (v: string) => void;
    assigneeId: (v: string | "") => void;
  };
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="px-4 py-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange.title(e.target.value)}
            placeholder="Brief issue summary"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => onChange.status(e.target.value as IssueStatus)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onChange.dueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => onChange.description(e.target.value)}
            rows={2}
            placeholder="Describe the issue, impact, and any context…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Assigned to
          </label>
          <select
            value={assigneeId}
            onChange={(e) => onChange.assigneeId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
          >
            <option value="">Unassigned</option>
            {assignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          <XMarkIcon className="w-3.5 h-3.5" />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 bg-[#2453a0] text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
        >
          <CheckIcon className="w-3.5 h-3.5" />
          {saving ? "Saving…" : mode === "create" ? "Add issue" : "Save"}
        </button>
      </div>
    </div>
  );
}

