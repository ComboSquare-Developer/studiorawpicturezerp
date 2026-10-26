
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Users,
  MessageSquare,
  CalendarDays,
  IndianRupee,
  Camera,
  Images,
  BookOpen,
  Truck,
  TrendingUp,
  Wallet,
  Activity,
  RefreshCw,
  ChartNoAxesCombined,
  CircleGauge,
  Sparkles,
} from "lucide-react";

/* ==========================================
   STUDIO RAW PICTUREZ - DASHBOARD
   ALL MODULES CONNECTED
   PAYMENT + INVOICE SYNC
   ADVANCE + ADDITIONAL PAYMENT FIX
   PREMIUM UI MAINTAINED
========================================== */

const STORAGE = {
  customers: "studio_raw_customers",
  enquiries: "studio_raw_enquiries",
  bookings: "studioraw_bookings",
  payments: "studioraw_payments",
  photoshoots: "studioraw_photoshoots",
  editing: "studioraw_photo_editing",
  albums: "studioraw_album_printing",
  deliveries: "studioraw_deliveries",
};

const UPDATE_EVENT = "studioraw:data-updated";

/* ==========================================
   STORAGE HELPERS
========================================== */

function readArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === "object") {
      for (const field of [
        "data",
        "records",
        "items",
        "list",
        "payments",
        "bookings",
        "customers",
        "enquiries",
        "deliveries",
      ]) {
        if (Array.isArray(parsed[field])) {
          return parsed[field];
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

function getAllData() {
  if (typeof window === "undefined") {
    return Object.fromEntries(
      Object.keys(STORAGE).map((key) => [key, []])
    );
  }

  return Object.fromEntries(
    Object.entries(STORAGE).map(([name, key]) => [
      name,
      readArray(key),
    ])
  );
}

/* ==========================================
   NUMBER HELPERS
========================================== */

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(
    String(value ?? "").replace(/[₹,\s]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function firstNumber(item, fields) {
  for (const field of fields) {
    const value = item?.[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return toNumber(value);
    }
  }

  return 0;
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

/* ==========================================
   PAYMENT HELPERS
   ADVANCE DOUBLE COUNTING PREVENTION
========================================== */

function paymentTotal(payment) {
  return Math.max(
    0,
    firstNumber(payment, [
      "total",
      "totalAmount",
      "total_amount",
      "grandTotal",
      "grand_total",
      "packageAmount",
      "bookingAmount",
      "amount",
    ])
  );
}

const INVALID_TRANSACTION_STATUSES = [
  "failed",
  "cancelled",
  "canceled",
  "refunded",
  "reversed",
  "void",
];

function paymentTransactions(payment) {
  const transactionFields = [
    "transactions",
    "paymentHistory",
    "payment_history",
    "receipts",
  ];

  const transactions = transactionFields
    .map((field) => payment?.[field])
    .find(Array.isArray);

  /*
   * FIX:
   * Empty transactions array should not block
   * legacy advance payment calculation.
   *
   * When transactions exist, they are the source
   * of truth. Advance is NOT added separately.
   */

  if (transactions && transactions.length > 0) {
    return transactions
      .filter((transaction) => {
        const status = String(
          transaction?.status || ""
        )
          .trim()
          .toLowerCase();

        return !INVALID_TRANSACTION_STATUSES.includes(
          status
        );
      })
      .map((transaction) => ({
        amount: Math.max(
          0,
          firstNumber(transaction, [
            "amount",
            "paidAmount",
            "amountPaid",
            "receivedAmount",
            "received",
          ])
        ),

        date:
          transaction.date ||
          transaction.paymentDate ||
          transaction.createdAt ||
          payment.paymentDate ||
          payment.date ||
          payment.createdAt,
      }))
      .filter((transaction) => transaction.amount > 0);
  }

  /*
   * LEGACY PAYMENT FALLBACK:
   * Supports older invoice records.
   */

  const received = Math.max(
    0,
    firstNumber(payment, [
      "advance",
      "paidAmount",
      "amountPaid",
      "receivedAmount",
      "amountReceived",
      "totalPaid",
      "totalReceived",
      "advanceAmount",
    ])
  );

  if (received > 0) {
    return [
      {
        amount: received,
        date:
          payment.paymentDate ||
          payment.date ||
          payment.createdAt,
      },
    ];
  }

  const total = paymentTotal(payment);

  const status = String(
    payment.status ||
      payment.paymentStatus ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    total > 0 &&
    ["paid", "completed", "fully paid"].includes(status)
  ) {
    return [
      {
        amount: total,
        date:
          payment.paymentDate ||
          payment.date ||
          payment.createdAt,
      },
    ];
  }

  return [];
}

function paymentReceived(payment) {
  return roundMoney(
    paymentTransactions(payment).reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    )
  );
}

function paymentBalance(payment) {
  const total = paymentTotal(payment);
  const received = paymentReceived(payment);

  if (total > 0) {
    return Math.max(
      0,
      roundMoney(total - received)
    );
  }

  return Math.max(
    0,
    firstNumber(payment, [
      "balance",
      "pendingBalance",
      "balanceAmount",
      "dueAmount",
    ])
  );
}

/* ==========================================
   DATE HELPERS
========================================== */

function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();

  let date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    date = new Date(`${raw}T12:00:00`);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");

    date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      12
    );
  } else {
    date = new Date(raw);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "Not scheduled";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function bookingDate(item) {
  return (
    item.eventDate ||
    item.shootDate ||
    item.date ||
    item.bookingDate ||
    ""
  );
}

function getStatus(item) {
  return String(
    item.status ||
      item.bookingStatus ||
      item.paymentStatus ||
      ""
  )
    .trim()
    .toLowerCase();
}

function getCustomerName(item) {
  if (typeof item?.customer === "string") {
    return item.customer;
  }

  return (
    item?.customer?.name ||
    item?.customerName ||
    item?.clientName ||
    item?.name ||
    "Customer"
  );
}

/* ==========================================
   ANIMATED NUMBER
========================================== */

function AnimatedNumber({
  value,
  currency = false,
  replay = 0,
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = toNumber(value);

    if (
      typeof window === "undefined" ||
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setDisplay(target);
      return;
    }

    const start = performance.now();

    let frame;

    function animate(now) {
      const progress = Math.min(
        (now - start) / 1100,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 4);

      setDisplay(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value, replay]);

  return currency
    ? money(display)
    : display.toLocaleString("en-IN");
}

/* ==========================================
   SCROLL REVEAL
========================================== */

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.06 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`sr-scroll-reveal ${
        visible ? "sr-scroll-visible" : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ==========================================
   STAT CARD THEMES
========================================== */

const CARD_THEMES = {
  "Total Customers": {
    bg: "#eff6ff",
    border: "#bfdbfe",
    iconBg: "#dbeafe",
    accent: "#2563eb",
  },

  "Total Enquiries": {
    bg: "#f5f3ff",
    border: "#ddd6fe",
    iconBg: "#ede9fe",
    accent: "#7c3aed",
  },

  "Total Bookings": {
    bg: "#eef2ff",
    border: "#c7d2fe",
    iconBg: "#e0e7ff",
    accent: "#4f46e5",
  },

  "Amount Received": {
    bg: "#ecfdf5",
    border: "#a7f3d0",
    iconBg: "#d1fae5",
    accent: "#059669",
  },

  "Pending Balance": {
    bg: "#fffbeb",
    border: "#fde68a",
    iconBg: "#fef3c7",
    accent: "#d97706",
  },

  "Photo Shoots": {
    bg: "#ecfeff",
    border: "#a5f3fc",
    iconBg: "#cffafe",
    accent: "#0891b2",
  },

  "Editing Pending": {
    bg: "#fff7ed",
    border: "#fed7aa",
    iconBg: "#ffedd5",
    accent: "#ea580c",
  },

  "Album Projects": {
    bg: "#faf5ff",
    border: "#e9d5ff",
    iconBg: "#f3e8ff",
    accent: "#9333ea",
  },

  "Pending Deliveries": {
    bg: "#fff1f2",
    border: "#fecdd3",
    iconBg: "#ffe4e6",
    accent: "#e11d48",
  },
};

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  replay,
}) {
  const theme =
    CARD_THEMES[title] ||
    CARD_THEMES["Total Customers"];

  const isMoney = [
    "Amount Received",
    "Pending Balance",
  ].includes(title);

  return (
    <div
      className="group relative h-full min-w-0 overflow-hidden rounded-[26px] border p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        background: `linear-gradient(145deg,#ffffff 0%,${theme.bg} 100%)`,
        borderColor: theme.border,
        boxShadow: `0 10px 30px ${theme.accent}12`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-bold sm:text-sm"
            style={{ color: theme.accent }}
          >
            {title}
          </p>

          <h2 className="mt-4 break-words text-xl font-black tracking-tight text-[#10264d] sm:text-2xl">
            <AnimatedNumber
              value={value}
              currency={isMoney}
              replay={replay}
            />
          </h2>

          <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110"
          style={{
            backgroundColor: theme.iconBg,
            color: theme.accent,
          }}
        >
          <Icon size={24} strokeWidth={2.4} />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ backgroundColor: theme.accent }}
      />
    </div>
  );
}

/* ==========================================
   SECTION TITLE
========================================== */

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf1fb] text-[#173d77]">
        <Icon size={22} strokeWidth={2.5} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-black text-[#10264d] sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs font-medium text-[#8492a8]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   MONTHLY BAR CHART
========================================== */

function ChartPanel({
  title,
  subtitle,
  icon,
  data,
  dataKey,
  maxValue,
  barColor,
  formatter,
  replay,
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setSelectedIndex(null);
  }, [replay, dataKey]);

  return (
    <div className="sr-premium-card relative min-w-0 overflow-hidden rounded-[28px] border border-[#e0e9f4] bg-white p-4 shadow-sm sm:p-6">
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="relative grid h-64 grid-cols-6 items-end gap-2 border-b border-[#e3eaf3] pb-4 sm:h-72 sm:gap-4">
        <div className="pointer-events-none absolute inset-x-0 bottom-12 top-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="border-t border-dashed border-[#e8eef6]"
            />
          ))}
        </div>

        {data.map((item, index) => {
          const value = item[dataKey] || 0;

          const height = value
            ? Math.max(
                7,
                (value / Math.max(1, maxValue)) * 80
              )
            : 2;

          return (
            <div
              key={item.key}
              className="relative z-10 flex h-full min-w-0 flex-col items-center justify-end gap-3"
            >
              <span className="w-full truncate text-center text-[10px] font-black text-[#10264d] sm:text-xs">
                {formatter ? formatter(value) : value}
              </span>

              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                title={`${item.label}: ${value}`}
                aria-label={`${item.label}: ${value}`}
                className={`sr-premium-bar relative w-full max-w-16 origin-bottom overflow-hidden rounded-t-xl transition-all hover:brightness-110 ${
                  selectedIndex === index
                    ? "ring-2 ring-blue-400 ring-offset-2"
                    : ""
                } ${barColor}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 130}ms`,
                }}
              >
                <span className="sr-bar-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </button>

              <span className="text-[10px] font-bold text-[#71829b] sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#71829b]">
          Monthly Performance
        </span>

        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Recorded Data
        </span>
      </div>
    </div>
  );
}

/* ==========================================
   REVENUE LINE CHART
========================================== */

function RevenueLineChart({
  payments = [],
  replay = 0,
}) {
  const [range, setRange] = useState("30");

  const chartData = useMemo(() => {
    const days =
      range === "7"
        ? 7
        : range === "30"
        ? 30
        : 180;

    const count =
      range === "7"
        ? 7
        : range === "30"
        ? 15
        : 12;

    const current = new Date();
    current.setHours(0, 0, 0, 0);

    const buckets = Array.from(
      { length: count },
      (_, index) => {
        const startOffset = Math.floor(
          (index * days) / count
        );

        const endOffset = Math.floor(
          ((index + 1) * days) / count
        );

        const start = new Date(current);

        start.setDate(
          current.getDate() -
            days +
            1 +
            startOffset
        );

        const end = new Date(current);

        end.setDate(
          current.getDate() -
            days +
            endOffset
        );

        end.setHours(23, 59, 59, 999);

        return {
          key: dateKey(start),

          label: start.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),

          start,
          end,
          value: 0,
        };
      }
    );

    payments.forEach((payment) => {
      paymentTransactions(payment).forEach(
        (transaction) => {
          const date = parseDate(transaction.date);

          if (!date) return;

          const bucket = buckets.find(
            (item) =>
              date >= item.start &&
              date <= item.end
          );

          if (bucket) {
            bucket.value += transaction.amount;
          }
        }
      );
    });

    return buckets;
  }, [payments, range]);

  const width = 800;
  const height = 340;
  const left = 65;
  const right = 25;
  const top = 40;
  const bottom = 55;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maximum = Math.max(
    1,
    ...chartData.map((item) => item.value)
  );

  const niceMax =
    maximum <= 100
      ? Math.ceil(maximum / 10) * 10
      : Math.ceil(maximum / 1000) * 1000;

  const points = chartData.map((item, index) => ({
    ...item,

    x:
      left +
      (index /
        Math.max(1, chartData.length - 1)) *
        plotWidth,

    y:
      top +
      plotHeight -
      (item.value / niceMax) * plotHeight,
  }));

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath = points.length
    ? `${linePath} L ${
        points[points.length - 1].x
      } ${top + plotHeight} L ${points[0].x} ${
        top + plotHeight
      } Z`
    : "";

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="sr-premium-card relative h-full min-w-0 overflow-hidden rounded-[28px] border border-[#dce7f4] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-lg">
            <ChartNoAxesCombined size={23} />
          </div>

          <div>
            <h3 className="text-base font-black text-[#10264d] sm:text-lg">
              Revenue Analytics
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Recorded payment insights
            </p>
          </div>
        </div>

        <div className="flex w-fit gap-1 rounded-xl bg-[#f0f5fb] p-1">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["180", "6 Months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-lg px-2.5 py-2 text-[10px] font-bold sm:px-3 sm:text-[11px] ${
                range === value
                  ? "bg-[#10264d] text-white shadow-md"
                  : "text-slate-500 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-slate-500">
          Total Revenue
        </p>

        <h2 className="mt-1 break-words text-2xl font-black text-[#10264d] sm:text-3xl">
          <AnimatedNumber
            value={total}
            currency
            replay={replay}
          />
        </h2>
      </div>

      <div className="mt-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label="Revenue analytics chart"
        >
          <defs>
            <linearGradient
              id="srRevenueArea"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity="0.35"
              />

              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="srRevenueStroke"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#059669"
              />

              <stop
                offset="100%"
                stopColor="#0d9488"
              />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((index) => {
            const y =
              top + (index * plotHeight) / 4;

            return (
              <g key={index}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="#e6edf5"
                  strokeDasharray="5 7"
                />

                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="700"
                  fill="#71829b"
                >
                  {Math.round(
                    niceMax * (1 - index / 4)
                  ).toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          <path
            key={`area-${range}-${replay}`}
            d={areaPath}
            fill="url(#srRevenueArea)"
            className="sr-premium-area"
          />

          <path
            key={`line-${range}-${replay}`}
            d={linePath}
            fill="none"
            stroke="url(#srRevenueStroke)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            className="sr-premium-line"
          />

          {points.map((point, index) => (
            <g key={point.key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="#059669"
                strokeWidth="2.5"
              />

              {(index %
                Math.max(
                  1,
                  Math.floor(points.length / 5)
                ) ===
                0 ||
                index === points.length - 1) && (
                <text
                  x={point.x}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#71829b"
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="sr-live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" />

        <span className="text-xs font-bold text-slate-500">
          Studio Revenue Performance
        </span>
      </div>
    </div>
  );
}

/* ==========================================
   SALES PERFORMANCE GAUGE
========================================== */

function SalesGauge({
  bookings = [],
  replay = 0,
}) {
  const total = bookings.length;

  const completed = bookings.filter((item) =>
    [
      "completed",
      "complete",
      "delivered",
      "finished",
    ].includes(getStatus(item))
  ).length;

  const confirmed = bookings.filter((item) =>
    ["confirmed", "booked", "approved"].includes(
      getStatus(item)
    )
  ).length;

  const percentage = total
    ? Math.min(
        100,
        ((completed + confirmed) / total) * 100
      )
    : 0;

  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    let frame;

    const start = performance.now();

    function animate(now) {
      const progress = Math.min(
        (now - start) / 1400,
        1
      );

      setAnimated(
        percentage *
          (1 - Math.pow(1 - progress, 4))
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [percentage, replay]);

  const radius = 112;
  const circumference = Math.PI * radius;

  const progressLength =
    (animated / 100) * circumference;

  return (
    <div className="sr-premium-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#dce7f4] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-800 text-white shadow-lg">
          <CircleGauge size={23} />
        </div>

        <div>
          <h3 className="text-base font-black text-[#10264d] sm:text-lg">
            Sales Performance
          </h3>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Confirmed & completed bookings
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-6 w-full max-w-[390px]">
        <svg
          viewBox="0 0 340 240"
          className="h-auto w-full overflow-visible"
        >
          <defs>
            <linearGradient
              id="srGaugeGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop
                offset="0%"
                stopColor="#2563eb"
              />

              <stop
                offset="50%"
                stopColor="#6366f1"
              />

              <stop
                offset="100%"
                stopColor="#06b6d4"
              />
            </linearGradient>
          </defs>

          <path
            d="M 58 174 A 112 112 0 0 1 282 174"
            fill="none"
            stroke="#e7eef8"
            strokeWidth="22"
            strokeLinecap="round"
          />

          <path
            d="M 58 174 A 112 112 0 0 1 282 174"
            fill="none"
            stroke="url(#srGaugeGradient)"
            strokeWidth="22"
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference}`}
          />

          <text
            x="170"
            y="140"
            textAnchor="middle"
            fill="#10264d"
            fontSize="43"
            fontWeight="900"
          >
            {animated.toFixed(1)}%
          </text>

          <text
            x="170"
            y="165"
            textAnchor="middle"
            fill="#71829b"
            fontSize="12"
            fontWeight="700"
          >
            Booking Progress
          </text>

          <text
            x="58"
            y="205"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
          >
            0%
          </text>

          <text
            x="282"
            y="205"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
          >
            100%
          </text>
        </svg>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-[#e6edf5] pt-5">
        {[
          ["Total", total, "text-[#10264d]"],
          ["Confirmed", confirmed, "text-blue-600"],
          ["Completed", completed, "text-emerald-600"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="min-w-0 text-center"
          >
            <p className="text-[11px] font-bold text-slate-500">
              {label}
            </p>

            <p
              className={`mt-2 text-xl font-black sm:text-2xl ${color}`}
            >
              <AnimatedNumber
                value={value}
                replay={replay}
              />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   TIMELINE PANEL
========================================== */

function TimelinePanel({
  title,
  subtitle,
  eyebrow,
  icon: HeaderIcon,
  items,
  type,
  delay = 0,
}) {
  const isBooking = type === "booking";

  return (
    <ScrollReveal delay={delay} className="h-full">
      <section className="sr-timeline-panel relative flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border border-[#dce6f4] bg-white shadow-lg">
        <div className="sr-timeline-header relative overflow-hidden px-5 py-6 sm:px-7 sm:py-7">
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <HeaderIcon
                  size={25}
                  className="text-white"
                />
              </div>

              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                  {eyebrow}
                </p>

                <h3 className="text-lg font-black text-white sm:text-xl">
                  {title}
                </h3>

                <p className="mt-1 text-xs font-medium text-blue-100/80">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-3 text-sm font-black text-white">
              {String(items.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="relative flex-1 p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e3f1] bg-[#f8faff] px-4 text-center">
              <HeaderIcon
                size={30}
                className="mb-4 text-[#174b91]"
              />

              <h4 className="text-sm font-bold text-[#10264d]">
                {isBooking
                  ? "No Upcoming Bookings"
                  : "No Recent Activities"}
              </h4>

              <p className="mt-2 text-xs text-slate-500">
                {isBooking
                  ? "New scheduled events will appear here."
                  : "Latest studio updates will appear here."}
              </p>
            </div>
          ) : (
            <div className="relative space-y-4">
              <div className="pointer-events-none absolute bottom-9 left-[23px] top-9 w-[2px] bg-gradient-to-b from-[#2463b0] via-[#bdd3ee] to-transparent sm:left-[27px]" />

              {items.map((item, index) => {
                const Icon = isBooking
                  ? CalendarDays
                  : item.icon || Activity;

                const name =
                  item.customer ||
                  item.customerName ||
                  item.name ||
                  "Studio Update";

                const event =
                  item.event ||
                  item.eventType ||
                  "Studio Event";

                const date = isBooking
                  ? bookingDate(item)
                  : item.date;

                const status = String(
                  item.status || "Updated"
                );

                return (
                  <div
                    key={item.id || index}
                    className="group relative flex min-w-0 gap-3 sm:gap-4"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-[#174b91] to-[#102f62] text-white shadow-md sm:h-14 sm:w-14">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden rounded-[22px] border border-[#e1eaf5] bg-gradient-to-br from-white to-[#f0f5fd] p-4 shadow-sm transition-all hover:shadow-lg sm:p-5">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#8095b1]">
                        {isBooking
                          ? `Booking ${index + 1}`
                          : item.type || "Studio Activity"}
                      </p>

                      <h4 className="break-words text-base font-black text-[#10264d] sm:text-lg">
                        {isBooking
                          ? getCustomerName(item)
                          : name}
                      </h4>

                      <div className="my-4 h-px bg-[#d8e4f3]" />

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-[#e7edf6] bg-white/80 p-3">
                          <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8a9ab0]">
                            {isBooking
                              ? "Event Type"
                              : "Activity Date"}
                          </p>

                          <p className="text-sm font-bold text-[#173d72]">
                            {isBooking
                              ? event
                              : formatDate(date)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-[#e7edf6] bg-white/80 p-3">
                          <p className="mb-1.5 text-[10px] font-bold uppercase text-[#8a9ab0]">
                            {isBooking
                              ? "Event Date"
                              : "Status"}
                          </p>

                          <p className="text-sm font-bold text-[#173d72]">
                            {isBooking
                              ? formatDate(date)
                              : status}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#e9eff7] bg-[#fafcff] px-5 py-4 sm:px-7">
          <span className="text-xs font-semibold text-[#8293a9]">
            {isBooking
              ? "Event scheduling overview"
              : "Studio workflow timeline"}
          </span>

          <span className="flex items-center gap-2 text-xs font-bold text-[#174b91]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Updated
          </span>
        </div>
      </section>
    </ScrollReveal>
  );
}

/* ==========================================
   MAIN DASHBOARD
========================================== */

export default function Dashboard() {
  const [data, setData] = useState(getAllData);
  const [replay, setReplay] = useState(0);

  /* ========================================
     ALL MODULES LIVE DATA REFRESH
  ======================================== */

  useEffect(() => {
    let lastSnapshot = "";

    const update = () => {
      try {
        const snapshot = JSON.stringify(
          Object.values(STORAGE).map((key) =>
            localStorage.getItem(key)
          )
        );

        if (snapshot !== lastSnapshot) {
          lastSnapshot = snapshot;
          setData(getAllData());
        }
      } catch {
        setData(getAllData());
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        update();
      }
    };

    update();

    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    window.addEventListener(UPDATE_EVENT, update);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    const interval = window.setInterval(update, 2000);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
      window.removeEventListener(UPDATE_EVENT, update);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.clearInterval(interval);
    };
  }, []);

  function refresh() {
    setData(getAllData());
    setReplay((previous) => previous + 1);
  }

  /* ========================================
     DASHBOARD STATISTICS
  ======================================== */

  const stats = useMemo(() => {
    const billed = data.payments.reduce(
      (sum, payment) =>
        sum + paymentTotal(payment),
      0
    );

    const paid = data.payments.reduce(
      (sum, payment) =>
        sum + paymentReceived(payment),
      0
    );

    const pending = data.payments.reduce(
      (sum, payment) =>
        sum + paymentBalance(payment),
      0
    );

    return {
      customers: data.customers.length,
      enquiries: data.enquiries.length,
      bookings: data.bookings.length,

      billed: roundMoney(billed),
      paid: roundMoney(paid),
      pending: roundMoney(pending),

      shoots: data.photoshoots.length,

      editingPending: data.editing.filter(
        (item) =>
          ![
            "completed",
            "complete",
            "done",
          ].includes(
            String(
              item.editingStatus ||
                item.status ||
                ""
            ).toLowerCase()
          )
      ).length,

      albumsPending: data.albums.filter(
        (item) =>
          ![
            "printed",
            "delivered",
            "completed",
            "complete",
          ].includes(
            String(
              item.printingStatus ||
                item.status ||
                ""
            ).toLowerCase()
          )
      ).length,

      deliveriesPending: data.deliveries.filter(
        (item) =>
          ![
            "delivered",
            "cancelled",
            "canceled",
          ].includes(
            String(item.status || "").toLowerCase()
          )
      ).length,
    };
  }, [data]);

  /* ========================================
     UPCOMING BOOKINGS
  ======================================== */

  const upcomingBookings = useMemo(() => {
    const today = dateKey(new Date());

    return data.bookings
      .filter((item) => {
        const date = parseDate(bookingDate(item));
        const status = getStatus(item);

        if (
          [
            "cancelled",
            "canceled",
            "completed",
          ].includes(status)
        ) {
          return false;
        }

        return date && dateKey(date) >= today;
      })
      .sort(
        (a, b) =>
          parseDate(bookingDate(a)) -
          parseDate(bookingDate(b))
      )
      .slice(0, 5);
  }, [data.bookings]);

  /* ========================================
     RECENT ACTIVITIES
  ======================================== */

  const recentActivities = useMemo(() => {
    const activities = [];

    const addItems = (items, type, icon, fields) => {
      items.forEach((item, index) => {
        const date = fields
          .map((field) => item[field])
          .find(Boolean);

        if (!date) return;

        activities.push({
          id: `${type}-${item.id || index}`,
          type,
          icon,
          name: getCustomerName(item),
          date,
          status:
            item.status ||
            item.paymentStatus ||
            item.editingStatus ||
            "Recorded",
        });
      });
    };

    addItems(data.bookings, "Booking", CalendarDays, [
      "updatedAt",
      "createdAt",
      "bookingDate",
      "eventDate",
      "date",
    ]);

    addItems(data.payments, "Payment", Wallet, [
      "updatedAt",
      "paymentDate",
      "createdAt",
      "date",
    ]);

    addItems(data.deliveries, "Delivery", Truck, [
      "updatedAt",
      "createdAt",
      "expectedDate",
    ]);

    addItems(data.photoshoots, "Photo Shoot", Camera, [
      "updatedAt",
      "createdAt",
      "shootDate",
    ]);

    addItems(data.editing, "Editing", Images, [
      "updatedAt",
      "createdAt",
      "date",
    ]);

    addItems(data.albums, "Album", BookOpen, [
      "updatedAt",
      "createdAt",
      "date",
    ]);

    return activities
      .sort(
        (a, b) =>
          (parseDate(b.date)?.getTime() || 0) -
          (parseDate(a.date)?.getTime() || 0)
      )
      .slice(0, 6);
  }, [data]);

  /* ========================================
     MONTHLY CHART
     BOOKINGS = EVENT DATE
     REVENUE = PAYMENT TRANSACTION DATE
  ======================================== */

  const monthlyChart = useMemo(() => {
    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date();

        date.setDate(1);

        date.setMonth(
          date.getMonth() - (5 - index)
        );

        return {
          key: `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`,

          label: date.toLocaleDateString("en-IN", {
            month: "short",
          }),

          bookings: 0,
          revenue: 0,
        };
      }
    );

    data.bookings.forEach((booking) => {
      const date = parseDate(
        bookingDate(booking) ||
          booking.createdAt
      );

      if (!date) return;

      const month = months.find(
        (item) =>
          item.key === dateKey(date).slice(0, 7)
      );

      if (month) {
        month.bookings++;
      }
    });

    data.payments.forEach((payment) => {
      paymentTransactions(payment).forEach(
        (transaction) => {
          const date = parseDate(transaction.date);

          if (!date) return;

          const month = months.find(
            (item) =>
              item.key === dateKey(date).slice(0, 7)
          );

          if (month) {
            month.revenue += transaction.amount;
          }
        }
      );
    });

    return months;
  }, [data]);

  const maxBookings = Math.max(
    1,
    ...monthlyChart.map((item) => item.bookings)
  );

  const maxRevenue = Math.max(
    1,
    ...monthlyChart.map((item) => item.revenue)
  );

  /* ========================================
     DASHBOARD CARDS
  ======================================== */

  const cards = [
    {
      title: "Total Customers",
      value: stats.customers,
      icon: Users,
      subtitle: "Registered customers",
    },

    {
      title: "Total Enquiries",
      value: stats.enquiries,
      icon: MessageSquare,
      subtitle: "Customer enquiries",
    },

    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: CalendarDays,
      subtitle: "Studio bookings",
    },

    {
      title: "Amount Received",
      value: stats.paid,
      icon: IndianRupee,
      subtitle: "Recorded payments",
    },

    {
      title: "Pending Balance",
      value: stats.pending,
      icon: Wallet,
      subtitle: "Outstanding amount",
    },

    {
      title: "Photo Shoots",
      value: stats.shoots,
      icon: Camera,
      subtitle: "Recorded shoots",
    },

    {
      title: "Editing Pending",
      value: stats.editingPending,
      icon: Images,
      subtitle: "Editing not completed",
    },

    {
      title: "Album Projects",
      value: stats.albumsPending,
      icon: BookOpen,
      subtitle: "Not yet printed",
    },

    {
      title: "Pending Deliveries",
      value: stats.deliveriesPending,
      icon: Truck,
      subtitle: "Awaiting delivery",
    },
  ];

  return (
    <div className="sr-dashboard-premium min-h-screen w-full min-w-0 max-w-full overflow-x-hidden px-3 py-5 text-[#10264d] sm:px-6 lg:px-8 lg:py-8">
      <style>{`

        /* ==========================================
           DASHBOARD BACKGROUND
        ========================================== */

        .sr-dashboard-premium {
          color-scheme: light;
          isolation: isolate;

          background:
            radial-gradient(
              ellipse at 8% 2%,
              rgba(37,99,235,.09),
              transparent 32%
            ),
            radial-gradient(
              ellipse at 95% 18%,
              rgba(56,189,248,.08),
              transparent 30%
            ),
            linear-gradient(
              145deg,
              #f8fbff 0%,
              #edf3fb 48%,
              #f7faff 100%
            );
        }

        /* ==========================================
           PASTEL 3D HEADER
        ========================================== */

        .sr-dashboard-premium .sr-gradient-animated {
          position: relative;
          isolation: isolate;

          background:
            radial-gradient(
              circle at 8% 18%,
              rgba(255,155,193,.58),
              transparent 36%
            ),
            radial-gradient(
              circle at 36% 5%,
              rgba(191,160,255,.52),
              transparent 42%
            ),
            radial-gradient(
              circle at 67% 15%,
              rgba(137,202,255,.53),
              transparent 42%
            ),
            radial-gradient(
              circle at 92% 75%,
              rgba(140,236,190,.52),
              transparent 38%
            ),
            linear-gradient(
              120deg,
              #ffe3ec 0%,
              #efdcff 23%,
              #dcecff 45%,
              #dcf8ec 66%,
              #fff0c9 84%,
              #ffe1d4 100%
            );

          border: 1px solid rgba(218,188,230,.85);

          box-shadow:
            inset 0 2px 3px rgba(255,255,255,.96),
            inset 0 -4px 10px rgba(151,119,178,.10),
            0 5px 0 rgba(170,143,192,.12),
            0 18px 35px rgba(115,100,160,.14);

          border-radius: 28px;
        }

        .sr-dashboard-premium .sr-gradient-animated::after {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;

          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,.34),
              transparent 45%
            );
        }

        .sr-dashboard-premium .sr-gradient-animated > * {
          position: relative;
          z-index: 1;
        }

        .sr-dashboard-premium .sr-gradient-animated h2 {
          color: #4a435e !important;
        }

        .sr-dashboard-premium .sr-gradient-animated p,
        .sr-dashboard-premium .sr-gradient-animated span {
          color: #756d85;
        }

        .sr-dashboard-premium .sr-hero-stat {
          background: rgba(255,255,255,.68);
          border: 1px solid rgba(255,255,255,.88);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.96),
            0 5px 12px rgba(130,105,160,.09);

          backdrop-filter: blur(12px);
        }

        .sr-dashboard-premium .sr-hero-stat p {
          color: #4a435e !important;
        }

        .sr-dashboard-premium .sr-hero-stat p:first-child {
          color: #7b6b8d !important;
        }

        .sr-dashboard-premium .sr-hero-stat p:last-child {
          color: #443c5c !important;
        }

        .sr-dashboard-premium .sr-hero-badge {
          background: rgba(255,255,255,.60);
          border: 1px solid rgba(255,255,255,.85);
          box-shadow: 0 3px 10px rgba(150,120,175,.08);
        }

        .sr-dashboard-premium .sr-hero-icon {
          background: rgba(255,255,255,.60);
          border: 1px solid rgba(255,255,255,.90);
          color: #8d67aa;

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.96),
            0 6px 15px rgba(140,105,160,.10);
        }

        /* ==========================================
           PREMIUM CARDS
        ========================================== */

        .sr-dashboard-premium .sr-premium-card {
          background:
            linear-gradient(150deg, #ffffff, #f9fcff);

          border: 1px solid rgba(181,201,226,.55);

          box-shadow:
            0 3px 8px rgba(16,38,77,.025),
            0 16px 45px rgba(16,38,77,.055);

          transition:
            transform .5s,
            box-shadow .5s;
        }

        .sr-dashboard-premium .sr-premium-card:hover {
          transform: translateY(-7px);

          box-shadow:
            0 12px 25px rgba(16,38,77,.06),
            0 28px 65px rgba(16,38,77,.12);
        }

        .sr-timeline-header {
          background:
            linear-gradient(
              120deg,
              #061832,
              #102f62 55%,
              #235a9c
            );
        }

        /* ==========================================
           ANIMATIONS - NO AUTOMATIC SOUND
        ========================================== */

        @keyframes srRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes srLineDraw {
          from {
            stroke-dasharray: 0 100;
            opacity: .25;
          }

          to {
            stroke-dasharray: 100 0;
            opacity: 1;
          }
        }

        @keyframes srBarGrow {
          from {
            transform: scaleY(0);
            opacity: .3;
          }

          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes srShimmer {
          from {
            transform: translateX(-150%);
          }

          to {
            transform: translateX(150%);
          }
        }

        @keyframes srPulse {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: .55;
          }
        }

        @keyframes srAreaAppear {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .sr-premium-line {
          stroke-dasharray: 0 100;
          animation: srLineDraw 2.4s ease forwards;
        }

        .sr-premium-area {
          animation: srAreaAppear 2s ease both;
        }

        .sr-premium-bar {
          animation: srBarGrow 1.3s ease both;
        }

        .sr-bar-shimmer {
          animation: srShimmer 3.5s linear infinite;
        }

        .sr-live-dot {
          animation: srPulse 2s ease-in-out infinite;
        }

        .sr-scroll-reveal {
          opacity: 0;
          transform: translateY(30px);
          filter: blur(3px);

          transition:
            opacity .8s,
            transform .8s,
            filter .8s;
        }

        .sr-scroll-visible {
          opacity: 1;
          transform: none;
          filter: none;
        }

        .sr-refreshing {
          animation: srRotate .7s ease;
        }

        .sr-dashboard-premium button {
          -webkit-tap-highlight-color: transparent;
        }

        .sr-dashboard-premium button:focus-visible {
          outline: 3px solid rgba(59,130,246,.35);
          outline-offset: 3px;
        }

        @media (max-width:640px) {
          .sr-gradient-animated {
            border-radius: 24px;
          }

          .sr-dashboard-premium .sr-premium-card {
            border-radius: 22px;
          }
        }

        @media (prefers-reduced-motion:reduce) {
          .sr-dashboard-premium *,
          .sr-dashboard-premium *::before,
          .sr-dashboard-premium *::after {
            animation: none !important;
            transition-duration: .01ms !important;
          }

          .sr-scroll-reveal {
            opacity: 1;
            transform: none;
            filter: none;
          }

          .sr-premium-line {
            stroke-dasharray: 100 0;
          }
        }

      `}</style>

      {/* REFRESH BUTTON */}

      <div className="mb-7 flex justify-end">
        <button
          type="button"
          onClick={refresh}
          className="group flex items-center justify-center gap-2 rounded-2xl border border-[#dce7f4] bg-white px-5 py-3 text-xs font-black text-[#10264d] shadow-sm transition-all hover:shadow-lg sm:text-sm"
        >
          <RefreshCw
            key={replay}
            size={18}
            className={
              replay > 0
                ? "sr-refreshing"
                : "transition-transform duration-500 group-hover:rotate-180"
            }
          />

          Refresh Dashboard
        </button>
      </div>

      {/* PREMIUM HEADER */}

      <ScrollReveal className="mb-7">
        <div className="sr-gradient-animated relative overflow-hidden rounded-[28px] p-5 sm:p-8">
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="sr-hero-badge mb-4 flex w-fit items-center gap-2 rounded-full px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-[11px] font-bold text-[#756d85]">
                  Business Overview
                </span>
              </div>

              <h2 className="mt-3 text-xl font-extrabold text-[#4a435e] sm:text-2xl lg:text-3xl">
                Manage Your Studio Smarter
              </h2>

              <p className="mt-3 max-w-2xl text-xs leading-6 text-[#756d85] sm:text-sm">
                Track customers, bookings,
                payments, production and
                deliveries from one beautifully
                connected dashboard.
              </p>
            </div>

            <div className="sr-hero-icon hidden rounded-2xl p-5 sm:block">
              <Sparkles size={36} />
            </div>
          </div>

          {/* HEADER FINANCIAL CARDS */}

          <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/50 pt-6 sm:grid-cols-3 sm:gap-4">
            {[
              ["Total Billed", stats.billed],
              ["Total Received", stats.paid],
              ["Pending Amount", stats.pending],
            ].map(([label, value]) => (
              <div
                key={label}
                className="sr-hero-stat min-w-0 rounded-2xl p-4"
              >
                <p className="text-xs font-semibold text-[#7b6b8d]">
                  {label}
                </p>

                <p className="mt-3 break-words text-lg font-black text-[#443c5c] lg:text-xl xl:text-2xl">
                  <AnimatedNumber
                    value={value}
                    currency
                    replay={replay}
                  />
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* DASHBOARD STAT CARDS */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card, index) => (
          <ScrollReveal
            key={card.title}
            delay={(index % 5) * 70}
            className="h-full"
          >
            <StatCard {...card} replay={replay} />
          </ScrollReveal>
        ))}
      </div>

      {/* REVENUE AND SALES */}

      <div className="mb-7 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <ScrollReveal>
          <RevenueLineChart
            payments={data.payments}
            replay={replay}
          />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <SalesGauge
            bookings={data.bookings}
            replay={replay}
          />
        </ScrollReveal>
      </div>

      {/* MONTHLY GRAPHS */}

      <div className="mb-7 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
        <ScrollReveal>
          <ChartPanel
            title="Booking Overview"
            subtitle="Last six months"
            icon={TrendingUp}
            data={monthlyChart}
            dataKey="bookings"
            maxValue={maxBookings}
            barColor="bg-gradient-to-t from-[#10264d] via-[#244d8b] to-[#60a5fa]"
            replay={replay}
          />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <ChartPanel
            title="Revenue Overview"
            subtitle="Recorded receipts by month"
            icon={IndianRupee}
            data={monthlyChart}
            dataKey="revenue"
            maxValue={maxRevenue}
            barColor="bg-gradient-to-t from-[#047857] via-[#10b981] to-[#6ee7b7]"
            formatter={(value) =>
              value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value
            }
            replay={replay}
          />
        </ScrollReveal>
      </div>

      {/* UPCOMING BOOKINGS & RECENT ACTIVITIES */}

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <TimelinePanel
          title="Upcoming Bookings"
          subtitle="Scheduled customer events"
          eyebrow="Studio Schedule"
          icon={CalendarDays}
          items={upcomingBookings}
          type="booking"
        />

        <TimelinePanel
          title="Recent Activities"
          subtitle="Latest studio workflow updates"
          eyebrow="Live Studio Updates"
          icon={Activity}
          items={recentActivities}
          type="activity"
          delay={120}
        />
      </div>

      {/* FOOTER */}

      <div className="mt-9 flex flex-col items-center justify-center gap-2 border-t border-[#e0e9f4] pt-6 text-center">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10264d] text-white">
            <Camera size={15} />
          </span>

          <span className="text-xs font-black text-[#10264d]">
            Studio Raw Picturez
          </span>
        </div>

        <p className="text-[11px] font-semibold text-[#94a3b8]">
          ERP &amp; CRM · Premium Dashboard ·
          Browser-local records
        </p>
      </div>
    </div>
  );
}
