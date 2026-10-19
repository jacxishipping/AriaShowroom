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

  const { language, setLanguage, setCurrentRole, addToast, fetchDatabaseRecords } = useShowroomStore();
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

        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0A0C10] text-white relative">
      {/* Language Quick Selector in Header */}
      <div className="absolute top-6 right-6 flex items-center divide-x divide-[#242A38] bg-[#11141B] border border-[#242A38] rounded text-[11px] font-mono text-slate-300 overflow-hidden">
        <span className="px-2.5 py-1.5 flex items-center gap-1.5 text-slate-400">
          <Globe className="h-3.5 w-3.5 text-[#C59B27]" />
          <span>LOCALE</span>
        </span>
        <button
          onClick={() => setLanguage("en")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "en" ? "bg-[#C59B27] text-[#0A0C10] font-bold" : "hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("fa")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "fa" ? "bg-[#C59B27] text-[#0A0C10] font-bold" : "hover:text-white"
          }`}
        >
          دری
        </button>
        <button
          onClick={() => setLanguage("ps")}
          className={`px-2.5 py-1.5 transition-colors cursor-pointer ${
            language === "ps" ? "bg-[#C59B27] text-[#0A0C10] font-bold" : "hover:text-white"
          }`}
        >
          پښتو
        </button>
      </div>

      <div className="max-w-md w-full space-y-6 z-10">
        {/* Dealership Branding Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded bg-[#11141B] border border-[#C59B27]/50">
            <Car className="h-6 w-6 text-[#D4AF37]" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-[#D4AF37] mb-1">
              KHORASAN AUTOMOTIVE & SARRAFI TERMINAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t.brandName}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-mono">
              <Building2 className="h-3.5 w-3.5 text-[#C59B27]" />
              {language === "ps"
                ? "د اسلام قلعه او هرات ګمرک ترانزیتي مدیریت او پلور ERP"
                : language === "fa"
                ? "سیستم مدیریت ترانزیت، گمرک و فروشگاه موتر هرات"
                : "Herat & Islam Qala Direct Transit Dealership ERP"}
            </p>
          </div>
        </div>

        {/* Architectural 1px Hairline Login Container */}
        <div className="rounded-md border border-[#242A38] bg-[#11141B] overflow-hidden">
          <div className="px-6 py-4 bg-[#141821] border-b border-[#242A38] flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#D4AF37]" />
                {language === "ps" ? "امن ننوتل او تصدیق" : language === "fa" ? "ورود به پنل کاربری" : "Authorized Desk Sign-In"}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === "ps"
                  ? "خپل رسمي حساب یا لاندې ډیمو کاروونکي وټاکئ"
                  : language === "fa"
                  ? "ایمیل و رمز عبور یا حساب‌های آزمایشی را انتخاب کنید"
                  : "Enter registered credentials or select an institutional role below"}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#C59B27]/15 text-[#D4AF37] border border-[#C59B27]/30">
              TLS 1.3
            </span>
          </div>

          <div className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300">
                    {language === "ps" ? "پټ نوم (رمز)" : language === "fa" ? "رمز عبور" : "Password"}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Passkey: password123</span>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded bg-[#C59B27] hover:bg-[#D4AF37] text-[#0A0C10] font-mono font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{language === "ps" ? "د تایید په حال کې..." : language === "fa" ? "در حال ورود..." : "Authenticating..."}</span>
                  </>
                ) : (
                  <>
                    <span>{language === "ps" ? "سیستم ته ننوتل" : language === "fa" ? "ورود به سیستم" : "Authenticate & Open Terminal"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher in 1px Hairline Matrix */}
            <div className="pt-4 border-t border-[#242A38] space-y-2.5">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 block">
                {language === "ps" ? "یو کلیک آزمایښتي حسابونه" : language === "fa" ? "ورود سریع با حساب‌های نمونه" : "One-Click Desk Role Credentials"}
              </span>

              <div className="grid grid-cols-1 gap-px bg-[#242A38] border border-[#242A38] rounded overflow-hidden">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoSelect(account)}
                    className="flex items-center justify-between p-3 bg-[#141821] hover:bg-[#191F2C] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded bg-[#0A0C10] flex items-center justify-center border border-[#242A38] text-slate-400 group-hover:text-[#D4AF37] group-hover:border-[#C59B27]/50">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                            {account.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono uppercase ${account.badgeColor}`}>
                            {account.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {account.email}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Official Chamber Footer */}
        <div className="text-center space-y-1">
          <p className="text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-[#C59B27]" />
            256-BIT ENCRYPTED SESSION • HERAT CHAMBER OF COMMERCE #AF-HRT-88219
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
