import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import {
  getDeduplicatedMonthlyExpenses,
  calculateMonthlyExpenseTotal,
  calculateMonthlyIncome,
  calculateCategoryBreakdown,
  parseAmount,
  syncStaffSalaryExpenses,
} from "../services/financialService";
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
  Eye,
  FileText,
  Tag,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const EXPENSE_KEY = "studioraw_expenses";
const PAYMENT_KEYS = [
  "studioraw_payments",
  "studio_raw_payments",
];
const UPDATE_EVENT = "studioraw:data-updated";

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
  "block w-full min-w-0 max-w-full rounded-2xl border border-[#d6e5f7] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition-all duration-200 placeholder:text-[#9aacc1] focus:border-[#6b9bd4] focus:ring-4 focus:ring-[#e4f0ff]";

/* =========================================================
   DEMO EXPENSES
========================================================= */

const demoExpenses = [];

/* =========================================================
   HELPERS
========================================================= */

function extractRecords(parsed) {
  if (Array.isArray(parsed)) return parsed;

  if (!parsed || typeof parsed !== "object") {
    return [];
  }

  for (const key of [
    "data",
    "items",
    "records",
    "list",
    "payments",
    "results",
  ]) {
    if (Array.isArray(parsed[key])) {
      return parsed[key];
    }
  }

  return [];
}

function readPayments() {
  const records = [];
  const seen = new Set();

  PAYMENT_KEYS.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const items = extractRecords(parsed);

      items.forEach((item) => {
        if (!item || typeof item !== "object") {
          return;
        }

        const identity =
          item.id ??
          item._id ??
          item.invoice ??
          item.invoiceNumber ??
          JSON.stringify(item);

        const uniqueKey = String(identity);

        if (seen.has(uniqueKey)) return;

        seen.add(uniqueKey);
        records.push(item);
      });
    } catch (error) {
      console.error("Payment storage error:", key, error);
    }
  });

  return records;
}

function readInitialExpenses() {
  try {
    const saved = localStorage.getItem(EXPENSE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `EX-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function localDate() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function money(value) {
  const number = Number(value) || 0;

  const formatted = Math.abs(number).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  return number < 0
    ? `-₹${formatted}`
    : `₹${formatted}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(
    `${String(value).slice(0, 10)}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(value) {
  if (!value) return "Selected Month";

  const date = new Date(`${value}-01T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    month: "long",
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

function amountNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  const cleaned =
    typeof value === "string"
      ? value.replace(/[₹,\s]/g, "")
      : value;

  const amount = Number(cleaned);

  return Number.isFinite(amount) ? amount : 0;
}

function firstAmount(item, fields) {
  for (const field of fields) {
    const value = item?.[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return amountNumber(value);
    }
  }

  return 0;
}

function normalizedDate(value) {
  if (!value) return "";

  if (typeof value === "number") {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    return `${text}-01`;
  }

  const indianDate = text.match(
    /^(\d{2})[/-](\d{2})[/-](\d{4})$/
  );

  if (indianDate) {
    return `${indianDate[3]}-${indianDate[2]}-${indianDate[1]}`;
  }

  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return [
    parsed.getFullYear(),
    String(parsed.getMonth() + 1).padStart(2, "0"),
    String(parsed.getDate()).padStart(2, "0"),
  ].join("-");
}

function getPaymentDate(payment) {
  return (
    payment.paymentDate ||
    payment.payment_date ||
    payment.date ||
    payment.createdAt ||
    payment.created_at ||
    ""
  );
}

function getTransactions(payment) {
  for (const value of [
    payment.transactions,
    payment.paymentHistory,
    payment.payment_history,
    payment.receipts,
  ]) {
    if (Array.isArray(value) && value.length) {
      return value;
    }
  }

  return [];
}

function getTransactionAmount(transaction) {
  return firstAmount(transaction, [
    "amount",
    "paidAmount",
    "amountPaid",
    "receivedAmount",
    "amountReceived",
    "value",
  ]);
}

function isValidTransaction(transaction) {
  const status = String(
    transaction.status ||
    transaction.paymentStatus ||
    ""
  )
    .trim()
    .toLowerCase();

  const type = String(
    transaction.type || ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "failed",
      "cancelled",
      "canceled",
      "refunded",
    ].includes(status)
  ) {
    return false;
  }

  if (
    [
      "refund",
      "refunded",
      "expense",
      "outgoing",
    ].includes(type)
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   FIXED MONTHLY INCOME CALCULATION
========================================================= */

function getMonthlyPaymentIncome(
  payment,
  selectedMonth
) {
  const transactions = getTransactions(payment);

  if (transactions.length > 0) {
    return transactions.reduce(
      (total, transaction) => {
        if (!isValidTransaction(transaction)) {
          return total;
        }

        const transactionDate = normalizedDate(
          transaction.date ||
          transaction.paymentDate ||
          transaction.payment_date ||
          transaction.createdAt ||
          getPaymentDate(payment)
        );

        if (
          transactionDate.slice(0, 7) !==
          selectedMonth
        ) {
          return total;
        }

        return (
          total +
          getTransactionAmount(transaction)
        );
      },
      0
    );
  }

  const paymentDate = normalizedDate(
    getPaymentDate(payment)
  );

  if (
    paymentDate.slice(0, 7) !==
    selectedMonth
  ) {
    return 0;
  }

  const status = String(
    payment.paymentStatus ||
    payment.payment_status ||
    payment.status ||
    ""
  )
    .trim()
    .toLowerCase();

  if (
    [
      "failed",
      "cancelled",
      "canceled",
      "refunded",
    ].includes(status)
  ) {
    return 0;
  }

  const received = firstAmount(payment, [
    "paidAmount",
    "amountPaid",
    "paid_amount",
    "receivedAmount",
    "received_amount",
    "totalPaid",
    "totalReceived",
    "advancePaid",
    "advanceAmount",
    "advance",
    "amountReceived",
    "collectedAmount",
  ]);

  if (received > 0) {
    return received;
  }

  if (
    [
      "paid",
      "completed",
      "received",
      "success",
      "successful",
      "fully paid",
    ].includes(status)
  ) {
    return firstAmount(payment, [
      "totalAmount",
      "total_amount",
      "grandTotal",
      "grand_total",
      "total",
      "amount",
    ]);
  }

  return 0;
}

/* =========================================================
   AUTO COUNT-UP ANIMATION
========================================================= */

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const currentValue = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = currentValue.current;

    const reduceMotion =
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

    if (reduceMotion) {
      currentValue.current = end;
      setCount(end);
      return;
    }

    let frameId;
    let startTime = null;

    const animate = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const nextValue =
        start + (end - start) * eased;

      currentValue.current = nextValue;
      setCount(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(
          animate
        );
      } else {
        currentValue.current = end;
        setCount(end);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return count;
}

/* =========================================================
   PREMIUM DROPDOWN
========================================================= */

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? {
              label: option,
              value: option,
            }
          : option
      ),
    [options]
  );

  const selected = normalizedOptions.find(
    (option) =>
      String(option.value) === String(value)
  );

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const below =
      window.innerHeight - rect.bottom;

    const above = rect.top;

    const desired = Math.min(
      270,
      normalizedOptions.length * 44 + 12
    );

    const openAbove =
      below < desired + 12 && above > below;

    const availableSpace = openAbove
      ? above
      : below;

    const height = Math.min(
      desired,
      Math.max(80, availableSpace - 12)
    );

    const width = Math.min(
      rect.width,
      window.innerWidth - 16
    );

    setPosition({
      position: "fixed",
      left: Math.max(
        8,
        Math.min(
          rect.left,
          window.innerWidth - width - 8
        )
      ),
      width,
      top: openAbove
        ? Math.max(
            8,
            rect.top - height - 6
          )
        : rect.bottom + 6,
      maxHeight: height,
      zIndex: 100000,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event) => {
      if (
        !buttonRef.current?.contains(
          event.target
        ) &&
        !menuRef.current?.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (
        !menuRef.current?.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleResize = () => {
      setOpen(false);
    };

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    window.addEventListener(
      "resize",
      handleResize
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

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );

      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, [open, normalizedOptions.length]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (!open) {
            updatePosition();
          }

          setOpen((previous) => !previous);
        }}
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-[#6b8aad] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            style={position}
            className="overflow-y-auto overscroll-contain rounded-2xl border border-[#dbe8f8] bg-white p-1.5 shadow-[0_18px_50px_rgba(16,38,77,0.2)]"
          >
            {normalizedOptions.map((option) => {
              const isSelected =
                String(option.value) ===
                String(value);

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
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-[#e8f2ff] font-bold text-[#164b88]"
                      : "text-[#46617e] hover:bg-[#f1f7ff]"
                  }`}
                >
                  <span className="break-words">
                    {option.label}
                  </span>

                  {isSelected && (
                    <Check
                      size={16}
                      className="shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function FormField({
  label,
  children,
  required = false,
}) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-xs font-bold text-[#587594]">
        {label}

        {required && (
          <span className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function DetailBox({
  label,
  value,
  icon: Icon,
  color = "text-[#10264d]",
  full = false,
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-[#dce9f8] bg-gradient-to-br from-[#f3f8ff] to-[#eaf3ff] p-3.5 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-[#7192b5]"
          />
        )}

        <p className="text-[11px] font-semibold text-[#7890aa]">
          {label}
        </p>
      </div>

      <p
        className={`min-w-0 whitespace-pre-wrap break-words text-sm font-bold ${color}`}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

/* =========================================================
   ANIMATED STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  tone = "blue",
  isCount = false,
  detail,
}) {
  const animated = useCountUp(value, 1500);

  const tones = {
    blue: {
      iconBg: "bg-[#dcecff]",
      iconColor: "text-[#245c9b]",
      valueColor: "text-[#173d72]",
      line: "from-[#245c9b] to-[#82b9f0]",
      circle: "bg-[#c8e1ff]",
    },
    green: {
      iconBg: "bg-[#ddf6ef]",
      iconColor: "text-[#14846a]",
      valueColor: "text-[#117b63]",
      line: "from-[#159779] to-[#82d9c3]",
      circle: "bg-[#d4f6e9]",
    },
    red: {
      iconBg: "bg-[#ffebef]",
      iconColor: "text-[#cf4763]",
      valueColor: "text-[#c6405c]",
      line: "from-[#d44b66] to-[#f2a4b2]",
      circle: "bg-[#ffe0e8]",
    },
    cyan: {
      iconBg: "bg-[#dff5ff]",
      iconColor: "text-[#1684a8]",
      valueColor: "text-[#126f94]",
      line: "from-[#1e8fb7] to-[#8cd9ee]",
      circle: "bg-[#d8f3ff]",
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-[24px] border border-[#d5e5f8] bg-gradient-to-br from-white via-[#f2f8ff] to-[#e4f0ff] p-4 shadow-[0_8px_28px_rgba(27,75,128,0.055)] transition-all duration-500 hover:-translate-y-1 hover:border-[#b6d2f2] hover:shadow-[0_18px_40px_rgba(27,75,128,0.13)] sm:p-5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.line}`}
      />

      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full ${style.circle} opacity-40 blur-2xl`}
      />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-[#6c87a5] sm:text-sm">
            {title}
          </p>

          <h3
            className={`mt-3 break-words text-lg font-black tracking-tight sm:text-2xl xl:text-[26px] ${style.valueColor}`}
          >
            {isCount
              ? Math.round(
                  animated
                ).toLocaleString("en-IN")
              : money(Math.round(animated))}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 shadow-sm transition-transform duration-500 group-hover:scale-110 sm:h-12 sm:w-12 ${style.iconBg} ${style.iconColor}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="relative z-10 mt-5 flex items-center gap-2 border-t border-[#dceafa] pt-3">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7daee0]" />

        <p className="text-[10px] leading-4 text-[#8a9fb8] sm:text-[11px]">
          {detail || "Selected month overview"}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = "max-w-[720px]",
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 mx-auto flex max-h-[95dvh] w-full ${width} flex-col overflow-hidden rounded-[24px] border border-[#dce9f8] bg-[#f3f8ff] shadow-2xl sm:max-h-[92dvh] sm:rounded-[28px]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#dfebf9] bg-gradient-to-r from-white to-[#eaf4ff] px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#4b80b9]">
              Studio Raw / Finance
            </p>

            <h2 className="text-xl font-black text-[#10264d] sm:text-2xl">
              {title}
            </h2>

            <p className="mt-1 break-words text-xs text-[#7891ac] sm:text-sm">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-xl border border-[#d6e6f8] bg-white p-2.5 text-[#567697] transition hover:bg-[#e7f2ff]"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   EXPENSE CARD
========================================================= */

function ExpenseCard({
  item,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <article className="group flex min-w-0 flex-col rounded-[23px] border border-[#d7e6f7] bg-gradient-to-br from-white via-[#f8fbff] to-[#eaf4ff] p-4 shadow-[0_6px_22px_rgba(27,75,128,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8d5f4] hover:shadow-[0_16px_36px_rgba(27,75,128,0.11)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white bg-[#e3f0ff] text-[#245c9c] shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Wallet size={21} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-sm font-extrabold text-[#10264d] sm:text-base">
              {item.title}
            </h3>

            <p className="mt-1.5 text-xs text-[#8199b3]">
              {formatDate(item.date)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            title="View Expense"
            aria-label="View Expense"
            onClick={() => onView(item)}
            className="rounded-xl bg-[#e2f6f0] p-2 text-[#16866e] transition hover:bg-[#cff0e6]"
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            title="Edit Expense"
            aria-label="Edit Expense"
            onClick={() => onEdit(item)}
            className="rounded-xl bg-[#e1efff] p-2 text-[#235fa2] transition hover:bg-[#cfe3ff]"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            title="Delete Expense"
            aria-label="Delete Expense"
            onClick={() => onDelete(item)}
            className="rounded-xl bg-[#ffedf1] p-2 text-[#d64c65] transition hover:bg-[#ffdde5]"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e3edf9] pt-4">
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#d1e5fa] bg-[#e8f3ff] px-3 py-1.5 text-xs font-bold text-[#2b639f]">
          <Tag size={12} />

          <span className="break-words">
            {item.category || "Other"}
          </span>
        </span>

        <p className="break-words text-lg font-black text-[#d44d65]">
          {money(item.amount)}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <DetailBox
          label="Expense Date"
          value={formatDate(item.date)}
          icon={CalendarDays}
        />

        <DetailBox
          label="Payment Mode"
          value={item.paymentMode || "—"}
          icon={CreditCard}
        />

        <DetailBox
          label="Paid To"
          value={item.paidTo || "Not specified"}
          icon={UserRound}
        />

        <DetailBox
          label="Amount"
          value={money(item.amount)}
          icon={IndianRupee}
          color="text-[#d44d65]"
        />

        {item.notes && (
          <DetailBox
            label="Notes"
            value={item.notes}
            icon={FileText}
            full
          />
        )}
      </div>
    </article>
  );
}

/* =========================================================
   MAIN EXPENSES PAGE
========================================================= */

export default function Expenses() {
  const [expenses, setExpenses] = useState(
    readInitialExpenses
  );

  const [payments, setPayments] = useState(
    readPayments
  );

  const [selectedMonth, setSelectedMonth] =
    useState(localDate().slice(0, 7));

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [error, setError] = useState("");
  const [viewId, setViewId] = useState(null);

  const viewedExpense = expenses.find(
    (item) => item.id === viewId
  );

  /* ---------------- BACKEND API INTEGRATION ---------------- */

  useEffect(() => {
    let isMounted = true;
    api.expenses
      .list()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setExpenses(
            data.map((item) => ({
              ...item,
              id: item.id,
              title: item.title || item.expense_title || "Expense",
              category: item.category || "Other",
              amount: Number(item.amount || 0),
              date: item.date || item.expense_date || localDate(),
              paymentMode: item.paymentMode || item.payment_method || "Cash",
              paidTo: item.paidTo || item.paid_to || "",
              notes: item.notes || "",
              updatedAt: item.updatedAt || item.updated_at || item.created_at || new Date().toISOString(),
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Backend expenses load notice:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------- PAYROLL SYNC & STORAGE LISTENERS ---------------- */

  useEffect(() => {
    syncStaffSalaryExpenses();
    setExpenses(readInitialExpenses());

    const onUpdate = (e) => {
      const key = e?.detail?.key || e?.key;
      if (key === "studioraw_staff" || key === EXPENSE_KEY || !key) {
        syncStaffSalaryExpenses();
        const fresh = readInitialExpenses();
        setExpenses((prev) => (JSON.stringify(prev) === JSON.stringify(fresh) ? prev : fresh));
      }
    };

    window.addEventListener(UPDATE_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener(UPDATE_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  /* ---------------- SAVE STORAGE ---------------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        EXPENSE_KEY,
        JSON.stringify(expenses)
      );

      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: {
            key: EXPENSE_KEY,
          },
        })
      );
    } catch (error) {
      console.error(
        "Unable to save expenses:",
        error
      );
    }
  }, [expenses]);

  /* ---------------- PAYMENT REFRESH ---------------- */

  useEffect(() => {
    const refreshPayments = () => {
      setPayments(readPayments());
    };

    const handleUpdate = (event) => {
      if (
        !event.detail?.key ||
        PAYMENT_KEYS.includes(event.detail.key)
      ) {
        refreshPayments();
      }
    };

    window.addEventListener(
      "focus",
      refreshPayments
    );

    window.addEventListener(
      "storage",
      refreshPayments
    );

    window.addEventListener(
      UPDATE_EVENT,
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshPayments
      );

      window.removeEventListener(
        "storage",
        refreshPayments
      );

      window.removeEventListener(
        UPDATE_EVENT,
        handleUpdate
      );
    };
  }, []);

  /* ---------------- MODAL SCROLL LOCK ---------------- */

  useEffect(() => {
    if (!showForm && !viewId) return;

    const previous =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setViewId(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = previous;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [showForm, viewId]);

  /* ---------------- FORM ACTIONS ---------------- */

  const openAdd = () => {
    setViewId(null);
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: localDate(),
    });

    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setViewId(null);
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

    if (error) {
      setError("");
    }
  };

  const saveExpense = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !form.date ||
      form.amount === "" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError(
        "Enter a valid title, date and amount."
      );
      return;
    }

    const payload = {
      expense_title: form.title.trim(),
      category: form.category || "Other",
      amount,
      expense_date: form.date || null,
      paid_to: form.paidTo || "",
      payment_method: form.paymentMode || "Cash",
      status: "Paid",
      notes: form.notes || "",
    };

    try {
      if (editingId) {
        if (typeof editingId === "number") {
          try {
            await api.expenses.update(editingId, payload);
          } catch (apiErr) {
            console.warn("Backend update expense notice:", apiErr.message);
          }
        }

        const record = {
          ...form,
          id: editingId,
          title: form.title.trim(),
          amount,
          updatedAt: new Date().toISOString(),
        };

        setExpenses((previous) =>
          previous.map((item) =>
            item.id === editingId
              ? record
              : item
          )
        );
      } else {
        let createdId = createId();
        try {
          const res = await api.expenses.create(payload);
          if (res?.id) createdId = res.id;
        } catch (apiErr) {
          console.warn("Backend create expense notice:", apiErr.message);
        }

        const record = {
          ...form,
          id: createdId,
          title: form.title.trim(),
          amount,
          updatedAt: new Date().toISOString(),
        };

        setExpenses((previous) => [
          record,
          ...previous,
        ]);
      }

      closeForm();
    } catch (err) {
      console.error("Save expense error:", err);
      setError(err.message || "Failed to save expense.");
    }
  };

  const deleteExpense = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      if (typeof item.id === "number") {
        await api.expenses.delete(item.id);
      }
    } catch (err) {
      console.warn("Backend delete expense notice:", err.message);
    }

    setExpenses((previous) =>
      previous.filter(
        (record) => record.id !== item.id
      )
    );

    if (viewId === item.id) {
      setViewId(null);
    }
  };

  /* ---------------- MONTHLY FILTER ---------------- */

  const monthlyExpenses = useMemo(() => {
    return getDeduplicatedMonthlyExpenses(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  /* ---------------- SEARCH FILTER ---------------- */

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return monthlyExpenses.filter((item) => {
      const matchesSearch = [
        item.title,
        item.category,
        item.paidTo,
        item.notes,
        item.paymentMode,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    monthlyExpenses,
    search,
    categoryFilter,
  ]);

  /* ---------------- TOTAL EXPENSES ---------------- */

  const totalExpenses = useMemo(() => {
    return calculateMonthlyExpenseTotal(expenses, selectedMonth);
  }, [expenses, selectedMonth]);

  /* ---------------- FIXED MONTHLY INCOME ---------------- */

  const monthlyIncome = useMemo(() => {
    return calculateMonthlyIncome(payments, selectedMonth);
  }, [payments, selectedMonth]);

  /* ---------------- PROFIT ---------------- */

  const profit =
    Math.round((monthlyIncome - totalExpenses) * 100) / 100;

  /* ---------------- CATEGORY TOTALS ---------------- */

  const categoryTotals = useMemo(() => {
    const breakdown = calculateCategoryBreakdown(monthlyExpenses);
    return breakdown.map((item) => ({
      category: item.category,
      total: item.amount,
      percentage: item.percentage,
    }));
  }, [monthlyExpenses]);

  /* ---------------- CSV EXPORT ---------------- */

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
      .map((row) =>
        row.map(csvCell).join(",")
      )
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF", csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `studio-expenses-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /* ---------------- STAT DATA ---------------- */

  const stats = [
    {
      title: "Monthly Income",
      value: monthlyIncome,
      icon: TrendingUp,
      tone: "green",
      detail: "Received payments this month",
    },
    {
      title: "Monthly Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      tone: "red",
      detail: "Total expenses this month",
    },
    {
      title: "Estimated Profit",
      value: profit,
      icon: IndianRupee,
      tone:
        profit >= 0 ? "blue" : "red",
      detail: "Income minus expenses",
    },
    {
      title: "Expense Entries",
      value: monthlyExpenses.length,
      icon: Wallet,
      tone: "cyan",
      isCount: true,
      detail: "Recorded expense entries",
    },
  ];

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f6faff] via-[#edf5ff] to-[#e5f0ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8 lg:py-8">

      {/* HEADER */}

      <div className="relative z-10 mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#7994b1]">
            {formatMonth(selectedMonth)} Overview
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-48">
            <FormField label="Select Month">
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) =>
                  setSelectedMonth(
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173766] to-[#2b5b98] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(23,55,102,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(23,55,102,0.25)]"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="relative z-10 mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            {...item}
          />
        ))}
      </div>

      {/* CATEGORY-WISE EXPENSES */}

      <section className="relative z-10 mb-7 overflow-hidden rounded-[25px] border border-[#d4e5f8] bg-gradient-to-br from-white via-[#f6faff] to-[#e9f3ff] p-4 shadow-[0_8px_30px_rgba(30,76,130,0.055)] sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-extrabold text-[#10264d] sm:text-lg">
              <BarChart3
                size={20}
                className="text-[#3475b9]"
              />
              Category-wise Expenses
            </h2>

            <p className="mt-1 text-xs text-[#8aa0b8]">
              Spending distribution for the
              selected month
            </p>
          </div>

          <div className="rounded-xl border border-[#d8e9fa] bg-[#eaf4ff] px-3 py-2 text-xs font-bold text-[#3975b5]">
            {categoryTotals.length} Categories
          </div>
        </div>

        {categoryTotals.length === 0 ? (
          <div className="py-12 text-center">
            <BarChart3
              size={36}
              className="mx-auto mb-3 text-[#bed2e9]"
            />

            <p className="text-sm text-[#8aa0b8]">
              No expenses recorded for this month.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
            {categoryTotals.map((item) => {
              const percentage =
                totalExpenses > 0
                  ? (item.total / totalExpenses) *
                    100
                  : 0;

              return (
                <div
                  key={item.category}
                  className="min-w-0 rounded-2xl border border-[#e2edfa] bg-white/70 p-4 transition-all duration-300 hover:border-[#c7def7] hover:bg-white"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-semibold text-[#496581]">
                      {item.category}
                    </p>

                    <p className="shrink-0 text-sm font-extrabold text-[#10264d]">
                      {money(item.total)}
                    </p>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#e9f2fc]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#3269a8] to-[#83baf0] transition-[width] duration-1000 ease-out"
                      style={{
                        width: `${Math.min(
                          100,
                          percentage
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-[#8ca3bc]">
                    {percentage.toFixed(1)}% of
                    monthly expenses
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* EXPENSE RECORDS */}

      <section className="relative z-10 overflow-hidden rounded-[25px] border border-[#d4e5f8] bg-white shadow-[0_8px_30px_rgba(30,76,130,0.055)]">
        <div className="border-b border-[#e4eefb] bg-gradient-to-r from-white to-[#eef6ff] p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#10264d]">
                <Receipt
                  size={20}
                  className="text-[#3475b9]"
                />
                Expense Records
              </h2>

              <p className="mt-1 text-xs text-[#8aa0b8]">
                Showing{" "}
                {filteredExpenses.length} of{" "}
                {monthlyExpenses.length} records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#88a0bb]"
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
                  options={[
                    "All",
                    ...categories,
                  ].map((category) => ({
                    label:
                      category === "All"
                        ? "All Categories"
                        : category,
                    value: category,
                  }))}
                  onChange={
                    setCategoryFilter
                  }
                />
              </div>

              <button
                type="button"
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 rounded-2xl border border-[#d6e6f8] bg-white px-4 py-3 text-sm font-semibold text-[#173766] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eaf4ff]"
              >
                <Download size={17} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-[#f6faff] px-4 py-20 text-center">
            <div className="mb-4 rounded-3xl bg-[#e6f2ff] p-5">
              <Wallet
                size={36}
                className="text-[#83a9d3]"
              />
            </div>

            <h3 className="font-extrabold text-[#10264d]">
              {monthlyExpenses.length === 0
                ? "No expenses recorded for this month."
                : expenses.length === 0
                ? "No expenses recorded."
                : "No expense records found"}
            </h3>

            <p className="mt-2 text-sm text-[#8aa0b8]">
              {monthlyExpenses.length === 0
                ? "No expenses recorded for this month."
                : "Add an expense or change your filters."}
            </p>

            <button
              type="button"
              onClick={openAdd}
              className="mt-5 flex items-center gap-2 rounded-2xl bg-[#173766] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#254f88]"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 bg-gradient-to-br from-[#f5faff] to-[#eaf3ff] p-3 sm:p-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredExpenses.map((item) => (
              <ExpenseCard
                key={item.id}
                item={item}
                onView={(expense) =>
                  setViewId(expense.id)
                }
                onEdit={openEdit}
                onDelete={deleteExpense}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-[#e8f0fa] bg-white px-4 py-4 text-xs text-[#8aa0b8] sm:px-6">
          <span>
            {filteredExpenses.length} records
          </span>

          <span>
            Studio Raw Picturez ERP
          </span>
        </div>
      </section>

      {/* VIEW EXPENSE MODAL */}

      {viewedExpense && (
        <Modal
          title="Expense Details"
          subtitle={viewedExpense.title}
          onClose={() => setViewId(null)}
          width="max-w-[620px]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
            <div className="rounded-[22px] border border-[#dce9f8] bg-gradient-to-br from-white to-[#edf6ff] p-5 shadow-sm">
              <div className="flex items-start gap-3 border-b border-[#e4eefb] pb-5">
                <div className="rounded-2xl bg-[#e1efff] p-3 text-[#245c9c]">
                  <Wallet size={24} />
                </div>

                <div className="min-w-0">
                  <h3 className="break-words text-lg font-extrabold text-[#10264d]">
                    {viewedExpense.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#7c96b1]">
                    {viewedExpense.category}
                  </p>

                  <p className="mt-3 text-2xl font-black text-[#d44d65]">
                    {money(viewedExpense.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <DetailBox
                  label="Expense Date"
                  value={formatDate(
                    viewedExpense.date
                  )}
                  icon={CalendarDays}
                />

                <DetailBox
                  label="Category"
                  value={
                    viewedExpense.category
                  }
                  icon={Tag}
                />

                <DetailBox
                  label="Payment Mode"
                  value={
                    viewedExpense.paymentMode
                  }
                  icon={CreditCard}
                />

                <DetailBox
                  label="Paid To"
                  value={
                    viewedExpense.paidTo ||
                    "Not specified"
                  }
                  icon={UserRound}
                />

                <DetailBox
                  label="Amount"
                  value={money(
                    viewedExpense.amount
                  )}
                  icon={IndianRupee}
                  color="text-[#d44d65]"
                />

                <DetailBox
                  label="Last Updated"
                  value={
                    viewedExpense.updatedAt
                      ? new Date(
                          viewedExpense.updatedAt
                        ).toLocaleString(
                          "en-IN"
                        )
                      : "—"
                  }
                  icon={CalendarDays}
                />

                <DetailBox
                  label="Notes"
                  value={
                    viewedExpense.notes ||
                    "No additional notes"
                  }
                  icon={FileText}
                  full
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#dfebf9] bg-white px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setViewId(null)
                }
                className="rounded-2xl border border-[#dce8f8] px-6 py-3 text-sm font-semibold text-[#52718f] transition hover:bg-[#f2f7ff]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  openEdit(viewedExpense)
                }
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#173766] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#254f88]"
              >
                <Pencil size={16} />
                Edit Expense
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD / EDIT EXPENSE MODAL */}

      {showForm && (
        <Modal
          title={
            editingId
              ? "Edit Expense"
              : "Add Expense"
          }
          subtitle="Enter studio expense details."
          onClose={closeForm}
        >
          <form
            onSubmit={saveExpense}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <div className="rounded-[22px] border border-[#dce9f8] bg-gradient-to-br from-white to-[#edf6ff] p-5 shadow-sm">
                <h3 className="mb-5 flex items-center gap-2 border-b border-[#e4eefb] pb-4 text-sm font-extrabold text-[#10264d]">
                  <Wallet
                    size={18}
                    className="text-[#3475b9]"
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
                        updateField(
                          "category",
                          value
                        )
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
                  className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-[#dfebf9] bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-[#dce8f8] bg-white px-6 py-3 text-sm font-semibold text-[#52718f] transition hover:bg-[#f2f7ff]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173766] to-[#2b5b98] px-7 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
                >
                  <Save size={17} />

                  {editingId
                    ? "Update Expense"
                    : "Save Expense"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
