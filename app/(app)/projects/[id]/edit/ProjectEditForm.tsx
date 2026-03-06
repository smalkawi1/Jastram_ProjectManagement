"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PROJECT_STATUS_LABEL } from "@/lib/constants";

type Initial = {
  projectNumber: string;
  clientName: string;
  shipType: string;
  classSociety: string;
  projectManagerName: string;
  plannedDeliveryDate: string;
  description: string;
  generalNotes: string;
  status: string;
  hullNumbers: string;
  imoNumber: string;
  upperRudderStockDiameterMm: string;
};

export default function ProjectEditForm({
  projectId,
  initial,
  classSocieties,
  statuses,
}: {
  projectId: string;
  initial: Initial;
  classSocieties: string[];
  statuses: readonly string[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const hullList = form.hullNumbers
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plannedDeliveryDate: form.plannedDeliveryDate || null,
          hullNumbers: hullList,
          imoNumber: form.imoNumber || null,
          upperRudderStockDiameterMm: form.upperRudderStockDiameterMm.trim() ? form.upperRudderStockDiameterMm : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update project");
      }
      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Number *</label>
          <input
            name="projectNumber"
            value={form.projectNumber}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
          <input
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type of Ship *</label>
          <input
            name="shipType"
            value={form.shipType}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class Society *</label>
          <select
            name="classSociety"
            value={form.classSociety}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent bg-white"
          >
            <option value="">Select…</option>
            {classSocieties.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
          <input
            name="projectManagerName"
            value={form.projectManagerName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Planned Delivery Date</label>
          <input
            type="date"
            name="plannedDeliveryDate"
            value={form.plannedDeliveryDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hull numbers (optional, comma-separated)</label>
        <input
          name="hullNumbers"
          value={form.hullNumbers}
          onChange={handleChange}
          placeholder="e.g. H001, H002"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IMO# (optional)</label>
          <input
            name="imoNumber"
            value={form.imoNumber}
            onChange={handleChange}
            placeholder="e.g. 9123456"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upper Rudder Stock Diameter (optional, mm)</label>
          <input
            name="upperRudderStockDiameterMm"
            type="number"
            min={0}
            step={0.01}
            value={form.upperRudderStockDiameterMm}
            onChange={handleChange}
            placeholder="e.g. 120"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent bg-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{PROJECT_STATUS_LABEL[s] ?? s}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
        <textarea
          name="generalNotes"
          value={form.generalNotes}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
