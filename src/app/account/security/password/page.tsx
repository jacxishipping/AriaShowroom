"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const { language } = useShowroomStore();
  const { data: session } = useSession();
  const t = translations[language];
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmation) {
      setError(t.passwordMismatch);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || t.passwordChangeError);
      }
      await signOut({ callbackUrl: "/login?passwordUpdated=1" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.passwordChangeError);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-10">
      <form
        onSubmit={submit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-[#262F40] dark:bg-[#161B26]"
      >
        <div className="flex items-center gap-3">
          <Lock className="h-6 w-6 text-[#1A73E8]" />
          <div>
            <h1 className="text-xl font-bold">{t.passwordChangeTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{t.passwordChangeDescription}</p>
            {session?.user?.email && (
              <p className="mt-1 text-xs text-slate-400">{session.user.email}</p>
            )}
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t.passwordCurrent}</span>
          <input
            required
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t.passwordNew}</span>
          <input
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          />
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          <span>{t.passwordConfirm}</span>
          <input
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[#1A73E8] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? t.passwordUpdating : t.passwordSubmit}
        </button>
      </form>
    </div>
  );
}
