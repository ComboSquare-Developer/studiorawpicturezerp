
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

/* =========================================
   STORAGE
========================================= */

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

const DEMO_COUNTS = {
  customers: 85,
  enquiries: 70,
  bookings: 80,
  payments: 75,
  photoshoots: 40,
  editing: 30,
  albums: 20,
  deliveries: 20,
};

const CUSTOMER_NAMES = [
  "Arun Kumar", "Priya Sharma", "Karthik Raj",
  "Divya Nair", "Vijay Kumar", "Anjali Devi",
  "Rahul Krishnan", "Meena Raj", "Sanjay Kumar",
  "Nithya", "Harish", "Sneha", "Ajith", "Deepa",
  "Ramesh", "Keerthana", "Suresh", "Pavithra",
  "Vignesh", "Aishwarya", "Ashwin", "Shalini",
  "Praveen", "Monisha", "Gokul", "Abinaya",
  "Dinesh", "Ramya", "Naveen", "Swetha",
];

const EVENTS = [
  "Wedding Photography",
  "Wedding Videography",
  "Engagement",
  "Pre-Wedding Shoot",
  "Birthday Photography",
  "Baby Shower",
  "Reception",
  "Maternity Shoot",
  "Corporate Event",
  "Housewarming",
];

const LOCATIONS = [
  "Nagercoil", "Chennai", "Marthandam",
  "Kanyakumari", "Trivandrum",
  "Tirunelveli", "Madurai", "Coimbatore",
];

const customerName = (i) =>
  CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];

const eventName = (i) =>
  EVENTS[i % EVENTS.length];

const locationName = (i) =>
  LOCATIONS[i % LOCATIONS.length];

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function demoDate(index, future = false) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(
    date.getDate() +
      (future ? index % 60 : -((index * 3) % 175))
  );
  return dateKey(date);
}

/* =========================================
   DEMO DATA - 420 RECORDS
========================================= */

function createDemoData() {
  const customers = Array.from(
    { length: DEMO_COUNTS.customers },
    (_, i) => ({
      id: `demo-customer-${i + 1}`,
      name: customerName(i),
      customerName: customerName(i),
      phone: `98765${String(10000 + i)}`,
      email: `customer${i + 1}@example.com`,
      location: locationName(i),
      address: `${locationName(i)}, Tamil Nadu`,
      gender: i % 2 === 0 ? "Male" : "Female",
      status: i % 7 === 0 ? "Inactive" : "Active",
      source: ["Instagram", "Referral", "Website", "Walk-in"][i % 4],
      createdAt: demoDate(i),
    })
  );

  const stages = [
    "New", "Contacted", "Qualified", "Quoted",
    "Follow-up", "Won/Converted", "Lost",
  ];

  const enquiries = Array.from(
    { length: DEMO_COUNTS.enquiries },
    (_, i) => ({
      id: `demo-enquiry-${i + 1}`,
      name: customerName(i),
      customer: customerName(i),
      customerName: customerName(i),
      phone: `98765${String(10000 + i)}`,
      event: eventName(i),
      eventType: eventName(i),
      service: eventName(i),
      location: locationName(i),
      budget: 15000 + (i % 12) * 4500,
      source: ["Instagram", "Referral", "WhatsApp", "Website"][i % 4],
      stage: stages[i % stages.length],
      status: stages[i % stages.length],
      eventDate: demoDate(i, true),
      createdAt: demoDate(i),
    })
  );

  const bookingStatuses = [
    "Confirmed", "Pending", "Completed",
    "Booked", "Cancelled",
  ];

  const bookings = Array.from(
    { length: DEMO_COUNTS.bookings },
    (_, i) => ({
      id: `demo-booking-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      eventType: eventName(i),
      location: locationName(i),
      eventDate: demoDate(i, i % 3 === 0),
      bookingDate: demoDate(i),
      createdAt: demoDate(i),
      status: bookingStatuses[i % bookingStatuses.length],
    })
  );

  const payments = Array.from(
    { length: DEMO_COUNTS.payments },
    (_, i) => {
      const amount = 12000 + (i % 18) * 3500;
      const paidAmount =
        i % 4 === 0
          ? amount
          : i % 5 === 0
          ? 0
          : Math.round(amount * 0.6);

      return {
        id: `demo-payment-${i + 1}`,
        customer: customerName(i),
        customerName: customerName(i),
        amount,
        totalAmount: amount,
        paidAmount,
        balanceAmount: amount - paidAmount,
        paymentDate: demoDate(i),
        createdAt: demoDate(i),
        paymentMethod: ["UPI", "Cash", "Bank Transfer", "Card"][i % 4],
        status:
          paidAmount === amount
            ? "Paid"
            : paidAmount === 0
            ? "Pending"
            : "Partial",
      };
    }
  );

  const photoshoots = Array.from(
    { length: DEMO_COUNTS.photoshoots },
    (_, i) => ({
      id: `demo-shoot-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      shootDate: demoDate(i, i % 3 === 0),
      createdAt: demoDate(i),
      location: locationName(i),
      status: ["Scheduled", "In Progress", "Completed"][i % 3],
    })
  );

  const editing = Array.from(
    { length: DEMO_COUNTS.editing },
    (_, i) => ({
      id: `demo-editing-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      editingStatus: ["Pending", "In Progress", "Completed"][i % 3],
      createdAt: demoDate(i),
    })
  );

  const albums = Array.from(
    { length: DEMO_COUNTS.albums },
    (_, i) => ({
      id: `demo-album-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      printingStatus: ["Pending", "In Progress", "Printed"][i % 3],
      createdAt: demoDate(i),
    })
  );

  const deliveries = Array.from(
    { length: DEMO_COUNTS.deliveries },
    (_, i) => ({
      id: `demo-delivery-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      item: [
        "Wedding Album", "Photo Album",
        "Edited Photos", "Wedding Video",
      ][i % 4],
      quantity: (i % 3) + 1,
      deliveryMethod: [
        "Studio Pickup", "Courier", "Home Delivery",
      ][i % 3],
      expectedDate: demoDate(i, true),
      deliveredDate: i % 4 === 0 ? demoDate(i) : "",
      createdAt: demoDate(i),
      paymentStatus: i % 3 === 0 ? "Paid" : "Partial",
      status: ["Pending", "Packed", "Dispatched", "Delivered"][i % 4],
    })
  );

  return {
    customers,
    enquiries,
    bookings,
    payments,
    photoshoots,
    editing,
    albums,
    deliveries,
  };
}

const DEMO_DATA = createDemoData();

/* =========================================
   HELPERS
========================================= */

function readArray(key) {
  try {
    const saved = localStorage.getItem(key);
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getAllData() {
  return Object.fromEntries(
    Object.entries(STORAGE).map(([name, key]) => {
      const actual = readArray(key);
      return [
        name,
        actual.length > 0 ? actual : DEMO_DATA[name],
      ];
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
  numberValue(
    item.totalAmount ??
      item.amount ??
      item.total ??
      item.grandTotal
  );

const getPaid = (item) =>
  numberValue(
    item.paidAmount ??
      item.amountPaid ??
      item.paid ??
      item.receivedAmount
  );

function paidValue(item) {
  const status = String(
    item.paymentStatus ?? item.status ?? ""
  ).toLowerCase();

  return ["paid", "completed"].includes(status)
    ? getPaid(item) || getAmount(item)
    : getPaid(item);
}

function parseDate(value) {
  if (!value) return null;

  const text = String(value);
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}/.test(text)
      ? `${text.slice(0, 10)}T00:00:00`
      : text
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  const date = parseDate(value);

  return date
    ? date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : String(value);
}

const bookingDate = (item) =>
  item.eventDate ||
  item.bookingDate ||
  item.date ||
  item.shootDate ||
  "";

/* =========================================
   THEME COLORS
========================================= */

const COLORS = {
  background: "#071426",
  panel: "#102139",
  card: "#132943",
  border: "#294361",
  heading: "#f8fafc",
  text: "#e2e8f0",
  muted: "#c0cee0",
  green: "#4adea5",
  blue: "#60a5fa",
};

const panelClass =
  "studio-panel min-w-0 rounded-2xl border border-[#294361] bg-[#102139] p-4 shadow-xl shadow-black/10 sm:p-6";

const sectionIconClass =
  "flex shrink-0 items-center justify-center rounded-xl border border-[#365678] bg-[#1c395b] p-3 text-[#93c5fd]";

/* =========================================
   ANIMATED NUMBER
========================================= */

function AnimatedNumber({
  value,
  currency = false,
  replay = 0,
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const target = Number(value) || 0;
    const duration = 1100;

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

  return currency ? money(display) : display.toLocaleString("en-IN");
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  index,
  replay,
}) {
  const currency = ["Amount Received", "Pending Balance"].includes(title);

  return (
    <div
      className="studio-card group relative min-w-0 overflow-hidden rounded-2xl border border-[#294361] bg-[#132943] p-4 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-[#527ba8] hover:shadow-xl sm:p-5"
      style={{ animationDelay: `${index * 65}ms` }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[#c0cee0] sm:text-sm">
            {title}
          </p>

          <h2 className="mt-3 truncate whitespace-nowrap text-lg font-extrabold text-white sm:text-xl xl:text-2xl">
            <AnimatedNumber
              value={value}
              currency={currency}
              replay={replay}
            />
          </h2>

          <p className="mt-2 text-[11px] font-medium leading-5 text-[#aebfd5]">
            {subtitle}
          </p>
        </div>

        <div className={`shrink-0 rounded-xl border p-3 ${color}`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#60a5fa] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

/* =========================================
   SECTION TITLE
========================================= */

function SectionTitle({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={sectionIconClass}>
        <Icon size={21} strokeWidth={2.4} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-extrabold text-white sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs font-medium text-[#c0cee0]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-[#365678] bg-[#132943] p-10 text-center text-sm text-[#c0cee0]">
      {message}
    </div>
  );
}

/* =========================================
   BAR CHART - NO AUTOMATIC SOUND
========================================= */

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
  const [selected, setSelected] = useState(null);

  return (
    <div className={panelClass}>
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="grid h-56 grid-cols-6 items-end gap-2 border-b border-[#294361] pb-3 sm:h-64 sm:gap-3">
        {data.map((item, index) => {
          const value = item[dataKey] || 0;
          const height = value
            ? Math.max(6, (value / Math.max(1, maxValue)) * 85)
            : 2;

          return (
            <div
              key={item.key}
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
            >
              <span className="w-full truncate text-center text-[9px] font-bold text-white sm:text-xs">
                {formatter ? formatter(value) : value}
              </span>

              <div
                key={`${replay}-${item.key}`}
                role="button"
                tabIndex={0}
                aria-label={`${item.label}: ${value}`}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(index);
                  }
                }}
                className={`studio-bar w-full max-w-14 origin-bottom cursor-pointer rounded-t-lg transition-[filter] hover:brightness-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#93c5fd] ${barColor} ${
                  selected === index ? "ring-2 ring-white/60" : ""
                }`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 100}ms`,
                }}
                title={`${item.label}: ${value}`}
              />

              <span className="text-[10px] font-semibold text-[#c0cee0] sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {selected !== null && data[selected] && (
        <p className="mt-3 text-center text-xs font-semibold text-[#c0cee0]">
          {data[selected].label}:{" "}
          <span className="text-white">
            {formatter
              ? formatter(data[selected][dataKey] || 0)
              : data[selected][dataKey] || 0}
          </span>
        </p>
      )}
    </div>
  );
}

/* =========================================
   SMOOTH LINE PATH
========================================= */

function makeSmoothPath(points) {
  if (!points.length) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const middleX = (current.x + next.x) / 2;

    path += ` C ${middleX} ${current.y}, ${middleX} ${next.y}, ${next.x} ${next.y}`;
  }

  return path;
}

/* =========================================
   REVENUE LINE CHART
========================================= */

function RevenueLineChart({ payments, replay }) {
  const [range, setRange] = useState("30");
  const [hoverIndex, setHoverIndex] = useState(null);

  const chartData = useMemo(() => {
    const days = range === "7" ? 7 : range === "30" ? 30 : 180;
    const bucketCount = range === "7" ? 7 : range === "30" ? 15 : 12;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = Array.from(
      { length: bucketCount },
      (_, index) => {
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
      }
    );

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

      if (bucket) bucket.value += paidValue(payment);
    });

    return buckets;
  }, [payments, range]);

  useEffect(() => {
    setHoverIndex(null);
  }, [range, replay]);

  const width = 760;
  const height = 270;
  const left = 60;
  const right = 20;
  const top = 20;
  const bottom = 42;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const maxValue = Math.max(1, ...chartData.map((item) => item.value));

  const niceMax =
    maxValue <= 100
      ? Math.ceil(maxValue / 10) * 10
      : Math.ceil(maxValue / 1000) * 1000;

  const points = chartData.map((item, index) => ({
    ...item,
    x:
      left +
      (index / Math.max(1, chartData.length - 1)) * plotWidth,
    y:
      top +
      plotHeight -
      (item.value / niceMax) * plotHeight,
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

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX =
      ((event.clientX - rect.left) / rect.width) * width;

    const index = Math.round(
      ((relativeX - left) / plotWidth) * (points.length - 1)
    );

    setHoverIndex(
      Math.max(0, Math.min(points.length - 1, index))
    );
  }

  return (
    <div className={`${panelClass} overflow-hidden`}>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className={sectionIconClass}>
              <ChartNoAxesCombined size={21} strokeWidth={2.4} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                Revenue by Channel
              </h3>

              <p className="mt-1 text-xs font-medium text-[#c0cee0]">
                Revenue trend from recorded payments
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="break-words text-2xl font-extrabold text-white">
              <AnimatedNumber
                value={total}
                currency
                replay={replay}
              />
            </p>

            <p className="mt-1 text-xs font-medium text-[#c0cee0]">
              Total received in selected period
            </p>
          </div>
        </div>

        <div className="flex w-fit max-w-full gap-1 rounded-xl border border-[#365678] bg-[#071426] p-1">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["180", "6 Months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs ${
                range === value
                  ? "bg-[#2563eb] text-white shadow-sm"
                  : "text-[#c0cee0] hover:bg-[#1c395b] hover:text-white"
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
          aria-label="Revenue trend line chart"
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={handleMove}
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
                stopColor="#4adea5"
                stopOpacity="0.32"
              />
              <stop
                offset="100%"
                stopColor="#4adea5"
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
                  stroke="#36506e"
                  strokeDasharray="4 5"
                />

                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#c0cee0"
                >
                  {value >= 1000
                    ? `${(value / 1000).toFixed(1)}k`
                    : Math.round(value)}
                </text>
              </g>
            );
          })}

          <path
            key={`area-${range}-${replay}`}
            d={areaPath}
            fill="url(#studioRevenueGradient)"
            className="studio-area-appear"
          />

          <path
            key={`line-${range}-${replay}`}
            d={linePath}
            fill="none"
            stroke="#4adea5"
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
              index %
                Math.max(1, Math.floor(points.length / 5)) ===
                0;

            return showLabel ? (
              <text
                key={point.key}
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fill="#c0cee0"
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
                stroke="#93c5fd"
                strokeDasharray="4 5"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="#4adea5"
                fillOpacity="0.25"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4"
                fill="#4adea5"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-[#365678] bg-[#071426] px-3 py-2 shadow-xl"
            style={{
              left: `${Math.max(
                15,
                Math.min(85, (activePoint.x / width) * 100)
              )}%`,
              top: `${Math.max(
                0,
                (activePoint.y / height) * 100 - 15
              )}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-[10px] text-[#c0cee0]">
              {activePoint.label}
            </p>

            <p className="mt-1 whitespace-nowrap text-xs font-extrabold text-white">
              {money(activePoint.value)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#4adea5]" />
        <span className="text-xs font-semibold text-[#c0cee0]">
          Studio Revenue
        </span>
      </div>
    </div>
  );
}

/* =========================================
   SALES GAUGE
========================================= */

function SalesGauge({ bookings, replay }) {
  const total = bookings.length;

  const completed = bookings.filter((item) =>
    ["completed", "complete", "delivered", "finished"].includes(
      String(
        item.status || item.bookingStatus || ""
      ).toLowerCase()
    )
  ).length;

  const confirmed = bookings.filter((item) =>
    ["confirmed", "booked", "approved"].includes(
      String(
        item.status || item.bookingStatus || ""
      ).toLowerCase()
    )
  ).length;

  const percentage = total
    ? Math.min(100, ((completed + confirmed) / total) * 100)
    : 0;

  const [animatedPercentage, setAnimatedPercentage] =
    useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedPercentage(percentage * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    setAnimatedPercentage(0);
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [percentage, replay]);

  const segments = 75;

  const arcPoints = Array.from(
    { length: segments },
    (_, index) => {
      const angle =
        Math.PI - (index / (segments - 1)) * Math.PI;

      const radius = 105;

      return {
        x: 160 + Math.cos(angle) * radius,
        y: 152 - Math.sin(angle) * radius,
        active:
          index / (segments - 1) <=
          animatedPercentage / 100,
      };
    }
  );

  return (
    <div className={`${panelClass} overflow-hidden`}>
      <div className="flex items-center gap-3">
        <div className={sectionIconClass}>
          <CircleGauge size={21} strokeWidth={2.4} />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-white">
            Sales Overview
          </h3>

          <p className="mt-1 text-xs font-medium text-[#c0cee0]">
            Confirmed and completed bookings
          </p>
        </div>
      </div>

      <div className="mx-auto mt-5 w-full max-w-[390px]">
        <svg
          viewBox="0 0 320 205"
          className="h-auto w-full"
          role="img"
          aria-label={`Booking conversion ${percentage.toFixed(1)} percent`}
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
                  point.active ? "#4adea5" : "#294361"
                }
                strokeWidth="19"
              />
            );
          })}

          <text
            x="160"
            y="129"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="32"
            fontWeight="800"
          >
            {animatedPercentage.toFixed(1)}%
          </text>

          <text
            x="160"
            y="150"
            textAnchor="middle"
            fill="#c0cee0"
            fontSize="11"
          >
            Booking progress
          </text>

          <text
            x="160"
            y="180"
            textAnchor="middle"
            fill="#c0cee0"
            fontSize="10"
          >
            Confirmed + Completed
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[#294361] pt-5">
        {[
          ["Total Bookings", total],
          ["Confirmed", confirmed],
          ["Completed", completed],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`min-w-0 text-center ${
              index === 1
                ? "border-x border-[#294361]"
                : ""
            }`}
          >
            <p className="text-[10px] font-semibold text-[#c0cee0] sm:text-xs">
              {label}
            </p>

            <p className="mt-2 text-lg font-extrabold text-white sm:text-xl">
              <AnimatedNumber value={value} replay={replay} />
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] font-medium text-[#aebfd5]">
        (Confirmed + Completed) / Total Bookings
      </p>
    </div>
  );
}

/* =========================================
   INFO ROW
========================================= */

function InfoRow({ label, value }) {
  return (
    <div className="min-w-0 border-b border-[#294361] pb-3 last:border-b-0 last:pb-0">
      <p className="sr-booking-label text-[11px] font-semibold text-[#c0cee0]">
        {label}
      </p>

      <p className="sr-booking-value mt-1 break-words text-sm font-bold text-white">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================================
   MAIN DASHBOARD
========================================= */

export default function Dashboard() {
  const [data, setData] = useState(getAllData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [replay, setReplay] = useState(0);

  const isDemo = Object.entries(STORAGE).some(
    ([name, key]) =>
      readArray(key).length === 0 &&
      DEMO_DATA[name].length > 0
  );

  function refresh() {
    setData(getAllData());
    setLastUpdated(new Date());
    setReplay((previous) => previous + 1);
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

  /* STATISTICS */

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

  /* UPCOMING BOOKINGS */

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

  /* RECENT ACTIVITIES */

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

    addItems(data.bookings, "Booking", CalendarDays, [
      "createdAt", "bookingDate", "eventDate",
    ]);

    addItems(data.payments, "Payment", Wallet, [
      "createdAt", "paymentDate", "date",
    ]);

    addItems(data.deliveries, "Delivery", Truck, [
      "createdAt", "deliveredDate", "expectedDate",
    ]);

    addItems(data.photoshoots, "Photo Shoot", Camera, [
      "createdAt", "shootDate",
    ]);

    addItems(data.editing, "Photo Editing", Images, [
      "createdAt", "date",
    ]);

    addItems(data.albums, "Album Project", BookOpen, [
      "createdAt", "date",
    ]);

    return activities
      .sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
      )
      .slice(0, 6);
  }, [data]);

  /* MONTHLY GRAPHS */

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
        (entry) =>
          String(date || "").slice(0, 7) === entry.key
      );

      if (month) month.bookings += 1;
    });

    data.payments.forEach((item) => {
      const date =
        item.paymentDate || item.createdAt || item.date;

      const month = months.find(
        (entry) =>
          String(date || "").slice(0, 7) === entry.key
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

  /* CARDS */

  const cards = [
    {
      title: "Total Customers",
      value: stats.customers,
      icon: Users,
      color: "border-blue-500/30 bg-blue-500/20 text-blue-300",
      subtitle: "Registered customers",
    },
    {
      title: "Total Enquiries",
      value: stats.enquiries,
      icon: MessageSquare,
      color: "border-indigo-500/30 bg-indigo-500/20 text-indigo-300",
      subtitle: "Customer enquiries",
    },
    {
      title: "Total Bookings",
      value: stats.bookings,
      icon: CalendarDays,
      color: "border-violet-500/30 bg-violet-500/20 text-violet-300",
      subtitle: "Studio bookings",
    },
    {
      title: "Amount Received",
      value: stats.paid,
      icon: IndianRupee,
      color: "border-green-500/30 bg-green-500/20 text-green-300",
      subtitle: "Recorded payments",
    },
    {
      title: "Pending Balance",
      value: stats.pending,
      icon: Wallet,
      color: "border-amber-500/30 bg-amber-500/20 text-amber-300",
      subtitle: "Outstanding amount",
    },
    {
      title: "Photo Shoots",
      value: stats.shoots,
      icon: Camera,
      color: "border-sky-500/30 bg-sky-500/20 text-sky-300",
      subtitle: "Recorded shoots",
    },
    {
      title: "Editing Pending",
      value: stats.editingPending,
      icon: Images,
      color: "border-orange-500/30 bg-orange-500/20 text-orange-300",
      subtitle: "Editing not completed",
    },
    {
      title: "Album Projects",
      value: stats.albumsPending,
      icon: BookOpen,
      color: "border-purple-500/30 bg-purple-500/20 text-purple-300",
      subtitle: "Not yet printed",
    },
    {
      title: "Pending Deliveries",
      value: stats.deliveriesPending,
      icon: Truck,
      color: "border-rose-500/30 bg-rose-500/20 text-rose-300",
      subtitle: "Awaiting delivery",
    },
  ];

  return (
    <div
      className="studio-dashboard min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#071426] px-3 py-5 text-[#e2e8f0] sm:px-6 lg:px-8 lg:py-8"
      style={{ colorScheme: "dark" }}
    >
      <style>{`
        @keyframes studioEnter {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        @keyframes studioRotate {
          from {
            transform: rotate(0);
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

        .studio-dashboard {
          background: #071426 !important;
          color: #e2e8f0 !important;
          color-scheme: dark;
        }

        .studio-dashboard .studio-card {
          animation: studioEnter .65s ease both;
          background-color: #132943 !important;
          border-color: #294361 !important;
        }

        .studio-dashboard .studio-panel {
          animation: studioEnter .8s ease both;
          background-color: #102139 !important;
          border-color: #294361 !important;
        }

        .studio-dashboard .studio-bar {
          animation: studioBar 1.1s ease both;
        }

        .studio-dashboard .studio-floating {
          animation: studioFloat 5s ease-in-out infinite;
        }

        .studio-dashboard .studio-refreshing {
          animation: studioRotate .7s ease;
        }

        .studio-dashboard .studio-line-draw {
          animation: studioLineDraw 2s ease both;
        }

        .studio-dashboard .studio-area-appear {
          animation: studioAreaAppear 1.5s ease both;
        }

        .studio-dashboard .studio-hero {
          background: linear-gradient(
            135deg,
            #091b36 0%,
            #143662 55%,
            #28548b 100%
          ) !important;
          color: #ffffff !important;
        }

        .studio-dashboard h1,
        .studio-dashboard h2,
        .studio-dashboard h3 {
          color: #ffffff !important;
        }

        .studio-dashboard .sr-booking-card {
          background-color: #172d49 !important;
          border-color: #36506e !important;
          color: #ffffff !important;
        }

        .studio-dashboard .sr-booking-label,
        .studio-dashboard .sr-activity-type {
          color: #c0cee0 !important;
        }

        .studio-dashboard .sr-booking-value,
        .studio-dashboard .sr-activity-name {
          color: #ffffff !important;
          font-weight: 700;
        }

        .studio-dashboard .sr-booking-divider {
          border-color: #36506e !important;
        }

        .studio-dashboard .studio-chart-label {
          fill: #c0cee0 !important;
        }

        .studio-dashboard svg:not([role="img"]) {
          opacity: 1;
        }

        .studio-dashboard button {
          cursor: pointer;
        }

        .studio-dashboard button:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          .studio-dashboard .studio-card,
          .studio-dashboard .studio-panel,
          .studio-dashboard .studio-bar,
          .studio-dashboard .studio-floating,
          .studio-dashboard .studio-refreshing,
          .studio-dashboard .studio-line-draw,
          .studio-dashboard .studio-area-appear {
            animation: none !important;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#93c5fd]">
            Studio Performance
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-xs font-medium text-[#c0cee0] sm:text-sm">
            Welcome to Studio Raw Picturez ERP &amp; CRM
          </p>

          <p className="mt-2 text-[11px] font-medium text-[#aebfd5]">
            Last refreshed:{" "}
            {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-[#365678] bg-[#132943] px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#1c395b] sm:text-sm"
        >
          <RefreshCw
            key={replay}
            size={17}
            className={
              replay > 0 ? "studio-refreshing" : ""
            }
          />
          Refresh Dashboard
        </button>
      </div>

      {/* DEMO MESSAGE */}

      {isDemo && (
        <div className="mb-5 rounded-xl border border-[#365678] bg-[#132943] px-4 py-3 text-xs font-semibold text-[#bfdbfe] sm:text-sm">
          Demo preview: 420 sample records are available
          across dashboard sections without saved records.
          Existing saved records remain unchanged.
        </div>
      )}

      {/* HERO */}

      <div className="studio-hero relative mb-6 overflow-hidden rounded-2xl border border-[#365678] p-5 text-white shadow-xl sm:p-8 lg:rounded-3xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="studio-floating absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border border-white/15" />
          <div className="absolute -right-10 -top-24 h-[300px] w-[300px] rounded-full border border-white/15" />
          <div className="absolute -right-32 bottom-[-170px] h-[350px] w-[350px] rounded-full bg-blue-300/10 blur-[70px]" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#bfdbfe] sm:text-sm">
              Studio Business Overview
            </p>

            <h2 className="mt-3 text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
              Manage Your Studio Smarter
            </h2>

            <p className="mt-3 max-w-2xl text-xs font-medium leading-6 text-[#e2e8f0] sm:text-sm">
              Track customers, bookings, payments,
              production and deliveries from one dashboard.
            </p>
          </div>

          <div className="studio-floating hidden rounded-2xl border border-white/20 bg-white/10 p-5 text-white sm:block">
            <Activity size={36} strokeWidth={2.3} />
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-1 gap-3 border-t border-white/20 pt-5 sm:grid-cols-3 sm:gap-4">
          {[
            ["Total Billed", stats.billed],
            ["Total Received", stats.paid],
            ["Pending Amount", stats.pending],
          ].map(([label, amount], index) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-white/15 bg-[#102b50]/80 p-4 backdrop-blur-sm"
              style={{
                animation: "studioEnter .65s ease both",
                animationDelay: `${index * 100}ms`,
              }}
            >
              <p className="text-xs font-semibold text-[#bfdbfe]">
                {label}
              </p>

              <p className="mt-3 truncate whitespace-nowrap text-lg font-extrabold text-white lg:text-xl xl:text-2xl">
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

      {/* STAT CARDS */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            index={index}
            replay={replay}
          />
        ))}
      </div>

      {/* REVENUE + SALES */}

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <RevenueLineChart
          payments={data.payments}
          replay={replay}
        />

        <SalesGauge
          bookings={data.bookings}
          replay={replay}
        />
      </div>

      {/* BOOKING + REVENUE GRAPHS */}

      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartPanel
          title="Booking Overview"
          subtitle="Last six months"
          icon={TrendingUp}
          data={monthlyChart}
          dataKey="bookings"
          maxValue={maxBookings}
          barColor="bg-[#3b82f6]"
          replay={replay}
        />

        <ChartPanel
          title="Revenue Overview"
          subtitle="Recorded receipts by month"
          icon={IndianRupee}
          data={monthlyChart}
          dataKey="revenue"
          maxValue={maxRevenue}
          barColor="bg-[#34d399]"
          replay={replay}
          formatter={(value) =>
            value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : value
          }
        />
      </div>

      {/* UPCOMING BOOKINGS + RECENT ACTIVITIES */}

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        {/* UPCOMING BOOKINGS */}

        <div className={panelClass}>
          <SectionTitle
            title="Upcoming Bookings"
            subtitle="Scheduled customer events"
            icon={CalendarDays}
          />

          {upcomingBookings.length === 0 ? (
            <EmptyState message="No upcoming bookings found" />
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingBookings.map((item, index) => (
                <div
                  key={item.id || index}
                  className="studio-card sr-booking-card rounded-xl border border-[#36506e] bg-[#172d49] p-4"
                >
                  <InfoRow
                    label="Customer"
                    value={
                      item.customer ||
                      item.customerName ||
                      item.name
                    }
                  />

                  <div className="mt-3">
                    <InfoRow
                      label="Event"
                      value={item.event || item.eventType}
                    />
                  </div>

                  <div className="mt-3">
                    <InfoRow
                      label="Event Date"
                      value={formatDate(bookingDate(item))}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ACTIVITIES */}

        <div className={panelClass}>
          <SectionTitle
            title="Recent Activities"
            subtitle="Latest studio workflow updates"
            icon={Activity}
          />

          {recentActivities.length === 0 ? (
            <EmptyState message="No recent activities available" />
          ) : (
            <div className="flex flex-col gap-3">
              {recentActivities.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="studio-card sr-booking-card rounded-xl border border-[#36506e] bg-[#172d49] p-4"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-xl border border-blue-400/20 bg-blue-500/20 p-3 text-[#93c5fd]">
                        <Icon size={20} strokeWidth={2.4} />
                      </div>

                      <div className="min-w-0">
                        <p className="sr-activity-name break-words text-sm font-bold text-white">
                          {item.name}
                        </p>

                        <p className="sr-activity-type mt-1 text-xs font-semibold text-[#c0cee0]">
                          {item.type}
                        </p>
                      </div>
                    </div>

                    <InfoRow
                      label="Date"
                      value={formatDate(item.date)}
                    />

                    <div className="mt-3">
                      <InfoRow
                        label="Status"
                        value={item.status}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}

      <p className="mt-8 text-center text-xs font-medium leading-5 text-[#aebfd5]">
        Studio Raw Picturez ERP &amp; CRM · Dashboard
        preview and browser-local records
      </p>
    </div>
  );
}
