
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Receipt,
  BarChart3,
  CreditCard,
  UserRound,
  AlertCircle,
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function csvCell(value) {
  const raw = String(value ?? "");
  const safe = /^\s*[=+\-@\t\r]/.test(raw)
    ? `'${raw}`
    : raw;
  return `"${safe.replace(/"/g, '""')}"`;
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
      if (event.key === "Escape") setOpen(false);
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
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 truncate">
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
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
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
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="break-words">
                  {option.label}
                </span>
                {isSelected && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-400">
        {label}
      </p>
      <div className="flex items-start gap-2">
        {Icon && (
          <Icon
            size={15}
            className="mt-0.5 shrink-0 text-blue-600"
          />
        )}
        <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
          {value === undefined ||
          value === null ||
          value === ""
            ? "—"
            : value}
        </p>
      </div>
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
    window.addEventListener("storage", refreshPayments);

    return () => {
      window.removeEventListener("focus", refreshPayments);
      window.removeEventListener("storage", refreshPayments);
    };
  }, []);

  useEffect(() => {
    if (!showForm) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm]);

  const openAdd = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date: localDate(),
    });
    setError("");
    setShowForm(true);
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
    if (error) setError("");
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

  // Estimated income from existing payment records.
  // Verify payment field mapping before financial use.
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
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const stats = [
    {
      label: "Monthly Income",
      value: monthlyIncome,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
    },
    {
      label: "Monthly Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-rose-600",
      bg: "bg-rose-50",
      accent: "bg-rose-500",
    },
    {
      label: "Estimated Profit",
      value: profit,
      icon: IndianRupee,
      color: profit >= 0 ? "text-blue-700" : "text-rose-600",
      bg: profit >= 0 ? "bg-blue-50" : "bg-rose-50",
      accent: profit >= 0 ? "bg-blue-600" : "bg-rose-500",
    },
    {
      label: "Expense Entries",
      value: monthlyExpenses.length,
      icon: Wallet,
      color: "text-violet-700",
      bg: "bg-violet-50",
      accent: "bg-violet-500",
      isCount: true,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Finance
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Expense & Profit Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track studio expenses, income and estimated profit.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-48">
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
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`absolute left-0 top-0 h-1 w-full ${item.accent}`} />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {item.label}
                  </p>

                  <h2
                    className={`mt-3 break-words text-2xl font-extrabold sm:text-3xl ${item.color}`}
                  >
                    {item.isCount
                      ? item.value
                      : money(item.value)}
                  </h2>
                </div>

                <div className={`shrink-0 rounded-2xl p-3 ${item.bg}`}>
                  <Icon size={23} className={item.color} />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Selected month overview
              </p>
            </div>
          );
        })}
      </div>

      {/* CATEGORY BREAKDOWN */}
      <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-[#10264d]">
            Category-wise Expenses
          </h2>
        </div>

        {categoryTotals.length === 0 ? (
          <div className="py-10 text-center">
            <BarChart3
              size={36}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm text-slate-400">
              No expenses recorded for this month.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
            {categoryTotals.map((item) => {
              const percentage =
                totalExpenses > 0
                  ? (item.total / totalExpenses) * 100
                  : 0;

              return (
                <div key={item.category} className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-semibold text-slate-700">
                      {item.category}
                    </p>

                    <p className="shrink-0 text-sm font-bold text-[#10264d]">
                      {money(item.total)}
                    </p>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#10264d] transition-all"
                      style={{ width: `${percentage}%` }}
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

      {/* EXPENSE RECORDS */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <Receipt size={20} className="text-blue-600" />
                Expense Records
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredExpenses.length} of {monthlyExpenses.length} records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search expenses..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-48">
                <CustomDropdown
                  value={categoryFilter}
                  options={["All", ...categories].map((category) => ({
                    label:
                      category === "All"
                        ? "All Categories"
                        : category,
                    value: category,
                  }))}
                  onChange={setCategoryFilter}
                />
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
              >
                <Download size={17} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <Wallet size={36} className="text-slate-300" />
            </div>

            <h3 className="font-bold text-[#10264d]">
              No expense records found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add an expense or change your filters.
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-[#f8faff]">
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Expense</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Payment Mode</th>
                    <th className="px-5 py-4">Paid To</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-blue-50/30"
                    >
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                            <Wallet size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-[#10264d]">
                              {item.title}
                            </p>

                            {item.notes && (
                              <p className="mt-1 max-w-40 truncate text-xs text-slate-400">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {formatDate(item.date)}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {item.paymentMode}
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {item.paidTo || "—"}
                      </td>

                      <td className="px-5 py-5 text-sm font-bold text-rose-600">
                        {money(item.amount)}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            title="Edit Expense"
                            className="rounded-lg bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteExpense(item)}
                            title="Delete Expense"
                            className="rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filteredExpenses.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="mb-4 flex items-start gap-3 border-b border-slate-200 pb-4">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Wallet size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-bold text-[#10264d]">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.category}
                      </p>

                      <p className="mt-2 text-xl font-bold text-rose-600">
                        {money(item.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Detail
                      label="Expense Date"
                      value={formatDate(item.date)}
                      icon={CalendarDays}
                    />

                    <Detail
                      label="Category"
                      value={item.category}
                    />

                    <Detail
                      label="Payment Mode"
                      value={item.paymentMode}
                      icon={CreditCard}
                    />

                    <Detail
                      label="Paid To"
                      value={item.paidTo}
                      icon={UserRound}
                    />

                    {item.notes && (
                      <Detail
                        label="Notes"
                        value={item.notes}
                      />
                    )}
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteExpense(item)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CENTER MODAL FORM */}
      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
              onClick={closeForm}
            />

            {/* MODAL */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={
                editingId ? "Edit Expense" : "Add Expense"
              }
              className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
            >
              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                      Studio Raw / Finance
                    </p>

                    <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
                      {editingId
                        ? "Edit Expense"
                        : "Add Expense"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter studio expense details.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    aria-label="Close expense form"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={saveExpense}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* SCROLLABLE FORM */}
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <Wallet
                        size={18}
                        className="text-blue-600"
                      />
                      Expense Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormField
                          label="Expense Title"
                          required
                        >
                          <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(event) =>
                              updateField(
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Studio electricity bill"
                            className={inputClass}
                          />
                        </FormField>
                      </div>

                      <FormField label="Category">
                        <CustomDropdown
                          value={form.category}
                          options={categories}
                          onChange={(value) =>
                            updateField("category", value)
                          }
                        />
                      </FormField>

                      <FormField
                        label="Amount (₹)"
                        required
                      >
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          required
                          value={form.amount}
                          onChange={(event) =>
                            updateField(
                              "amount",
                              event.target.value
                            )
                          }
                          placeholder="Enter amount"
                          className={inputClass}
                        />
                      </FormField>

                      <FormField
                        label="Expense Date"
                        required
                      >
                        <input
                          type="date"
                          required
                          value={form.date}
                          onChange={(event) =>
                            updateField(
                              "date",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Payment Mode">
                        <CustomDropdown
                          value={form.paymentMode}
                          options={paymentModes}
                          onChange={(value) =>
                            updateField(
                              "paymentMode",
                              value
                            )
                          }
                        />
                      </FormField>

                      <div className="sm:col-span-2">
                        <FormField label="Paid To">
                          <input
                            type="text"
                            value={form.paidTo}
                            onChange={(event) =>
                              updateField(
                                "paidTo",
                                event.target.value
                              )
                            }
                            placeholder="Vendor / Staff / Supplier"
                            className={inputClass}
                          />
                        </FormField>
                      </div>

                      <div className="sm:col-span-2">
                        <FormField label="Notes">
                          <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(event) =>
                              updateField(
                                "notes",
                                event.target.value
                              )
                            }
                            placeholder="Additional details..."
                            className={`${inputClass} resize-y`}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                    >
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />
                      {error}
                    </div>
                  )}
                </div>

                {/* FIXED FOOTER */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      <Save size={17} />
                      {editingId
                        ? "Update Expense"
                        : "Save Expense"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* FOOTER NOTE */}
      <p className="mt-6 text-xs leading-6 text-slate-400">
        Demo note: Income is estimated from saved payment records.
        Verify the Payments.jsx field mapping before using the
        profit figure for financial decisions. All records are
        stored locally in this browser.
      </p>
    </div>
  );
}
