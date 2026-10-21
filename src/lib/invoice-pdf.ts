import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { InvoiceRecord } from "@/lib/mock-data";

/**
 * Generates an SVG/Data-URL QR code for an invoice record.
 */
async function generateInvoiceQRCode(invoice: InvoiceRecord): Promise<string> {
  const qrPayload = JSON.stringify({
    type: "COMMERCIAL_INVOICE",
    inv: invoice.invoiceNumber,
    buyer: invoice.customerName,
    tazkira: invoice.customerTazkira || "N/A",
    vin: invoice.vin || "N/A",
    stock: invoice.vehicleStock || "N/A",
    totalUSD: invoice.totalUSD,
    totalAFN: invoice.totalAFN,
    date: invoice.issueDate,
    dealer: "Sadozai Motors Herat - License #49912",
  });

  try {
    return await QRCode.toDataURL(qrPayload, {
      width: 180,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating QR for invoice PDF:", err);
    return "";
  }
}

/**
 * Creates a pristine, print-styled DOM element for an invoice
 * that renders beautifully into a PDF canvas.
 */
async function createInvoicePrintElement(invoice: InvoiceRecord): Promise<HTMLDivElement> {
  const qrUrl = await generateInvoiceQRCode(invoice);
  const exchangeRate = invoice.exchangeRate || 70.5;

  const container = document.createElement("div");
  container.id = `temp-pdf-invoice-${Date.now()}`;
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "820px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#0f172a";
  container.style.padding = "36px 40px";
  container.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.boxSizing = "border-box";
  container.style.zIndex = "-1000";

  const itemsHtml = invoice.items
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-family: monospace; color: #64748b; font-size: 12px;">${idx + 1}</td>
        <td style="padding: 10px 14px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${item.description}</div>
          ${
            item.descriptionDari
              ? `<div style="font-size: 11px; color: #64748b; font-family: Tahoma, Arial, sans-serif; direction: rtl; text-align: right; margin-top: 2px;">${item.descriptionDari}</div>`
              : ""
          }
        </td>
        <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-weight: 700; font-size: 13px; color: #0f172a;">
          $${item.amountUSD.toLocaleString()}
        </td>
        <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-size: 12px; color: #475569;">
          ؋${Math.round(item.amountUSD * exchangeRate).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <!-- Top Branding & Header -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 20px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="width: 40px; height: 40px; background-color: #0f172a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #38bdf8; font-weight: 900; font-size: 20px;">
            SM
          </div>
          <div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: #0f172a;">
              Sadozai Motors Herat
            </h1>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; direction: rtl; text-align: left; font-family: Tahoma, Arial, sans-serif;">
              نندارتون و شرکت وارداتی اتومبیل سدوزی هرات
            </div>
          </div>
        </div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #475569; max-width: 440px; line-height: 1.4;">
          Main Boulevard, Bagh-e-Azadi, Herat, Afghanistan • Registered Dealership License #49912<br />
          Islam Qala Port Customs Cleared • Direct Vehicle Imports
        </p>
        <p style="margin: 4px 0 0 0; font-size: 11px; font-family: monospace; color: #64748b;">
          Tel: +93 79 910 2030 | WhatsApp: +93 79 912 3456
        </p>
      </div>

      <div style="text-align: right;">
        <div style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 14px; font-family: monospace; font-size: 13px; font-weight: 800; color: #0f172a;">
          ${invoice.invoiceNumber}
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #64748b; line-height: 1.6;">
          <div>Issue Date: <strong style="color: #0f172a; font-family: monospace;">${invoice.issueDate}</strong></div>
          ${
            invoice.dueDate
              ? `<div>Due Date: <strong style="color: #0f172a; font-family: monospace;">${invoice.dueDate}</strong></div>`
              : ""
          }
          <div>Status: <span style="display: inline-block; padding: 1px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; background-color: ${
            invoice.status === "Paid" ? "#dcfce7" : "#fef3c7"
          }; color: ${invoice.status === "Paid" ? "#15803d" : "#b45309"};">${invoice.status}</span></div>
        </div>
      </div>
    </div>

    <!-- Document Title Banner -->
    <div style="background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%); color: #ffffff; border-radius: 8px; padding: 10px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
        Official Commercial Tax Invoice & Sales Deed
      </span>
      <span style="font-size: 12px; font-family: Tahoma, Arial, sans-serif; direction: rtl; color: #94a3b8; font-weight: 600;">
        فاکتور رسمی تجارتی و سند مالیاتی معامله
      </span>
    </div>

    <!-- Customer & Vehicle Info Boxes -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px;">
      <!-- Billed To -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px;">
          Billed To / مشخصات خریدار
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
          ${invoice.customerName}
        </div>
        <div style="font-size: 12px; color: #334155; font-family: monospace; margin-top: 3px;">
          Phone: ${invoice.customerPhone}
        </div>
        ${
          invoice.customerTazkira
            ? `<div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">Tazkira ID: ${invoice.customerTazkira}</div>`
            : ""
        }
        ${
          invoice.customerAddress
            ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Address: ${invoice.customerAddress}</div>`
            : ""
        }
      </div>

      <!-- Vehicle Specifications -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
        <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; margin-bottom: 6px;">
          Vehicle Details / مشخصات موتر
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
          ${invoice.vehicleDesc || "Imported Automobile"}
        </div>
        <div style="font-size: 12px; color: #334155; font-family: monospace; margin-top: 3px;">
          Stock Lot #: <strong>${invoice.vehicleStock || "N/A"}</strong>
        </div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace; margin-top: 2px;">
          VIN / Chassis: ${invoice.vin || "N/A"}
        </div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
          Payment Channel: ${invoice.paymentMethod}
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div style="border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; margin-bottom: 22px;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #334155;">#</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #334155;">Description (شرح خدمات و موتر)</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #334155; text-align: right;">Amount (USD)</th>
            <th style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #334155; text-align: right;">Amount (AFN)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Totals & QR Verification Bar -->
    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-bottom: 24px;">
      <!-- QR Verification -->
      <div style="display: flex; align-items: center; gap: 14px;">
        ${
          qrUrl
            ? `<img src="${qrUrl}" alt="Invoice QR" style="width: 82px; height: 82px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px;" />`
            : ""
        }
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a;">
            Digitally Verified ERP Invoice
          </div>
          <div style="font-size: 10px; color: #475569; margin-top: 2px;">
            Islam Qala Port Customs Cleared & Registered
          </div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px;">
            Exchange Rate: $1 USD = ${exchangeRate} AFN
          </div>
          <div style="font-size: 9px; color: #0284c7; margin-top: 4px; font-weight: 600;">
            Scan QR code to verify authenticity
          </div>
        </div>
      </div>

      <!-- Financial Calculations -->
      <div style="width: 280px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
          <span>Subtotal (مجموع اقلام):</span>
          <span style="font-family: monospace; font-weight: 600;">$${invoice.subtotalUSD.toLocaleString()} USD</span>
        </div>
        ${
          invoice.customsFeeUSD && invoice.customsFeeUSD > 0
            ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
            <span>Customs Duty (محصول گمرکی):</span>
            <span style="font-family: monospace; font-weight: 600;">$${invoice.customsFeeUSD.toLocaleString()} USD</span>
          </div>
        `
            : ""
        }
        ${
          invoice.registrationFeeUSD && invoice.registrationFeeUSD > 0
            ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #475569;">
            <span>Traffic Registration (ثبت ترافیک):</span>
            <span style="font-family: monospace; font-weight: 600;">$${invoice.registrationFeeUSD.toLocaleString()} USD</span>
          </div>
        `
            : ""
        }
        ${
          invoice.discountUSD && invoice.discountUSD > 0
            ? `
          <div style="display: flex; justify-content: space-between; padding: 3px 0; color: #16a34a; font-weight: 600;">
            <span>Special Discount (تخفیف):</span>
            <span style="font-family: monospace;">-$${invoice.discountUSD.toLocaleString()} USD</span>
          </div>
        `
            : ""
        }
        <div style="border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 8px; display: flex; justify-content: space-between; align-items: baseline;">
          <span style="font-size: 13px; font-weight: 800; color: #0f172a;">Grand Total:</span>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: #0f172a;">
              $${invoice.totalUSD.toLocaleString()} USD
            </div>
            <div style="font-size: 12px; font-weight: 700; font-family: monospace; color: #16a34a; margin-top: 1px;">
              ؋${invoice.totalAFN.toLocaleString()} AFN
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Signatures & Showroom Seal -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 36px; border-top: 1px dashed #cbd5e1; padding-top: 22px; margin-top: 10px; font-size: 11px; text-align: center;">
      <div>
        <div style="height: 38px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 10px;">
          Official Dealership Seal & Stamp
        </div>
        <div style="border-top: 1px solid #94a3b8; padding-top: 4px; font-weight: 700; color: #0f172a;">
          Haji Ahmad Shah (Sadozai Motors CEO)
        </div>
        <div style="font-size: 10px; color: #64748b; font-family: Tahoma, Arial, sans-serif;">
          مهر و امضاء مدیریت عمومی نندارتون موتر سدوزی
        </div>
      </div>

      <div>
        <div style="height: 38px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-style: italic; font-size: 10px;">
          Buyer Signature & Fingerprint
        </div>
        <div style="border-top: 1px solid #94a3b8; padding-top: 4px; font-weight: 700; color: #0f172a;">
          ${invoice.customerName}
        </div>
        <div style="font-size: 10px; color: #64748b; font-family: Tahoma, Arial, sans-serif;">
          امضاء و شست خریدار محترم
        </div>
      </div>
    </div>

    <!-- Footer Copyright & Legal -->
    <div style="margin-top: 28px; padding-top: 10px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 9px; color: #94a3b8; font-family: monospace;">
      Official Computerized Dealership Tax Invoice • Generated by Sadozai Motors Dealership ERP System • Herat, Afghanistan
    </div>
  `;

  return container;
}

/**
 * Downloads a Commercial Invoice as a PDF file.
 * If targetElement is passed or found in DOM, captures it;
 * otherwise dynamically builds an authentic print-styled invoice and renders it to PDF.
 */
export async function downloadCommercialInvoicePDF(
  invoice: InvoiceRecord,
  targetElementId?: string
): Promise<void> {
  let elementToCapture: HTMLElement | null = null;
  let isDynamicElement = false;

  if (targetElementId) {
    elementToCapture = document.getElementById(targetElementId);
  }

  // If no mounted element was found, build a pristine dedicated DOM element
  if (!elementToCapture) {
    elementToCapture = await createInvoicePrintElement(invoice);
    document.body.appendChild(elementToCapture);
    isDynamicElement = true;
  }

  try {
    // Wait briefly for images/fonts to paint
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(elementToCapture, {
      scale: 2.2, // high-res for retina / print quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 840,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio
    const imgWidth = pdfWidth - 16; // 8mm margin on left and right
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Center vertically if it fits comfortably on one page
    const yPos = imgHeight < pdfHeight - 20 ? (pdfHeight - imgHeight) / 2 : 10;

    pdf.addImage(imgData, "PNG", 8, Math.max(8, yPos), imgWidth, imgHeight, undefined, "FAST");

    const sanitizedInvNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `Commercial_Invoice_${sanitizedInvNumber}.pdf`;

    pdf.save(filename);
  } catch (error) {
    console.error("Failed to generate commercial invoice PDF:", error);
    throw error;
  } finally {
    if (isDynamicElement && elementToCapture && elementToCapture.parentNode) {
      elementToCapture.parentNode.removeChild(elementToCapture);
    }
  }
}
