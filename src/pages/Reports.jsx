import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../api/client";
import {
  getDeduplicatedMonthlyExpenses,
  calculateMonthlyExpenseTotal,
  syncStaffSalaryExpenses,
} from "../services/financialService";
import DateRangeExportModal from "../components/DateRangeExportModal";
import {
  buildExportFilename,
  downloadCsvFile,
  isDateInRange,
} from "../utils/dateRangeExport";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Users,
  Wallet,
  Receipt,
  Camera,
  RefreshCw,
  Download,
  ClipboardList,
  Search,
  MapPin,
  Mail,
  Phone,
  Clock3,
  CheckCircle2,
  CalendarCheck2,
} from "lucide-react";

/* ==========================================
   STUDIO RAW ERP – REPORTS & ANALYTICS
   Professional ERP Reporting & Data Insights
========================================== */

const STORAGE = {
  payments: ["studioraw_payments", "studio_raw_payments"],
  expenses: ["studioraw_expenses", "studio_raw_expenses"],
  bookings: ["studioraw_bookings", "studio_raw_bookings"],
  customers: ["studio_raw_customers", "studioraw_customers"],
  enquiries: ["studioraw_enquiries", "studio_raw_enquiries"],
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
  new Intl.NumberFormat("en-IN").format(Math.round(Number(value) || 0));

function currentMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) {
    return "Selected Month";
  }
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
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

  const indianDate = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (indianDate) {
    const [, day, month, year] = indianDate;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
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
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDate(item) {
  return (
    item?.paymentDate ||
    item?.payment_date ||
    item?.expenseDate ||
    item?.expense_date ||
    item?.eventDate ||
    item?.event_date ||
    item?.shootDate ||
    item?.shoot_date ||
    item?.orderDate ||
    item?.order_date ||
    item?.deliveryDate ||
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
    item?.date ||
    item?.eventDate ||
    item?.event_date ||
    item?.shootDate ||
    item?.shoot_date ||
    item?.orderDate ||
    item?.order_date ||
    item?.bookingDate ||
    item?.booking_date ||
    item?.deliveryDate ||
    item?.createdAt ||
    item?.created_at ||
    ""
  );
}

function getMonth(item) {
  return toDate(getDate(item)).slice(0, 7);
}

function getName(item) {
  if (item?.bride || item?.groom) {
    if (item.bride && item.groom) return `${item.bride} & ${item.groom}`;
    return item.bride || item.groom;
  }

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
    item?.fullName,
    item?.title,
    item?.projectName,
    item?.eventName,
    item?.itemName,
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

function getBookingServiceAndEvent(item) {
  const service = String(
    item?.service ||
    item?.customService ||
    item?.mainEvent ||
    item?.category ||
    ""
  ).trim();

  const event = String(
    item?.event ||
    item?.customEvent ||
    item?.eventType ||
    item?.event_type ||
    item?.packageName ||
    item?.package ||
    ""
  ).trim();

  if (service && event && service.toLowerCase() !== event.toLowerCase()) {
    return { service, event, label: `${service} – ${event}` };
  }
  const main = service || event || "Booking / Service";
  return { service: main, event: event && event !== main ? event : "", label: main };
}

function getEnquiryServiceAndEvent(item) {
  const service = String(
    item?.service ||
    item?.customService ||
    item?.mainEvent ||
    ""
  ).trim();

  const event = String(
    item?.event ||
    item?.customEvent ||
    item?.eventType ||
    item?.event_type ||
    ""
  ).trim();

  if (service && event && service.toLowerCase() !== event.toLowerCase()) {
    return { service, event, label: `${service} – ${event}` };
  }
  const main = service || event || "Enquiry";
  return { service: main, event: event && event !== main ? event : "", label: main };
}

function getLocation(item) {
  return (
    item?.location ||
    item?.venue ||
    item?.city ||
    item?.address ||
    "—"
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
  if (value === null || value === undefined || value === "") return 0;
  const cleaned =
    typeof value === "string" ? value.replace(/[₹,\s]/g, "") : value;
  const result = Number(cleaned);
  return Number.isFinite(result) ? result : 0;
}

function firstAmount(item, fields) {
  for (const field of fields) {
    const value = item?.[field];
    if (value !== undefined && value !== null && value !== "") {
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
   STORAGE EXTRACTION
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
          id !== null && id !== "" ? String(id) : JSON.stringify(item);

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
      (transaction) => !FAILED_STATUSES.includes(getStatus(transaction))
    );

    allReceived = round(
      validTransactions.reduce(
        (sum, transaction) => sum + Math.max(0, getTransactionAmount(transaction)),
        0
      )
    );

    monthlyTransactions = validTransactions
      .map((transaction, index) => {
        const transactionDate = toDate(getDate(transaction)) || invoiceDate;
        return {
          id:
            transaction.id ||
            `${payment.id || payment.invoice || "payment"}-txn-${index}`,
          name: getName(payment),
          date: transactionDate,
          amount: Math.max(0, getTransactionAmount(transaction)),
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
      allReceived = Math.max(0, getReceivedAmount(payment));
      if (allReceived === 0 && PAID_STATUSES.includes(status)) {
        allReceived = total;
      }
    }

    if (allReceived > 0 && invoiceMonth === selectedMonth) {
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
  const pending = Math.max(0, round(total - allReceived));
  const monthlyReceived = round(
    monthlyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
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

function getBookingFinancials(booking, payments = []) {
  const linked = (payments || []).filter(
    (payment) =>
      payment.bookingId && String(payment.bookingId) === String(booking?.id)
  );

  let billed = round(
    linked.reduce((sum, payment) => sum + getPaymentTotal(payment), 0)
  );

  let received = round(
    linked.reduce(
      (sum, payment) => sum + getPaymentDetails(payment, "").allReceived,
      0
    )
  );

  const directTotal = firstAmount(booking, [
    "totalAmount",
    "total_amount",
    "total",
    "amount",
    "grandTotal",
    "price",
  ]);

  const directAdvance = firstAmount(booking, [
    "advance",
    "advanceAmount",
    "advance_amount",
    "paidAmount",
    "received",
  ]);

  if (!linked.length && directTotal > 0) {
    billed = directTotal;
    received = Math.min(directTotal, directAdvance);
  }

  const pending = Math.max(0, round(billed - received));

  let status = "Not Invoiced";
  if (linked.length || directTotal > 0) {
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
   COUNT ANIMATION HOOK
========================================== */

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const finalValue = Number(target) || 0;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      setValue(finalValue);
      return;
    }

    let startTime = null;
    setValue(0);

    const animate = (time) => {
      if (startTime === null) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
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
   UI COMPONENTS
========================================== */

function KPICard({ title, value, subtitle, icon: Icon, color = "blue", currency = true }) {
  const animated = useCountUp(value);

  const colors = {
    green: {
      border: "border-[#cceee2]",
      text: "text-[#107354]",
      iconBg: "bg-[#dcf6ec] text-[#107354]",
    },
    red: {
      border: "border-[#fcd0d7]",
      text: "text-[#c2334d]",
      iconBg: "bg-[#fee2e7] text-[#c2334d]",
    },
    blue: {
      border: "border-[#d0e2f7]",
      text: "text-[#184e8e]",
      iconBg: "bg-[#e2effd] text-[#184e8e]",
    },
    purple: {
      border: "border-[#e3d8fc]",
      text: "text-[#6941b8]",
      iconBg: "bg-[#ede6fc] text-[#6941b8]",
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <div className={`rounded-2xl border ${theme.border} bg-white p-5 shadow-sm transition hover:shadow-md`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#647c9d]">{title}</span>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black ${theme.text}`}>
          {currency ? money(animated) : numberFormat(animated)}
        </p>
        <p className="mt-1 text-xs text-[#7e95b0]">{subtitle}</p>
      </div>
    </div>
  );
}

function Panel({ children, className = "" }) {
  return (
    <section className={`w-full min-w-0 rounded-2xl border border-[#dce7f5] bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ title, subtitle, icon: Icon, right }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#244d8b]">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-black text-[#10264d]">{title}</h2>
          <p className="text-xs text-[#7e95b0]">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "Pending").trim().toLowerCase();

  let theme = "bg-[#f0f4fa] text-[#4d6b8c]";
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
      "new",
      "in discussion",
    ].includes(value)
  ) {
    theme = "bg-[#fff0d9] text-[#ae782a]";
  } else if (FAILED_STATUSES.includes(value)) {
    theme = "bg-[#ffe6ec] text-[#c24b67]";
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${theme}`}>
      {status || "Pending"}
    </span>
  );
}

/* ==========================================
   REVENUE & EXPENSE OVERVIEW CHART
========================================== */

function RevenueExpenseChart({ dailyData, month }) {
  const maxValue = Math.max(
    1,
    ...dailyData.flatMap((item) => [item.revenue, item.expenses])
  );

  const hasData = dailyData.some((item) => item.revenue > 0 || item.expenses > 0);
  const chartRevenue = round(dailyData.reduce((sum, item) => sum + item.revenue, 0));
  const chartExpenses = round(dailyData.reduce((sum, item) => sum + item.expenses, 0));

  if (!hasData) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f5fc] text-[#557a9e]">
          <BarChart3 size={24} />
        </div>
        <p className="mt-3 text-sm font-bold text-[#10264d]">No Activity Recorded</p>
        <p className="mt-1 text-xs text-[#7e95b0]">
          There are no revenue or expense records for {monthLabel(month)}.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs font-bold text-[#647c9d]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#244d8b]" />
            Revenue ({money(chartRevenue)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#c2334d]" />
            Expenses ({money(chartExpenses)})
          </span>
        </div>
      </div>

      <div className="mt-5 w-full min-w-0">
        <div className="relative h-60 w-full overflow-hidden rounded-xl border border-[#e2edf9] bg-[#f8fbfe] px-2 pb-3 pt-5 sm:h-64 sm:px-4">
          <div className="pointer-events-none absolute inset-x-2 bottom-8 top-4 flex flex-col justify-between sm:inset-x-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="border-t border-dashed border-[#dce7f5]" />
            ))}
          </div>

          <div className="relative z-10 flex h-full w-full items-end gap-[2px] sm:gap-1">
            {dailyData.map((item) => {
              const revenueHeight = (item.revenue / maxValue) * 100;
              const expenseHeight = (item.expenses / maxValue) * 100;

              return (
                <div
                  key={item.day}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
                  title={`Day ${item.day} | Revenue: ${money(item.revenue)} | Expenses: ${money(item.expenses)}`}
                >
                  <div className="flex h-full w-full items-end justify-center gap-[1px] sm:gap-[2px]">
                    <div
                      className="w-[45%] max-w-5 rounded-t-sm bg-[#244d8b] transition-[height] duration-700 ease-out"
                      style={{
                        height: item.revenue > 0 ? `${Math.max(4, revenueHeight)}%` : "0%",
                      }}
                    />
                    <div
                      className="w-[45%] max-w-5 rounded-t-sm bg-[#c2334d] transition-[height] duration-700 ease-out"
                      style={{
                        height: item.expenses > 0 ? `${Math.max(4, expenseHeight)}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-semibold text-[#8ca4bc] sm:text-[10px]">
                    {item.day % 2 === 1 ? item.day : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#7e95b0]">
        Daily recorded revenue and expenses for {monthLabel(month)}. Hover over any bar to view exact amounts.
      </p>
    </div>
  );
}

/* ==========================================
   PAYMENT METHODS PANEL
========================================== */

function PaymentMethodsPanel({ methods, totalRevenue }) {
  const methodItems = useMemo(
    () =>
      Object.entries(methods || {})
        .map(([name, value]) => ({ name, value: round(value) }))
        .sort((a, b) => b.value - a.value),
    [methods]
  );

  return (
    <Panel className="p-5 sm:p-6">
      <SectionTitle
        title="Payment Methods"
        subtitle="Revenue collected by payment mode"
        icon={Wallet}
      />

      {methodItems.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f5fc] text-[#557a9e]">
            <Wallet size={24} />
          </div>
          <p className="mt-3 text-sm font-bold text-[#10264d]">No Payment Records</p>
          <p className="mt-1 text-xs text-[#7e95b0]">No payments recorded for this month.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="space-y-4">
            {methodItems.map((item) => {
              const percentage =
                totalRevenue > 0 ? Math.min(100, (item.value / totalRevenue) * 100) : 0;

              return (
                <div key={item.name} className="min-w-0">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#38506f]">{item.name}</span>
                    <span className="font-bold text-[#10264d]">{money(item.value)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#eaf1f8]">
                    <div
                      className="h-full rounded-full bg-[#244d8b] transition-[width] duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="mt-0.5 block text-[10px] text-[#8ca4bc]">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] p-4">
            <p className="text-xs font-bold text-[#647c9d]">Total Collected</p>
            <p className="mt-1 text-xl font-black text-[#10264d]">{money(totalRevenue)}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ==========================================
   DATA TABLE COMPONENT (HORIZONTALLY SCROLLABLE ON MOBILE)
========================================== */

function DataTable({ title, subtitle, icon, columns, rows, empty, count, extraRight }) {
  return (
    <Panel>
      <div className="border-b border-[#eef4fb] p-4 sm:p-5">
        <SectionTitle
          title={title}
          subtitle={subtitle}
          icon={icon}
          right={
            <div className="flex flex-wrap items-center gap-2">
              {extraRight}
              <span className="rounded-xl border border-[#dce7f5] bg-[#f8fbfe] px-3 py-1.5 text-xs font-bold text-[#244d8b]">
                {count} records
              </span>
            </div>
          }
        />
      </div>

      {rows.length ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#e2edf9] bg-[#f5f8fc]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="whitespace-nowrap px-4 py-3.5 text-xs font-bold text-[#4d6b8c]"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef4fb]">
              {rows.map((row, index) => (
                <tr
                  key={`${row.id ?? "row"}-${index}`}
                  className="transition-colors hover:bg-[#f8fbfe]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-4 py-3.5 text-xs text-[#264466]"
                    >
                      {column.render ? column.render(row) : row[column.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-[160px] flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-semibold text-[#7e95b0]">{empty}</p>
        </div>
      )}
    </Panel>
  );
}

/* ==========================================
   MAIN REPORTS & ANALYTICS COMPONENT
========================================== */

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [data, setData] = useState(loadAllData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [bookingFilterScope, setBookingFilterScope] = useState("all");
  const [enquiryFilterScope, setEnquiryFilterScope] = useState("all");
  const [customerFilterScope, setCustomerFilterScope] = useState("all");

  const dataRef = useRef(data);
  dataRef.current = data;

  const loadReports = useCallback(() => {
    syncStaffSalaryExpenses(selectedMonth);
    const latest = loadAllData();
    if (JSON.stringify(latest) !== JSON.stringify(dataRef.current)) {
      dataRef.current = latest;
      setData(latest);
    }
  }, [selectedMonth]);

  const manualRefresh = () => {
    setLoading(true);
    loadReports();
    api.reports
      .summary({ month: selectedMonth })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const handleUpdate = () => loadReports();
    window.addEventListener("storage", handleUpdate);
    window.addEventListener(UPDATE_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);
    const interval = window.setInterval(loadReports, 3000);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener(UPDATE_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      window.clearInterval(interval);
    };
  }, [loadReports]);

  /* ALL BOOKINGS ACROSS MODULES */

  const allBookings = useMemo(() => {
    const result = [];
    const seen = new Set();

    const add = (item, moduleSource) => {
      if (!item || typeof item !== "object") return;
      const key = String(
        item.id || `${getName(item)}-${getBookingDate(item)}-${item.service || item.event}`
      );
      if (seen.has(key)) return;
      seen.add(key);

      const amount = firstAmount(item, [
        "totalAmount",
        "total_amount",
        "total",
        "amount",
        "grandTotal",
        "price",
      ]);

      const advance = firstAmount(item, [
        "advance",
        "advanceAmount",
        "advance_amount",
        "paidAmount",
        "received",
      ]);

      result.push({
        ...item,
        id: item.id || `BK-${result.length + 1}`,
        _module: moduleSource,
        _normalizedName: getName(item),
        _normalizedDate: toDate(getBookingDate(item)),
        _normalizedLocation: getLocation(item),
        _normalizedAmount: amount,
        _normalizedAdvance: advance,
        _normalizedPhone: item.phone || item.number || item.customerPhone || "",
        _normalizedStatus: item.status || "Confirmed",
      });
    };

    (data.bookings || []).forEach((item) => add(item, "Bookings"));
    (data.photography || []).forEach((item) => add(item, "Photography"));
    (data.videography || []).forEach((item) => add(item, "Videography"));
    (data.events || []).forEach((item) => add(item, "Events"));
    (data.functions || []).forEach((item) => add(item, "Functions"));
    (data.gifts || []).forEach((item) => add(item, "Gifts"));

    return result;
  }, [data]);

  /* ENQUIRIES */

  const allEnquiries = useMemo(() => {
    return (data.enquiries || []).map((item, idx) => ({
      ...item,
      id: item.id || `ENQ-${idx + 1}`,
      _module: "Enquiries",
      _normalizedName: getName(item),
      _normalizedPhone: item.number || item.phone || "",
      _normalizedEmail: item.email || "",
      _normalizedDate: toDate(getDate(item)),
      _normalizedLocation: item.city || item.location || item.address || "—",
      _normalizedBudget:
        item.budget ? (typeof item.budget === "number" || !isNaN(Number(item.budget)) ? money(Number(item.budget)) : item.budget) : (item.amount ? money(item.amount) : "—"),
      _normalizedStatus: item.status || "New",
    }));
  }, [data.enquiries]);

  /* CUSTOMERS DIRECTORY (FETCHED FROM CUSTOMERS DATA SOURCE) */

  const allCustomers = useMemo(() => {
    const list = Array.isArray(data.customers) ? data.customers : [];
    const fromCustomers = list.map((c, idx) => ({
      id: c.id || c.customerId || `CUST-${String(idx + 1).padStart(3, "0")}`,
      name: getName(c),
      phone: c.phone || c.mobile || c.contactNumber || "",
      email: c.email || "",
      address: c.address || c.city || c.location || "Tamil Nadu",
      createdAt: toDate(getDate(c)) || toDate(new Date()),
    }));

    if (fromCustomers.length > 0) {
      return fromCustomers;
    }

    // Fallback: extract distinct customers from bookings if no customer table records exist
    const seen = new Set();
    const result = [];
    allBookings.forEach((b) => {
      const name = b._normalizedName || getName(b);
      const phone = b._normalizedPhone || b.phone || "";
      const key = `${name.toLowerCase()}-${phone}`;
      if (!name || name === "Not Specified" || seen.has(key)) return;
      seen.add(key);
      result.push({
        id: b.customerId || `CUST-${String(result.length + 1).padStart(3, "0")}`,
        name,
        phone,
        email: b.email || "",
        address: b._normalizedLocation || b.location || "Tamil Nadu",
        createdAt: b._normalizedDate || toDate(new Date()),
      });
    });
    return result;
  }, [data.customers, allBookings]);

  /* MONTHLY FILTERED RECORDS */

  const monthly = useMemo(() => {
    const deduplicatedExpenses = getDeduplicatedMonthlyExpenses(data.expenses, selectedMonth);

    return {
      expenses: deduplicatedExpenses,
      bookings: allBookings.filter(
        (b) => b._normalizedDate && b._normalizedDate.slice(0, 7) === selectedMonth
      ),
      customers: allCustomers.filter(
        (c) => c.createdAt && toDate(c.createdAt).slice(0, 7) === selectedMonth
      ),
      enquiries: allEnquiries.filter(
        (e) => e._normalizedDate && e._normalizedDate.slice(0, 7) === selectedMonth
      ),
    };
  }, [data.expenses, allBookings, allCustomers, allEnquiries, selectedMonth]);

  /* FINANCIAL CALCULATIONS */

  const paymentSummary = useMemo(() => {
    let revenue = 0;
    let pending = 0;
    let pendingCount = 0;
    let billed = 0;
    let allReceived = 0;

    const entries = [];
    const methods = {};

    data.payments.forEach((payment) => {
      const details = getPaymentDetails(payment, selectedMonth);
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
        methods[method] = (methods[method] || 0) + transaction.amount;
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

  const bookingFinancials = useMemo(() => {
    const map = new Map();
    allBookings.forEach((booking) => {
      map.set(String(booking.id), getBookingFinancials(booking, data.payments));
    });
    return map;
  }, [allBookings, data.payments]);

  const expenseTotal = useMemo(
    () => calculateMonthlyExpenseTotal(data.expenses, selectedMonth),
    [data.expenses, selectedMonth]
  );

  /* DAILY GRAPH DATA FOR SELECTED MONTH */

  const dailyData = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    if (!year || !month) return [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const daily = Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      revenue: 0,
      expenses: 0,
    }));

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
  }, [selectedMonth, paymentSummary.entries, monthly.expenses]);

  /* SEARCH MATCHER */

  const matchesSearch = useCallback(
    (item) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;

      const seBooking = getBookingServiceAndEvent(item);
      const seEnquiry = getEnquiryServiceAndEvent(item);

      return [
        getName(item),
        item?._normalizedName,
        item?.name,
        item?.customer,
        item?.phone,
        item?.number,
        item?._normalizedPhone,
        item?.email,
        item?._normalizedEmail,
        item?.status,
        item?._normalizedStatus,
        item?.paymentStatus,
        seBooking.service,
        seBooking.event,
        seEnquiry.service,
        seEnquiry.event,
        item?.location,
        item?.venue,
        item?.city,
        item?.address,
        item?._normalizedLocation,
        item?.id,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    },
    [search]
  );

  const displayBookings = useMemo(() => {
    const list = bookingFilterScope === "month" ? monthly.bookings : allBookings;
    return [...list]
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b._normalizedDate || "").localeCompare(String(a._normalizedDate || ""))
      );
  }, [bookingFilterScope, monthly.bookings, allBookings, matchesSearch]);

  const displayEnquiries = useMemo(() => {
    const list = enquiryFilterScope === "month" ? monthly.enquiries : allEnquiries;
    return [...list]
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b._normalizedDate || "").localeCompare(String(a._normalizedDate || ""))
      );
  }, [enquiryFilterScope, monthly.enquiries, allEnquiries, matchesSearch]);

  const displayCustomers = useMemo(() => {
    const list = customerFilterScope === "month" ? monthly.customers : allCustomers;
    return [...list]
      .filter(matchesSearch)
      .sort((a, b) =>
        String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
      );
  }, [customerFilterScope, monthly.customers, allCustomers, matchesSearch]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportNotice, setExportNotice] = useState("");

  /* CSV EXPORT */

  const handleExportCSV = ({ rangeType, fromDate, toDate }) => {
    const bookingsInRange = (allBookings || []).filter((b) =>
      isDateInRange(b._normalizedDate || getBookingDate(b), fromDate, toDate)
    );
    const enquiriesInRange = (allEnquiries || []).filter((e) =>
      isDateInRange(e._normalizedDate || getDate(e), fromDate, toDate)
    );
    const customersInRange = (allCustomers || []).filter((c) =>
      isDateInRange(c.createdAt, fromDate, toDate)
    );
    const expensesInRange = (allExpenses || []).filter((ex) =>
      isDateInRange(ex.date || ex.expense_date || ex.createdAt, fromDate, toDate)
    );

    const periodExpenseTotal = round(
      expensesInRange.reduce((sum, ex) => sum + Number(ex.amount || 0), 0)
    );

    let periodRevenue = 0;
    let periodPending = 0;
    const methodTotals = {};

    (allPayments || []).forEach((inv) => {
      const status = String(inv.status || inv.paymentStatus || "").toLowerCase();
      if (status === "cancelled" || status === "canceled") return;

      const txs = Array.isArray(inv.transactions) ? inv.transactions : [];
      if (txs.length > 0) {
        txs.forEach((tx) => {
          const st = String(tx.status || "").toLowerCase();
          if (["failed", "cancelled", "canceled", "refunded", "void", "reversed"].includes(st)) {
            return;
          }
          const txDate = tx.date || tx.paymentDate || tx.createdAt || inv.date;
          if (isDateInRange(txDate, fromDate, toDate)) {
            const amt = Number(tx.amount ?? tx.paidAmount ?? 0);
            periodRevenue += amt;
            const m = String(tx.method || tx.paymentMode || inv.method || "Cash").trim() || "Cash";
            methodTotals[m] = (methodTotals[m] || 0) + amt;
          }
        });
      } else if (isDateInRange(inv.date || inv.paymentDate || inv.createdAt, fromDate, toDate)) {
        const rec = Number(inv.paidAmount ?? inv.amountReceived ?? inv.advance ?? 0);
        periodRevenue += rec;
        if (rec > 0) {
          const m = String(inv.method || inv.paymentMode || "Cash").trim() || "Cash";
          methodTotals[m] = (methodTotals[m] || 0) + rec;
        }
      }

      if (isDateInRange(inv.date || inv.paymentDate || inv.createdAt, fromDate, toDate)) {
        const tot = Number(inv.total ?? inv.totalAmount ?? inv.amount ?? 0);
        const rec = Number(inv.paidAmount ?? inv.amountReceived ?? inv.advance ?? 0);
        periodPending += Math.max(0, tot - rec);
      }
    });

    periodRevenue = round(periodRevenue);
    periodPending = round(periodPending);

    if (
      bookingsInRange.length === 0 &&
      enquiriesInRange.length === 0 &&
      customersInRange.length === 0 &&
      expensesInRange.length === 0 &&
      periodRevenue === 0
    ) {
      return { error: "No records found for the selected date range." };
    }

    const rows = [
      ["STUDIO RAW PICTUREZ – REPORTS & ANALYTICS"],
      ["Report Date Range", `${fromDate} to ${toDate}`],
      ["Generated At", new Date().toLocaleString("en-IN")],
      [],
      ["FINANCIAL SUMMARY"],
      ["Metric", "Amount"],
      ["Total Revenue (Received)", periodRevenue],
      ["Total Expenses", periodExpenseTotal],
      ["Pending Balance (Invoices)", periodPending],
      [],
      ["PAYMENT METHODS BREAKDOWN"],
      ["Payment Method", "Collected Amount"],
      ...Object.entries(methodTotals).map(([m, val]) => [m, round(val)]),
      [],
      ["BOOKING REPORT"],
      [
        "Customer",
        "Phone",
        "Service",
        "Event Type",
        "Booking Date",
        "Location",
        "Invoice Amount",
        "Received",
        "Balance",
        "Payment Status",
        "Booking Status",
      ],
      ...bookingsInRange.map((b) => {
        const fin = bookingFinancials.get(String(b.id)) || {
          billed: 0,
          received: 0,
          pending: 0,
          status: "Not Invoiced",
        };
        const se = getBookingServiceAndEvent(b);
        return [
          b._normalizedName || getName(b),
          b._normalizedPhone || b.phone || "",
          se.service,
          se.event,
          b._normalizedDate || getBookingDate(b),
          b._normalizedLocation || b.location || "",
          fin.billed > 0 ? fin.billed : b._normalizedAmount || 0,
          fin.received,
          fin.pending,
          fin.status,
          b._normalizedStatus || b.status || "Confirmed",
        ];
      }),
      [],
      ["ENQUIRIES REPORT"],
      [
        "Customer",
        "Phone",
        "Email",
        "Service",
        "Event Type",
        "Event Date",
        "City / Location",
        "Estimated Budget",
        "Enquiry Status",
      ],
      ...enquiriesInRange.map((e) => {
        const se = getEnquiryServiceAndEvent(e);
        return [
          e._normalizedName || getName(e),
          e._normalizedPhone || e.phone || "",
          e._normalizedEmail || e.email || "",
          se.service,
          se.event,
          e._normalizedDate || getDate(e),
          e._normalizedLocation || e.city || "",
          e._normalizedBudget || e.budget || "",
          e._normalizedStatus || e.status || "New",
        ];
      }),
      [],
      ["CUSTOMER DIRECTORY REPORT"],
      [
        "Customer ID",
        "Customer Name",
        "Phone Number",
        "Email Address",
        "Location / Address",
        "Registered Date",
      ],
      ...customersInRange.map((c) => [
        c.id,
        c.name,
        c.phone,
        c.email,
        c.address,
        formatDate(c.createdAt),
      ]),
    ];

    downloadCsvFile({
      rows,
      filename: buildExportFilename("Reports", { rangeType, fromDate, toDate }),
    });

    setExportNotice(
      `Reports exported for ${fromDate} to ${toDate}.`
    );
    return { count: bookingsInRange.length + enquiriesInRange.length + customersInRange.length + expensesInRange.length };
  };

  /* ==========================================
     PAGE ARRANGEMENT:
     1. Page Header – Reports & Analytics
     2. Centralized Month Filter, Refresh and Export CSV
     3. Four Summary KPI Cards
     4. Revenue & Expense Overview and Payment Methods
     5. Booking Report
     6. Enquiries Report
     7. Customer Directory Report
  ========================================== */

  return (
    <div className="min-h-screen w-full bg-[#f5f8fc] px-4 py-6 font-sans text-[#10264d] sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* 1. PAGE HEADER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#10264d]">
              Reports &amp; Analytics
            </h1>
            <p className="mt-1 text-xs text-[#647c9d]">
              Financial performance, booking activity, enquiries, and customer analytics
            </p>
          </div>
        </div>

        {exportNotice && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            <span>{exportNotice}</span>
            <button type="button" onClick={() => setExportNotice("")}>
              ×
            </button>
          </div>
        )}

        {/* 2. CENTRALIZED MONTH FILTER, SEARCH, REFRESH & EXPORT CSV */}
        <div className="flex flex-col gap-3 rounded-2xl border border-[#dce7f5] bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] px-3 py-2 text-xs font-bold text-[#10264d]">
              <CalendarDays size={16} className="text-[#244d8b]" />
              <span>Month:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#10264d] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={manualRefresh}
              disabled={loading}
              title="Refresh reports"
              className="flex items-center gap-1.5 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] px-3 py-2 text-xs font-bold text-[#244d8b] transition hover:bg-[#edf4ff]"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#244d8b] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#183968]"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9bb0cc]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by customer, service, city..."
              className="w-full rounded-xl border border-[#dce7f5] bg-[#f8fbfe] py-2 pl-9 pr-3 text-xs font-semibold text-[#10264d] outline-none transition placeholder:text-[#9bb0cc] focus:border-[#244d8b] focus:bg-white"
            />
          </div>
        </div>

        {/* 3. THREE SUMMARY KPI CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KPICard
            title="Total Revenue"
            value={paymentSummary.revenue}
            subtitle={`Received in ${monthLabel(selectedMonth)}`}
            icon={TrendingUp}
            color="green"
            currency
          />
          <KPICard
            title="Total Expenses"
            value={expenseTotal}
            subtitle={`${monthly.expenses.length} records in ${monthLabel(selectedMonth)}`}
            icon={TrendingDown}
            color="red"
            currency
          />
          <KPICard
            title="Pending Balance"
            value={paymentSummary.pending}
            subtitle={`${paymentSummary.pendingCount} unpaid invoice balances`}
            icon={Wallet}
            color="purple"
            currency
          />
        </div>

        {/* 4. REVENUE & EXPENSE OVERVIEW AND PAYMENT METHODS */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Panel className="p-5 sm:p-6 lg:col-span-2">
            <SectionTitle
              title="Revenue & Expense Overview"
              subtitle={`Daily performance for ${monthLabel(selectedMonth)}`}
              icon={BarChart3}
            />
            <RevenueExpenseChart dailyData={dailyData} month={selectedMonth} />
          </Panel>

          <PaymentMethodsPanel
            methods={paymentSummary.methods}
            totalRevenue={paymentSummary.revenue}
          />
        </div>

        {/* 5. BOOKING REPORT */}
        <DataTable
          title="Booking Report"
          subtitle={
            bookingFilterScope === "all"
              ? "All registered studio bookings across all categories"
              : `Bookings for ${monthLabel(selectedMonth)}`
          }
          icon={Camera}
          count={displayBookings.length}
          extraRight={
            <div className="flex items-center gap-1 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] p-1">
              <button
                type="button"
                onClick={() => setBookingFilterScope("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  bookingFilterScope === "all"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                All ({allBookings.length})
              </button>
              <button
                type="button"
                onClick={() => setBookingFilterScope("month")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  bookingFilterScope === "month"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                {monthLabel(selectedMonth)} ({monthly.bookings.length})
              </button>
            </div>
          }
          empty={
            bookingFilterScope === "month"
              ? `No booking records found for ${monthLabel(selectedMonth)}.`
              : "No booking records found matching search."
          }
          rows={displayBookings}
          columns={[
            {
              key: "customer",
              label: "Customer",
              render: (row) => (
                <div>
                  <p className="font-bold text-[#10264d]">
                    {row._normalizedName || getName(row)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#7e95b0]">
                    {row._normalizedPhone || row.phone || "—"}
                  </p>
                </div>
              ),
            },
            {
              key: "serviceEvent",
              label: "Service / Event",
              render: (row) => {
                const se = getBookingServiceAndEvent(row);
                return (
                  <div>
                    <p className="font-semibold text-[#10264d]">{se.service}</p>
                    {se.event && se.event !== se.service && (
                      <p className="mt-0.5 text-[11px] text-[#647c9d]">{se.event}</p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "date",
              label: "Booking Date",
              render: (row) => formatDate(row._normalizedDate || getBookingDate(row)),
            },
            {
              key: "location",
              label: "Location",
              render: (row) => row._normalizedLocation || row.location || "—",
            },
            {
              key: "invoiceAmount",
              label: "Invoice Amount",
              render: (row) => {
                const fin = bookingFinancials.get(String(row.id));
                const total = fin?.billed > 0 ? fin.billed : row._normalizedAmount || 0;
                return <span className="font-bold text-[#10264d]">{money(total)}</span>;
              },
            },
            {
              key: "received",
              label: "Received",
              render: (row) => {
                const fin = bookingFinancials.get(String(row.id));
                return (
                  <span className="font-bold text-[#107354]">
                    {money(fin?.received || 0)}
                  </span>
                );
              },
            },
            {
              key: "balance",
              label: "Balance",
              render: (row) => {
                const fin = bookingFinancials.get(String(row.id));
                return (
                  <span className="font-bold text-[#c2334d]">
                    {money(fin?.pending || 0)}
                  </span>
                );
              },
            },
            {
              key: "paymentStatus",
              label: "Payment Status",
              render: (row) => {
                const fin = bookingFinancials.get(String(row.id));
                return <StatusBadge status={fin?.status || "Not Invoiced"} />;
              },
            },
            {
              key: "status",
              label: "Booking Status",
              render: (row) => (
                <StatusBadge status={row._normalizedStatus || row.status || "Confirmed"} />
              ),
            },
          ]}
        />

        {/* 6. ENQUIRIES REPORT (NO COVERAGE COLUMN) */}
        <DataTable
          title="Enquiries Report"
          subtitle={
            enquiryFilterScope === "all"
              ? "All customer enquiries and service leads"
              : `Enquiries for ${monthLabel(selectedMonth)}`
          }
          icon={ClipboardList}
          count={displayEnquiries.length}
          extraRight={
            <div className="flex items-center gap-1 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] p-1">
              <button
                type="button"
                onClick={() => setEnquiryFilterScope("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  enquiryFilterScope === "all"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                All ({allEnquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setEnquiryFilterScope("month")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  enquiryFilterScope === "month"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                {monthLabel(selectedMonth)} ({monthly.enquiries.length})
              </button>
            </div>
          }
          empty={
            enquiryFilterScope === "month"
              ? `No enquiry records found for ${monthLabel(selectedMonth)}.`
              : "No enquiries found matching search."
          }
          rows={displayEnquiries}
          columns={[
            {
              key: "customerContact",
              label: "Customer & Contact",
              render: (row) => (
                <div>
                  <p className="font-bold text-[#10264d]">
                    {row._normalizedName || getName(row)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#7e95b0]">
                    {row._normalizedPhone || row.phone || "—"}
                    {row._normalizedEmail || row.email ? ` · ${row._normalizedEmail || row.email}` : ""}
                  </p>
                </div>
              ),
            },
            {
              key: "serviceEvent",
              label: "Service / Event",
              render: (row) => {
                const se = getEnquiryServiceAndEvent(row);
                return (
                  <div>
                    <p className="font-semibold text-[#10264d]">{se.service}</p>
                    {se.event && se.event !== se.service && (
                      <p className="mt-0.5 text-[11px] text-[#647c9d]">{se.event}</p>
                    )}
                  </div>
                );
              },
            },
            {
              key: "date",
              label: "Event Date",
              render: (row) => formatDate(row._normalizedDate || getDate(row)),
            },
            {
              key: "city",
              label: "City / Location",
              render: (row) => row._normalizedLocation || row.city || row.location || "—",
            },
            {
              key: "budget",
              label: "Estimated Budget",
              render: (row) => (
                <span className="font-bold text-[#107354]">
                  {row._normalizedBudget || row.budget || "—"}
                </span>
              ),
            },
            {
              key: "status",
              label: "Enquiry Status",
              render: (row) => (
                <StatusBadge status={row._normalizedStatus || row.status || "New"} />
              ),
            },
          ]}
        />

        {/* 7. CUSTOMER DIRECTORY REPORT (NO ACQUISITION CHANNEL) */}
        <DataTable
          title="Customer Directory Report"
          subtitle={
            customerFilterScope === "all"
              ? "All registered customer profiles and records"
              : `Customers registered in ${monthLabel(selectedMonth)}`
          }
          icon={Users}
          count={displayCustomers.length}
          extraRight={
            <div className="flex items-center gap-1 rounded-xl border border-[#dce7f5] bg-[#f8fbfe] p-1">
              <button
                type="button"
                onClick={() => setCustomerFilterScope("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  customerFilterScope === "all"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                All ({allCustomers.length})
              </button>
              <button
                type="button"
                onClick={() => setCustomerFilterScope("month")}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  customerFilterScope === "month"
                    ? "bg-[#244d8b] text-white shadow-sm"
                    : "text-[#647c9d] hover:bg-[#eaf1f8]"
                }`}
              >
                {monthLabel(selectedMonth)} ({monthly.customers.length})
              </button>
            </div>
          }
          empty={
            customerFilterScope === "month"
              ? `No customers registered in ${monthLabel(selectedMonth)}.`
              : "No customer records found matching search."
          }
          rows={displayCustomers}
          columns={[
            {
              key: "nameId",
              label: "Customer",
              render: (row) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4ff] text-xs font-black text-[#244d8b]">
                    {String(row.name || "C").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[#10264d]">{row.name}</p>
                    <p className="text-[10px] text-[#7e95b0]">{row.id}</p>
                  </div>
                </div>
              ),
            },
            {
              key: "phone",
              label: "Phone Number",
              render: (row) => row.phone || "—",
            },
            {
              key: "email",
              label: "Email Address",
              render: (row) => row.email || "—",
            },
            {
              key: "address",
              label: "Location / Address",
              render: (row) => row.address || row.city || "—",
            },
            {
              key: "createdAt",
              label: "Registered Date",
              render: (row) => formatDate(row.createdAt),
            },
          ]}
        />
      </div>
      <DateRangeExportModal
        isOpen={showExportModal}
        moduleLabel="Reports & Analytics"
        onClose={() => setShowExportModal(false)}
        onExport={handleExportCSV}
      />
    </div>
  );
}
