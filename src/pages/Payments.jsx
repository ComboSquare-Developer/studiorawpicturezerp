
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Wallet,
  IndianRupee,
  Receipt,
  Clock3,
  Trash2,
  Printer,
  ChevronDown,
  CreditCard,
  UserRound,
  FileText,
  Save,
  Phone,
  CalendarDays,
  CheckCircle2,
  Pencil,
  ArrowLeft,
  RotateCcw,
  Check,
  History,
  X,
  Camera,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  BadgeCheck,
} from "lucide-react";

/* =========================================
   STORAGE & CONSTANTS
========================================= */

const KEY = "studioraw_payments";
const SOUND_KEY = "studioraw_payments_sound";
const UPDATE_EVENT = "studioraw:data-updated";

const todayKey = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const packageOptions = [
  "Wedding Photography",
  "Traditional Photography",
  "Candid Photography",
  "Helicam (Drone) Photography",
  "PreWedding Photography",
  "Post Wedding Photography",
  "Wedding Videography",
  "Function We Arrange",
  "Event Management",
  "Customized Gifts",
  "Pre-Wedding / Outdoor Shoot",
  "Baby & Kids Shoot",
  "Complete Wedding Package",
  "Custom Package",
];

const methodOptions = ["Cash", "UPI", "Bank Transfer", "Card"];
const filterOptions = ["All", "Paid", "Partial", "Pending"];

const createEmptyForm = () => ({
  customer: "",
  phone: "",
  packageName: "Wedding Photography",
  total: "",
  advance: "",
  method: "Cash",
  date: todayKey(),
  notes: "",
});

const demoPayments = [
  {
    id: "DEMO-PAY-001",
    invoice: "INV-2026-1001",
    customer: "Arun Kumar",
    phone: "9876543210",
    packageName: "Wedding Photography",
    total: 75000,
    advance: 30000,
    method: "UPI",
    date: "2026-10-10",
    notes: "Wedding photography and videography",
  },
  {
    id: "DEMO-PAY-002",
    invoice: "INV-2026-1002",
    customer: "Priya Sharma",
    phone: "9876543211",
    packageName: "Traditional Photography",
    total: 25000,
    advance: 25000,
    method: "Cash",
    date: "2026-10-12",
    notes: "Engagement photo session",
  },
  {
    id: "DEMO-PAY-003",
    invoice: "INV-2026-1003",
    customer: "Vijay Raj",
    phone: "9876543212",
    packageName: "Event Management",
    total: 18000,
    advance: 5000,
    method: "Bank Transfer",
    date: "2026-10-15",
    notes: "Birthday event coverage",
  },
  {
    id: "DEMO-PAY-004",
    invoice: "INV-2026-1004",
    customer: "Meena Devi",
    phone: "9876543213",
    packageName: "Pre-Wedding / Outdoor Shoot",
    total: 35000,
    advance: 10000,
    method: "UPI",
    date: "2026-10-18",
    notes: "Outdoor pre-wedding shoot",
  },
  {
    id: "DEMO-PAY-005",
    invoice: "INV-2026-1005",
    customer: "Karthik S",
    phone: "9876543214",
    packageName: "Baby & Kids Shoot",
    total: 12000,
    advance: 0,
    method: "Cash",
    date: "2026-10-20",
    notes: "Baby photography session",
  },
  {
    id: "DEMO-PAY-006",
    invoice: "INV-2026-1006",
    customer: "Divya R",
    phone: "9876543215",
    packageName: "Wedding Videography",
    total: 45000,
    advance: 20000,
    method: "UPI",
    date: "2026-10-21",
    notes: "Reception video coverage",
  },
  {
    id: "DEMO-PAY-007",
    invoice: "INV-2026-1007",
    customer: "Rahul M",
    phone: "9876543216",
    packageName: "Custom Package",
    total: 28000,
    advance: 28000,
    method: "Card",
    date: "2026-10-22",
    notes: "Corporate annual event",
  },
  {
    id: "DEMO-PAY-008",
    invoice: "INV-2026-1008",
    customer: "Anitha S",
    phone: "9876543217",
    packageName: "Function We Arrange",
    total: 15000,
    advance: 5000,
    method: "Cash",
    date: "2026-10-22",
    notes: "Anniversary celebration",
  },
];

const inputClass =
  "block w-full min-w-0 rounded-2xl border border-[#dce5f1] bg-white px-4 py-3.5 text-sm font-medium text-[#10264d] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#c5a66a] focus:ring-4 focus:ring-[#d8bd83]/15";

const panelClass =
  "overflow-hidden rounded-[26px] border border-[#e4e9f1] bg-white shadow-[0_10px_35px_rgba(15,35,65,0.04)]";

const goldButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#102f62] via-[#1b467d] to-[#102f62] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl";

const toAmount = (value) => {
  const number = Number(String(value ?? 0).replace(/[₹,\s]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const roundMoney = (value) =>
  Math.round((toAmount(value) + Number.EPSILON) * 100) / 100;

const currency = (value) =>
  `₹${toAmount(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getBalance = (payment) =>
  Math.max(0, roundMoney(toAmount(payment.total) - toAmount(payment.advance)));

const getStatus = (payment) => {
  const total = toAmount(payment.total);
  const paid = toAmount(payment.advance);
  if (total > 0 && paid >= total) return "Paid";
  if (paid > 0) return "Partial";
  return "Pending";
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);

/* =========================================
   PAYMENT HISTORY NORMALIZATION
========================================= */

function normalizePayment(payment) {
  const total = Math.max(0, roundMoney(payment.total));
  const oldAdvance = Math.max(0, roundMoney(payment.advance));

  let transactions = Array.isArray(payment.transactions)
    ? payment.transactions
        .map((transaction, index) => ({
          id: transaction.id || `${payment.id}-TX-${index}`,
          date: transaction.date || payment.date || todayKey(),
          amount: Math.max(0, roundMoney(transaction.amount)),
          method: transaction.method || payment.method || "Cash",
          type: transaction.type || "Additional Payment",
          notes: transaction.notes || "",
        }))
        .filter((transaction) => transaction.amount > 0)
    : [];

  if (!Array.isArray(payment.transactions) && oldAdvance > 0) {
    transactions = [{
      id: `${payment.id}-INITIAL`,
      date: payment.date || todayKey(),
      amount: oldAdvance,
      method: payment.method || "Cash",
      type: "Initial Advance",
      notes: "Imported from existing invoice",
    }];
  }

  const received = roundMoney(
    transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  );

  return {
    ...payment,
    total,
    advance: received,
    transactions,
  };
}

function readPayments() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === null) return demoPayments.map(normalizePayment);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.map(normalizePayment)
      : demoPayments.map(normalizePayment);
  } catch {
    return demoPayments.map(normalizePayment);
  }
}

/* =========================================
   SOUND
========================================= */

function useSound() {
  const contextRef = useRef(null);

  const play = (type = "click") => {
    try {
      if (localStorage.getItem(SOUND_KEY) !== "true") return;

      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!contextRef.current) {
        contextRef.current = new AudioContextClass();
      }

      const context = contextRef.current;
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const notes = {
        click: [480],
        open: [520, 650],
        success: [620, 780, 980],
        delete: [430, 290],
        print: [620, 820],
      };

      (notes[type] || notes.click).forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.065;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.035, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    } catch {
      // Optional sound.
    }
  };

  useEffect(() => {
    return () => {
      const context = contextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch(() => {});
      }
    };
  }, []);

  return { play };
}

/* =========================================
   REUSABLE UI
========================================= */

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2.5 block text-xs font-bold text-[#344767]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6 flex items-center gap-3 border-b border-[#e8eef6] pb-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#e6d8b8] bg-[#fffaf0] text-[#aa813e]">
        <Icon size={21} />
      </div>
      <div>
        <h3 className="text-sm font-black text-[#10264d] sm:text-base">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  required = false,
}) {
  const allOptions =
    value && !options.includes(value) ? [value, ...options] : options;

  return (
    <div className="relative w-full min-w-0">
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`${inputClass} appearance-none pr-10`}
      >
        <option value="" disabled>{placeholder}</option>
        {allOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9b814f]"
      />
    </div>
  );
}

const statusStyle = {
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Partial: "border-blue-200 bg-blue-50 text-blue-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black ${statusStyle[status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${
        status === "Paid" ? "bg-emerald-500" :
        status === "Partial" ? "bg-blue-500" : "bg-amber-500"
      }`} />
      {status}
    </span>
  );
}

function MobileDetail({ label, value, highlight = false }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className={`mt-1 break-words text-sm font-bold ${
        highlight ? "text-[#174b91]" : "text-[#10264d]"
      }`}>
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, accent }) {
  return (
    <div className="sr-stat-card group relative min-w-0 overflow-hidden rounded-[22px] border border-[#e4e9f1] bg-white p-4 shadow-[0_8px_28px_rgba(15,35,65,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {title}
          </p>
          <h2 className={`mt-4 break-words text-xl font-black sm:text-2xl ${color}`}>
            {value}
          </h2>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}>
          <Icon size={22} className={color} />
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${accent} transition-all duration-500 group-hover:w-full`} />
    </div>
  );
}

/* =========================================
   PREMIUM LIVE INVOICE PREVIEW
========================================= */

function PremiumInvoicePreview({
  form,
  invoiceNumber,
  additionalReceived = 0,
  editing = false,
}) {
  const total = Math.max(0, toAmount(form.total));
  const advance = Math.max(0, toAmount(form.advance));
  const received = roundMoney(advance + additionalReceived);
  const balance = Math.max(0, roundMoney(total - received));
  const percentage = total > 0
    ? Math.min(100, Math.max(0, (received / total) * 100))
    : 0;

  const status = total > 0 && received >= total
    ? "PAID"
    : received > 0
      ? "PARTIALLY PAID"
      : "PAYMENT PENDING";

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#e3d6ba] bg-white shadow-[0_25px_70px_rgba(15,35,65,0.12)]">
      <div className="h-[5px] bg-gradient-to-r from-[#a47b37] via-[#f6e1a5] to-[#9d7330]" />

      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1930] via-[#17365b] to-[#102442] px-5 pb-9 pt-8 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-[#e8d19a]/15" />
        <div className="pointer-events-none absolute -right-4 -top-4 h-36 w-36 rounded-full border border-[#e8d19a]/10" />
        <div className="sr-invoice-shine pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="sr-invoice-logo flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d5b674]/50 bg-[#d6b777]/10 text-[#e9d29d]">
              <Camera size={27} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-black tracking-[0.08em] sm:text-lg">
                STUDIO RAW
              </h2>
              <p className="mt-1 text-[10px] font-bold tracking-[0.32em] text-[#e8ce96]">
                PICTUREZ
              </p>
              <p className="mt-2 text-[8px] tracking-widest text-[#a9bad0]">
                CAPTURING TIMELESS MOMENTS
              </p>
            </div>
          </div>
          <div className="rounded-full border border-[#d9bc7e]/40 bg-[#d9bc7e]/10 px-3 py-1.5 text-[9px] font-black tracking-widest text-[#ecd7a7]">
            PREMIUM
          </div>
        </div>

        <div className="relative mt-9 flex items-end justify-between gap-3 border-t border-white/10 pt-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#d7b87d]">
              Official Billing Document
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[0.07em]">
              INVOICE
            </h1>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] text-[#a9bad0]">Invoice Number</p>
            <p className="mt-2 max-w-40 break-all text-[11px] font-bold text-[#f2deb2]">
              {invoiceNumber || "AUTO GENERATED"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-7 sm:px-7">
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9d793e]">
            Client Information
          </p>
          <span className="rounded-full border border-[#e8d9b7] bg-[#fffbf2] px-3 py-1 text-[9px] font-black text-[#987238]">
            {status}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#e6e9ef] bg-gradient-to-br from-[#fafcff] to-[#f3f6fb] p-4">
          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-[#d2af6b] to-[#f2e3c2]" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#102f62] text-white">
              <UserRound size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Billed To
              </p>
              <h3 className="mt-1 break-words text-base font-black text-[#10264d]">
                {form.customer || "Customer Name"}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={12} />
                {form.phone || "Customer Phone"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#e7edf5] p-3.5">
            <div className="flex items-center gap-2 text-[#a78143]">
              <CalendarDays size={15} />
              <span className="text-[10px] font-semibold">Invoice Date</span>
            </div>
            <p className="mt-2 text-xs font-black text-[#10264d]">
              {formatDate(form.date)}
            </p>
          </div>
          <div className="rounded-xl border border-[#e7edf5] p-3.5">
            <div className="flex items-center gap-2 text-[#a78143]">
              <CreditCard size={15} />
              <span className="text-[10px] font-semibold">Payment Mode</span>
            </div>
            <p className="mt-2 text-xs font-black text-[#10264d]">
              {form.method || "Cash"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-7 w-1 rounded-full bg-gradient-to-b from-[#b58b46] to-[#e5d1a2]" />
            <div>
              <h3 className="text-sm font-black text-[#10264d]">
                Service Breakdown
              </h3>
              <p className="mt-1 text-[11px] text-slate-400">
                Professional photography service
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e5eaf2]">
            <div className="flex justify-between gap-3 bg-[#102f62] px-4 py-3 text-[11px] font-bold text-white">
              <span>DESCRIPTION</span>
              <span>AMOUNT</span>
            </div>
            <div className="flex items-start justify-between gap-3 bg-[#fbfcff] px-4 py-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl border border-[#e6d8b8] bg-[#fffaf0] p-2 text-[#a67e3f]">
                  <Camera size={18} />
                </div>
                <div className="min-w-0">
                  <p className="break-words text-sm font-black text-[#10264d]">
                    {form.packageName || "Photography Package"}
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-slate-400">
                    Premium Photography & Creative Services
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-black text-[#102f62]">
                {currency(total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black text-[#10264d]">
            <Receipt size={17} className="text-[#b18b4d]" />
            Payment Summary
          </h3>

          <div className="space-y-4 rounded-2xl border border-[#e5eaf2] bg-[#fbfcff] p-5">
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Package Amount</span>
              <strong>{currency(total)}</strong>
            </div>
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-500">Initial Advance</span>
              <strong className="text-emerald-700">{currency(advance)}</strong>
            </div>
            {additionalReceived > 0 && (
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Additional Payments</span>
                <strong className="text-emerald-700">
                  {currency(additionalReceived)}
                </strong>
              </div>
            )}
            <div className="border-t border-dashed border-[#d6dfec] pt-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="font-bold">Total Received</span>
                <strong className="text-emerald-700">{currency(received)}</strong>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7edf5]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1a936e] to-[#6bd6a8] transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>Payment Progress</span>
                <span>{percentage.toFixed(0)}% Received</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 overflow-hidden rounded-[22px] border border-[#d8b979] bg-gradient-to-br from-[#fffaf0] via-[#fffdf8] to-[#f5e6c7] p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-[#d5b271]/25" />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a67b37]">
                Outstanding Balance
              </p>
              <h2 className="mt-3 break-words text-3xl font-black text-[#102f62]">
                {currency(balance)}
              </h2>
              <p className="mt-2 text-[11px] font-semibold text-[#9d7a44]">
                {balance === 0
                  ? "Payment completed successfully"
                  : "Remaining amount to be collected"}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e7d4a9] bg-white/80 p-3 text-[#aa813e]">
              {balance === 0 ? <CheckCircle2 size={24} /> : <Wallet size={24} />}
            </div>
          </div>
        </div>

        {form.notes && (
          <div className="mt-6 rounded-2xl border border-[#e6ebf3] bg-[#f9fbfe] p-5">
            <p className="flex items-center gap-2 text-xs font-black">
              <FileText size={15} className="text-[#b18b4d]" />
              Special Notes
            </p>
            <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-500">
              {form.notes}
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-[#e7eaf0] pt-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#e5d1a6] bg-[#fff9ed] text-[#b18b4d]">
            <Camera size={21} />
          </div>
          <h3 className="mt-4 text-sm font-black tracking-wide text-[#102f62]">
            THANK YOU FOR CHOOSING US
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-xs leading-6 text-slate-500">
            Every moment is precious. Thank you for trusting
            Studio Raw Picturez to capture your beautiful memories.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="h-px w-10 bg-[#d6b675]" />
            <Sparkles size={13} className="text-[#b18b4d]" />
            <span className="h-px w-10 bg-[#d6b675]" />
          </div>
          <p className="mt-4 text-[10px] font-bold tracking-[0.18em] text-[#9d793e]">
            STUDIO RAW PICTUREZ
          </p>
        </div>
      </div>

      <div className="h-[5px] bg-gradient-to-r from-[#a47b37] via-[#f6e1a5] to-[#9d7330]" />
    </div>
  );
}

/* =========================================
   MAIN COMPONENT
========================================= */

export default function Payments() {
  const [payments, setPayments] = useState(readPayments);
  const [activeTab, setActiveTab] = useState("list");
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [paymentTarget, setPaymentTarget] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(todayKey());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [historyTarget, setHistoryTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notification, setNotification] = useState("");

  const { play } = useSound();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(payments));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, { detail: { key: KEY } })
      );
    } catch {
      // Keep in-memory data.
    }
  }, [payments]);

  useEffect(() => {
    if (!notification) return;
    const timeout = setTimeout(() => setNotification(""), 3500);
    return () => clearTimeout(timeout);
  }, [notification]);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const backToList = () => {
    setActiveTab("list");
    setError("");
    setPaymentError("");
    play("click");
  };

  const openCreateInvoice = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
    setActiveTab("invoice-form");
    play("open");
  };

  const openEdit = (payment) => {
    setEditingId(payment.id);

    const additional = (payment.transactions || [])
      .filter((transaction) => transaction.type !== "Initial Advance")
      .reduce((sum, transaction) => sum + toAmount(transaction.amount), 0);

    setForm({
      ...createEmptyForm(),
      ...payment,
      total: String(payment.total ?? ""),
      advance: String(Math.max(0, roundMoney(payment.advance - additional))),
    });

    setError("");
    setActiveTab("invoice-form");
    play("open");
  };

  const openRecordPayment = (paymentId = "") => {
    const target =
      paymentId ||
      payments.find((item) => getBalance(item) > 0)?.id ||
      "";

    setPaymentTarget(target);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentDate(todayKey());
    setPaymentNotes("");
    setPaymentError("");
    setActiveTab("record-payment");
    play("open");
  };

  /* CREATE / UPDATE INVOICE */

  const savePayment = (event) => {
    event.preventDefault();

    const customer = form.customer.trim();
    const phone = form.phone.trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError("Enter customer name and valid 10-digit phone number.");
      return;
    }

    if (!form.packageName.trim()) {
      setError("Please select a photography package.");
      return;
    }

    const total = Number(form.total);
    const initialAdvance = Number(form.advance || 0);

    if (
      form.total === "" ||
      !Number.isFinite(total) ||
      !Number.isFinite(initialAdvance) ||
      total <= 0 ||
      initialAdvance < 0
    ) {
      setError("Enter valid total and advance amounts.");
      return;
    }

    if (!form.date) {
      setError("Please select invoice date.");
      return;
    }

    const existing = payments.find((item) => item.id === editingId);

    const additionalTransactions = existing
      ? (existing.transactions || []).filter(
          (transaction) => transaction.type !== "Initial Advance"
        )
      : [];

    const additionalTotal = roundMoney(
      additionalTransactions.reduce(
        (sum, transaction) => sum + toAmount(transaction.amount),
        0
      )
    );

    if (roundMoney(initialAdvance + additionalTotal) > total) {
      setError(
        `Total received cannot exceed bill amount. Additional receipts already collected: ${currency(additionalTotal)}.`
      );
      return;
    }

    const id = existing ? existing.id : createId();

    const initialTransaction = initialAdvance > 0
      ? [{
          id: `${id}-INITIAL`,
          date: form.date,
          amount: roundMoney(initialAdvance),
          method: form.method,
          type: "Initial Advance",
          notes: "Advance received with invoice",
        }]
      : [];

    const payment = normalizePayment({
      ...form,
      id,
      invoice: existing
        ? existing.invoice
        : `INV-${Date.now()}`,
      customer,
      phone,
      packageName: form.packageName.trim(),
      total,
      transactions: [...initialTransaction, ...additionalTransactions],
    });

    setPayments((previous) =>
      existing
        ? previous.map((item) => item.id === editingId ? payment : item)
        : [payment, ...previous]
    );

    play("success");
    setNotification(existing ? "Invoice updated successfully!" : "Premium invoice created successfully!");
    setActiveTab("list");
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  /* ADDITIONAL PAYMENT */

  const saveAdditionalPayment = (event) => {
    event.preventDefault();

    const targetInvoice = payments.find(
      (item) => item.id === paymentTarget
    );

    if (!targetInvoice) {
      setPaymentError("Please select a valid invoice.");
      return;
    }

    const balance = getBalance(targetInvoice);
    const amount = Number(paymentAmount);

    if (
      paymentAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      roundMoney(amount) > balance
    ) {
      setPaymentError(
        `Enter an amount greater than zero and not exceeding ${currency(balance)}.`
      );
      return;
    }

    if (!paymentDate) {
      setPaymentError("Please select payment date.");
      return;
    }

    const transaction = {
      id: createId(),
      date: paymentDate,
      amount: roundMoney(amount),
      method: paymentMethod,
      type: "Additional Payment",
      notes: paymentNotes.trim(),
    };

    setPayments((previous) =>
      previous.map((item) =>
        item.id === paymentTarget
          ? normalizePayment({
              ...item,
              method: paymentMethod,
              transactions: [...(item.transactions || []), transaction],
            })
          : item
      )
    );

    play("success");
    setNotification("Payment receipt saved successfully!");
    setActiveTab("list");
    setPaymentTarget("");
    setPaymentAmount("");
    setPaymentNotes("");
    setPaymentError("");
  };

  const deletePayment = (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    setPayments((previous) =>
      previous.filter((payment) => payment.id !== id)
    );
    setHistoryTarget(null);
    setNotification("Invoice deleted.");
    play("delete");
  };

  /* SEARCH / FILTER */

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesSearch = [
        payment.customer,
        payment.phone,
        payment.invoice,
        payment.packageName,
        payment.method,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesSearch &&
        (filter === "All" || getStatus(payment) === filter);
    });
  }, [payments, search, filter]);

  /* CALCULATIONS */

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + toAmount(payment.total), 0
  );

  const received = payments.reduce(
    (sum, payment) => sum + toAmount(payment.advance), 0
  );

  const pending = payments.reduce(
    (sum, payment) => sum + getBalance(payment), 0
  );

  const transactions = useMemo(
    () =>
      payments
        .flatMap((payment) =>
          (payment.transactions || []).map((transaction) => ({
            ...transaction,
            invoice: payment.invoice,
            customer: payment.customer,
            invoiceId: payment.id,
          }))
        )
        .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [payments]
  );

  const stats = [
    {
      title: "Total Billing",
      value: currency(totalRevenue),
      icon: Receipt,
      color: "text-[#102f62]",
      bg: "bg-[#eaf1fa]",
      accent: "from-[#102f62] to-blue-400",
    },
    {
      title: "Amount Received",
      value: currency(received),
      icon: IndianRupee,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      accent: "from-emerald-600 to-teal-300",
    },
    {
      title: "Pending Balance",
      value: currency(pending),
      icon: Clock3,
      color: "text-orange-600",
      bg: "bg-orange-50",
      accent: "from-orange-500 to-amber-300",
    },
    {
      title: "Total Invoices",
      value: payments.length,
      icon: Wallet,
      color: "text-[#a47b37]",
      bg: "bg-[#fff7e8]",
      accent: "from-[#a47b37] to-[#f0d89c]",
    },
  ];

  const selectedRecordInvoice = payments.find(
    (item) => item.id === paymentTarget
  );

  const selectedHistoryInvoice = payments.find(
    (item) => item.id === historyTarget
  );

  const editingInvoice = payments.find(
    (item) => item.id === editingId
  );

  const editingAdditionalReceived = editingInvoice
    ? roundMoney(
        (editingInvoice.transactions || [])
          .filter((transaction) => transaction.type !== "Initial Advance")
          .reduce((sum, transaction) => sum + toAmount(transaction.amount), 0)
      )
    : 0;

  /* PRINT PREMIUM INVOICE */

  const printInvoice = (payment) => {
    play("print");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      window.alert("Please allow popups to print the invoice.");
      return;
    }

    const safe = escapeHtml;
    const balance = getBalance(payment);
    const status = getStatus(payment);

    const historyRows = (payment.transactions || [])
      .map((transaction) => `
        <tr>
          <td>${safe(formatDate(transaction.date))}</td>
          <td>${safe(transaction.type)}</td>
          <td>${safe(transaction.method)}</td>
          <td style="text-align:right;font-weight:700">
            ${safe(currency(transaction.amount))}
          </td>
        </tr>
      `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <title>${safe(payment.invoice)}</title>
        <style>
          *{box-sizing:border-box}
          body{margin:0;padding:24px;font-family:Arial,sans-serif;background:#fff;color:#10264d}
          .page{max-width:820px;margin:auto;border:1px solid #e6d7b8}
          .gold-line{height:5px;background:linear-gradient(90deg,#a47b37,#f6e1a5,#9d7330)}
          .header{background:#102442;color:white;padding:35px 38px}
          .brand{display:flex;align-items:center;justify-content:space-between;gap:20px}
          .brand h1{font-size:24px;margin:0;letter-spacing:2px}
          .brand p{color:#e8ce96;font-size:12px;letter-spacing:4px;margin:8px 0}
          .premium{border:1px solid #c4a568;border-radius:20px;padding:8px 15px;font-size:10px;color:#e8ce96}
          .invoice-heading{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #ffffff30;margin-top:30px;padding-top:25px}
          .invoice-heading h2{font-size:36px;letter-spacing:3px;margin:0}
          .muted-light{font-size:11px;color:#b9c8da}
          .body{padding:35px 38px}
          .section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a47b37;font-weight:800;margin-bottom:15px}
          .customer{background:#f5f8fc;border-left:4px solid #c5a46b;padding:20px;border-radius:6px}
          .customer h3{margin:0 0 8px;font-size:18px}
          .customer p{margin:5px 0;color:#64748b;font-size:12px}
          .meta{display:flex;gap:12px;margin-top:15px}
          .meta>div{flex:1;border:1px solid #e5eaf2;padding:14px;border-radius:6px}
          .meta p{margin:5px 0;font-size:12px}
          .muted{color:#64748b;font-size:11px}
          table{width:100%;border-collapse:collapse;margin-top:15px}
          th{background:#102f62;color:white;font-size:11px;padding:13px;text-align:left}
          td{padding:13px;border-bottom:1px solid #e8edf4;font-size:12px;vertical-align:top}
          .summary{margin-top:25px;margin-left:auto;max-width:370px}
          .row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-bottom:1px solid #e8edf4;font-size:13px}
          .received{color:#16835c}
          .balance{background:#fff8e9;border:1px solid #e2c891;border-radius:8px;padding:20px;margin-top:16px}
          .balance small{color:#a47b37;font-size:11px;letter-spacing:1px}
          .balance strong{display:block;margin-top:8px;font-size:27px;color:#102f62}
          .notes{background:#f8fafc;border:1px solid #e8edf4;padding:16px;border-radius:8px;font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere}
          .footer{text-align:center;margin-top:38px;padding:25px;border-top:1px solid #e8edf4}
          .footer h4{margin:0;color:#102f62;font-size:13px;letter-spacing:1px}
          .footer p{font-size:11px;color:#64748b;line-height:1.8}
          .history-title{margin-top:32px;font-size:14px;font-weight:bold}
          @media print{
            body{padding:0}
            .page{border:none}
            .header,.gold-line,th,.balance{-webkit-print-color-adjust:exact;print-color-adjust:exact}
            @page{size:A4;margin:10mm}
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="gold-line"></div>
          <div class="header">
            <div class="brand">
              <div>
                <h1>STUDIO RAW</h1>
                <p>PICTUREZ</p>
                <div class="muted-light">CAPTURING TIMELESS MOMENTS</div>
              </div>
              <div class="premium">PREMIUM INVOICE</div>
            </div>
            <div class="invoice-heading">
              <div>
                <div class="muted-light">OFFICIAL BILLING DOCUMENT</div>
                <h2>INVOICE</h2>
              </div>
              <div style="text-align:right">
                <div class="muted-light">Invoice Number</div>
                <p style="color:#e8ce96;font-weight:bold">${safe(payment.invoice)}</p>
              </div>
            </div>
          </div>

          <div class="body">
            <div class="section-title">Client Information</div>
            <div class="customer">
              <h3>${safe(payment.customer)}</h3>
              <p>Phone: ${safe(payment.phone)}</p>
            </div>

            <div class="meta">
              <div>
                <p class="muted">Invoice Date</p>
                <p><strong>${safe(formatDate(payment.date))}</strong></p>
              </div>
              <div>
                <p class="muted">Payment Method</p>
                <p><strong>${safe(payment.method)}</strong></p>
              </div>
              <div>
                <p class="muted">Payment Status</p>
                <p><strong>${safe(status)}</strong></p>
              </div>
            </div>

            <h3 style="margin-top:32px;font-size:15px">Service Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th style="text-align:right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${safe(payment.packageName)}</strong>
                    <div class="muted" style="margin-top:6px">
                      Premium Photography & Creative Services
                    </div>
                  </td>
                  <td style="text-align:right;font-weight:bold">
                    ${safe(currency(payment.total))}
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="summary">
              <div class="row">
                <span>Package Amount</span>
                <strong>${safe(currency(payment.total))}</strong>
              </div>
              <div class="row received">
                <span>Total Received</span>
                <strong>${safe(currency(payment.advance))}</strong>
              </div>
              <div class="balance">
                <small>OUTSTANDING BALANCE</small>
                <strong>${safe(currency(balance))}</strong>
              </div>
            </div>

            ${payment.notes ? `
              <h3 style="margin-top:30px;font-size:14px">Special Notes</h3>
              <div class="notes">${safe(payment.notes)}</div>
            ` : ""}

            <div class="history-title">Payment Transaction History</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Method</th>
                  <th style="text-align:right">Received</th>
                </tr>
              </thead>
              <tbody>
                ${historyRows || '<tr><td colspan="4">No payments received</td></tr>'}
              </tbody>
            </table>

            <div class="footer">
              <h4>THANK YOU FOR CHOOSING US</h4>
              <p>
                Every moment is precious. Thank you for trusting
                Studio Raw Picturez to capture your beautiful memories.
              </p>
              <p style="color:#a47b37;font-weight:bold;letter-spacing:2px">
                STUDIO RAW PICTUREZ
              </p>
            </div>
          </div>
          <div class="gold-line"></div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for document layout before opening the print dialog.
    printWindow.onload = () => {
      printWindow.print();
    };

    setTimeout(() => {
      if (!printWindow.closed) printWindow.print();
    }, 500);
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-[#f4f7fc] p-3 text-[#10264d] sm:p-5 lg:p-8">
      <style>{`
        @keyframes srInvoiceFloat {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-5px); }
        }
        @keyframes srInvoiceShine {
          0% { transform:translateX(-150%) skewX(-25deg); }
          100% { transform:translateX(400%) skewX(-25deg); }
        }
        @keyframes srFadeUp {
          from { opacity:0;transform:translateY(15px); }
          to { opacity:1;transform:translateY(0); }
        }
        .sr-invoice-logo { animation:srInvoiceFloat 5s ease-in-out infinite; }
        .sr-invoice-shine { animation:srInvoiceShine 8s ease-in-out infinite; }
        .sr-page-enter { animation:srFadeUp .5s ease both; }
        @media(prefers-reduced-motion:reduce) {
          .sr-invoice-logo,.sr-invoice-shine,.sr-page-enter { animation:none; }
        }
      `}</style>

      {/* NOTIFICATION */}

      {notification && (
        <div className="fixed right-4 top-5 z-[10000] flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 text-sm font-bold text-emerald-700 shadow-2xl">
          <CheckCircle2 size={20} />
          {notification}
          <button type="button" onClick={() => setNotification("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* <div className="flex min-w-0 items-center gap-3"> */}
          {/* <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d6bd87] bg-gradient-to-br from-[#102f62] to-[#1d4c84] text-[#f0dba9] shadow-lg">
            <Wallet size={25} />
          </div> */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              {/* <span className="h-1.5 w-1.5 rounded-full bg-[#c5a66a]" /> */}
              {/* <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a47b37]">
                Studio Raw Picturez
              </p> */}
            </div>
            {/* <h1 className="text-xl font-black sm:text-2xl">
              Payment & Billing
            </h1> */}
            {/* <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Premium invoices, receipts and customer balances
            </p> */}
          </div>
        {/* </div> */}

        <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e1e8f2] bg-white p-1.5 shadow-sm">
          {[
            ["list", "Invoices", Receipt],
            ["invoice-form", "Add Invoice", Plus],
            ["record-payment", "Record Payment", CreditCard],
            ["history", "Payment History", History],
          ].map(([tab, label, Icon]) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                if (tab === "invoice-form") openCreateInvoice();
                else if (tab === "record-payment") openRecordPayment();
                else {
                  setActiveTab(tab);
                  play("click");
                }
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                activeTab === tab
                  ? "bg-[#102f62] text-white shadow-md"
                  : "text-[#536784] hover:bg-[#f5f8fc] hover:text-[#102f62]"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}

      {["list", "history"].includes(activeTab) && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      {/* INVOICE LIST */}

      {activeTab === "list" && (
        <section className={`${panelClass} sr-page-enter`}>
          <div className="flex flex-col gap-4 border-b border-[#e9eef5] bg-gradient-to-r from-white to-[#f9fbff] p-4 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[#a47b37]">
                <Sparkles size={15} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Billing Overview
                </span>
              </div>
              <h2 className="text-lg font-black">Invoice Management</h2>
              <p className="mt-1 text-xs text-slate-500">
                {filtered.length} of {payments.length} invoices
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-60">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search invoices..."
                  className={`${inputClass} pl-10`}
                />
              </div>
              <div className="sm:w-36">
                <CustomDropdown
                  value={filter}
                  options={filterOptions}
                  onChange={setFilter}
                />
              </div>
              <button type="button" onClick={openCreateInvoice} className={goldButton}>
                <Plus size={17} />
                New Invoice
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3f6fb] text-[#a47b37]">
                <Receipt size={28} />
              </div>
              <h3 className="mt-4 font-black">No invoices found</h3>
              <p className="mt-2 text-sm text-slate-500">
                Create a new invoice or adjust your search.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE CARDS */}

              <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
                {filtered.map((payment) => {
                  const balance = getBalance(payment);
                  const status = getStatus(payment);

                  return (
                    <article key={payment.id} className="group overflow-hidden rounded-[22px] border border-[#e0e8f2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                      <div className="h-1 bg-gradient-to-r from-[#a47b37] via-[#ead39c] to-[#102f62]" />
                      <div className="flex items-start justify-between gap-2 bg-[#f8fafd] p-4">
                        <div className="min-w-0">
                          <h3 className="break-words font-black">{payment.customer}</h3>
                          <p className="mt-1 break-all text-xs font-bold text-blue-700">
                            {payment.invoice}
                          </p>
                        </div>
                        <StatusBadge status={status} />
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone size={13} />{payment.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={13} />{formatDate(payment.date)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                          <MobileDetail label="Package" value={payment.packageName} />
                          <MobileDetail label="Payment Method" value={payment.method} />
                          <MobileDetail label="Total Bill" value={currency(payment.total)} />
                          <MobileDetail label="Status" value={status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#eef4fc] p-3">
                          <MobileDetail label="Received" value={currency(payment.advance)} highlight />
                          <MobileDetail label="Balance" value={currency(balance)} highlight />
                        </div>

                        {payment.notes && (
                          <div className="rounded-lg bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">Notes</p>
                            <p className="mt-1 break-words text-xs text-slate-600">
                              {payment.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 border-t pt-3">
                          {balance > 0 ? (
                            <button
                              type="button"
                              onClick={() => openRecordPayment(payment.id)}
                              className="flex items-center gap-1 rounded-lg bg-[#102f62] px-3 py-2 text-xs font-bold text-white"
                            >
                              <Plus size={14} /> Record
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <CheckCircle2 size={15} /> Fully Paid
                            </span>
                          )}

                          <button type="button" onClick={() => { setHistoryTarget(payment.id); play("open"); }} className="rounded-lg bg-purple-50 p-2 text-purple-700" title="Payment History">
                            <History size={17} />
                          </button>
                          <button type="button" onClick={() => openEdit(payment)} className="rounded-lg bg-blue-50 p-2 text-blue-700" title="Edit Invoice">
                            <Pencil size={17} />
                          </button>
                          <button type="button" onClick={() => printInvoice(payment)} className="rounded-lg bg-amber-50 p-2 text-amber-700" title="Print Premium Invoice">
                            <Printer size={17} />
                          </button>
                          <button type="button" onClick={() => deletePayment(payment.id)} className="rounded-lg bg-red-50 p-2 text-red-600" title="Delete Invoice">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-[#102f62] text-xs uppercase text-white">
                    <tr>
                      {[
                        "Invoice", "Customer", "Photography Package",
                        "Total", "Received", "Balance", "Status", "Actions",
                      ].map((heading) => (
                        <th key={heading} className="whitespace-nowrap px-4 py-4 font-bold">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1f6]">
                    {filtered.map((payment) => {
                      const balance = getBalance(payment);
                      return (
                        <tr key={payment.id} className="transition hover:bg-[#f4f8fe]">
                          <td className="px-4 py-4">
                            <p className="font-bold text-[#174b91]">{payment.invoice}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(payment.date)}</p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-bold">{payment.customer}</p>
                            <p className="mt-1 text-xs text-slate-500">{payment.phone}</p>
                          </td>
                          <td className="max-w-48 px-4 py-4 text-xs font-semibold">
                            {payment.packageName}
                          </td>
                          <td className="px-4 py-4 font-bold">{currency(payment.total)}</td>
                          <td className="px-4 py-4 font-black text-emerald-700">
                            {currency(payment.advance)}
                          </td>
                          <td className="px-4 py-4 font-black text-orange-600">
                            {currency(balance)}
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={getStatus(payment)} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              {balance > 0 && (
                                <button type="button" onClick={() => openRecordPayment(payment.id)} title="Record Payment" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100">
                                  <Plus size={16} />
                                </button>
                              )}
                              <button type="button" onClick={() => { setHistoryTarget(payment.id); play("open"); }} title="Payment History" className="rounded-lg bg-purple-50 p-2 text-purple-700 hover:bg-purple-100">
                                <History size={16} />
                              </button>
                              <button type="button" onClick={() => openEdit(payment)} title="Edit Invoice" className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100">
                                <Pencil size={16} />
                              </button>
                              <button type="button" onClick={() => printInvoice(payment)} title="Print Premium Invoice" className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100">
                                <Printer size={16} />
                              </button>
                              <button type="button" onClick={() => deletePayment(payment.id)} title="Delete Invoice" className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
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
            </>
          )}

          <div className="border-t border-[#edf1f6] px-5 py-4 text-xs text-slate-500">
            Showing {filtered.length} of {payments.length} invoices
          </div>
        </section>
      )}

      {/* =========================================
          PREMIUM ADD / EDIT INVOICE PAGE
      ========================================= */}

      {activeTab === "invoice-form" && (
        <div className="sr-page-enter space-y-6">
          {/* FORM PAGE HEADER */}

          <div className="relative overflow-hidden rounded-[26px] border border-[#d9c49a] bg-gradient-to-r from-[#102442] via-[#17365b] to-[#102f62] p-5 text-white shadow-xl sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full border border-[#d8bd83]/20" />

            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={backToList}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition hover:bg-white/20"
                  title="Back to invoices"
                >
                  <ArrowLeft size={19} />
                </button>
                <div>
                   <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8ce96]">
                    <Sparkles size={13} />
                    Premium Billing Studio
                  </p> 
                  <h2 className="text-xl font-black sm:text-2xl">
                    {editingId ? "Edit Premium Invoice" : "Create Premium Invoice"}
                  </h2> 
                  <p className="mt-1 text-xs text-[#b9c8da]">
                    Professional photography billing experience
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (editingId && editingInvoice) {
                    openEdit(editingInvoice);
                  } else {
                    setForm(createEmptyForm());
                    setError("");
                    play("click");
                  }
                }}
                className="flex items-center gap-2 rounded-xl border border-[#d9bc7e]/40 bg-[#d9bc7e]/10 px-4 py-2.5 text-xs font-bold text-[#f1deb4] transition hover:bg-[#d9bc7e]/20"
              >
                <RotateCcw size={15} />
                Reset Form
              </button>
            </div>
          </div>

          {/* IMPORTANT: FORM WRAPS BOTH LEFT INPUTS AND RIGHT PREVIEW SAVE BUTTON */}

          <form onSubmit={savePayment} className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            {/* LEFT FORM */}

            <div className="space-y-6 xl:col-span-7 2xl:col-span-8">
              {/* CUSTOMER */}

              <section className={`${panelClass} p-5 sm:p-7`}>
                <SectionHeading
                  icon={UserRound}
                  title="Customer & Contact Details"
                  subtitle="Enter customer information for the premium invoice"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Customer Full Name" required>
                    <input
                      required
                      autoFocus
                      value={form.customer}
                      onChange={(e) => update("customer", e.target.value)}
                      className={inputClass}
                      placeholder="Enter customer full name"
                    />
                  </FormField>

                  <FormField label="Phone Number" required>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      value={form.phone}
                      onChange={(e) =>
                        update("phone", e.target.value.replace(/\D/g, ""))
                      }
                      className={inputClass}
                      placeholder="Enter 10-digit phone number"
                    />
                  </FormField>
                </div>
              </section>

              {/* PHOTOGRAPHY PACKAGE - NO EVENT DROPDOWN */}

              <section className={`${panelClass} p-5 sm:p-7`}>
                <SectionHeading
                  icon={Camera}
                  title="Photography Package"
                  subtitle="Choose your photography or creative service"
                />

                <FormField label="Select Photography Package" required>
                  <CustomDropdown
                    value={form.packageName}
                    options={packageOptions}
                    onChange={(value) => update("packageName", value)}
                    required
                  />
                </FormField>

                <div className="relative mt-6 overflow-hidden rounded-[22px] border border-[#d7c49a] bg-gradient-to-br from-[#101f39] via-[#19375b] to-[#102442] p-6 text-white shadow-xl">
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[#d9bd80]/20" />
                  <div className="absolute right-3 top-3 h-20 w-20 rounded-full border border-[#d9bd80]/10" />

                  <div className="relative">
                    <div className="flex items-center gap-2 text-[#e4c98f]">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                        Selected Premium Service
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black leading-snug">
                      {form.packageName || "Select Photography Package"}
                    </h3>

                    <div className="mt-5 h-px bg-gradient-to-r from-[#d8bb7c]/70 to-transparent" />

                    <div className="mt-4 flex items-center gap-2 text-xs text-[#e4eaf4]">
                      <CheckCircle2 size={15} className="text-[#e4c98f]" />
                      Studio Raw Picturez Photography Services
                    </div>
                  </div>
                </div>
              </section>

              {/* BILLING DETAILS */}

              <section className={`${panelClass} p-5 sm:p-7`}>
                <SectionHeading
                  icon={IndianRupee}
                  title="Billing & Payment Details"
                  subtitle="Enter the package price and initial payment received"
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Total Package Amount (₹)" required>
                    <div className="relative">
                      <IndianRupee size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a47b37]" />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={form.total}
                        onChange={(e) => update("total", e.target.value)}
                        className={`${inputClass} pl-11`}
                        placeholder="e.g. 50000"
                      />
                    </div>
                  </FormField>

                  <FormField label="Initial Advance Received (₹)">
                    <div className="relative">
                      <IndianRupee size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.advance}
                        onChange={(e) => update("advance", e.target.value)}
                        className={`${inputClass} pl-11`}
                        placeholder="e.g. 20000"
                      />
                    </div>
                  </FormField>

                  <FormField label="Payment Method" required>
                    <CustomDropdown
                      value={form.method}
                      options={methodOptions}
                      onChange={(value) => update("method", value)}
                      required
                    />
                  </FormField>

                  <FormField label="Invoice Date" required>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      className={inputClass}
                    />
                  </FormField>
                </div>

                {editingId && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-6 text-blue-700">
                    <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                    Existing additional receipts remain saved separately.
                    This form edits the initial advance only.
                  </div>
                )}

                {/* LIVE CALCULATION */}

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Total Billing",
                      value: currency(form.total),
                      color: "text-[#102f62]",
                      bg: "bg-[#f1f5fb]",
                    },
                    {
                      label: "Total Received",
                      value: currency(
                        toAmount(form.advance) + editingAdditionalReceived
                      ),
                      color: "text-emerald-700",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Pending Balance",
                      value: currency(
                        Math.max(
                          0,
                          toAmount(form.total) -
                            toAmount(form.advance) -
                            editingAdditionalReceived
                        )
                      ),
                      color: "text-orange-600",
                      bg: "bg-orange-50",
                    },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-2xl p-4 ${item.bg}`}>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {item.label}
                      </p>
                      <p className={`mt-2 break-words text-lg font-black ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* NOTES */}

              <section className={`${panelClass} p-5 sm:p-7`}>
                <SectionHeading
                  icon={FileText}
                  title="Additional Notes & Instructions"
                  subtitle="Optional invoice terms or customer instructions"
                />

                <FormField label="Notes / Terms">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder="Payment notes or special instructions..."
                  />
                </FormField>
              </section>

              {/* ERROR */}

              {error && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              {/* SAVE BUTTONS - WORKING SUBMIT */}

              <div className={`${panelClass} flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between`}>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={17} className="text-emerald-600" />
                  Invoice details saved locally
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={backToList}
                    className="rounded-xl border border-[#dce5f1] px-5 py-3 text-sm font-bold text-[#536784] transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button type="submit" className={goldButton}>
                    <Save size={18} />
                    {editingId ? "Update Invoice" : "Save & Generate Invoice"}
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT LIVE PREMIUM BILL */}

            <div className="min-w-0 xl:col-span-5 2xl:col-span-4">
              <div className="space-y-4 xl:sticky xl:top-5">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e4e9f1] bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-xs font-black text-[#10264d]">
                      Live Premium Bill Preview
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff8e9] px-3 py-1 text-[10px] font-black text-[#a47b37]">
                    LIVE
                  </span>
                </div>

                <PremiumInvoicePreview
                  form={form}
                  invoiceNumber={editingInvoice?.invoice}
                  additionalReceived={editingAdditionalReceived}
                  editing={Boolean(editingId)}
                />

                <button type="submit" className={`${goldButton} w-full py-4`}>
                  <Save size={18} />
                  {editingId ? "Update Premium Invoice" : "Generate Premium Invoice"}
                  <ArrowUpRight size={17} />
                </button>

                <p className="text-center text-[11px] leading-5 text-slate-400">
                  Preview updates automatically as you enter customer and billing details.
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* =========================================
          RECORD ADDITIONAL PAYMENT
      ========================================= */}

      {activeTab === "record-payment" && (
        <div className="sr-page-enter space-y-6">
          <div className="flex items-center gap-3 rounded-[24px] border border-[#e0e8f2] bg-white p-5 shadow-sm">
            <button type="button" onClick={backToList} className="rounded-xl border p-2.5 hover:bg-slate-50">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-black">Record Payment / Collect Due</h2>
              <p className="mt-1 text-xs text-slate-500">
                Each payment is saved with its actual payment date
              </p>
            </div>
          </div>

          <form onSubmit={saveAdditionalPayment}>
            <div className="mx-auto max-w-3xl space-y-6">
              <div className={`${panelClass} p-5 sm:p-7`}>
                <SectionHeading icon={Receipt} title="Select Customer Invoice" />

                <FormField label="Choose Invoice" required>
                  <select
                    value={paymentTarget}
                    onChange={(e) => {
                      setPaymentTarget(e.target.value);
                      setPaymentError("");
                    }}
                    required
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select an invoice with pending balance...
                    </option>
                    {payments
                      .filter((item) => getBalance(item) > 0)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.customer} · {item.invoice} — Balance: {currency(getBalance(item))}
                        </option>
                      ))}
                  </select>
                </FormField>

                {selectedRecordInvoice && (
                  <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl bg-[#f8fafd] p-4 sm:grid-cols-3">
                    <MobileDetail label="Total Bill" value={currency(selectedRecordInvoice.total)} />
                    <MobileDetail label="Already Received" value={currency(selectedRecordInvoice.advance)} highlight />
                    <MobileDetail label="Pending Balance" value={currency(getBalance(selectedRecordInvoice))} highlight />
                  </div>
                )}
              </div>

              {selectedRecordInvoice && (
                <div className={`${panelClass} p-5 sm:p-7`}>
                  <SectionHeading
                    icon={CreditCard}
                    title="Payment Information"
                    subtitle="This receipt will be added to payment history"
                  />

                  <div className="space-y-5">
                    <FormField label="Payment Amount Received (₹)" required>
                      <input
                        type="number"
                        min="0.01"
                        max={getBalance(selectedRecordInvoice)}
                        step="0.01"
                        required
                        autoFocus
                        value={paymentAmount}
                        onChange={(e) => {
                          setPaymentAmount(e.target.value);
                          setPaymentError("");
                        }}
                        className={inputClass}
                        placeholder="Enter received amount"
                      />
                      <button
                        type="button"
                        onClick={() => setPaymentAmount(String(getBalance(selectedRecordInvoice)))}
                        className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs font-bold text-[#102f62] transition hover:bg-blue-100"
                      >
                        Pay Full Balance: {currency(getBalance(selectedRecordInvoice))}
                      </button>
                    </FormField>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField label="Payment Method" required>
                        <CustomDropdown
                          value={paymentMethod}
                          options={methodOptions}
                          onChange={setPaymentMethod}
                          required
                        />
                      </FormField>
                      <FormField label="Payment Date" required>
                        <input
                          type="date"
                          required
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className={inputClass}
                        />
                      </FormField>
                    </div>

                    <FormField label="Payment Notes / Transaction ID">
                      <input
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="UPI reference / Bank transaction ID"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  {paymentError && (
                    <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-700">
                      {paymentError}
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap justify-end gap-3 border-t pt-5">
                    <button type="button" onClick={backToList} className="rounded-xl border px-5 py-3 text-sm font-bold">
                      Cancel
                    </button>
                    <button type="submit" className={goldButton}>
                      <Check size={18} />
                      Save Payment Receipt
                    </button>
                  </div>
                </div>
              )}

              {!selectedRecordInvoice && (
                <div className="rounded-2xl border border-dashed border-[#dce5f1] bg-white p-10 text-center text-sm text-slate-500">
                  {payments.some((item) => getBalance(item) > 0)
                    ? "Select an invoice above to record a payment."
                    : "All invoices are fully paid. No pending balances."}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* =========================================
          PAYMENT HISTORY PAGE
      ========================================= */}

      {activeTab === "history" && (
        <section className={`${panelClass} sr-page-enter`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gradient-to-r from-white to-[#f8fbff] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">
                <History size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black">Payment History</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Date-wise recorded receipts
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3">
              <p className="text-xs font-semibold text-emerald-700">Total Collected</p>
              <p className="mt-1 text-lg font-black text-emerald-800">
                {currency(received)}
              </p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              No payment transactions available.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:hidden">
                {transactions.map((transaction) => (
                  <div
                    key={`${transaction.invoiceId}-${transaction.id}`}
                    className="rounded-2xl border border-[#e4e9f1] bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-[#10264d]">{transaction.customer}</p>
                        <p className="mt-1 text-xs text-blue-700">{transaction.invoice}</p>
                      </div>
                      <p className="text-sm font-black text-emerald-700">
                        {currency(transaction.amount)}
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3">
                      <MobileDetail label="Date" value={formatDate(transaction.date)} />
                      <MobileDetail label="Method" value={transaction.method} />
                      <MobileDetail label="Type" value={transaction.type} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="bg-[#102f62] text-xs uppercase text-white">
                    <tr>
                      {[
                        "Payment Date", "Invoice", "Customer",
                        "Payment Type", "Method", "Amount",
                      ].map((heading) => (
                        <th key={heading} className="px-5 py-4 font-bold">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf1f6]">
                    {transactions.map((transaction) => (
                      <tr key={`${transaction.invoiceId}-${transaction.id}`} className="hover:bg-blue-50/40">
                        <td className="px-5 py-4">{formatDate(transaction.date)}</td>
                        <td className="px-5 py-4 font-bold text-blue-700">{transaction.invoice}</td>
                        <td className="px-5 py-4 font-semibold">{transaction.customer}</td>
                        <td className="px-5 py-4">{transaction.type}</td>
                        <td className="px-5 py-4">{transaction.method}</td>
                        <td className="px-5 py-4 font-black text-emerald-700">
                          {currency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {/* =========================================
          PAYMENT HISTORY MODAL
      ========================================= */}

      {selectedHistoryInvoice && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a36]/65 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setHistoryTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Invoice payment history"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[26px] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="h-1.5 bg-gradient-to-r from-[#a47b37] via-[#f6e1a5] to-[#9d7330]" />

            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3 border-b pb-5">
                <div>
                  <p className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#a47b37]">
                    <Sparkles size={13} /> Transaction Records
                  </p>
                  <h2 className="text-xl font-black">Payment History</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedHistoryInvoice.customer} · {selectedHistoryInvoice.invoice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryTarget(null)}
                  className="rounded-xl bg-slate-100 p-2.5 hover:bg-slate-200"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Total", selectedHistoryInvoice.total],
                  ["Received", selectedHistoryInvoice.advance],
                  ["Balance", getBalance(selectedHistoryInvoice)],
                ].map(([label, amount]) => (
                  <div key={label} className="min-w-0 rounded-xl bg-[#f3f7fc] p-3">
                    <p className="text-[11px] text-slate-500">{label}</p>
                    <p className="mt-2 break-words text-sm font-black sm:text-lg">
                      {currency(amount)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {(selectedHistoryInvoice.transactions || []).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No receipts recorded.
                  </p>
                ) : (
                  selectedHistoryInvoice.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-start gap-3 rounded-2xl border border-[#e0e8f2] p-4"
                    >
                      <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                        <CheckCircle2 size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black">{transaction.type}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(transaction.date)} · {transaction.method}
                        </p>
                        {transaction.notes && (
                          <p className="mt-2 break-words text-xs text-slate-500">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-black text-emerald-700">
                        {currency(transaction.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => printInvoice(selectedHistoryInvoice)}
                  className={`${goldButton} flex-1`}
                >
                  <Printer size={17} />
                  Print Premium Bill
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTarget(null)}
                  className="flex-1 rounded-xl border border-[#dce5f1] px-5 py-3 text-sm font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
