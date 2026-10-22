
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
  Sparkles,
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
    { id: "demo-s1", customerName: "Arun Kumar", status: "Scheduled" },
    { id: "demo-s2", customerName: "Priya", status: "Completed" },
    { id: "demo-s3", customerName: "Karthik", status: "Scheduled" },
  ],
  editing: [
    { id: "demo-ed1", customerName: "Arun Kumar", editingStatus: "Pending" },
    { id: "demo-ed2", customerName: "Priya", editingStatus: "Completed" },
    { id: "demo-ed3", customerName: "Karthik", editingStatus: "In Progress" },
  ],
  albums: [
    { id: "demo-a1", customerName: "Arun Kumar", printingStatus: "Pending" },
    { id: "demo-a2", customerName: "Priya", printingStatus: "Printed" },
    { id: "demo-a3", customerName: "Karthik", printingStatus: "In Progress" },
  ],
  deliveries: [
    { id: "demo-d1", customerName: "Arun Kumar", status: "Pending" },
    { id: "demo-d2", customerName: "Priya", status: "Delivered" },
    { id: "demo-d3", customerName: "Karthik", status: "In Progress" },
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

function numberValue(value) {
  return (
    Number(
      String(value ?? 0).replace(/[₹,\s]/g, "")
    ) || 0
  );
}

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

const bookingDate = (item) =>
  item.eventDate ||
  item.bookingDate ||
  item.date ||
  item.shootDate ||
  "";

// Browser-generated sound. No audio file required.
function playSound(type = "click") {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!window.__studioAudioContext) {
      window.__studioAudioContext = new AudioContextClass();
    }

    const context = window.__studioAudioContext;

    if (context.state === "suspended") {
      context.resume().catch(() => {});
    }

    const notes =
      type === "success"
        ? [523, 659, 784]
        : type === "open"
        ? [392, 523, 659]
        : [620, 820];

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      const start = context.currentTime + index * 0.075;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.15);
    });
  } catch {
    // Dashboard remains functional if audio is unavailable.
  }
}

// Animated number counter
function AnimatedNumber({
  value,
  currency = false,
  replay = 0,
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1100;
    const start = performance.now();
    const target = Number(value) || 0;

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
  soundEnabled,
}) {
  const isCurrency = [
    "Amount Received",
    "Pending Balance",
  ].includes(title);

  return (
    <div
      onMouseEnter={() => {
        // Hover movement is visual only, avoiding repetitive audio.
      }}
      className="studio-card group relative w-full min-w-0 overflow-hidden rounded-2xl border border-[#e6ecf5] bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-2 hover:border-[#cbd9ee] hover:shadow-xl lg:rounded-[22px] lg:p-6"
      style={{
        animationDelay: `${index * 85}ms`,
      }}
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
              currency={isCurrency}
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
}) {
  return (
    <div className="studio-panel w-full min-w-0 rounded-2xl border border-[#e6ecf5] bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:p-7">
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

export default function Dashboard() {
  const [data, setData] = useState(getAllData);
  const [lastUpdated, setLastUpdated] = useState(new Date);
  const [replay, setReplay] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("studioraw_dashboard_sound") === "true";
    } catch {
      return false;
    }
  });

  const soundRef = useRef(soundEnabled);

  useEffect(() => {
    soundRef.current = soundEnabled;
    try {
      localStorage.setItem(
        "studioraw_dashboard_sound",
        String(soundEnabled)
      );
    } catch {}
  }, [soundEnabled]);

  function refresh(withSound = true) {
    setData(getAllData());
    setLastUpdated(new Date());
    setReplay((previous) => previous + 1);

    if (withSound && soundRef.current) {
      playSound("success");
    }
  }

  useEffect(() => {
    const handleUpdate = () => refresh(false);

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  function toggleSound() {
    if (!soundEnabled) {
      playSound("open");
    }
    setSoundEnabled(!soundEnabled);
  }

  const today = new Date().toLocaleDateString("en-CA");

  const stats = useMemo(() => {
    const totalBilled = data.payments.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const totalPaid = data.payments.reduce(
      (sum, item) => sum + paidValue(item),
      0
    );

    return {
      customers: data.customers.length,
      enquiries: data.enquiries.length,
      bookings: data.bookings.length,
      billed: totalBilled,
      paid: totalPaid,
      pending: Math.max(0, totalBilled - totalPaid),
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

    addItems(data.bookings, "Booking", CalendarDays, [
      "createdAt",
      "bookingDate",
      "eventDate",
      "date",
    ]);

    addItems(data.payments, "Payment", Wallet, [
      "createdAt",
      "paymentDate",
      "date",
    ]);

    addItems(data.deliveries, "Delivery", Truck, [
      "deliveredDate",
      "expectedDate",
      "createdAt",
      "date",
    ]);

    addItems(data.photoshoots, "Photo Shoot", Camera, [
      "shootDate",
      "createdAt",
      "date",
    ]);

    addItems(data.editing, "Photo Editing", Images, [
      "createdAt",
      "date",
      "updatedAt",
    ]);

    addItems(data.albums, "Album Project", BookOpen, [
      "createdAt",
      "date",
      "updatedAt",
    ]);

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

      {/* ANIMATION CSS */}
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
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes studioGlow {
          0%, 100% { opacity: .45; }
          50% { opacity: .9; }
        }

        @keyframes studioRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        @media (prefers-reduced-motion: reduce) {
          .studio-card,
          .studio-panel,
          .studio-bar,
          .studio-floating,
          .studio-glow,
          .studio-refreshing {
            animation: none !important;
          }
        }
      `}</style>

      {/* DASHBOARD HEADER */}
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

      {/* DEMO INFORMATION */}
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

        {/* ANIMATED FINANCIAL SUMMARY */}
        <div className="relative mt-6 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 md:grid-cols-3 lg:mt-8 lg:gap-5 lg:pt-7">
          {[
            ["Total Billed", stats.billed],
            ["Total Received", stats.paid],
            ["Pending Amount", stats.pending],
          ].map(([label, amount], index) => (
            <div
              key={label}
              className="studio-card min-w-0 rounded-2xl border border-white/10 bg-white/[0.09] p-4 backdrop-blur-sm transition duration-500 hover:-translate-y-1 hover:bg-white/[0.15] lg:p-5"
              style={{
                animationDelay: `${index * 130}ms`,
              }}
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

      {/* ANIMATED STATISTICS CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 lg:mb-8 lg:gap-5">
        {cards.map((card, index) => (
          <StatCard
            key={card.title}
            {...card}
            index={index}
            replay={replay}
            soundEnabled={soundEnabled}
          />
        ))}
      </div>

      {/* ANIMATED CHARTS */}
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
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 lg:mb-8 lg:gap-5">

        {/* UPCOMING BOOKINGS */}
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
                  style={{
                    animationDelay: `${index * 90}ms`,
                  }}
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

        {/* RECENT ACTIVITIES */}
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
                    style={{
                      animationDelay: `${index * 90}ms`,
                    }}
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

      {/* FOOTER */}
      <p className="mt-6 text-center text-xs leading-5 text-slate-400 lg:mt-8">
        Studio Raw Picturez ERP &amp; CRM · Dashboard data
        stored locally in this browser
      </p>
    </div>
  );
}
