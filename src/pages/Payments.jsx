import { useEffect, useMemo, useRef, useState } from "react";
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
} from "lucide-react";

const KEY = "studioraw_payments";
const SOUND_KEY = "studioraw_payments_sound";

const todayKey = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const eventOptions = [
  "Wedding",
  "Engagement",
  "Reception",
  "Birthday",
  "Baby Shower",
  "Naming Ceremony",
  "Puberty Ceremony",
  "Housewarming",
  "Anniversary",
  "Haldi / Mehendi",
  "Pre-Wedding",
  "Baby Shoot",
  "Corporate",
  "School / College Function",
  "Customized Gifts",
  "Other Event",
];

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
  event: "Wedding",
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
    event: "Wedding",
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
    event: "Engagement",
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
    event: "Birthday",
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
    event: "Pre-Wedding",
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
    event: "Baby Shoot",
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
    event: "Reception",
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
    event: "Corporate",
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
    event: "Anniversary",
    packageName: "Function We Arrange",
    total: 15000,
    advance: 5000,
    method: "Cash",
    date: "2026-10-22",
    notes: "Anniversary celebration",
  },
];

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#245b9e] focus:ring-2 focus:ring-blue-100";

const toAmount = (value) => {
  const number = Number(String(value ?? 0).replace(/[₹,\s]/g, ""));
  return Number.isFinite(number) ? number : 0;
};

const currency = (value) =>
  `₹${toAmount(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getBalance = (payment) =>
  Math.max(0, toAmount(payment.total) - toAmount(payment.advance));

const getStatus = (payment) => {
  const total = toAmount(payment.total);
  const paid = toAmount(payment.advance);

  if (total > 0 && paid >= total) return "Paid";
  if (paid > 0) return "Partial";
  return "Pending";
};

const statusStyle = {
  Paid: "border-green-100 bg-green-50 text-green-700",
  Partial: "border-blue-100 bg-blue-50 text-blue-700",
  Pending: "border-amber-100 bg-amber-50 text-amber-700",
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

function readPayments() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === null) return demoPayments;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : demoPayments;
  } catch {
    return demoPayments;
  }
}

function useSound() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) === "true";
    } catch {
      return false;
    }
  });

  const contextRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(enabled));
    } catch {
      // Sound setting is optional.
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      const context = contextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch(() => {});
      }
    };
  }, []);

  const play = (type = "click") => {
    if (!enabled) return;

    try {
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

      const frequencies = notes[type] || notes.click;

      frequencies.forEach((frequency, index) => {
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
      // Ignore unsupported audio devices.
    }
  };

  return { enabled, setEnabled, play };
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#344767]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[#e8eef6] pb-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fa] text-[#102f62]">
        <Icon size={19} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">{title}</h3>
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
        <option value="" disabled>
          {placeholder}
        </option>
        {allOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647b9c]"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${
        statusStyle[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function MobileDetail({ label, value, highlight = false }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={`mt-1 break-words text-sm font-semibold ${
          highlight ? "text-[#174b91]" : "text-[#10264d]"
        }`}
      >
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState(readPayments);
  const [activeTab, setActiveTab] = useState("list"); // "list" | "invoice-form" | "record-payment"

  // Invoice Form State
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // Record Payment State
  const [paymentTarget, setPaymentTarget] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentDate, setPaymentDate] = useState(todayKey());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const { play } = useSound();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(payments));
    } catch {
      // Retain in-memory data if storage is unavailable.
    }
  }, [payments]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
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
    setForm({
      ...createEmptyForm(),
      ...payment,
      total: String(payment.total ?? ""),
      advance: String(payment.advance ?? ""),
    });
    setError("");
    setActiveTab("invoice-form");
    play("open");
  };

  const openRecordPayment = (paymentId = "") => {
    const target =
      paymentId ||
      payments.find((item) => getBalance(item) > 0)?.id ||
      payments[0]?.id ||
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

  const savePayment = (event) => {
    event.preventDefault();

    const customer = form.customer.trim();
    const phone = form.phone.trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError("Enter customer name and valid 10-digit phone number.");
      return;
    }

    if (!form.packageName.trim()) {
      setError("Please select a package name.");
      return;
    }

    const total = Number(form.total);
    const advance = Number(form.advance || 0);

    if (
      form.total === "" ||
      !Number.isFinite(total) ||
      !Number.isFinite(advance) ||
      total <= 0 ||
      advance < 0 ||
      advance > total
    ) {
      setError("Enter valid amounts. Advance cannot exceed total.");
      return;
    }

    if (!form.date) {
      setError("Please select invoice date.");
      return;
    }

    const existing = payments.find((item) => item.id === editingId);

    const payment = {
      ...form,
      id: existing ? existing.id : createId(),
      invoice: existing ? existing.invoice : `INV-${Date.now()}`,
      customer,
      phone,
      packageName: form.packageName.trim(),
      total,
      advance,
    };

    if (editingId !== null) {
      setPayments((previous) =>
        previous.map((item) => (item.id === editingId ? payment : item))
      );
    } else {
      setPayments((previous) => [payment, ...previous]);
    }

    play("success");
    setActiveTab("list");
    setEditingId(null);
    setForm(createEmptyForm());
  };

  const saveAdditionalPayment = (event) => {
    event.preventDefault();

    const targetInvoice = payments.find((item) => item.id === paymentTarget);

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
      amount > balance
    ) {
      setPaymentError(
        `Enter an amount greater than zero and not exceeding ${currency(balance)}.`
      );
      return;
    }

    setPayments((previous) =>
      previous.map((item) =>
        item.id === paymentTarget
          ? {
              ...item,
              advance: toAmount(item.advance) + amount,
              method: paymentMethod,
              notes: paymentNotes
                ? `${item.notes ? item.notes + " | " : ""}Paid ${currency(amount)} on ${paymentDate} via ${paymentMethod}`
                : item.notes,
            }
          : item
      )
    );

    play("success");
    setActiveTab("list");
    setPaymentTarget("");
    setPaymentAmount("");
    setPaymentError("");
  };

  const deletePayment = (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    setPayments((previous) => previous.filter((payment) => payment.id !== id));
    play("delete");
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return payments.filter((payment) => {
      const matchesSearch = [
        payment.customer,
        payment.phone,
        payment.invoice,
        payment.event,
        payment.packageName,
        payment.method,
      ].some((value) => String(value || "").toLowerCase().includes(query));

      return (
        matchesSearch && (filter === "All" || getStatus(payment) === filter)
      );
    });
  }, [payments, search, filter]);

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + toAmount(payment.total),
    0
  );

  const received = payments.reduce(
    (sum, payment) => sum + toAmount(payment.advance),
    0
  );

  const pending = payments.reduce(
    (sum, payment) => sum + getBalance(payment),
    0
  );

  const stats = [
    {
      title: "Total Billing",
      value: currency(totalRevenue),
      icon: Receipt,
      color: "text-[#102f62]",
      bg: "bg-[#eaf1fa]",
    },
    {
      title: "Amount Received",
      value: currency(received),
      icon: IndianRupee,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      title: "Pending Balance",
      value: currency(pending),
      icon: Clock3,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total Invoices",
      value: payments.length,
      icon: Wallet,
      color: "text-[#102f62]",
      bg: "bg-[#eaf1fa]",
    },
  ];

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char]
    );

  const printInvoice = (payment) => {
    play("print");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.alert("Please allow popups to print the invoice.");
      return;
    }

    const safe = (value) => escapeHtml(value);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${safe(payment.invoice)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #10264d;
            background: white;
          }
          .container { max-width: 800px; margin: auto; }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 22px;
            border-bottom: 3px solid #102f62;
          }
          h1 { font-size: 25px; margin: 0 0 8px; }
          h2 { font-size: 20px; margin-top: 28px; }
          .muted { color: #64748b; font-size: 13px; }
          .section { margin: 25px 0; }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .row span, .row strong { overflow-wrap: anywhere; }
          .total { font-size: 19px; font-weight: bold; }
          .footer {
            margin-top: 45px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
          }
          @media print {
            body { padding: 12px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div>
              <h1>STUDIO RAW PICTUREZ</h1>
              <p class="muted">Photography & Event Services</p>
            </div>
            <div>
              <strong>PAYMENT INVOICE</strong>
              <p>${safe(payment.invoice)}</p>
              <p class="muted">${safe(formatDate(payment.date))}</p>
            </div>
          </div>

          <div class="section">
            <h2>Customer Information</h2>
            <p><strong>Customer:</strong> ${safe(payment.customer)}</p>
            <p><strong>Phone:</strong> ${safe(payment.phone)}</p>
            <p><strong>Event:</strong> ${safe(payment.event)}</p>
            <p><strong>Package:</strong> ${safe(payment.packageName)}</p>
            <p><strong>Payment Method:</strong> ${safe(payment.method)}</p>
          </div>

          <div class="section">
            <h2>Payment Summary</h2>
            <div class="row">
              <span>Total Amount</span>
              <strong>${safe(currency(payment.total))}</strong>
            </div>
            <div class="row">
              <span>Amount Received</span>
              <strong>${safe(currency(payment.advance))}</strong>
            </div>
            <div class="row total">
              <span>Pending Balance</span>
              <strong>${safe(currency(getBalance(payment)))}</strong>
            </div>
            <p><strong>Status:</strong> ${safe(getStatus(payment))}</p>
            ${
              payment.notes
                ? `<p><strong>Notes:</strong> ${safe(payment.notes)}</p>`
                : ""
            }
          </div>

          <div class="footer">
            <p>Thank you for choosing Studio Raw Picturez!</p>
            <p class="muted">Generated from StudioRaw ERP & CRM</p>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const selectedRecordInvoice = payments.find(
    (item) => item.id === paymentTarget
  );

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-[#f3f6fb] p-3 text-[#10264d] sm:p-5 lg:p-8">
      {/* HEADER WITH VIEW TABS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white shadow-sm">
            <Wallet size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">
              Payment & Billing
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Manage invoices, payments and customer balances
            </p>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-[#e5edf7] p-1 text-xs font-semibold sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setActiveTab("list");
                play("click");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
                activeTab === "list"
                  ? "bg-[#102f62] text-white shadow-sm"
                  : "text-[#10264d] hover:text-[#102f62]"
              }`}
            >
              <Receipt size={16} />
              Invoices ({payments.length})
            </button>

            <button
              type="button"
              onClick={openCreateInvoice}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
                activeTab === "invoice-form"
                  ? "bg-[#102f62] text-white shadow-sm"
                  : "text-[#10264d] hover:text-[#102f62]"
              }`}
            >
              <Plus size={16} />
              Payment Invoice Form
            </button>

            <button
              type="button"
              onClick={() => openRecordPayment()}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
                activeTab === "record-payment"
                  ? "bg-[#102f62] text-white shadow-sm"
                  : "text-[#10264d] hover:text-[#102f62]"
              }`}
            >
              <CreditCard size={16} />
              Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          VIEW 1: INVOICES LIST VIEW
      ============================================================ */}
      {activeTab === "list" && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="min-w-0 rounded-2xl border border-[#e0e8f2] bg-white p-3.5 shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 sm:text-sm">
                        {stat.title}
                      </p>

                      <h2
                        className={`mt-3 truncate whitespace-nowrap text-base font-bold sm:text-xl xl:text-2xl ${stat.color}`}
                      >
                        {stat.value}
                      </h2>
                    </div>

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${stat.bg}`}
                    >
                      <Icon size={19} className={stat.color} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* INVOICES SECTION */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e0e8f2] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e9eef5] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#10264d]">
                  Invoice Management
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {filtered.length} of {payments.length} invoices
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:flex-1 xl:w-72">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search invoices..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="w-full sm:w-44">
                  <CustomDropdown
                    value={filter}
                    options={filterOptions}
                    onChange={(value) => {
                      setFilter(value);
                      play("click");
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={openCreateInvoice}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#102f62] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1c477e]"
                >
                  <Plus size={18} />
                  New Invoice
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-500">
                No invoices found.
              </div>
            ) : (
              <>
                {/* MOBILE / TABLET CARDS */}
                <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
                  {filtered.map((payment) => {
                    const status = getStatus(payment);
                    const balance = getBalance(payment);

                    return (
                      <article
                        key={payment.id}
                        className="min-w-0 overflow-hidden rounded-xl border border-[#e0e8f2] bg-white"
                      >
                        <div className="flex items-start justify-between gap-3 bg-[#f5f8fd] p-4">
                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-[#10264d]">
                              {payment.customer}
                            </h3>
                            <p className="mt-1 break-all text-xs font-semibold text-[#315f9a]">
                              {payment.invoice}
                            </p>
                          </div>
                          <StatusBadge status={status} />
                        </div>

                        <div className="space-y-4 p-4">
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Phone size={13} />
                              {payment.phone || "—"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={13} />
                              {formatDate(payment.date)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-[#edf1f6] pt-4">
                            <MobileDetail label="Event" value={payment.event} />
                            <MobileDetail
                              label="Package"
                              value={payment.packageName}
                            />
                            <MobileDetail
                              label="Payment Method"
                              value={payment.method}
                            />
                            <MobileDetail
                              label="Total Amount"
                              value={currency(payment.total)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#eef4fc] p-3">
                            <div className="min-w-0">
                              <p className="text-xs text-slate-500">Received</p>
                              <p className="mt-1 break-words text-sm font-bold text-green-700">
                                {currency(payment.advance)}
                              </p>
                            </div>

                            <div className="min-w-0 border-l border-[#dce5f2] pl-3">
                              <p className="text-xs text-slate-500">Balance</p>
                              <p
                                className={`mt-1 break-words text-sm font-bold ${
                                  balance > 0
                                    ? "text-orange-600"
                                    : "text-green-700"
                                }`}
                              >
                                {currency(balance)}
                              </p>
                            </div>
                          </div>

                          {payment.notes && (
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs text-slate-400">Notes</p>
                              <p className="mt-1 break-words text-xs text-slate-600">
                                {payment.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f6] pt-3">
                            {balance > 0 ? (
                              <button
                                type="button"
                                onClick={() => openRecordPayment(payment.id)}
                                className="flex items-center gap-1.5 rounded-lg bg-[#102f62] px-3 py-2 text-xs font-semibold text-white"
                              >
                                <Plus size={14} />
                                Record Payment
                              </button>
                            ) : (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
                                <CheckCircle2 size={15} />
                                Fully Paid
                              </span>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(payment)}
                                title="Edit Invoice"
                                className="rounded-lg bg-blue-50 p-2 text-[#174b91]"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => printInvoice(payment)}
                                title="Print Invoice"
                                className="rounded-lg bg-slate-100 p-2 text-slate-700"
                              >
                                <Printer size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => deletePayment(payment.id)}
                                title="Delete Invoice"
                                className="rounded-lg bg-red-50 p-2 text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="bg-[#102f62] text-xs uppercase text-white">
                      <tr>
                        {[
                          "Invoice",
                          "Customer",
                          "Event / Package",
                          "Total",
                          "Received",
                          "Balance",
                          "Status",
                          "Actions",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="whitespace-nowrap px-4 py-4 font-semibold"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#edf1f6]">
                      {filtered.map((payment) => {
                        const status = getStatus(payment);
                        const balance = getBalance(payment);

                        return (
                          <tr
                            key={payment.id}
                            className="transition hover:bg-[#f4f8fe]"
                          >
                            <td className="px-4 py-4">
                              <p className="font-semibold text-[#174b91]">
                                {payment.invoice}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {formatDate(payment.date)}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-semibold text-[#10264d]">
                                {payment.customer}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {payment.phone}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium">{payment.event}</p>
                              <p className="mt-1 max-w-44 break-words text-xs text-slate-500">
                                {payment.packageName}
                              </p>
                            </td>

                            <td className="px-4 py-4 font-semibold">
                              {currency(payment.total)}
                            </td>

                            <td className="px-4 py-4 font-semibold text-green-700">
                              {currency(payment.advance)}
                            </td>

                            <td className="px-4 py-4 font-semibold text-orange-600">
                              {currency(balance)}
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge status={status} />
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                {balance > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openRecordPayment(payment.id)
                                    }
                                    title="Record Payment"
                                    className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openEdit(payment)}
                                  title="Edit Invoice"
                                  className="rounded-lg bg-blue-50 p-2 text-[#174b91] hover:bg-blue-100"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => printInvoice(payment)}
                                  title="Print Invoice"
                                  className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                                >
                                  <Printer size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => deletePayment(payment.id)}
                                  title="Delete Invoice"
                                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
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
              </>
            )}

            <div className="border-t border-[#edf1f6] px-4 py-4 text-xs text-slate-500 sm:px-5">
              Showing {filtered.length} of {payments.length} invoices
            </div>
          </section>
        </>
      )}

      {/* ============================================================
          VIEW 2: PAYMENT INVOICE FORM PAGE
      ============================================================ */}
      {activeTab === "invoice-form" && (
        <div className="space-y-6">
          {/* FORM PAGE HEADER */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  play("click");
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f1] text-[#102f62] transition hover:bg-slate-50"
                title="Back to Invoices"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h2 className="text-lg font-bold text-[#10264d] sm:text-xl">
                  {editingId !== null
                    ? "Edit Payment Invoice"
                    : "Create Payment Invoice"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  {editingId !== null
                    ? `Update invoice #${editingId}`
                    : "Fill in client and billing details to generate an official invoice"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  play("click");
                }}
                className="rounded-xl border border-[#dce5f1] bg-white px-4 py-2.5 text-xs font-semibold text-[#102f62] hover:bg-slate-50 sm:text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(createEmptyForm());
                  setError("");
                  play("click");
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#dce5f1] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:text-sm"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>

          {/* MAIN FORM GRID */}
          <form onSubmit={savePayment}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* LEFT: FORM INPUTS (2 COLS) */}
              <div className="space-y-6 lg:col-span-2">
                {/* SECTION 1: CUSTOMER DETAILS */}
                <div className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-7">
                  <SectionHeading
                    icon={UserRound}
                    title="Customer & Contact Details"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Customer Name" required>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={form.customer}
                        onChange={(event) =>
                          update("customer", event.target.value)
                        }
                        placeholder="Enter full name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={form.phone}
                        onChange={(event) =>
                          update(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="Enter 10-digit number"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Event Type" required>
                      <CustomDropdown
                        value={form.event}
                        options={eventOptions}
                        onChange={(value) => update("event", value)}
                        required
                      />
                    </FormField>

                    <FormField label="Package Selection" required>
                      <CustomDropdown
                        value={form.packageName}
                        options={packageOptions}
                        onChange={(value) => update("packageName", value)}
                        placeholder="Select Service Package"
                        required
                      />
                    </FormField>
                  </div>
                </div>

                {/* SECTION 2: BILLING & PAYMENT */}
                <div className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-7">
                  <SectionHeading
                    icon={IndianRupee}
                    title="Billing & Payment Details"
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Total Package Amount (₹)" required>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={form.total}
                        onChange={(event) =>
                          update("total", event.target.value)
                        }
                        placeholder="e.g. 50000"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Advance Received (₹)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.advance}
                        onChange={(event) =>
                          update("advance", event.target.value)
                        }
                        placeholder="e.g. 20000"
                        className={inputClass}
                      />
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
                        onChange={(event) => update("date", event.target.value)}
                        className={inputClass}
                      />
                    </FormField>
                  </div>
                </div>

                {/* SECTION 3: NOTES */}
                <div className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-7">
                  <SectionHeading
                    icon={FileText}
                    title="Additional Notes & Instructions"
                  />

                  <FormField label="Notes / Terms">
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(event) => update("notes", event.target.value)}
                      placeholder="Add any payment notes, discount details, or special requests..."
                      className={`${inputClass} resize-y`}
                    />
                  </FormField>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </p>
                )}
              </div>

              {/* RIGHT: LIVE SUMMARY & ACTION CARD (1 COL) */}
              <div className="space-y-6">
                <div className="sticky top-6 rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-6">
                  <div className="border-b border-[#edf1f6] pb-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#102f62]">
                      Live Invoice Preview
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-[#10264d]">
                      Invoice Summary
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Studio Raw Picturez
                    </p>
                  </div>

                  <div className="space-y-3 py-4 text-sm">
                    <div className="flex justify-between border-b border-[#f1f5f9] pb-2 text-xs text-slate-500">
                      <span>Customer:</span>
                      <strong className="text-right text-[#10264d]">
                        {form.customer || "—"}
                      </strong>
                    </div>

                    <div className="flex justify-between border-b border-[#f1f5f9] pb-2 text-xs text-slate-500">
                      <span>Phone:</span>
                      <strong className="text-right text-[#10264d]">
                        {form.phone || "—"}
                      </strong>
                    </div>

                    <div className="flex justify-between border-b border-[#f1f5f9] pb-2 text-xs text-slate-500">
                      <span>Service:</span>
                      <strong className="max-w-44 text-right text-[#10264d]">
                        {form.packageName || "—"}
                      </strong>
                    </div>

                    <div className="flex justify-between border-b border-[#f1f5f9] pb-2 text-xs text-slate-500">
                      <span>Date:</span>
                      <strong className="text-right text-[#10264d]">
                        {formatDate(form.date)}
                      </strong>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600">Total Bill</span>
                      <strong className="text-base text-[#10264d]">
                        {currency(form.total || 0)}
                      </strong>
                    </div>

                    <div className="flex justify-between text-green-700">
                      <span>Advance Received</span>
                      <strong className="text-base">
                        {currency(form.advance || 0)}
                      </strong>
                    </div>

                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-3.5">
                      <p className="text-xs font-semibold text-orange-700">
                        Pending Balance
                      </p>
                      <h4 className="mt-1 text-xl font-extrabold text-orange-600">
                        {currency(
                          Math.max(
                            0,
                            toAmount(form.total) - toAmount(form.advance)
                          )
                        )}
                      </h4>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs text-slate-500">Status: </span>
                      <StatusBadge
                        status={
                          toAmount(form.total) > 0 &&
                          toAmount(form.advance) >= toAmount(form.total)
                            ? "Paid"
                            : toAmount(form.advance) > 0
                            ? "Partial"
                            : "Pending"
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-[#edf1f6] pt-5">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1a4487]"
                    >
                      <Save size={18} />
                      {editingId !== null ? "Update Invoice" : "Save & Generate Invoice"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("list");
                        play("click");
                      }}
                      className="w-full rounded-xl border border-[#dce5f1] bg-white px-5 py-3 text-center text-sm font-semibold text-[#102f62] hover:bg-slate-50"
                    >
                      Back to Invoices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================
          VIEW 3: RECORD PAYMENT FORM PAGE
      ============================================================ */}
      {activeTab === "record-payment" && (
        <div className="space-y-6">
          {/* RECORD PAYMENT HEADER */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  play("click");
                }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f1] text-[#102f62] transition hover:bg-slate-50"
                title="Back to Invoices"
              >
                <ArrowLeft size={18} />
              </button>

              <div>
                <h2 className="text-lg font-bold text-[#10264d] sm:text-xl">
                  Record Payment / Collect Due
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  Add payment receipt against an invoice to clear outstanding balance
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab("list");
                play("click");
              }}
              className="rounded-xl border border-[#dce5f1] bg-white px-4 py-2.5 text-xs font-semibold text-[#102f62] hover:bg-slate-50 sm:text-sm"
            >
              Back to Invoices
            </button>
          </div>

          <form onSubmit={saveAdditionalPayment}>
            <div className="mx-auto max-w-3xl space-y-6">
              {/* CARD: SELECT INVOICE */}
              <div className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-7">
                <SectionHeading
                  icon={Receipt}
                  title="Select Customer Invoice"
                />

                <FormField label="Choose Invoice" required>
                  <select
                    value={paymentTarget}
                    onChange={(event) => {
                      setPaymentTarget(event.target.value);
                      setPaymentError("");
                    }}
                    required
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select an invoice with pending balance...
                    </option>
                    {payments.map((item) => {
                      const balance = getBalance(item);
                      return (
                        <option key={item.id} value={item.id}>
                          {item.customer} · {item.invoice} — Balance:{" "}
                          {currency(balance)} ({getStatus(item)})
                        </option>
                      );
                    })}
                  </select>
                </FormField>

                {selectedRecordInvoice && (
                  <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-[#e0e8f2] bg-[#f8fafd] p-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Total Bill</p>
                      <h4 className="mt-1 text-base font-bold text-[#10264d]">
                        {currency(selectedRecordInvoice.total)}
                      </h4>
                    </div>

                    <div>
                      <p className="text-xs text-green-700">Already Received</p>
                      <h4 className="mt-1 text-base font-bold text-green-700">
                        {currency(selectedRecordInvoice.advance)}
                      </h4>
                    </div>

                    <div>
                      <p className="text-xs text-orange-600">Pending Balance</p>
                      <h4 className="mt-1 text-base font-extrabold text-orange-600">
                        {currency(getBalance(selectedRecordInvoice))}
                      </h4>
                    </div>
                  </div>
                )}
              </div>

              {/* CARD: PAYMENT INPUTS */}
              {selectedRecordInvoice && (
                <div className="rounded-2xl border border-[#e0e8f2] bg-white p-5 shadow-sm sm:p-7">
                  <SectionHeading
                    icon={CreditCard}
                    title="Payment Information"
                  />

                  <div className="space-y-4">
                    <FormField label="Payment Amount Received (₹)" required>
                      <div className="space-y-2">
                        <input
                          type="number"
                          min="0.01"
                          max={getBalance(selectedRecordInvoice)}
                          step="0.01"
                          required
                          autoFocus
                          value={paymentAmount}
                          onChange={(event) => {
                            setPaymentAmount(event.target.value);
                            setPaymentError("");
                          }}
                          placeholder={`Enter amount up to ${currency(
                            getBalance(selectedRecordInvoice)
                          )}`}
                          className={inputClass}
                        />

                        {getBalance(selectedRecordInvoice) > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentAmount(
                                  String(getBalance(selectedRecordInvoice))
                                );
                                setPaymentError("");
                              }}
                              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#102f62] hover:bg-blue-100"
                            >
                              Pay Full Balance:{" "}
                              {currency(getBalance(selectedRecordInvoice))}
                            </button>
                          </div>
                        )}
                      </div>
                    </FormField>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          onChange={(event) => setPaymentDate(event.target.value)}
                          className={inputClass}
                        />
                      </FormField>
                    </div>

                    <FormField label="Payment Notes / Transaction ID">
                      <input
                        type="text"
                        value={paymentNotes}
                        onChange={(event) => setPaymentNotes(event.target.value)}
                        placeholder="e.g. UPI Ref / GPay Ref / Cheque No"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  {paymentError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                    >
                      {paymentError}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#edf1f6] pt-5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("list");
                        play("click");
                      }}
                      className="rounded-xl border border-[#dce5f1] bg-white px-5 py-3 text-sm font-semibold text-[#102f62] hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#1a4487]"
                    >
                      <Check size={18} />
                      Save Payment Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
