"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#f0f5fb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#2453a0] flex items-center justify-center text-white text-sm font-bold tracking-wide shadow">
            JE
          </div>
          <div>
            <p className="text-lg font-semibold text-[#0d1f3c] leading-tight">Jastram</p>
            <p className="text-xs text-gray-500 leading-tight">Engineering Ltd.</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md px-8 py-8">
          <h1 className="text-xl font-bold text-[#0d1f3c] mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Project Management Tool</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
                autoComplete="email"
                placeholder="you@jastram.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-sm mt-4">
              <a href="/auth/reset-password" className="text-[#2453a0] hover:underline">
                Forgot password?
              </a>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Contact your administrator to create your account.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
