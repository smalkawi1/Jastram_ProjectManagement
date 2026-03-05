"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountClient() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({ type: "success", text: "Password updated." });
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Change password</h2>
      <form onSubmit={handleChangePassword} className="space-y-3">
        {message && (
          <div
            className={`text-sm rounded-lg px-3 py-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        Forgot your password?{" "}
        <a href="/auth/reset-password" className="text-[#2453a0] hover:underline">
          Request a reset link
        </a>
      </p>
    </div>
  );
}
