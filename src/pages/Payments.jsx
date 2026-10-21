
import { useEffect, useMemo, useRef, useState } from "react";
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
  Check,
} from "lucide-react";

const KEY = "studioraw_payments";

const todayKey = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
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

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const toAmount = (value) => {
  const number = Number(
    String(value ?? 0).replace(/[₹,\s]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
};

const currency = (value) =>
  `₹${toAmount(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const getBalance = (payment) =>
  Math.max(
    0,
    toAmount(payment.total) -
      toAmount(payment.advance)
  );

const getStatus = (payment) => {
  const total = toAmount(payment.total);
  const paid = toAmount(payment.advance);

  if (total > 0 && paid >= total) {
    return "Paid";
  }

  if (paid > 0) {
    return "Partial";
  }

  return "Pending";
};

const statusStyle = {
  Paid: "bg-green-100 text-green-700",
  Partial: "bg-blue-100 text-blue-700",
  Pending: "bg-orange-100 text-orange-700",
};

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-60 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
                  <Check
                    size={16}
                    className="shrink-0"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, color = "" }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`break-words text-sm font-semibold ${
          color || "text-[#10264d]"
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="w-full min-w-0">
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </p>

      {children}
    </div>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(KEY)
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(
    createEmptyForm
  );

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const [paymentTarget, setPaymentTarget] =
    useState(null);

  const [paymentAmount, setPaymentAmount] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  const formRef = useRef(null);
  const paymentRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(payments)
    );
  }, [payments]);

  const scrollTo = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const openForm = () => {
    setForm(createEmptyForm());
    setError("");
    setShowForm(true);
    scrollTo(formRef);
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

    if (
      !customer ||
      !/^\d{10}$/.test(phone)
    ) {
      setError(
        "Enter customer name and valid 10-digit phone number."
      );
      return;
    }

    if (!form.packageName.trim()) {
      setError("Please enter the package name.");
      return;
    }

    const total = Number(form.total);
    const advance = Number(
      form.advance || 0
    );

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
      id:
        globalThis.crypto?.randomUUID?.() ||
        `PAY-${Date.now()}`,
      invoice: `INV-${Date.now()}`,
      customer,
      phone,
      packageName: form.packageName.trim(),
      total,
      advance,
    };

    setPayments((previous) => [
      payment,
      ...previous,
    ]);

    closeForm();
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
      previous.filter(
        (payment) => payment.id !== id
      )
    );

    if (paymentTarget === id) {
      closeAddPayment();
    }
  };

  const openAddPayment = (id) => {
    setPaymentTarget(id);
    setPaymentAmount("");
    setPaymentError("");
    scrollTo(paymentRef);
  };

  const closeAddPayment = () => {
    setPaymentTarget(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const saveAdditionalPayment = (event) => {
    event.preventDefault();

    const payment = payments.find(
      (item) => item.id === paymentTarget
    );

    if (!payment) {
      setPaymentError(
        "Invoice not found."
      );
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
          ? {
              ...item,
              advance:
                toAmount(item.advance) +
                amount,
            }
          : item
      )
    );

    closeAddPayment();
  };

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return payments.filter((payment) => {
      const matchesSearch = [
        payment.customer,
        payment.phone,
        payment.invoice,
        payment.event,
        payment.packageName,
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
      color: "text-blue-700",
    },
    {
      title: "Amount Received",
      value: currency(received),
      icon: IndianRupee,
      color: "text-green-700",
    },
    {
      title: "Pending Balance",
      value: currency(pending),
      icon: Clock3,
      color: "text-orange-600",
    },
    {
      title: "Total Invoices",
      value: payments.length,
      icon: Wallet,
      color: "text-indigo-700",
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
    const printWindow = window.open(
      "",
      "_blank"
    );

    if (!printWindow) {
      window.alert(
        "Please allow popups to print the invoice."
      );
      return;
    }

    const safe = (value) =>
      escapeHtml(value);

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
              padding: 30px;
              font-family: Arial, sans-serif;
              color: #10264d;
              background: white;
            }

            .container {
              max-width: 800px;
              margin: 0 auto;
            }

            h1 {
              font-size: 25px;
              border-bottom: 2px solid #10264d;
              padding-bottom: 16px;
            }

            h2 {
              font-size: 19px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 13px 0;
              border-bottom: 1px solid #e2e8f0;
            }

            .row span,
            .row strong {
              overflow-wrap: anywhere;
            }

            .total {
              font-size: 20px;
              font-weight: bold;
            }

            .muted {
              color: #64748b;
              font-size: 13px;
            }

            .footer {
              margin-top: 35px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
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
            <h1>STUDIO RAW PICTUREZ</h1>

            <h2>Payment Invoice</h2>

            <p><strong>Invoice:</strong> ${safe(payment.invoice)}</p>
            <p><strong>Date:</strong> ${safe(payment.date)}</p>

            <hr />

            <p><strong>Customer:</strong> ${safe(payment.customer)}</p>
            <p><strong>Phone:</strong> ${safe(payment.phone)}</p>
            <p><strong>Event:</strong> ${safe(payment.event)}</p>
            <p><strong>Package:</strong> ${safe(payment.packageName)}</p>
            <p><strong>Payment Method:</strong> ${safe(payment.method)}</p>

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
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Payment & Billing
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage invoices, payments and outstanding balances.
          </p>
        </div>

        <button
          type="button"
          onClick={openForm}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      {/* Statistics - Vertical */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={21}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 break-all text-2xl font-bold sm:text-3xl ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Invoice Management */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Invoice Management
        </h2>

        {/* Search */}
        <div className="relative mb-4 w-full min-w-0">
          <Search
            size={17}
            className="absolute left-3 top-3.5 text-slate-400"
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

        {/* Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Payment Status
          </p>

          <CustomDropdown
            value={filter}
            options={filterOptions}
            onChange={setFilter}
          />
        </div>

        {/* Invoice Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No invoices found
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((payment) => {
              const status =
                getStatus(payment);

              const balance =
                getBalance(payment);

              return (
                <article
                  key={payment.id}
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
                >
                  {/* Invoice Header */}
                  <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <p className="break-all text-xs font-semibold text-blue-700">
                        {payment.invoice}
                      </p>

                      <h3 className="mt-2 break-words text-base font-bold text-[#10264d]">
                        {payment.customer}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {payment.date || "No date"}
                      </p>
                    </div>

                    <span
                      className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusStyle[status]
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Invoice Details */}
                  <Detail
                    label="Phone Number"
                    value={payment.phone}
                  />

                  <Detail
                    label="Event"
                    value={payment.event}
                  />

                  <Detail
                    label="Package"
                    value={payment.packageName}
                  />

                  <Detail
                    label="Payment Method"
                    value={payment.method}
                  />

                  <Detail
                    label="Total Amount"
                    value={currency(
                      payment.total
                    )}
                  />

                  <Detail
                    label="Amount Received"
                    value={currency(
                      payment.advance
                    )}
                    color="text-green-700"
                  />

                  <Detail
                    label="Pending Balance"
                    value={currency(balance)}
                    color="text-orange-600"
                  />

                  {payment.notes && (
                    <Detail
                      label="Notes"
                      value={payment.notes}
                    />
                  )}

                  {/* Actions */}
                  <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          openAddPayment(
                            payment.id
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Plus size={17} />
                        Add Payment
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        printInvoice(payment)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-100"
                    >
                      <Printer size={17} />
                      Print Invoice
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deletePayment(
                          payment.id
                        )
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Invoice
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Additional Payment Form */}
      {selectedPayment && (
        <section
          ref={paymentRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#10264d]">
                Add Payment
              </h2>

              <p className="mt-1 break-words text-sm text-slate-500">
                {selectedPayment.customer} ·{" "}
                {selectedPayment.invoice}
              </p>
            </div>

            <button
              type="button"
              onClick={closeAddPayment}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close payment form"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mb-5 rounded-xl bg-blue-50 p-4">
            <p className="text-sm text-slate-500">
              Pending Balance
            </p>

            <h3 className="mt-2 break-all text-2xl font-bold text-[#10264d]">
              {currency(
                getBalance(selectedPayment)
              )}
            </h3>
          </div>

          <form
            onSubmit={saveAdditionalPayment}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Payment Amount">
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={paymentAmount}
                onChange={(event) => {
                  setPaymentAmount(
                    event.target.value
                  );
                  setPaymentError("");
                }}
                placeholder="Enter payment amount"
                className={inputClass}
              />
            </FormField>

            {paymentError && (
              <p
                role="alert"
                className="break-words text-sm font-medium text-red-600"
              >
                {paymentError}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeAddPayment}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Save Payment
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Create Invoice Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                Create Invoice
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter customer billing information.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close invoice form"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={savePayment}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Customer Name">
              <input
                type="text"
                required
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

            <FormField label="Phone Number">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Enter 10-digit phone number"
                className={inputClass}
              />
            </FormField>

            <FormField label="Package Name">
              <input
                type="text"
                required
                value={form.packageName}
                onChange={(event) =>
                  update(
                    "packageName",
                    event.target.value
                  )
                }
                placeholder="Enter package name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={eventOptions}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Total Amount">
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.total}
                onChange={(event) =>
                  update(
                    "total",
                    event.target.value
                  )
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
                  update(
                    "advance",
                    event.target.value
                  )
                }
                placeholder="Enter advance amount"
                className={inputClass}
              />
            </FormField>

            {/* Balance Preview */}
            <div className="w-full min-w-0 rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-slate-500">
                Remaining Balance
              </p>

              <h3 className="mt-2 break-all text-2xl font-bold text-[#10264d]">
                {currency(
                  Math.max(
                    0,
                    toAmount(form.total) -
                      toAmount(form.advance)
                  )
                )}
              </h3>
            </div>

            <FormField label="Payment Method">
              <CustomDropdown
                value={form.method}
                options={methodOptions}
                onChange={(value) =>
                  update("method", value)
                }
              />
            </FormField>

            <FormField label="Invoice Date">
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  update(
                    "date",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Additional payment details..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="break-words text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}

            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                Save Invoice
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
