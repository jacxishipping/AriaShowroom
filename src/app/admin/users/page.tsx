"use client";

import React, { useEffect, useState } from "react";
import { useShowroomStore } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { Copy, KeyRound, Users } from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
}

export default function StaffAccountsPage() {
  const { language, currentRole } = useShowroomStore();
  const t = translations[language];
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [temporaryPasswords, setTemporaryPasswords] = useState<Record<string, string>>({});
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/users")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || t.adminStaffLoadError);
        }
        if (!cancelled) setUsers(result.data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : t.adminStaffLoadError);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [t.adminStaffLoadError]);

  const issueTemporaryPassword = async (user: StaffUser) => {
    if (!window.confirm(t.adminStaffResetConfirm)) return;
    setBusyUserId(user.id);
    setError("");
    setTemporaryPasswords((current) => {
      const next = { ...current };
      delete next[user.id];
      return next;
    });
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || t.adminStaffResetError);
      }
      setTemporaryPasswords((current) => ({
        ...current,
        [user.id]: result.temporaryPassword,
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t.adminStaffResetError);
    } finally {
      setBusyUserId(null);
    }
  };

  const copyPassword = async (userId: string, password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedUserId(userId);
    } catch {
      setError(t.adminStaffCopyError);
    }
  };

  if (currentRole !== "SuperAdmin") {
    return (
      <p role="alert" className="mx-auto max-w-3xl rounded-lg border border-rose-300 p-4 text-rose-700">
        {t.adminStaffAccessDenied}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex items-start gap-3">
        <Users className="mt-1 h-6 w-6 text-[#1A73E8]" />
        <div>
          <h1 className="text-2xl font-bold">{t.adminStaffTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.adminStaffDescription}</p>
        </div>
      </header>
      {error && (
        <p role="alert" className="rounded bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-slate-500">{t.adminStaffLoading}</p>
      ) : (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-[#262F40] dark:bg-[#161B26]">
          {users.map((user) => (
            <section key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <button
                type="button"
                disabled={busyUserId === user.id}
                onClick={() => void issueTemporaryPassword(user)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:border-[#1A73E8] disabled:opacity-60 dark:border-slate-700"
              >
                <KeyRound className="h-4 w-4" />
                {t.adminStaffReset}
              </button>
              {temporaryPasswords[user.id] && (
                <div className="w-full rounded-md bg-amber-500/10 p-3 sm:w-auto">
                  <p className="text-xs font-semibold">{t.adminStaffTemporaryPassword}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="select-all break-all font-mono text-sm">
                      {temporaryPasswords[user.id]}
                    </code>
                    <button
                      type="button"
                      title={t.adminStaffCopy}
                      onClick={() =>
                        void copyPassword(user.id, temporaryPasswords[user.id])
                      }
                      className="shrink-0 rounded p-1 hover:bg-amber-500/20"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedUserId === user.id && (
                    <p className="mt-1 text-xs">{t.adminStaffCopied}</p>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
