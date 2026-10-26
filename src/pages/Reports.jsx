
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  Camera,
  Video,
  RefreshCw,
  Download,
  IndianRupee,
  ClipboardList,
  Package,
  Building2,
  Clock3,
  Activity,
  Heart,
  CalendarCheck2,
  Boxes,
  Search,
} from "lucide-react";

/* ==========================================
   STUDIO RAW PICTUREZ - RESPONSIVE REPORTS
   React + Tailwind CSS + localStorage
========================================== */

const STORAGE = {
  payments: ["studioraw_payments", "studio_raw_payments"],
  expenses: ["studioraw_expenses", "studio_raw_expenses"],
  bookings: ["studioraw_bookings", "studio_raw_bookings"],
  customers: ["studio_raw_customers", "studioraw_customers"],
  enquiries: ["studio_raw_enquiries", "studioraw_enquiries"],
  photography: [
    "studioraw_wedding_photography",
    "studio_raw_wedding_photography",
  ],
  videography: [
    "studioraw_wedding_videography",
    "studio_raw_wedding_videography",
  ],
  events: [
    "studioraw_event_management",
    "studio_raw_event_management",
    "studioraw_events",
  ],
  functions: [
    "studioraw_functions_we_arrange",
    "studio_raw_functions_we_arrange",
  ],
  gifts: [
    "studioraw_customized_gifts",
    "studio_raw_customized_gifts",
  ],
  inventory: ["studioraw_inventory", "studio_raw_inventory"],
  equipment: ["studioraw_equipment", "studio_raw_equipment"],
  staff: ["studioraw_staff", "studio_raw_staff"],
  branches: ["studioraw_branches", "studio_raw_branches"],
  deliveries: ["studioraw_deliveries", "studio_raw_deliveries"],
};

const UPDATE_EVENT = "studioraw:data-updated";

const FAILED_STATUSES = [
  "failed",
  "cancelled",
  "canceled",
  "refunded",
  "void",
  "reversed",
];

const PAID_STATUSES = [
  "paid",
  "completed",
  "received",
  "success",
  "successful",
  "fully paid",
];

const round = (value) =>
  Math.round(((Number(value) || 0) + Number.EPSILON) * 100) / 100;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const numberFormat = (value) =>
  new Intl.NumberFormat("en-IN").format(
    Math.round(Number(value) || 0)
  );

function currentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function monthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) {
    return "Selected Month";
  }

  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );
}

function toDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";

    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, "0"),
      String(value.getDate()).padStart(2, "0"),
    ].join("-");
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : toDate(date);
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    return `${text}-01`;
  }

  const indianDate = text.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/
  );

  if (indianDate) {
    const [, day, month, year] = indianDate;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    if (
      parsed.getFullYear() === Number(year) &&
      parsed.getMonth() === Number(month) - 1 &&
      parsed.getDate() === Number(day)
    ) {
      return toDate(parsed);
    }

    return "";
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : toDate(parsed);
}

function formatDate(value) {
  const date = toDate(value);

  if (!date) return "—";

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getDate(item) {
  return (
    item?.paymentDate ||
    item?.payment_date ||
    item?.expenseDate ||
    item?.expense_date ||
    item?.date ||
    item?.bookingDate ||
    item?.booking_date ||
    item?.enquiryDate ||
    item?.enquiry_date ||
    item?.createdAt ||
    item?.created_at ||
    item?.dateAdded ||
    item?.registeredAt ||
    item?.updatedAt ||
    ""
  );
}

function getBookingDate(item) {
  return (
    item?.eventDate ||
    item?.shootDate ||
    item?.date ||
    item?.bookingDate ||
    item?.booking_date ||
    ""
  );
}

function getMonth(item) {
  return toDate(getDate(item)).slice(0, 7);
}

function getName(item) {
  const customer =
    typeof item?.customer === "string"
      ? item.customer
      : item?.customer?.name;

  const candidates = [
    item?.customerName,
    item?.customer_name,
    item?.clientName,
    item?.client_name,
    customer,
    item?.name,
    item?.title,
    item?.projectName,
    item?.eventName,
    item?.itemName,
    item?.branchName,
    item?.paidTo,
  ];

  const found = candidates.find(
    (value) =>
      typeof value === "string" &&
      value.trim() &&
      value.trim().toLowerCase() !== "untitled"
  );

  return found?.trim() || "Not Specified";
}

function getBookingEvent(item) {
  return (
    item?.event ||
    item?.service ||
    item?.eventType ||
    item?.event_type ||
    "Service Not Specified"
  );
}

function getStatus(item) {
  return String(
    item?.paymentStatus ||
    item?.payment_status ||
    item?.status ||
    ""
  )
    .trim()
    .toLowerCase();
}

function amountNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned =
    typeof value === "string"
      ? value.replace(/[₹,\s]/g, "")
      : value;

  const result = Number(cleaned);
  return Number.isFinite(result) ? result : 0;
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

function getExpenseAmount(item) {
  return firstAmount(item, [
    "amount",
    "expenseAmount",
    "expense_amount",
    "totalAmount",
    "total_amount",
    "grandTotal",
    "total",
    "cost",
    "price",
  ]);
}

function getPaymentMethod(item) {
  return (
    item?.paymentMode ||
    item?.paymentMethod ||
    item?.payment_mode ||
    item?.payment_method ||
    item?.method ||
    item?.mode ||
    "Other"
  );
}

/* ==========================================
   STORAGE CONNECTION
========================================== */

function extractArray(parsed) {
  if (Array.isArray(parsed)) return parsed;

  if (!parsed || typeof parsed !== "object") return [];

  const keys = [
    "data",
    "items",
    "records",
    "list",
    "results",
    "payments",
    "expenses",
    "bookings",
    "customers",
    "enquiries",
    "events",
    "staff",
    "branches",
    "deliveries",
  ];

  for (const key of keys) {
    if (Array.isArray(parsed[key])) {
      return parsed[key];
    }
  }

  return [];
}

function readStorage(keys) {
  const records = [];
  const seen = new Set();

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const items = extractArray(JSON.parse(raw));

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;

        const id =
          item.id ??
          item._id ??
          item.paymentId ??
          item.invoice ??
          null;

        const identity =
          id !== null && id !== ""
            ? String(id)
            : JSON.stringify(item);

        if (seen.has(identity)) return;

        seen.add(identity);
        records.push(item);
      });
    } catch (error) {
      console.error(`Unable to read ${key}`, error);
    }
  }

  return records;
}

function loadAllData() {
  const result = {};

  Object.entries(STORAGE).forEach(([name, keys]) => {
    result[name] = readStorage(keys);
  });

  return result;
}

/* ==========================================
   PAYMENT CALCULATIONS
========================================== */

function getPaymentTotal(payment) {
  return firstAmount(payment, [
    "total",
    "totalAmount",
    "total_amount",
    "grandTotal",
    "grand_total",
    "bookingAmount",
    "packageAmount",
    "amount",
  ]);
}

function getReceivedAmount(payment) {
  return firstAmount(payment, [
    "advance",
    "paidAmount",
    "amountPaid",
    "paid_amount",
    "receivedAmount",
    "received_amount",
    "totalPaid",
    "totalReceived",
    "advancePaid",
    "advanceAmount",
    "amountReceived",
    "collectedAmount",
    "received",
  ]);
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

function findTransactionArray(payment) {
  const fields = [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ];

  for (const field of fields) {
    if (Array.isArray(payment?.[field])) {
      return payment[field];
    }
  }

  return null;
}

function getPaymentDetails(payment, selectedMonth) {
  const invoiceDate = toDate(getDate(payment));
  const invoiceMonth = invoiceDate.slice(0, 7);

  const total = Math.max(0, getPaymentTotal(payment));
  const transactions = findTransactionArray(payment);

  let allReceived = 0;
  let monthlyTransactions = [];

  if (transactions !== null && transactions.length > 0) {
    const validTransactions = transactions.filter(
      (transaction) =>
        !FAILED_STATUSES.includes(getStatus(transaction))
    );

    allReceived = round(
      validTransactions.reduce(
        (sum, transaction) =>
          sum +
          Math.max(0, getTransactionAmount(transaction)),
        0
      )
    );

    monthlyTransactions = validTransactions
      .map((transaction, index) => {
        const transactionDate =
          toDate(getDate(transaction)) || invoiceDate;

        return {
          id:
            transaction.id ||
            `${payment.id || payment.invoice || "payment"}-txn-${index}`,
          name: getName(payment),
          date: transactionDate,
          amount: Math.max(
            0,
            getTransactionAmount(transaction)
          ),
          method:
            getPaymentMethod(transaction) !== "Other"
              ? getPaymentMethod(transaction)
              : getPaymentMethod(payment),
          status: "Paid",
          invoice: payment.invoice || payment.id || "",
          bookingId: payment.bookingId || "",
        };
      })
      .filter(
        (transaction) =>
          transaction.date.slice(0, 7) === selectedMonth &&
          transaction.amount > 0
      );
  } else {
    const status = getStatus(payment);

    if (!FAILED_STATUSES.includes(status)) {
      allReceived = Math.max(
        0,
        getReceivedAmount(payment)
      );

      if (
        allReceived === 0 &&
        PAID_STATUSES.includes(status)
      ) {
        allReceived = total;
      }
    }

    if (
      allReceived > 0 &&
      invoiceMonth === selectedMonth
    ) {
      monthlyTransactions = [
        {
          id: payment.id || payment.invoice || invoiceDate,
          name: getName(payment),
          date: invoiceDate,
          amount: allReceived,
          method: getPaymentMethod(payment),
          status: "Paid",
          invoice: payment.invoice || payment.id || "",
          bookingId: payment.bookingId || "",
        },
      ];
    }
  }

  allReceived = round(allReceived);

  const pending = Math.max(
    0,
    round(total - allReceived)
  );

  const monthlyReceived = round(
    monthlyTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )
  );

  let paymentStatus = "Pending";

  if (total > 0 && pending === 0) {
    paymentStatus = "Paid";
  } else if (allReceived > 0) {
    paymentStatus = "Partial";
  }

  return {
    total,
    allReceived,
    pending,
    received: monthlyReceived,
    paymentStatus,
    monthlyTransactions,
  };
}

function getBookingFinancials(booking, payments) {
  const linked = payments.filter(
    (payment) =>
      payment.bookingId &&
      String(payment.bookingId) === String(booking.id)
  );

  const billed = round(
    linked.reduce(
      (sum, payment) => sum + getPaymentTotal(payment),
      0
    )
  );

  const received = round(
    linked.reduce(
      (sum, payment) =>
        sum + getPaymentDetails(payment, "").allReceived,
      0
    )
  );

  const pending = Math.max(
    0,
    round(billed - received)
  );

  let status = "Not Invoiced";

  if (linked.length) {
    if (billed > 0 && pending === 0) {
      status = "Paid";
    } else if (received > 0) {
      status = "Partial";
    } else {
      status = "Pending";
    }
  }

  return {
    billed,
    received,
    pending,
    status,
    invoiceCount: linked.length,
  };
}

/* ==========================================
   COUNT ANIMATION
========================================== */

function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const finalValue = Number(target) || 0;

    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches
    ) {
      setValue(finalValue);
      return;
    }

    let startTime = null;

    setValue(0);

    const animate = (time) => {
      if (startTime === null) startTime = time;

      const progress = Math.min(
        (time - startTime) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(finalValue * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setValue(finalValue);
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return value;
}

/* ==========================================
   STYLES
========================================== */

const reportStyles = `
  @keyframes reportFadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes reportFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  .report-animate-in {
    animation: reportFadeUp .5s ease both;
  }

  .report-icon-float {
    animation: reportFloat 4.5s ease-in-out infinite;
  }

  .report-card {
    transition:
      transform .3s ease,
      box-shadow .3s ease,
      border-color .3s ease;
  }

  .report-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px rgba(30,78,139,.11);
    border-color: #a9cbf0;
  }

  @media (max-width: 767px) {
    .report-card:hover {
      transform: none;
    }

    .report-icon-float {
      animation: none;
    }

    .report-mobile-chart {
      width: 100%;
      overflow: hidden;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .report-animate-in,
    .report-icon-float {
      animation: none !important;
    }

    .report-card {
      transition: none !important;
    }
  }
`;

const cardThemes = {
  blue: {
    bg: "from-[#eff7ff] via-[#e1efff] to-[#cde4ff]",
    icon: "bg-[#cce3ff] text-[#245e9e]",
    text: "text-[#164579]",
    bar: "bg-[#377bc5]",
  },
  green: {
    bg: "from-[#f0fcf8] via-[#e0f6ed] to-[#c9ebdd]",
    icon: "bg-[#cff0e2] text-[#138365]",
    text: "text-[#12775e]",
    bar: "bg-[#28a484]",
  },
  red: {
    bg: "from-[#fff7f8] via-[#ffebef] to-[#fbd8e0]",
    icon: "bg-[#ffe0e7] text-[#c44c68]",
    text: "text-[#bd4962]",
    bar: "bg-[#d75d78]",
  },
  purple: {
    bg: "from-[#f8f6ff] via-[#f0ebff] to-[#dfd7fa]",
    icon: "bg-[#e6ddff] text-[#7456b4]",
    text: "text-[#6246a2]",
    bar: "bg-[#866bc9]",
  },
  cyan: {
    bg: "from-[#f0faff] via-[#e3f5ff] to-[#cceafb]",
    icon: "bg-[#d1eeff] text-[#2581aa]",
    text: "text-[#176f98]",
    bar: "bg-[#429fc9]",
  },
  amber: {
    bg: "from-[#fffbf2] via-[#fff2da] to-[#ffe4bd]",
    icon: "bg-[#ffebc9] text-[#b47b2d]",
    text: "text-[#986a25]",
    bar: "bg-[#d7a04b]",
  },
};

/* ==========================================
   STAT CARD - MOBILE FULL WIDTH
========================================== */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  currency = false,
  color = "blue",
}) {
  const animated = useCountUp(value);
  const theme = cardThemes[color] || cardThemes.blue;

  return (
    <div
      className={`report-card report-animate-in relative w-full min-w-0 overflow-hidden rounded-[22px] border border-white bg-gradient-to-br ${theme.bg} p-5 shadow-[0_8px_25px_rgba(34,83,142,.07)]`}
    >
      <div
        className={`absolute left-5 right-5 top-0 h-1 rounded-b-full ${theme.bar}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#6582a1]">
            {title}
          </p>

          <h3
            className={`mt-3 break-words text-2xl font-black tracking-tight ${theme.text}`}
          >
            {currency
              ? money(animated)
              : numberFormat(animated)}
          </h3>
        </div>

        <div
          className={`report-icon-float flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 shadow-sm ${theme.icon}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-5 border-t border-white/80 pt-3">
        <p className="text-xs leading-5 text-[#7290ad]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   PANELS
========================================== */

function Panel({ children, className = "" }) {
  return (
    <section
      className={`w-full min-w-0 overflow-hidden rounded-[23px] border border-[#d5e5f8] bg-gradient-to-br from-white via-[#f9fcff] to-[#edf5ff] shadow-[0_8px_28px_rgba(30,76,130,.055)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
  right,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e0efff] text-[#2767ad]">
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="break-words text-base font-black text-[#10264d] sm:text-lg">
            {title}
          </h2>

          <p className="mt-1 text-xs text-[#819bb5]">
            {subtitle}
          </p>
        </div>
      </div>

      {right}
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "Pending")
    .trim()
    .toLowerCase();

  let theme = "bg-[#e7f0fb] text-[#52769c]";

  if (
    [
      ...PAID_STATUSES,
      "confirmed",
      "booked",
      "delivered",
      "active",
    ].includes(value)
  ) {
    theme = "bg-[#dff6eb] text-[#168568]";
  } else if (
    [
      "pending",
      "partial",
      "partially paid",
      "unpaid",
    ].includes(value)
  ) {
    theme = "bg-[#fff0d9] text-[#ae782a]";
  } else if (FAILED_STATUSES.includes(value)) {
    theme = "bg-[#ffe6ec] text-[#c24b67]";
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold ${theme}`}
    >
      {status || "Pending"}
    </span>
  );
}

/* ==========================================
   RESPONSIVE REVENUE / EXPENSE GRAPH

   Mobile:
   - Fits screen width
   - No 900px forced width
   - All days visible
   - Graph and legend stacked properly
========================================== */

function RevenueExpenseChart({ dailyData, month }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);

    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [dailyData, month]);

  const maxValue = Math.max(
    1,
    ...dailyData.flatMap((item) => [
      item.revenue,
      item.expenses,
    ])
  );

  const hasData = dailyData.some(
    (item) => item.revenue > 0 || item.expenses > 0
  );

  const chartRevenue = round(
    dailyData.reduce(
      (sum, item) => sum + item.revenue,
      0
    )
  );

  const chartExpenses = round(
    dailyData.reduce(
      (sum, item) => sum + item.expenses,
      0
    )
  );

  return (
    <div className="w-full min-w-0">
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-5">
        <span className="flex items-center gap-2 text-xs font-bold text-[#6985a3]">
          <span className="h-3 w-3 rounded-full bg-[#377ac4]" />
          Revenue
        </span>

        <span className="flex items-center gap-2 text-xs font-bold text-[#6985a3]">
          <span className="h-3 w-3 rounded-full bg-[#e37c94]" />
          Expenses
        </span>
      </div>

      {/* SUMMARY BOXES - MOBILE ONE BY ONE */}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="w-full min-w-0 rounded-2xl border border-[#cce7da] bg-[#e9f9f1] p-4">
          <p className="text-xs font-bold text-[#4c9679]">
            Graph Revenue
          </p>

          <p className="mt-2 break-words text-xl font-black text-[#168368]">
            {money(chartRevenue)}
          </p>
        </div>

        <div className="w-full min-w-0 rounded-2xl border border-[#f6d6df] bg-[#fff0f4] p-4">
          <p className="text-xs font-bold text-[#c47b90]">
            Graph Expenses
          </p>

          <p className="mt-2 break-words text-xl font-black text-[#cb5573]">
            {money(chartExpenses)}
          </p>
        </div>
      </div>

      {/* GRAPH - FULLY RESPONSIVE */}

      <div className="report-mobile-chart mt-5 w-full min-w-0">
        <div className="relative h-64 w-full min-w-0 overflow-hidden rounded-2xl border border-[#e0ecfa] bg-gradient-to-b from-[#f9fcff] to-[#eaf4ff] px-2 pb-3 pt-5 sm:h-72 sm:px-4">
          {/* GRID LINES */}

          <div className="pointer-events-none absolute inset-x-2 bottom-10 top-5 flex flex-col justify-between sm:inset-x-4">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="border-t border-dashed border-[#d5e5f7]"
              />
            ))}
          </div>

          <div className="relative z-10 flex h-full w-full items-end gap-[2px] sm:gap-1">
            {dailyData.map((item) => {
              const revenueHeight =
                (item.revenue / maxValue) * 100;

              const expenseHeight =
                (item.expenses / maxValue) * 100;

              return (
                <div
                  key={item.day}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                  title={`Day ${item.day} | Revenue: ${money(
                    item.revenue
                  )} | Expenses: ${money(item.expenses)}`}
                >
                  <div className="flex h-full w-full items-end justify-center gap-[1px] sm:gap-[2px]">
                    <div
                      className="w-[45%] max-w-6 rounded-t-sm bg-gradient-to-t from-[#245eaa] to-[#85bcf5] transition-[height] duration-[1200ms] ease-out"
                      style={{
                        height: animate
                          ? `${
                              item.revenue > 0
                                ? Math.max(3, revenueHeight)
                                : 0
                            }%`
                          : "0%",
                      }}
                    />

                    <div
                      className="w-[45%] max-w-6 rounded-t-sm bg-gradient-to-t from-[#ce5875] to-[#ffb2c1] transition-[height] duration-[1200ms] ease-out"
                      style={{
                        height: animate
                          ? `${
                              item.expenses > 0
                                ? Math.max(3, expenseHeight)
                                : 0
                            }%`
                          : "0%",
                      }}
                    />
                  </div>

                  <span className="text-[7px] font-bold text-[#7693b0] sm:text-[10px]">
                    {item.day % 2 === 1 ? item.day : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-[#8ba2ba]">
        {hasData
          ? "Daily revenue and expenses. Tap or hover over bars to check values."
          : "No recorded revenue or expense activity for the selected month."}
      </p>
    </div>
  );
}

/* ==========================================
   PROGRESS ROWS
========================================== */

function ProgressRows({
  items,
  total,
  color = "blue",
  emptyText = "No records available.",
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(false);

    const frame = requestAnimationFrame(() => {
      setAnimate(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [items]);

  const gradient =
    color === "green"
      ? "from-[#1d967d] to-[#89d9c5]"
      : color === "rose"
        ? "from-[#d45e79] to-[#f5a8b9]"
        : "from-[#2b68af] to-[#91c4f7]";

  if (!items.length) {
    return (
      <div className="flex min-h-32 items-center justify-center text-center text-sm text-[#8aa3bc]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {items.map((item) => {
        const percentage =
          total > 0
            ? Math.min(100, (item.value / total) * 100)
            : 0;

        return (
          <div key={item.name} className="min-w-0">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-words text-sm font-semibold text-[#587693]">
                {item.name}
              </p>

              <p className="break-words text-sm font-extrabold text-[#163e72]">
                {money(item.value)}
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-[#e1edfa]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-[width] duration-[1200ms] ease-out`}
                style={{
                  width: animate ? `${percentage}%` : "0%",
                }}
              />
            </div>

            <p className="mt-1.5 text-[11px] text-[#8ca4bc]">
              {percentage.toFixed(1)}%
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================
   RESPONSIVE DATA TABLE

   Mobile:
   - Each record = separate card
   - Each field = one by one
   - No horizontal scrolling

   Desktop:
   - Normal table layout
========================================== */

const thClass =
  "whitespace-nowrap bg-[#eaf3ff] px-4 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-wider text-[#587a9e]";

const tdClass =
  "px-4 py-4 text-sm text-[#617f9e]";

function DataTable({
  title,
  subtitle,
  icon,
  columns,
  rows,
  empty,
  count,
}) {
  return (
    <Panel>
      <div className="p-4 sm:p-6">
        <SectionTitle
          title={title}
          subtitle={subtitle}
          icon={icon}
          right={
            <span className="rounded-xl bg-[#e3f0ff] px-3 py-2 text-xs font-bold text-[#2d6bac]">
              {count} records
            </span>
          }
        />
      </div>

      {rows.length ? (
        <>
          {/* MOBILE CARDS */}

          <div className="space-y-3 px-3 pb-4 sm:px-4 lg:hidden">
            {rows.map((row, index) => (
              <div
                key={`mobile-${row.id ?? index}-${index}`}
                className="w-full min-w-0 rounded-[20px] border border-[#d8e7f8] bg-white p-4 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between border-b border-[#e8f0fa] pb-3">
                  <span className="text-xs font-black text-[#245e9e]">
                    Record #{index + 1}
                  </span>

                  <span className="rounded-lg bg-[#edf5ff] px-2.5 py-1 text-[10px] font-bold text-[#5b82ad]">
                    {title}
                  </span>
                </div>

                {/* EACH FIELD ONE BY ONE */}

                <div className="flex flex-col">
                  {columns.map((column, columnIndex) => (
                    <div
                      key={`${column.key}-${columnIndex}`}
                      className="flex min-w-0 flex-col gap-1.5 border-b border-[#edf3fb] py-3 last:border-b-0"
                    >
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8ca4bc]">
                        {column.label}
                      </p>

                      <div className="min-w-0 break-words text-sm font-semibold text-[#173e73]">
                        {column.render
                          ? column.render(row)
                          : row[column.key] ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={thClass}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5eef9]">
                {rows.map((row, index) => (
                  <tr
                    key={`${row.id ?? "row"}-${index}`}
                    className="transition-colors hover:bg-[#edf6ff]"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={tdClass}
                      >
                        {column.render
                          ? column.render(row)
                          : row[column.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-5 py-14 text-center text-sm text-[#8aa3bc]">
          {empty}
        </div>
      )}
    </Panel>
  );
}

/* ==========================================
   MAIN REPORTS
========================================== */

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(
    currentMonth
  );

  const [data, setData] = useState(loadAllData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const dataRef = useRef(data);
  dataRef.current = data;

  /* LIVE MODULE CONNECTION */

  const loadReports = useCallback(() => {
    const latest = loadAllData();

    if (
      JSON.stringify(latest) !==
      JSON.stringify(dataRef.current)
    ) {
      dataRef.current = latest;
      setData(latest);
    }
  }, []);

  const manualRefresh = () => {
    setLoading(true);
    loadReports();
    setLoading(false);
  };

  useEffect(() => {
    const handleUpdate = () => loadReports();

    window.addEventListener("storage", handleUpdate);
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    const interval = window.setInterval(loadReports, 3000);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(
        UPDATE_EVENT,
        handleUpdate
      );
      window.removeEventListener("focus", handleUpdate);
      window.clearInterval(interval);
    };
  }, [loadReports]);

  /* MONTHLY RECORDS */

  const monthly = useMemo(() => {
    const filter = (items) =>
      (items || []).filter(
        (item) => getMonth(item) === selectedMonth
      );

    return {
      expenses: filter(data.expenses),
      bookings: data.bookings.filter(
        (booking) =>
          toDate(getBookingDate(booking)).slice(0, 7) ===
          selectedMonth
      ),
      customers: filter(data.customers),
      enquiries: filter(data.enquiries),
      photography: filter(data.photography),
      videography: filter(data.videography),
      events: filter(data.events),
      functions: filter(data.functions),
      gifts: filter(data.gifts),
      deliveries: filter(data.deliveries),
    };
  }, [data, selectedMonth]);

  /* PAYMENT SUMMARY */

  const paymentSummary = useMemo(() => {
    let revenue = 0;
    let pending = 0;
    let pendingCount = 0;
    let billed = 0;
    let allReceived = 0;

    const entries = [];
    const methods = {};

    data.payments.forEach((payment) => {
      const details = getPaymentDetails(
        payment,
        selectedMonth
      );

      revenue += details.received;
      pending += details.pending;
      billed += details.total;
      allReceived += details.allReceived;

      if (details.pending > 0) {
        pendingCount += 1;
      }

      details.monthlyTransactions.forEach((transaction) => {
        entries.push(transaction);

        const method = transaction.method || "Other";

        methods[method] =
          (methods[method] || 0) + transaction.amount;
      });
    });

    return {
      revenue: round(revenue),
      pending: round(pending),
      billed: round(billed),
      allReceived: round(allReceived),
      pendingCount,
      entries,
      methods,
    };
  }, [data.payments, selectedMonth]);

  /* BOOKING FINANCIALS */

  const bookingFinancials = useMemo(() => {
    const map = new Map();

    data.bookings.forEach((booking) => {
      map.set(
        String(booking.id),
        getBookingFinancials(booking, data.payments)
      );
    });

    return map;
  }, [data.bookings, data.payments]);

  /* EXPENSE SUMMARY */

  const expenseTotal = useMemo(
    () =>
      round(
        monthly.expenses.reduce(
          (sum, item) => sum + getExpenseAmount(item),
          0
        )
      ),
    [monthly.expenses]
  );

  const profit = round(
    paymentSummary.revenue - expenseTotal
  );

  /* BOOKING SUMMARY */

  const confirmedBookings = monthly.bookings.filter(
    (item) =>
      ["confirmed", "completed", "booked"].includes(
        getStatus(item)
      )
  ).length;

  const pendingBookings = monthly.bookings.filter(
    (item) =>
      ["pending", "new"].includes(getStatus(item))
  ).length;

  /* EXPENSE CATEGORIES */

  const categorySummary = useMemo(() => {
    const totals = {};

    monthly.expenses.forEach((item) => {
      const category = item.category || "Other";

      totals[category] =
        (totals[category] || 0) + getExpenseAmount(item);
    });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value: round(value),
      }))
      .sort((a, b) => b.value - a.value);
  }, [monthly.expenses]);

  /* PAYMENT METHODS */

  const methodSummary = useMemo(
    () =>
      Object.entries(paymentSummary.methods)
        .map(([name, value]) => ({
          name,
          value: round(value),
        }))
        .sort((a, b) => b.value - a.value),
    [paymentSummary.methods]
  );

  /* DAILY GRAPH DATA */

  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth
      .split("-")
      .map(Number);

    if (!year || !month) return [];

    const daysInMonth = new Date(
      year,
      month,
      0
    ).getDate();

    const daily = Array.from(
      { length: daysInMonth },
      (_, index) => ({
        day: index + 1,
        revenue: 0,
        expenses: 0,
      })
    );

    paymentSummary.entries.forEach((item) => {
      const date = toDate(item.date);

      if (!date.startsWith(selectedMonth)) return;

      const day = Number(date.slice(8, 10));

      if (day >= 1 && day <= daysInMonth) {
        daily[day - 1].revenue += amountNumber(item.amount);
      }
    });

    monthly.expenses.forEach((item) => {
      const date = toDate(getDate(item));

      if (!date.startsWith(selectedMonth)) return;

      const day = Number(date.slice(8, 10));

      if (day >= 1 && day <= daysInMonth) {
        daily[day - 1].expenses += getExpenseAmount(item);
      }
    });

    return daily.map((item) => ({
      ...item,
      revenue: round(item.revenue),
      expenses: round(item.expenses),
    }));
  }, [
    selectedMonth,
    paymentSummary.entries,
    monthly.expenses,
  ]);

  /* FINANCIAL CARDS */

  const stats = [
    {
      title: "Total Revenue",
      value: paymentSummary.revenue,
      subtitle: "Received payments this month",
      icon: TrendingUp,
      color: "green",
      currency: true,
    },
    {
      title: "Total Expenses",
      value: expenseTotal,
      subtitle: `${monthly.expenses.length} expense records`,
      icon: TrendingDown,
      color: "red",
      currency: true,
    },
    {
      title: "Net Profit",
      value: profit,
      subtitle: "Revenue minus expenses",
      icon: IndianRupee,
      color: profit >= 0 ? "blue" : "red",
      currency: true,
    },
    {
      title: "Pending Balance",
      value: paymentSummary.pending,
      subtitle: `${paymentSummary.pendingCount} unpaid invoices across all months`,
      icon: Wallet,
      color: "purple",
      currency: true,
    },
    {
      title: "Total Bookings",
      value: data.bookings.length,
      subtitle: `${monthly.bookings.length} events in ${monthLabel(
        selectedMonth
      )}`,
      icon: CalendarCheck2,
      color: "cyan",
    },
    {
      title: "New Customers",
      value: monthly.customers.length,
      subtitle: "Customers added this month",
      icon: Users,
      color: "blue",
    },
    {
      title: "Enquiries",
      value: monthly.enquiries.length,
      subtitle: "Monthly enquiry records",
      icon: ClipboardList,
      color: "amber",
    },
    {
      title: "Pending Bookings",
      value: pendingBookings,
      subtitle: "Monthly bookings awaiting confirmation",
      icon: Clock3,
      color: "purple",
    },
  ];

  /* MODULE OVERVIEW */

  const moduleStats = [
    {
      title: "Wedding Photography",
      value: data.photography.length,
      icon: Camera,
    },
    {
      title: "Wedding Videography",
      value: data.videography.length,
      icon: Video,
    },
    {
      title: "Event Management",
      value: data.events.length,
      icon: CalendarDays,
    },
    {
      title: "Functions",
      value: data.functions.length,
      icon: Heart,
    },
    {
      title: "Customized Gifts",
      value: data.gifts.length,
      icon: Package,
    },
    {
      title: "Inventory Items",
      value: data.inventory.length,
      icon: Boxes,
    },
    {
      title: "Equipment",
      value: data.equipment.length,
      icon: Camera,
    },
    {
      title: "Staff Members",
      value: data.staff.length,
      icon: Users,
    },
    {
      title: "Branches",
      value: data.branches.length,
      icon: Building2,
    },
    {
      title: "Deliveries",
      value: data.deliveries.length,
      icon: Package,
    },
    {
      title: "Total Customers",
      value: data.customers.length,
      icon: Users,
    },
  ];

  /* SEARCH */

  const matchesSearch = (item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      getName(item),
      item?.customer,
      item?.phone,
      item?.category,
      item?.status,
      item?.paymentStatus,
      item?.service,
      item?.event,
      item?.eventType,
      item?.location,
      item?.method,
      item?.invoice,
      item?.bookingId,
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    );
  };

  const recentPayments = [...paymentSummary.entries]
    .filter(matchesSearch)
    .sort((a, b) =>
      String(b.date).localeCompare(String(a.date))
    )
    .slice(0, 8);

  const recentExpenses = [...monthly.expenses]
    .filter(matchesSearch)
    .sort((a, b) =>
      toDate(getDate(b)).localeCompare(toDate(getDate(a)))
    )
    .slice(0, 8);

  const recentBookings = [...monthly.bookings]
    .filter(matchesSearch)
    .sort((a, b) =>
      toDate(getBookingDate(b)).localeCompare(
        toDate(getBookingDate(a))
      )
    )
    .slice(0, 10);

  /* CSV EXPORT */

  const exportCSV = () => {
    const rows = [
      ["STUDIO RAW PICTUREZ - CONNECTED REPORT"],
      ["Month", selectedMonth],
      ["Generated", new Date().toLocaleString("en-IN")],
      [],
      ["FINANCIAL SUMMARY"],
      ["Metric", "Amount"],
      ["Monthly Revenue", paymentSummary.revenue],
      ["Monthly Expenses", expenseTotal],
      ["Monthly Net Profit", profit],
      ["All Invoice Billed", paymentSummary.billed],
      ["All Invoice Received", paymentSummary.allReceived],
      ["All Invoice Pending", paymentSummary.pending],
      [],
      ["BOOKING SUMMARY"],
      ["All Bookings", data.bookings.length],
      ["Monthly Bookings", monthly.bookings.length],
      ["Confirmed Bookings", confirmedBookings],
      ["Pending Bookings", pendingBookings],
      ["New Customers", monthly.customers.length],
      ["Enquiries", monthly.enquiries.length],
      [],
      ["ALL MODULE RECORDS"],
      ["Module", "Total"],
      ...moduleStats.map((item) => [
        item.title,
        item.value,
      ]),
      [],
      ["PAYMENT TRANSACTIONS"],
      [
        "Date",
        "Customer",
        "Invoice",
        "Booking ID",
        "Received",
        "Method",
      ],
      ...paymentSummary.entries.map((item) => [
        item.date,
        item.name,
        item.invoice,
        item.bookingId,
        item.amount,
        item.method,
      ]),
      [],
      ["EXPENSES"],
      ["Date", "Title", "Category", "Amount"],
      ...monthly.expenses.map((item) => [
        toDate(getDate(item)),
        getName(item),
        item.category || "Other",
        getExpenseAmount(item),
      ]),
      [],
      ["BOOKINGS"],
      [
        "Event Date",
        "Customer",
        "Phone",
        "Event",
        "Location",
        "Booking Status",
        "Booking Amount",
        "Invoice Billed",
        "Received",
        "Pending",
        "Payment Status",
      ],
      ...monthly.bookings.map((item) => {
        const financials = bookingFinancials.get(
          String(item.id)
        ) || {
          billed: 0,
          received: 0,
          pending: 0,
          status: "Not Invoiced",
        };

        return [
          toDate(getBookingDate(item)),
          getName(item),
          item.phone || "",
          getBookingEvent(item),
          item.location || "",
          item.status || "Pending",
          firstAmount(item, [
            "totalAmount",
            "total",
            "amount",
          ]),
          financials.billed,
          financials.received,
          financials.pending,
          financials.status,
        ];
      }),
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
    link.download = `StudioRaw-Reports-${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-[#f5faff] via-[#edf5ff] to-[#e5f0ff] px-3 py-5 text-[#10264d] sm:px-5 sm:py-7 lg:px-8">
      <style>{reportStyles}</style>

      <div className="mx-auto w-full max-w-[1650px] space-y-6 sm:space-y-7">

        {/* TOP ACTIONS - MOBILE ONE BY ONE */}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex min-h-12 w-full min-w-0 items-center gap-2 rounded-2xl border border-[#d3e5f8] bg-white px-4 shadow-sm sm:w-auto">
            <CalendarDays
              size={18}
              className="shrink-0 text-[#3476bb]"
            />

            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => {
                if (event.target.value) {
                  setSelectedMonth(event.target.value);
                }
              }}
              className="w-full min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-[#173e73] outline-none sm:w-auto"
            />
          </div>

          <button
            type="button"
            onClick={manualRefresh}
            disabled={loading}
            title="Refresh reports"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#d3e5f8] bg-white px-5 text-sm font-bold text-[#275d96] transition hover:bg-[#e7f2ff] sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#173766] to-[#2c609e] px-5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 sm:w-auto"
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {/* FINANCIAL STATS - MOBILE ONE COLUMN */}

        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* REVENUE GRAPH + PAYMENT METHODS */}

        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-3">
          <Panel className="p-4 sm:p-6 xl:col-span-2">
            <SectionTitle
              title="Revenue & Expense Activity"
              subtitle={`Daily performance - ${monthLabel(
                selectedMonth
              )}`}
              icon={BarChart3}
            />

            <RevenueExpenseChart
              dailyData={dailyData}
              month={selectedMonth}
            />
          </Panel>

          <Panel className="p-4 sm:p-6">
            <SectionTitle
              title="Payment Methods"
              subtitle="Collected amount by payment mode"
              icon={Wallet}
            />

            <div className="mt-7">
              <ProgressRows
                items={methodSummary}
                total={paymentSummary.revenue}
                color="blue"
                emptyText="No payment records available."
              />
            </div>

            <div className="mt-6 rounded-[20px] border border-[#d2e5fa] bg-gradient-to-br from-[#eaf4ff] to-[#d4e8ff] p-5">
              <p className="text-xs font-bold text-[#6384a6]">
                Collected Revenue
              </p>

              <p className="mt-2 break-words text-2xl font-black text-[#174477]">
                {money(paymentSummary.revenue)}
              </p>
            </div>
          </Panel>
        </div>

        {/* EXPENSE CATEGORIES */}

        <Panel className="p-4 sm:p-6">
          <SectionTitle
            title="Category-wise Expenses"
            subtitle="Monthly expense distribution"
            icon={TrendingDown}
          />

          <div className="mt-7 w-full">
            <ProgressRows
              items={categorySummary}
              total={expenseTotal}
              color="rose"
              emptyText="No expenses for this month."
            />
          </div>
        </Panel>

        {/* ALL MODULE OVERVIEW */}

        <div className="w-full">
          <div className="mb-5 flex items-center gap-3">
            <div className="shrink-0 rounded-2xl bg-[#e0efff] p-3 text-[#2767ad]">
              <Activity size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#10264d]">
                All Module Overview
              </h2>

              <p className="mt-1 text-xs text-[#839bb4]">
                Total available records across studio modules
              </p>
            </div>
          </div>

          {/* MOBILE: ALL BOXES ONE BY ONE */}

          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {moduleStats.map((item) => (
              <StatCard
                key={item.title}
                title={item.title}
                value={item.value}
                subtitle="Total stored records"
                icon={item.icon}
                color="blue"
              />
            ))}
          </div>
        </div>

        {/* DETAILED REPORTS + SEARCH */}

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-[#10264d]">
              Detailed Reports
            </h2>

            <p className="mt-1 text-xs text-[#839bb4]">
              Monthly payments, expenses and booking records
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#87a0bb]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search records..."
              className="w-full rounded-2xl border border-[#d3e5f8] bg-white py-3 pl-11 pr-4 text-sm text-[#173e73] outline-none transition focus:border-[#82b2e7] focus:ring-4 focus:ring-[#e0efff]"
            />
          </div>
        </div>

        {/* PAYMENT AND EXPENSE RECORDS */}

        <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
          <DataTable
            title="Recent Payments"
            subtitle="Collected payment transactions"
            icon={Receipt}
            count={paymentSummary.entries.length}
            empty="No payment records for this month."
            rows={recentPayments}
            columns={[
              {
                key: "name",
                label: "Customer",
              },
              {
                key: "date",
                label: "Date",
                render: (row) => formatDate(row.date),
              },
              {
                key: "amount",
                label: "Amount",
                render: (row) => (
                  <span className="font-extrabold text-[#168368]">
                    {money(row.amount)}
                  </span>
                ),
              },
              {
                key: "method",
                label: "Method",
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <StatusBadge status={row.status} />
                ),
              },
            ]}
          />

          <DataTable
            title="Recent Expenses"
            subtitle="Studio expense records"
            icon={TrendingDown}
            count={monthly.expenses.length}
            empty="No expenses for this month."
            rows={recentExpenses}
            columns={[
              {
                key: "title",
                label: "Expense",
                render: (row) => getName(row),
              },
              {
                key: "date",
                label: "Date",
                render: (row) =>
                  formatDate(getDate(row)),
              },
              {
                key: "category",
                label: "Category",
                render: (row) =>
                  row.category || "Other",
              },
              {
                key: "amount",
                label: "Amount",
                render: (row) => (
                  <span className="font-extrabold text-[#d35b75]">
                    {money(getExpenseAmount(row))}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* CONNECTED BOOKING REPORT */}

        <DataTable
          title="Booking Report"
          subtitle={`Photography and event bookings - ${monthLabel(
            selectedMonth
          )}`}
          icon={Camera}
          count={monthly.bookings.length}
          empty="No booking records for this month. Select another month to view bookings."
          rows={recentBookings}
          columns={[
            {
              key: "customer",
              label: "Customer Name",
              render: (row) => (
                <div>
                  <p className="font-extrabold text-[#173f74]">
                    {getName(row)}
                  </p>

                  <p className="mt-1 text-xs text-[#8aa0b8]">
                    {row.phone || "—"}
                  </p>
                </div>
              ),
            },
            {
              key: "date",
              label: "Booking Date",
              render: (row) =>
                formatDate(getBookingDate(row)),
            },
            {
              key: "event",
              label: "Event / Service",
              render: (row) => (
                <span className="font-semibold text-[#285a99]">
                  {getBookingEvent(row)}
                </span>
              ),
            },
            {
              key: "location",
              label: "Location",
              render: (row) =>
                row.location || "—",
            },
            {
              key: "bookingAmount",
              label: "Booking Amount",
              render: (row) =>
                money(
                  firstAmount(row, [
                    "totalAmount",
                    "total",
                    "amount",
                  ])
                ),
            },
            {
              key: "received",
              label: "Received",
              render: (row) => {
                const financials = bookingFinancials.get(
                  String(row.id)
                );

                return (
                  <span className="font-extrabold text-[#168368]">
                    {money(financials?.received || 0)}
                  </span>
                );
              },
            },
            {
              key: "pending",
              label: "Pending",
              render: (row) => {
                const financials = bookingFinancials.get(
                  String(row.id)
                );

                return (
                  <span className="font-extrabold text-[#c47b28]">
                    {money(financials?.pending || 0)}
                  </span>
                );
              },
            },
            {
              key: "paymentStatus",
              label: "Payment",
              render: (row) => {
                const financials = bookingFinancials.get(
                  String(row.id)
                );

                return (
                  <StatusBadge
                    status={
                      financials?.status || "Not Invoiced"
                    }
                  />
                );
              },
            },
            {
              key: "status",
              label: "Booking Status",
              render: (row) => (
                <StatusBadge status={row.status} />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
