
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
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
} from "lucide-react";

const KEY = "studioraw_payments";
const SOUND_KEY = "studioraw_payments_sound";

const NAVY = "#102f62";

const todayKey = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const eventOptions = [
  "Wedding Photography",

"Traditional Photography",

"Candid Photography",

"Helicam (Drone) Photography",

"PreWedding Photography",

"Post Wedding Photography",

"Custom Package",

"Wedding Videography",

"Function We Arrange",

"Event Management",

"Customized Gifts",

"Pre-Wedding / Outdoor Shoot",

"Baby & Kids Shoot",

"Complete Wedding Package",

];

const methodOptions = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
];

const filterOptions = [
  "All",
  "Paid",
  "Partial",
  "Pending",
];

const createEmptyForm = () => ({
  customer: "",
  phone: "",
  event: "Wedding",
  packageName: "",
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
    packageName: "Premium Wedding",
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
    packageName: "Classic Engagement",
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
    packageName: "Birthday Special",
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
    packageName: "Pre-Wedding Premium",
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
    packageName: "Baby Portrait",
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
    packageName: "Corporate Photography",
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
    packageName: "Event Photography",
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
  const number = Number(
    String(value ?? 0).replace(/[₹,\s]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
};

const currency = (value) =>
  `₹${toAmount(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getBalance = (payment) =>
  Math.max(
    0,
    toAmount(payment.total) - toAmount(payment.advance)
  );

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

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

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
        gain.gain.exponentialRampToValueAtTime(
          0.035,
          start + 0.012
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.13
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.14);
      });
    } catch {
      // Ignore unsupported audio devices.
    }
  };

  return {
    enabled,
    setEnabled,
    play,
  };
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#344767]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
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

      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
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
    value && !options.includes(value)
      ? [value, ...options]
      : options;

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
        statusStyle[status] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function MobileDetail({ label, value, highlight = false }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

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

function ModalShell({
  title,
  description,
  icon: Icon,
  onClose,
  onSubmit,
  submitLabel,
  children,
  maxWidth = "max-w-[960px]",
}) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#06152b]/75 p-2 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[calc(100dvh-16px)] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-32px)]`}
      >
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#102f62] px-4 py-4 text-white sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold sm:text-xl">
                {title}
              </h2>

              <p className="mt-1 break-words text-xs text-blue-100">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-2 text-white hover:bg-white/15"
          >
            <X size={21} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain bg-white px-4 py-5 sm:px-7 sm:py-6">
            {children}
          </div>

          {/* MODAL FOOTER */}
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[#e7edf5] bg-[#f8fafd] px-4 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#dce5f1] bg-white px-5 py-3 text-sm font-semibold text-[#102f62] hover:bg-slate-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c477e] sm:flex-none"
            >
              <Save size={17} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function Payments() {
  const [payments, setPayments] = useState(readPayments);

  const [form, setForm] = useState(createEmptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentError, setPaymentError] = useState("");

  const { enabled, setEnabled, play } = useSound();

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

  const openForm = () => {
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
    setShowForm(true);
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
    setShowForm(true);
    play("open");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  const savePayment = (event) => {
    event.preventDefault();

    const customer = form.customer.trim();
    const phone = form.phone.trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError(
        "Enter customer name and valid 10-digit phone number."
      );
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
      setError(
        "Enter valid amounts. Advance cannot exceed total."
      );
      return;
    }

    if (!form.date) {
      setError("Please select invoice date.");
      return;
    }

    const existing = payments.find(
      (payment) => payment.id === editingId
    );

    const payment = {
      ...form,
      id: existing ? existing.id : createId(),
      invoice: existing
        ? existing.invoice
        : `INV-${Date.now()}`,
      customer,
      phone,
      packageName: form.packageName.trim(),
      total,
      advance,
    };

    if (editingId !== null) {
      setPayments((previous) =>
        previous.map((item) =>
          item.id === editingId ? payment : item
        )
      );
    } else {
      setPayments((previous) => [
        payment,
        ...previous,
      ]);
    }

    play("success");
    closeForm();
  };

  const closeAddPayment = () => {
    setPaymentTarget(null);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentError("");
  };

  const deletePayment = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this invoice?"
      )
    ) {
      return;
    }

    setPayments((previous) =>
      previous.filter((payment) => payment.id !== id)
    );

    if (paymentTarget === id) {
      closeAddPayment();
    }

    play("delete");
  };

  const openAddPayment = (id) => {
    setPaymentTarget(id);
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentError("");
    play("open");
  };

  const saveAdditionalPayment = (event) => {
    event.preventDefault();

    const payment = payments.find(
      (item) => item.id === paymentTarget
    );

    if (!payment) {
      setPaymentError("Invoice not found.");
      return;
    }

    const balance = getBalance(payment);
    const amount = Number(paymentAmount);

    if (
      paymentAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > balance
    ) {
      setPaymentError(
        `Enter an amount greater than zero and not exceeding ${currency(
          balance
        )}.`
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
            }
          : item
      )
    );

    play("success");
    closeAddPayment();
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
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matchesSearch &&
        (filter === "All" ||
          getStatus(payment) === filter)
      );
    });
  }, [payments, search, filter]);

  const totalRevenue = payments.reduce(
    (sum, payment) =>
      sum + toAmount(payment.total),
    0
  );

  const received = payments.reduce(
    (sum, payment) =>
      sum + toAmount(payment.advance),
    0
  );

  const pending = payments.reduce(
    (sum, payment) =>
      sum + getBalance(payment),
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
      window.alert(
        "Please allow popups to print the invoice."
      );
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
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #10264d;
            background: white;
          }

          .container {
            max-width: 800px;
            margin: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 22px;
            border-bottom: 3px solid #102f62;
          }

          h1 {
            font-size: 25px;
            margin: 0 0 8px;
          }

          h2 {
            font-size: 20px;
            margin-top: 28px;
          }

          .muted {
            color: #64748b;
            font-size: 13px;
          }

          .section {
            margin: 25px 0;
          }

          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .row span,
          .row strong {
            overflow-wrap: anywhere;
          }

          .total {
            font-size: 19px;
            font-weight: bold;
          }

          .footer {
            margin-top: 45px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
          }

          @media print {
            body {
              padding: 12px;
            }
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
              <p class="muted">
                ${safe(formatDate(payment.date))}
              </p>
            </div>
          </div>

          <div class="section">
            <h2>Customer Information</h2>

            <p>
              <strong>Customer:</strong>
              ${safe(payment.customer)}
            </p>

            <p>
              <strong>Phone:</strong>
              ${safe(payment.phone)}
            </p>

            <p>
              <strong>Event:</strong>
              ${safe(payment.event)}
            </p>

            <p>
              <strong>Package:</strong>
              ${safe(payment.packageName)}
            </p>

            <p>
              <strong>Payment Method:</strong>
              ${safe(payment.method)}
            </p>
          </div>

          <div class="section">
            <h2>Payment Summary</h2>

            <div class="row">
              <span>Total Amount</span>
              <strong>
                ${safe(currency(payment.total))}
              </strong>
            </div>

            <div class="row">
              <span>Amount Received</span>
              <strong>
                ${safe(currency(payment.advance))}
              </strong>
            </div>

            <div class="row total">
              <span>Pending Balance</span>
              <strong>
                ${safe(currency(getBalance(payment)))}
              </strong>
            </div>

            <p>
              <strong>Status:</strong>
              ${safe(getStatus(payment))}
            </p>

            ${
              payment.notes
                ? `
                  <p>
                    <strong>Notes:</strong>
                    ${safe(payment.notes)}
                  </p>
                `
                : ""
            }
          </div>

          <div class="footer">
            <p>
              Thank you for choosing Studio Raw Picturez!
            </p>

            <p class="muted">
              Generated from StudioRaw ERP & CRM
            </p>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const selectedPayment = payments.find(
    (item) => item.id === paymentTarget
  );

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-[#f3f6fb] p-3 text-[#10264d] sm:p-5 lg:p-8">
      {/* HEADER */}
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
              Manage invoices, payments and outstanding balances
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openForm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#102f62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c477e] sm:flex-none"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

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
                  <Icon
                    size={19}
                    className={stat.color}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INVOICES */}
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
                onChange={(event) =>
                  setSearch(event.target.value)
                }
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
                        <MobileDetail
                          label="Event"
                          value={payment.event}
                        />

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
                          <p className="text-xs text-slate-500">
                            Received
                          </p>

                          <p className="mt-1 break-words text-sm font-bold text-green-700">
                            {currency(payment.advance)}
                          </p>
                        </div>

                        <div className="min-w-0 border-l border-[#dce5f2] pl-3">
                          <p className="text-xs text-slate-500">
                            Balance
                          </p>

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
                          <p className="text-xs text-slate-400">
                            Notes
                          </p>

                          <p className="mt-1 break-words text-xs text-slate-600">
                            {payment.notes}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f6] pt-3">
                        {balance > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              openAddPayment(payment.id)
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-[#102f62] px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Plus size={14} />
                            Add Payment
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
                            onClick={() =>
                              openEdit(payment)
                            }
                            title="Edit Invoice"
                            className="rounded-lg bg-blue-50 p-2 text-[#174b91]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              printInvoice(payment)
                            }
                            title="Print Invoice"
                            className="rounded-lg bg-slate-100 p-2 text-slate-700"
                          >
                            <Printer size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deletePayment(payment.id)
                            }
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
                          <p className="font-medium">
                            {payment.event}
                          </p>

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
                                  openAddPayment(payment.id)
                                }
                                title="Add Payment"
                                className="rounded-lg bg-blue-50 p-2 text-[#174b91] hover:bg-blue-100"
                              >
                                <Plus size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(payment)
                              }
                              title="Edit Invoice"
                              className="rounded-lg bg-blue-50 p-2 text-[#174b91] hover:bg-blue-100"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                printInvoice(payment)
                              }
                              title="Print Invoice"
                              className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                            >
                              <Printer size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deletePayment(payment.id)
                              }
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

      {/* CREATE / EDIT INVOICE */}
      {showForm && (
        <ModalShell
          title={
            editingId !== null
              ? "Edit Invoice"
              : "Create New Invoice"
          }
          description="Enter customer and billing details"
          icon={Receipt}
          onClose={closeForm}
          onSubmit={savePayment}
          submitLabel={
            editingId !== null
              ? "Update Invoice"
              : "Save Invoice"
          }
        >
          <div className="space-y-7">
            <section>
              <SectionHeading
                icon={UserRound}
                title="Customer Information"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Customer Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.customer}
                    onChange={(event) =>
                      update(
                        "customer",
                        event.target.value
                      )
                    }
                    placeholder="Enter customer name"
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
                    placeholder="Enter 10-digit phone number"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Event Type" required>
                  <CustomDropdown
                    value={form.event}
                    options={eventOptions}
                    onChange={(value) =>
                      update("event", value)
                    }
                    required
                  />
                </FormField>

                <FormField label="Package Name" required>
                  <CustomDropdown
                    value={form.packageName}
                    options={packageOptions}
                    onChange={(value) =>
                      update("packageName", value)
                    }
                    placeholder="Select Package"
                    required
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionHeading
                icon={IndianRupee}
                title="Billing Information"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Total Amount (₹)" required>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.total}
                    onChange={(event) =>
                      update("total", event.target.value)
                    }
                    placeholder="Enter total amount"
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
                    placeholder="Enter advance amount"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Payment Method" required>
                  <CustomDropdown
                    value={form.method}
                    options={methodOptions}
                    onChange={(value) =>
                      update("method", value)
                    }
                    required
                  />
                </FormField>

                <FormField label="Invoice Date" required>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      update("date", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>

              <div className="mt-5 rounded-xl border border-[#dce7f6] bg-[#eef4fc] p-4">
                <p className="text-sm font-medium text-[#234e81]">
                  Remaining Balance
                </p>

                <h3 className="mt-2 break-words text-2xl font-bold text-[#102f62]">
                  {currency(
                    Math.max(
                      0,
                      toAmount(form.total) -
                        toAmount(form.advance)
                    )
                  )}
                </h3>
              </div>
            </section>

            <section>
              <SectionHeading
                icon={FileText}
                title="Additional Information"
              />

              <FormField label="Notes">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Enter additional payment details..."
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
          </div>
        </ModalShell>
      )}

      {/* ADD PAYMENT */}
      {selectedPayment && (
        <ModalShell
          title="Add Payment"
          description={`${selectedPayment.customer} · ${selectedPayment.invoice}`}
          icon={CreditCard}
          onClose={closeAddPayment}
          onSubmit={saveAdditionalPayment}
          submitLabel="Save Payment"
          maxWidth="max-w-[650px]"
        >
          <div className="space-y-6">
            <SectionHeading
              icon={Wallet}
              title="Payment Information"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="min-w-0 rounded-xl border border-[#e0e8f2] bg-[#f5f8fd] p-3 sm:p-4">
                <p className="text-xs text-slate-500">
                  Total Invoice Amount
                </p>

                <h3 className="mt-2 break-words text-lg font-bold text-[#10264d]">
                  {currency(selectedPayment.total)}
                </h3>
              </div>

              <div className="min-w-0 rounded-xl border border-green-100 bg-green-50 p-3 sm:p-4">
                <p className="text-xs text-green-700">
                  Amount Received
                </p>

                <h3 className="mt-2 break-words text-lg font-bold text-green-700">
                  {currency(selectedPayment.advance)}
                </h3>
              </div>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm text-orange-700">
                Pending Balance
              </p>

              <h3 className="mt-2 break-words text-2xl font-bold text-orange-700">
                {currency(getBalance(selectedPayment))}
              </h3>
            </div>

            <FormField label="Payment Amount (₹)" required>
              <input
                type="number"
                min="0.01"
                max={getBalance(selectedPayment)}
                step="0.01"
                required
                autoFocus
                value={paymentAmount}
                onChange={(event) => {
                  setPaymentAmount(event.target.value);
                  setPaymentError("");
                }}
                placeholder="Enter payment amount"
                className={inputClass}
              />
            </FormField>

            <FormField label="Payment Method" required>
              <CustomDropdown
                value={paymentMethod}
                options={methodOptions}
                onChange={setPaymentMethod}
                required
              />
            </FormField>

            {paymentError && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {paymentError}
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
