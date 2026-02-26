"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CLASS_SOCIETIES = ["ABS", "BV", "DNV", "LR", "RINA", "ClassNK", "CCS", "RMRS", "Other"];

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    projectNumber:      "",
    clientName:         "",
    shipType:           "",
    classSociety:       "",
    projectManagerName: "",
    plannedDeliveryDate:"",
    description:        "",
    generalNotes:       "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">New Project</h1>
          <p className="text-sm text-gray-500">Filling in this form will create the project and auto-generate 3 milestone meetings and 8 standard deliverables.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Number <span className="text-red-500">*</span>
            </label>
            <input
              name="projectNumber"
              value={form.projectNumber}
              onChange={handleChange}
              required
              placeholder="e.g. 2024-001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              required
              placeholder="e.g. Nordica Shipping"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Ship <span className="text-red-500">*</span>
            </label>
            <input
              name="shipType"
              value={form.shipType}
              onChange={handleChange}
              required
              placeholder="e.g. Offshore Supply Vessel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class Society <span className="text-red-500">*</span>
            </label>
            <select
              name="classSociety"
              value={form.classSociety}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent bg-white"
            >
              <option value="">Select class society…</option>
              {CLASS_SOCIETIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Manager <span className="text-red-500">*</span>
            </label>
            <input
              name="projectManagerName"
              value={form.projectManagerName}
              onChange={handleChange}
              required
              placeholder="e.g. Chris Simon"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned Delivery Date
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            placeholder="Brief project description…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            General Notes <span className="text-gray-400 font-normal">(on hold, blockers, etc.)</span>
          </label>
          <textarea
            name="generalNotes"
            value={form.generalNotes}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Project on hold pending client confirmation of thruster specs…"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            href="/projects"
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
