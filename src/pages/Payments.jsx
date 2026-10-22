
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

const KEY = "studioraw_payments";

const todayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

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

const eventOptions = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Corporate",
  "Other",
];

const methodOptions = ["Cash", "UPI", "Bank Transfer", "Card"];

const filterOptions = ["All", "Paid", "Partial", "Pending"];

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#8ca0bd] focus:border-[#3478e5] focus:ring-2 focus:ring-blue-100";

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
  Paid: "border-emerald-100 bg-emerald-50 text-emerald-700",
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

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
}

function readPayments() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-semibold text-[#29416a]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91]">
        <Icon size={19} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">{title}</h3>
    </div>
  );
}

function CustomDropdown({ value, options, onChange }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map((option) => (
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
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-xs ${
        statusStyle[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function MobileDetail({ label, value, highlight = false, span = false }) {
  return (
    <div className={`min-w-0 ${span ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-medium text-[#91a0b5] sm:text-xs">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-[12px] font-semibold leading-5 sm:text-[13px] ${
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/65 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[96dvh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112e60] text-white sm:h-12 sm:w-12 sm:rounded-2xl">
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d] sm:text-[23px]">
                {title}
              </h2>
              <p className="mt-1 text-xs text-[#8090aa] sm:text-sm">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            {children}
          </div>
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d9e3f2] bg-[#f7f9fd] px-7 py-3 text-sm font-semibold text-[#18345f] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3 text-sm font-semibold text-white hover:bg-[#1a4384]"
            >
              <Save size={18} />
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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(payments));
  }, [payments]);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setError("");
  };

  const openForm = () => {
    setForm(createEmptyForm());
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setError("");
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
      setError("Please enter the package name.");
      return;
    }

    const total = Number(form.total);
    const advance = Number(form.advance || 0);

    if (
      !form.total ||
      !Number.isFinite(total) ||
      !Number.isFinite(advance) ||
      total <= 0 ||
      advance < 0 ||
      advance > total
    ) {
      setError(
        "Enter a valid total and advance amount. Advance cannot exceed total."
      );
      return;
    }

    if (!form.date) {
      setError("Please select invoice date.");
      return;
    }

    const payment = {
      ...form,
      id: createId(),
      invoice: `INV-${Date.now()}`,
      customer,
      phone,
      packageName: form.packageName.trim(),
      total,
      advance,
    };

    setPayments((previous) => [payment, ...previous]);
    closeForm();
  };

  const closeAddPayment = () => {
    setPaymentTarget(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const deletePayment = (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    setPayments((previous) =>
      previous.filter((payment) => payment.id !== id)
    );

    if (paymentTarget === id) closeAddPayment();
  };

  const openAddPayment = (id) => {
    setPaymentTarget(id);
    setPaymentAmount("");
    setPaymentError("");
  };

  const saveAdditionalPayment = (event) => {
    event.preventDefault();

    const payment = payments.find((item) => item.id === paymentTarget);

    if (!payment) {
      setPaymentError("Invoice not found.");
      return;
    }

    const balance = getBalance(payment);
    const amount = Number(paymentAmount);

    if (
      !paymentAmount.trim() ||
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
          ? { ...item, advance: toAmount(item.advance) + amount }
          : item
      )
    );

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
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesSearch && (filter === "All" || getStatus(payment) === filter);
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
      color: "text-blue-700",
      bg: "bg-blue-50",
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
      color: "text-indigo-700",
      bg: "bg-indigo-50",
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
            border-bottom: 3px solid #10264d;
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
          @media print { body { padding: 12px; } }
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
              <p class="muted">${safe(payment.date)}</p>
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

  const selectedPayment = payments.find(
    (item) => item.id === paymentTarget
  );

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-5 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:space-y-7 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">
      {/* PAGE HEADER */}
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af] lg:block">
            Financial Management
          </p>
          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl lg:text-[29px] lg:font-extrabold">
            Payment & Billing
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage invoices, payments and outstanding balances.
          </p>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] lg:w-auto lg:px-6"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white p-3.5 shadow-[0_3px_14px_rgba(16,38,77,0.035)] transition hover:shadow-md sm:p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold leading-4 text-slate-500 sm:text-sm">
                    {stat.title}
                  </p>
                  <h2
                    className={`mt-2 break-words text-lg font-extrabold tracking-tight sm:mt-3 sm:text-2xl ${stat.color}`}
                  >
                    {stat.value}
                  </h2>
                </div>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 sm:rounded-xl ${stat.bg}`}
                >
                  <Icon size={17} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* INVOICE MANAGEMENT */}
      <section className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white shadow-sm lg:rounded-[22px]">
        <div className="border-b border-[#edf1f6] p-4 sm:p-5 lg:px-6 lg:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Invoice Management
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                View and manage customer billing records.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[230px] lg:w-72">
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
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No invoices found
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE - UNCHANGED FUNCTIONALITY */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead className="bg-[#f7f9fd]">
                  <tr className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8290a5]">
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
                      <th key={heading} className="px-5 py-4">
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
                        className="transition hover:bg-[#f8faff]"
                      >
                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-blue-700">
                            {payment.invoice}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {payment.date || "No date"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-[#10264d]">
                            {payment.customer}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {payment.phone}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-slate-700">
                            {payment.event}
                          </p>
                          <p className="mt-1 max-w-40 break-words text-xs text-slate-500">
                            {payment.packageName}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-[#10264d]">
                          {currency(payment.total)}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-green-700">
                          {currency(payment.advance)}
                        </td>

                        <td className="px-5 py-5 text-sm font-semibold text-orange-600">
                          {currency(balance)}
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={status} />
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            {balance > 0 && (
                              <button
                                type="button"
                                title="Add Payment"
                                onClick={() => openAddPayment(payment.id)}
                                className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                              >
                                <Plus size={17} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Print Invoice"
                              onClick={() => printInvoice(payment)}
                              className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                            >
                              <Printer size={17} />
                            </button>
                            <button
                              type="button"
                              title="Delete Invoice"
                              onClick={() => deletePayment(payment.id)}
                              className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PREMIUM COMPACT MOBILE CARDS */}
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:hidden">
              {filtered.map((payment) => {
                const status = getStatus(payment);
                const balance = getBalance(payment);

                return (
                  <article
                    key={payment.id}
                    className="min-w-0 rounded-2xl border border-[#e3eaf4] bg-white p-3.5 shadow-[0_3px_12px_rgba(16,38,77,0.04)] sm:p-4"
                  >
                    {/* HEADER */}
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-[#10264d]">
                            {payment.customer}
                          </h3>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-[#4972a8]">
                            {payment.invoice}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={status} />
                    </div>

                    {/* DATE AND PHONE */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[#edf1f6] pb-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} />
                        {payment.phone || "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {formatDate(payment.date)}
                      </span>
                    </div>

                    {/* COMPACT TWO-COLUMN DETAILS */}
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3.5">
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

                    {/* PAYMENT SUMMARY */}
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[#e6edf7] bg-[#f7faff] p-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium text-slate-500">
                          Received
                        </p>
                        <p className="mt-1 break-words text-sm font-bold text-emerald-700">
                          {currency(payment.advance)}
                        </p>
                      </div>

                      <div className="min-w-0 border-l border-[#dce5f2] pl-3">
                        <p className="text-[10px] font-medium text-slate-500">
                          Balance
                        </p>
                        <p
                          className={`mt-1 break-words text-sm font-bold ${
                            balance > 0
                              ? "text-orange-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {currency(balance)}
                        </p>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
                        <p className="text-[10px] font-medium text-slate-400">
                          Notes
                        </p>
                        <p className="mt-1 break-words text-xs text-[#52627b]">
                          {payment.notes}
                        </p>
                      </div>
                    )}

                    {/* COMPACT ACTIONS */}
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#edf1f6] pt-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        {balance > 0 ? (
                          <button
                            type="button"
                            onClick={() => openAddPayment(payment.id)}
                            className="flex items-center gap-1 rounded-lg bg-[#102f62] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#1b467e]"
                          >
                            <Plus size={14} />
                            Add Payment
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Fully Paid
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => printInvoice(payment)}
                          aria-label="Print invoice"
                          title="Print Invoice"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#344767] hover:bg-slate-200"
                        >
                          <Printer size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePayment(payment.id)}
                          aria-label="Delete invoice"
                          title="Delete Invoice"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="hidden items-center justify-between border-t border-[#edf1f6] px-6 py-4 lg:flex">
          <p className="text-xs text-[#8290a5]">
            Showing {filtered.length} of {payments.length} invoices
          </p>
          <span className="text-xs text-[#8290a5]">
            Studio Raw Picturez ERP
          </span>
        </div>
      </section>

      {/* CREATE INVOICE MODAL */}
      {showForm && (
        <ModalShell
          title="Create New Invoice"
          description="Create a new customer payment invoice"
          icon={Receipt}
          onClose={closeForm}
          onSubmit={savePayment}
          submitLabel="Save Invoice"
        >
          <div className="space-y-8">
            <section>
              <SectionHeading
                icon={UserRound}
                title="Customer Information"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Customer Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.customer}
                    onChange={(event) =>
                      update("customer", event.target.value)
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
                      update("phone", event.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 10-digit mobile number"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Event Type">
                  <CustomDropdown
                    value={form.event}
                    options={eventOptions}
                    onChange={(value) => update("event", value)}
                  />
                </FormField>

                <FormField label="Package Name" required>
                  <input
                    type="text"
                    required
                    value={form.packageName}
                    onChange={(event) =>
                      update("packageName", event.target.value)
                    }
                    placeholder="Enter package name"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionHeading
                icon={IndianRupee}
                title="Billing Information"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Total Amount" required>
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

                <FormField label="Advance Received">
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

                <FormField label="Payment Method">
                  <CustomDropdown
                    value={form.method}
                    options={methodOptions}
                    onChange={(value) => update("method", value)}
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

              <div className="mt-5 rounded-xl border border-blue-100 bg-[#edf4ff] p-5">
                <p className="text-sm font-medium text-[#627895]">
                  Remaining Balance
                </p>
                <h3 className="mt-2 text-2xl font-bold text-[#112e60]">
                  {currency(
                    Math.max(
                      0,
                      toAmount(form.total) - toAmount(form.advance)
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
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Enter additional payment details..."
                  className={inputClass}
                />
              </FormField>
            </section>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}
          </div>
        </ModalShell>
      )}

      {/* ADD PAYMENT MODAL */}
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

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                <p className="text-xs font-medium text-slate-500">
                  Total Invoice Amount
                </p>
                <h3 className="mt-2 break-words text-lg font-bold text-[#10264d] sm:text-xl">
                  {currency(selectedPayment.total)}
                </h3>
              </div>

              <div className="min-w-0 rounded-xl border border-green-100 bg-green-50 p-3 sm:p-4">
                <p className="text-xs font-medium text-green-700">
                  Amount Received
                </p>
                <h3 className="mt-2 break-words text-lg font-bold text-green-700 sm:text-xl">
                  {currency(selectedPayment.advance)}
                </h3>
              </div>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm font-medium text-orange-700">
                Pending Balance
              </p>
              <h3 className="mt-2 text-2xl font-bold text-orange-700">
                {currency(getBalance(selectedPayment))}
              </h3>
            </div>

            <FormField label="Payment Amount" required>
              <input
                type="number"
                min="0.01"
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

            {paymentError && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
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
