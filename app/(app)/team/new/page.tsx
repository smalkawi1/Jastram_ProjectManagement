"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [capacityHoursPerWeek, setCapacityHoursPerWeek] = useState("40");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          capacityHoursPerWeek: capacityHoursPerWeek ? Number(capacityHoursPerWeek) : 40,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create team member");
      }
      const member = await res.json();
      router.push(`/team/${member.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/team" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0d1f3c]">Add Team Member</h1>
          <p className="text-sm text-gray-500">Name and weekly capacity (hours) for resource planning.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Jane Smith"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity (hours per week)
          </label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={capacityHoursPerWeek}
            onChange={(e) => setCapacityHoursPerWeek(e.target.value)}
            placeholder="40"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Default 40. Used to compare with allocated hours.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Link
            href="/team"
            className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Adding…" : "Add Member"}
          </button>
        </div>
      </form>
    </div>
  );
}
