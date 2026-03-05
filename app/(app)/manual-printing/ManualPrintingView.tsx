"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

export type ManualPrintingRow = {
  projectId: string;
  projectNumber: string;
  clientName: string;
  shippingDate: string | null;
  manualDueDate: string | null;
  manualDeliverableId: string | null;
  copiesToPrint: number | null;
  readyForPrinting: boolean;
};

function getMonthParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ManualPrintingView({ canEdit }: { canEdit: boolean }) {
  const [month, setMonth] = useState(() => getMonthParam(new Date()));
  const [rows, setRows] = useState<ManualPrintingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<{
    id: string;
    copiesToPrint: number | null;
    manualDueDate: string | null;
    readyForPrinting: boolean;
  } | null>(null);

  const fetchRows = useCallback(async (monthParam: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/manual-printing?month=${monthParam}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load");
      }
      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows(month);
  }, [month, fetchRows]);

  async function saveManualDeliverable(
    deliverableId: string,
    payload: {
      dueDate?: string | null;
      copiesToPrint?: number | null;
      readyForPrinting?: boolean;
    }
  ) {
    if (!deliverableId) return;
    setSavingId(deliverableId);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setRows((prev) =>
          prev.map((r) =>
            r.manualDeliverableId === deliverableId
              ? {
                  ...r,
                  manualDueDate: updated.dueDate
                    ? new Date(updated.dueDate).toISOString()
                    : null,
                  copiesToPrint: updated.copiesToPrint ?? null,
                  readyForPrinting: updated.readyForPrinting ?? false,
                }
              : r
          )
        );
        setEditRow(null);
      }
    } finally {
      setSavingId(null);
    }
  }

  function copySnapshotForEmail() {
    const title = `Manual printing – ${month}`;
    const lines: string[] = [
      title,
      "Projects shipping this month:",
      "",
      "Project #\tClient\tShipping date\tManual copies\tManual ready date\tReady for printing?",
      "—".repeat(80),
    ];
    for (const r of rows) {
      const ship = r.shippingDate
        ? format(parseISO(r.shippingDate), "MMM d, yyyy")
        : "—";
      const manualDate = r.manualDueDate
        ? format(parseISO(r.manualDueDate), "MMM d, yyyy")
        : "—";
      const copies = r.copiesToPrint ?? "—";
      const ready = r.readyForPrinting ? "Yes" : "No";
      lines.push(
        `${r.projectNumber}\t${r.clientName}\t${ship}\t${copies}\t${manualDate}\t${ready}`
      );
    }
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const monthLabel = month
    ? format(parseISO(`${month}-01`), "MMMM yyyy")
    : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Month</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0]"
          />
        </label>
        <button
          type="button"
          onClick={copySnapshotForEmail}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2453a0] text-white text-sm font-medium hover:bg-[#1a3a6e] transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Copied to clipboard
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy for email
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500">
          No projects shipping in {monthLabel}. Change the month or add projects with a planned delivery date in that month.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Project #</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Shipping date</th>
                  <th className="px-4 py-3">Manual copies</th>
                  <th className="px-4 py-3">Manual ready date</th>
                  <th className="px-4 py-3">Ready for printing?</th>
                  {canEdit && <th className="px-4 py-3 w-10" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => {
                  const isEditing =
                    editRow?.id === r.manualDeliverableId && canEdit;
                  const saving = savingId === r.manualDeliverableId;
                  return (
                    <tr key={r.projectId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono text-[#2453a0]">
                        <Link
                          href={`/projects/${r.projectId}`}
                          className="hover:underline"
                        >
                          {r.projectNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{r.clientName}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.shippingDate
                          ? format(parseISO(r.shippingDate), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={editRow?.copiesToPrint ?? ""}
                            onChange={(e) =>
                              setEditRow((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      copiesToPrint: e.target.value
                                        ? parseInt(e.target.value, 10)
                                        : null,
                                    }
                                  : null
                              )
                            }
                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : (
                          r.copiesToPrint ?? "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            value={
                              editRow?.manualDueDate
                                ? editRow.manualDueDate.slice(0, 10)
                                : ""
                            }
                            onChange={(e) =>
                              setEditRow((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      manualDueDate: e.target.value
                                        ? `${e.target.value}T12:00:00.000Z`
                                        : null,
                                    }
                                  : null
                              )
                            }
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        ) : r.manualDueDate ? (
                          format(parseISO(r.manualDueDate), "MMM d, yyyy")
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editRow?.readyForPrinting ?? false}
                              onChange={(e) =>
                                setEditRow((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        readyForPrinting: e.target.checked,
                                      }
                                    : null
                                )
                              }
                              className="rounded border-gray-300 text-[#2453a0] focus:ring-[#2453a0]"
                            />
                            <span className="text-gray-600">
                              {editRow?.readyForPrinting ? "Yes" : "No"}
                            </span>
                          </label>
                        ) : r.readyForPrinting ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={saving}
                                onClick={() => {
                                  if (!editRow || !r.manualDeliverableId)
                                    return;
                                  saveManualDeliverable(r.manualDeliverableId, {
                                    dueDate: editRow.manualDueDate,
                                    copiesToPrint: editRow.copiesToPrint,
                                    readyForPrinting: editRow.readyForPrinting,
                                  });
                                }}
                                className="text-xs font-medium text-white bg-[#2453a0] px-2 py-1 rounded hover:bg-[#1a3a6e] disabled:opacity-60"
                              >
                                {saving ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditRow(null)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : r.manualDeliverableId ? (
                            <button
                              type="button"
                              onClick={() =>
                                setEditRow({
                                  id: r.manualDeliverableId,
                                  copiesToPrint: r.copiesToPrint,
                                  manualDueDate: r.manualDueDate,
                                  readyForPrinting: r.readyForPrinting,
                                })
                              }
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-[#2453a0]"
                              title="Edit row"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                          ) : null}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
