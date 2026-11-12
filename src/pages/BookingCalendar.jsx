import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../api/client";
import { syncEnquiriesToBookings } from "../utils/enquiryBookingSync";
import {
  CalendarDays,
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  Plus,
  Search,
  X,
  MapPin,
  UserRound,
  Camera,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Phone,
  Filter,
  Save,
  CalendarPlus,
  CalendarRange,
  ClipboardList,
  IndianRupee,
  Link2,
  RefreshCw,
  Download,
  Info,
  AlertCircle,
  Printer,
} from "lucide-react";
import studioLogoUrl from "../assets/favicon.png";
import {
  generateInvoicePdf,
  formatBookingService,
  isOtherEventType,
} from "../services/invoicePdfService";

const STORAGE_KEY = "studioraw_bookings";
const CUSTOMER_KEY = "studio_raw_customers";
const PAYMENT_KEY = "studioraw_payments";
const STAFF_KEY = "studioraw_staff";
const UPDATE_EVENT = "studioraw:data-updated";

const services = [
  "Wedding Photography",
  "Wedding Videography",
  "Functions We Arrange",
  "Event Management",
  "Customer Gifts",
  "Others",
];

const serviceEventTypes = {
  "Wedding Photography": [
    "Traditional Photography",
    "Candid Photography",
    "Helicam Photography",
    "Pre-Wedding Photography",
    "Post-Wedding Photography",
    "Other",
  ],
  "Wedding Videography": [
    "Traditional Wedding Videography",
    "Cinematic Wedding Videography",
    "Traditional + Candid Video",
    "Pre-Wedding Video",
    "Post-Wedding Video",
    "Drone / Helicam Video",
    "Other",
  ],
  "Functions We Arrange": [
    "Engagement",
    "Reception",
    "Wedding",
    "Birthday Function",
    "Baby Shower",
    "Naming Ceremony",
    "Corporate Function",
    "Other Function",
  ],
  "Event Management": [
    "Wedding Event Management",
    "Engagement Event Management",
    "Birthday Event Management",
    "Corporate Event Management",
    "Stage & Decoration",
    "Other Event",
  ],
  "Customer Gifts": [
    "Customized Photo Frame",
    "Album",
    "Mug Printing",
    "Customized Gifts",
    "Return Gifts",
    "Other Gift",
  ],
  "Others": [],
};

const statuses = ["Confirmed", "Pending", "Completed", "Cancelled"];

const emptyForm = {
  customerId: "",
  customer: "",
  phone: "",
  service: "Wedding Photography",
  customService: "",
  event: "Traditional Photography",
  customEvent: "",
  date: "",
  time: "10:00",
  location: "",
  photographer: "Not Assigned",
  staffId: "",
  employeeId: "",
  staffRole: "",
  staffDepartment: "",
  totalAmount: "",
  status: "Confirmed",
  invoiceNumber: "",
  invoiceDate: new Date().toISOString().slice(0, 10),
  advance: "",
  paymentMethod: "Cash",
  isManualBooking: true,
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-[#6b99d5] focus:ring-2 focus:ring-blue-100";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-sm font-bold text-white hover:bg-[#173f74]";

const dateKey = (d) => {
  if (!d) return "";
  const dateObj = d instanceof Date ? d : parseDate(d);
  if (!dateObj || Number.isNaN(dateObj.getTime())) return "";
  return [
    dateObj.getFullYear(),
    String(dateObj.getMonth() + 1).padStart(2, "0"),
    String(dateObj.getDate()).padStart(2, "0"),
  ].join("-");
};

function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = /^\d{4}-\d{2}-\d{2}/.test(s)
    ? new Date(`${s.slice(0, 10)}T12:00:00`)
    : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeDate(value) {
  if (!value) return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const parts = s.split("/");
  if (parts.length === 3 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  const d = parseDate(value);
  if (!d) return "";
  return dateKey(d);
}

const formatDate = (v) => {
  const d = parseDate(v);
  return d
    ? d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const formatTime = (v) => {
  if (!v) return "—";
  const [h, m] = String(v).split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m)
    ? new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : String(v);
};

function parseTimeTo12h(timeStr) {
  if (!timeStr) return { hour: "10", minute: "00", period: "AM" };
  const s = String(timeStr).trim();
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
    return { hour: String(h).padStart(2, "0"), minute: m, period: p };
  }
  return { hour: "10", minute: "00", period: "AM" };
}

function format12hTo24h(hour, minute, period) {
  let h = parseInt(hour, 10) || 12;
  const m = String(minute).padStart(2, "0");
  if (period === "AM") {
    h = h === 12 ? 0 : h;
  } else {
    h = h === 12 ? 12 : h + 12;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
}

function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const parsed = useMemo(() => parseTimeTo12h(value), [value]);

  const applyTime = (h, m, p) => {
    const val24 = format12hTo24h(h, m, p);
    onChange(val24);
  };

  const hours = [
    "01", "02", "03", "04", "05", "06",
    "07", "08", "09", "10", "11", "12",
  ];
  const minutes = [
    "00", "05", "10", "15", "20", "25",
    "30", "35", "40", "45", "50", "55",
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full min-w-0 items-center justify-between rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm font-semibold text-[#10264d] shadow-sm transition hover:border-[#6b99d5] focus:border-[#6b99d5] focus:ring-2 focus:ring-blue-100"
      >
        <span className="flex items-center gap-2">
          <Clock3 size={16} className="text-[#3b6ea8]" />
          <span>
            {parsed.hour}:{parsed.minute} {parsed.period}
          </span>
        </span>
        <span className="text-xs font-bold text-[#6485ac]">Select Time</span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[280px] rounded-2xl border border-[#cfe0f4] bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#eef4fb] pb-2">
            <span className="text-xs font-extrabold text-[#173f74]">
              Select Booking Time (12-Hour)
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-[#6485ac] hover:bg-[#f0f6ff]"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[#7a95b5]">
                Hour
              </label>
              <select
                value={parsed.hour}
                onChange={(e) =>
                  applyTime(e.target.value, parsed.minute, parsed.period)
                }
                className="w-full rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-2 text-center text-sm font-black text-[#173f74] outline-none"
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[#7a95b5]">
                Minute
              </label>
              <select
                value={parsed.minute}
                onChange={(e) =>
                  applyTime(parsed.hour, e.target.value, parsed.period)
                }
                className="w-full rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-2 text-center text-sm font-black text-[#173f74] outline-none"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[#7a95b5]">
                AM / PM
              </label>
              <div className="flex rounded-xl border border-[#dce5f1] bg-[#f8fbff] p-0.5">
                {["AM", "PM"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => applyTime(parsed.hour, parsed.minute, p)}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-black transition ${
                      parsed.period === p
                        ? "bg-[#285a99] text-white shadow-sm"
                        : "text-[#5578a4] hover:bg-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl bg-[#285a99] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#1a4478]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const amount = (v) => {
  const n = Number(String(v ?? 0).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const money = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount(v));

const normalizePhone = (v) => String(v || "").replace(/\D/g, "").slice(-10);

function readArray(key) {
  try {
    const p = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(p)) return p;
    for (const k of [
      "data",
      "records",
      "items",
      "list",
      "customers",
      "bookings",
      "payments",
      "enquiries",
    ])
      if (Array.isArray(p?.[k])) return p[k];
  } catch {}
  return [];
}

function readStaffMembers() {
  const staff = readArray(STAFF_KEY);
  return staff.filter((member) => {
    const status = String(member.status || "Active").trim().toLowerCase();
    return status === "active";
  });
}

function getStaffForServiceAndEvent(service, eventType, staffMembers) {
  const s = String(service || "").trim().toLowerCase();
  const e = String(eventType || "").trim().toLowerCase();

  // If Others, all active staff members are eligible to be assigned
  if (s === "others" || s === "other") {
    return staffMembers;
  }

  return staffMembers.filter((member) => {
    const mService = String(member.service || "").trim().toLowerCase();
    const dept = String(member.department || "").trim().toLowerCase();
    const role = String(
      member.specialization || member.role || member.designation || ""
    ).trim().toLowerCase();

    // Direct match by service field
    if (mService && mService === s) return true;

    if (s.includes("wedding photography") || s === "photography") {
      return (
        mService.includes("wedding photography") ||
        dept.includes("photography") ||
        role.includes("photo") ||
        role.includes("candid") ||
        role.includes("traditional")
      );
    }

    if (s.includes("wedding videography") || s === "videography") {
      return (
        mService.includes("wedding videography") ||
        dept.includes("videography") ||
        role.includes("video") ||
        role.includes("cinema") ||
        role.includes("drone")
      );
    }

    if (s.includes("functions we arrange")) {
      if (
        e.includes("photo") ||
        e.includes("candid") ||
        e.includes("maternity") ||
        e.includes("shoot")
      ) {
        return dept.includes("photography") || role.includes("photo");
      }
      if (
        e.includes("video") ||
        e.includes("cinema") ||
        e.includes("drone") ||
        e.includes("night") ||
        e.includes("party")
      ) {
        return dept.includes("videography") || role.includes("video") || role.includes("cinema");
      }
      return (
        mService.includes("functions we arrange") ||
        dept.includes("photography") ||
        dept.includes("videography") ||
        dept.includes("operations") ||
        role.includes("photo") ||
        role.includes("video") ||
        role.includes("coordinator")
      );
    }

    if (s.includes("event management")) {
      return (
        mService.includes("event management") ||
        dept.includes("management") ||
        dept.includes("operations") ||
        role.includes("event") ||
        role.includes("coordinator") ||
        role.includes("manager") ||
        role.includes("production") ||
        role.includes("lighting")
      );
    }

    if (s.includes("customer gifts") || s.includes("gift")) {
      return (
        mService.includes("customer gifts") ||
        dept.includes("post-production") ||
        dept.includes("operations") ||
        dept.includes("customer support") ||
        role.includes("designer") ||
        role.includes("album") ||
        role.includes("gift") ||
        role.includes("editor") ||
        role.includes("support")
      );
    }

    return mService === "others" || (dept && s.includes(dept));
  });
}

function getConflictingStaffSet(bookings, bookingDate, bookingTime, currentBookingId) {
  const conflicting = new Set();
  if (!bookingDate) return conflicting;
  const targetDate = normalizeDate(bookingDate);
  if (!targetDate) return conflicting;
  const targetTime = String(bookingTime || "").trim();

  for (const b of bookings || []) {
    if (currentBookingId && String(b.id) === String(currentBookingId)) continue;
    const status = String(b.status || "").trim().toLowerCase();
    if (status !== "confirmed" && status !== "completed") continue;
    if (normalizeDate(b.date || b.eventDate || b.event_date) !== targetDate) continue;

    const bTime = String(b.time || "").trim();
    const timeOverlap = !targetTime || !bTime || bTime === targetTime;
    if (!timeOverlap) continue;

    if (b.staffId) conflicting.add(String(b.staffId));
    if (b.employeeId) conflicting.add(String(b.employeeId));
    if (b.photographer && b.photographer !== "Not Assigned") {
      conflicting.add(String(b.photographer).trim().toLowerCase());
    }
  }

  return conflicting;
}

const staffDisplayName = (member) =>
  String(
    member.staff_name ||
      member.name ||
      member.fullName ||
      member.employeeName ||
      member.staffName ||
      ""
  ).trim();

function notify(key) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, { detail: { key, module: "bookings" } })
  );
}

function writeArray(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
  notify(key);
}

const customerName = (c) =>
  String(c?.name || c?.customerName || c?.customer || "").trim();

const customerPhone = (c) =>
  normalizePhone(c?.phone || c?.mobile || c?.contactNumber);

const paymentTotal = (p) =>
  amount(
    p.total ??
      p.totalAmount ??
      p.total_amount ??
      p.grandTotal ??
      p.packageAmount ??
      p.bookingAmount ??
      p.amount
  );

function paymentReceived(p) {
  if (Array.isArray(p.transactions) && p.transactions.length)
    return p.transactions.reduce((sum, t) => {
      const status = String(t.status || "").toLowerCase();
      if (["failed", "cancelled", "canceled", "void"].includes(status))
        return sum;
      const n = amount(t.amount ?? t.paidAmount ?? t.received);
      return (
        sum +
        (status === "refunded" || String(t.type || "").toLowerCase() === "refund"
          ? -n
          : n)
      );
    }, 0);

  return amount(
    p.paidAmount ??
      p.paid_amount ??
      p.amountPaid ??
      p.receivedAmount ??
      p.amountReceived ??
      p.totalPaid ??
      p.advance ??
      p.advanceAmount
  );
}

function paymentBookingId(p) {
  const id = p.bookingId ?? p.booking_id ?? p.booking;
  return id && typeof id === "object" ? id.id : id;
}

function financialsFor(booking, payments) {
  const invoices = payments.filter(
    (p) =>
      paymentBookingId(p) != null &&
      String(paymentBookingId(p)) === String(booking.id)
  );

  const billed = invoices.reduce((s, p) => s + paymentTotal(p), 0);
  const received = invoices.reduce((s, p) => s + paymentReceived(p), 0);
  const total = amount(booking.totalAmount) || billed;

  return {
    invoices,
    billed: total,
    received,
    pending: Math.max(0, total - received),
    paymentStatus: !invoices.length
      ? "Not Invoiced"
      : total > 0 && received >= total
      ? "Paid"
      : received > 0
      ? "Partial"
      : "Pending",
  };
}

function mergeRemotePayments(local, remote) {
  const byId = new Map(local.map((p) => [String(p.id), p]));

  for (const p of remote) {
    const old = byId.get(String(p.id)) || {};

    byId.set(String(p.id), {
      ...old,
      id: p.id,
      invoice: p.transaction_id || old.invoice || `SRP-${p.id}`,
      bookingId: paymentBookingId(p) ?? old.bookingId ?? "",
      customer: p.customer_name || old.customer || "",
      total: amount(p.total_amount ?? p.amount ?? old.total),
      advance: amount(p.paid_amount ?? old.advance),
      paid_amount: amount(p.paid_amount ?? old.advance),
      method: p.payment_method || old.method || "Cash",
      date: p.payment_date || old.date || "",
      status: p.status || old.status || "Pending",
      transactions:
        Array.isArray(old.transactions) &&
        old.transactions.length &&
        Math.abs(paymentReceived(old) - amount(p.paid_amount)) < 0.01
          ? old.transactions
          : [],
    });
  }

  return [...byId.values()];
}

const statusTheme = {
  Confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        statusTheme[status] || statusTheme.Pending
      }`}
    >
      {status || "Pending"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const styles = {
    Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Partial: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    "Not Invoiced": "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        styles[status] || styles["Not Invoiced"]
      }`}
    >
      {status}
    </span>
  );
}

function PaymentSummary({ booking, financials }) {
  const total = amount(booking.totalAmount) || financials?.billed || 0;
  return (
    <div className="mt-3 rounded-xl border border-[#dce9f8] bg-white/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black text-[#173f74]">Payment Summary</p>
        <PaymentBadge status={financials?.paymentStatus || "Not Invoiced"} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Total", total],
          ["Received", financials?.received || 0],
          ["Pending", financials?.pending ?? total],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl bg-[#edf5ff] p-2">
            <p className="text-[10px] text-[#7890ac]">{label}</p>
            <p className="mt-1 break-words text-xs font-black text-[#173f74]">
              {money(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  index,
  onEdit,
  onDelete,
  onStatus,
  onInvoice,
  financials,
}) {
  const hasInvoice = Boolean(financials?.invoices && financials.invoices.length > 0);
  const eventLabel =
    booking.service === "Others"
      ? (booking.customService || "Other Service")
      : (isOtherEventType(booking.service, booking.event) && booking.customEvent
          ? booking.customEvent
          : booking.event);

  return (
    <article className="sr-booking-card min-w-0 rounded-[20px] border border-[#d5e5fa] bg-gradient-to-br from-[#e8f2ff] via-[#f1f7ff] to-[#e2efff] p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7694b9]">
            Booking {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 truncate text-base font-black text-[#173f74]">
            {booking.customer || "Customer"}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#d3e4f8] pt-4">
        {[
          ["Service / Event", formatBookingService(booking)],
          ["Event Date", formatDate(booking.date)],
          ["Time", formatTime(booking.time)],
          ["Location", booking.location || "—"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#dce9f8] bg-white/90 p-3"
          >
            <p className="text-[10px] font-bold uppercase text-[#8a9fba]">
              {label}
            </p>
            <p className="mt-1.5 break-words text-xs font-extrabold text-[#285a99]">
              {value || "—"}
            </p>
          </div>
        ))}
        <div className="col-span-2 min-w-0 rounded-xl border border-[#dce9f8] bg-white/90 p-3">
          <p className="text-[10px] font-bold uppercase text-[#8a9fba]">
            Assigned Staff
          </p>
          <p className="mt-1.5 break-words text-xs font-extrabold text-[#285a99]">
            {booking.photographer || "Not Assigned"}
            {booking.staffRole ? ` – ${booking.staffRole}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {hasInvoice && (
          <button
            type="button"
            title="Download Invoice"
            onClick={() => onInvoice?.(booking)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            <Download size={16} />
            Invoice
          </button>
        )}
        <select
          value={booking.status || "Pending"}
          onChange={(e) => onStatus(booking.id, e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-[#cfdef2] bg-white px-3 py-2.5 text-xs font-bold text-[#285a99]"
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onEdit(booking)}
          title="Edit Booking"
          className="rounded-xl border bg-white p-2.5 text-[#356cae] hover:bg-[#edf5ff]"
        >
          <Pencil size={17} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(booking)}
          title="Delete Booking"
          className="rounded-xl border border-rose-100 bg-white p-2.5 text-[#d65c72] hover:bg-rose-50"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

function ModalShell({ title, subtitle, icon: Icon, onClose, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07182f]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[94dvh] w-full max-w-[620px] flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#dce8f8] bg-gradient-to-r from-[#d5e7ff] to-[#f4f9ff] p-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#b5d3fa] p-3 text-[#285a99]">
              <Icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6686ad]">
                Studio Raw Picturez
              </p>
              <h2 className="mt-1 text-lg font-black text-[#173f74]">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-xs text-[#6586ad]">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white p-2.5 text-[#55779e] hover:bg-[#e4effc]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

function DeleteBookingModal({ booking, payments, onClose, onConfirm }) {
  const linkedInvoices = useMemo(() => {
    if (!booking?.id) return [];
    return (payments || []).filter(
      (p) => String(paymentBookingId(p) || "") === String(booking.id)
    );
  }, [booking?.id, payments]);

  const hasLinkedInvoices = linkedInvoices.length > 0;

  return (
    <ModalShell
      title={hasLinkedInvoices ? "Cannot Delete Booking" : "Delete Booking?"}
      subtitle={
        booking?.customer
          ? `Customer: ${booking.customer}`
          : "Booking Management"
      }
      icon={Trash2}
      onClose={onClose}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] p-5 sm:p-7">
        {hasLinkedInvoices ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <div>
                <p className="text-sm font-extrabold text-amber-950">
                  Linked Financial Invoice Detected
                </p>
                <p className="mt-1 leading-relaxed text-amber-800">
                  This booking has{" "}
                  <strong>{linkedInvoices.length} linked invoice(s)</strong> in
                  the Payments & Billing module:
                </p>
                <ul className="mt-2 list-inside list-disc font-mono text-[11px] text-amber-900">
                  {linkedInvoices.map((inv) => (
                    <li key={inv.id}>
                      {inv.invoice || inv.transaction_id || inv.id} — Total:{" "}
                      {money(inv.total || inv.total_amount)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 leading-relaxed text-amber-800">
                  To protect financial consistency and accounting audit trails,
                  direct deletion is blocked. Please resolve or unlink the
                  associated payment record before deleting this booking.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dce8f8] bg-white p-4 text-xs">
              <p className="font-bold text-[#173f74]">Booking Details:</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[#526d8d]">
                <div>
                  <span className="font-medium">Booking ID:</span>{" "}
                  <b className="text-[#10264d]">{booking.id}</b>
                </div>
                <div>
                  <span className="font-medium">Customer:</span>{" "}
                  <b className="text-[#10264d]">{booking.customer}</b>
                </div>
                <div>
                  <span className="font-medium">Service:</span>{" "}
                  <b className="text-[#10264d]">{formatBookingService(booking)}</b>
                </div>
                <div>
                  <span className="font-medium">Date:</span>{" "}
                  <b className="text-[#10264d]">{formatDate(booking.date)}</b>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
              <p className="text-sm font-bold text-rose-950">
                Are you sure you want to permanently delete this booking?
              </p>
              <p className="mt-1 leading-relaxed text-rose-800">
                This action is irreversible and will remove this booking schedule
                and any assigned crew from your calendar.
              </p>
            </div>

            <div className="rounded-2xl border border-[#dce8f8] bg-white p-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-[#526d8d]">
                <div>
                  <span className="font-semibold">Booking ID:</span>
                  <p className="font-bold text-[#10264d]">{booking.id}</p>
                </div>
                <div>
                  <span className="font-semibold">Customer:</span>
                  <p className="font-bold text-[#10264d]">{booking.customer}</p>
                </div>
                <div>
                  <span className="font-semibold">Service:</span>
                  <p className="font-bold text-[#10264d]">{formatBookingService(booking)}</p>
                </div>
                <div>
                  <span className="font-semibold">Date & Time:</span>
                  <p className="font-bold text-[#10264d]">
                    {formatDate(booking.date)} · {formatTime(booking.time)}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Location:</span>
                  <p className="font-bold text-[#10264d]">
                    {booking.location || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t bg-white px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          {hasLinkedInvoices ? "Close" : "Cancel"}
        </button>
        {!hasLinkedInvoices && (
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
          >
            <Trash2 size={15} />
            Delete Booking
          </button>
        )}
      </div>
    </ModalShell>
  );
}

function BookingModal({
  booking,
  bookings = [],
  customers,
  payments,
  onClose,
  onSave,
}) {
  const initial = {
    ...emptyForm,
    ...booking,
    service: booking?.service || "Wedding Photography",
    customService: booking?.customService || booking?.custom_service || "",
    event: booking?.event || (serviceEventTypes[booking?.service]?.[0] || "Traditional Photography"),
    customEvent: booking?.customEvent || booking?.custom_event || "",
    totalAmount: booking?.totalAmount ?? "",
  };

  const [form, setForm] = useState(initial);
  const [staffMembers, setStaffMembers] = useState(() => readStaffMembers());
  const [error, setError] = useState("");

  useEffect(() => {
    const refreshStaff = () => setStaffMembers(readStaffMembers());
    refreshStaff();
    window.addEventListener("storage", refreshStaff);
    window.addEventListener(UPDATE_EVENT, refreshStaff);
    return () => {
      window.removeEventListener("storage", refreshStaff);
      window.removeEventListener(UPDATE_EVENT, refreshStaff);
    };
  }, []);

  const eligibleStaff = useMemo(() => {
    return getStaffForServiceAndEvent(form.service, form.event, staffMembers);
  }, [form.service, form.event, staffMembers]);

  const conflictingStaffSet = useMemo(() => {
    return getConflictingStaffSet(bookings, form.date, form.time, booking?.id);
  }, [bookings, form.date, form.time, booking?.id]);

  const availableStaff = useMemo(() => {
    return eligibleStaff.filter((m) => {
      const name = staffDisplayName(m).trim().toLowerCase();
      const isConflicted =
        conflictingStaffSet.has(String(m.id)) ||
        (m.employee_id && conflictingStaffSet.has(String(m.employee_id))) ||
        conflictingStaffSet.has(name);
      return !isConflicted;
    });
  }, [eligibleStaff, conflictingStaffSet]);

  const assignedStaffName =
    form.photographer && form.photographer !== "Not Assigned"
      ? form.photographer
      : "";

  const assignedStaffMember = useMemo(() => {
    if (!assignedStaffName) return null;
    return staffMembers.find(
      (m) =>
        (form.staffId && String(m.id) === String(form.staffId)) ||
        (form.employeeId &&
          String(m.employee_id) === String(form.employeeId)) ||
        staffDisplayName(m).trim().toLowerCase() ===
          assignedStaffName.trim().toLowerCase()
    );
  }, [assignedStaffName, form.staffId, form.employeeId, staffMembers]);

  const isAssignedUnavailable = useMemo(() => {
    if (!assignedStaffName) return false;
    if (!assignedStaffMember) return true;
    const name = staffDisplayName(assignedStaffMember).trim().toLowerCase();
    return (
      conflictingStaffSet.has(String(assignedStaffMember.id)) ||
      (assignedStaffMember.employee_id &&
        conflictingStaffSet.has(String(assignedStaffMember.employee_id))) ||
      conflictingStaffSet.has(name)
    );
  }, [assignedStaffName, assignedStaffMember, conflictingStaffSet]);

  const handleStaffChange = (selectedVal) => {
    if (!selectedVal || selectedVal === "Not Assigned") {
      setForm((p) => ({
        ...p,
        photographer: "Not Assigned",
        staffId: "",
        employeeId: "",
        staffRole: "",
        staffDepartment: "",
      }));
      return;
    }
    const chosen = staffMembers.find(
      (m) =>
        String(m.id) === String(selectedVal) ||
        String(m.employee_id) === String(selectedVal)
    );
    if (chosen) {
      setForm((p) => ({
        ...p,
        photographer: staffDisplayName(chosen),
        staffId: String(chosen.id),
        employeeId: chosen.employee_id || "",
        staffRole: chosen.specialization || chosen.role || "",
        staffDepartment: chosen.service || chosen.department || "",
      }));
    }
  };

  const financials = booking?.id ? financialsFor(booking, payments) : null;
  const update = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setError("");
  };

  const changeService = (service) => {
    const nextEvents = serviceEventTypes[service] || [];
    const nextEvent = nextEvents[0] || "";
    const nextEligible = getStaffForServiceAndEvent(
      service,
      nextEvent,
      staffMembers
    );
    const isCurrentStillEligible =
      form.photographer &&
      form.photographer !== "Not Assigned" &&
      nextEligible.some(
        (m) =>
          (form.staffId && String(m.id) === String(form.staffId)) ||
          (form.employeeId &&
            String(m.employee_id) === String(form.employeeId)) ||
          staffDisplayName(m).trim().toLowerCase() ===
            form.photographer.trim().toLowerCase()
      );

    setForm((p) => ({
      ...p,
      service,
      customService: service === "Others" ? p.customService : "",
      event: nextEvent,
      customEvent: "",
      ...(!isCurrentStillEligible
        ? {
            photographer: "Not Assigned",
            staffId: "",
            employeeId: "",
            staffRole: "",
            staffDepartment: "",
          }
        : {}),
    }));
  };

  const selectCustomer = (id) => {
    const c = customers.find((x) => String(x.id) === String(id));
    if (!c) {
      setForm((p) => ({ ...p, customerId: "" }));
      return;
    }
    const custService = services.includes(c.service) ? c.service : form.service;
    const custEvents = serviceEventTypes[custService] || [];
    const custEvent = custEvents.includes(c.event)
      ? c.event
      : custEvents[0] || form.event;
    setForm((p) => ({
      ...p,
      customerId: String(c.id),
      customer: customerName(c),
      phone: customerPhone(c),
      location: c.address || p.location || "",
      service: custService,
      event: custEvent,
    }));
  };

  // Requirement: Show Invoice Form for Pending, Confirmed, Completed; hide ONLY for Cancelled.
  const isInvoiceEligible = ![
    "cancelled",
    "canceled",
  ].includes(String(form.status || "").toLowerCase());

  const submit = (e) => {
    e.preventDefault();
    const name = String(form.customer || "").trim();
    const phone = normalizePhone(form.phone);
    if (!name) return setError("Enter customer name.");
    if (phone.length !== 10)
      return setError("Enter valid 10-digit phone number.");
    if (!parseDate(form.date) || !form.time)
      return setError("Select valid booking date and time.");

    if (form.service === "Others" && !form.customService?.trim()) {
      return setError("Enter your service name.");
    }

    if (isOtherEventType(form.service, form.event) && !form.customEvent?.trim()) {
      if (form.service === "Wedding Photography") return setError("Enter photography type.");
      if (form.service === "Wedding Videography") return setError("Enter videography type.");
      if (form.service === "Functions We Arrange") return setError("Enter function type.");
      if (form.service === "Event Management") return setError("Enter event management type.");
      if (form.service === "Customer Gifts") return setError("Enter gift type.");
      return setError("Enter custom event type.");
    }

    const tot = amount(form.totalAmount);
    const adv = amount(form.advance);

    if (isInvoiceEligible) {
      if (tot < 0 || adv < 0) return setError("Enter valid invoice amount.");
      if (adv > tot)
        return setError("Advance cannot be greater than total amount.");
    }

    let invNumber = String(form.invoiceNumber || "").trim();
    if (isInvoiceEligible && !invNumber) {
      invNumber = `SRP-${new Date().getFullYear()}-${Math.floor(
        10000 + Math.random() * 90000
      )}`;
    }

    const match =
      customers.find(
        (c) => String(c.id) === String(form.customerId) && form.customerId
      ) || customers.find((c) => customerPhone(c) === phone);

    onSave({
      ...form,
      invoiceNumber: isInvoiceEligible ? invNumber : form.invoiceNumber || "",
      customerId: match ? String(match.id) : "",
      customer: name,
      phone,
      totalAmount: tot,
      advance: isInvoiceEligible ? adv : 0,
      customService: form.service === "Others" ? (form.customService?.trim() || "") : "",
      customEvent: isOtherEventType(form.service, form.event) ? (form.customEvent?.trim() || "") : "",
    });
  };

  const currentSelectValue = useMemo(() => {
    if (!form.photographer || form.photographer === "Not Assigned")
      return "Not Assigned";
    const found = availableStaff.find(
      (m) =>
        (form.staffId && String(m.id) === String(form.staffId)) ||
        (form.employeeId &&
          String(m.employee_id) === String(form.employeeId)) ||
        staffDisplayName(m).trim().toLowerCase() ===
          form.photographer.trim().toLowerCase()
    );
    if (found) return String(found.id);
    if (assignedStaffMember) return String(assignedStaffMember.id);
    return form.staffId || form.photographer;
  }, [
    form.photographer,
    form.staffId,
    form.employeeId,
    availableStaff,
    assignedStaffMember,
  ]);

  return (
    <ModalShell
      title={booking?.id ? "Edit Booking" : "New Booking"}
      subtitle="Booking details and invoice form"
      icon={CalendarPlus}
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fbff] px-5 py-6 sm:px-7">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <Link2 size={14} />
              Select Existing Customer
            </span>
            <select
              value={form.customerId || ""}
              onChange={(e) => selectCustomer(e.target.value)}
              className={inputClass}
            >
              <option value="">Select customer / Enter manually</option>
              {customers.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {customerName(c)} - {customerPhone(c)}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <UserRound size={14} />
              Customer Name
            </span>
            <input
              className={inputClass}
              type="text"
              required
              value={form.customer || ""}
              onChange={(e) => {
                setForm((p) => ({
                  ...p,
                  customer: e.target.value,
                  customerId: "",
                }));
                setError("");
              }}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <Phone size={14} />
              Phone Number
            </span>
            <input
              className={inputClass}
              type="tel"
              required
              value={form.phone || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((p) => ({ ...p, phone: val, customerId: "" }));
                setError("");
              }}
            />
          </label>

          {/* MAIN SERVICE SELECTION */}
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <Camera size={14} />
              Service
            </span>
            <select
              className={inputClass}
              value={form.service}
              onChange={(e) => changeService(e.target.value)}
            >
              {services.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          {/* DYNAMIC SERVICE OR EVENT TYPE */}
          {form.service === "Others" ? (
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                <Camera size={14} />
                Enter Service <span className="text-red-500">*</span>
              </span>
              <input
                className={inputClass}
                type="text"
                required
                placeholder="Enter your service name"
                value={form.customService || ""}
                onChange={(e) => update("customService", e.target.value)}
              />
            </label>
          ) : (
            <>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                  <ClipboardList size={14} />
                  Event Type
                </span>
                <select
                  className={inputClass}
                  value={form.event}
                  onChange={(e) => {
                    const nextEv = e.target.value;
                    setForm((p) => ({
                      ...p,
                      event: nextEv,
                      customEvent: isOtherEventType(p.service, nextEv) ? p.customEvent : "",
                    }));
                  }}
                >
                  {(serviceEventTypes[form.service] || []).map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>

              {isOtherEventType(form.service, form.event) && (
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                    <ClipboardList size={14} />
                    {form.service === "Wedding Photography"
                      ? "Enter Photography Type"
                      : form.service === "Wedding Videography"
                      ? "Enter Videography Type"
                      : form.service === "Functions We Arrange"
                      ? "Enter Function Type"
                      : form.service === "Event Management"
                      ? "Enter Event Management Type"
                      : "Enter Gift Type"}{" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <input
                    className={inputClass}
                    type="text"
                    required
                    placeholder={
                      form.service === "Wedding Photography"
                        ? "Enter photography type"
                        : form.service === "Wedding Videography"
                        ? "Enter videography type"
                        : form.service === "Functions We Arrange"
                        ? "Enter function type"
                        : form.service === "Event Management"
                        ? "Enter event management type"
                        : "Enter gift type"
                    }
                    value={form.customEvent || ""}
                    onChange={(e) => update("customEvent", e.target.value)}
                  />
                </label>
              )}
            </>
          )}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <CalendarDays size={14} />
              Booking Date
            </span>
            <input
              className={inputClass}
              type="date"
              required
              value={normalizeDate(form.date) || ""}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>

          {/* BOOKING TIME WITH 12-HOUR AM/PM PICKER */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <Clock3 size={14} />
              Booking Time
            </label>
            <TimePicker
              value={form.time || "10:00"}
              onChange={(newTime) => update("time", newTime)}
            />
          </div>

          {/* FREE TEXT LOCATION INPUT */}
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <MapPin size={14} />
              Location
            </span>
            <input
              className={inputClass}
              type="text"
              placeholder="Enter event location"
              value={form.location || ""}
              onChange={(e) => update("location", e.target.value)}
            />
          </label>

          {/* Dynamic Staff Assignment Field */}
          <div className="space-y-2">
            {isAssignedUnavailable && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
                <div>
                  <p className="font-bold">Staff Availability Warning</p>
                  <p className="mt-0.5 text-amber-800">
                    Assigned staff member ({form.photographer}) has an
                    overlapping booking or is unavailable for this date/time.
                  </p>
                </div>
              </div>
            )}
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                <Camera size={14} />
                Assigned Staff Member
              </span>
              <select
                className={inputClass}
                value={currentSelectValue}
                onChange={(e) => handleStaffChange(e.target.value)}
              >
                <option value="Not Assigned">Not Assigned</option>
                {/* Preserve assigned staff if not in current available list */}
                {form.photographer &&
                  form.photographer !== "Not Assigned" &&
                  !availableStaff.some(
                    (m) => String(m.id) === currentSelectValue
                  ) && (
                    <option value={currentSelectValue}>
                      {form.photographer}
                      {form.staffRole ? ` – ${form.staffRole}` : ""}{" "}
                      {isAssignedUnavailable ? "(Unavailable Slot)" : "(Assigned)"}
                    </option>
                  )}
                {availableStaff.length === 0 &&
                (!form.photographer || form.photographer === "Not Assigned") ? (
                  <option value="" disabled>
                    No available staff for this service
                  </option>
                ) : (
                  availableStaff.map((member) => (
                    <option key={member.id} value={String(member.id)}>
                      {staffDisplayName(member)} –{" "}
                      {member.specialization || member.role || "Staff"}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          {/* Booking Status */}
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
              <CheckCircle2 size={14} />
              Booking Status
            </span>
            <select
              className={inputClass}
              value={form.status || "Confirmed"}
              onChange={(e) => update("status", e.target.value)}
            >
              {statuses.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>

          {/* Invoice Form: Shown for Pending, Confirmed, Completed; Hidden ONLY for Cancelled */}
          {isInvoiceEligible ? (
            <section className="space-y-4 rounded-2xl border border-[#cbdcf2] bg-white p-4 sm:p-5">
              <div>
                <p className="text-sm font-black text-[#173f74]">Invoice Form</p>
                <p className="mt-1 text-xs text-[#7890ac]">
                  Booking invoice and advance payment details
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#38506f]">
                  Invoice Number
                </span>
                <input
                  className={inputClass}
                  value={form.invoiceNumber || ""}
                  placeholder="Auto generate if empty"
                  onChange={(e) => update("invoiceNumber", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#38506f]">
                  Invoice Date
                </span>
                <input
                  className={inputClass}
                  type="date"
                  value={normalizeDate(form.invoiceDate) || ""}
                  onChange={(e) => update("invoiceDate", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                  <IndianRupee size={14} />
                  Total Invoice Amount (₹)
                </span>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount ?? ""}
                  onChange={(e) => update("totalAmount", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                  <IndianRupee size={14} />
                  Advance Received (₹)
                </span>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.advance ?? ""}
                  onChange={(e) => update("advance", e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-[#38506f]">
                  Payment Method
                </span>
                <select
                  className={inputClass}
                  value={form.paymentMethod || "Cash"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                >
                  {[
                    "Cash",
                    "UPI",
                    "Card",
                    "Bank Transfer",
                    "Cheque",
                    "Other",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#edf5ff] p-3">
                  <p className="text-[10px] text-[#7890ac]">Received</p>
                  <p className="mt-1 font-black text-[#173f74]">
                    {money(form.advance)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#fff4df] p-3">
                  <p className="text-[10px] text-[#9b7a43]">Balance</p>
                  <p className="mt-1 font-black text-[#9b6416]">
                    {money(
                      Math.max(
                        0,
                        amount(form.totalAmount) - amount(form.advance)
                      )
                    )}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-[#cbdcf2] bg-[#f0f4fa]/80 p-4 text-xs font-bold text-[#6485ac]">
              <Info size={16} className="shrink-0 text-[#4975a8]" />
              <span>
                Invoice form is disabled for Cancelled bookings. Select
                Pending, Confirmed, or Completed status to enable invoice
                generation.
              </span>
            </div>
          )}

          {booking?.id && (
            <PaymentSummary booking={booking} financials={financials} />
          )}
          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-6 py-3 text-sm font-bold text-[#5b7190]"
          >
            Cancel
          </button>
          <button type="submit" className={buttonClass}>
            <Save size={17} />
            Save Booking
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function InvoicePreview({ booking, invoice, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const total = amount(invoice?.total ?? booking?.totalAmount);
  const received = paymentReceived(invoice || {});
  const balance = Math.max(0, total - received);
  const invoiceNo =
    invoice?.invoice ||
    invoice?.transaction_id ||
    booking?.invoiceNumber ||
    `SRP-${booking?.id || Date.now()}`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await generateInvoicePdf(invoice || { ...booking, total }, {
        booking,
        action: "download",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await generateInvoicePdf(invoice || { ...booking, total }, {
        booking,
        action: "print",
      });
    } finally {
      setPrinting(false);
    }
  };

  const serviceName = formatBookingService(booking || invoice);

  return (
    <ModalShell
      title="Booking Invoice"
      subtitle={`Invoice ${invoiceNo}`}
      icon={IndianRupee}
      onClose={onClose}
    >
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8fbff] p-4 sm:p-6">
        <div
          id="sr-booking-invoice"
          className="overflow-hidden rounded-2xl border border-[#dce8f8] bg-white shadow-sm text-[#173f74]"
        >
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#c5a059] bg-[#10264d] p-5 text-white">
            <div className="flex items-center gap-3">
              <img
                src={studioLogoUrl}
                alt="Studio Raw Picturez"
                className="h-12 w-12 rounded-xl object-contain bg-white/10 p-1"
              />
              <div>
                <p className="text-base font-extrabold tracking-wide text-white">
                  STUDIO RAW PICTUREZ
                </p>
                <p className="text-[10px] font-semibold text-[#b8d1f7]">
                  PHOTOGRAPHY | EVENTS | CREATIVE SERVICES
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="inline-block rounded-md bg-[#285a99] px-2.5 py-1 text-[11px] font-black uppercase text-white tracking-widest">
                TAX INVOICE
              </span>
              <p className="mt-1 text-xs font-bold text-white">
                <b>Invoice:</b> {invoiceNo}
              </p>
              <p className="mt-0.5 text-[11px] text-[#b8d1f7]">
                <b>Date:</b>{" "}
                {formatDate(
                  invoice?.date || booking?.invoiceDate || booking?.createdAt
                )}
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#dce8f8] bg-[#f8fbff] p-3.5">
                <p className="text-[10px] font-extrabold uppercase text-[#285a99]">
                  Bill To
                </p>
                <p className="mt-1 text-sm font-black text-[#10264d]">
                  {booking?.customer || invoice?.customer || "—"}
                </p>
                <p className="text-[#647c9d] mt-0.5">
                  Phone: {booking?.phone || invoice?.phone || "—"}
                </p>
                {booking?.location && (
                  <p className="text-[#647c9d] mt-0.5">
                    Location: {booking.location}
                  </p>
                )}
              </div>
              <div className="rounded-xl border border-[#dce8f8] bg-[#f8fbff] p-3.5">
                <p className="text-[10px] font-extrabold uppercase text-[#285a99]">
                  Booking Reference
                </p>
                <p className="mt-1 font-bold text-[#10264d]">
                  Ref: {booking?.id || "Direct Billing"}
                </p>
                <p className="text-[#647c9d] mt-0.5">
                  Service: {serviceName}
                </p>
                <p className="text-[#647c9d] mt-0.5">
                  Shoot Date: {formatDate(booking?.date)}
                </p>
              </div>
            </div>

            {/* Service Row */}
            <div className="overflow-hidden rounded-xl border border-[#dce8f8]">
              <div className="flex justify-between bg-[#edf5ff] px-4 py-2.5 text-[11px] font-extrabold text-[#173f74]">
                <span>Description & Service</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between p-4 text-xs border-t border-[#edf5ff]">
                <div>
                  <p className="font-extrabold text-sm text-[#10264d]">
                    {serviceName}
                  </p>
                  <p className="text-[#647c9d] mt-0.5">
                    Schedule: {formatDate(booking?.date)} · {formatTime(booking?.time)}
                  </p>
                </div>
                <p className="text-sm font-black text-[#10264d]">{money(total)}</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-[#e8eff8] pt-4 text-xs">
              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 font-extrabold text-[11px] ${
                    balance <= 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : received > 0
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  Status:{" "}
                  {balance <= 0
                    ? "PAID IN FULL"
                    : received > 0
                    ? "PARTIALLY PAID"
                    : "PENDING / UNPAID"}
                </span>
                <p className="mt-2 text-[#7890ac] text-[11px]">
                  Mode:{" "}
                  {invoice?.method ||
                    invoice?.payment_method ||
                    booking?.paymentMethod ||
                    "Cash"}
                </p>
              </div>
              <div className="w-full sm:w-64 space-y-2 rounded-xl bg-[#f8fbff] border border-[#dce8f8] p-3">
                <div className="flex justify-between">
                  <span>Total Amount</span>
                  <b>{money(total)}</b>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Total Received</span>
                  <b>{money(received)}</b>
                </div>
                <div className="flex justify-between border-t border-[#dce8f8] pt-1.5 text-amber-800 text-sm font-black">
                  <span>Pending Balance</span>
                  <b>{money(balance)}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t bg-white p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border px-5 py-3 text-sm font-bold text-[#55779e]"
        >
          Close
        </button>
        <button
          type="button"
          onClick={handlePrint}
          disabled={printing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#285a99] bg-white px-5 py-3 text-sm font-bold text-[#285a99] hover:bg-[#edf5ff]"
        >
          <Printer size={17} />
          {printing ? "Preparing..." : "Print"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={buttonClass}
        >
          <Download size={17} />
          {downloading ? "Generating..." : "Download Invoice (PDF)"}
        </button>
      </div>
    </ModalShell>
  );
}

function DateBookingsModal({
  date,
  bookings,
  financialMap,
  onClose,
  onEdit,
  onNew,
}) {
  return (
    <ModalShell
      title="Booked Customer Details"
      subtitle={`${formatDate(date)} · ${bookings.length} bookings`}
      icon={CalendarCheck2}
      onClose={onClose}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#f8fbff] p-4 sm:p-6">
        {bookings.map((b, i) => (
          <div key={b.id} className="rounded-2xl border border-[#dce8f8] bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-extrabold text-[#8a9fba]">
                  BOOKING {i + 1}
                </p>
                <h3 className="mt-1 font-black text-[#173f74]">{b.customer}</h3>
              </div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mt-4 space-y-2">
              {[
                ["Phone", b.phone],
                ["Service", formatBookingService(b)],
                ["Date", formatDate(b.date)],
                ["Time", formatTime(b.time)],
                ["Location", b.location],
                ["Photographer", b.photographer],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-[#e5edf8] py-2 text-xs"
                >
                  <span className="text-[#7890ac]">{label}</span>
                  <strong className="text-right text-[#173f74]">
                    {value || "—"}
                  </strong>
                </div>
              ))}
            </div>
            <PaymentSummary
              booking={b}
              financials={financialMap.get(String(b.id))}
            />
            <button
              type="button"
              onClick={() => onEdit(b)}
              className={`${buttonClass} mt-4 w-full`}
            >
              <Pencil size={16} />
              Edit Booking
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t bg-white p-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border px-5 py-3 text-sm font-bold"
        >
          Close
        </button>
        <button type="button" onClick={onNew} className={buttonClass}>
          <Plus size={17} />
          Add Another Booking
        </button>
      </div>
    </ModalShell>
  );
}

function mapBooking(b) {
  return {
    id: b.id,
    customerId: b.customer ?? b.customerId ?? "",
    customer:
      b.customer_name ||
      b.customerName ||
      (typeof b.customer === "string" && !/^\d+$/.test(b.customer)
        ? b.customer
        : "") ||
      "Customer",
    phone: b.phone || "",
    service: b.service || b.service_type || "Wedding Photography",
    customService: b.customService || b.custom_service || "",
    event: b.event_type || b.event || "Traditional Photography",
    customEvent: b.customEvent || b.custom_event || "",
    date: b.event_date || b.date || "",
    time: b.time || "10:00",
    location: b.location || "",
    photographer: b.photographer || "Not Assigned",
    staffId: b.staffId || b.staff_id || "",
    employeeId: b.employeeId || b.employee_id || "",
    staffRole: b.staffRole || b.staff_role || "",
    staffDepartment: b.staffDepartment || b.staff_department || "",
    isManualBooking: b.isManualBooking ?? true,
    totalAmount: amount(b.total_amount ?? b.totalAmount),
    status: b.status || "Pending",
    createdAt: b.created_at || b.createdAt || "",
    updatedAt: b.updated_at || b.updatedAt || "",
  };
}

const readManualBookings = () =>
  readArray(STORAGE_KEY).filter(
    (b) => !String(b.id || "").startsWith("BOOK-ENQ-")
  );

export default function BookingCalendar() {
  const [bookings, setBookings] = useState(() => readManualBookings());
  const [customers, setCustomers] = useState(() => readArray(CUSTOMER_KEY));
  const [payments, setPayments] = useState(() => readArray(PAYMENT_KEY));
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setCustomers(readArray(CUSTOMER_KEY));
    setBookings(readManualBookings());
    setPayments(readArray(PAYMENT_KEY));

    try {
      const res = await api.bookings.list();
      const items = Array.isArray(res) ? res : res?.results;
      if (Array.isArray(items) && items.length) {
        const local = readManualBookings();
        const byId = new Map(local.map((b) => [String(b.id), b]));
        for (const item of items) {
          const old = byId.get(String(item.id)) || {};
          byId.set(String(item.id), {
            ...old,
            ...mapBooking(item),
            customer:
              item.customer_name || old.customer || mapBooking(item).customer,
          });
        }
        const merged = [...byId.values()];
        setBookings(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn("Bookings API unavailable:", e);
    }

    try {
      const res = await api.payments.list();
      const items = Array.isArray(res) ? res : res?.results;
      if (Array.isArray(items)) {
        const merged = mergeRemotePayments(readArray(PAYMENT_KEY), items);
        setPayments(merged);
        localStorage.setItem(PAYMENT_KEY, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn("Payments API unavailable:", e);
    }
  }, []);

  useEffect(() => {
    syncEnquiriesToBookings();
    refresh();
    const onChange = () => {
      setCustomers(readArray(CUSTOMER_KEY));
      setBookings(readManualBookings());
      setPayments(readArray(PAYMENT_KEY));
    };
    const onFocus = () => {
      refresh();
    };
    window.addEventListener(UPDATE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const commit = (next) => {
    try {
      writeArray(STORAGE_KEY, next);
      setBookings(next);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const financialMap = useMemo(
    () => new Map(bookings.map((b) => [String(b.id), financialsFor(b, payments)])),
    [bookings, payments]
  );

  const stats = [
    ["Total Bookings", bookings.length, CalendarDays],
    [
      "Confirmed",
      bookings.filter((b) => String(b.status).toLowerCase() === "confirmed")
        .length,
      CalendarCheck2,
    ],
    [
      "Pending",
      bookings.filter((b) => String(b.status).toLowerCase() === "pending")
        .length,
      Clock3,
    ],
    [
      "Completed",
      bookings.filter((b) => String(b.status).toLowerCase() === "completed")
        .length,
      CheckCircle2,
    ],
  ];

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          [
            b.customer,
            b.phone,
            b.event,
            b.customEvent,
            b.service,
            b.customService,
            b.location,
            b.photographer,
            b.id,
          ].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(search.trim().toLowerCase())
          ) &&
          (filter === "All" ||
            String(b.status || "").toLowerCase() === filter.toLowerCase())
      ),
    [bookings, search, filter]
  );

  const bookingMap = useMemo(() => {
    const m = new Map();
    for (const b of bookings) {
      const d = parseDate(b.date);
      if (!d) continue;
      const key = dateKey(d);
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(b);
    }
    return m;
  }, [bookings]);

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const cells = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const prefix = `${month.getFullYear()}-${String(
    month.getMonth() + 1
  ).padStart(2, "0")}`;

  const monthlyCount = bookings.filter((b) =>
    String(b.date || "").startsWith(prefix)
  ).length;

  const openNew = (date = "") => {
    setEditingBooking({ ...emptyForm, date: normalizeDate(date) });
    setSelectedDate(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditingBooking({
      ...emptyForm,
      ...b,
      service: b.service || "Wedding Photography",
      customService: b.customService || b.custom_service || "",
      event: b.event || "Traditional Photography",
      customEvent: b.customEvent || b.custom_event || "",
    });
    setSelectedDate(null);
    setShowForm(true);
  };

  const openInvoice = (b) => {
    const inv = payments.find(
      (p) => String(paymentBookingId(p) || "") === String(b?.id)
    );
    if (!inv) return;
    setInvoiceBooking(b);
  };

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingBooking(null);
  }, []);

  const saveBooking = async (data) => {
    const now = new Date().toISOString();
    const currentCustomers = readArray(CUSTOMER_KEY);
    const phone = String(data.phone || "").replace(/\D/g, "").slice(-10);
    const customerMatch = currentCustomers.find(
      (c) =>
        (data.customerId && String(c.id) === String(data.customerId)) ||
        (phone && String(c.phone || "").replace(/\D/g, "").slice(-10) === phone)
    );

    let customerId = customerMatch
      ? String(customerMatch.id)
      : data.customerId || "";

    if (!customerMatch && data.customer) {
      customerId = `CUS-${Date.now()}`;
      const newCust = {
        id: customerId,
        name: data.customer.trim(),
        phone: data.phone || "",
        email: "",
        address: data.location || "",
        source: "Booking",
        notes: `Created from Booking: ${formatBookingService(data)}`,
        createdAt: now.slice(0, 10),
        updatedAt: now,
        isDemo: false,
      };
      const nextCusts = [newCust, ...currentCustomers];
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(nextCusts));
      notify(CUSTOMER_KEY);
      setCustomers(nextCusts);
    }

    // Invoice eligible for Pending, Confirmed, Completed; hidden/ineligible only for Cancelled
    const isInvoiceEligible = ![
      "cancelled",
      "canceled",
    ].includes(String(data.status || "").toLowerCase());

    const adv = isInvoiceEligible ? amount(data.advance) : 0;
    const tot = amount(data.totalAmount);
    const bookingPaymentStatus = !isInvoiceEligible
      ? "Unpaid"
      : adv >= tot && tot > 0
      ? "Paid"
      : adv > 0
      ? "Partially Paid"
      : "Unpaid";

    const formattedService = formatBookingService(data);

    const bookingData = {
      ...data,
      customerId,
      totalAmount: tot,
      advance: adv,
      paymentStatus: bookingPaymentStatus,
      service: data.service,
      customService: data.customService || "",
      event: data.event,
      customEvent: data.customEvent || "",
      staffId: data.staffId || "",
      employeeId: data.employeeId || "",
      staffRole: data.staffRole || "",
      staffDepartment: data.staffDepartment || "",
      isManualBooking: true,
    };

    const payload = {
      customer_name: bookingData.customer,
      phone: bookingData.phone,
      service_type: bookingData.service,
      custom_service: bookingData.customService || "",
      event_type: bookingData.event,
      custom_event: bookingData.customEvent || "",
      event_date: bookingData.date || null,
      location: bookingData.location || "",
      total_amount: bookingData.totalAmount || 0,
      status: bookingData.status || "Pending",
      paymentStatus: bookingPaymentStatus,
      notes: bookingData.photographer
        ? `Photographer: ${bookingData.photographer}`
        : "",
      staff_id: bookingData.staffId || null,
      employee_id: bookingData.employeeId || null,
      staff_role: bookingData.staffRole || null,
      staff_department: bookingData.staffDepartment || null,
    };

    const saveInvoice = (bookingId) => {
      // Do not silently delete invoices if cancelled; only save/update when eligible
      if (!isInvoiceEligible) return;
      if (
        !bookingData.invoiceNumber &&
        !bookingData.totalAmount &&
        !bookingData.advance
      )
        return;

      const oldPayments = readArray(PAYMENT_KEY);
      const existing = oldPayments.find(
        (p) => String(paymentBookingId(p) || "") === String(bookingId)
      );
      const pStatus =
        adv >= tot && tot > 0 ? "Paid" : adv > 0 ? "Partial" : "Unpaid";

      const txs =
        adv > 0
          ? [
              {
                id: `TXN-${Date.now()}`,
                amount: adv,
                paidAmount: adv,
                method: bookingData.paymentMethod || "Cash",
                date: bookingData.invoiceDate || now.slice(0, 10),
                status: "Paid",
                note: "Booking Advance / Payment",
              },
            ]
          : [];

      const invoice = {
        ...(existing || {}),
        id: existing?.id || `PAY-${Date.now()}`,
        invoice:
          bookingData.invoiceNumber ||
          existing?.invoice ||
          `SRP-${new Date().getFullYear()}-${Math.floor(
            10000 + Math.random() * 90000
          )}`,
        bookingId,
        booking_id: bookingId,
        customer: bookingData.customer,
        phone: bookingData.phone,
        total: tot,
        paidAmount: adv,
        advance: adv,
        method: bookingData.paymentMethod || "Cash",
        date: bookingData.invoiceDate || now.slice(0, 10),
        status: pStatus,
        paymentStatus: pStatus,
        service: bookingData.service,
        customService: bookingData.customService || "",
        event: bookingData.event,
        customEvent: bookingData.customEvent || "",
        packageName: formattedService,
        transactions:
          existing?.transactions && existing.transactions.length
            ? existing.transactions
            : txs,
      };

      const nextPayments = existing
        ? oldPayments.map((p) =>
            String(p.id) === String(existing.id) ? invoice : p
          )
        : [invoice, ...oldPayments];

      writeArray(PAYMENT_KEY, nextPayments);
      setPayments(nextPayments);
    };

    if (editingBooking?.id) {
      try {
        await api.bookings.update(editingBooking.id, payload);
      } catch (err) {
        console.warn("Backend booking update:", err);
      }
      const updated = { ...editingBooking, ...bookingData, updatedAt: now };
      saveInvoice(updated.id);
      if (
        commit(
          bookings.map((b) =>
            String(b.id) === String(updated.id) ? updated : b
          )
        )
      )
        closeForm();
      return;
    }

    let id = globalThis.crypto?.randomUUID?.() || `BOOK-${Date.now()}`;
    try {
      const remote = await api.bookings.create(payload);
      if (remote?.id) id = remote.id;
    } catch (err) {
      console.warn("Backend booking create:", err);
    }
    saveInvoice(id);
    if (
      commit([{ ...bookingData, id, createdAt: now, updatedAt: now }, ...bookings])
    )
      closeForm();
  };

  const confirmDeleteBooking = async (id) => {
    try {
      await api.bookings.delete(id);
    } catch (err) {
      console.warn("Backend booking delete:", err);
    }
    commit(bookings.filter((b) => String(b.id) !== String(id)));
    setDeleteTarget(null);
  };

  const changeStatus = async (id, status) => {
    const target = bookings.find((b) => String(b.id) === String(id));
    try {
      await api.bookings.update(id, { status });
    } catch (err) {
      console.warn("Backend booking status:", err);
    }
    const updatedBooking = target ? { ...target, status } : null;
    commit(
      bookings.map((b) => (String(b.id) === String(id) ? { ...b, status } : b))
    );

    if (updatedBooking && String(status).toLowerCase() === "confirmed") {
      const currentPayments = readArray(PAYMENT_KEY);
      const linkedPayment = currentPayments.find(
        (p) => String(paymentBookingId(p) ?? "") === String(updatedBooking.id)
      );

      if (!linkedPayment) {
        const pendingInvoice = {
          id: `PAY-${Date.now()}`,
          invoice: updatedBooking.invoiceNumber || `SRP-${Date.now()}`,
          transaction_id: updatedBooking.invoiceNumber || `SRP-${Date.now()}`,
          bookingId: updatedBooking.id,
          booking_id: updatedBooking.id,
          customer: updatedBooking.customer || "Customer",
          customer_name: updatedBooking.customer || "Customer",
          phone: updatedBooking.phone || "",
          total: amount(updatedBooking.totalAmount),
          total_amount: amount(updatedBooking.totalAmount),
          amount: amount(updatedBooking.totalAmount),
          paidAmount: 0,
          paid_amount: 0,
          advance: 0,
          method: updatedBooking.paymentMethod || "Cash",
          payment_method: updatedBooking.paymentMethod || "Cash",
          date: new Date().toISOString().slice(0, 10),
          payment_date: new Date().toISOString().slice(0, 10),
          status: "Pending",
          service: updatedBooking.service || "",
          customService: updatedBooking.customService || "",
          event: updatedBooking.event || "",
          customEvent: updatedBooking.customEvent || "",
          event_type: updatedBooking.event || "",
          packageName: formatBookingService(updatedBooking),
          source: "Booking Confirmation",
        };
        const nextPayments = [pendingInvoice, ...currentPayments];
        writeArray(PAYMENT_KEY, nextPayments);
        setPayments(nextPayments);
      }

      const current = readArray(CUSTOMER_KEY);
      const phone = normalizePhone(updatedBooking.phone);
      const match = current.find(
        (c) =>
          (updatedBooking.customerId &&
            String(c.id) === String(updatedBooking.customerId)) ||
          (phone && customerPhone(c) === phone)
      );
      const customerId =
        match?.id || updatedBooking.customerId || `CUS-${Date.now()}`;
      const customerRecord = {
        ...(match || {}),
        id: customerId,
        name: updatedBooking.customer || customerName(match),
        customerName: updatedBooking.customer || customerName(match),
        phone: updatedBooking.phone || match?.phone || "",
        address: updatedBooking.location || match?.address || "",
        source: match?.source || "Booking",
        status: "Confirmed",
        bookingStatus: "Confirmed",
        bookingId: updatedBooking.id,
        event: updatedBooking.event,
        customEvent: updatedBooking.customEvent || "",
        eventDate: updatedBooking.date,
        service: updatedBooking.service || "",
        customService: updatedBooking.customService || "",
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };
      const nextCustomers = match
        ? current.map((c) =>
            String(c.id) === String(match.id) ? customerRecord : c
          )
        : [customerRecord, ...current];
      writeArray(CUSTOMER_KEY, nextCustomers);
      setCustomers(nextCustomers);
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 text-[#10264d] sm:px-5 lg:px-7">
      <style>{`@keyframes srFloat3D{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}.sr-stat-float{animation:srFloat3D 5.5s ease-in-out infinite}.sr-booking-card{transition:transform .3s,box-shadow .3s}.sr-booking-card:hover{transform:translateY(-4px);box-shadow:0 18px 35px rgba(22,53,96,.12)}@media(prefers-reduced-motion:reduce){.sr-stat-float{animation:none}.sr-booking-card:hover{transform:none}}`}</style>
      <div className="mx-auto max-w-[1800px] space-y-6">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#285a99]"
          >
            <RefreshCw size={17} />
            Refresh Payments
          </button>
          <button
            type="button"
            onClick={() => openNew()}
            className={buttonClass}
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        {notice && (
          <div className="flex justify-between rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {notice}
            <button onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([title, value, Icon], i) => (
            <div
              key={title}
              className={`sr-stat-float rounded-[22px] border p-4 shadow-sm sm:p-5 ${
                [
                  "border-blue-200 bg-[#deedff]",
                  "border-purple-200 bg-[#ede3ff]",
                  "border-amber-200 bg-[#fff0cf]",
                  "border-emerald-200 bg-[#dcf8e9]",
                ][i]
              }`}
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-[#526781]">{title}</p>
                  <h2 className="mt-3 text-3xl font-black text-[#10264d]">
                    {value.toLocaleString("en-IN")}
                  </h2>
                  <p className="mt-3 text-[10px] text-[#61758d]">
                    Studio booking overview
                  </p>
                </div>
                <div className="rounded-2xl bg-white/50 p-3 text-[#285a99]">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CALENDAR SECTION */}
        <section className="overflow-hidden rounded-[26px] border border-[#dce6f4] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#e8eef7] bg-gradient-to-r from-[#f1f7ff] via-white to-[#f8f4ff] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#e4efff] p-3 text-[#2e65a7]">
                <CalendarRange size={26} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8298b7]">
                  Photography Calendar
                </p>
                <h2 className="text-2xl font-black text-[#10264d]">
                  {month.toLocaleString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <p className="text-xs text-[#8194ae]">
                  Click booked date to view details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl border bg-white px-3 py-2 text-center">
                <p className="font-black">{monthlyCount}</p>
                <p className="text-[10px] text-[#8a9bb0]">Monthly Bookings</p>
              </div>
              <button
                className="rounded-xl border bg-white p-2"
                onClick={() =>
                  setMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className={buttonClass}
                onClick={() =>
                  setMonth(
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  )
                }
              >
                Today
              </button>
              <button
                className="rounded-xl border bg-white p-2"
                onClick={() =>
                  setMonth(
                    (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-b p-4">
            {statuses.map((s) => (
              <span key={s} className="text-xs font-semibold text-[#657992]">
                <span className="mr-2">●</span>
                {s}
              </span>
            ))}
          </div>
          <div className="bg-[#fcfdff] p-2.5 sm:p-5">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="rounded-xl bg-[#edf4ff] py-3 text-center text-[10px] font-bold text-[#5679a4] sm:text-xs"
                >
                  {d}
                </div>
              ))}
              {cells.map((day, i) => {
                if (!day)
                  return (
                    <div
                      key={`empty-${i}`}
                      className="min-h-[78px] rounded-xl border border-dashed border-[#edf1f7] bg-[#f8faff] sm:min-h-[125px]"
                    />
                  );
                const date = dateKey(
                  new Date(month.getFullYear(), month.getMonth(), day)
                );
                const dayBookings = bookingMap.get(date) || [];
                const isToday = date === dateKey(new Date());
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() =>
                      dayBookings.length
                        ? setSelectedDate(date)
                        : openNew(date)
                    }
                    className={`min-h-[78px] min-w-0 rounded-xl border p-1.5 text-left transition hover:bg-[#f0f7ff] sm:min-h-[125px] sm:p-3 ${
                      isToday
                        ? "border-[#9fbfea] bg-[#eff6ff]"
                        : "border-[#e8edf5] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-lg px-2 py-1 text-xs font-black ${
                          isToday
                            ? "bg-[#285a99] text-white"
                            : "bg-[#f0f5fc] text-[#47617f]"
                        }`}
                      >
                        {day}
                      </span>
                      {dayBookings.length > 0 && (
                        <span className="rounded-lg bg-[#e9f3ff] px-1 text-[9px] font-black text-[#3c6fae]">
                          {dayBookings.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 hidden space-y-1 sm:block">
                      {dayBookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="truncate rounded-md bg-[#e7f0ff] px-2 py-1 text-[10px] font-bold text-[#245da4]"
                        >
                          {b.customer}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <p className="text-[10px]">
                          +{dayBookings.length - 2} more
                        </p>
                      )}
                    </div>
                    {dayBookings.length > 0 && (
                      <div className="mt-2 flex gap-1 sm:hidden">
                        {dayBookings.slice(0, 4).map((b) => (
                          <span
                            key={b.id}
                            className="h-1.5 w-1.5 rounded-full bg-blue-500"
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t bg-[#f9fbff] p-4 text-center text-[11px] text-[#8b9db4]">
            Booked date: view details · Empty date: new booking
          </div>
        </section>

        {/* ALL BOOKINGS TABLE - PRIMARY BOOKING MANAGEMENT (Upcoming Shoots removed) */}
        <section className="overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff]">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#c5ddfb] to-[#edf5ff] p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#557aa9]">
                Booking Management
              </p>
              <h2 className="text-xl font-black text-[#173f74]">
                All Bookings
              </h2>
              <p className="text-xs text-[#6485ac]">
                Manage customer bookings, schedule and crew assignments
              </p>
            </div>
            <ClipboardList size={25} className="text-[#285a99]" />
          </div>
          <div className="flex flex-col gap-3 border-b bg-[#f4f9ff] p-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-[#6685ab]">
              {filtered.length} bookings found
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search bookings by customer, phone, service..."
                  className={`${inputClass} pl-10`}
                />
              </div>
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`${inputClass} pl-10`}
                >
                  <option value="All">All Status</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1150px] text-left">
              <thead>
                <tr className="bg-[#e1eeff] text-[11px] font-black uppercase text-[#557ba9]">
                  {[
                    "Customer",
                    "Service & Event",
                    "Date & Time",
                    "Location",
                    "Photographer",
                    "Payment",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => {
                  const f = financialMap.get(String(b.id));
                  const hasInvoice = Boolean(
                    f?.invoices && f.invoices.length > 0
                  );
                  return (
                    <tr
                      key={b.id}
                      className={i % 2 ? "bg-[#edf5ff]" : "bg-[#f8fbff]"}
                    >
                      <td className="px-4 py-4">
                        <p className="text-xs font-black text-[#173f74]">
                          {b.customer}
                        </p>
                        <p className="text-[11px] text-[#8a9fba]">{b.phone}</p>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        <p className="font-extrabold text-[#173f74]">
                          {formatBookingService(b)}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs">
                        {formatDate(b.date)}
                        <p className="text-[#8a9fba]">{formatTime(b.time)}</p>
                      </td>
                      <td className="px-4 py-4 text-xs">{b.location || "—"}</td>
                      <td className="px-4 py-4 text-xs">{b.photographer}</td>
                      <td className="px-4 py-4">
                        {hasInvoice ? (
                          <button
                            type="button"
                            onClick={() => openInvoice(b)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
                          >
                            <Download size={14} />
                            Download Invoice
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#8a9fba]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={b.status || "Pending"}
                          onChange={(e) => changeStatus(b.id, e.target.value)}
                          className="rounded-xl border bg-white px-2 py-2 text-xs"
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            title="Edit Booking"
                            onClick={() => openEdit(b)}
                            className="rounded-xl border bg-white p-2 text-[#356cae] hover:bg-[#edf5ff]"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            title="Delete Booking"
                            onClick={() => setDeleteTarget(b)}
                            className="rounded-xl border border-rose-100 bg-white p-2 text-[#d65c72] hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((b, i) => (
              <BookingCard
                key={b.id}
                booking={b}
                index={i}
                onEdit={openEdit}
                onDelete={(target) => setDeleteTarget(target)}
                onStatus={changeStatus}
                onInvoice={openInvoice}
                financials={financialMap.get(String(b.id))}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="p-12 text-center text-sm text-[#6685ab]">
              {bookings.length === 0
                ? "No bookings scheduled yet."
                : "No bookings found"}
            </div>
          )}
          <div className="border-t bg-[#eaf3ff] p-4 text-xs text-[#6685ab]">
            Showing {filtered.length} of {bookings.length} bookings
          </div>
        </section>

        <p className="pb-3 text-center text-[11px] text-[#9aabc0]">
          Studio Raw Picturez · Booking Management
        </p>
      </div>

      {selectedDate && (
        <DateBookingsModal
          date={selectedDate}
          bookings={bookingMap.get(selectedDate) || []}
          financialMap={financialMap}
          onClose={() => setSelectedDate(null)}
          onEdit={openEdit}
          onNew={() => openNew(selectedDate)}
        />
      )}

      {showForm && (
        <BookingModal
          booking={editingBooking}
          bookings={bookings}
          customers={customers}
          payments={payments}
          onClose={closeForm}
          onSave={saveBooking}
        />
      )}

      {invoiceBooking && (
        <InvoicePreview
          booking={invoiceBooking}
          invoice={payments.find(
            (p) =>
              String(paymentBookingId(p) || "") === String(invoiceBooking.id)
          )}
          onClose={() => setInvoiceBooking(null)}
        />
      )}

      {deleteTarget && (
        <DeleteBookingModal
          booking={deleteTarget}
          payments={payments}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteBooking}
        />
      )}
    </div>
  );
}
