import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../api/client";
import {
  UserRound,
  ContactRound,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  ShieldCheck,
  ArrowRight,
  PackageCheck,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

/* =========================================
   STORAGE & CONSTANTS
========================================= */

const STORAGE_KEY = "studio_raw_customers";
const ENQUIRY_KEY = "studioraw_enquiries";
const PAYMENT_KEY = "studioraw_payments";
const BOOKING_KEY = "studioraw_bookings";
const DELIVERY_KEY = "studioraw_deliveries";
const SELECTION_KEY = "studioraw_photo_selections";
const UPDATE_EVENT = "studioraw:data-updated";
const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const fieldClass =
  "w-full rounded-2xl border border-[#dfe7f2] bg-white px-4 py-3.5 text-[13px] font-medium text-[#102b53] outline-none transition focus:border-[#3265a8] focus:ring-[3px] focus:ring-[#e5efff]";

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/* =========================================
   DATA UTILITIES
========================================= */

function readStoredArray(key) {
  try {
    const p = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(p)) return p;
    for (const k of [
      "data",
      "records",
      "items",
      "list",
      "customers",
      "payments",
      "bookings",
      "results",
      "enquiries",
    ]) {
      if (Array.isArray(p?.[k])) return p[k];
    }
  } catch {}
  return [];
}

function notifyDataUpdated(key = STORAGE_KEY) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, { detail: { key, module: "customers" } })
  );
}

function normalizePhone(v) {
  return String(v ?? "")
    .replace(/\D/g, "")
    .slice(-10);
}

function num(v) {
  const n = Number(String(v ?? 0).replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function money(v) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num(v));
}

function getCity(v) {
  return String(v || "").split(",")[0].trim() || "Not specified";
}

function getLocationDisplay(v) {
  const text = String(v || "").trim();
  return text || "Not specified";
}

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(String(v).slice(0, 10) + "T12:00:00");
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function initials(v) {
  return String(v || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] || "")
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

function avatarColor(name) {
  return avatarColors[
    String(name || "")
      .split("")
      .reduce((s, c) => s + c.charCodeAt(0), 0) % avatarColors.length
  ];
}

function recordMatchesCustomer(record, customer) {
  const cid = String(customer?.id ?? "").trim();
  const linked =
    record?.customerId ??
    record?.customer_id ??
    record?.clientId ??
    (typeof record?.customer === "object" ? record.customer?.id : record?.customer);

  if (linked !== undefined && linked !== null && String(linked).trim()) {
    if (cid && String(linked) === cid) return true;
    if (
      typeof linked !== "string" ||
      !Number.isNaN(Number(linked)) ||
      String(linked).startsWith("CUS")
    )
      return false;
  }

  const phone = normalizePhone(customer?.phone);
  const recordPhone = normalizePhone(
    record?.phone ??
      record?.customerPhone ??
      record?.customer_phone ??
      record?.mobile ??
      record?.contactNumber
  );

  return Boolean(phone && phone.length === 10 && recordPhone === phone);
}

function loadCustomers() {
  const existing = readStoredArray(STORAGE_KEY);
  return Array.isArray(existing) ? existing : [];
}

function isCustomerEligible(customer, enquiries = [], bookings = [], payments = []) {
  if (!customer) return false;
  if (
    customer.source &&
    !["Enquiry", "demo", "Demo"].includes(customer.source) &&
    !customer.isDemo &&
    !customer.enquiryId
  )
    return true;

  const cid = String(customer.id || "");
  const cPhone = normalizePhone(customer.phone);
  const matchingEnq = enquiries.find(
    (e) =>
      (cid && String(e.customerId) === cid) ||
      (customer.enquiryId != null && String(e.id) === String(customer.enquiryId)) ||
      (cPhone.length === 10 && normalizePhone(e.number || e.phone) === cPhone)
  );

  if (matchingEnq) {
    return String(matchingEnq.status || "").toLowerCase() === "confirmed";
  }

  if (hasCustomerLinkedRecords(customer, payments, bookings)) return true;
  if (customer.isConfirmedCustomer) return true;
  return false;
}

function paymentReceived(p) {
  if (Array.isArray(p.transactions) && p.transactions.length) {
    return p.transactions.reduce((sum, t) => {
      const status = String(t.status || "").toLowerCase();
      if (["failed", "cancelled", "canceled"].includes(status)) return sum;
      const n = num(t.amount ?? t.paidAmount ?? t.received);
      return (
        sum +
        (["refunded", "refund"].includes(status) ||
        String(t.type || "").toLowerCase() === "refund"
          ? -n
          : n)
      );
    }, 0);
  }
  return num(
    p.paidAmount ??
      p.paid_amount ??
      p.amountPaid ??
      p.receivedAmount ??
      p.received_amount ??
      p.amountReceived ??
      p.totalPaid ??
      p.paid ??
      p.advance ??
      p.advanceAmount
  );
}

function paymentTotal(p) {
  return num(
    p.total ??
      p.totalAmount ??
      p.total_amount ??
      p.grandTotal ??
      p.packageAmount ??
      p.bookingAmount ??
      p.amount
  );
}

function getBookingId(p) {
  const value = p.bookingId ?? p.booking_id ?? p.booking;
  return typeof value === "object" ? value?.id : value;
}

function financialsForCustomer(customer, bookings, payments) {
  const linkedBookings = bookings.filter((b) => recordMatchesCustomer(b, customer));
  const bookingIds = new Set(linkedBookings.map((b) => String(b.id)));
  const linkedPayments = payments.filter((p) => {
    const bid = getBookingId(p);
    if (bid !== undefined && bid !== null && String(bid) !== "")
      return bookingIds.has(String(bid));
    return recordMatchesCustomer(p, customer);
  });

  const byBooking = new Map();
  for (const p of linkedPayments) {
    const bid = getBookingId(p);
    if (bid !== undefined && bid !== null && String(bid) !== "") {
      const k = String(bid);
      if (!byBooking.has(k)) byBooking.set(k, []);
      byBooking.get(k).push(p);
    }
  }

  const bookingTotal = linkedBookings.reduce(
    (s, b) => s + num(b.totalAmount ?? b.total_amount ?? b.total ?? b.amount),
    0
  );
  const orphanInvoices = linkedPayments.filter((p) => {
    const bid = getBookingId(p);
    return bid === undefined || bid === null || String(bid) === "";
  });

  const invoiceTotal = orphanInvoices.reduce((s, p) => s + paymentTotal(p), 0);
  const total = linkedBookings.length
    ? Math.max(bookingTotal, invoiceTotal)
    : invoiceTotal;
  const received = linkedPayments.reduce((s, p) => s + paymentReceived(p), 0);
  const pending = Math.max(0, total - received);
  const status =
    total > 0 && received >= total
      ? "Paid"
      : received > 0
      ? "Partial"
      : linkedPayments.length
      ? "Pending"
      : "Not Invoiced";

  return {
    bookings: linkedBookings,
    payments: linkedPayments,
    total,
    received,
    pending,
    status,
    unlinked: orphanInvoices.length,
  };
}

function hasCustomerLinkedRecords(c, p, b, d = [], s = []) {
  return [...p, ...b, ...d, ...s].some((r) => recordMatchesCustomer(r, c));
}

/* =========================================
   ANIMATIONS
========================================= */

function CustomerAnimationStyles() {
  return (
    <style>{`
      .customer-3d-reveal {
        opacity: 0;
        transform: perspective(1100px) translate3d(0, 25px, -15px) scale(0.98);
        transition: opacity 500ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease;
      }
      .customer-3d-reveal.customer-3d-visible {
        opacity: 1;
        transform: none;
      }
      .customer-table-row:hover {
        background: #eef5ff;
      }
      .customer-action-button {
        transition: transform 0.2s, background-color 0.2s;
      }
      .customer-action-button:hover {
        transform: translateY(-2px);
      }
      @media (prefers-reduced-motion: reduce) {
        .customer-3d-reveal,
        .customer-3d-reveal.customer-3d-visible {
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
  );
}

function useCustomerScrollAnimation(ref, deps) {
  useEffect(() => {
    const els = ref.current?.querySelectorAll(".customer-3d-reveal");
    if (!els) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      els.forEach((e) => e.classList.add("customer-3d-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) =>
          e.target.classList.toggle("customer-3d-visible", e.isIntersecting)
        ),
      { threshold: 0.08, rootMargin: "0px 0px -10px 0px" }
    );
    els.forEach((e) => observer.observe(e));
    return () => observer.disconnect();
  }, deps);
}

/* =========================================
   MODAL COMPONENT
========================================= */

function Modal({ children, onClose, width = "max-w-2xl" }) {
  const ref = useRef(onClose);
  ref.current = onClose;

  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e) => {
      if (e.key === "Escape") ref.current?.();
    };
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09172c]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[94dvh] w-full ${width} flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function PremiumField({ label, icon: Icon, required = false, children }) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-2 text-xs font-bold text-[#30486b]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4ff] text-[#3465a5]">
          <Icon size={14} />
        </span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

/* =========================================
   ADD / EDIT CUSTOMER MODAL
   (Gender, Language & Source completely removed)
========================================= */

function CustomerFormModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(() => ({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    notes: customer?.notes || "",
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Please enter customer name.");
    if (!/^\d{10}$/.test(form.phone.trim()))
      return setError("Enter a valid 10-digit phone number.");

    setSaving(true);
    try {
      const result = await onSave({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
      if (!result) setError("This phone number already exists.");
    } catch (err) {
      setError(err.message || "Unable to save customer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} width="max-w-[660px]">
      <div className="shrink-0 border-b border-[#e8edf5] bg-white px-5 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102b53] text-white">
              {customer ? <Pencil size={23} /> : <UserRound size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#5377a5]">
                Customer Management
              </p>
              <h2 className="mt-1 text-xl font-black text-[#102b53]">
                {customer ? "Edit Customer Profile" : "Create Customer Profile"}
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {customer
                  ? "Update customer information"
                  : "Add a new customer to your studio"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col bg-[#f9fbff]">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
          <PremiumField label="Full Name" icon={UserRound} required>
            <input
              autoFocus
              required
              className={fieldClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Enter customer's full name"
            />
          </PremiumField>

          <PremiumField label="Mobile Number" icon={Phone} required>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r pr-3 text-xs font-bold text-[#45658f]">
                +91
              </span>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`${fieldClass} pl-[69px]`}
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
              />
            </div>
          </PremiumField>

          <PremiumField label="Email Address" icon={Mail}>
            <input
              type="email"
              className={fieldClass}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="customer@example.com"
            />
          </PremiumField>

          <PremiumField label="Customer Address / Location" icon={MapPin}>
            <textarea
              rows={3}
              className={fieldClass}
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Enter address or city"
            />
          </PremiumField>

          <PremiumField label="Notes & Requirements" icon={FileText}>
            <textarea
              rows={3}
              className={fieldClass}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Enter notes or event requirements..."
            />
          </PremiumField>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2 rounded-xl border bg-white p-3 text-[11px] text-slate-500">
            <ShieldCheck size={16} className="text-blue-600" />
            Customer information is safely stored and synchronized.
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t bg-white p-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#102b53] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#244d80] disabled:opacity-50"
          >
            <Save size={17} />
            {saving ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================
   PAYMENT SUMMARY
========================================= */

function PaymentSummary({ customer, bookings, payments }) {
  const f = useMemo(
    () => financialsForCustomer(customer, bookings, payments),
    [customer, bookings, payments]
  );
  const colors = {
    Paid: "bg-emerald-50 text-emerald-700",
    Partial: "bg-blue-50 text-blue-700",
    Pending: "bg-amber-50 text-amber-700",
    "Not Invoiced": "bg-slate-100 text-slate-600",
  };

  return (
    <div className="mt-4 rounded-[20px] border border-[#dbe7f7] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
          <IndianRupee size={17} className="text-[#326cff]" />
          Booking & Payment Summary
        </h3>
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${colors[f.status]}`}>
          {f.status}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-[#7890ac]">
        {f.bookings.length} linked booking(s) · {f.payments.length} linked invoice(s)
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          ["Total Booking Amount", f.total, "text-[#102b53]"],
          ["Received Amount", f.received, "text-emerald-700"],
          ["Pending Balance", f.pending, "text-amber-700"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-[#e2ebf8] bg-[#f5f9ff] p-3"
          >
            <p className="text-[10px] font-bold text-[#7187a4]">{label}</p>
            <p className={`mt-2 break-words text-base font-black ${color}`}>
              {money(value)}
            </p>
          </div>
        ))}
      </div>
      {f.bookings.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[11px] font-extrabold text-[#102b53]">Linked Bookings</p>
          {f.bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap justify-between gap-2 rounded-xl bg-[#f8fbff] p-3 text-xs"
            >
              <div>
                <p className="font-bold text-[#102b53]">
                  {b.event || b.event_type || "Booking"}
                </p>
                <p className="mt-1 text-[#8194ae]">{formatDate(b.date || b.event_date)}</p>
              </div>
              <span className="font-extrabold text-[#102b53]">
                {money(b.totalAmount ?? b.total_amount)}
              </span>
            </div>
          ))}
        </div>
      )}
      {f.bookings.length === 0 && f.payments.length === 0 && (
        <p className="mt-3 text-xs text-slate-400">
          No linked bookings or payments found for this customer.
        </p>
      )}
      <p className="mt-3 text-[10px] leading-4 text-[#8194ae]">
        Amounts are calculated from linked booking and payment records.
      </p>
    </div>
  );
}

/* =========================================
   CUSTOMER PROFILE VIEW MODAL
   (Gender, Language & Source completely removed)
========================================= */

function CustomerViewModal({
  customer,
  deliveries = [],
  selections = [],
  bookings = [],
  payments = [],
  onClose,
  onEdit,
  onDelete,
}) {
  const ds = deliveries.filter((d) => recordMatchesCustomer(d, customer));
  const ss = selections.filter((s) => recordMatchesCustomer(s, customer));

  const details = [
    ["Customer ID", customer.id || "—", "text-[#102b53]"],
    ["Customer Since", formatDate(customer.createdAt), "text-[#102b53]"],
    ["Location", getLocationDisplay(customer.address || customer.city), "text-[#326cff]"],
  ];

  return (
    <Modal onClose={onClose} width="max-w-[680px]">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#edf0f5] pb-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#102b53] to-[#3567a6] text-lg font-black text-white">
              {initials(customer.name)}
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#7990af]">
                Customer Profile
              </p>
              <h2 className="truncate text-[22px] font-black text-[#102b53]">
                {customer.name}
              </h2>
              <p className="mt-1 text-[11px] text-[#8091a9]">{customer.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="mt-6 rounded-[22px] bg-[#f5f7fb] p-5 sm:p-6">
          <h3 className="mb-5 text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
            Customer Information
          </h3>
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3">
            {details.map(([label, value, color]) => (
              <div key={label} className="min-w-0">
                <p className="mb-2 text-[11px] text-[#627695]">{label}</p>
                <p className={`break-words text-[13px] font-extrabold sm:text-[15px] ${color}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] p-5">
          <h3 className="mb-4 flex items-center gap-2 text-xs font-extrabold uppercase text-[#102b53]">
            <Phone size={16} className="text-[#326cff]" />
            Contact Information
          </h3>
          <div className="flex flex-wrap gap-3">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#e4f8f2] px-4 py-3 text-xs font-bold text-[#00a982]"
              >
                <Phone size={16} />
                {customer.phone}
              </a>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex max-w-full items-center gap-2 break-all rounded-xl bg-[#eaf2ff] px-4 py-3 text-xs font-bold text-[#4384f5]"
              >
                <Mail size={16} />
                {customer.email}
              </a>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase text-[#102b53]">
            <MapPin size={16} className="text-[#ec5275]" />
            Customer Address
          </h3>
          <p className="text-[13px] leading-6 text-[#536984]">
            {customer.address || "No address provided"}
          </p>
        </div>

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase text-[#102b53]">
            <FileText size={16} className="text-[#a268d9]" />
            Notes & Requirements
          </h3>
          <p className="whitespace-pre-wrap break-words text-[13px] text-[#536984]">
            {customer.notes || "No additional notes"}
          </p>
        </div>

        <PaymentSummary customer={customer} bookings={bookings} payments={payments} />

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#102b53]">
              <PackageCheck size={16} />
              Deliverables & Photo Selections
            </h3>
            <span className="rounded-lg bg-[#edf5ff] px-2.5 py-1 text-[11px] font-bold text-[#24558d]">
              {ds.length + ss.length} Records
            </span>
          </div>
          {!ds.length && !ss.length ? (
            <p className="text-xs text-slate-400">
              No deliverables or photo selections recorded yet for this customer.
            </p>
          ) : (
            <div className="space-y-2.5">
              {ds.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fbff] p-3 text-xs"
                >
                  <div>
                    <p className="font-extrabold text-[#102b53]">
                      {d.item || "Delivery"}{" "}
                      <span className="text-[#6b829e]">{d.event || ""}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#8091a9]">
                      Method: {d.deliveryMethod || "Studio Pickup"} · Exp:{" "}
                      {formatDate(d.expectedDate)}
                    </p>
                  </div>
                  <span className="font-bold text-[#285a99]">{d.status || "Pending"}</span>
                </div>
              ))}
              {ss.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#f8fbff] p-3 text-xs"
                >
                  <div>
                    <p className="font-extrabold text-[#102b53]">
                      Photo Selection{" "}
                      <span className="text-[#6b829e]">{s.project || ""}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#8091a9]">
                      Shared: {s.photoCount || 0} photos · Selected: {s.selectedCount || 0}
                    </p>
                  </div>
                  <span className="font-bold text-[#285a99]">
                    {s.returnedDate ? "Returned" : "In Selection"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() => onDelete(customer)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] font-semibold text-rose-500 hover:bg-red-50"
          >
            <Trash2 size={17} />
            Delete Customer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(customer)}
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-bold text-[#102b53] hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#102b53] px-7 py-3 text-[13px] font-bold text-white hover:bg-[#244d80]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================
   DELETE CUSTOMER MODAL
========================================= */

function DeleteCustomerModal({ customer, onClose, onConfirm, linked }) {
  return (
    <Modal onClose={onClose} width="max-w-[420px]">
      <div className="p-7 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Trash2 size={27} />
        </div>
        <h3 className="mt-5 text-xl font-extrabold text-[#102b53]">Delete Customer?</h3>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be
          undone.
        </p>
        {linked && (
          <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-800">
            <AlertCircle size={18} className="shrink-0" />
            This customer has linked records. Delete is blocked to protect existing data.
          </div>
        )}
        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={linked}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================
   MAIN CUSTOMERS PAGE
========================================= */

export default function Customers() {
  const pageRef = useRef(null);
  const [customers, setCustomers] = useState(loadCustomers);
  const [enquiries, setEnquiries] = useState(() => readStoredArray(ENQUIRY_KEY));
  const [payments, setPayments] = useState(() => readStoredArray(PAYMENT_KEY));
  const [bookings, setBookings] = useState(() => readStoredArray(BOOKING_KEY));
  const [deliveries, setDeliveries] = useState(() => readStoredArray(DELIVERY_KEY));
  const [selections, setSelections] = useState(() => readStoredArray(SELECTION_KEY));

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [toast, setToast] = useState("");
  const [loadingSync, setLoadingSync] = useState(false);

  const customerRef = useRef(customers);
  customerRef.current = customers;

  const refreshBackend = useCallback(async () => {
    setLoadingSync(true);
    try {
      const [cr, br, pr] = await Promise.allSettled([
        api.customers.list(),
        api.bookings.list(),
        api.payments.list(),
      ]);

      const unwrap = (r) =>
        r.status === "fulfilled"
          ? Array.isArray(r.value)
            ? r.value
            : Array.isArray(r.value?.results)
            ? r.value.results
            : null
          : null;

      const cs = unwrap(cr);
      const bs = unwrap(br);
      const ps = unwrap(pr);

      if (cs && cs.length) {
        const old = readStoredArray(STORAGE_KEY);
        const merged = cs.map((c) => {
          const prev = old.find((x) => String(x.id) === String(c.id));
          return {
            ...prev,
            id: c.id,
            name: c.name ?? prev?.name ?? "",
            phone: c.phone ?? prev?.phone ?? "",
            email: c.email ?? prev?.email ?? "",
            address: c.address ?? prev?.address ?? "",
            notes: c.notes ?? prev?.notes ?? "",
            createdAt: c.created_at?.slice(0, 10) ?? prev?.createdAt ?? todayLocal(),
            updatedAt: c.updated_at ?? prev?.updatedAt ?? "",
          };
        });
        setCustomers(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        notifyDataUpdated(STORAGE_KEY);
      }

      if (bs) {
        const old = readStoredArray(BOOKING_KEY);
        const mapped = bs.map((b) => {
          const prev = old.find((x) => String(x.id) === String(b.id));
          return {
            ...prev,
            id: b.id,
            customerId: b.customer ?? b.customer_id ?? prev?.customerId ?? "",
            customer: b.customer_name ?? prev?.customer ?? "",
            phone: b.phone ?? prev?.phone ?? "",
            event: b.event_type ?? prev?.event ?? "",
            date: b.event_date ?? prev?.date ?? "",
            location: b.location ?? prev?.location ?? "",
            totalAmount: num(b.total_amount ?? prev?.totalAmount),
            status: b.status ?? prev?.status ?? "Pending",
          };
        });
        setBookings(mapped);
        localStorage.setItem(BOOKING_KEY, JSON.stringify(mapped));
        notifyDataUpdated(BOOKING_KEY);
      }

      if (ps) {
        const old = readStoredArray(PAYMENT_KEY);
        const mapped = ps.map((p) => {
          const prev = old.find((x) => String(x.id) === String(p.id));
          return {
            ...prev,
            ...p,
            id: p.id,
            bookingId: getBookingId(p) ?? prev?.bookingId,
            customerId:
              p.customer_id ??
              (typeof p.customer === "number" ? p.customer : prev?.customerId),
            customer: p.customer_name ?? prev?.customer ?? "",
            phone: p.phone ?? prev?.phone ?? "",
            total: paymentTotal(p),
            paidAmount: paymentReceived(p),
            transactions: Array.isArray(p.transactions)
              ? p.transactions
              : p.paid_amount !== undefined || p.paidAmount !== undefined
              ? []
              : prev?.transactions ?? [],
          };
        });
        setPayments(mapped);
        localStorage.setItem(PAYMENT_KEY, JSON.stringify(mapped));
        notifyDataUpdated(PAYMENT_KEY);
      }

      if (cr.status === "rejected" || br.status === "rejected" || pr.status === "rejected") {
        console.warn("Some API requests failed; keeping available local data.");
      }
    } catch (e) {
      console.warn("Backend refresh notice:", e);
    } finally {
      setLoadingSync(false);
    }
  }, []);

  useEffect(() => {
    refreshBackend();
  }, [refreshBackend]);

  useEffect(() => {
    const sync = (e) => {
      const key = e?.type === "storage" ? e.key : e?.detail?.key;
      if (
        key &&
        ![
          STORAGE_KEY,
          PAYMENT_KEY,
          BOOKING_KEY,
          DELIVERY_KEY,
          SELECTION_KEY,
          ENQUIRY_KEY,
        ].includes(key)
      )
        return;

      if (!key || key === STORAGE_KEY) {
        const latest = readStoredArray(STORAGE_KEY);
        setCustomers((p) => (JSON.stringify(p) === JSON.stringify(latest) ? p : latest));
      }
      if (!key || key === ENQUIRY_KEY) setEnquiries(readStoredArray(ENQUIRY_KEY));
      if (!key || key === PAYMENT_KEY) setPayments(readStoredArray(PAYMENT_KEY));
      if (!key || key === BOOKING_KEY) setBookings(readStoredArray(BOOKING_KEY));
      if (!key || key === DELIVERY_KEY) setDeliveries(readStoredArray(DELIVERY_KEY));
      if (!key || key === SELECTION_KEY) setSelections(readStoredArray(SELECTION_KEY));
    };

    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener("focus", refreshBackend);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener("focus", refreshBackend);
    };
  }, [refreshBackend]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const eligibleCustomers = useMemo(
    () => customers.filter((c) => isCustomerEligible(c, enquiries, bookings, payments)),
    [customers, enquiries, bookings, payments]
  );

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return eligibleCustomers;
    return eligibleCustomers.filter((c) =>
      [c.id, c.name, c.phone, c.email, c.address, c.notes].some((v) =>
        String(v || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [eligibleCustomers, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useCustomerScrollAnimation(pageRef, [currentPage, search, eligibleCustomers.length]);

  const currentViewCustomer =
    eligibleCustomers.find((c) => String(c.id) === String(viewCustomer?.id)) || null;
  const currentDeleteCustomer =
    eligibleCustomers.find((c) => String(c.id) === String(deleteCustomer?.id)) || null;
  const hasLinkedRecords = Boolean(
    currentDeleteCustomer &&
      hasCustomerLinkedRecords(
        currentDeleteCustomer,
        payments,
        bookings,
        deliveries,
        selections
      )
  );

  const openAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (c) => {
    setViewCustomer(null);
    setEditingCustomer(c);
    setFormOpen(true);
  };

  const saveCustomer = async (form) => {
    if (
      customers.some(
        (c) =>
          normalizePhone(c.phone) === normalizePhone(form.phone) &&
          String(c.id) !== String(editingCustomer?.id)
      )
    ) {
      return false;
    }

    if (editingCustomer) {
      try {
        await api.customers.update(editingCustomer.id, {
          name: form.name,
          phone: form.phone,
          email: form.email || "",
          address: form.address || "",
          notes: form.notes || "",
        });
      } catch (e) {
        console.warn("Backend update failed, saving locally:", e);
      }

      setCustomers((p) => {
        const next = p.map((c) =>
          String(c.id) === String(editingCustomer.id)
            ? {
                ...c,
                ...form,
                id: c.id,
                createdAt: c.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        notifyDataUpdated();
        return next;
      });
      setToast("Customer updated successfully.");
    } else {
      let id = `CUS${Date.now()}${Math.floor(Math.random() * 10000)}`;
      try {
        const remote = await api.customers.create({
          name: form.name,
          phone: form.phone,
          email: form.email || "",
          address: form.address || "",
          notes: form.notes || "",
        });
        if (remote?.id) id = remote.id;
      } catch (e) {
        console.warn("Backend create failed, saving locally:", e);
      }

      const created = {
        ...form,
        id,
        createdAt: todayLocal(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
        isConfirmedCustomer: true,
      };

      setCustomers((p) => {
        const next = [created, ...p];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        notifyDataUpdated();
        return next;
      });
      setToast("Customer added successfully.");
      setPage(1);
    }

    setFormOpen(false);
    setEditingCustomer(null);
    return true;
  };

  const confirmDelete = async () => {
    if (!currentDeleteCustomer) return;
    const p = readStoredArray(PAYMENT_KEY);
    const b = readStoredArray(BOOKING_KEY);
    const d = readStoredArray(DELIVERY_KEY);
    const s = readStoredArray(SELECTION_KEY);

    if (hasCustomerLinkedRecords(currentDeleteCustomer, p, b, d, s)) {
      setPayments(p);
      setBookings(b);
      setDeliveries(d);
      setSelections(s);
      setToast("Cannot delete customer with linked records.");
      return;
    }

    try {
      await api.customers.delete(currentDeleteCustomer.id);
    } catch (e) {
      console.warn("Backend delete notice:", e);
    }

    setCustomers((prev) => {
      const next = prev.filter((c) => String(c.id) !== String(currentDeleteCustomer.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      notifyDataUpdated();
      return next;
    });

    setDeleteCustomer(null);
    setViewCustomer(null);
    setToast("Customer deleted successfully.");
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8faff] px-3 py-5 text-[#102b53] sm:px-6 lg:px-8"
    >
      <CustomerAnimationStyles />

      <div className="mx-auto max-w-[1700px] space-y-6">
        {/* TOAST NOTIFICATION */}
        {toast && (
          <div
            role="status"
            className="fixed right-4 top-4 z-[10000] flex max-w-sm items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-[#102b53] shadow-xl"
          >
            <CheckCircle2 size={19} className="text-emerald-500" />
            {toast}
            <button
              type="button"
              onClick={() => setToast("")}
              aria-label="Close notification"
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* TOP ACTION AREA */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#102b53]">Customers</h1>
            <p className="mt-1 text-xs text-slate-400">
              Customer directory and relationship management
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={refreshBackend}
              disabled={loadingSync}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-xs font-bold text-[#102b53] shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loadingSync ? "animate-spin" : ""} />
              {loadingSync ? "Syncing..." : "Refresh Payments"}
            </button>

            <button
              type="button"
              onClick={openAdd}
              className="customer-action-button inline-flex items-center gap-2 rounded-xl bg-[#102b53] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#244d80]"
            >
              <Plus size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* CUSTOMER DIRECTORY (MAIN PAGE SECTION) */}
        <section className="customer-3d-reveal overflow-hidden rounded-[25px] border border-[#e5eaf2] bg-white shadow-sm">
          {/* DIRECTORY HEADER & SEARCH */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ContactRound size={22} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#102b53]">Customer Directory</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Manage customer details and contact information
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-[300px]">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full rounded-xl border border-[#dce5f1] bg-[#f9fbff] py-3 pl-10 pr-4 text-sm text-[#102b53] outline-none transition placeholder:text-slate-400 focus:border-[#3265a8] focus:bg-white focus:ring-[3px] focus:ring-[#e5efff]"
                />
              </div>

              <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700">
                {filteredCustomers.length} Customers
              </span>
            </div>
          </div>

          {/* DESKTOP CUSTOMER TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b bg-[#f8faff] text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCustomers.map((c) => (
                  <tr
                    key={c.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => setViewCustomer(c)}
                    onKeyDown={(e) => {
                      if (
                        e.target === e.currentTarget &&
                        (e.key === "Enter" || e.key === " ")
                      ) {
                        e.preventDefault();
                        setViewCustomer(c);
                      }
                    }}
                    className="customer-table-row cursor-pointer transition hover:bg-[#eef5ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    {/* CUSTOMER COLUMN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${avatarColor(
                            c.name
                          )}`}
                        >
                          {initials(c.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="whitespace-nowrap text-sm font-bold text-[#102b53]">
                            {c.name}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">{c.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT COLUMN */}
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <Phone size={13} className="text-emerald-500 shrink-0" />
                        {c.phone}
                      </p>
                      <p className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400">
                        <Mail size={13} className="shrink-0" />
                        <span className="max-w-[220px] truncate">{c.email || "—"}</span>
                      </p>
                    </td>

                    {/* LOCATION COLUMN */}
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <MapPin size={14} className="shrink-0 text-slate-400" />
                        <span className="max-w-[260px] truncate">
                          {getLocationDisplay(c.address || c.city)}
                        </span>
                      </p>
                    </td>

                    {/* ACTIONS COLUMN */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          title="Edit Customer"
                          aria-label={`Edit ${c.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(c);
                          }}
                          className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#102b53] transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete Customer"
                          aria-label={`Delete ${c.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCustomer(c);
                          }}
                          className="rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CUSTOMER CARDS (lg:hidden) */}
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {visibleCustomers.map((c) => (
              <div
                key={c.id}
                tabIndex={0}
                role="button"
                onClick={() => setViewCustomer(c)}
                onKeyDown={(e) => {
                  if (
                    e.target === e.currentTarget &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    setViewCustomer(c);
                  }
                }}
                className="customer-3d-reveal cursor-pointer rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ${avatarColor(
                      c.name
                    )}`}
                  >
                    {initials(c.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-[#102b53]">{c.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{c.id}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 rounded-xl bg-[#f8fbff] p-3.5 text-xs text-slate-600">
                  <p className="flex items-center gap-2 font-semibold">
                    <Phone size={13} className="text-emerald-500 shrink-0" />
                    {c.phone}
                  </p>
                  <p className="flex items-center gap-2 break-all text-slate-500">
                    <Mail size={13} className="shrink-0" />
                    {c.email || "—"}
                  </p>
                  <p className="flex items-center gap-2 text-slate-500">
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{getLocationDisplay(c.address || c.city)}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    Since {formatDate(c.createdAt)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Edit Customer"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(c);
                      }}
                      className="rounded-xl border border-slate-200 bg-white p-2 text-[#102b53] hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      title="Delete Customer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteCustomer(c);
                      }}
                      className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {!visibleCustomers.length && (
            <div className="py-16 text-center">
              <ContactRound size={36} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-bold text-[#102b53]">
                {eligibleCustomers.length === 0
                  ? "No customers found. Add your first customer."
                  : "No matching customers found."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-[#f9fbff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-500">
              Showing{" "}
              {filteredCustomers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
              –{Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} customers
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous Page"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="px-2 text-xs font-bold text-[#102b53]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next Page"
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <p className="flex items-center justify-center gap-2 pb-3 text-center text-[11px] text-slate-400">
          <Camera size={14} />
          Studio Raw Picturez · Customer Management
        </p>
      </div>

      {/* CREATE / EDIT CUSTOMER MODAL */}
      {formOpen && (
        <CustomerFormModal
          key={editingCustomer?.id || "new"}
          customer={editingCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSave={saveCustomer}
        />
      )}

      {/* VIEW CUSTOMER PROFILE MODAL */}
      {currentViewCustomer && (
        <CustomerViewModal
          customer={currentViewCustomer}
          bookings={bookings}
          payments={payments}
          deliveries={deliveries}
          selections={selections}
          onClose={() => setViewCustomer(null)}
          onEdit={openEdit}
          onDelete={(c) => {
            setViewCustomer(null);
            setDeleteCustomer(c);
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {currentDeleteCustomer && (
        <DeleteCustomerModal
          customer={currentDeleteCustomer}
          linked={hasLinkedRecords}
          onClose={() => setDeleteCustomer(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
