// FILE: src/services/invoicePdfService.js
// Production-quality Professional PDF Invoice Generator for Studio Raw Picturez

import { jsPDF } from "jspdf";
import studioLogoUrl from "../assets/favicon.png";

const NAVY = [16, 38, 77]; // #10264d
const ROYAL_BLUE = [40, 90, 153]; // #285a99
const SLATE = [99, 119, 145]; // #637791
const LIGHT_BG = [248, 251, 255]; // #f8fbff
const HEADER_FILL = [235, 244, 255]; // #ebf4ff
const BORDER_COLOR = [218, 231, 245]; // #dae7f5
const GOLD_ACCENT = [197, 160, 89]; // #c5a059
const GREEN = [18, 125, 94]; // #127d5e
const AMBER = [177, 115, 36]; // #b17324

let cachedLogoImage = null;

export function getStudioLogoImage() {
  if (cachedLogoImage && cachedLogoImage.complete) {
    return Promise.resolve(cachedLogoImage);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      cachedLogoImage = img;
      resolve(img);
    };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => {
        cachedLogoImage = fallback;
        resolve(fallback);
      };
      fallback.onerror = () => resolve(null);
      fallback.src = "/studio-logo.png";
    };
    img.src = studioLogoUrl;
  });
}

export function isOtherEventType(service, eventType) {
  if (!eventType) return false;
  if (service === "Wedding Photography" && eventType === "Other") return true;
  if (service === "Wedding Videography" && eventType === "Other") return true;
  if (service === "Functions We Arrange" && eventType === "Other Function") return true;
  if (service === "Event Management" && eventType === "Other Event") return true;
  if (service === "Customer Gifts" && eventType === "Other Gift") return true;
  return false;
}

export function formatBookingService(booking) {
  if (!booking) return "Not Linked";

  const s = String(booking.service || booking.service_type || "").trim();
  const e = String(booking.event || booking.event_type || "").trim();
  const cs = String(booking.customService || booking.custom_service || "").trim();
  const ce = String(booking.customEvent || booking.custom_event || "").trim();

  if (s === "Others" || s.toLowerCase() === "others") {
    return cs || e || "Other Service";
  }

  const effectiveEvent = isOtherEventType(s, e) && ce ? ce : (ce || e);

  if (s && effectiveEvent) {
    return `${s} – ${effectiveEvent}`;
  }
  return s || effectiveEvent || "Direct Invoice";
}

export function getInvoiceServiceDisplay(invoice, booking) {
  if (booking) {
    return formatBookingService(booking);
  }

  if (invoice?.service || invoice?.event || invoice?.customService) {
    return formatBookingService(invoice);
  }

  if (
    invoice?.packageName &&
    invoice.packageName !== "—" &&
    invoice.packageName !== "Photography / Event Service"
  ) {
    return invoice.packageName;
  }

  return "Direct Invoice";
}

function formatDate(v) {
  if (!v) return "—";
  try {
    const s = String(v).trim();
    const d = /^\d{4}-\d{2}-\d{2}/.test(s)
      ? new Date(`${s.slice(0, 10)}T12:00:00`)
      : new Date(s);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(v);
  }
}

function formatTime(v) {
  if (!v) return "—";
  const s = String(v).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    let p = match[3] ? match[3].toUpperCase() : null;
    if (!p) {
      p = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
    } else {
      h = h % 12 || 12;
    }
    return `${String(h).padStart(2, "0")}:${m} ${p}`;
  }
  return s;
}

function moneyString(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export async function generateInvoicePdf(invoice, options = {}) {
  const { booking = null, customer = null, action = "download" } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const logoImg = await getStudioLogoImage();

  // Financial calculations
  const total = Number(invoice.total || invoice.total_amount || booking?.totalAmount || 0);
  const rawTransactions = Array.isArray(invoice.transactions)
    ? invoice.transactions
    : Array.isArray(invoice.paymentHistory)
    ? invoice.paymentHistory
    : [];

  const validTransactions = rawTransactions.filter((tx) => {
    const st = String(tx.status || "").toLowerCase();
    return !["failed", "cancelled", "canceled", "void"].includes(st);
  });

  let received = 0;
  if (validTransactions.length > 0) {
    received = validTransactions.reduce(
      (sum, tx) => sum + (Number(tx.amount || tx.paidAmount || 0)),
      0
    );
  } else {
    received = Number(invoice.paidAmount ?? invoice.paid_amount ?? invoice.advance ?? 0);
  }

  const advance = Number(invoice.advance || (validTransactions[0]?.amount) || 0);
  const additionalPayments = Math.max(0, received - advance);
  const balance = Math.max(0, total - received);

  // Status
  let status = "PENDING";
  if (total > 0 && received >= total) {
    status = "PAID";
  } else if (received > 0) {
    status = "PARTIAL";
  }

  // Related data resolution
  const invoiceNo =
    invoice.invoice ||
    invoice.invoiceNumber ||
    invoice.transaction_id ||
    `SRP-${booking?.id || Date.now()}`;

  const invoiceDate = formatDate(
    invoice.date || invoice.payment_date || booking?.invoiceDate || new Date()
  );

  const customerName =
    invoice.customer ||
    invoice.customer_name ||
    booking?.customer ||
    customer?.name ||
    "Customer";

  const customerPhone =
    invoice.phone ||
    booking?.phone ||
    customer?.phone ||
    "—";

  const customerEmail =
    invoice.email ||
    booking?.email ||
    customer?.email ||
    "";

  const customerAddress =
    booking?.location ||
    customer?.address ||
    invoice.location ||
    "";

  const serviceTitle = booking
    ? (booking.service === "Others"
        ? (booking.customService || "Custom Photography & Creative Service")
        : booking.service || "Creative Photography & Video")
    : (invoice.service || invoice.packageName || "Studio Photography / Event Service");

  const eventDetail = booking
    ? (booking.service === "Others"
        ? (booking.customService || "Custom Service")
        : (isOtherEventType(booking.service, booking.event) && booking.customEvent
            ? booking.customEvent
            : booking.event || "Standard Event Shoot"))
    : (invoice.event || invoice.packageName || "Standard Event Package");

  const bookingRef = booking?.id ? String(booking.id) : (invoice.bookingId ? String(invoice.bookingId) : "Direct Billing");
  const shootDate = booking?.date ? formatDate(booking.date) : "As Scheduled";
  const shootTime = booking?.time ? formatTime(booking.time) : "—";
  const shootLocation = booking?.location || customerAddress || "Studio / On-Location";
  const assignedStaff = booking?.photographer && booking.photographer !== "Not Assigned"
    ? `${booking.photographer}${booking.staffRole ? ` (${booking.staffRole})` : ""}`
    : "Assigned Studio Crew";

  // ----------------------------------------------------
  // 1. TOP HEADER (Deep Navy + Gold Accent)
  // ----------------------------------------------------
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 42, "F");

  // Logo
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", 14, 7, 28, 28);
    } catch {
      // Fallback if image rendering fails
    }
  }

  // Studio Header Text
  const textLeftX = logoImg ? 45 : 15;
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("STUDIO RAW PICTUREZ", textLeftX, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(205, 222, 248);
  doc.text("PHOTOGRAPHY | EVENTS | CREATIVE SERVICES", textLeftX, 27);

  // Right Side Header (TAX INVOICE)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", 196, 18, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(230, 240, 255);
  doc.text(`Invoice No: ${invoiceNo}`, 196, 26, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(205, 222, 248);
  doc.text(`Date: ${invoiceDate}`, 196, 33, { align: "right" });

  // Luxury Gold Accent Line
  doc.setDrawColor(...GOLD_ACCENT);
  doc.setLineWidth(1);
  doc.line(0, 42, 210, 42);

  // ----------------------------------------------------
  // 2. BILL TO & BOOKING SCHEDULE (Side-by-side cards)
  // ----------------------------------------------------
  const cardY = 48;
  const cardH = 38;

  // Bill To Box
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, cardY, 88, cardH, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("BILL TO (CUSTOMER DETAILS)", 19, cardY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  const splitName = doc.splitTextToSize(customerName, 78);
  doc.text(splitName[0] || "Customer", 19, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(`Phone: ${customerPhone}`, 19, cardY + 21);

  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, 19, cardY + 27);
  } else if (customerAddress) {
    const splitAddr = doc.splitTextToSize(`Location: ${customerAddress}`, 78);
    doc.text(splitAddr[0], 19, cardY + 27);
  } else {
    doc.text("Verified Studio Client", 19, cardY + 27);
  }

  if (customerEmail && customerAddress) {
    const splitAddr = doc.splitTextToSize(`Location: ${customerAddress}`, 78);
    doc.text(splitAddr[0], 19, cardY + 33);
  }

  // Booking Details Box
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(108, cardY, 88, cardH, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("BOOKING REFERENCE & SCHEDULE", 113, cardY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...NAVY);
  doc.text(`Ref: ${bookingRef}`, 113, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(`Event Date: ${shootDate} · ${shootTime}`, 113, cardY + 21);

  const splitLoc = doc.splitTextToSize(`Location: ${shootLocation}`, 78);
  doc.text(splitLoc[0] || "Location: Studio", 113, cardY + 27);

  const splitStaff = doc.splitTextToSize(`Assigned: ${assignedStaff}`, 78);
  doc.text(splitStaff[0] || "Assigned: Studio Team", 113, cardY + 33);

  // ----------------------------------------------------
  // 3. SERVICE DETAILS TABLE (Description & Amount)
  // ----------------------------------------------------
  const tableY = 92;
  doc.setFillColor(...HEADER_FILL);
  doc.setDrawColor(...BORDER_COLOR);
  doc.rect(14, tableY, 182, 8, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("SERVICE & EVENT SPECIFICATION", 19, tableY + 5.5);
  doc.text("AMOUNT (INR)", 191, tableY + 5.5, { align: "right" });

  // Row
  const rowY = tableY + 8;
  const rowH = 18;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, rowY, 182, rowH, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...NAVY);
  doc.text(serviceTitle, 19, rowY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  doc.text(`Specialization / Event: ${eventDetail}`, 19, rowY + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...NAVY);
  doc.text(moneyString(total), 191, rowY + 9, { align: "right" });

  // ----------------------------------------------------
  // 4. INVOICE AMOUNT SUMMARY & PAYMENT STATUS
  // ----------------------------------------------------
  const sumY = 120;

  // Left Status Badge & Terms Card
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, sumY, 88, 48, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...ROYAL_BLUE);
  doc.text("INVOICE PAYMENT STATUS", 19, sumY + 8);

  // Status Badge Pill
  const badgeColors = {
    PAID: { bg: [230, 247, 238], border: [168, 226, 196], text: GREEN },
    PARTIAL: { bg: [255, 245, 230], border: [250, 218, 172], text: AMBER },
    PENDING: { bg: [242, 246, 252], border: [214, 226, 242], text: SLATE },
  };
  const currentBadge = badgeColors[status] || badgeColors.PENDING;

  doc.setFillColor(...currentBadge.bg);
  doc.setDrawColor(...currentBadge.border);
  doc.roundedRect(19, sumY + 12, 34, 8, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...currentBadge.text);
  doc.text(status, 36, sumY + 17.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(`Payment Mode: ${invoice.method || invoice.payment_method || "Cash / Bank Transfer"}`, 19, sumY + 27);

  doc.setFontSize(7.5);
  doc.setTextColor(130, 148, 172);
  const termLines = doc.splitTextToSize(
    "Terms: Deliverables and editing schedules are activated upon receipt of advance. Final high-resolution output is handed over after complete balance clearance.",
    78
  );
  doc.text(termLines, 19, sumY + 34);

  // Right Financial Summary Box
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(108, sumY, 88, 48, 3, 3, "FD");

  const finRow = (label, val, yPos, isBold = false, color = NAVY) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...(isBold ? NAVY : SLATE));
    doc.text(label, 114, yPos);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(moneyString(val), 191, yPos, { align: "right" });
  };

  finRow("Total Invoice Amount:", total, sumY + 8, true);
  finRow("Advance Received:", advance, sumY + 15);
  finRow("Additional Payments:", additionalPayments, sumY + 22);

  doc.setDrawColor(...BORDER_COLOR);
  doc.line(114, sumY + 26, 191, sumY + 26);

  finRow("Total Received:", received, sumY + 33, true, GREEN);
  finRow("Pending Balance:", balance, sumY + 41, true, AMBER);

  // ----------------------------------------------------
  // 5. PAYMENT HISTORY TABLE
  // ----------------------------------------------------
  let histY = 175;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...NAVY);
  doc.text("PAYMENT TRANSACTION HISTORY", 14, histY);

  histY += 4;
  doc.setFillColor(...HEADER_FILL);
  doc.setDrawColor(...BORDER_COLOR);
  doc.rect(14, histY, 182, 7, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...NAVY);
  doc.text("#", 17, histY + 4.8);
  doc.text("Date", 25, histY + 4.8);
  doc.text("Method", 60, histY + 4.8);
  doc.text("Description / Transaction Note", 95, histY + 4.8);
  doc.text("Amount (INR)", 191, histY + 4.8, { align: "right" });

  histY += 7;

  if (validTransactions.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(14, histY, 182, 10, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...SLATE);
    doc.text("No payments received yet.", 18, histY + 6.5);
    histY += 10;
  } else {
    validTransactions.forEach((tx, idx) => {
      if (histY > 262) {
        doc.addPage();
        histY = 25;
      }

      const txDate = formatDate(tx.date || tx.payment_date || invoice.date);
      const txMethod = tx.method || tx.payment_method || "Cash";
      const txNote = tx.note || tx.notes || (idx === 0 ? "Booking Advance" : `Installment ${idx + 1}`);
      const txAmt = Number(tx.amount || tx.paidAmount || 0);

      doc.setFillColor(idx % 2 === 0 ? 255 : 249, idx % 2 === 0 ? 255 : 252, idx % 2 === 0 ? 255 : 255);
      doc.rect(14, histY, 182, 8, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...SLATE);
      doc.text(String(idx + 1), 17, histY + 5.5);
      doc.text(txDate, 25, histY + 5.5);
      doc.text(txMethod, 60, histY + 5.5);
      doc.text(doc.splitTextToSize(txNote, 65)[0] || txNote, 95, histY + 5.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GREEN);
      doc.text(moneyString(txAmt), 191, histY + 5.5, { align: "right" });

      histY += 8;
    });
  }

  // ----------------------------------------------------
  // 6. FOOTER (Multi-page safe)
  // ----------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setDrawColor(...BORDER_COLOR);
    doc.setLineWidth(0.5);
    doc.line(14, 278, 196, 278);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text("Thank you for choosing Studio Raw Picturez!", 105, 283, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE);
    doc.text(
      "Creative Photography · Cinematography · Event Management · Customer Gifts",
      105,
      287.5,
      { align: "center" }
    );

    doc.setFontSize(6.5);
    doc.setTextColor(140, 160, 180);
    doc.text(
      "Computer-generated invoice · No signature required · www.studiorawpicturez.com",
      105,
      291.5,
      { align: "center" }
    );

    doc.text(`Page ${page} of ${totalPages}`, 196, 291.5, { align: "right" });
  }

  const safeInvoiceName = String(invoiceNo).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `Invoice-${safeInvoiceName}.pdf`;

  if (action === "print") {
    const blobUrl = doc.output("bloburl");
    if (!window.open(blobUrl, "_blank")) {
      doc.save(filename);
      window.alert("Popup blocked. Invoice downloaded instead.");
    }
  } else {
    doc.save(filename);
  }

  return doc;
}
