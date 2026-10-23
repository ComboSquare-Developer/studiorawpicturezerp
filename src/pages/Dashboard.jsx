
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

/* =========================================
   DEMO DATA - 420 RECORDS
========================================= */

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
  "Kanyakumari", "Trivandrum", "Tirunelveli",
  "Madurai", "Coimbatore",
];

const customerName = (i) =>
  CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];

const eventName = (i) => EVENTS[i % EVENTS.length];

const locationName = (i) =>
  LOCATIONS[i % LOCATIONS.length];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function demoDate(index, future = false) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  const offset = future
    ? index % 60
    : -((index * 3) % 175);

  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

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
      stage: [
        "New", "Contacted", "Qualified", "Quoted",
        "Follow-up", "Won/Converted", "Lost",
      ][i % 7],
      status: [
        "New", "Contacted", "Qualified", "Quoted",
        "Follow-up", "Won/Converted", "Lost",
      ][i % 7],
      eventDate: demoDate(i, true),
      createdAt: demoDate(i),
    })
  );

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
      status: [
        "Confirmed", "Pending", "Completed",
        "Booked", "Cancelled",
      ][i % 5],
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
        paymentMethod: [
          "UPI", "Cash", "Bank Transfer", "Card",
        ][i % 4],
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
      status: [
        "Scheduled", "In Progress", "Completed",
      ][i % 3],
    })
  );

  const editing = Array.from(
    { length: DEMO_COUNTS.editing },
    (_, i) => ({
      id: `demo-editing-${i + 1}`,
      customer: customerName(i),
      customerName: customerName(i),
      event: eventName(i),
      editingStatus: [
        "Pending", "In Progress", "Completed",
      ][i % 3],
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
      printingStatus: [
        "Pending", "In Progress", "Printed",
      ][i % 3],
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
      status: [
        "Pending", "Packed", "Dispatched", "Delivered",
      ][i % 4],
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
   DATA HELPERS
========================================= */

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
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

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
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

  return currency
    ? money(display)
    : display.toLocaleString("en-IN");
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
  const currency = [
    "Amount Received",
    "Pending Balance",
  ].includes(title);

  return (
    <div
      className="studio-card sr-panel group relative min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
      style={{ animationDelay: `${index * 65}ms` }}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="sr-muted text-xs font-bold sm:text-sm">
            {title}
          </p>

          <h2 className="sr-text mt-3 truncate whitespace-nowrap text-lg font-extrabold sm:text-xl xl:text-2xl">
            <AnimatedNumber
              value={value}
              currency={currency}
              replay={replay}
            />
          </h2>

          <p className="sr-subtle mt-2 text-[11px] font-semibold leading-5">
            {subtitle}
          </p>
        </div>

        <div className={`sr-stat-icon shrink-0 rounded-xl p-3 ${color}`}>
          <Icon size={22} strokeWidth={2.7} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#244d8b] transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

/* =========================================
   SECTION TITLE
========================================= */

function SectionTitle({ title, subtitle, icon: Icon }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="sr-section-icon shrink-0 rounded-xl p-3">
        <Icon size={21} strokeWidth={2.7} />
      </div>

      <div className="min-w-0">
        <h2 className="sr-text text-base font-extrabold sm:text-lg">
          {title}
        </h2>

        <p className="sr-muted mt-1 text-xs font-semibold">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="sr-inset rounded-xl border border-dashed p-10 text-center text-sm font-semibold">
      {message}
    </div>
  );
}

/* =========================================
   BAR CHART
   NO SCROLL / HOVER SOUND
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
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    setSelectedIndex(null);
  }, [replay, dataKey]);

  return (
    <div className="studio-panel sr-panel min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6">
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="sr-chart-bottom grid h-56 grid-cols-6 items-end gap-2 border-b pb-3 sm:h-64 sm:gap-3">
        {data.map((item, index) => {
          const value = item[dataKey] || 0;

          const height = value
            ? Math.max(
                6,
                (value / Math.max(1, maxValue)) * 85
              )
            : 2;

          const selected = selectedIndex === index;

          return (
            <div
              key={item.key}
              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
            >
              <span className="sr-text w-full truncate text-center text-[9px] font-extrabold sm:text-xs">
                {formatter ? formatter(value) : value}
              </span>

              <button
                type="button"
                key={`${replay}-${item.key}`}
                onClick={() => setSelectedIndex(index)}
                title={`${item.label}: ${value}`}
                aria-label={`${item.label}: ${value}`}
                aria-pressed={selected}
                className={`studio-bar w-full max-w-14 origin-bottom rounded-t-lg transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${barColor} ${
                  selected ? "ring-2 ring-blue-400 ring-offset-2" : ""
                }`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />

              <span className="sr-muted text-[10px] font-bold sm:text-xs">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
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
    const days =
      range === "7" ? 7 : range === "30" ? 30 : 180;

    const bucketCount =
      range === "7" ? 7 : range === "30" ? 15 : 12;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = Array.from(
      { length: bucketCount },
      (_, index) => {
        const startOffset = Math.floor(
          (index * days) / bucketCount
        );

        const endOffset = Math.floor(
          ((index + 1) * days) / bucketCount
        );

        const start = new Date(today);
        start.setDate(
          today.getDate() - (days - 1) + startOffset
        );

        const end = new Date(today);
        end.setDate(
          today.getDate() - (days - 1) + endOffset - 1
        );

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

      if (bucket) {
        bucket.value += paidValue(payment);
      }
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

  const maxValue = Math.max(
    1,
    ...chartData.map((item) => item.value)
  );

  const niceMax =
    maxValue <= 100
      ? Math.ceil(maxValue / 10) * 10
      : Math.ceil(maxValue / 1000) * 1000;

  const points = chartData.map((item, index) => ({
    ...item,
    x:
      left +
      (index / Math.max(1, chartData.length - 1)) *
        plotWidth,
    y:
      top +
      plotHeight -
      (item.value / niceMax) * plotHeight,
  }));

  const linePath = makeSmoothPath(points);

  const areaPath = points.length
    ? `${linePath} L ${
        points[points.length - 1].x
      } ${top + plotHeight} L ${
        points[0].x
      } ${top + plotHeight} Z`
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
      ((relativeX - left) / plotWidth) *
        (points.length - 1)
    );

    setHoverIndex(
      Math.max(0, Math.min(points.length - 1, index))
    );
  }

  return (
    <div className="studio-panel sr-panel min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="sr-section-icon rounded-xl p-3">
              <ChartNoAxesCombined size={21} strokeWidth={2.7} />
            </div>

            <div>
              <h3 className="sr-text text-base font-extrabold">
                Revenue by Channel
              </h3>

              <p className="sr-muted mt-1 text-xs font-semibold">
                Revenue trend from recorded payments
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="sr-text break-words text-2xl font-extrabold">
              <AnimatedNumber
                value={total}
                currency
                replay={replay}
              />
            </p>

            <p className="sr-muted mt-1 text-xs font-semibold">
              Total received in selected period
            </p>
          </div>
        </div>

        <div className="sr-range-group flex w-fit max-w-full gap-1 rounded-xl p-1">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["180", "6 Months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`sr-range-button rounded-lg px-2.5 py-2 text-[10px] font-bold transition sm:px-3 sm:text-xs ${
                range === value ? "sr-range-active" : ""
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
                stopOpacity="0.3"
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
                  stroke="var(--sr-grid)"
                  strokeDasharray="4 5"
                />

                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fontWeight="700"
                  fill="var(--sr-muted)"
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
              index %
                Math.max(
                  1,
                  Math.floor(points.length / 5)
                ) === 0;

            return showLabel ? (
              <text
                key={point.key}
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill="var(--sr-muted)"
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
                stroke="var(--sr-muted)"
                strokeDasharray="4 5"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill="#319b7b"
                fillOpacity="0.2"
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
            className="sr-tooltip pointer-events-none absolute z-10 rounded-xl border px-3 py-2 shadow-xl"
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
            <p className="sr-muted text-[10px] font-bold">
              {activePoint.label}
            </p>

            <p className="sr-text mt-1 whitespace-nowrap text-xs font-extrabold">
              {money(activePoint.value)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#319b7b]" />
        <span className="sr-muted text-xs font-bold">
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
        Math.PI -
        (index / (segments - 1)) * Math.PI;

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
    <div className="studio-panel sr-panel min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="sr-section-icon rounded-xl p-3">
          <CircleGauge size={21} strokeWidth={2.7} />
        </div>

        <div>
          <h3 className="sr-text text-base font-extrabold">
            Sales Overview
          </h3>

          <p className="sr-muted mt-1 text-xs font-semibold">
            Confirmed and completed bookings
          </p>
        </div>
      </div>

      <div className="mx-auto mt-5 w-full max-w-[390px]">
        <svg
          viewBox="0 0 320 205"
          className="h-auto w-full"
          role="img"
          aria-label={`Booking conversion ${percentage.toFixed(
            1
          )} percent`}
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
                  point.active
                    ? "#4ba985"
                    : "var(--sr-gauge-track)"
                }
                strokeWidth="19"
              />
            );
          })}

          <text
            x="160"
            y="129"
            textAnchor="middle"
            fill="var(--sr-text)"
            fontSize="32"
            fontWeight="800"
          >
            {animatedPercentage.toFixed(1)}%
          </text>

          <text
            x="160"
            y="150"
            textAnchor="middle"
            fill="var(--sr-muted)"
            fontSize="11"
            fontWeight="700"
          >
            Booking progress
          </text>

          <text
            x="160"
            y="180"
            textAnchor="middle"
            fill="var(--sr-muted)"
            fontSize="10"
            fontWeight="700"
          >
            Confirmed + Completed
          </text>
        </svg>
      </div>

      <div className="sr-chart-top grid grid-cols-3 gap-2 border-t pt-5">
        {[
          ["Total Bookings", total],
          ["Confirmed", confirmed],
          ["Completed", completed],
        ].map(([label, value], index) => (
          <div
            key={label}
            className={`min-w-0 text-center ${
              index === 1 ? "sr-stat-divider border-x" : ""
            }`}
          >
            <p className="sr-muted text-[10px] font-bold sm:text-xs">
              {label}
            </p>

            <p className="sr-text mt-2 text-lg font-extrabold sm:text-xl">
              <AnimatedNumber
                value={value}
                replay={replay}
              />
            </p>
          </div>
        ))}
      </div>

      <p className="sr-muted mt-4 text-center text-[10px] font-semibold">
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
    <div className="sr-info-divider min-w-0 border-b pb-3 last:border-b-0 last:pb-0">
      <p className="sr-muted text-[11px] font-bold">
        {label}
      </p>

      <p className="sr-text mt-1 break-words text-sm font-extrabold">
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
    const months = Array.from(
      { length: 6 },
      (_, index) => {
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
      }
    );

    data.bookings.forEach((item) => {
      const date =
        item.bookingDate ||
        item.createdAt ||
        item.date;

      const month = months.find(
        (entry) =>
          String(date || "").slice(0, 7) === entry.key
      );

      if (month) month.bookings += 1;
    });

    data.payments.forEach((item) => {
      const date =
        item.paymentDate ||
        item.createdAt ||
        item.date;

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

  return (
    <div className="studio-dashboard min-h-screen w-full min-w-0 max-w-full overflow-x-hidden px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
      <style>{`
        /* ======================================
           LIGHT THEME - DARKER TEXT + ICONS
        ====================================== */

        .studio-dashboard {
          --sr-bg: #f5f7fb;
          --sr-panel: #ffffff;
          --sr-border: #d8e1ed;
          --sr-text: #071a36;
          --sr-muted: #263d5d;
          --sr-subtle: #3b5270;
          --sr-inset: #f1f5fb;
          --sr-grid: #d6e0ec;
          --sr-icon-bg: #e5edfa;
          --sr-icon: #10264d;
          --sr-gauge-track: #dce6e3;
          background-color: var(--sr-bg);
          color: var(--sr-text);
          color-scheme: light;
          transition: background-color .25s, color .25s;
        }

        /* ======================================
           DARK THEME - BRIGHT TEXT + ICONS
        ====================================== */

        html.dark .studio-dashboard,
        html[data-theme="dark"] .studio-dashboard,
        body.dark .studio-dashboard,
        [data-theme="dark"] .studio-dashboard {
          --sr-bg: #071426;
          --sr-panel: #122640;
          --sr-border: #29435f;
          --sr-text: #ffffff;
          --sr-muted: #e2eaf7;
          --sr-subtle: #c5d4e9;
          --sr-inset: #1a314d;
          --sr-grid: #37506d;
          --sr-icon-bg: #294563;
          --sr-icon: #ffffff;
          --sr-gauge-track: #35516a;
          color-scheme: dark;
        }

        .studio-dashboard .sr-panel {
          background-color: var(--sr-panel) !important;
          border-color: var(--sr-border) !important;
          color: var(--sr-text);
        }

        .studio-dashboard .sr-text {
          color: var(--sr-text) !important;
        }

        .studio-dashboard .sr-muted {
          color: var(--sr-muted) !important;
        }

        .studio-dashboard .sr-subtle {
          color: var(--sr-subtle) !important;
        }

        .studio-dashboard .sr-section-icon {
          background-color: var(--sr-icon-bg) !important;
          color: var(--sr-icon) !important;
        }

        .studio-dashboard .sr-section-icon svg {
          color: var(--sr-icon) !important;
          stroke-width: 2.7;
        }

        .studio-dashboard .sr-stat-icon svg {
          stroke-width: 2.7;
        }

        html[data-theme="dark"] .studio-dashboard .sr-stat-icon,
        html.dark .studio-dashboard .sr-stat-icon {
          background-color: var(--sr-icon-bg) !important;
          color: var(--sr-icon) !important;
        }

        .studio-dashboard .sr-inset {
          background-color: var(--sr-inset) !important;
          border-color: var(--sr-border) !important;
          color: var(--sr-muted) !important;
        }

        .studio-dashboard .sr-info-divider,
        .studio-dashboard .sr-chart-bottom,
        .studio-dashboard .sr-chart-top,
        .studio-dashboard .sr-stat-divider {
          border-color: var(--sr-border) !important;
        }

        .studio-dashboard .sr-range-group {
          background-color: var(--sr-inset);
        }

        .studio-dashboard .sr-range-button {
          color: var(--sr-muted);
        }

        .studio-dashboard .sr-range-button:hover {
          background-color: var(--sr-panel);
        }

        .studio-dashboard .sr-range-active,
        .studio-dashboard .sr-range-active:hover {
          background-color: #244d8b;
          color: #ffffff;
        }

        .studio-dashboard .sr-tooltip {
          background-color: var(--sr-panel);
          border-color: var(--sr-border);
        }

        .studio-dashboard .sr-refresh-button {
          background-color: var(--sr-panel) !important;
          border-color: var(--sr-border) !important;
          color: var(--sr-text) !important;
        }

        .studio-dashboard .sr-refresh-button:hover {
          background-color: var(--sr-inset) !important;
        }

        .studio-dashboard .sr-booking-card {
          background-color: var(--sr-inset) !important;
          border-color: var(--sr-border) !important;
          color: var(--sr-text) !important;
        }

        .studio-dashboard .sr-activity-icon {
          background-color: var(--sr-icon-bg) !important;
          color: var(--sr-icon) !important;
        }

        .studio-dashboard .sr-demo-banner {
          background-color: var(--sr-inset) !important;
          border-color: var(--sr-border) !important;
          color: var(--sr-text) !important;
        }

        .studio-dashboard .sr-hero {
          color: #ffffff !important;
        }

        .studio-dashboard .sr-hero h2,
        .studio-dashboard .sr-hero .sr-hero-number {
          color: #ffffff !important;
        }

        /* ======================================
           ANIMATIONS
        ====================================== */

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

        .studio-card {
          animation: studioEnter .65s ease both;
        }

        .studio-panel {
          animation: studioEnter .8s ease both;
        }

        .studio-bar {
          animation: studioBar 1.1s ease both;
        }

        .studio-floating {
          animation: studioFloat 5s ease-in-out infinite;
        }

        .studio-refreshing {
          animation: studioRotate .7s ease;
        }

        .studio-line-draw {
          animation: studioLineDraw 2s ease both;
        }

        .studio-area-appear {
          animation: studioAreaAppear 1.5s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .studio-card,
          .studio-panel,
          .studio-bar,
          .studio-floating,
          .studio-refreshing,
          .studio-line-draw,
          .studio-area-appear {
            animation: none !important;
          }
        }
      `}</style>

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
            Studio Performance
          </p>

          <h1 className="sr-text text-2xl font-extrabold tracking-tight sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="sr-muted mt-2 text-xs font-semibold sm:text-sm">
            Welcome to Studio Raw Picturez ERP &amp; CRM
          </p>

          <p className="sr-subtle mt-2 text-[11px] font-semibold">
            Last refreshed:{" "}
            {lastUpdated.toLocaleTimeString("en-IN")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={refresh}
            className="sr-refresh-button flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold shadow-sm transition sm:text-sm"
          >
            <RefreshCw
              key={replay}
              size={18}
              strokeWidth={2.7}
              className={
                replay > 0 ? "studio-refreshing" : ""
              }
            />
            Refresh Dashboard
          </button>
        </div>
      </div>

      {/* DEMO MESSAGE */}

      {isDemo && (
        <div className="sr-demo-banner mb-5 rounded-xl border px-4 py-3 text-xs font-bold sm:text-sm">
          Demo preview: 420 sample records are available
          across dashboard sections without saved records.
          Existing saved records remain unchanged.
        </div>
      )}

      {/* HERO */}

      <div className="studio-panel sr-hero relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[#091b36] via-[#143662] to-[#28548b] p-5 text-white shadow-lg sm:p-8 lg:rounded-3xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="studio-floating absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-24 h-[300px] w-[300px] rounded-full border border-white/10" />
          <div className="absolute -right-32 bottom-[-170px] h-[350px] w-[350px] rounded-full bg-blue-300/10 blur-[70px]" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-blue-200 sm:text-sm">
              Studio Business Overview
            </p>

            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl lg:text-3xl">
              Manage Your Studio Smarter
            </h2>

            <p className="mt-3 max-w-2xl text-xs leading-6 text-blue-100/80 sm:text-sm">
              Track customers, bookings, payments,
              production and deliveries from one dashboard.
            </p>
          </div>

          <div className="studio-floating hidden rounded-2xl border border-white/15 bg-white/10 p-5 sm:block">
            <Activity size={36} strokeWidth={2.5} />
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
              className="studio-card min-w-0 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <p className="text-xs font-semibold text-blue-200">
                {label}
              </p>

              <p className="sr-hero-number mt-3 truncate whitespace-nowrap text-lg font-extrabold lg:text-xl xl:text-2xl">
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
          barColor="bg-[#244d8b]"
          replay={replay}
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

        <div className="studio-panel sr-panel min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6">
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
                  className="studio-card sr-booking-card rounded-xl border p-4"
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

        <div className="studio-panel sr-panel min-w-0 rounded-2xl border p-4 shadow-sm sm:p-6">
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
                    className="studio-card sr-booking-card rounded-xl border p-4"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="sr-activity-icon rounded-xl p-3">
                        <Icon size={20} strokeWidth={2.7} />
                      </div>

                      <div className="min-w-0">
                        <p className="sr-text break-words text-sm font-extrabold">
                          {item.name}
                        </p>

                        <p className="sr-muted mt-1 text-xs font-semibold">
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

      <p className="sr-muted mt-8 text-center text-xs font-semibold leading-5">
        Studio Raw Picturez ERP &amp; CRM · Dashboard
        preview and browser-local records
      </p>
    </div>
  );
}
