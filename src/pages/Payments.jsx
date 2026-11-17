import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Wallet,
  Receipt,
  IndianRupee,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Printer,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  History,
  AlertCircle,
} from "lucide-react";
import {
  generateInvoicePdf,
  formatBookingService,
  getInvoiceServiceDisplay,
} from "../services/invoicePdfService";

/* =========================================
   STORAGE & CONSTANTS
========================================= */

const KEYS = {
  payments: "studioraw_payments",
  bookings: "studioraw_bookings",
  customers: "studio_raw_customers",
};

const EVENT = "studioraw:data-updated";

const METHODS = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque", "Other"];

/* =========================================
   HELPERS
========================================= */

const number = (v) => {
  const n = Number(typeof v === "string" ? v.replace(/[₹,\s]/g, "") : v);
  return Number.isFinite(n) ? n : 0;
};

const round = (v) => Math.round((number(v) + Number.EPSILON) * 100) / 100;

const money = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number(v));

const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const dateOf = (v) => {
  if (!v) return "";
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? ""
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
};

const showDate = (v) => {
  const s = dateOf(v);
  return s
    ? new Date(s + "T12:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
};

const uid = (prefix = "ID") =>
  `${prefix}-${
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }`;

function read(key) {
  try {
    const p = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(p)) return p;
    for (const k of [
      "data",
      "items",
      "records",
      "list",
      "payments",
      "bookings",
      "customers",
    ]) {
      if (Array.isArray(p?.[k])) return p[k];
    }
  } catch {}
  return [];
}

function readModule(primary, secondary) {
  const a = read(primary);
  return a.length ? a : read(secondary);
}

function nameOf(v) {
  return (
    v?.customerName ||
    (typeof v?.customer === "string" ? v.customer : v?.customer?.name) ||
    v?.name ||
    v?.clientName ||
    ""
  );
}

const bookingTotal = (v) =>
  number(v?.totalAmount ?? v?.total ?? v?.packageAmount ?? v?.amount ?? 0);

const totalOf = (v) =>
  number(v?.total ?? v?.totalAmount ?? v?.grandTotal ?? v?.bookingAmount ?? 0);

const txAmount = (v) =>
  number(v?.amount ?? v?.paidAmount ?? v?.receivedAmount ?? 0);

const invalid = ["failed", "cancelled", "canceled", "refunded", "reversed", "void"];

const validTx = (t) => !invalid.includes(String(t?.status || "").toLowerCase());

export const isBookingCancelled = (bookingOrInvoice) => {
  if (!bookingOrInvoice) return false;
  const s = String(
    bookingOrInvoice?.status ||
    bookingOrInvoice?.bookingStatus ||
    bookingOrInvoice?.booking_status ||
    ""
  )
    .trim()
    .toLowerCase();
  return s === "cancelled" || s === "canceled";
};

export const isConfirmedBooking = (booking) => {
  if (!booking) return false;
  const s = String(
    booking?.status ||
    booking?.bookingStatus ||
    booking?.booking_status ||
    ""
  )
    .trim()
    .toLowerCase();

  // Cancelled bookings cannot generate invoices or payments
  if (s === "cancelled" || s === "canceled") return false;

  // Active bookings eligible for invoice/payment workflow: Confirmed, Completed, and Pending
  return s === "confirmed" || s === "completed" || s === "pending" || !s;
};

function paidOf(invoice) {
  if (!invoice) return 0;

  let txSum = 0;
  let hasValidTxArray = false;
  let hasAdvanceInTx = false;

  for (const k of [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ]) {
    if (Array.isArray(invoice[k]) && invoice[k].length > 0) {
      hasValidTxArray = true;
      const valid = invoice[k].filter(validTx);
      txSum = round(valid.reduce((s, t) => s + Math.max(0, txAmount(t)), 0));
      hasAdvanceInTx = valid.some(
        (t) =>
          t.isAdvance ||
          String(t.note || "").toLowerCase().includes("advance") ||
          String(t.id || "").includes("ADV")
      );
      break;
    }
  }

  let directAdvance = 0;
  for (const k of [
    "advance",
    "advanceAmount",
    "advance_amount",
    "paidAmount",
    "paid_amount",
    "amountPaid",
    "receivedAmount",
    "amountReceived",
    "totalPaid",
    "totalReceived",
    "received",
  ]) {
    if (invoice[k] !== undefined && invoice[k] !== null && invoice[k] !== "") {
      directAdvance = Math.max(0, number(invoice[k]));
      break;
    }
  }

  if (hasValidTxArray) {
    if (hasAdvanceInTx || txSum >= directAdvance) {
      return round(txSum);
    }
    return round(directAdvance + txSum);
  }

  if (directAdvance > 0) {
    return round(directAdvance);
  }

  return ["paid", "completed", "fully paid"].includes(
    String(invoice?.status || "").toLowerCase()
  )
    ? totalOf(invoice)
    : 0;
}

const balanceOf = (i) => Math.max(0, round(totalOf(i) - paidOf(i)));

const statusOf = (i) => {
  const explicit = String(i?.status || i?.paymentStatus || "").trim().toLowerCase();
  if (explicit === "failed") return "Failed";
  if (explicit === "refunded") return "Refunded";
  if (explicit === "cancelled" || explicit === "canceled") return "Cancelled";

  const tot = totalOf(i);
  const paid = paidOf(i);

  if (tot > 0 && paid >= tot - 0.005) return "Paid";
  if (paid > 0) return "Partial";
  if (explicit === "unpaid") return "Unpaid";
  return "Pending";
};

function historyOf(invoice) {
  if (!invoice) return [];
  let txs = [];
  for (const k of [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ]) {
    if (Array.isArray(invoice?.[k]) && invoice[k].length > 0) {
      txs = invoice[k];
      break;
    }
  }

  const adv = number(invoice?.advance ?? invoice?.paid_amount ?? invoice?.paidAmount ?? 0);
  const hasAdvTx = txs.some(
    (t) =>
      t.isAdvance ||
      String(t.note || "").toLowerCase().includes("advance") ||
      String(t.id || "").includes("ADV")
  );

  if (adv > 0 && !hasAdvTx) {
    const advTx = {
      id: `${invoice.id || "invoice"}-advance`,
      amount: adv,
      paidAmount: adv,
      method: invoice.method || invoice.paymentMethod || "Cash",
      date: dateOf(invoice.date) || today(),
      note: "Booking Advance / Payment",
      status: "Paid",
      isAdvance: true,
    };
    return [advTx, ...txs];
  }

  if (txs.length > 0) {
    return txs;
  }

  const paid = paidOf(invoice);
  return paid > 0
    ? [
        {
          id: `${invoice.id || "invoice"}-legacy`,
          amount: paid,
          paidAmount: paid,
          method: invoice.method || invoice.paymentMethod || "Cash",
          date: invoice.date || invoice.createdAt || today(),
          note: "Booking Advance / Payment",
          status: "Paid",
          isAdvance: true,
        },
      ]
    : [];
}

function normalized(invoice) {
  const transactions = historyOf(invoice).map((t, i) => ({
    ...t,
    id: t.id || `${invoice.id || "invoice"}-${i}`,
    amount: txAmount(t),
    method: t.method || t.paymentMethod || invoice.method || "Cash",
    date: dateOf(t.date || t.paymentDate) || dateOf(invoice.date) || today(),
  }));

  const total = totalOf(invoice);
  const paid = paidOf({ ...invoice, transactions });
  const balance = Math.max(0, round(total - paid));
  const status = statusOf({ ...invoice, total, paid, status: invoice.status });

  return {
    ...invoice,
    id: invoice.id || uid("PAY"),
    invoice: invoice.invoice || invoice.invoiceNumber || "",
    customer: nameOf(invoice),
    customerId: invoice.customerId || "",
    bookingId: invoice.bookingId || invoice.booking_id || "",
    phone: invoice.phone || "",
    packageName: invoice.packageName || invoice.package || "",
    total,
    advance: number(invoice.advance ?? paid),
    paidAmount: paid,
    received: paid,
    balance,
    status,
    date: dateOf(invoice.date) || today(),
    method: invoice.method || "Cash",
    notes: invoice.notes || "",
    transactions,
  };
}

function nextInvoiceNumber(items) {
  const year = new Date().getFullYear();
  let max = 0;

  items.forEach((x) => {
    const m = String(x.invoice || x.invoiceNumber || "").match(
      new RegExp(`^SRP-${year}-(\\d+)$`)
    );
    if (m) max = Math.max(max, Number(m[1]));
  });

  return `SRP-${year}-${String(max + 1).padStart(5, "0")}`;
}

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#d7e5f4] bg-white px-4 py-3 text-sm font-medium text-[#173e73] outline-none transition placeholder:text-[#9badc0] focus:border-[#3778bb] focus:ring-4 focus:ring-[#e6f1ff]";

const primaryButtonClass =
  "flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#2e65a5] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95";

const EMPTY = {
  customerId: "",
  bookingId: "",
  customer: "",
  phone: "",
  packageName: "",
  total: "",
  initialPayment: "",
  method: "Cash",
  date: "",
  notes: "",
};

/* =========================================
   UI SUB-COMPONENTS
========================================= */

function Field({ label, required, children, hint }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#567493]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#8ca3bb]">{hint}</p>}
    </div>
  );
}

function Badge({ status }) {
  const theme = {
    Paid: "bg-[#e0f7eb] text-[#158563]",
    Partial: "bg-[#fff0d8] text-[#ac7625]",
    "Partially Paid": "bg-[#fff0d8] text-[#ac7625]",
    Pending: "bg-[#ffe7ec] text-[#bf4c65]",
    Unpaid: "bg-[#f1f5f9] text-[#64748b]",
    Failed: "bg-[#fee2e2] text-[#b91c1c]",
    Refunded: "bg-[#fef3c7] text-[#92400e]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
        theme[status] || theme.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function Modal({ title, subtitle, icon: Icon, onClose, children, width = "max-w-2xl" }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a34]/65 p-3 backdrop-blur-[3px] sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[94vh] w-full ${width} flex-col overflow-hidden rounded-[26px] border border-[#dbe8f7] bg-[#f8fbff] shadow-2xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0eaf6] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e4f0ff] text-[#245f9f]">
              <Icon size={23} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#10264d]">{title}</h2>
              <p className="mt-1 text-xs text-[#839bb4]">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-xl bg-[#edf4fc] p-2.5 text-[#527393] hover:bg-[#e1ecf8]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function Stat({ title, value, subtitle, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "from-[#eff7ff] to-[#d2e7ff]",
    green: "from-[#f0fcf7] to-[#cceedd]",
    amber: "from-[#fffaf0] to-[#ffe5bf]",
    purple: "from-[#faf7ff] to-[#e1d8fb]",
  };

  return (
    <div
      className={`sr-payment-3d rounded-[23px] border border-white bg-gradient-to-br ${colors[color]} p-4 shadow-[0_8px_25px_rgba(20,65,120,.06)] sm:p-5`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[#6c88a4]">{title}</p>
          <h3 className="mt-3 break-words text-xl font-black text-[#153f75] sm:text-2xl">
            {value}
          </h3>
        </div>
        <div className="rounded-2xl bg-white/50 p-3 text-[#2767a8]">
          <Icon size={21} />
        </div>
      </div>
      <p className="mt-5 border-t border-white/80 pt-3 text-[11px] text-[#7994ad]">
        {subtitle}
      </p>
    </div>
  );
}

async function pdfInvoice(invoice, action = "download", booking = null) {
  if (booking) {
    const s = String(booking?.status || booking?.bookingStatus || "").trim().toLowerCase();
    if (s === "cancelled" || s === "canceled") {
      return;
    }
  }
  return generateInvoicePdf(invoice, { booking, action });
}

/* =========================================
   COMPACT ROW ACTIONS COMPONENT
========================================= */

function PaymentRowActions({
  invoice,
  booking,
  isEligible,
  onCollect,
  onHistory,
  onDownload,
  onPrint,
  onEdit,
  onDelete,
}) {
  const isPaidInFull = balanceOf(invoice) <= 0;

  return (
    <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
      {/* 1. Add Payment */}
      {!isPaidInFull ? (
        <button
          type="button"
          title="Add Payment"
          aria-label="Add Payment"
          onClick={() => onCollect(invoice)}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
        >
          <Plus size={15} />
        </button>
      ) : (
        <span
          title="Paid in Full"
          aria-label="Paid in Full"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 opacity-60"
        >
          <CheckCircle2 size={15} />
        </span>
      )}

      {/* 2. Payment History */}
      <button
        type="button"
        title="Payment History"
        aria-label="Payment History"
        onClick={() => onHistory(invoice)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 transition hover:bg-purple-100"
      >
        <History size={15} />
      </button>

      {/* 3. Download Invoice */}
      <button
        type="button"
        title={isEligible ? "Download Invoice PDF" : "Invoice actions are unavailable for cancelled bookings."}
        aria-label="Download Invoice"
        disabled={!isEligible}
        onClick={() => isEligible && onDownload(invoice, booking)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Download size={15} />
      </button>

      {/* 4. Print Invoice */}
      <button
        type="button"
        title={isEligible ? "Print Invoice" : "Invoice actions are unavailable for cancelled bookings."}
        aria-label="Print Invoice"
        disabled={!isEligible}
        onClick={() => isEligible && onPrint(invoice, booking)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Printer size={15} />
      </button>

      {/* 5. Edit */}
      <button
        type="button"
        title="Edit Invoice"
        aria-label="Edit Invoice"
        onClick={() => onEdit(invoice)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100"
      >
        <Pencil size={15} />
      </button>

      {/* 6. Delete */}
      <button
        type="button"
        title="Delete Invoice"
        aria-label="Delete Invoice"
        onClick={() => onDelete(invoice)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

/* =========================================
   MAIN PAYMENTS PAGE
========================================= */

class PaymentsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Payments module render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <h3 className="text-base font-black text-rose-950">Something went wrong in Payments</h3>
            <p className="mt-2 text-xs text-rose-800">
              An unexpected display issue occurred while rendering payment records.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Reload Payments
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PaymentsInner() {
  const [payments, setPayments] = useState(() => read(KEYS.payments));
  const [bookings, setBookings] = useState(() =>
    readModule(KEYS.bookings, "studio_raw_bookings")
  );
  const [customers, setCustomers] = useState(() =>
    readModule(KEYS.customers, "studioraw_customers")
  );

  const refresh = () => {
    setBookings(readModule(KEYS.bookings, "studio_raw_bookings"));
    setCustomers(readModule(KEYS.customers, "studioraw_customers"));
    setPayments(read(KEYS.payments));
  };

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY, date: today() });
  const [receipt, setReceipt] = useState({
    amount: "",
    method: "Cash",
    date: today(),
    note: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isBookingCancelled = (booking) => {
    if (!booking) return false;
    const s = String(booking?.status || booking?.bookingStatus || "")
      .trim()
      .toLowerCase();
    return s === "cancelled" || s === "canceled";
  };

  const bookingMap = useMemo(() => {
    const map = new Map();
    for (const b of bookings || []) {
      if (b && b.id != null) {
        map.set(String(b.id), b);
      }
    }
    return map;
  }, [bookings]);

  const getLinkedBooking = useCallback(
    (invoice) => {
      if (!invoice) return null;
      const id =
        invoice?.bookingId?.id ??
        invoice?.bookingId ??
        invoice?.booking_id?.id ??
        invoice?.booking_id ??
        invoice?.booking?.id ??
        invoice?.booking;
      if (!id) return null;
      return bookingMap.get(String(id)) || null;
    },
    [bookingMap]
  );

  const isInvoiceEligible = (invoice) => {
    if (!invoice) return false;
    const invStatus = String(invoice?.status || invoice?.paymentStatus || "")
      .trim()
      .toLowerCase();
    if (invStatus === "cancelled" || invStatus === "canceled") {
      return false;
    }
    const booking = getLinkedBooking(invoice);
    if (booking && isBookingCancelled(booking)) {
      return false;
    }
    return true;
  };

  // Display all payment records, preserving financial records and history even if linked booking was cancelled
  const invoices = useMemo(
    () =>
      payments.map(normalized).filter((invoice) => {
        return Boolean(invoice.customer || invoice.invoice || invoice.id);
      }),
    [payments]
  );

  useEffect(() => {
    let isMounted = true;

    api.payments
      .list()
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results;

        if (isMounted && Array.isArray(items) && items.length > 0) {
          setPayments((prevLocal) => {
            const currentList =
              Array.isArray(prevLocal) && prevLocal.length > 0
                ? prevLocal
                : read(KEYS.payments);
            const localMap = new Map();
            currentList.forEach((p) => {
              if (p.id) localMap.set(String(p.id), p);
              if (p.invoice) localMap.set(String(p.invoice), p);
            });

            const merged = items.map((p) => {
              const existing =
                localMap.get(String(p.id)) ||
                (p.transaction_id ? localMap.get(String(p.transaction_id)) : null);
              if (existing) {
                return {
                  ...existing,
                  id: p.id || existing.id,
                  invoice: existing.invoice || p.transaction_id || `SRP-${p.id}`,
                  customer: existing.customer || p.customer_name || "Customer",
                  bookingId: existing.bookingId || p.booking || "",
                  total:
                    Number(existing.total) ||
                    Number(p.total_amount) ||
                    Number(p.amount) ||
                    0,
                  advance:
                    Number(existing.advance) || Number(p.paid_amount) || 0,
                  date: existing.date || p.payment_date || today(),
                  method: existing.method || p.payment_method || "Cash",
                  status: existing.status || p.status || "Pending",
                  transactions:
                    Array.isArray(existing.transactions) &&
                    existing.transactions.length > 0
                      ? existing.transactions
                      : [],
                };
              }
              return {
                id: p.id,
                invoice: p.transaction_id || `SRP-${p.id}`,
                customer: p.customer_name || "Customer",
                bookingId: p.booking || "",
                total: Number(p.total_amount) || Number(p.amount) || 0,
                advance: Number(p.paid_amount) || 0,
                date: p.payment_date || today(),
                method: p.payment_method || "Cash",
                status: p.status || "Pending",
                notes: p.notes || "",
                transactions: [],
              };
            });

            const remoteIds = new Set(items.map((p) => String(p.id)));
            currentList.forEach((loc) => {
              if (!remoteIds.has(String(loc.id))) {
                merged.push(loc);
              }
            });

            return merged;
          });
        }
      })
      .catch((err) => console.warn("Using local payments fallback:", err.message));

    const listener = () => refresh();

    window.addEventListener("storage", listener);
    window.addEventListener(EVENT, listener);
    window.addEventListener("focus", listener);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", listener);
      window.removeEventListener(EVENT, listener);
      window.removeEventListener("focus", listener);
    };
  }, []);

  const save = (next) => {
    try {
      localStorage.setItem(KEYS.payments, JSON.stringify(next));
      setPayments(next);
      window.dispatchEvent(
        new CustomEvent(EVENT, {
          detail: { module: "payments", key: KEYS.payments },
        })
      );
      setNotice("Payment records updated successfully.");
      return true;
    } catch {
      setError("Unable to save payment data.");
      return false;
    }
  };

  const close = () => {
    setModal("");
    setSelected(null);
    setEditing(null);
    setError("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, date: today() });
    setError("");
    setModal("form");
  };

  const openEdit = (i) => {
    setEditing(i);
    setForm({
      customerId: String(i.customerId || ""),
      bookingId: String(i.bookingId || ""),
      customer: i.customer || "",
      phone: i.phone || "",
      packageName: i.packageName || "",
      total: String(totalOf(i)),
      initialPayment: "",
      method: i.method || "Cash",
      date: dateOf(i.date) || today(),
      notes: i.notes || "",
    });
    setError("");
    setModal("form");
  };

  const openCollect = (i) => {
    setSelected(i);
    setReceipt({ amount: "", method: "Cash", date: today(), note: "" });
    setError("");
    setModal("collect");
  };

  const chooseCustomer = (id) => {
    const c = customers.find((c) => String(c.id) === String(id));
    setForm((p) => ({
      ...p,
      customerId: id,
      bookingId: "",
      customer: c ? nameOf(c) : "",
      phone: c?.phone || "",
      packageName: "",
      total: "",
    }));
  };

  const chooseBooking = (id) => {
    const b = (bookings || []).find((b) => b && String(b.id) === String(id));
    if (!b) {
      setForm((p) => ({ ...p, bookingId: "" }));
      return;
    }
    if (!isConfirmedBooking(b)) {
      setError("Invoice can only be generated for active (Confirmed, Pending, or Completed) bookings.");
      setForm((p) => ({ ...p, bookingId: "" }));
      return;
    }
    setError("");
    const c = (customers || []).find((c) => c && String(c.id) === String(b.customerId));
    const serviceName = getInvoiceServiceDisplay(null, b);
    setForm((p) => ({
      ...p,
      bookingId: String(b.id),
      customerId: String(b.customerId || p.customerId || ""),
      customer: nameOf(b) || nameOf(c) || p.customer,
      phone: b.phone || c?.phone || p.phone,
      service: b.service || "",
      customService: b.customService || b.custom_service || "",
      event: b.event || "",
      customEvent: b.customEvent || b.custom_event || "",
      packageName: serviceName,
      total: String(bookingTotal(b)),
    }));
  };

  const availableBookings = useMemo(
    () =>
      (bookings || []).filter(
        (b) =>
          b &&
          isConfirmedBooking(b) &&
          (!form.customerId || String(b.customerId || "") === String(form.customerId))
      ),
    [bookings, form.customerId]
  );

  const linkedInvoice = useMemo(
    () =>
      !editing && form.bookingId
        ? invoices.find((i) => String(i.bookingId || "") === String(form.bookingId))
        : null,
    [editing, form.bookingId, invoices]
  );

  const submitInvoice = async (e) => {
    e.preventDefault();
    setError("");
    const total = round(number(form.total));
    const initial = round(number(form.initialPayment));

    if (!form.bookingId) {
      return setError("Select an active booking to generate an invoice.");
    }

    const selectedBooking = (bookings || []).find(
      (b) => b && String(b.id) === String(form.bookingId)
    );
    if (!selectedBooking || !isConfirmedBooking(selectedBooking)) {
      return setError("Invoice can only be generated for active (Confirmed, Pending, or Completed) bookings.");
    }

    if (!form.customer.trim()) {
      return setError("Customer name is required.");
    }

    if (total <= 0) {
      return setError("Enter a valid total amount.");
    }

    if (!editing && (initial < 0 || initial > total)) {
      return setError("Advance must be between 0 and the invoice total.");
    }

    if (editing && total < paidOf(editing)) {
      return setError(
        "Invoice total cannot be lower than amount already received."
      );
    }

    if (form.bookingId) {
      const duplicate = invoices.find(
        (i) =>
          String(i.bookingId || "") === String(form.bookingId) &&
          String(i.id) !== String(editing?.id || "")
      );
      if (duplicate) {
        return setError(
          `This booking already has invoice ${
            duplicate.invoice || duplicate.id
          }. Use Add Payment on the existing invoice.`
        );
      }
    }

    const now = new Date().toISOString();

    if (editing) {
      try {
        await api.payments.update(editing.id, {
          customer_name: form.customer.trim(),
          total_amount: total,
          payment_method: form.method,
          notes: form.notes.trim(),
        });
      } catch (err) {
        console.warn("Backend payment update notice:", err.message);
      }

      const next = payments.map((item) => {
        if (String(item.id) !== String(editing.id)) return item;
        const prev = normalized(item);
        const b = bookings.find(
          (x) => String(x.id) === String(form.bookingId || prev.bookingId)
        );
        const serviceName = b
          ? getInvoiceServiceDisplay(null, b)
          : form.packageName.trim() || prev.packageName;
        const updated = {
          ...prev,
          customerId: form.customerId,
          bookingId: form.bookingId || prev.bookingId,
          customer: form.customer.trim(),
          phone: form.phone.trim(),
          service: b?.service || prev.service || "",
          customService:
            b?.customService || b?.custom_service || prev.customService || "",
          event: b?.event || prev.event || "",
          customEvent:
            b?.customEvent || b?.custom_event || prev.customEvent || "",
          packageName: serviceName,
          total,
          date: form.date || today(),
          method: form.method,
          notes: form.notes.trim(),
          updatedAt: now,
        };
        return {
          ...updated,
          advance: paidOf(updated),
          status: statusOf(updated),
        };
      });
      if (save(next)) close();
      return;
    }

    let createdId = uid("PAY");
    const invNumber = nextInvoiceNumber(payments);

    try {
      const remote = await api.payments.create({
        customer_name: form.customer.trim(),
        total_amount: total,
        paid_amount: initial,
        payment_method: form.method,
        payment_date: form.date || today(),
        status: initial >= total ? "Paid" : initial > 0 ? "Partial" : "Pending",
        transaction_id: invNumber,
        notes: form.notes.trim(),
      });

      if (remote && remote.id) createdId = remote.id;
    } catch (err) {
      console.warn("Backend payment create notice:", err.message);
    }

    const transactions =
      initial > 0
        ? [
            {
              id: uid("TXN"),
              amount: initial,
              method: form.method,
              date: form.date || today(),
              note: "Initial / Advance Payment",
              status: "Paid",
              createdAt: now,
            },
          ]
        : [];

    const serviceName = selectedBooking
      ? getInvoiceServiceDisplay(null, selectedBooking)
      : form.packageName.trim();

    const invoice = {
      id: createdId,
      invoice: invNumber,
      customerId: form.customerId,
      bookingId: form.bookingId,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      service: selectedBooking?.service || form.service || "",
      customService:
        selectedBooking?.customService ||
        selectedBooking?.custom_service ||
        form.customService ||
        "",
      event: selectedBooking?.event || form.event || "",
      customEvent:
        selectedBooking?.customEvent ||
        selectedBooking?.custom_event ||
        form.customEvent ||
        "",
      packageName: serviceName,
      total,
      advance: initial,
      method: form.method,
      date: form.date || today(),
      notes: form.notes.trim(),
      transactions,
      createdAt: now,
      updatedAt: now,
    };

    invoice.status = statusOf(invoice);
    if (save([invoice, ...payments])) close();
  };

  const collectPayment = (e) => {
    e.preventDefault();
    setError("");
    if (!selected) return;

    const latest = read(KEYS.payments);
    const raw =
      latest.find((i) => String(i.id) === String(selected.id)) || selected;

    if (!raw) return setError("Invoice not found. Refresh and try again.");

    const amount = round(number(receipt.amount));
    const pending = balanceOf(raw);

    if (amount <= 0 || amount > pending) {
      return setError(`Enter an amount between ₹0.01 and ${money(pending)}.`);
    }

    const now = new Date().toISOString();
    const invoice = normalized(raw);
    const newPaid = round(invoice.received + amount);
    const newTotal = invoice.total;
    const newBalance = Math.max(0, round(newTotal - newPaid));
    const newStatus = newPaid >= newTotal - 0.005 ? "Paid" : "Partial";

    const newTxn = {
      id: uid("TXN"),
      amount,
      paidAmount: amount,
      method: receipt.method,
      date: receipt.date || today(),
      note: receipt.note.trim() || "Payment Received",
      status: "Paid",
      createdAt: now,
    };

    const nextTransactions = [...invoice.transactions, newTxn];

    const next = latest.map((item) => {
      if (String(item.id) !== String(selected.id)) return item;
      return {
        ...invoice,
        paidAmount: newPaid,
        paid_amount: newPaid,
        received: newPaid,
        balance: newBalance,
        pending: newBalance,
        status: newStatus,
        paymentStatus: newStatus,
        method: receipt.method,
        paymentMethod: receipt.method,
        transactions: nextTransactions,
        updatedAt: now,
      };
    });

    if (save(next)) {
      // Sync with booking records if linked
      try {
        const bKey = KEYS.bookings;
        const bKeyAlt = "studio_raw_bookings";
        [bKey, bKeyAlt].forEach((key) => {
          const rawBookings = read(key);
          if (Array.isArray(rawBookings) && rawBookings.length > 0) {
            const bIndex = rawBookings.findIndex(
              (b) => b && String(b.id) === String(invoice.bookingId)
            );
            if (bIndex >= 0) {
              const updatedB = {
                ...rawBookings[bIndex],
                received: newPaid,
                balance: newBalance,
                paymentStatus: newStatus,
              };
              const nextBookings = [...rawBookings];
              nextBookings[bIndex] = updatedB;
              localStorage.setItem(key, JSON.stringify(nextBookings));
              window.dispatchEvent(
                new CustomEvent(EVENT, {
                  detail: { key, module: "bookings" },
                })
              );
            }
          }
        });
      } catch (err) {
        console.warn("Could not sync booking payment state:", err);
      }

      setNotice(
        `Payment ${money(amount)} added to invoice ${
          selected.invoice || selected.id
        }. Same invoice number retained.`
      );
      close();

      // Background non-blocking API call
      api.payments
        .update(selected.id, {
          paid_amount: newPaid,
          status: newStatus,
          payment_method: receipt.method,
        })
        .catch((err) =>
          console.warn("Background collect update notice:", err.message)
        );
    }
  };

  const deleteInvoice = () => {
    if (!selected) return;
    if (paidOf(selected) > 0) {
      return setError(
        "Invoice has received payments. Deleting it would erase payment history. Keep the invoice for your records."
      );
    }
    const next = payments.filter((i) => String(i.id) !== String(selected.id));
    if (save(next)) {
      close();
      api.payments
        .delete(selected.id)
        .catch((err) => console.warn("Background delete notice:", err.message));
    }
  };

  const summary = useMemo(() => {
    let total = 0;
    let received = 0;
    let pending = 0;
    let paidCount = 0;
    let partialCount = 0;

    for (let idx = 0; idx < invoices.length; idx++) {
      const inv = invoices[idx];
      total += inv.total;
      if (inv.status !== "Failed" && inv.status !== "Unpaid") {
        received += inv.received;
      }
      pending += inv.balance;
      if (inv.status === "Paid") {
        paidCount++;
      } else if (inv.status === "Partial" || inv.status === "Partially Paid") {
        partialCount++;
      }
    }

    return {
      total: round(total),
      received: round(received),
      pending: round(pending),
      paid: paidCount,
      partial: partialCount,
    };
  }, [invoices]);

  const percent = summary.total
    ? Math.min(100, (summary.received / summary.total) * 100)
    : 0;

  const months = useMemo(
    () =>
      [...new Set(invoices.map((i) => dateOf(i.date).slice(0, 7)).filter(Boolean))]
        .sort()
        .reverse(),
    [invoices]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((i) => {
        if (statusFilter !== "All" && i.status !== statusFilter) return false;
        if (monthFilter !== "All" && String(i.date).slice(0, 7) !== monthFilter)
          return false;
        if (!q) return true;
        return (
          String(i.invoice || "").toLowerCase().includes(q) ||
          String(i.customer || "").toLowerCase().includes(q) ||
          String(i.phone || "").toLowerCase().includes(q) ||
          String(i.packageName || "").toLowerCase().includes(q) ||
          String(i.bookingId || "").toLowerCase().includes(q) ||
          String(i.method || "").toLowerCase().includes(q) ||
          String(i.status || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [invoices, search, statusFilter, monthFilter]);

  const exportCSV = () => {
    const rows = [
      [
        "Invoice",
        "Date",
        "Customer",
        "Phone",
        "Booking ID",
        "Service",
        "Total",
        "Received",
        "Pending",
        "Status",
      ],
      ...filtered.map((i) => [
        i.invoice,
        i.date,
        i.customer,
        i.phone,
        i.bookingId,
        getInvoiceServiceDisplay(i, getLinkedBooking(i)),
        totalOf(i),
        paidOf(i),
        balanceOf(i),
        statusOf(i),
      ]),
    ];
    const esc = (v) => {
      const raw = String(v ?? "");
      const safe = /^\s*[=+\-@\t\r]/.test(raw) ? "'" + raw : raw;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StudioRaw-Payments-${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f5faff] via-[#edf5ff] to-[#e6f1ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8">
      <style>{`
        @keyframes srPayEnter {
          from {
            opacity: 0;
            transform: perspective(1200px) translateY(22px) rotateX(3deg);
          }
          to {
            opacity: 1;
            transform: perspective(1200px) translateY(0) rotateX(0);
          }
        }
        @keyframes srPayFloat {
          0%, 100% {
            transform: perspective(1200px) translateY(0);
          }
          50% {
            transform: perspective(1200px) translateY(-7px) rotateX(1deg);
          }
        }
        .sr-payment-3d {
          animation: srPayEnter 0.65s ease-out both, srPayFloat 5.5s ease-in-out 0.65s infinite;
          transform-style: preserve-3d;
        }
        .sr-payment-3d:hover {
          animation-play-state: paused;
          box-shadow: 0 18px 35px rgba(16, 38, 77, 0.12);
        }
        @media (prefers-reduced-motion: reduce) {
          .sr-payment-3d {
            animation: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1650px] space-y-6">
        {/* TOP HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcecff] text-[#245f9f]">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black sm:text-2xl">Payments</h1>
              <p className="mt-1 text-xs text-[#8099b3]">
                Studio Raw Picturez / Finance
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7] transition hover:bg-[#f3f8fe]"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7] transition hover:bg-[#f3f8fe]"
            >
              <Download size={17} />
              Export CSV
            </button>
            <button
              type="button"
              onClick={openCreate}
              className={primaryButtonClass}
            >
              <Plus size={18} />
              Add Invoice
            </button>
          </div>
        </div>

        {/* NOTIFICATION NOTICE */}
        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#bce8d0] bg-[#eafaf1] p-3 text-sm font-bold text-[#177d5f]">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              {notice}
            </span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notice"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* 4 SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <Stat
            title="Total Invoice Amount"
            value={money(summary.total)}
            subtitle={`${invoices.length} invoices`}
            icon={Receipt}
          />
          <Stat
            title="Amount Received"
            value={money(summary.received)}
            subtitle={`${summary.paid} fully paid`}
            icon={CheckCircle2}
            color="green"
          />
          <Stat
            title="Pending Balance"
            value={money(summary.pending)}
            subtitle="Outstanding amount"
            icon={Clock3}
            color="amber"
          />
          <Stat
            title="Partial Payments"
            value={summary.partial}
            subtitle="Partially paid invoices"
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* PAYMENT COLLECTION OVERVIEW */}
        <div className="rounded-[24px] border border-[#d9e7f6] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-[#153d70]">
                Payment Collection Overview
              </h2>
              <p className="mt-1 text-xs text-[#8ba2ba]">
                Total received and outstanding amount
              </p>
            </div>
            <span className="rounded-xl bg-[#e5f6ed] px-4 py-2 text-sm font-black text-[#168363]">
              {percent.toFixed(1)}% Collected
            </span>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e7eff9]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#17866c] to-[#77d1b7] transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs font-bold">
            <span className="text-[#168363]">
              Received: {money(summary.received)}
            </span>
            <span className="text-[#b77b2c]">
              Pending: {money(summary.pending)}
            </span>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}
        <div className="flex flex-col gap-3 rounded-[22px] border border-[#d9e7f6] bg-white p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ba3ba]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice, customer, booking..."
              className={`${inputClass} pl-11`}
            />
          </div>
          <select
            aria-label="Filter by payment status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClass} lg:w-44`}
          >
            {["All", "Paid", "Partial", "Pending", "Unpaid"].map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Status" : s}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className={`${inputClass} lg:w-48`}
          >
            <option value="All">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* PAYMENT RECORDS SECTION */}
        <div className="overflow-hidden rounded-[25px] border border-[#d9e7f6] bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3edf7] p-5">
            <div>
              <h2 className="text-base font-black text-[#10264d]">
                Payment Records
              </h2>
              <p className="mt-1 text-xs text-[#8ca2b9]">
                {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"} · Add Payment updates the same invoice number
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {filtered.length} Invoices
              </span>
              <Receipt size={22} className="text-[#3575b6]" />
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1250px] border-collapse text-left">
                  <thead className="border-b border-[#dce8f6] bg-[#edf5ff]">
                    <tr className="text-[11px] font-black uppercase tracking-wider text-[#6685a4]">
                      {/* 1. Invoice Number */}
                      <th className="w-[140px] px-4 py-4 text-left">
                        Invoice Number
                      </th>
                      {/* 2. Customer */}
                      <th className="w-[190px] px-4 py-4 text-left">
                        Customer
                      </th>
                      {/* 3. Date */}
                      <th className="w-[120px] px-4 py-4 text-left">
                        Date
                      </th>
                      {/* 4. Service */}
                      <th className="w-[180px] px-4 py-4 text-left">
                        Service
                      </th>
                      {/* 5. Total */}
                      <th className="w-[120px] px-4 py-4 text-right">
                        Total
                      </th>
                      {/* 6. Received */}
                      <th className="w-[120px] px-4 py-4 text-right">
                        Received
                      </th>
                      {/* 7. Pending */}
                      <th className="w-[120px] px-4 py-4 text-right">
                        Pending
                      </th>
                      {/* 8. Status */}
                      <th className="w-[120px] px-4 py-4 text-center">
                        Status
                      </th>
                      {/* 9. Actions */}
                      <th className="w-[240px] px-4 py-4 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8eff8]">
                    {filtered.map((item) => {
                      const linkedBooking = getLinkedBooking(item);
                      const serviceDisplay = getInvoiceServiceDisplay(
                        item,
                        linkedBooking
                      );
                      const isEligible = isInvoiceEligible(item);

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-[#f5faff]"
                        >
                          {/* 1. Invoice Number: left aligned */}
                          <td className="px-4 py-3.5 text-left text-sm font-black text-[#245f9f] align-middle">
                            {item.invoice || item.id}
                          </td>

                          {/* 2. Customer: left aligned, with phone below */}
                          <td className="px-4 py-3.5 text-left align-middle">
                            <p className="text-sm font-bold text-[#173f72]">
                              {item.customer || "—"}
                            </p>
                            <p className="mt-0.5 text-xs text-[#8ba2b9]">
                              {item.phone || "No phone"}
                            </p>
                          </td>

                          {/* 3. Date: consistent formatting */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-left text-sm text-[#6785a4] align-middle">
                            {showDate(item.date)}
                          </td>

                          {/* 4. Service: linked service */}
                          <td className="px-4 py-3.5 text-left text-sm font-semibold text-[#173f72] align-middle">
                            {serviceDisplay || "—"}
                          </td>

                          {/* 5. Total: right aligned */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-black text-[#173f72] align-middle">
                            {money(item.total)}
                          </td>

                          {/* 6. Received: right aligned */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-black text-[#168363] align-middle">
                            {money(item.received)}
                          </td>

                          {/* 7. Pending: right aligned */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-black text-[#b77b2c] align-middle">
                            {money(item.balance)}
                          </td>

                          {/* 8. Status: centered */}
                          <td className="whitespace-nowrap px-4 py-3.5 text-center align-middle">
                            <Badge status={item.status} />
                          </td>

                          {/* 9. Actions: dedicated column */}
                          <td className="px-4 py-3.5 text-center align-middle">
                            <PaymentRowActions
                              invoice={item}
                              booking={linkedBooking}
                              isEligible={isEligible}
                              onCollect={openCollect}
                              onHistory={(i) => {
                                setSelected(i);
                                setModal("history");
                              }}
                              onDownload={(i, b) => pdfInvoice(i, "download", b)}
                              onPrint={(i, b) => pdfInvoice(i, "print", b)}
                              onEdit={openEdit}
                              onDelete={(i) => {
                                setSelected(i);
                                setError("");
                                setModal("delete");
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
                {filtered.map((item) => {
                  const linkedBooking = getLinkedBooking(item);
                  const serviceDisplay = getInvoiceServiceDisplay(
                    item,
                    linkedBooking
                  );
                  const isEligible = isInvoiceEligible(item);

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-[#dce8f6] bg-[#fbfdff] p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="break-all text-sm font-black text-[#245f9f]">
                            {item.invoice || item.id}
                          </p>
                          <p className="mt-1 text-xs text-[#8ba2b9]">
                            {showDate(item.date)}
                          </p>
                        </div>
                        <Badge status={item.status} />
                      </div>
                      <p className="mt-3 font-black text-[#173f72]">
                        {item.customer}
                      </p>
                      <p className="mt-0.5 text-xs text-[#819ab3]">
                        {item.phone || "No phone"}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-[#173f72]">
                        {serviceDisplay || "—"}
                      </p>
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#edf5ff] p-3">
                        {[
                          ["Total", item.total],
                          ["Received", item.received],
                          ["Pending", item.balance],
                        ].map(([label, v]) => (
                          <div key={label}>
                            <p className="text-[10px] text-[#829ab3]">{label}</p>
                            <p className="mt-1 break-words text-xs font-black text-[#173f72]">
                              {money(v)}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 border-t border-[#e5edf7] pt-3 flex justify-center">
                        <PaymentRowActions
                          invoice={item}
                          booking={linkedBooking}
                          isEligible={isEligible}
                          onCollect={openCollect}
                          onHistory={(i) => {
                            setSelected(i);
                            setModal("history");
                          }}
                          onDownload={(i, b) => pdfInvoice(i, "download", b)}
                          onPrint={(i, b) => pdfInvoice(i, "print", b)}
                          onEdit={openEdit}
                          onDelete={(i) => {
                            setSelected(i);
                            setError("");
                            setModal("delete");
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Receipt size={42} className="text-[#82acd5]" />
              <h3 className="mt-4 font-black text-[#24558a]">
                {payments.length === 0
                  ? "No payment records available."
                  : "No Payment Records"}
              </h3>
              <p className="mt-2 text-sm text-[#8ba2b9]">
                {payments.length === 0
                  ? "Record your first payment to get started."
                  : "Add your first invoice or change filters."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT INVOICE MODAL */}
      {modal === "form" && (
        <Modal
          title={editing ? "Edit Invoice" : "Create New Invoice"}
          subtitle={
            editing
              ? `Invoice ${editing.invoice || editing.id} · Same number retained`
              : "Studio Raw Picturez Payment Form"
          }
          icon={Receipt}
          onClose={close}
        >
          <form onSubmit={submitInvoice} className="space-y-5">
            {editing && (
              <div className="rounded-xl border border-[#cfe3f8] bg-[#eaf4ff] p-4 text-sm font-bold text-[#245f9f]">
                Invoice Number: {editing.invoice || editing.id} (unchanged)
                <p className="mt-2 text-xs font-medium">
                  To collect a new installment, use Add Payment. Editing invoice details does not replace old payment history.
                </p>
                <button
                  type="button"
                  onClick={() => openCollect(editing)}
                  disabled={balanceOf(editing) <= 0}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#168363] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add Payment to This Invoice
                </button>
              </div>
            )}

            <Field label="Select Customer">
              <select
                aria-label="Select Customer"
                value={form.customerId}
                onChange={(e) => chooseCustomer(e.target.value)}
                className={inputClass}
              >
                <option value="">Manual Entry / Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {nameOf(c)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Select Booking" required>
              <select
                aria-label="Select Booking"
                value={form.bookingId}
                onChange={(e) => chooseBooking(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select Booking</option>
                {availableBookings.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {nameOf(b)} - {b.event || "Booking"} ({b.status || "Pending"}) - {money(bookingTotal(b))}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#8ca3bb]">
                Active bookings (Confirmed, Completed, and Pending) are available for invoice generation.
              </p>
            </Field>

            {linkedInvoice && (
              <div className="rounded-xl border border-[#bce8d0] bg-[#eafaf1] p-4 text-sm text-[#177d5f]">
                <p className="font-black">
                  Existing Invoice Found: {linkedInvoice.invoice || linkedInvoice.id}
                </p>
                <p className="mt-1 text-xs">
                  Do not create another invoice. Add the new payment to the existing invoice.
                </p>
                <button
                  type="button"
                  onClick={() => openCollect(linkedInvoice)}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#168363] px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Plus size={16} />
                  Add Payment to Existing Invoice
                </button>
              </div>
            )}

            {[
              ["Customer Name", "customer", "text"],
              ["Phone Number", "phone", "tel"],
              ["Package / Service", "packageName", "text"],
              ["Total Invoice Amount", "total", "number"],
            ].map(([label, key, type]) => (
              <Field
                key={key}
                label={label}
                required={key === "customer" || key === "total"}
              >
                <input
                  type={type}
                  min={type === "number" ? "0.01" : undefined}
                  step={type === "number" ? "0.01" : undefined}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  className={inputClass}
                  required={key === "customer" || key === "total"}
                />
              </Field>
            ))}

            {!editing && (
              <Field label="Advance Payment">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.initialPayment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, initialPayment: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="Enter advance amount"
                />
              </Field>
            )}

            <Field label="Invoice Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Payment Method">
              <select
                aria-label="Payment Method"
                value={form.method}
                onChange={(e) =>
                  setForm((p) => ({ ...p, method: e.target.value }))
                }
                className={inputClass}
              >
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="rounded-2xl bg-[#eaf4ff] p-4">
              <p className="text-xs font-bold text-[#6e8ca9]">
                Payment Summary
              </p>
              {[
                ["Total", number(form.total)],
                [
                  "Received",
                  editing
                    ? paidOf(editing)
                    : number(form.initialPayment),
                ],
                [
                  "Pending",
                  Math.max(
                    0,
                    number(form.total) -
                      (editing
                        ? paidOf(editing)
                        : number(form.initialPayment))
                  ),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="mt-3 flex justify-between gap-3 text-sm"
                >
                  <span>{label}</span>
                  <strong>{money(value)}</strong>
                </div>
              ))}
            </div>

            {error && (
              <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!!linkedInvoice}
                className={`${primaryButtonClass} flex-1 disabled:cursor-not-allowed disabled:opacity-40`}
              >
                <Save size={17} />
                {editing ? "Save Changes" : "Save & Generate Invoice"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* COLLECT PAYMENT MODAL */}
      {modal === "collect" && selected && (
        <Modal
          title="Add Payment to Existing Invoice"
          subtitle={`Same Invoice Number: ${selected.invoice || selected.id}`}
          icon={IndianRupee}
          onClose={close}
          width="max-w-lg"
        >
          <form onSubmit={collectPayment} className="space-y-5">
            <div className="rounded-2xl bg-[#eaf4ff] p-5">
              <p className="font-black text-[#173e72]">{selected.customer}</p>
              <p className="mt-1 text-xs font-bold text-[#2869ac]">
                {selected.invoice || selected.id}
              </p>
              {[
                ["Total", totalOf(selected)],
                ["Already Received", paidOf(selected)],
                ["Pending", balanceOf(selected)],
              ].map(([label, v]) => (
                <div
                  key={label}
                  className="mt-3 flex justify-between border-t border-[#d0e3f5] pt-3 text-sm"
                >
                  <span>{label}</span>
                  <strong>{money(v)}</strong>
                </div>
              ))}
            </div>

            <Field label="New Payment Amount" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={balanceOf(selected)}
                value={receipt.amount}
                onChange={(e) =>
                  setReceipt((p) => ({ ...p, amount: e.target.value }))
                }
                className={inputClass}
                required
              />
            </Field>
            <button
              type="button"
              onClick={() =>
                setReceipt((p) => ({
                  ...p,
                  amount: String(balanceOf(selected)),
                }))
              }
              className="text-xs font-bold text-[#2869ac] hover:underline"
            >
              Collect Full Pending ({money(balanceOf(selected))})
            </button>

            <Field label="Payment Method">
              <select
                aria-label="Payment Method"
                value={receipt.method}
                onChange={(e) =>
                  setReceipt((p) => ({ ...p, method: e.target.value }))
                }
                className={inputClass}
              >
                {METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Payment Date">
              <input
                type="date"
                value={receipt.date}
                onChange={(e) =>
                  setReceipt((p) => ({ ...p, date: e.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                rows={3}
                value={receipt.note}
                onChange={(e) =>
                  setReceipt((p) => ({ ...p, note: e.target.value }))
                }
                className={`${inputClass} resize-none`}
              />
            </Field>

            {error && (
              <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#168363] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#137456]"
            >
              <CheckCircle2 size={18} />
              Save Payment to Same Invoice
            </button>
          </form>
        </Modal>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {modal === "history" && selected && (
        <Modal
          title="Payment History"
          subtitle={`Invoice ${selected.invoice || selected.id}`}
          icon={History}
          onClose={close}
          width="max-w-lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-[#eaf4ff] p-4">
              <p className="font-black text-[#173e72]">{selected.customer}</p>
              <p className="mt-2 text-xs text-[#527393]">
                Total {money(totalOf(selected))} · Received{" "}
                {money(paidOf(selected))} · Pending {money(balanceOf(selected))}
              </p>
            </div>
            {historyOf(selected).length ? (
              historyOf(selected).map((tx, index) => (
                <div
                  key={tx.id || index}
                  className="rounded-xl border border-[#dce8f6] bg-white p-4 shadow-sm"
                >
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-bold text-[#173f72]">
                      Payment {index + 1}
                    </p>
                    <p className="text-sm font-black text-[#168363]">
                      {money(txAmount(tx))}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-[#819ab3]">
                    {showDate(tx.date)} · {tx.method || "Cash"} ·{" "}
                    {tx.status || "Paid"}
                  </p>
                  {tx.note && (
                    <p className="mt-2 text-xs text-[#6785a4]">{tx.note}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-[#819ab3]">
                No payments received yet.
              </p>
            )}
            {balanceOf(selected) > 0 && (
              <button
                type="button"
                onClick={() => openCollect(selected)}
                className={`${primaryButtonClass} w-full`}
              >
                <Plus size={17} />
                Add Payment
              </button>
            )}
            {isInvoiceEligible(selected) && (
              <button
                type="button"
                onClick={() =>
                  pdfInvoice(selected, "download", getLinkedBooking(selected))
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8f6] bg-white px-4 py-3 text-sm font-bold text-[#2869ac] transition hover:bg-[#f3f8fe]"
              >
                <Download size={17} />
                Download Updated Invoice
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE INVOICE MODAL */}
      {modal === "delete" && selected && (
        <Modal
          title="Delete Invoice"
          subtitle="Confirm deletion"
          icon={Trash2}
          onClose={close}
          width="max-w-md"
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-[#fff0f3] p-5 text-sm leading-6 text-[#ad4961]">
              <AlertCircle className="mb-3 text-[#c64f69]" size={24} />
              Delete invoice <strong>{selected.invoice || selected.id}</strong>{" "}
              for <strong>{selected.customer}</strong>?
              {paidOf(selected) > 0 && (
                <p className="mt-2 font-bold">
                  This invoice contains payments and cannot be deleted here.
                </p>
              )}
            </div>
            {error && (
              <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteInvoice}
                disabled={paidOf(selected) > 0}
                className="flex-1 rounded-xl bg-[#c34b65] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ab3a53] disabled:opacity-40"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function Payments() {
  return (
    <PaymentsErrorBoundary>
      <PaymentsInner />
    </PaymentsErrorBoundary>
  );
}
