
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
  Volume2,
  VolumeX,
  ChartNoAxesCombined,
  CircleGauge,
} from "lucide-react";

const STORAGE = {
  customers: "studioraw_customers",
  enquiries: "studio_raw_enquiries",
  bookings: "studioraw_bookings",
  payments: "studioraw_payments",
  photoshoots: "studioraw_photoshoots",
  editing: "studioraw_photo_editing",
  albums: "studioraw_album_printing",
  deliveries: "studioraw_deliveries",
};

const SOUND_KEY = "studioraw_dashboard_sound";

const DEMO_DATA = {
  customers: [
    { id: "demo-c1", name: "Arun Kumar" },
    { id: "demo-c2", name: "Priya" },
    { id: "demo-c3", name: "Karthik" },
    { id: "demo-c4", name: "Divya" },
    { id: "demo-c5", name: "Vijay" },
  ],
  enquiries: [
    { id: "demo-e1", name: "Wedding Photography" },
    { id: "demo-e2", name: "Pre-Wedding Shoot" },
    { id: "demo-e3", name: "Birthday Photography" },
  ],
  bookings: [
    {
      id: "demo-b1",
      customer: "Arun Kumar",
      event: "Wedding Photography",
      eventDate: "2026-10-25",
      bookingDate: "2026-10-18",
      createdAt: "2026-10-18",
      status: "Confirmed",
    },
    {
      id: "demo-b2",
      customer: "Priya",
      event: "Pre-Wedding Shoot",
      eventDate: "2026-10-28",
      bookingDate: "2026-10-20",
      createdAt: "2026-10-20",
      status: "Confirmed",
    },
    {
      id: "demo-b3",
      customer: "Karthik",
      event: "Birthday Photography",
      eventDate: "2026-11-05",
      bookingDate: "2026-10-21",
      createdAt: "2026-10-21",
      status: "Confirmed",
    },
  ],
  payments: [
    {
      id: "demo-p1",
      customerName: "Arun Kumar",
      amount: 25000,
      paidAmount: 15000,
      paymentDate: "2026-10-18",
      status: "Partial",
    },
    {
      id: "demo-p2",
      customerName: "Priya",
      amount: 18000,
      paidAmount: 18000,
      paymentDate: "2026-10-20",
      status: "Paid",
    },
    {
      id: "demo-p3",
      customerName: "Karthik",
      amount: 12000,
      paidAmount: 5000,
      paymentDate: "2026-10-21",
      status: "Partial",
    },
  ],
  photoshoots: [
    {
      id: "demo-s1",
      customerName: "Arun Kumar",
      status: "Scheduled",
    },
    {
      id: "demo-s2",
      customerName: "Priya",
      status: "Completed",
    },
    {
      id: "demo-s3",
      customerName: "Karthik",
      status: "Scheduled",
    },
  ],
  editing: [
    {
      id: "demo-ed1",
      customerName: "Arun Kumar",
      editingStatus: "Pending",
    },
    {
      id: "demo-ed2",
      customerName: "Priya",
      editingStatus: "Completed",
    },
    {
      id: "demo-ed3",
      customerName: "Karthik",
      editingStatus: "In Progress",
    },
  ],
  albums: [
    {
      id: "demo-a1",
      customerName: "Arun Kumar",
      printingStatus: "Pending",
    },
    {
      id: "demo-a2",
      customerName: "Priya",
      printingStatus: "Printed",
    },
    {
      id: "demo-a3",
      customerName: "Karthik",
      printingStatus: "In Progress",
    },
  ],
  deliveries: [
    {
      id: "demo-d1",
      customerName: "Arun Kumar",
      status: "Pending",
    },
    {
      id: "demo-d2",
      customerName: "Priya",
      status: "Delivered",
    },
    {
      id: "demo-d3",
      customerName: "Karthik",
      status: "In Progress",
    },
  ],
};

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function getAllData() {
  return Object.fromEntries(
    Object.entries(STORAGE).map(([name, key]) => {
      const actual = readArray(key);
      return [name, actual.length ? actual : DEMO_DATA[name]];
    })
  );
}

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const numberValue = (value) =>
  Number(String(value ?? 0).replace(/[₹,\s]/g, "")) || 0;

const getAmount = (item) =>
  numberValue(item.amount ?? item.totalAmount ?? item.total);

const getPaid = (item) =>
  numberValue(item.paidAmount ?? item.amountPaid ?? item.paid);

function paidValue(item) {
  const status = String(
    item.paymentStatus ?? item.status ?? ""
  ).toLowerCase();

  return ["paid", "completed"].includes(status)
    ? getPaid(item) || getAmount(item)
    : getPaid(item);
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

const bookingDate = (item) =>
  item.eventDate ||
  item.bookingDate ||
  item.date ||
  item.shootDate ||
  "";

function parseDate(value) {
  if (!value) return null;

  const date = new Date(String(value).slice(0, 10) + "T00:00:00");

  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function playDashboardSound(type = "bar", index = 0) {
  try {
    if (localStorage.getItem(SOUND_KEY) !== "true") return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!window.__studioDashboardAudio) {
      window.__studioDashboardAudio = new AudioContextClass();
    }

    const ctx = window.__studioDashboardAudio;

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
      return;
    }

    const notes =
      type === "welcome"
        ? [392, 523, 659, 784]
        : type === "refresh"
        ? [523, 659, 784, 1046]
        : type === "filter"
        ? [440, 660]
        : type === "graph"
        ? [320 + index * 45]
        : [440 + index * 55];

    notes.forEach((frequency, noteIndex) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      const start = ctx.currentTime + noteIndex * 0.075;

      oscillator.type =
        type === "bar" || type === "graph"
          ? "triangle"
          : "sine";

      oscillator.frequency.setValueAtTime(frequency, start);

      oscillator.frequency.exponentialRampToValueAtTime(
        frequency * 1.12,
        start + 0.14
      );

      gain.gain.setValueAtTime(0.0001, start);

      gain.gain.exponentialRampToValueAtTime(
        type === "graph" ? 0.015 : 0.03,
        start + 0.018
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        start + 0.18
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  } catch {
    // Audio is optional.
  }
}

function AnimatedNumber({ value, currency = false, replay = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const target = Number(value) || 0;
    const duration = 1200;

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  index,
  replay,
}) {
  const currency = [
    "Amount Received",
    "Pending Balance",
  ].includes(title);

  return (
    <div
      className="studio-card group relative w-full min-w-0 overflow-hidden rounded-2xl border border-[#e6ecf5] bg-white p-5 shadow-sm transition duration-500 hover:-translate-y-2 hover:border-[#cbd9ee] hover:shadow-xl lg:rounded-[22px] lg:p-6"
      style={{ animationDelay: `${index * 85}ms` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50/70 blur-2xl" />

      <div className="relative flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[#75839a]">
            {title}
          </p>

          <h2 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#10264d] lg:mt-4 lg:text-[clamp(19px,1.65vw,28px)]">
            <AnimatedNumber
              value={value}
              currency={currency}
              replay={replay}
            />
          </h2>

          <p className="mt-2 text-xs leading-5 text-[#98a4b7]">
            {subtitle}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-2xl p-3.5 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110 ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="absolute bottom-0 left-6 right-6 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#244d8b]/50 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );
}

function SectionTitle({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-5 flex min-w-0 items-center gap-3 lg:mb-7 lg:gap-4">
      <div className="shrink-0 rounded-2xl bg-[#edf3fc] p-3 text-[#10264d]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-base font-extrabold tracking-tight text-[#10264d] sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs text-[#91a0b5]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e2e9f3] bg-[#fafcff] py-12 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

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
  soundOffset = 0,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    const element = panelRef.current;
    if (!element) return;

    const timers = [];
    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;

        started = true;

        data.forEach((_, index) => {
          const timer = window.setTimeout(() => {
            playDashboardSound("bar", index + soundOffset);
          }, 180 + index * 110);

          timers.push(timer);
        });

        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [replay, data, soundOffset]);

  return (
    <div
      ref={panelRef}
      className="studio-panel w-full min-w-0 rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:p-7"
    >
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="grid h-56 w-full grid-cols-6 items-end gap-2 border-b border-[#e9eef5] pb-3 sm:gap-3 lg:h-64 lg:gap-4">
        {data.map((item, index) => {
          const value = item[dataKey] || 0;

          const height = value
            ? Math.max(6, (value / maxValue) * 85)
            : 2;

          return (
            <div
              key={item.key}
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2 lg:gap-3"
            >
              <span className="w-full truncate text-center text-[9px] font-semibold text-[#10264d] sm:text-xs">
                {formatter ? formatter(value) : value}
              </span>

              <div
                key={`${replay}-${item.key}`}
                className={`studio-bar w-full max-w-12 origin-bottom rounded-t-lg hover:opacity-80 lg:max-w-14 lg:rounded-t-xl ${barColor}`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 110}ms`,
                }}
              />

              <span className="text-[10px] font-medium text-[#8190a6] sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -----------------------------------------
   NEW: REVENUE LINE CHART
----------------------------------------- */

function makeSmoothPath(points) {
  if (!points.length) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index];
    const next = points[index + 1];
    const middleX = (current.x + next.x) / 2;

    path += ` C ${middleX} ${current.y}, ${middleX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

function RevenueLineChart({ payments, replay }) {
  const [range, setRange] = useState("30");
  const [hoverIndex, setHoverIndex] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);

  const chartData = useMemo(() => {
    const days = range === "7" ? 7 : range === "30" ? 30 : 180;
    const bucketCount = range === "7" ? 7 : range === "30" ? 15 : 12;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = Array.from({ length: bucketCount }, (_, index) => {
      const startOffset = Math.floor((index * days) / bucketCount);
      const endOffset = Math.floor(((index + 1) * days) / bucketCount);

      const start = new Date(today);
      start.setDate(today.getDate() - (days - 1) + startOffset);

      const end = new Date(today);
      end.setDate(today.getDate() - (days - 1) + endOffset - 1);

      return {
        key: dateKey(start),
        start,
        end,
        label: start.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        value: 0,
      };
    });

    payments.forEach((payment) => {
      const date = parseDate(
        payment.paymentDate ||
          payment.createdAt ||
          payment.date
      );

      if (!date) return;

      const bucket = buckets.find(
        (item) => date >= item.start && date <= item.end
      );

      if (bucket) {
        bucket.value += paidValue(payment);
      }
    });

    return buckets;
  }, [payments, range]);

  useEffect(() => {
    setHoverIndex(null);
    setAnimationKey((value) => value + 1);
  }, [range, replay]);

  const width = 760;
  const height = 270;
  const left = 56;
  const right = 18;
  const top = 20;
  const bottom = 42;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maxValue = Math.max(
    1,
    ...chartData.map((item) => item.value)
  );

  const niceMax =
    maxValue <= 100
      ? Math.ceil(maxValue / 10) * 10
      : Math.ceil(maxValue / 1000) * 1000;

  const points = chartData.map((item, index) => ({
    x:
      left +
      (index / Math.max(1, chartData.length - 1)) *
        plotWidth,
    y:
      top +
      plotHeight -
      (item.value / niceMax) * plotHeight,
    ...item,
  }));

  const linePath = makeSmoothPath(points);

  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${
        top + plotHeight
      } L ${points[0].x} ${top + plotHeight} Z`
    : "";

  const total = chartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const activePoint =
    hoverIndex !== null ? points[hoverIndex] : null;

  const handleMove = (event) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();

    const relativeX =
      ((event.clientX - rect.left) / rect.width) * width;

    const index = Math.round(
      ((relativeX - left) / plotWidth) * (points.length - 1)
    );

    setHoverIndex(
      Math.max(0, Math.min(points.length - 1, index))
    );
  };

  return (
    <div className="studio-panel min-w-0 overflow-hidden rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px]">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[#edf3fc] p-2.5 text-[#10264d]">
              <ChartNoAxesCombined size={19} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#10264d]">
                Revenue by Channel
              </h3>

              <p className="mt-1 text-xs text-[#91a0b5]">
                Revenue trend from recorded payments
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-2xl font-extrabold text-[#10264d]">
              <AnimatedNumber
                value={total}
                currency
                replay={replay + animationKey}
              />
            </p>

            <p className="mt-1 text-xs text-[#8190a6]">
              Total received in selected period
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-1 rounded-xl bg-[#f3f6fa] p-1">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["180", "6 Months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                if (range !== value) {
                  setRange(value);
                  playDashboardSound("filter");
                }
              }}
              className={`rounded-lg px-3 py-2 text-[11px] font-bold transition ${
                range === value
                  ? "bg-[#10264d] text-white shadow-sm"
                  : "text-[#8290a5] hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full touch-pan-y"
          role="img"
          aria-label="Animated revenue trend line chart"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={(event) => {
            handleMove(event);
            playDashboardSound("graph", 2);
          }}
        >
          <defs>
            <linearGradient
              id="studioRevenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3ba785"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="#3ba785"
                stopOpacity="0.01"
              />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((index) => {
            const y = top + (index * plotHeight) / 4;
            const value = niceMax * (1 - index / 4);

            return (
              <g key={index}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={y}
                  y2={y}
                  stroke="#e9eef4"
                  strokeDasharray="4 5"
                />

                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#91a0b5"
                >
                  {value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : Math.round(value)}
                </text>
              </g>
            );
          })}

          <path
            key={`area-${animationKey}`}
            d={areaPath}
            fill="url(#studioRevenueGradient)"
            className="studio-area-appear"
          />

          <path
            key={`line-${animationKey}`}
            d={linePath}
            fill="none"
            stroke="#319b7b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            className="studio-line-draw"
          />

          {points.map((point, index) => {
            const showLabel =
              index === 0 ||
              index === points.length - 1 ||
              index % Math.max(1, Math.floor(points.length / 5)) === 0;

            return showLabel ? (
              <text
                key={point.key}
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#8190a6"
              >
                {point.label}
              </text>
            ) : null;
          })}

          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={top}
                y2={top + plotHeight}
                stroke="#a2b8c4"
                strokeDasharray="4 5"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="8"
                fill="#319b7b"
                fillOpacity="0.15"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4"
                fill="#319b7b"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-[#e2e9f1] bg-white px-3 py-2 shadow-xl"
            style={{
              left: `${Math.max(
                13,
                Math.min(87, (activePoint.x / width) * 100)
              )}%`,
              top: `${Math.max(
                0,
                (activePoint.y / height) * 100 - 15
              )}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-[10px] text-[#8290a5]">
              {activePoint.label}
            </p>

            <p className="mt-1 whitespace-nowrap text-xs font-extrabold text-[#10264d]">
              {money(activePoint.value)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#319b7b]" />
        <span className="text-xs font-semibold text-[#8190a6]">
          Studio Revenue
        </span>
      </div>
    </div>
  );
}

/* -----------------------------------------
   NEW: SEMI-CIRCLE SALES GAUGE
----------------------------------------- */

function SalesGauge({ bookings, replay }) {
  const total = bookings.length;

  const completed = bookings.filter((item) =>
    [
      "completed",
      "complete",
      "delivered",
      "finished",
    ].includes(
      String(item.status || item.bookingStatus || "")
        .toLowerCase()
        .trim()
    )
  ).length;

  const confirmed = bookings.filter((item) =>
    ["confirmed", "booked", "approved"].includes(
      String(item.status || item.bookingStatus || "")
        .toLowerCase()
        .trim()
    )
  ).length;

  const progressCount = completed + confirmed;

  const percentage = total
    ? Math.min(100, (progressCount / total) * 100)
    : 0;

  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1600;

    setAnimatedPercentage(0);

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedPercentage(percentage * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [percentage, replay]);

  const segments = 75;

  const arcPoints = Array.from({ length: segments }, (_, index) => {
    const angle = Math.PI - (index / (segments - 1)) * Math.PI;
    const radius = 105;

    return {
      x: 160 + Math.cos(angle) * radius,
      y: 152 - Math.sin(angle) * radius,
      active:
        index / (segments - 1) <= animatedPercentage / 100,
    };
  });

  return (
    <div className="studio-panel min-w-0 overflow-hidden rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px]">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[#edf3fc] p-2.5 text-[#10264d]">
          <CircleGauge size={19} />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-[#10264d]">
            Sales Overview
          </h3>

          <p className="mt-1 text-xs text-[#91a0b5]">
            Confirmed and completed bookings
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-5 w-full max-w-[390px]">
        <svg
          viewBox="0 0 320 205"
          className="h-auto w-full"
          role="img"
          aria-label={`Sales overview ${percentage.toFixed(1)} percent`}
        >
          {arcPoints.map((point, index) => {
            const next = arcPoints[index + 1];

            if (!next) return null;

            return (
              <line
                key={index}
                x1={point.x}
                y1={point.y}
                x2={next.x}
                y2={next.y}
                stroke={
                  point.active ? "#4ba985" : "#e6ecea"
                }
                strokeWidth="19"
                strokeLinecap="butt"
              />
            );
          })}

          <path
            d="M 70 152 A 90 90 0 0 1 250 152"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity="0.7"
          />

          <text
            x="160"
            y="129"
            textAnchor="middle"
            fill="#10264d"
            fontSize="32"
            fontWeight="800"
          >
            {animatedPercentage.toFixed(1)}%
          </text>

          <text
            x="160"
            y="150"
            textAnchor="middle"
            fill="#91a0b5"
            fontSize="11"
          >
            Sales goal
          </text>

          <text
            x="160"
            y="180"
            textAnchor="middle"
            fill="#8190a6"
            fontSize="10"
          >
            Booking conversion overview
          </text>
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-3 border-t border-[#edf1f6] pt-5">
        <div className="text-center">
          <p className="text-[10px] text-[#8190a6] sm:text-xs">
            Total Bookings
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#10264d]">
            <AnimatedNumber value={total} replay={replay} />
          </p>
        </div>

        <div className="border-x border-[#e8edf5] text-center">
          <p className="text-[10px] text-[#8190a6] sm:text-xs">
            Confirmed
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#10264d]">
            <AnimatedNumber value={confirmed} replay={replay} />
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-[#8190a6] sm:text-xs">
            Completed
          </p>
          <p className="mt-2 text-xl font-extrabold text-[#10264d]">
            <AnimatedNumber value={completed} replay={replay} />
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-[10px] text-[#9aa6b6]">
        Percentage = (Confirmed + Completed) / Total Bookings
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-[#e9eef5] pb-3 last:border-b-0 last:pb-0">
      <p className="text-[11px] font-semibold text-[#91a0b5]">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

/* -----------------------------------------
   MAIN DASHBOARD
----------------------------------------- */

export default function Dashboard() {
  const [data, setData] = useState(getAllData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [replay, setReplay] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) === "true"
  );

  useEffect(() => {
    function syncSound(event) {
      if (event.key === SOUND_KEY) {
        setSoundEnabled(event.newValue === "true");
      }
    }

    window.addEventListener("storage", syncSound);

    return () => window.removeEventListener("storage", syncSound);
  }, []);

  function toggleSound() {
    const next = !soundEnabled;

    localStorage.setItem(SOUND_KEY, String(next));
    setSoundEnabled(next);

    if (next) {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (
          AudioContextClass &&
          !window.__studioDashboardAudio
        ) {
          window.__studioDashboardAudio =
            new AudioContextClass();
        }

        window.__studioDashboardAudio
          ?.resume()
          .then(() => playDashboardSound("welcome"))
          .catch(() => {});
      } catch {
        // Sound unavailable.
      }
    }
  }

  function refresh(withSound = true) {
    setData(getAllData());
    setLastUpdated(new Date());
    setReplay((previous) => previous + 1);

    if (withSound) {
      playDashboardSound("refresh");
    }
  }

  useEffect(() => {
    function handleUpdate() {
      setData(getAllData());
      setLastUpdated(new Date());
      setReplay((previous) => previous + 1);
    }

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  const today = dateKey(new Date());

  const stats = useMemo(() => {
    const billed = data.payments.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const paid = data.payments.reduce(
      (sum, item) => sum + paidValue(item),
      0
    );

    return {
      customers: data.customers.length,
      enquiries: data.enquiries.length,
      bookings: data.bookings.length,
      billed,
      paid,
      pending: Math.max(0, billed - paid),
      shoots: data.photoshoots.length,
      editingPending: data.editing.filter(
        (item) =>
          !["completed", "complete"].includes(
            String(
              item.editingStatus || item.status || ""
            ).toLowerCase()
          )
      ).length,
      albumsPending: data.albums.filter(
        (item) =>
          !["printed", "delivered", "completed"].includes(
            String(
              item.printingStatus || item.status || ""
            ).toLowerCase()
          )
      ).length,
      deliveriesPending: data.deliveries.filter(
        (item) =>
          !["delivered", "cancelled"].includes(
            String(item.status || "").toLowerCase()
          )
      ).length,
    };
  }, [data]);

  const upcomingBookings = useMemo(
    () =>
      data.bookings
        .filter((item) => {
          const date = String(bookingDate(item)).slice(0, 10);
          return date && date >= today;
        })
        .sort((a, b) =>
          String(bookingDate(a)).localeCompare(
            String(bookingDate(b))
          )
        )
        .slice(0, 5),
    [data.bookings, today]
  );

  const recentActivities = useMemo(() => {
    const activities = [];

    const addItems = (items, type, icon, dateFields) => {
      items.forEach((item, index) => {
        const date = dateFields
          .map((key) => item[key])
          .find(Boolean);

        if (!date) return;

        activities.push({
          id: `${type}-${item.id || index}`,
          type,
          icon,
          name:
            item.customer ||
            item.customerName ||
            item.name ||
            "Customer",
          date,
          status:
            item.status ||
            item.editingStatus ||
            item.printingStatus ||
            "Recorded",
        });
      });
    };

    addItems(
      data.bookings,
      "Booking",
      CalendarDays,
      ["createdAt", "bookingDate", "eventDate", "date"]
    );

    addItems(
      data.payments,
      "Payment",
      Wallet,
      ["createdAt", "paymentDate", "date"]
    );

    addItems(
      data.deliveries,
      "Delivery",
      Truck,
      ["deliveredDate", "expectedDate", "createdAt", "date"]
    );

    addItems(
      data.photoshoots,
      "Photo Shoot",
      Camera,
      ["shootDate", "createdAt", "date"]
    );

    addItems(
      data.editing,
      "Photo Editing",
      Images,
      ["createdAt", "date", "updatedAt"]
    );

    addItems(
      data.albums,
      "Album Project",
      BookOpen,
      ["createdAt", "date", "updatedAt"]
    );

    return activities
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      )
      .slice(0, 6);
  }, [data]);

  const monthlyChart = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();

      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));

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
    });

    data.bookings.forEach((item) => {
      const date =
        item.bookingDate || item.createdAt || item.date;

      const month = months.find(
        (entry) => String(date || "").slice(0, 7) === entry.key
      );

      if (month) month.bookings += 1;
    });

    data.payments.forEach((item) => {
      const date =
        item.paymentDate || item.createdAt || item.date;

      const month = months.find(
        (entry) => String(date || "").slice(0, 7) === entry.key
      );

      if (month) month.revenue += paidValue(item);
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

  const cards = [
    {
      title: "Total Customers",
      value: stats.customers,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
      subtitle: "Registered customers",
    },
    {
      title: "Total Enquiries",
      value: stats.enquiries,
      icon: MessageSquare,
      color: "bg-indigo-50 text-indigo-700",
      subtitle: "Customer enquiries",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: CalendarDays,
      color: "bg-violet-50 text-violet-700",
      subtitle: "Studio bookings",
    },
    {
      title: "Amount Received",
      value: stats.paid,
      icon: IndianRupee,
      color: "bg-green-50 text-green-700",
      subtitle: "Recorded payments",
    },
    {
      title: "Pending Balance",
      value: stats.pending,
      icon: Wallet,
      color: "bg-amber-50 text-amber-700",
      subtitle: "Outstanding amount",
    },
    {
      title: "Photo Shoots",
      value: stats.shoots,
      icon: Camera,
      color: "bg-sky-50 text-sky-700",
      subtitle: "Recorded shoots",
    },
    {
      title: "Editing Pending",
      value: stats.editingPending,
      icon: Images,
      color: "bg-orange-50 text-orange-700",
      subtitle: "Editing not completed",
    },
    {
      title: "Album Projects",
      value: stats.albumsPending,
      icon: BookOpen,
      color: "bg-purple-50 text-purple-700",
      subtitle: "Not yet printed",
    },
    {
      title: "Pending Deliveries",
      value: stats.deliveriesPending,
      icon: Truck,
      color: "bg-rose-50 text-rose-700",
      subtitle: "Awaiting delivery",
    },
  ];

  const isDemo = Object.entries(STORAGE).some(
    ([name, key]) =>
      readArray(key).length === 0 &&
      DEMO_DATA[name].length > 0
  );

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-[#f5f7fb] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">
      <style>{`
        @keyframes studioEnter {
          from {
            opacity: 0;
            transform: translateY(28px) scale(.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes studioBar {
          from {
            transform: scaleY(0);
            opacity: .3;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes studioFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes studioGlow {
          0%, 100% {
            opacity: .45;
          }
          50% {
            opacity: .9;
          }
        }

        @keyframes studioRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes studioLineDraw {
          from {
            stroke-dasharray: 0 100;
            opacity: .4;
          }
          to {
            stroke-dasharray: 100 0;
            opacity: 1;
          }
        }

        @keyframes studioAreaAppear {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .studio-card {
          animation: studioEnter .7s cubic-bezier(.2,.8,.2,1) both;
        }

        .studio-panel {
          animation: studioEnter .85s ease both;
        }

        .studio-bar {
          animation: studioBar 1.1s cubic-bezier(.2,.8,.2,1) both;
        }

        .studio-floating {
          animation: studioFloat 5s ease-in-out infinite;
        }

        .studio-glow {
          animation: studioGlow 4s ease-in-out infinite;
        }

        .studio-refreshing {
          animation: studioRotate .7s ease-in-out;
        }

        .studio-line-draw {
          animation: studioLineDraw 2s ease-in-out both;
        }

        .studio-area-appear {
          animation: studioAreaAppear 1.6s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .studio-card,
          .studio-panel,
          .studio-bar,
          .studio-floating,
          .studio-glow,
          .studio-refreshing,
          .studio-line-draw,
          .studio-area-appear {
            animation: none !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="studio-panel mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[#7690b2] lg:block">
            Studio Performance
          </p>

          <h1 className="text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl lg:text-[30px]">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-xs text-[#8290a5] sm:text-sm">
            Welcome to Studio Raw Picturez ERP &amp; CRM
          </p>

          <p className="mt-2 text-[11px] text-slate-400">
            Last refreshed:{" "}
            {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f2] bg-white px-4 py-3 text-sm font-semibold text-[#10264d] shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
          >
            {soundEnabled ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
            Sound {soundEnabled ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => refresh(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f2] bg-white px-4 py-3 text-sm font-semibold text-[#10264d] shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md lg:rounded-2xl lg:px-5"
          >
            <RefreshCw
              key={replay}
              size={17}
              className={replay > 0 ? "studio-refreshing" : ""}
            />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {isDemo && (
        <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Demo preview is shown for sections with no saved
          records. Demo values are not saved to your browser.
        </div>
      )}

      {/* HERO */}
      <div className="studio-panel relative mb-6 w-full min-w-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#091b36] via-[#143662] to-[#28548b] p-5 text-white shadow-lg sm:p-8 lg:mb-8 lg:rounded-[28px] lg:p-9">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="studio-floating absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-24 h-[300px] w-[300px] rounded-full border border-white/10" />
          <div className="studio-glow absolute -right-32 bottom-[-170px] h-[350px] w-[350px] rounded-full bg-blue-300/10 blur-[70px]" />
        </div>

        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-200 sm:text-sm lg:font-semibold lg:tracking-[0.12em]">
              Studio Business Overview
            </p>

            <h2 className="mt-3 break-words text-xl font-bold sm:text-2xl lg:mt-4 lg:text-[30px] lg:font-extrabold">
              Manage Your Studio Smarter
            </h2>

            <p className="mt-3 max-w-2xl text-xs leading-6 text-blue-100/80 sm:text-sm lg:mt-4 lg:leading-7">
              Track customers, bookings, payments, production
              and deliveries from one dashboard.
            </p>
          </div>

          <div className="studio-floating hidden shrink-0 rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:block">
            <Activity size={36} />
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 md:grid-cols-3 lg:mt-8 lg:gap-5 lg:pt-7">
          {[
            ["Total Billed", stats.billed],
            ["Total Received", stats.paid],
            ["Pending Amount", stats.pending],
          ].map(([label, amount], index) => (
            <div
              key={label}
              className="studio-card min-w-0 rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:bg-white/[0.15] lg:p-5"
              style={{ animationDelay: `${index * 130}ms` }}
            >
              <p className="text-xs text-blue-200">
                {label}
              </p>

              <p className="mt-3 break-words text-xl font-extrabold lg:text-[clamp(19px,1.7vw,27px)]">
                <AnimatedNumber
                  value={amount}
                  currency
                  replay={replay}
                />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 lg:mb-8 lg:gap-5">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            index={index}
            replay={replay}
          />
        ))}
      </div>

      {/* NEW REFERENCE STYLE GRAPHS */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr] lg:mb-8 lg:gap-5">
        <RevenueLineChart
          payments={data.payments}
          replay={replay}
        />

        <SalesGauge
          bookings={data.bookings}
          replay={replay}
        />
      </div>

      {/* EXISTING GRAPHS */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 lg:mb-8 lg:gap-5">
        <ChartPanel
          title="Booking Overview"
          subtitle="Last six months"
          icon={TrendingUp}
          data={monthlyChart}
          dataKey="bookings"
          maxValue={maxBookings}
          barColor="bg-[#244d8b]"
          replay={replay}
          soundOffset={0}
        />

        <ChartPanel
          title="Revenue Overview"
          subtitle="Recorded receipts by month"
          icon={IndianRupee}
          data={monthlyChart}
          dataKey="revenue"
          maxValue={maxRevenue}
          barColor="bg-emerald-500"
          replay={replay}
          soundOffset={6}
          formatter={(value) =>
            value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : value
          }
        />
      </div>

      {/* UPCOMING BOOKINGS AND ACTIVITIES */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 lg:mb-8 lg:gap-5">
        <div className="studio-panel min-w-0 rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:p-7">
          <SectionTitle
            title="Upcoming Bookings"
            subtitle="Scheduled customer events"
            icon={CalendarDays}
          />

          {upcomingBookings.length === 0 ? (
            <EmptyState message="No upcoming bookings found" />
          ) : (
            <div className="flex flex-col gap-3 lg:gap-4">
              {upcomingBookings.map((item, index) => (
                <div
                  key={item.id || index}
                  className="studio-card flex min-w-0 flex-col gap-3 rounded-2xl border border-[#e9eef6] bg-[#f8faff] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#cbd9ee] hover:bg-white hover:shadow-md lg:p-5"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <InfoRow
                    label="Customer"
                    value={
                      item.customer ||
                      item.customerName ||
                      item.name ||
                      "Customer"
                    }
                  />

                  <InfoRow
                    label="Event"
                    value={
                      item.event ||
                      item.eventType ||
                      "Photography Booking"
                    }
                  />

                  <InfoRow
                    label="Event Date"
                    value={formatDate(bookingDate(item))}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="studio-panel min-w-0 rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:p-7">
          <SectionTitle
            title="Recent Activities"
            subtitle="Latest recorded studio workflow items"
            icon={Activity}
          />

          {recentActivities.length === 0 ? (
            <EmptyState message="No recent activities available" />
          ) : (
            <div className="flex flex-col gap-3 lg:gap-4">
              {recentActivities.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="studio-card flex min-w-0 flex-col gap-3 rounded-2xl border border-[#e9eef6] bg-[#f8faff] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#cbd9ee] hover:bg-white hover:shadow-md lg:p-5"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 rounded-2xl bg-blue-50 p-3 text-blue-700">
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-semibold text-[#10264d]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.type}
                        </p>
                      </div>
                    </div>

                    <InfoRow
                      label="Date"
                      value={formatDate(item.date)}
                    />

                    <InfoRow
                      label="Status"
                      value={item.status}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-5 text-slate-400 lg:mt-8">
        Studio Raw Picturez ERP &amp; CRM · Dashboard data
        stored locally in this browser
      </p>
    </div>
  );
}
