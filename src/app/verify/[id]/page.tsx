"use client";

import React from "react";
import { useParams } from "next/navigation";
import PublicVerifyPage from "../page";

export const dynamic = "force-dynamic";

export default function DynamicVerifyPage() {
  return <PublicVerifyPage />;
}
