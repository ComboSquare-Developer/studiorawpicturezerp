/**
 * Shared Status Color System for Studio Raw Picturez ERP & CRM
 *
 * Provides normalized, high-contrast status-to-style mappings across:
 * - Enquiry Directory
 * - All Bookings Table
 * - Booking Calendar
 */

const ENQUIRY_STYLES = {
  new: {
    label: "New",
    rowClass: "bg-[#123366] hover:bg-[#184180] text-white",
    badgeClass: "border-blue-300/60 bg-blue-950/75 text-blue-100",
    dotClass: "bg-blue-400",
  },
  "in discussion": {
    label: "In Discussion",
    rowClass: "bg-[#3b2366] hover:bg-[#492c7d] text-white",
    badgeClass: "border-purple-300/60 bg-purple-950/75 text-purple-100",
    dotClass: "bg-purple-400",
  },
  "follow-up": {
    label: "Follow-up",
    rowClass: "bg-[#784b0a] hover:bg-[#8a570c] text-white",
    badgeClass: "border-amber-300/60 bg-amber-950/75 text-amber-100",
    dotClass: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    rowClass: "bg-[#0f4c3a] hover:bg-[#14614a] text-white",
    badgeClass: "border-emerald-300/60 bg-emerald-950/75 text-emerald-100",
    dotClass: "bg-emerald-400",
  },
  fallback: {
    label: "Unknown",
    rowClass: "bg-slate-800 hover:bg-slate-700 text-white",
    badgeClass: "border-slate-300/60 bg-slate-900/75 text-slate-100",
    dotClass: "bg-slate-400",
  },
};

const BOOKING_STYLES = {
  pending: {
    label: "Pending",
    rowClass: "bg-[#784b0a] hover:bg-[#8a570c] text-white",
    badgeClass: "border-amber-300/60 bg-amber-950/75 text-amber-100",
    cellClass: "border-[#9a630f] bg-[#784b0a] text-white hover:bg-[#8a570c]",
    pillClass: "border border-amber-300/40 bg-amber-950/70 text-amber-100",
    dotClass: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    rowClass: "bg-[#102b53] hover:bg-[#16386b] text-white",
    badgeClass: "border-blue-300/60 bg-blue-950/75 text-blue-100",
    cellClass: "border-[#255496] bg-[#102b53] text-white hover:bg-[#16386b]",
    pillClass: "border border-blue-300/40 bg-blue-950/70 text-blue-100",
    dotClass: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    rowClass: "bg-[#0f4c3a] hover:bg-[#14614a] text-white",
    badgeClass: "border-emerald-300/60 bg-emerald-950/75 text-emerald-100",
    cellClass: "border-[#1b7a5e] bg-[#0f4c3a] text-white hover:bg-[#14614a]",
    pillClass: "border border-emerald-300/40 bg-emerald-950/70 text-emerald-100",
    dotClass: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    rowClass: "bg-[#6e1b2a] hover:bg-[#822132] text-white",
    badgeClass: "border-rose-300/60 bg-rose-950/75 text-rose-100",
    cellClass: "border-[#9e2a3f] bg-[#6e1b2a] text-white hover:bg-[#822132]",
    pillClass: "border border-rose-300/40 bg-rose-950/70 text-rose-100",
    dotClass: "bg-rose-400",
  },
  fallback: {
    label: "Pending",
    rowClass: "bg-slate-800 hover:bg-slate-700 text-white",
    badgeClass: "border-slate-300/60 bg-slate-900/75 text-slate-100",
    cellClass: "border-slate-600 bg-slate-800 text-white hover:bg-slate-700",
    pillClass: "border border-slate-400/40 bg-slate-900/70 text-slate-100",
    dotClass: "bg-slate-400",
  },
};

export function normalizeEnquiryStatus(status) {
  const key = String(status || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (key === "new") return "new";
  if (key === "in discussion" || key === "discussion") return "in discussion";
  if (key === "follow-up" || key === "followup" || key === "follow up") return "follow-up";
  if (key === "confirmed" || key === "converted") return "confirmed";
  return "fallback";
}

export function getEnquiryStatusStyles(status) {
  const key = normalizeEnquiryStatus(status);
  return ENQUIRY_STYLES[key] || ENQUIRY_STYLES.fallback;
}

export function normalizeBookingStatus(status) {
  const key = String(status || "").trim().toLowerCase();
  if (key === "confirmed") return "confirmed";
  if (key === "pending") return "pending";
  if (key === "completed") return "completed";
  if (key === "cancelled" || key === "canceled") return "cancelled";
  return "fallback";
}

export function getBookingStatusStyles(status) {
  const key = normalizeBookingStatus(status);
  return BOOKING_STYLES[key] || BOOKING_STYLES.fallback;
}
