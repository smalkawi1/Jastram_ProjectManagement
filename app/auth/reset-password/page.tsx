"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"loading" | "request" | "set" | "sent">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // Listen for PASSWORD_RECOVERY event fired when the email-link hash token is exchanged.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("set");
        if (typeof window !== "undefined" && window.location.hash) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
    });

    // Also check for an existing active session (e.g. navigating directly while logged in).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setMode("set");
      } else {
        setMode("request");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : "";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setMode("sent");
    setLoading(false);
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  if (mode === "loading") {
    return (
      <div className="min-h-screen bg-[#f0f5fb] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md px-8 py-8 max-w-sm w-full text-center text-gray-500">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f5fb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#2453a0] flex items-center justify-center text-white text-sm font-bold tracking-wide shadow">
            JE
          </div>
          <div>
            <p className="text-lg font-semibold text-[#0d1f3c] leading-tight">Jastram</p>
            <p className="text-xs text-gray-500 leading-tight">Engineering Ltd.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md px-8 py-8">
          {mode === "sent" && (
            <>
              <h1 className="text-xl font-bold text-[#0d1f3c] mb-1">Check your email</h1>
              <p className="text-sm text-gray-500 mb-6">
                We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
              </p>
              <a
                href="/login"
                className="block w-full text-center bg-[#2453a0] hover:bg-[#1e4080] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Back to sign in
              </a>
            </>
          )}

          {mode === "request" && (
            <>
              <h1 className="text-xl font-bold text-[#0d1f3c] mb-1">Reset password</h1>
              <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link.</p>
              <form onSubmit={handleRequestReset} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          {mode === "set" && (
            <>
              <h1 className="text-xl font-bold text-[#0d1f3c] mb-1">Set new password</h1>
              <p className="text-sm text-gray-500 mb-6">Choose a new password for your account.</p>
              <form onSubmit={handleSetPassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2453a0] focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2453a0] hover:bg-[#1e4080] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mt-2"
                >
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <a href="/login" className="text-[#2453a0] hover:underline">Back to sign in</a>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
