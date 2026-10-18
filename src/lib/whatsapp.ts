/**
 * WhatsApp Notification & Sarrafi Reminders Dispatch Engine
 * Provides pre-formatted trilingual templates (Dari, Pashto, English)
 * and generates wa.me deep-links for Afghanistan/UAE clients.
 */

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

export function formatWhatsAppPhone(phone: string): string {
  // Cleans Afghan numbers (+93 79 910 2030 -> 93799102030) or UAE (+971 50 ...)
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "93" + cleaned.slice(1);
  }
  return cleaned;
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
  const amountAFN = Math.round(amountUSD * exchangeRate);
  let message = "";

  if (language === "ps") {
    message = `محترم ${customerName} صاحب، سلامونه او نېکې هیلې!
دا د سدوزي موټرو شرکت (هرات) لخوا ستاسو د موټر (${vehicleName}) د ${installmentNumber}مې برخې قسط یادونه ده.

💵 د تادیې وړ مبلغ: $${amountUSD.toLocaleString()} ډالره (معادل ${amountAFN.toLocaleString()} افغانۍ)
📅 د سررسید نېټه: ${dueDate || "روان میاشت"}

مهرباني وکړئ د هرات خراسان صرافۍ یا زموږ د نندارتون دفتر له لارې خپله تادیه بشپړه کړئ.
له موږ سره د باور له امله مننه!
د سدوزي موټرو هرات اداره`;
  } else if (language === "en") {
    message = `Dear ${customerName},
This is a courteous payment notice from Sadozai Motors Herat regarding Installment #${installmentNumber} for your ${vehicleName}.

💵 Due Amount: $${amountUSD.toLocaleString()} USD (≈ ${amountAFN.toLocaleString()} AFN)
📅 Due Date: ${dueDate || "Current Cycle"}

Please arrange settlement via Khorasan Sarrafi Exchange or visit our main showroom lot on Bagh-e-Azadi, Herat.
Thank you for your business!
Sadozai Motors Afghanistan`;
  } else {
    // Default: Dari (Farsi)
    message = `محترم ${customerName} گرامی، سلام علیکم و وقت شما بخیر!
احتراماً به اطلاع می‌رساند که موعد پرداخت قسط شماره ${installmentNumber} موتر شما (${vehicleName}) فرارسیده است.

💵 مبلغ قابل تادیه: $${amountUSD.toLocaleString()} دالر (معادل ${amountAFN.toLocaleString()} افغانی)
📅 تاریخ سررسید: ${dueDate || "ماه جاری"}

لطفاً جهت تسویه حساب به حساب صرافی خراسان در سرای صرافان هرات و یا دفتر مرکزی نندارتون مراجعه فرمایید.
با تشکر و احترام،
مدیریت مالی نندارتون موتر سدوزی هرات`;
  }

  const cleanPhone = formatWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function createInvoiceWhatsAppLink({
  customerName,
  phone,
  invoiceNumber,
  vehicleName,
  amountUSD,
  exchangeRate,
  language = "fa",
}: WhatsAppReminderParams): string {
  const amountAFN = Math.round(amountUSD * exchangeRate);
  let message = "";

  if (language === "ps") {
    message = `ښاغلی ${customerName}،
د سدوزي موټرو هرات لخوا ستاسو رسمي فاکتور #${invoiceNumber} د (${vehicleName}) لپاره صادر شو.
مجموعه: $${amountUSD.toLocaleString()} ډالره (${amountAFN.toLocaleString()} افغانۍ).
د تایید لپاره لاندې لېنک وګورئ:
https://ariashowroom.af/accounting/invoices/${invoiceNumber}`;
  } else {
    message = `محترم ${customerName} گرامی،
فاکتور تجاری و رسمی شما به شماره #${invoiceNumber} برای موتر (${vehicleName}) از سوی شرکت سدوزی موتر هرات صادر گردید.
مجموع حساب: $${amountUSD.toLocaleString()} دالر (${amountAFN.toLocaleString()} افغانی).
جهت مشاهده و چاپ فاکتور:
https://ariashowroom.af/accounting/invoices/${invoiceNumber}`;
  }

  const cleanPhone = formatWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
