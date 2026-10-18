"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useShowroomStore, RoleType } from "@/store/useShowroomStore";
import { translations } from "@/lib/translations";
import {
  MuiCard,
  MuiCardContent,
  MuiButton,
  MuiTextField,
  MuiChip,
} from "@/components/mui";
import {
  Car,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  User,
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

  const { language, setLanguage, setCurrentRole, addToast } = useShowroomStore();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick switch demo accounts
  const demoAccounts = [
    {
      title: language === "ps" ? "عمومي مدیر (مالک)" : language === "fa" ? "مدیر ارشد (حاجی)" : "Super Admin",
      role: "SuperAdmin" as RoleType,
      authRole: "ADMIN",
      name: "Haji Ahmad Shah Sadozai",
      email: "admin@sadozaimotors.af",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      description: language === "ps" ? "د ټولو مالي او ګټې ډیټا بشپړ لاسرسی" : language === "fa" ? "دسترسی کامل به سود، قیمت خرید و تنظیمات" : "Full access to P&L, landed costs & settings",
    },
    {
      title: language === "ps" ? "د پلور مشاور" : language === "fa" ? "کارشناس فروش" : "Sales Consultant",
      role: "SalesAgent" as RoleType,
      authRole: "SALES",
      name: "Farhad Timori",
      email: "sales@sadozaimotors.af",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
      description: language === "ps" ? "د نندارتون موجودي، CRM او سندونه" : language === "fa" ? "موجودی موترها، مشتریان و ثبت قرارداد" : "Inventory, CRM leads & deed execution",
    },
    {
      title: language === "ps" ? "سرمحاسب" : language === "fa" ? "مدیر مالی و صرافی" : "Chief Accountant",
      role: "Accountant" as RoleType,
      authRole: "ACCOUNTANT",
      name: "Mirwais Saljuqi",
      email: "finance@sadozaimotors.af",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      description: language === "ps" ? "صرافي حوالې، فاکتورونه او ګمرکي تادیات" : language === "fa" ? "حواله های صرافی، فاکتور و اسناد گمرک" : "Sarrafi Hawala vouchers, bills & Gomrok fees",
    },
  ];

  const handleDemoSelect = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword("password123");
    setErrorMessage(null);
  };

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
        // Sync local store role
        const matched = demoAccounts.find((d) => d.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setCurrentRole(matched.role);
        }

        addToast(
          language === "ps"
            ? "تاسو په بریالیتوب سره سیستم ته ننوتئ"
            : language === "fa"
            ? "با موفقیت وارد سیستم شدید"
            : "Successfully signed into Dealership ERP",
          "success"
        );

        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-[#0B0F19] to-slate-950 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Language Quick Selector in Header */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1.5 text-xs text-slate-300">
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        <button
          onClick={() => setLanguage("en")}
          className={`px-2 py-0.5 rounded-full transition-colors ${language === "en" ? "bg-primary text-white font-bold" : "hover:text-white"}`}
        >
          EN
        </button>
        <span>•</span>
        <button
          onClick={() => setLanguage("fa")}
          className={`px-2 py-0.5 rounded-full transition-colors ${language === "fa" ? "bg-primary text-white font-bold" : "hover:text-white"}`}
        >
          دری
        </button>
        <span>•</span>
        <button
          onClick={() => setLanguage("ps")}
          className={`px-2 py-0.5 rounded-full transition-colors ${language === "ps" ? "bg-primary text-white font-bold" : "hover:text-white"}`}
        >
          پښتو
        </button>
      </div>

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Dealership Branding Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 shadow-xl shadow-blue-900/30 border border-blue-400/30">
            <Car className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.brandName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-400" />
              {language === "ps"
                ? "د اسلام قلعه او هرات ګمرک ترانزیتي مدیریت او پلور ERP"
                : language === "fa"
                ? "سیستم مدیریت ترانزیت، گمرک و فروشگاه موتر هرات"
                : "Herat & Islam Qala Direct Transit Dealership ERP"}
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <MuiCard className="border border-slate-700/70 bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
          <MuiCardContent className="p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-700/80 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                {language === "ps" ? "امن ننوتل او تصدیق" : language === "fa" ? "ورود به پنل کاربری" : "Authorized Staff Sign-In"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === "ps"
                  ? "خپل رسمي حساب یا لاندې ډیمو کاروونکي وټاکئ"
                  : language === "fa"
                  ? "ایمیل و رمز عبور یا حساب‌های آزمایشی را انتخاب کنید"
                  : "Enter your registered credentials or select a demo role below"}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {language === "ps" ? "برېښنالیک پته" : language === "fa" ? "آدرس ایمیل" : "Email Address"}
                </label>
                <MuiTextField
                  fullWidth
                  type="email"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sadozaimotors.af"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    {language === "ps" ? "پټ نوم (رمز)" : language === "fa" ? "رمز عبور" : "Password"}
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Demo: password123</span>
                </div>
                <MuiTextField
                  fullWidth
                  type="password"
                  size="small"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <MuiButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                className="h-11 font-bold text-sm bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-700/30"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    {language === "ps" ? "د تایید په حال کې..." : language === "fa" ? "در حال ورود..." : "Authenticating..."}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {language === "ps" ? "سیستم ته ننوتل" : language === "fa" ? "ورود به سیستم" : "Sign In to Cockpit"}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </MuiButton>
            </form>

            {/* Quick Demo Switcher */}
            <div className="pt-2 border-t border-slate-700/80 space-y-2.5">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block text-center">
                {language === "ps" ? "یو کلیک آزمایښتي حسابونه" : language === "fa" ? "ورود سریع با حساب‌های نمونه" : "One-Click Quick Access (Demo Roles)"}
              </span>

              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoSelect(account)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-700/50 hover:border-blue-500/40 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-300 group-hover:text-blue-400">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                            {account.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${account.badgeColor}`}>
                            {account.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {account.email}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </MuiCardContent>
        </MuiCard>

        {/* Security & Official Chamber Footer */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <Lock className="h-3 w-3 text-emerald-500" />
            256-Bit Encrypted Dealership Session • Herat Chamber of Commerce #AF-HRT-88219
          </p>
          <p className="text-[10px] text-slate-600">
            © 2026 Sadozai Motors Afghanistan. All rights reserved.
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-mono text-sm">
          Loading Staff Sign-In Portal...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
