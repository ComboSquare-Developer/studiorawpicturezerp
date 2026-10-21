
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Download,
  CalendarDays,
  ChevronDown,
  Check,
} from "lucide-react";

const EXPENSE_KEY = "studioraw_expenses";
const PAYMENT_KEY = "studioraw_payments";

const categories = [
  "Staff Salary",
  "Equipment",
  "Maintenance",
  "Studio Rent",
  "Electricity",
  "Travel",
  "Printing",
  "Album Materials",
  "Marketing",
  "Software",
  "Other",
];

const paymentModes = [
  "Cash",
  "UPI",
  "Bank Transfer",
  "Card",
  "Other",
];

const emptyForm = {
  title: "",
  category: "Other",
  amount: "",
  date: "",
  paymentMode: "Cash",
  paidTo: "",
  notes: "",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `EX-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function localDate() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

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

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  const selected = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label || placeholder}
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
          {normalizedOptions.map((option) => {
            const isSelected =
              String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>

                {isSelected && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
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

function Detail({ label, value }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(() =>
    readArray(EXPENSE_KEY)
  );

  const [payments, setPayments] = useState(() =>
    readArray(PAYMENT_KEY)
  );

  const [selectedMonth, setSelectedMonth] = useState(
    localDate().slice(0, 7)
  );

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      EXPENSE_KEY,
      JSON.stringify(expenses)
    );
  }, [expenses]);

  useEffect(() => {
    const refreshPayments = () => {
      setPayments(readArray(PAYMENT_KEY));
    };

    window.addEventListener("focus", refreshPayments);

    return () => {
      window.removeEventListener("focus", refreshPayments);
    };
  }, []);

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: localDate(),
    });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      ...emptyForm,
      ...item,
      amount: String(item.amount ?? ""),
    });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveExpense = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !form.date ||
      form.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Enter a valid title, date and amount.");
      return;
    }

    const record = {
      ...form,
      id: editingId || createId(),
      title: form.title.trim(),
      amount,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setExpenses((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );
    } else {
      setExpenses((previous) => [record, ...previous]);
    }

    closeForm();
  };

  const deleteExpense = (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return;
    }

    setExpenses((previous) =>
      previous.filter((record) => record.id !== item.id)
    );
  };

  const monthlyExpenses = useMemo(
    () =>
      expenses.filter((item) =>
        String(item.date || "").startsWith(selectedMonth)
      ),
    [expenses, selectedMonth]
  );

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return monthlyExpenses.filter((item) => {
      const matchesSearch = [
        item.title,
        item.category,
        item.paidTo,
        item.notes,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (categoryFilter === "All" ||
          item.category === categoryFilter)
      );
    });
  }, [monthlyExpenses, search, categoryFilter]);

  const totalExpenses = monthlyExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Demo income calculation based on existing payment records.
  // Verify field mapping against Payments.jsx before financial use.
  const monthlyIncome = payments.reduce((sum, payment) => {
    const date =
      payment.paymentDate ||
      payment.date ||
      payment.createdAt ||
      "";

    if (!String(date).startsWith(selectedMonth)) {
      return sum;
    }

    const amount = Number(
      payment.paidAmount ??
      payment.amountPaid ??
      payment.amount ??
      0
    );

    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const profit = monthlyIncome - totalExpenses;

  const categoryTotals = categories
    .map((category) => ({
      category,
      total: monthlyExpenses
        .filter((item) => item.category === category)
        .reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Expense",
        "Category",
        "Amount",
        "Payment Mode",
        "Paid To",
        "Notes",
      ],
      ...filteredExpenses.map((item) => [
        item.date,
        item.title,
        item.category,
        item.amount,
        item.paymentMode,
        item.paidTo,
        item.notes,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `studio-expenses-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      label: "Monthly Income",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Monthly Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      label: "Estimated Profit",
      value: profit,
      icon: IndianRupee,
      color:
        profit >= 0 ? "text-blue-700" : "text-red-600",
    },
    {
      label: "Expense Entries",
      value: monthlyExpenses.length,
      icon: Wallet,
      color: "text-indigo-700",
      isCount: true,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-[#10264d]">
            Expense & Profit Management
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Track studio expenses, income and estimated profit
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3">
          <FormField label="Select Month">
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) =>
                setSelectedMonth(event.target.value)
              }
              className={inputClass}
            />
          </FormField>

          <button
            type="button"
            onClick={openAdd}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-slate-500">
                  {item.label}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon size={22} className={item.color} />
                </div>
              </div>

              <h2
                className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${item.color}`}
              >
                {item.isCount
                  ? item.value
                  : money(item.value)}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 break-words text-lg font-bold text-[#10264d]">
          Category-wise Expenses
        </h2>

        {categoryTotals.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No expenses recorded for this month.
          </p>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-5">
            {categoryTotals.map((item) => {
              const percentage =
                totalExpenses > 0
                  ? (item.total / totalExpenses) * 100
                  : 0;

              return (
                <div
                  key={item.category}
                  className="w-full min-w-0"
                >
                  <div className="mb-3 flex w-full min-w-0 flex-col gap-1">
                    <p className="break-words text-sm font-medium text-slate-700">
                      {item.category}
                    </p>

                    <p className="break-words text-sm font-bold text-[#10264d]">
                      {money(item.total)}
                    </p>
                  </div>

                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#10264d] transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    {percentage.toFixed(1)}% of monthly expenses
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Expense Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex w-full min-w-0 flex-col gap-4">
          <h2 className="break-words text-lg font-bold text-[#10264d]">
            Expense Records
          </h2>

          <button
            type="button"
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
          <FormField label="Search Expenses">
            <div className="relative w-full min-w-0">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search expenses..."
                className={`${inputClass} pl-11`}
              />
            </div>
          </FormField>

          <FormField label="Filter Category">
            <CustomDropdown
              value={categoryFilter}
              options={["All", ...categories].map(
                (category) => ({
                  label:
                    category === "All"
                      ? "All Categories"
                      : category,
                  value: category,
                })
              )}
              onChange={setCategoryFilter}
            />
          </FormField>
        </div>

        {/* Expense Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4">
          {filteredExpenses.map((item) => (
            <article
              key={item.id}
              className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
            >
              <div className="flex w-full min-w-0 items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Wallet size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-base font-bold text-[#10264d]">
                    {item.title || "Untitled Expense"}
                  </h3>

                  <p className="mt-1 break-words text-sm text-slate-500">
                    {item.category || "Other"}
                  </p>

                  <p className="mt-2 break-words text-xl font-bold text-red-600">
                    {money(item.amount)}
                  </p>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <Detail
                  label="Expense Date"
                  value={item.date}
                />

                <Detail
                  label="Category"
                  value={item.category}
                />

                <Detail
                  label="Amount"
                  value={money(item.amount)}
                />

                <Detail
                  label="Payment Mode"
                  value={item.paymentMode}
                />

                <Detail
                  label="Paid To"
                  value={item.paidTo}
                />

                <Detail
                  label="Notes"
                  value={item.notes}
                />
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
                >
                  <Pencil size={17} />
                  Edit Expense
                </button>

                <button
                  type="button"
                  onClick={() => deleteExpense(item)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={17} />
                  Delete Expense
                </button>
              </div>
            </article>
          ))}

          {filteredExpenses.length === 0 && (
            <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <Wallet
                size={32}
                className="mb-3 text-slate-300"
              />

              <p className="text-sm font-semibold text-slate-600">
                No expense records found.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Add an expense or change your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inline Add / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex w-full min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId ? "Edit Expense" : "Add Expense"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter studio expense details
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close expense form"
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveExpense}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Expense Title">
              <input
                type="text"
                required
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="e.g. Studio electricity bill"
                className={inputClass}
              />
            </FormField>

            <FormField label="Category">
              <CustomDropdown
                value={form.category}
                options={categories}
                onChange={(value) =>
                  updateField("category", value)
                }
              />
            </FormField>

            <FormField label="Amount (₹)">
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.amount}
                onChange={(event) =>
                  updateField("amount", event.target.value)
                }
                placeholder="Enter amount"
                className={inputClass}
              />
            </FormField>

            <FormField label="Expense Date">
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  updateField("date", event.target.value)
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Payment Mode">
              <CustomDropdown
                value={form.paymentMode}
                options={paymentModes}
                onChange={(value) =>
                  updateField("paymentMode", value)
                }
              />
            </FormField>

            <FormField label="Paid To">
              <input
                type="text"
                value={form.paidTo}
                onChange={(event) =>
                  updateField("paidTo", event.target.value)
                }
                placeholder="Vendor / Staff / Supplier"
                className={inputClass}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                placeholder="Additional details..."
                className={`${inputClass} resize-y`}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="break-words rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
              >
                <Save size={18} />
                {editingId
                  ? "Update Expense"
                  : "Save Expense"}
              </button>
            </div>
          </form>
        </section>
      )}

      <p className="break-words text-xs leading-6 text-slate-400">
        Demo note: Income is estimated from saved payment records.
        Verify the Payments.jsx field mapping before using the
        profit figure for financial decisions. All records are
        stored locally in this browser.
      </p>
    </div>
  );
}
