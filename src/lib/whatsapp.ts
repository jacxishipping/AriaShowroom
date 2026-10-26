/**
 * WhatsApp Notification & Sarrafi Reminders Dispatch Engine
 * Provides pre-formatted trilingual templates (Dari, Pashto, English)
 * dynamically bound to the dealership branding store and generates wa.me deep-links.
 */

import { useShowroomStore, DEFAULT_BRANDING } from "@/store/useShowroomStore";

export interface WhatsAppReminderParams {
  customerName: string;
  phone: string;
  vehicleName: string;
  amountUSD: number;
  exchangeRate: number;
  dueDate?: string;
  installmentNumber?: number;
  invoiceNumber?: string;
  language?: "fa" | "ps" | "en";
}

function getBrandingSnapshot() {
  try {
    return useShowroomStore.getState().branding || DEFAULT_BRANDING;
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function formatWhatsAppPhone(phone?: string): string {
  const fallback = getBrandingSnapshot().whatsapp || "93799102030";
  let cleaned = (phone || "").replace(/[^0-9]/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = "93" + cleaned.slice(1);
  }
  return cleaned || fallback.replace(/[^0-9]/g, "") || "93799102030";
}

export function buildWhatsAppUrl(phone?: string, text?: string): string {
  const cleanPhone = formatWhatsAppPhone(phone);
  return text
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${cleanPhone}`;
}

export function createInstallmentReminderLink({
  customerName,
  phone,
  vehicleName,
  amountUSD,
  exchangeRate,
  dueDate,
  installmentNumber = 1,
  language = "fa",
}: WhatsAppReminderParams): string {
  const branding = getBrandingSnapshot();
  const amountAFN = Math.round(amountUSD * (exchangeRate || 70.5));
  let message = "";

  if (language === "ps") {
    message = `محترم ${customerName} صاحب، سلامونه او نېکې هیلې!
دا د ${branding.dealershipNamePs || branding.dealershipName} لخوا ستاسو د موټر (${vehicleName}) د ${installmentNumber}مې برخې قسط یادونه ده.

💵 د تادیې وړ مبلغ: $${amountUSD.toLocaleString()} ډالره (معادل ${amountAFN.toLocaleString()} افغانۍ)
📅 د سررسید نېټه: ${dueDate || "روان میاشت"}

مهرباني وکړئ د هرات خراسان صرافۍ یا زموږ د نندارتون دفتر (${branding.address}) له لارې خپله تادیه بشپړه کړئ.
له موږ سره د باور له امله مننه!
${branding.dealershipNamePs || branding.dealershipName}`;
  } else if (language === "en") {
    message = `Dear ${customerName},
This is a courteous payment notice from ${branding.dealershipName} regarding Installment #${installmentNumber} for your ${vehicleName}.

💵 Due Amount: $${amountUSD.toLocaleString()} USD (≈ ${amountAFN.toLocaleString()} AFN)
📅 Due Date: ${dueDate || "Current Cycle"}

Please arrange settlement via Khorasan Sarrafi Exchange or visit our showroom at ${branding.address}.
Thank you for your business!
${branding.dealershipName}`;
  } else {
    message = `محترم ${customerName} گرامی، سلام علیکم و وقت شما بخیر!
احتراماً به اطلاع می‌رساند که موعد پرداخت قسط شماره ${installmentNumber} موتر شما (${vehicleName}) فرارسیده است.

💵 مبلغ قابل تادیه: $${amountUSD.toLocaleString()} دالر (معادل ${amountAFN.toLocaleString()} افغانی)
📅 تاریخ سررسید: ${dueDate || "ماه جاری"}

لطفاً جهت تسویه حساب به حساب صرافی خراسان در سرای صرافان هرات و یا دفتر مرکزی (${branding.address}) مراجعه فرمایید.
با تشکر و احترام،
مدیریت مالی ${branding.dealershipNameFa || branding.dealershipName}`;
  }

  return buildWhatsAppUrl(phone, message);
}

export function createInvoiceWhatsAppLink({
  customerName,
  phone,
  invoiceNumber = "",
  vehicleName,
  amountUSD,
  exchangeRate,
  language = "fa",
}: WhatsAppReminderParams): string {
  const branding = getBrandingSnapshot();
  const amountAFN = Math.round(amountUSD * (exchangeRate || 70.5));
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://ariamotors.af";
  const verifyUrl = `${origin}/verify?vin=${encodeURIComponent(invoiceNumber)}`;

  let message = "";
  if (language === "ps") {
    message = `ښاغلی ${customerName}،
د ${branding.dealershipNamePs || branding.dealershipName} لخوا ستاسو رسمي فاکتور #${invoiceNumber} د (${vehicleName}) لپاره صادر شو.
مجموعه: $${amountUSD.toLocaleString()} ډالره (${amountAFN.toLocaleString()} افغانۍ).
د اصالت تایید لپاره لاندې لېنک وګورئ:
${verifyUrl}`;
  } else if (language === "en") {
    message = `Dear ${customerName},
Your official commercial invoice #${invoiceNumber} for (${vehicleName}) has been issued by ${branding.dealershipName}.
Total: $${amountUSD.toLocaleString()} USD (${amountAFN.toLocaleString()} AFN).
Verify certificate authenticity online:
${verifyUrl}`;
  } else {
    message = `محترم ${customerName} گرامی،
فاکتور تجاری و رسمی شما به شماره #${invoiceNumber} برای موتر (${vehicleName}) از سوی ${branding.dealershipNameFa || branding.dealershipName} صادر گردید.
مجموع حساب: $${amountUSD.toLocaleString()} دالر (${amountAFN.toLocaleString()} افغانی).
جهت استعلام و تأیید اصالت سند:
${verifyUrl}`;
  }

  return buildWhatsAppUrl(phone, message);
}
