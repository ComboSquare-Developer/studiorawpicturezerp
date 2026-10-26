import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { jsPDF } from "jspdf";
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
  FileText,
  History,
  AlertCircle,
} from "lucide-react";

/* =========================================
   STUDIO RAW PICTUREZ - PAYMENTS
   Premium 3D Invoice Management
========================================= */

const KEYS = {
  payments: "studioraw_payments",
  bookings: "studioraw_bookings",
  customers: "studio_raw_customers",
  actions: "studioraw_payment_action_counts",
};

const UPDATE_EVENT = "studioraw:data-updated";

const METHODS = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Cheque",
  "Other",
];

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const round = (value) =>
  Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100;

const num = (value) => {
  const result = Number(
    typeof value === "string"
      ? value.replace(/[₹,\s]/g, "")
      : value
  );

  return Number.isFinite(result) ? result : 0;
};

function today() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toDate(value) {
  if (!value) return "";

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function displayDate(value) {
  const date = toDate(value);

  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function uid(prefix = "ID") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");

    if (Array.isArray(parsed)) return parsed;

    for (const field of [
      "data",
      "items",
      "records",
      "list",
      "payments",
      "bookings",
      "customers",
    ]) {
      if (Array.isArray(parsed?.[field])) return parsed[field];
    }

    return [];
  } catch {
    return [];
  }
}

function readModule(primary, fallback) {
  const main = readArray(primary);

  if (main.length) return main;

  return fallback ? readArray(fallback) : [];
}

function customerName(item) {
  return (
    item?.customerName ||
    (typeof item?.customer === "string"
      ? item.customer
      : item?.customer?.name) ||
    item?.name ||
    item?.clientName ||
    ""
  );
}

function bookingAmount(item) {
  return num(
    item?.totalAmount ??
      item?.total ??
      item?.packageAmount ??
      item?.amount ??
      0
  );
}

function invoiceTotal(item) {
  return num(
    item?.total ??
      item?.totalAmount ??
      item?.grandTotal ??
      item?.bookingAmount ??
      0
  );
}

function transactionAmount(item) {
  return num(
    item?.amount ?? item?.paidAmount ?? item?.receivedAmount ?? 0
  );
}

const INVALID_STATUS = [
  "failed",
  "cancelled",
  "canceled",
  "refunded",
  "reversed",
  "void",
];

function validTransaction(item) {
  return !INVALID_STATUS.includes(
    String(item?.status || "").toLowerCase()
  );
}

function receivedAmount(invoice) {
  for (const field of [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ]) {
    if (Array.isArray(invoice?.[field])) {
      return round(
        invoice[field]
          .filter(validTransaction)
          .reduce(
            (sum, transaction) =>
              sum + Math.max(0, transactionAmount(transaction)),
            0
          )
      );
    }
  }

  for (const field of [
    "advance",
    "paidAmount",
    "amountPaid",
    "receivedAmount",
    "amountReceived",
    "totalPaid",
    "totalReceived",
    "advanceAmount",
  ]) {
    if (
      invoice?.[field] !== undefined &&
      invoice?.[field] !== null &&
      invoice?.[field] !== ""
    ) {
      return Math.max(0, num(invoice[field]));
    }
  }

  if (
    ["paid", "completed", "fully paid"].includes(
      String(invoice?.status || "").toLowerCase()
    )
  ) {
    return invoiceTotal(invoice);
  }

  return 0;
}

function balanceAmount(invoice) {
  return Math.max(
    0,
    round(invoiceTotal(invoice) - receivedAmount(invoice))
  );
}

function paymentStatus(invoice) {
  const total = invoiceTotal(invoice);
  const received = receivedAmount(invoice);

  if (total > 0 && received >= total - 0.005) return "Paid";

  if (received > 0) return "Partial";

  return "Pending";
}

function transactionsOf(invoice) {
  for (const field of [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ]) {
    if (Array.isArray(invoice?.[field])) return invoice[field];
  }

  const received = receivedAmount(invoice);

  if (received <= 0) return [];

  return [
    {
      id: `${invoice.id}-legacy`,
      amount: received,
      method: invoice.method || "Cash",
      date: invoice.date || invoice.createdAt || today(),
      note: "Previous payment",
      status: "Paid",
    },
  ];
}

function normalizeInvoice(invoice) {
  const transactions = transactionsOf(invoice).map(
    (transaction, index) => ({
      ...transaction,
      id: transaction.id || `${invoice.id || "invoice"}-${index}`,
      amount: transactionAmount(transaction),
      method:
        transaction.method ||
        transaction.paymentMethod ||
        invoice.method ||
        "Cash",
      date:
        toDate(transaction.date || transaction.paymentDate) ||
        toDate(invoice.date) ||
        today(),
    })
  );

  const normalized = {
    ...invoice,
    id: invoice.id || uid("PAY"),
    invoice: invoice.invoice || invoice.invoiceNumber || "",
    customer: customerName(invoice),
    customerId: invoice.customerId || "",
    bookingId: invoice.bookingId || "",
    phone: invoice.phone || "",
    packageName: invoice.packageName || invoice.package || "",
    total: invoiceTotal(invoice),
    date: toDate(invoice.date) || today(),
    method: invoice.method || "Cash",
    notes: invoice.notes || "",
    transactions,
  };

  return {
    ...normalized,
    advance: receivedAmount(normalized),
    status: paymentStatus(normalized),
  };
}

function invoiceNumber(invoices) {
  const year = new Date().getFullYear();
  let maximum = 0;

  invoices.forEach((item) => {
    const match = String(item.invoice || "").match(
      new RegExp(`^SRP-${year}-(\\d+)$`)
    );

    if (match) maximum = Math.max(maximum, Number(match[1]));
  });

  return `SRP-${year}-${String(maximum + 1).padStart(5, "0")}`;
}

/* =========================================
   ACTION COUNTS
========================================= */

function readActionCounts() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(KEYS.actions) || "{}"
    );

    return {
      print: Math.max(0, Number(saved.print) || 0),
      edit: Math.max(0, Number(saved.edit) || 0),
      delete: Math.max(0, Number(saved.delete) || 0),
    };
  } catch {
    return { print: 0, edit: 0, delete: 0 };
  }
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();
    let frame;

    const animate = (time) => {
      const progress = Math.min((time - start) / 850, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display.toLocaleString("en-IN")}</span>;
}

/* =========================================
   PDF GENERATION
========================================= */

function generateInvoicePDF(invoice, action = "download") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const navy = [16, 38, 77];
  const light = [237, 245, 255];
  const gray = [99, 119, 145];

  const total = invoiceTotal(invoice);
  const received = receivedAmount(invoice);
  const balance = balanceAmount(invoice);

  const line = (y) => {
    doc.setDrawColor(218, 231, 245);
    doc.line(15, y, 195, y);
  };

  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 47, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("STUDIO RAW PICTUREZ", 15, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("PHOTOGRAPHY | EVENTS | CREATIVE SERVICES", 15, 31);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("INVOICE", 195, 22, { align: "right" });

  doc.setFontSize(9);
  doc.text(String(invoice.invoice || invoice.id), 195, 31, {
    align: "right",
  });

  doc.setTextColor(...navy);
  doc.setFontSize(10);
  doc.text("BILL TO", 15, 61);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    doc.splitTextToSize(String(invoice.customer || "Customer"), 95),
    15,
    70
  );

  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(`Phone: ${invoice.phone || "N/A"}`, 15, 83);

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE DETAILS", 125, 61);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text(`Date: ${displayDate(invoice.date)}`, 125, 70);
  doc.text(`Status: ${paymentStatus(invoice)}`, 125, 78);

  line(91);

  doc.setFillColor(...light);
  doc.roundedRect(15, 98, 180, 18, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.setFontSize(10);
  doc.text("SERVICE / PACKAGE", 20, 109);
  doc.text("AMOUNT", 189, 109, { align: "right" });

  doc.setFont("helvetica", "normal");

  const service = doc.splitTextToSize(
    String(invoice.packageName || "Photography / Event Service"),
    120
  );

  doc.text(service.slice(0, 3), 20, 127);
  doc.text(`Rs. ${total.toFixed(2)}`, 189, 127, {
    align: "right",
  });

  line(149);

  doc.setFillColor(...light);
  doc.roundedRect(105, 157, 90, 52, 4, 4, "F");

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...gray);
  doc.text("Total Amount", 111, 169);
  doc.text("Received", 111, 181);
  doc.text("Pending Balance", 111, 193);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navy);
  doc.text(`Rs. ${total.toFixed(2)}`, 189, 169, {
    align: "right",
  });

  doc.setTextColor(18, 125, 94);
  doc.text(`Rs. ${received.toFixed(2)}`, 189, 181, {
    align: "right",
  });

  doc.setTextColor(177, 115, 36);
  doc.text(`Rs. ${balance.toFixed(2)}`, 189, 193, {
    align: "right",
  });

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT HISTORY", 15, 223);

  let y = 234;

  const transactions = transactionsOf(invoice).filter(validTransaction);

  if (!transactions.length) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.text("No payments received yet.", 15, y);
  } else {
    transactions.forEach((transaction, index) => {
      if (y > 264) {
        doc.addPage();
        y = 25;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);

      doc.text(
        `${index + 1}. ${displayDate(transaction.date)} - ${
          transaction.method || "Cash"
        }`,
        15,
        y
      );

      doc.setTextColor(...navy);
      doc.text(
        `Rs. ${transactionAmount(transaction).toFixed(2)}`,
        189,
        y,
        { align: "right" }
      );

      y += 9;
    });
  }

  const pages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(218, 231, 245);
    doc.line(15, 278, 195, 278);

    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(
      "Thank you for choosing Studio Raw Picturez!",
      105,
      286,
      { align: "center" }
    );
  }

  const filename = `Invoice-${String(
    invoice.invoice || invoice.id
  ).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;

  if (action === "print") {
    const url = doc.output("bloburl");
    const printWindow = window.open(url, "_blank");

    if (!printWindow) {
      doc.save(filename);
      alert(
        "Popup blocked. Invoice downloaded instead. Open the PDF and print it."
      );
    }

    return;
  }

  doc.save(filename);
}

/* =========================================
   PREMIUM ANIMATION
========================================= */

function AnimationStyles() {
  return (
    <style>{`
      @keyframes srPaymentFloat {
        0%, 100% {
          transform: perspective(1200px) translate3d(0,0,0)
                     rotateX(0deg) rotateY(0deg);
        }
        50% {
          transform: perspective(1200px) translate3d(0,-7px,0)
                     rotateX(1.5deg) rotateY(-1deg);
        }
      }

      @keyframes srPaymentEnter {
        from {
          opacity: 0;
          transform: perspective(1200px)
                     translate3d(0,24px,-30px) rotateX(4deg);
        }
        to {
          opacity: 1;
          transform: perspective(1200px)
                     translate3d(0,0,0) rotateX(0deg);
        }
      }

      @keyframes srPaymentShine {
        0%, 100% { opacity: .35; }
        50% { opacity: .8; }
      }

      .sr-payment-3d {
        animation:
          srPaymentEnter .65s ease-out both,
          srPaymentFloat 5.5s ease-in-out .65s infinite;
        transform-style: preserve-3d;
        will-change: transform;
      }

      .sr-payment-3d:nth-child(2) {
        animation-delay: .12s, .8s;
      }

      .sr-payment-3d:nth-child(3) {
        animation-delay: .2s, 1s;
      }

      .sr-payment-3d:nth-child(4) {
        animation-delay: .28s, 1.2s;
      }

      .sr-payment-3d:hover {
        animation-play-state: paused;
        box-shadow: 0 18px 35px rgba(16,38,77,.12);
      }

      .sr-payment-panel {
        animation: srPaymentEnter .7s ease-out both;
      }

      .sr-payment-shine {
        animation: srPaymentShine 4s ease-in-out infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .sr-payment-3d,
        .sr-payment-panel,
        .sr-payment-shine {
          animation: none !important;
          will-change: auto;
        }
      }
    `}</style>
  );
}

/* =========================================
   UI HELPERS
========================================= */

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#d7e5f4] bg-white px-4 py-3 text-sm font-medium text-[#173e73] outline-none transition placeholder:text-[#9badc0] focus:border-[#3778bb] focus:ring-4 focus:ring-[#e6f1ff]";

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#567493]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && (
        <p className="text-[11px] text-[#8ca3bb]">{hint}</p>
      )}
    </div>
  );
}

function Badge({ status }) {
  const styles = {
    Paid: "bg-[#e0f7eb] text-[#158563]",
    Partial: "bg-[#fff0d8] text-[#ac7625]",
    Pending: "bg-[#ffe7ec] text-[#bf4c65]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
        styles[status] || styles.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const themes = {
    blue: {
      bg: "from-[#eff7ff] to-[#d2e7ff]",
      icon: "bg-[#d5e9ff] text-[#2767a8]",
      value: "text-[#153f75]",
    },
    green: {
      bg: "from-[#f0fcf7] to-[#cceedd]",
      icon: "bg-[#d2f2e1] text-[#168363]",
      value: "text-[#137b5e]",
    },
    amber: {
      bg: "from-[#fffaf0] to-[#ffe5bf]",
      icon: "bg-[#ffedcf] text-[#b27a2a]",
      value: "text-[#a46e25]",
    },
    purple: {
      bg: "from-[#faf7ff] to-[#e1d8fb]",
      icon: "bg-[#e8dfff] text-[#7759b6]",
      value: "text-[#694ca5]",
    },
  };

  const theme = themes[color];

  return (
    <div
      className={`sr-payment-3d relative overflow-hidden rounded-[23px] border border-white bg-gradient-to-br ${theme.bg} p-4 shadow-[0_8px_25px_rgba(20,65,120,.06)] sm:p-5`}
    >
      <div className="sr-payment-shine pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-white/30 blur-2xl" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#6c88a4]">
            {title}
          </p>

          <h3
            className={`mt-3 break-words text-xl font-black sm:text-2xl ${theme.value}`}
          >
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.icon}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="relative mt-5 border-t border-white/80 pt-3 text-[11px] text-[#7994ad]">
        {subtitle}
      </p>
    </div>
  );
}

function ActionCountCard({ title, count, icon: Icon, color }) {
  const themes = {
    blue: "bg-[#e6f1ff] text-[#2869ac]",
    amber: "bg-[#fff0db] text-[#b27b2a]",
    red: "bg-[#ffe7ec] text-[#c64f69]",
  };

  return (
    <div className="sr-payment-3d rounded-[22px] border border-[#dbe8f7] bg-white p-4 shadow-[0_8px_25px_rgba(20,65,120,.05)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#7994ad]">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-black text-[#10264d]">
            <AnimatedNumber value={count} />
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${themes[color]}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 border-t border-[#edf3fa] pt-3 text-[11px] text-[#91a7bd]">
        Automatically tracked actions
      </p>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  width = "max-w-2xl",
}) {
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleEscape);
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
              <h2 className="text-lg font-black text-[#10264d]">
                {title}
              </h2>

              <p className="mt-1 text-xs text-[#839bb4]">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#edf4fc] p-2.5 text-[#527393] hover:bg-[#dcecff]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

const EMPTY_FORM = {
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
   MAIN COMPONENT
========================================= */

export default function Payments() {
  const [payments, setPayments] = useState(() =>
    readArray(KEYS.payments)
  );

  const [bookings, setBookings] = useState(() =>
    readModule(KEYS.bookings, "studio_raw_bookings")
  );

  const [customers, setCustomers] = useState(() =>
    readModule(KEYS.customers, "studioraw_customers")
  );

  const [actionCounts, setActionCounts] = useState(readActionCounts);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("All");

  const [modal, setModal] = useState("");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    date: today(),
  });

  const [receiptForm, setReceiptForm] = useState({
    amount: "",
    method: "Cash",
    date: today(),
    note: "",
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const normalizedPayments = useMemo(
    () => payments.map(normalizeInvoice),
    [payments]
  );

  /* =========================================
     LIVE SYNC
  ========================================= */

  const refresh = () => {
    setPayments(readArray(KEYS.payments));

    setBookings(
      readModule(KEYS.bookings, "studio_raw_bookings")
    );

    setCustomers(
      readModule(KEYS.customers, "studioraw_customers")
    );

    setActionCounts(readActionCounts());
  };

  useEffect(() => {
    const handleUpdate = () => refresh();

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    const interval = window.setInterval(refresh, 3000);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      window.clearInterval(interval);
    };
  }, []);

  const increaseActionCount = (action) => {
    const current = readActionCounts();

    const next = {
      ...current,
      [action]: current[action] + 1,
    };

    try {
      localStorage.setItem(KEYS.actions, JSON.stringify(next));
      setActionCounts(next);
    } catch {
      setActionCounts((previous) => ({
        ...previous,
        [action]: previous[action] + 1,
      }));
    }
  };

  const savePayments = (next) => {
    try {
      localStorage.setItem(KEYS.payments, JSON.stringify(next));

      setPayments(next);

      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: {
            module: "payments",
            key: KEYS.payments,
          },
        })
      );

      setNotice("Payment records updated successfully.");
      return true;
    } catch {
      setError("Unable to save payment data.");
      return false;
    }
  };

  const closeModal = () => {
    setModal("");
    setSelected(null);
    setEditing(null);
    setError("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, date: today() });
    setError("");
    setModal("form");
  };

  const openEdit = (invoice) => {
    setEditing(invoice);

    setForm({
      customerId: String(invoice.customerId || ""),
      bookingId: String(invoice.bookingId || ""),
      customer: invoice.customer || "",
      phone: invoice.phone || "",
      packageName: invoice.packageName || "",
      total: String(invoiceTotal(invoice)),
      initialPayment: "",
      method: invoice.method || "Cash",
      date: toDate(invoice.date) || today(),
      notes: invoice.notes || "",
    });

    setError("");
    setModal("form");
  };

  const openCollect = (invoice) => {
    setSelected(invoice);

    setReceiptForm({
      amount: "",
      method: "Cash",
      date: today(),
      note: "",
    });

    setError("");
    setModal("collect");
  };

  /* =========================================
     CUSTOMER / BOOKING AUTO FILL
  ========================================= */

  const chooseCustomer = (id) => {
    const customer = customers.find(
      (item) => String(item.id) === String(id)
    );

    setForm((previous) => ({
      ...previous,
      customerId: id,
      bookingId: "",
      customer: customer ? customerName(customer) : "",
      phone: customer?.phone || "",
      packageName: "",
      total: "",
    }));
  };

  const chooseBooking = (id) => {
    const booking = bookings.find(
      (item) => String(item.id) === String(id)
    );

    if (!booking) {
      setForm((previous) => ({
        ...previous,
        bookingId: "",
      }));
      return;
    }

    const customer = customers.find(
      (item) =>
        String(item.id) === String(booking.customerId)
    );

    setForm((previous) => ({
      ...previous,
      bookingId: String(booking.id),
      customerId: String(
        booking.customerId || previous.customerId || ""
      ),
      customer:
        customerName(booking) ||
        customerName(customer) ||
        previous.customer,
      phone:
        booking.phone ||
        customer?.phone ||
        previous.phone,
      packageName:
        booking.package ||
        booking.packageName ||
        booking.event ||
        "",
      total: String(bookingAmount(booking)),
    }));
  };

  const availableBookings = useMemo(
    () =>
      !form.customerId
        ? bookings
        : bookings.filter(
            (booking) =>
              String(booking.customerId || "") ===
              String(form.customerId)
          ),
    [bookings, form.customerId]
  );

  /* =========================================
     CREATE / EDIT INVOICE
  ========================================= */

  const submitInvoice = (event) => {
    event.preventDefault();
    setError("");

    const total = round(num(form.total));
    const initial = round(num(form.initialPayment));

    if (!form.customer.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (total <= 0) {
      setError("Enter a valid total amount.");
      return;
    }

    if (!editing && (initial < 0 || initial > total)) {
      setError("Advance must be between 0 and the invoice total.");
      return;
    }

    if (editing && total < receivedAmount(editing)) {
      setError(
        "Invoice total cannot be lower than the amount already received."
      );
      return;
    }

    if (form.bookingId) {
      const duplicate = normalizedPayments.find(
        (invoice) =>
          String(invoice.bookingId || "") ===
            String(form.bookingId) &&
          String(invoice.id) !== String(editing?.id || "")
      );

      if (duplicate) {
        setError(
          `This booking already has invoice ${
            duplicate.invoice || duplicate.id
          }.`
        );
        return;
      }
    }

    const now = new Date().toISOString();

    if (editing) {
      const next = payments.map((item) => {
        if (String(item.id) !== String(editing.id)) {
          return item;
        }

        const previous = normalizeInvoice(item);

        const updated = {
          ...previous,
          customerId: form.customerId,
          bookingId: form.bookingId,
          customer: form.customer.trim(),
          phone: form.phone.trim(),
          packageName: form.packageName.trim(),
          total,
          date: form.date || today(),
          method: form.method,
          notes: form.notes.trim(),
          updatedAt: now,
        };

        return {
          ...updated,
          advance: receivedAmount(updated),
          status: paymentStatus(updated),
        };
      });

      if (savePayments(next)) closeModal();
      return;
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

    const invoice = {
      id: uid("PAY"),
      invoice: invoiceNumber(payments),
      customerId: form.customerId,
      bookingId: form.bookingId,
      customer: form.customer.trim(),
      phone: form.phone.trim(),
      packageName: form.packageName.trim(),
      total,
      advance: initial,
      method: form.method,
      date: form.date || today(),
      notes: form.notes.trim(),
      transactions,
      createdAt: now,
      updatedAt: now,
    };

    invoice.status = paymentStatus(invoice);

    if (savePayments([invoice, ...payments])) {
      closeModal();
    }
  };

  /* =========================================
     COLLECT PAYMENT
  ========================================= */

  const collectPayment = (event) => {
    event.preventDefault();
    setError("");

    if (!selected) return;

    const received = round(num(receiptForm.amount));
    const pending = balanceAmount(selected);

    if (received <= 0 || received > pending) {
      setError(
        `Enter an amount between Rs. 0.01 and ${money(pending)}.`
      );
      return;
    }

    const now = new Date().toISOString();

    const next = payments.map((item) => {
      if (String(item.id) !== String(selected.id)) return item;

      const invoice = normalizeInvoice(item);

      const updated = {
        ...invoice,
        transactions: [
          ...invoice.transactions,
          {
            id: uid("TXN"),
            amount: received,
            method: receiptForm.method,
            date: receiptForm.date || today(),
            note: receiptForm.note.trim(),
            status: "Paid",
            createdAt: now,
          },
        ],
        method: receiptForm.method,
        updatedAt: now,
      };

      return {
        ...updated,
        advance: receivedAmount(updated),
        status: paymentStatus(updated),
      };
    });

    if (savePayments(next)) closeModal();
  };

  const deleteInvoice = () => {
    if (!selected) return;

    const next = payments.filter(
      (item) => String(item.id) !== String(selected.id)
    );

    if (savePayments(next)) {
      increaseActionCount("delete");
      closeModal();
    }
  };

  const handlePrint = (invoice) => {
    generateInvoicePDF(invoice, "print");
    increaseActionCount("print");
  };

  const handleEdit = (invoice) => {
    increaseActionCount("edit");
    openEdit(invoice);
  };

  /* =========================================
     SUMMARY
  ========================================= */

  const summary = useMemo(() => {
    const total = round(
      normalizedPayments.reduce(
        (sum, item) => sum + invoiceTotal(item),
        0
      )
    );

    const received = round(
      normalizedPayments.reduce(
        (sum, item) => sum + receivedAmount(item),
        0
      )
    );

    const pending = round(
      normalizedPayments.reduce(
        (sum, item) => sum + balanceAmount(item),
        0
      )
    );

    const paid = normalizedPayments.filter(
      (item) => paymentStatus(item) === "Paid"
    ).length;

    const partial = normalizedPayments.filter(
      (item) => paymentStatus(item) === "Partial"
    ).length;

    return { total, received, pending, paid, partial };
  }, [normalizedPayments]);

  const collectionPercent =
    summary.total > 0
      ? Math.min(100, (summary.received / summary.total) * 100)
      : 0;

  /* =========================================
     FILTERS
  ========================================= */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedPayments
      .filter((invoice) => {
        if (
          statusFilter !== "All" &&
          paymentStatus(invoice) !== statusFilter
        ) {
          return false;
        }

        if (
          monthFilter !== "All" &&
          toDate(invoice.date).slice(0, 7) !== monthFilter
        ) {
          return false;
        }

        if (!query) return true;

        return [
          invoice.invoice,
          invoice.customer,
          invoice.phone,
          invoice.packageName,
          invoice.bookingId,
          invoice.method,
          paymentStatus(invoice),
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );
      })
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      );
  }, [normalizedPayments, search, statusFilter, monthFilter]);

  const availableMonths = useMemo(
    () =>
      [
        ...new Set(
          normalizedPayments
            .map((item) => toDate(item.date).slice(0, 7))
            .filter(Boolean)
        ),
      ]
        .sort()
        .reverse(),
    [normalizedPayments]
  );

  /* =========================================
     CSV EXPORT
  ========================================= */

  const exportCSV = () => {
    const rows = [
      [
        "Invoice",
        "Date",
        "Customer",
        "Phone",
        "Booking ID",
        "Package",
        "Total",
        "Received",
        "Pending",
        "Status",
      ],
      ...filtered.map((invoice) => [
        invoice.invoice,
        invoice.date,
        invoice.customer,
        invoice.phone,
        invoice.bookingId,
        invoice.packageName,
        invoiceTotal(invoice),
        receivedAmount(invoice),
        balanceAmount(invoice),
        paymentStatus(invoice),
      ]),
    ];

    const escapeCSV = (value) => {
      const raw = String(value ?? "");

      const safe = /^\s*[=+\-@\t\r]/.test(raw)
        ? `'${raw}`
        : raw;

      return `"${safe.replace(/"/g, '""')}"`;
    };

    const csv = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `StudioRaw-Payments-${today()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* =========================================
     ACTION BUTTONS
  ========================================= */

  const ActionButtons = ({ invoice }) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        title="Print Invoice"
        aria-label="Print Invoice"
        onClick={() => handlePrint(invoice)}
        className="rounded-xl bg-[#e7f3ff] p-2.5 text-[#3474ad] transition hover:scale-110 hover:bg-[#d6eaff]"
      >
        <Printer size={18} />
      </button>

      <button
        type="button"
        title="Edit Invoice"
        aria-label="Edit Invoice"
        onClick={() => handleEdit(invoice)}
        className="rounded-xl bg-[#fff0db] p-2.5 text-[#b27b2a] transition hover:scale-110 hover:bg-[#ffe3b5]"
      >
        <Pencil size={18} />
      </button>

      <button
        type="button"
        title="Delete Invoice"
        aria-label="Delete Invoice"
        onClick={() => {
          setSelected(invoice);
          setError("");
          setModal("delete");
        }}
        className="rounded-xl bg-[#ffe7ec] p-2.5 text-[#c64f69] transition hover:scale-110 hover:bg-[#ffd5df]"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f5faff] via-[#edf5ff] to-[#e6f1ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8">
      <AnimationStyles />

      <div className="mx-auto max-w-[1650px] space-y-6">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcecff] text-[#245f9f]">
              <Wallet size={24} />
            </div>

            <div>
              <h1 className="text-xl font-black sm:text-2xl">
                Payments
              </h1>

              <p className="mt-1 text-xs text-[#8099b3]">
                Studio Raw Picturez / Finance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7] transition hover:bg-[#edf5ff]"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-2 rounded-xl border border-[#d5e5f5] bg-white px-4 py-3 text-sm font-bold text-[#2867a7] transition hover:bg-[#edf5ff]"
            >
              <Download size={17} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#2e65a5] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
            >
              <Plus size={18} />
              Add Invoice
            </button>
          </div>
        </div>

        {/* NOTICE */}

        {notice && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#bce8d0] bg-[#eafaf1] p-3 text-sm font-bold text-[#177d5f]">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              {notice}
            </span>

            <button
              type="button"
              onClick={() => setNotice("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* FINANCIAL SUMMARY */}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <SummaryCard
            title="Total Invoice Amount"
            value={money(summary.total)}
            subtitle={`${normalizedPayments.length} invoices`}
            icon={Receipt}
            color="blue"
          />

          <SummaryCard
            title="Amount Received"
            value={money(summary.received)}
            subtitle={`${summary.paid} fully paid`}
            icon={CheckCircle2}
            color="green"
          />

          <SummaryCard
            title="Pending Balance"
            value={money(summary.pending)}
            subtitle="Outstanding amount"
            icon={Clock3}
            color="amber"
          />

          <SummaryCard
            title="Partial Payments"
            value={summary.partial}
            subtitle="Partially paid invoices"
            icon={CreditCard}
            color="purple"
          />
        </div>

        {/* ACTION COUNTERS */}

        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-black text-[#153d70] sm:text-base">
              Action Activity
            </h2>

            <p className="mt-1 text-xs text-[#8ba2ba]">
              Automatic Print, Edit and Delete tracking
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <ActionCountCard
              title="Print Count"
              count={actionCounts.print}
              icon={Printer}
              color="blue"
            />

            <ActionCountCard
              title="Edit Count"
              count={actionCounts.edit}
              icon={Pencil}
              color="amber"
            />

            <ActionCountCard
              title="Delete Count"
              count={actionCounts.delete}
              icon={Trash2}
              color="red"
            />
          </div>
        </div>

        {/* PAYMENT COLLECTION OVERVIEW */}

        <div className="sr-payment-panel rounded-[24px] border border-[#d9e7f6] bg-white p-5 shadow-sm">
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
              {collectionPercent.toFixed(1)}% Collected
            </span>
          </div>

          <div className="mt-5 h-4 overflow-hidden rounded-full bg-[#e7eff9]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#17866c] to-[#77d1b7] transition-all duration-700"
              style={{ width: `${collectionPercent}%` }}
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

        {/* SEARCH AND FILTER */}

        <div className="sr-payment-panel flex flex-col gap-3 rounded-[22px] border border-[#d9e7f6] bg-white p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8ba3ba]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoice, customer, booking..."
              className={`${inputClass} pl-11`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className={`${inputClass} lg:w-44`}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(event.target.value)
            }
            className={`${inputClass} lg:w-48`}
          >
            <option value="All">All Months</option>

            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* PAYMENT RECORDS */}

        <div className="sr-payment-panel overflow-hidden rounded-[25px] border border-[#d9e7f6] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e3edf7] p-5">
            <div>
              <h2 className="font-black text-[#10264d]">
                Payment Records
              </h2>

              <p className="mt-1 text-xs text-[#8ca2b9]">
                {filtered.length} invoices
              </p>
            </div>

            <Receipt size={22} className="text-[#3575b6]" />
          </div>

          {filtered.length ? (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1150px] text-left">
                  <thead className="bg-[#edf5ff]">
                    <tr>
                      {[
                        "Invoice",
                        "Customer",
                        "Date",
                        "Service",
                        "Total",
                        "Received",
                        "Pending",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="whitespace-nowrap px-4 py-4 text-[11px] font-black uppercase tracking-wide text-[#6685a4]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e8eff8]">
                    {filtered.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="transition-colors hover:bg-[#f5faff]"
                      >
                        <td className="px-4 py-4 text-sm font-black text-[#245f9f]">
                          {invoice.invoice || invoice.id}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-[#173f72]">
                            {invoice.customer}
                          </p>

                          <p className="mt-1 text-xs text-[#8ba2b9]">
                            {invoice.phone || "—"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#6785a4]">
                          {displayDate(invoice.date)}
                        </td>

                        <td className="px-4 py-4 text-sm text-[#6785a4]">
                          {invoice.packageName || "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-[#173f72]">
                          {money(invoiceTotal(invoice))}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-[#168363]">
                          {money(receivedAmount(invoice))}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-[#b77b2c]">
                          {money(balanceAmount(invoice))}
                        </td>

                        <td className="px-4 py-4">
                          <Badge status={paymentStatus(invoice)} />
                        </td>

                        <td className="px-4 py-4">
                          <ActionButtons invoice={invoice} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
                {filtered.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="rounded-2xl border border-[#dce8f6] bg-[#fbfdff] p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="break-all text-sm font-black text-[#245f9f]">
                          {invoice.invoice || invoice.id}
                        </p>

                        <p className="mt-1 text-xs text-[#8ba2b9]">
                          {displayDate(invoice.date)}
                        </p>
                      </div>

                      <Badge status={paymentStatus(invoice)} />
                    </div>

                    <p className="mt-4 font-black text-[#173f72]">
                      {invoice.customer}
                    </p>

                    <p className="mt-1 text-xs text-[#819ab3]">
                      {invoice.phone || "No phone"}
                    </p>

                    <p className="mt-2 text-xs text-[#6785a4]">
                      {invoice.packageName || "Photography / Event"}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#edf5ff] p-3">
                      <div>
                        <p className="text-[10px] text-[#829ab3]">
                          Total
                        </p>
                        <p className="mt-1 break-words text-xs font-black text-[#173f72]">
                          {money(invoiceTotal(invoice))}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-[#829ab3]">
                          Received
                        </p>
                        <p className="mt-1 break-words text-xs font-black text-[#168363]">
                          {money(receivedAmount(invoice))}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-[#829ab3]">
                          Pending
                        </p>
                        <p className="mt-1 break-words text-xs font-black text-[#b77b2c]">
                          {money(balanceAmount(invoice))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#e5edf7] pt-3">
                      <span className="text-xs font-bold text-[#8ca2b9]">
                        Actions
                      </span>

                      <ActionButtons invoice={invoice} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Receipt size={42} className="text-[#82acd5]" />

              <h3 className="mt-4 font-black text-[#24558a]">
                No Payment Records
              </h3>

              <p className="mt-2 text-sm text-[#8ba2b9]">
                Add your first invoice or change filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT FORM - NO ANIMATION */}

      {modal === "form" && (
        <Modal
          title={editing ? "Edit Invoice" : "Create New Invoice"}
          subtitle="Studio Raw Picturez Payment Form"
          icon={Receipt}
          onClose={closeModal}
        >
          <form onSubmit={submitInvoice} className="space-y-5">
            <Field label="Select Customer">
              <select
                value={form.customerId}
                onChange={(event) =>
                  chooseCustomer(event.target.value)
                }
                className={inputClass}
              >
                <option value="">
                  Manual Entry / Select Customer
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={String(customer.id)}
                  >
                    {customerName(customer)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Select Booking">
              <select
                value={form.bookingId}
                onChange={(event) =>
                  chooseBooking(event.target.value)
                }
                className={inputClass}
              >
                <option value="">
                  Manual Invoice / Select Booking
                </option>

                {availableBookings.map((booking) => (
                  <option
                    key={booking.id}
                    value={String(booking.id)}
                  >
                    {customerName(booking)} -{" "}
                    {booking.event || "Booking"} -{" "}
                    {money(bookingAmount(booking))}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Customer Name" required>
              <input
                value={form.customer}
                onChange={(event) =>
                  setForm({
                    ...form,
                    customer: event.target.value,
                  })
                }
                placeholder="Customer name"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    phone: event.target.value,
                  })
                }
                placeholder="Phone number"
                className={inputClass}
              />
            </Field>

            <Field label="Package / Service">
              <input
                value={form.packageName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    packageName: event.target.value,
                  })
                }
                placeholder="Wedding Photography / Event"
                className={inputClass}
              />
            </Field>

            <Field label="Total Invoice Amount" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.total}
                onChange={(event) =>
                  setForm({
                    ...form,
                    total: event.target.value,
                  })
                }
                placeholder="Enter total amount"
                className={inputClass}
                required
              />
            </Field>

            {!editing && (
              <Field label="Advance Payment">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.initialPayment}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      initialPayment: event.target.value,
                    })
                  }
                  placeholder="Enter advance amount"
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Invoice Date">
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm({
                    ...form,
                    date: event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Payment Method">
              <select
                value={form.method}
                onChange={(event) =>
                  setForm({
                    ...form,
                    method: event.target.value,
                  })
                }
                className={inputClass}
              >
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    notes: event.target.value,
                  })
                }
                placeholder="Invoice notes"
                className={`${inputClass} resize-none`}
              />
            </Field>

            {/* PAYMENT SUMMARY */}

            <div className="rounded-2xl bg-[#eaf4ff] p-4">
              <p className="text-xs font-bold text-[#6e8ca9]">
                Payment Summary
              </p>

              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span>Total</span>
                  <strong>{money(num(form.total))}</strong>
                </div>

                <div className="flex justify-between gap-3 text-[#168363]">
                  <span>Received</span>
                  <strong>
                    {money(
                      editing
                        ? receivedAmount(editing)
                        : num(form.initialPayment)
                    )}
                  </strong>
                </div>

                <div className="flex justify-between gap-3 border-t border-[#cfe0f3] pt-3 text-[#b47a2b]">
                  <span>Pending</span>
                  <strong>
                    {money(
                      Math.max(
                        0,
                        num(form.total) -
                          (editing
                            ? receivedAmount(editing)
                            : num(form.initialPayment))
                      )
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold text-[#527397]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10264d] to-[#2e65a5] px-5 py-3 text-sm font-bold text-white"
              >
                <Save size={17} />
                {editing
                  ? "Save Changes"
                  : "Save & Generate Invoice"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* COLLECT PAYMENT - NO ANIMATION */}

      {modal === "collect" && selected && (
        <Modal
          title="Collect Payment"
          subtitle={selected.invoice}
          icon={IndianRupee}
          onClose={closeModal}
          width="max-w-lg"
        >
          <form onSubmit={collectPayment} className="space-y-5">
            <div className="rounded-2xl bg-[#eaf4ff] p-5">
              <p className="font-black text-[#173e72]">
                {selected.customer}
              </p>

              <div className="mt-4 flex justify-between text-sm">
                <span>Total</span>
                <strong>{money(invoiceTotal(selected))}</strong>
              </div>

              <div className="mt-3 flex justify-between text-sm text-[#168363]">
                <span>Received</span>
                <strong>{money(receivedAmount(selected))}</strong>
              </div>

              <div className="mt-3 flex justify-between border-t border-[#d0e3f5] pt-3 text-sm text-[#b57a2b]">
                <span>Pending</span>
                <strong>{money(balanceAmount(selected))}</strong>
              </div>
            </div>

            <Field label="Amount Received" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={balanceAmount(selected)}
                value={receiptForm.amount}
                onChange={(event) =>
                  setReceiptForm({
                    ...receiptForm,
                    amount: event.target.value,
                  })
                }
                className={inputClass}
                required
              />
            </Field>

            <button
              type="button"
              onClick={() =>
                setReceiptForm({
                  ...receiptForm,
                  amount: String(balanceAmount(selected)),
                })
              }
              className="text-xs font-bold text-[#2869ac]"
            >
              Collect Full Pending
            </button>

            <Field label="Payment Method">
              <select
                value={receiptForm.method}
                onChange={(event) =>
                  setReceiptForm({
                    ...receiptForm,
                    method: event.target.value,
                  })
                }
                className={inputClass}
              >
                {METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Payment Date">
              <input
                type="date"
                value={receiptForm.date}
                onChange={(event) =>
                  setReceiptForm({
                    ...receiptForm,
                    date: event.target.value,
                  })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                rows={3}
                value={receiptForm.note}
                onChange={(event) =>
                  setReceiptForm({
                    ...receiptForm,
                    note: event.target.value,
                  })
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#168363] px-5 py-3 text-sm font-bold text-white"
            >
              <CheckCircle2 size={18} />
              Save Payment
            </button>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION - NO ANIMATION */}

      {modal === "delete" && selected && (
        <Modal
          title="Delete Invoice"
          subtitle="Confirm deletion"
          icon={Trash2}
          onClose={closeModal}
          width="max-w-md"
        >
          <div className="space-y-5">
            <div className="rounded-xl bg-[#fff0f3] p-5 text-sm leading-6 text-[#ad4961]">
              <AlertCircle className="mb-3" />

              Delete invoice{" "}
              <strong>{selected.invoice || selected.id}</strong>{" "}
              for <strong>{selected.customer}</strong>?
              All its payment history will also be removed.
            </div>

            {error && (
              <p className="rounded-xl bg-[#fff0f3] p-3 text-sm text-[#c34b65]">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-[#d5e4f4] bg-white px-5 py-3 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteInvoice}
                className="flex-1 rounded-xl bg-[#c34b65] px-5 py-3 text-sm font-bold text-white"
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