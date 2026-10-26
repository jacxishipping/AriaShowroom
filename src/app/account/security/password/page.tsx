"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { AlertTriangle, Lock } from "lucide-react";

function ChangePasswordForm() {
  const { language, theming } = useShowroomStore();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const t = translations[language];
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sessionMustChange = Boolean(
    (session?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword
  );
  const isForcedChange = searchParams.get("forced") === "1" || sessionMustChange;

  const forcedNoticeText =
    language === "fa"
      ? "به‌روزرسانی امنیتی الزامی: لطفاً پیش از ادامه کار در سیستم، رمز عبور موقت خود را تغییر دهید."
      : language === "ps"
      ? "اړین امنیتي تازه کول: مهرباني وکړئ سیستم ته د لاسرسي دمخه خپل لنډمهاله پټنوم بدل کړئ."
      : "Mandatory Security Update: Please change your temporary password before accessing the console.";

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
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-xs"
            style={{ backgroundColor: theming.primaryColor }}
          >
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t.passwordChangeTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t.passwordChangeDescription}
            </p>
            {session?.user?.email && (
              <p className="mt-1 font-mono text-xs text-slate-400">{session.user.email}</p>
            )}
          </div>
        </div>

        {isForcedChange && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-medium text-amber-800 dark:text-amber-200"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{forcedNoticeText}</span>
          </div>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        <div className="space-y-1.5 text-sm font-medium">
          <label htmlFor="current-password" className="block text-slate-700 dark:text-slate-200">
            {t.passwordCurrent}
          </label>
          <input
            id="current-password"
            required
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-slate-900 outline-none focus:border-[var(--primary-color,#1A73E8)] dark:border-slate-700 dark:text-white"
          />
        </div>

        <div className="space-y-1.5 text-sm font-medium">
          <label htmlFor="new-password" className="block text-slate-700 dark:text-slate-200">
            {t.passwordNew}
          </label>
          <input
            id="new-password"
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-slate-900 outline-none focus:border-[var(--primary-color,#1A73E8)] dark:border-slate-700 dark:text-white"
          />
        </div>

        <div className="space-y-1.5 text-sm font-medium">
          <label htmlFor="confirm-password" className="block text-slate-700 dark:text-slate-200">
            {t.passwordConfirm}
          </label>
          <input
            id="confirm-password"
            required
            minLength={12}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-slate-900 outline-none focus:border-[var(--primary-color,#1A73E8)] dark:border-slate-700 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: theming.primaryColor }}
        >
          {busy ? t.passwordUpdating : t.passwordSubmit}
        </button>
      </form>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg py-16 text-center text-sm text-slate-500">
          Loading security settings...
        </div>
      }
    >
      <ChangePasswordForm />
    </Suspense>
  );
}
