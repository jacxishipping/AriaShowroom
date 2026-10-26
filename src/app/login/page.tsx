"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import { MuiTextField } from "@/components/mui";
import {
  Car,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Globe,
  Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const passwordUpdated = searchParams.get("passwordUpdated") === "1";

  const {
    language,
    setLanguage,
    setCurrentRole,
    addToast,
    fetchDatabaseRecords,
    branding,
    theming,
  } = useShowroomStore();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dealershipTitle =
    language === "ps"
      ? branding?.dealershipNamePs || branding?.dealershipName || t.brandName
      : language === "fa"
      ? branding?.dealershipNameFa || branding?.dealershipName || t.brandName
      : branding?.dealershipName || t.brandName;

  const emailPlaceholder = branding?.email || "staff@ariamotors.af";
  const licenseCode = branding?.licenseNumber || "AF-HRT-88219";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setErrorMessage("Invalid email or password. Please verify your credentials.");
        setLoading(false);
      } else {
        const sessionResponse = await fetch("/api/auth/session");
        const session = await sessionResponse.json();
        const roleMap: Record<string, RoleType> = {
          ADMIN: "SuperAdmin",
          SALES: "SalesAgent",
          ACCOUNTANT: "Accountant",
        };
        const sessionRole = roleMap[session?.user?.role];
        if (sessionRole) setCurrentRole(sessionRole);
        await fetchDatabaseRecords();

        addToast(
          language === "ps"
            ? "تاسو په بریالیتوب سره سیستم ته ننوتئ"
            : language === "fa"
            ? "با موفقیت وارد سیستم شدید"
            : "Successfully signed into Dealership ERP",
          "success"
        );

        router.push(
          session?.user?.mustChangePassword
            ? "/account/security/password?forced=1"
            : callbackUrl
        );
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred during login"
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] dark:bg-[#0F141C] text-[#0F172A] dark:text-[#F1F5F9] relative">
      {/* Language Quick Selector in Header */}
      <div className="absolute top-6 end-6 flex items-center divide-x divide-[#E2E8F0] dark:divide-[#262F40] rtl:divide-x-reverse bg-white dark:bg-[#161B26] border border-[#E2E8F0] dark:border-[#262F40] rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 overflow-hidden shadow-2xs">
        <span className="px-2.5 py-1.5 flex items-center gap-1.5 text-slate-400">
          <Globe className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
          <span>LOCALE</span>
        </span>
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "en"
              ? "bg-[#1A73E8] text-white font-bold"
              : "hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("fa")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "fa"
              ? "bg-[#1A73E8] text-white font-bold"
              : "hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          دری
        </button>
        <button
          type="button"
          onClick={() => setLanguage("ps")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "ps"
              ? "bg-[#1A73E8] text-white font-bold"
              : "hover:text-[#0F172A] dark:hover:text-white"
          }`}
        >
          پښتو
        </button>
      </div>

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Dealership Branding Header */}
        <div className="text-center space-y-2.5">
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-xl text-white shadow-sm"
            style={{ backgroundColor: theming?.primaryColor || "#1A73E8" }}
          >
            <Car className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#1A73E8] dark:text-[#8AB4F8] mb-1">
              ENTERPRISE AUTOMOTIVE &amp; SARRAFI CONSOLE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
              {dealershipTitle}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-mono">
              <Building2 className="h-3.5 w-3.5 text-[#1A73E8] dark:text-[#8AB4F8]" />
              {language === "ps"
                ? "د اسلام قلعه او هرات ګمرک ترانزیتي مدیریت او پلور ERP"
                : language === "fa"
                ? "سیستم مدیریت ترانزیت، گمرک و فروشگاه موتر"
                : branding?.dealershipTagline ||
                  "Direct Transit, Customs & Dealership ERP"}
            </p>
          </div>
        </div>

        {/* Enterprise Console Login Card */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#262F40] bg-white dark:bg-[#161B26] shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-[#121722] border-b border-[#E2E8F0] dark:border-[#262F40] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1A73E8] dark:text-[#8AB4F8]" />
                {language === "ps"
                  ? "امن ننوتل او تصدیق"
                  : language === "fa"
                  ? "ورود به پنل کاربری"
                  : "Authorized Desk Sign-In"}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {language === "ps"
                  ? "د خپل رسمي کارکوونکي حساب معلومات دننه کړئ"
                  : language === "fa"
                  ? "با حساب کاربری رسمی کارمندان وارد شوید"
                  : "Sign in with your authorized staff credentials"}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
              TLS 1.3
            </span>
          </div>

          <div className="p-6 space-y-5">
            {passwordUpdated && (
              <div
                role="status"
                className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "ps"
                    ? "ستاسو پټ نوم تازه شو. مهرباني وکړئ له نوي پټ نوم سره ننوځئ."
                    : language === "fa"
                    ? "رمز عبور با موفقیت تغییر یافت. لطفاً با رمز عبور جدید وارد شوید."
                    : "Your password was updated successfully. Please sign in with your new password."}
                </span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
                >
                  {language === "ps"
                    ? "برېښنالیک پته"
                    : language === "fa"
                    ? "آدرس ایمیل"
                    : "Email Address"}
                </label>
                <MuiTextField
                  id="login-email"
                  fullWidth
                  type="email"
                  size="small"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    {language === "ps"
                      ? "پټ نوم (رمز)"
                      : language === "fa"
                      ? "رمز عبور"
                      : "Password"}
                  </label>
                </div>
                <MuiTextField
                  id="login-password"
                  fullWidth
                  type="password"
                  size="small"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: theming?.primaryColor || "#1A73E8" }}
                className="w-full h-10 rounded-lg hover:brightness-95 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>
                      {language === "ps"
                        ? "د تایید په حال کې..."
                        : language === "fa"
                        ? "در حال ورود..."
                        : "Authenticating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {language === "ps"
                        ? "سیستم ته ننوتل"
                        : language === "fa"
                        ? "ورود به سیستم"
                        : "Authenticate & Open Console"}
                    </span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Security & Official Chamber Footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-[#1A73E8] dark:text-[#8AB4F8]" />
            256-BIT ENCRYPTED SESSION • REG #{licenseCode}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F141C] text-slate-600 dark:text-slate-300 font-mono text-sm">
          Loading Staff Sign-In Portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
