"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkRecoverySession() {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session && data.session.user && data.session.user.recovery_sent_at) {
          setIsValidSession(true);
        } else {
          setError("Invalid or expired recovery link. Please request a new password reset.");
        }
      } catch (err) {
        setError("Unable to validate recovery session.");
      } finally {
        setIsChecking(false);
      }
    }

    checkRecoverySession();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!password || !confirmPassword) {
        throw new Error("Both password fields are required.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message || "Unable to update password.");
      }

      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isChecking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Reset password</h1>
          <p className="mt-6 text-sm text-slate-600">Verifying recovery link...</p>
        </div>
      </main>
    );
  }

  if (!isValidSession) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Error</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Invalid link</h1>
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          <button
            onClick={() => router.push("/admin/forgot-password")}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Request new reset link
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Admin</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Reset password</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Enter your new password below.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            New Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="Enter new password"
              required
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="Confirm password"
              required
            />
          </label>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}

          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
