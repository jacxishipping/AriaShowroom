"use client";

import React, { Suspense } from "react";
import { VerifyContent } from "@/components/VerifyContent";

export const dynamic = "force-dynamic";

export default function PublicVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm">
          Loading Official Chamber Verification Registry...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
