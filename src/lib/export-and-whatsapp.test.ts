import test from "node:test";
import assert from "node:assert/strict";
import { safeCsvText } from "./export-utils";
import { escapeHtml } from "./invoice-pdf";
import {
  formatWhatsAppPhone,
  createInstallmentReminderLink,
  createInvoiceWhatsAppLink,
} from "./whatsapp";

test("safeCsvText escapes quotes and neutralizes CSV formula injection while keeping phone numbers intact", () => {
  assert.equal(safeCsvText('Toyota "VXR"'), '"Toyota ""VXR"""');
  assert.equal(
    safeCsvText("=CMD|' /C calc'!A0"),
    '"\'=CMD|\' /C calc\'!A0"'
  );
  assert.equal(safeCsvText("@SUM(A1:A10)"), '"\'@SUM(A1:A10)"');
  assert.equal(safeCsvText("-2500+cmd"), '"\'-2500+cmd"');
  // Legitimate international phone numbers starting with +93 should not get an apostrophe
  assert.equal(safeCsvText("+93 79 910 2030"), '"+93 79 910 2030"');
});

test("escapeHtml neutralizes HTML tags and attribute delimiters", () => {
  const malicious = `<img src=x onerror="alert('xss')">&`;
  assert.equal(
    escapeHtml(malicious),
    "&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;"
  );
});

test("formatWhatsAppPhone normalizes Afghan local and international 00 prefixes", () => {
  assert.equal(formatWhatsAppPhone("0799 10 20 30"), "93799102030");
  assert.equal(formatWhatsAppPhone("00971 50 123 4567"), "971501234567");
  assert.equal(formatWhatsAppPhone("+93 70 111 2222"), "93701112222");
});

test("WhatsApp invoice and installment links support English/Dari/Pashto and route to public /verify", () => {
  const enInvoiceUrl = createInvoiceWhatsAppLink({
    customerName: "Ahmad Wali",
    phone: "0799102030",
    invoiceNumber: "INV-HRT-202601",
    vehicleName: "2024 Toyota Land Cruiser",
    amountUSD: 85000,
    exchangeRate: 70.5,
    language: "en",
  });

  const decodedEn = decodeURIComponent(enInvoiceUrl);
  assert.ok(enInvoiceUrl.startsWith("https://wa.me/93799102030?text="));
  assert.ok(decodedEn.includes("Aria Motors"));
  assert.ok(decodedEn.includes("/verify?vin=INV-HRT-202601"));
  assert.ok(!decodedEn.includes("/accounting/invoices/"));

  const faReminderUrl = createInstallmentReminderLink({
    customerName: "حاجی نصیر",
    phone: "0799102030",
    vehicleName: "2023 Lexus LX600",
    amountUSD: 5000,
    exchangeRate: 70,
    dueDate: "2026-11-15",
    installmentNumber: 2,
    language: "fa",
  });
  const decodedFa = decodeURIComponent(faReminderUrl);
  assert.ok(decodedFa.includes("نمایشگاه موتر آریا"));
  assert.ok(decodedFa.includes("350,000"));
});
