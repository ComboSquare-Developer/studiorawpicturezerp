
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
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock3,
} from "lucide-react";

/* ==========================================
   STORAGE
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

/* ==========================================
   DEMO DATA
========================================== */

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

const eventName = (i) =>
  EVENTS[i % EVENTS.length];

const locationName = (i) =>
  LOCATIONS[i % LOCATIONS.length];

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
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
    (_, i) => {
      const stage = [
        "New", "Contacted", "Qualified", "Quoted",
        "Follow-up", "Won/Converted", "Lost",
      ][i % 7];

      return {
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
        stage,
        status: stage,
        eventDate: demoDate(i, true),
        createdAt: demoDate(i),
      };
    }
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

/* ==========================================
   DATA HELPERS
========================================== */

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
    item.advance ??
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

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value);

  const date = /^\d{4}-\d{2}-\d{2}/.test(raw)
    ? new Date(`${raw.slice(0, 10)}T00:00:00`)
    : new Date(raw);

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

/* ==========================================
   DATE-WISE PAYMENT RECEIPTS
========================================== */

function paymentReceipts(payment) {
  if (Array.isArray(payment.transactions)) {
    return payment.transactions
      .map((transaction) => ({
        date:
          transaction.date ||
          payment.paymentDate ||
          payment.date ||
          payment.createdAt,
        amount: numberValue(transaction.amount),
      }))
      .filter((receipt) => receipt.amount > 0);
  }

  const amount = paidValue(payment);

  return amount > 0
    ? [{
        date:
          payment.paymentDate ||
          payment.createdAt ||
          payment.date,
        amount,
      }]
    : [];
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
    let frame;
    const start = performance.now();
    const target = Number(value) || 0;
    const duration = 1400;

    function animate(now) {
      const progress = Math.min((now - start) / duration, 1);
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
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    observer.observe(element);
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
   PREMIUM STAT CARD
========================================== */

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

  const themes = {
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

  const theme = themes[title] || themes["Total Customers"];

  return (
    <div
      className="group relative h-full min-w-0 overflow-hidden rounded-[26px] border p-5 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{
        background: `linear-gradient(145deg, #ffffff 0%, ${theme.bg} 100%)`,
        borderColor: theme.border,
        boxShadow: `0 10px 30px ${theme.accent}12`,
        animationDelay: `${index * 75}ms`,
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
              currency={currency}
              replay={replay}
            />
          </h2>

          <p className="mt-2 text-[11px] font-semibold leading-5 text-slate-500">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
          style={{
            backgroundColor: theme.iconBg,
            color: theme.accent,
            boxShadow: `0 8px 20px ${theme.accent}18`,
          }}
        >
          <Icon size={24} strokeWidth={2.4} />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 h-[4px] w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
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
  accent = "blue",
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
          accent === "green"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-[#eaf1fb] text-[#173d77]"
        }`}
      >
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
   PREMIUM ANIMATED BAR CHART
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
  const [animationKey, setAnimationKey] = useState(0);
  const chartRef = useRef(null);
  const wasVisible = useRef(false);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setAnimationKey((prev) => prev + 1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisible.current) {
          wasVisible.current = true;
          setAnimationKey((prev) => prev + 1);
        }

        if (!entry.isIntersecting) {
          wasVisible.current = false;
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSelectedIndex(null);
  }, [replay, dataKey]);

  return (
    <div
      ref={chartRef}
      className="sr-premium-card relative min-w-0 overflow-hidden rounded-[28px] border border-[#e0e9f4] bg-white p-4 shadow-[0_12px_40px_rgba(16,38,77,0.045)] sm:p-6"
    >
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="relative grid h-64 grid-cols-6 items-end gap-2 border-b border-[#e3eaf3] pb-4 sm:h-72 sm:gap-4">
        <div className="pointer-events-none absolute inset-x-0 bottom-12 top-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
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

          const selected = selectedIndex === index;

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
                key={`${replay}-${animationKey}-${item.key}`}
                onClick={() => setSelectedIndex(index)}
                aria-label={`${item.label}: ${value}`}
                aria-pressed={selected}
                title={`${item.label}: ${value}`}
                className={`sr-premium-bar group relative w-full max-w-16 origin-bottom overflow-hidden rounded-t-xl transition-all duration-300 hover:brightness-110 ${
                  selected
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
   SMOOTH LINE PATH
========================================== */

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

/* ==========================================
   REVENUE LINE CHART
========================================== */

function RevenueLineChart({
  payments = [],
  replay = 0,
}) {
  const [range, setRange] = useState("30");
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(() => {
    const days =
      range === "7" ? 7 : range === "30" ? 30 : 180;

    const count =
      range === "7" ? 7 : range === "30" ? 15 : 12;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = Array.from(
      { length: count },
      (_, i) => {
        const startOffset = Math.floor(
          (i * days) / count
        );

        const endOffset = Math.floor(
          ((i + 1) * days) / count
        );

        const start = new Date(today);
        start.setDate(
          today.getDate() - days + 1 + startOffset
        );

        const end = new Date(today);
        end.setDate(
          today.getDate() - days + endOffset
        );

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
      paymentReceipts(payment).forEach((receipt) => {
        const date = parseDate(receipt.date);
        if (!date) return;

        const bucket = buckets.find(
          (item) => date >= item.start && date <= item.end
        );

        if (bucket) {
          bucket.value += receipt.amount;
        }
      });
    });

    return buckets;
  }, [payments, range]);

  useEffect(() => {
    setActiveIndex(null);
  }, [range, replay]);

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
    activeIndex !== null ? points[activeIndex] : null;

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) *
      width;

    const index = Math.round(
      ((x - left) / plotWidth) *
        (points.length - 1)
    );

    setActiveIndex(
      Math.max(0, Math.min(points.length - 1, index))
    );
  }

  return (
    <div className="sr-premium-card relative h-full min-w-0 overflow-hidden rounded-[28px] border border-[#dce7f4] bg-white p-4 shadow-[0_18px_55px_rgba(17,44,82,0.07)] sm:p-6">
      <div className="sr-graph-shine pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white shadow-lg shadow-emerald-500/20">
            <ChartNoAxesCombined size={23} />
          </div>

          <div>
            <h3 className="text-base font-black text-[#10264d] sm:text-lg">
              Revenue Analytics
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-500">
              Animated payment insights
            </p>
          </div>
        </div>

        <div className="flex w-fit max-w-full gap-1 rounded-xl bg-[#f0f5fb] p-1">
          {[
            ["7", "7 Days"],
            ["30", "30 Days"],
            ["180", "6 Months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-lg px-2.5 py-2 text-[10px] font-bold transition-all duration-300 sm:px-3 sm:text-[11px] ${
                range === value
                  ? "bg-[#10264d] text-white shadow-md"
                  : "text-slate-500 hover:bg-white hover:text-[#10264d]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            Total Revenue
          </p>

          <h2 className="mt-1 break-words text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            <AnimatedNumber
              value={total}
              currency
              replay={replay}
            />
          </h2>
        </div>

        <span className="mb-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700">
          ● Recorded Payments
        </span>
      </div>

      <div className="relative z-10 mt-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-auto w-full touch-pan-y overflow-visible"
          onMouseMove={handleMove}
          onMouseLeave={() => setActiveIndex(null)}
          role="img"
          aria-label="Animated revenue chart"
        >
          <defs>
            <linearGradient
              id="srPremiumRevenueArea"
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
                offset="55%"
                stopColor="#34d399"
                stopOpacity="0.1"
              />
              <stop
                offset="100%"
                stopColor="#10b981"
                stopOpacity="0"
              />
            </linearGradient>

            <linearGradient
              id="srPremiumRevenueStroke"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>

            <filter
              id="srPremiumLineGlow"
              x="-30%"
              y="-100%"
              width="160%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
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
            fill="url(#srPremiumRevenueArea)"
            className="sr-premium-area"
          />

          <path
            key={`glow-${range}-${replay}`}
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeOpacity="0.25"
            filter="url(#srPremiumLineGlow)"
            pathLength="100"
            className="sr-premium-line"
          />

          <path
            key={`line-${range}-${replay}`}
            d={linePath}
            fill="none"
            stroke="url(#srPremiumRevenueStroke)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            className="sr-premium-line"
          />

          {points.map((point, index) => (
            <g key={`${range}-${replay}-${point.key}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="white"
                stroke="#059669"
                strokeWidth="2.5"
                className="sr-premium-dot"
                style={{
                  animationDelay: `${index * 110 + 500}ms`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              />

              {index %
                Math.max(
                  1,
                  Math.floor(points.length / 5)
                ) ===
                0 ||
              index === points.length - 1 ? (
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
              ) : null}
            </g>
          ))}

          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1={top}
                y2={top + plotHeight}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeOpacity="0.7"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="12"
                fill="#10b981"
                fillOpacity="0.16"
              />

              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="6"
                fill="#059669"
                stroke="white"
                strokeWidth="3"
              />
            </g>
          )}
        </svg>

        {activePoint && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-xl"
            style={{
              left: `${Math.max(
                15,
                Math.min(
                  85,
                  (activePoint.x / width) * 100
                )
              )}%`,
              top: `${Math.max(
                0,
                (activePoint.y / height) * 100 - 12
              )}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-[11px] font-bold text-slate-500">
              {activePoint.label}
            </p>

            <p className="mt-1 text-sm font-black text-emerald-700">
              {money(activePoint.value)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="sr-live-dot h-2.5 w-2.5 rounded-full bg-emerald-500" />

        <span className="text-xs font-bold text-slate-500">
          Studio Revenue Performance
        </span>
      </div>
    </div>
  );
}

/* ==========================================
   PREMIUM SALES GAUGE
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
    ].includes(
      String(
        item.status || item.bookingStatus || ""
      ).toLowerCase()
    )
  ).length;

  const confirmed = bookings.filter((item) =>
    [
      "confirmed",
      "booked",
      "approved",
    ].includes(
      String(
        item.status || item.bookingStatus || ""
      ).toLowerCase()
    )
  ).length;

  const percentage = total
    ? Math.min(
        100,
        ((completed + confirmed) / total) * 100
      )
    : 0;

  const [animatedPercentage, setAnimatedPercentage] =
    useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();

    function animate(now) {
      const progress = Math.min(
        (now - start) / 1900,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 4);

      setAnimatedPercentage(percentage * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    setAnimatedPercentage(0);
    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [percentage, replay]);

  const radius = 112;
  const circumference = Math.PI * radius;

  const progressLength =
    (animatedPercentage / 100) * circumference;

  return (
    <div className="sr-premium-card relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border border-[#dce7f4] bg-white p-4 shadow-[0_18px_55px_rgba(17,44,82,0.07)] sm:p-6">
      <div className="sr-graph-shine pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-800 text-white shadow-lg shadow-blue-500/20">
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

      <div className="relative z-10 mx-auto mt-6 w-full max-w-[390px]">
        <div className="sr-gauge-glow pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/25 blur-3xl" />

        <svg
          viewBox="0 0 340 240"
          className="relative h-auto w-full overflow-visible"
          role="img"
          aria-label={`Sales performance ${percentage.toFixed(1)} percent`}
        >
          <defs>
            <linearGradient
              id="srPremiumGaugeGradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <filter
              id="srPremiumGaugeGlow"
              x="-50%"
              y="-100%"
              width="200%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <g className="sr-gauge-floating">
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
              stroke="#6366f1"
              strokeWidth="30"
              strokeOpacity="0.28"
              strokeLinecap="round"
              strokeDasharray={`${progressLength} ${circumference}`}
              filter="url(#srPremiumGaugeGlow)"
            />

            <path
              d="M 58 174 A 112 112 0 0 1 282 174"
              fill="none"
              stroke="url(#srPremiumGaugeGradient)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeDasharray={`${progressLength} ${circumference}`}
              className="sr-gauge-progress"
            />
          </g>

          <text
            x="170"
            y="140"
            textAnchor="middle"
            fill="#10264d"
            fontSize="43"
            fontWeight="900"
          >
            {animatedPercentage.toFixed(1)}%
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
            fontWeight="700"
          >
            0%
          </text>

          <text
            x="282"
            y="205"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="700"
          >
            100%
          </text>
        </svg>
      </div>

      <div className="relative z-10 mt-auto grid grid-cols-3 gap-2 border-t border-[#e6edf5] pt-5">
        {[
          ["Total", total, "text-[#10264d]"],
          ["Confirmed", confirmed, "text-blue-600"],
          ["Completed", completed, "text-emerald-600"],
        ].map(([label, value, color], index) => (
          <div
            key={label}
            className={`sr-gauge-stat min-w-0 text-center ${
              index === 1
                ? "border-x border-[#e6edf5]"
                : ""
            }`}
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            <p className="text-[11px] font-bold text-slate-500">
              {label}
            </p>

            <p className={`mt-2 text-xl font-black sm:text-2xl ${color}`}>
              <AnimatedNumber
                value={value}
                replay={replay}
              />
            </p>
          </div>
        ))}
      </div>

      <p className="relative z-10 mt-5 text-center text-[11px] font-medium text-slate-400">
        Confirmed + Completed / Total Bookings
      </p>
    </div>
  );
}

/* ==========================================
   SCROLL ANIMATED CHARTS
========================================== */

function ScrollAnimatedCharts({
  payments,
  bookings,
  replay,
}) {
  const sectionRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);
  const wasVisible = useRef(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setAnimationKey((previous) => previous + 1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisible.current) {
          wasVisible.current = true;
          setAnimationKey((previous) => previous + 1);
        }

        if (!entry.isIntersecting) {
          wasVisible.current = false;
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mb-7 grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]"
    >
      <div
        key={`revenue-${animationKey}`}
        className="sr-chart-reveal min-w-0"
      >
        <RevenueLineChart
          payments={payments}
          replay={replay + animationKey}
        />
      </div>

      <div
        key={`sales-${animationKey}`}
        className="sr-chart-reveal min-w-0"
        style={{ animationDelay: "160ms" }}
      >
        <SalesGauge
          bookings={bookings}
          replay={replay + animationKey}
        />
      </div>
    </div>
  );
}

/* ==========================================
   PREMIUM TIMELINE PANEL
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
      <section className="sr-timeline-panel relative flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border border-[#dce6f4] bg-white shadow-[0_18px_60px_rgba(16,38,77,0.09)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(16,38,77,0.15)]">
        <div className="sr-timeline-header relative overflow-hidden bg-gradient-to-br from-[#071a38] via-[#102f62] to-[#1e5798] px-5 py-6 sm:px-7 sm:py-7">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full bg-blue-400/20 blur-[65px]" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-cyan-300/10 blur-[55px]" />
          <div className="pointer-events-none absolute right-8 top-5 h-24 w-24 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-12 top-9 h-16 w-16 rounded-full border border-white/10" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_25px_rgba(147,197,253,0.2)] backdrop-blur-md">
                <HeaderIcon
                  size={25}
                  strokeWidth={2}
                  className="text-white"
                />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 animate-pulse rounded-full ${
                      isBooking
                        ? "bg-cyan-300"
                        : "bg-emerald-300"
                    }`}
                  />

                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                    {eyebrow}
                  </span>
                </div>

                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  {title}
                </h3>

                <p className="mt-1 text-xs font-medium text-blue-100/80">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-3 text-sm font-black text-white backdrop-blur-md">
              {String(items.length).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="relative flex-1 p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e3f1] bg-[#f8faff] px-4 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf1fb] text-[#174b91]">
                <HeaderIcon size={29} />
              </div>

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

                const name = isBooking
                  ? item.customer ||
                    item.customerName ||
                    item.name ||
                    "Unknown Customer"
                  : item.name || "Studio Update";

                const event = item.event ||
                  item.eventType ||
                  "Studio Event";

                const date = isBooking
                  ? bookingDate(item)
                  : item.date;

                const status = String(
                  item.status || "Updated"
                );

                const statusLower = status.toLowerCase();

                const isCompleted =
                  statusLower.includes("complete") ||
                  statusLower.includes("paid") ||
                  statusLower.includes("deliver") ||
                  statusLower.includes("confirm");

                const isPending =
                  statusLower.includes("pending") ||
                  statusLower.includes("progress") ||
                  statusLower.includes("wait");

                const statusClass = isCompleted
                  ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                  : isPending
                  ? "border-amber-100 bg-amber-50 text-amber-700"
                  : "border-blue-100 bg-blue-50 text-blue-700";

                return (
                  <div
                    key={item.id || index}
                    className="sr-timeline-item group relative flex min-w-0 gap-3 sm:gap-4"
                  >
                    <div className="sr-timeline-icon relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-[#174b91] to-[#102f62] text-white shadow-[0_5px_15px_rgba(16,47,98,0.25)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 sm:h-14 sm:w-14">
                      <Icon size={20} strokeWidth={2.3} />
                    </div>

                    <div className="sr-timeline-item-card relative min-w-0 flex-1 overflow-hidden rounded-[22px] border border-[#e1eaf5] bg-gradient-to-br from-white via-[#fbfdff] to-[#f0f5fd] p-4 shadow-[0_6px_22px_rgba(16,38,77,0.035)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#b8d0ee] group-hover:shadow-[0_14px_35px_rgba(16,38,77,0.12)] sm:p-5">
                      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-[#1d5fa8] via-[#75a8e6] to-transparent" />

                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8095b1]">
                            {isBooking
                              ? `Booking ${String(index + 1).padStart(2, "0")}`
                              : item.type || "Studio Activity"}
                          </p>

                          <h4 className="break-words text-base font-black text-[#10264d] sm:text-lg">
                            {name}
                          </h4>
                        </div>

                        {isBooking ? (
                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-100 bg-[#eaf3ff] px-3 py-1.5 text-[10px] font-extrabold text-[#1d5b9e]">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                            Upcoming
                          </span>
                        ) : (
                          <ArrowUpRight
                            size={19}
                            className="shrink-0 text-[#9caec5] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#1c65ae]"
                          />
                        )}
                      </div>

                      <div className="my-4 h-px bg-gradient-to-r from-[#d8e4f3] to-transparent" />

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sr-detail-box rounded-xl border border-[#e7edf6] bg-white/80 p-3">
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8a9ab0]">
                            {isBooking
                              ? "Event Type"
                              : "Activity Date"}
                          </p>

                          {isBooking ? (
                            <p className="break-words text-sm font-bold text-[#173d72]">
                              {event}
                            </p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="shrink-0 text-[#2b69b3]"
                              />
                              <p className="text-sm font-bold text-[#173d72]">
                                {formatDate(date)}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="sr-detail-box rounded-xl border border-[#e7edf6] bg-white/80 p-3">
                          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8a9ab0]">
                            {isBooking
                              ? "Event Date"
                              : "Current Status"}
                          </p>

                          {isBooking ? (
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="shrink-0 text-[#2b69b3]"
                              />
                              <p className="text-sm font-bold text-[#173d72]">
                                {formatDate(date)}
                              </p>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold ${statusClass}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#e9eff7] bg-[#fafcff] px-5 py-4 sm:px-7">
          <span className="text-xs font-semibold text-[#8293a9]">
            {isBooking
              ? "Event scheduling overview"
              : "Studio workflow timeline"}
          </span>

          <div className="flex items-center gap-2 text-xs font-bold text-[#174b91]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {isBooking ? "Updated" : "Live Updates"}
          </div>
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
    window.addEventListener("studioraw:data-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
      window.removeEventListener("studioraw:data-updated", handleUpdate);
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

    addItems(
      data.bookings,
      "Booking",
      CalendarDays,
      ["createdAt", "bookingDate", "eventDate"]
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
      ["createdAt", "deliveredDate", "expectedDate"]
    );

    addItems(
      data.photoshoots,
      "Photo Shoot",
      Camera,
      ["createdAt", "shootDate"]
    );

    addItems(
      data.editing,
      "Photo Editing",
      Images,
      ["createdAt", "date"]
    );

    addItems(
      data.albums,
      "Album Project",
      BookOpen,
      ["createdAt", "date"]
    );

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

      if (month) {
        month.bookings += 1;
      }
    });

    data.payments.forEach((payment) => {
      paymentReceipts(payment).forEach((receipt) => {
        const date = parseDate(receipt.date);
        if (!date) return;

        const key = dateKey(date).slice(0, 7);
        const month = months.find(
          (entry) => entry.key === key
        );

        if (month) {
          month.revenue += receipt.amount;
        }
      });
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
    <div className="sr-dashboard-premium min-h-screen w-full min-w-0 max-w-full overflow-x-hidden px-3 py-5 text-[#10264d] sm:px-6 lg:px-8 lg:py-8">
      {/* ==========================================
          ALL PREMIUM CSS INCLUDED
      ========================================== */}

      <style>{`
        .sr-dashboard-premium {
          --sr-navy: #081a35;
          --sr-deep: #102c56;
          --sr-blue: #2563eb;
          --sr-cyan: #38bdf8;
          --sr-gold: #d7ad67;

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

        @keyframes srEnter {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes srFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes srRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes srChartReveal {
          from {
            opacity: 0;
            transform: translateY(45px) scale(.96);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
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

        @keyframes srAreaAppear {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes srDotPop {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          65% {
            opacity: 1;
            transform: scale(1.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
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
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(150%);
          }
        }

        @keyframes srPulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16,185,129,.3);
          }
          50% {
            opacity: .7;
            box-shadow: 0 0 0 7px rgba(16,185,129,0);
          }
        }

        @keyframes srGaugeGlow {
          0%, 100% {
            opacity: .4;
          }
          50% {
            opacity: .85;
          }
        }

        @keyframes srGradientMove {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes srGaugeFloating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes srGaugeGlowPulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .75;
          }
        }

        @keyframes srLuxuryShine {
          0% {
            background-position: 150% 0;
          }
          100% {
            background-position: -150% 0;
          }
        }

        /* PREMIUM CARDS */

        .sr-dashboard-premium .sr-premium-card {
          position: relative;
          isolation: isolate;

          background:
            linear-gradient(
              150deg,
              rgba(255,255,255,1),
              rgba(249,252,255,.98)
            ) !important;

          border:
            1px solid rgba(181,201,226,.55) !important;

          box-shadow:
            0 3px 8px rgba(16,38,77,.025),
            0 16px 45px rgba(16,38,77,.055),
            inset 0 1px 0 rgba(255,255,255,.95) !important;

          transition:
            transform .5s cubic-bezier(.22,1,.36,1),
            box-shadow .5s ease,
            border-color .5s ease;
        }

        .sr-dashboard-premium .sr-premium-card:hover {
          transform: translateY(-7px);
          border-color: rgba(80,138,211,.5) !important;

          box-shadow:
            0 12px 25px rgba(16,38,77,.06),
            0 28px 65px rgba(16,38,77,.12) !important;
        }

        .sr-stat-card {
          animation: srEnter .7s ease both;
        }

        .sr-stat-card h2 {
          letter-spacing: -.035em;
        }

        .sr-stat-card:hover h2 {
          color: #164d96;
        }

        .sr-stat-card .rounded-2xl {
          transition:
            transform .4s ease,
            box-shadow .4s ease;
        }

        .sr-stat-card:hover .rounded-2xl {
          box-shadow:
            0 8px 20px rgba(25,76,143,.1);
        }

        /* PREMIUM HERO */

        .sr-dashboard-premium .sr-gradient-animated {
          position: relative;

          background:
            radial-gradient(
              circle at 86% 12%,
              rgba(75,150,255,.28),
              transparent 32%
            ),
            radial-gradient(
              circle at 15% 90%,
              rgba(56,189,248,.12),
              transparent 35%
            ),
            linear-gradient(
              125deg,
              #05132c 0%,
              #0b2650 32%,
              #173f79 68%,
              #275d9f 100%
            ) !important;

          border:
            1px solid rgba(136,190,255,.2);

          box-shadow:
            0 15px 30px rgba(8,26,53,.12),
            0 30px 75px rgba(8,26,53,.22) !important;
        }

        .sr-dashboard-premium
        .sr-gradient-animated::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;

          background:
            linear-gradient(
              110deg,
              transparent 20%,
              rgba(255,255,255,.045) 48%,
              transparent 75%
            );

          background-size: 200% 100%;
          animation: srLuxuryShine 9s linear infinite;
        }

        .sr-gradient-animated h2 {
          color: #fff !important;
          text-shadow:
            0 3px 18px rgba(0,0,0,.12);
        }

        .sr-gradient-animated .sr-hero-stat {
          background: rgba(255,255,255,.095);
          border: 1px solid rgba(255,255,255,.15);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.08);
          backdrop-filter: blur(18px);
        }

        .sr-gradient-animated .sr-hero-stat:hover {
          background: rgba(255,255,255,.16);
          border-color: rgba(255,255,255,.3);
        }

        /* GRAPHS */

        .sr-graph-shine {
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(37,99,235,.08),
              transparent 38%
            ),
            linear-gradient(
              135deg,
              rgba(255,255,255,.4),
              transparent 55%
            );
        }

        .sr-premium-line {
          stroke-dasharray: 0 100;
          animation:
            srLineDraw 2.4s
            cubic-bezier(.22,1,.36,1) forwards;
        }

        .sr-premium-area {
          animation:
            srAreaAppear 2s ease both;
        }

        .sr-premium-dot {
          opacity: 0;
          animation:
            srDotPop .55s
            cubic-bezier(.2,1.5,.4,1) forwards;
          filter:
            drop-shadow(
              0 2px 4px rgba(5,150,105,.2)
            );
        }

        .sr-premium-bar {
          animation:
            srBarGrow 1.3s
            cubic-bezier(.22,1,.36,1) both;

          border-radius: 13px 13px 5px 5px;

          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.2),
            0 8px 18px rgba(16,38,77,.12);
        }

        .sr-premium-bar:hover {
          filter: brightness(1.16);
          box-shadow:
            0 10px 22px rgba(16,38,77,.2);
        }

        .sr-bar-shimmer {
          animation:
            srShimmer 3.5s linear infinite;
        }

        .sr-live-dot {
          animation:
            srPulse 2s ease-in-out infinite;
        }

        /* GAUGE */

        .sr-gauge-floating {
          animation:
            srGaugeFloating 4s ease-in-out infinite;

          filter:
            drop-shadow(
              0 5px 12px rgba(99,102,241,.08)
            );
        }

        .sr-gauge-progress {
          animation:
            srGaugeGlowPulse 2.5s ease-in-out infinite;
        }

        .sr-gauge-glow {
          animation:
            srGaugeGlow 3s ease-in-out infinite;
        }

        .sr-gauge-stat {
          animation: srEnter .7s ease both;
        }

        /* SCROLL REVEAL */

        .sr-scroll-reveal {
          opacity: 0;
          transform:
            translateY(35px) scale(.985);
          filter: blur(4px);

          transition:
            opacity .8s cubic-bezier(.22,1,.36,1),
            transform .8s cubic-bezier(.22,1,.36,1),
            filter .8s;
        }

        .sr-scroll-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        .sr-chart-reveal {
          animation:
            srChartReveal 1s
            cubic-bezier(.22,1,.36,1) both;
        }

        /* PREMIUM TIMELINE */

        .sr-timeline-panel {
          background:
            linear-gradient(
              155deg,
              #ffffff,
              #fbfdff
            );

          box-shadow:
            0 8px 22px rgba(16,38,77,.035),
            0 20px 60px rgba(16,38,77,.075);
        }

        .sr-timeline-header {
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(91,160,255,.22),
              transparent 38%
            ),
            linear-gradient(
              120deg,
              #061832,
              #102f62 55%,
              #235a9c
            ) !important;
        }

        .sr-timeline-item {
          transition:
            transform .4s cubic-bezier(.22,1,.36,1);
        }

        .sr-timeline-item:hover {
          transform: translateX(3px);
        }

        .sr-timeline-item-card {
          background:
            linear-gradient(
              135deg,
              #ffffff 0%,
              #f8fbff 55%,
              #eef5ff 100%
            ) !important;

          border-color: #dce8f7 !important;

          box-shadow:
            0 5px 15px rgba(16,38,77,.035),
            0 12px 28px rgba(16,38,77,.035);
        }

        .sr-timeline-item:hover
        .sr-timeline-item-card {
          border-color: #a7c7ed !important;

          box-shadow:
            0 12px 25px rgba(16,38,77,.07),
            0 20px 45px rgba(16,38,77,.1);
        }

        .sr-timeline-icon {
          box-shadow:
            0 0 0 4px rgba(37,99,235,.055),
            0 8px 22px rgba(16,47,98,.23);
        }

        .sr-detail-box {
          background: rgba(255,255,255,.88);
          border-color: #e3ecf8;

          transition:
            background .3s ease,
            border-color .3s ease,
            transform .3s ease;
        }

        .sr-detail-box:hover {
          background: #fff;
          border-color: #b9d2f0;
          transform: translateY(-2px);
        }

        /* BUTTONS */

        .sr-dashboard-premium button {
          -webkit-tap-highlight-color: transparent;
        }

        .sr-dashboard-premium button:focus-visible {
          outline:
            3px solid rgba(59,130,246,.35);
          outline-offset: 3px;
        }

        .sr-dashboard-premium button:active {
          scale: .98;
        }

        .sr-refreshing {
          animation: srRotate .7s ease;
        }

        .sr-floating {
          animation:
            srFloat 5s ease-in-out infinite;
        }

        .sr-gradient-animated {
          background-size: 200% 200%;
        }

        /* TYPOGRAPHY */

        .sr-dashboard-premium h1,
        .sr-dashboard-premium h2,
        .sr-dashboard-premium h3,
        .sr-dashboard-premium h4 {
          letter-spacing: -.025em;
        }

        .sr-dashboard-premium p {
          text-wrap: pretty;
        }

        /* MOBILE */

        @media (max-width: 640px) {
          .sr-dashboard-premium
          .sr-premium-card {
            border-radius: 22px !important;
          }

          .sr-dashboard-premium
          .sr-gradient-animated {
            border-radius: 24px !important;
          }

          .sr-timeline-item {
            gap: 10px;
          }

          .sr-timeline-item-card {
            border-radius: 18px !important;
          }

          .sr-dashboard-premium
          .sr-premium-card:hover {
            transform: translateY(-3px);
          }
        }

        /* ACCESSIBILITY */

        @media (prefers-reduced-motion: reduce) {
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

          .sr-premium-dot {
            opacity: 1;
          }

          .sr-timeline-item:hover {
            transform: none;
          }
        }
      `}</style>

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            {/* <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Sparkles size={15} />
            </span> */}
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="group flex w-fit items-center justify-center gap-2 rounded-2xl border border-[#dce7f4] bg-white px-5 py-3 text-xs font-black text-[#10264d] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg sm:text-sm"
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

      {/* ==========================================
          DEMO BANNER
      ========================================== */}

      {/* {isDemo && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs font-semibold text-[#244d8b] sm:text-sm">
           <Sparkles */}
            {/* size={18}
            className="mt-0.5 shrink-0"
          />  */}

          {/* <span>
            Demo preview: 420 sample records are available
            across dashboard sections without saved records.
            Existing saved records remain unchanged.
          </span> */}
        {/* </div>
      )} */}

      {/* ==========================================
          PREMIUM HERO
      ========================================== */}

      <ScrollReveal className="mb-7">
        <div className="sr-gradient-animated relative overflow-hidden rounded-[28px] p-5 text-white shadow-[0_25px_65px_rgba(16,38,77,0.19)] sm:p-8">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="sr-floating absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />
            <div className="absolute -right-10 -top-24 h-[300px] w-[300px] rounded-full border border-white/10" />
            <div className="absolute -right-32 bottom-[-170px] h-[350px] w-[350px] rounded-full bg-blue-300/10 blur-[70px]" />
            <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-[80px]" />
          </div>

          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-[11px] font-bold text-blue-100">
                  Business Overview
                </span>
              </div>

              <h2
                className="mt-3 text-xl font-extrabold !text-white sm:text-2xl lg:text-3xl"
                style={{ color: "#ffffff" }}
              >
                Manage Your Studio Smarter
              </h2>

              <p className="mt-3 max-w-2xl text-xs leading-6 text-blue-100/85 sm:text-sm">
                Track customers, bookings, payments,
                production and deliveries from one
                beautifully connected dashboard.
              </p>
            </div>

            <div className="sr-floating hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:block">
              <Activity size={36} strokeWidth={2.3} />
            </div>
          </div>

          <div className="relative mt-7 grid grid-cols-1 gap-3 border-t border-white/20 pt-6 sm:grid-cols-3 sm:gap-4">
            {[
              ["Total Billed", stats.billed],
              ["Total Received", stats.paid],
              ["Pending Amount", stats.pending],
            ].map(([label, amount]) => (
              <div
                key={label}
                className="sr-hero-stat group relative min-w-0 overflow-hidden rounded-2xl p-4 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                <p className="text-xs font-semibold text-blue-200">
                  {label}
                </p>

                <p className="mt-3 break-words text-lg font-black tracking-tight text-white lg:text-xl xl:text-2xl">
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
      </ScrollReveal>

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card, index) => (
          <ScrollReveal
            key={card.title}
            delay={(index % 5) * 70}
            className="h-full"
          >
            <StatCard
              {...card}
              index={index}
              replay={replay}
            />
          </ScrollReveal>
        ))}
      </div>

      {/* ==========================================
          REVENUE + SALES CHARTS
      ========================================== */}

      <ScrollAnimatedCharts
        payments={data.payments}
        bookings={data.bookings}
        replay={replay}
      />

      {/* ==========================================
          MONTHLY CHARTS
      ========================================== */}

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
            replay={replay}
            formatter={(value) =>
              value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value
            }
          />
        </ScrollReveal>
      </div>

      {/* ==========================================
          BOOKINGS + RECENT ACTIVITIES
      ========================================== */}

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

      {/* ==========================================
          FOOTER
      ========================================== */}

      <div className="mt-9 flex flex-col items-center justify-center gap-2 border-t border-[#e0e9f4] pt-6 text-center">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10264d] text-white">
            <Camera size={15} />
          </span>

          <span className="text-xs font-black text-[#10264d]">
            Studio Raw Picturez
          </span>
        </div>

        <p className="text-[11px] font-semibold leading-5 text-[#94a3b8]">
          ERP &amp; CRM · Premium Dashboard ·
          Browser-local records
        </p>
      </div>
    </div>
  );
}
