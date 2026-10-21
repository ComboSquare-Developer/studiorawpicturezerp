
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
  HeartHandshake,
  TrendingUp,
  Wallet,
  Activity,
  RefreshCw,
} from "lucide-react";

const STORAGE = {
  customers: "studioraw_customers",
  enquiries: "studio_raw_enquiries",
  bookings: "studioraw_bookings",
  payments: "studioraw_payments",
  preshoot: "studioraw_preshoot",
  photoshoots: "studioraw_photoshoots",
  editing: "studioraw_photo_editing",
  albums: "studioraw_album_printing",
  deliveries: "studioraw_deliveries",
  followups: "studioraw_followups",
};

const readData = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const getAllData = () =>
  Object.fromEntries(
    Object.entries(STORAGE).map(([name, key]) => [
      name,
      readData(key),
    ])
  );

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const todayKey = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  const datePart = String(value).slice(0, 10);
  const d = new Date(`${datePart}T00:00:00`);

  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const toNumber = (value) => {
  const result = Number(
    String(value ?? "0").replace(/[₹,\s]/g, "")
  );

  return Number.isFinite(result) ? result : 0;
};

const getAmount = (item) =>
  toNumber(
    item.amount ?? item.totalAmount ?? item.total ?? 0
  );

const getPaid = (item) =>
  toNumber(
    item.paidAmount ?? item.amountPaid ?? item.paid ?? 0
  );

const paidValue = (item) => {
  const status = String(
    item.paymentStatus ?? item.status ?? ""
  ).toLowerCase();

  if (status === "paid" || status === "completed") {
    return getPaid(item) || getAmount(item);
  }

  return getPaid(item);
};

const bookingDate = (item) =>
  item.eventDate ||
  item.bookingDate ||
  item.date ||
  item.shootDate ||
  "";

/* =========================
   STATISTICS CARD
========================= */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md lg:group lg:relative lg:overflow-hidden lg:rounded-[22px] lg:border-[#e6ecf5] lg:p-6 lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)] lg:hover:-translate-y-1 lg:hover:border-[#cbd9ee] lg:hover:shadow-[0_15px_35px_rgba(16,38,77,0.10)]">

      <div className="pointer-events-none absolute -right-10 -top-10 hidden h-32 w-32 rounded-full bg-blue-50/70 blur-2xl lg:block" />

      <div className="relative flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500 lg:text-[13px] lg:font-semibold lg:text-[#75839a]">
            {title}
          </p>

          <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#10264d] lg:mt-4 lg:text-[clamp(19px,1.65vw,28px)] lg:font-extrabold">
            {value}
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-400 lg:mt-3 lg:text-[11px] lg:text-[#98a4b7]">
            {subtitle}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-xl p-3 lg:rounded-2xl lg:p-3.5 lg:transition-transform lg:duration-300 lg:group-hover:scale-110 ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="absolute bottom-0 left-6 right-6 hidden h-[2px] rounded-full bg-gradient-to-r from-[#244d8b]/50 to-transparent opacity-0 transition-opacity duration-300 lg:block lg:group-hover:opacity-100" />
    </div>
  );
}

/* =========================
   SECTION TITLE
========================= */

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="mb-5 flex min-w-0 items-center gap-3 lg:mb-7 lg:gap-4">
      <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-[#10264d] lg:rounded-2xl lg:bg-[#edf3fc] lg:p-3">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-base font-bold text-[#10264d] sm:text-lg lg:text-[18px] lg:font-extrabold lg:tracking-[-0.02em]">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400 lg:text-[#91a0b5]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */

function EmptyState({ message }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400 lg:rounded-2xl lg:border lg:border-dashed lg:border-[#e2e9f3] lg:bg-[#fafcff] lg:py-14">
      {message}
    </div>
  );
}

/* =========================
   CHART PANEL
========================= */

function ChartPanel({
  title,
  subtitle,
  icon,
  data,
  dataKey,
  maxValue,
  barColor,
  formatter,
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:border-[#e6ecf5] lg:p-7 lg:shadow-[0_6px_28px_rgba(16,38,77,0.045)]">
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="w-full min-w-0">
        <div className="grid h-56 w-full grid-cols-6 items-end gap-1 border-b border-slate-200 pb-2 sm:gap-3 lg:h-64 lg:gap-4 lg:border-[#e9eef5] lg:pb-3">
          {data.map((item) => {
            const value = item[dataKey] || 0;

            const height = value
              ? Math.max(6, (value / maxValue) * 85)
              : 2;

            return (
              <div
                key={item.key}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2 lg:gap-3"
              >
                <span
                  className="w-full truncate text-center text-[9px] font-semibold text-[#10264d] sm:text-xs lg:text-[12px]"
                  title={String(value)}
                >
                  {formatter
                    ? formatter(value)
                    : value}
                </span>

                <div
                  className={`w-full max-w-12 rounded-t-lg transition-all duration-300 lg:max-w-14 lg:rounded-t-xl lg:hover:opacity-80 ${barColor}`}
                  style={{
                    height: `${height}%`,
                  }}
                />

                <span className="text-[10px] text-slate-500 sm:text-xs lg:font-medium lg:text-[#8190a6]">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================
   INFORMATION ROW
========================= */

function InfoRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 lg:border-[#e9eef5]">
      <p className="text-xs font-medium text-slate-400 lg:text-[11px] lg:font-semibold lg:tracking-wide">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-[#10264d] lg:text-[13px]">
        {value || "—"}
      </p>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

export default function Dashboard() {
  const [data, setData] = useState(getAllData);
  const [lastUpdated, setLastUpdated] = useState(
    new Date()
  );

  const refresh = () => {
    setData(getAllData());
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const onStorage = () => {
      refresh();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, []);

  const today = todayKey();

  const stats = useMemo(() => {
    const {
      customers,
      enquiries,
      bookings,
      payments,
      photoshoots,
      editing,
      albums,
      deliveries,
      followups,
    } = data;

    const totalBilled = payments.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const totalPaid = payments.reduce(
      (sum, item) => sum + paidValue(item),
      0
    );

    return {
      customers: customers.length,
      enquiries: enquiries.length,
      bookings: bookings.length,
      billed: totalBilled,
      paid: totalPaid,
      pending: Math.max(
        0,
        totalBilled - totalPaid
      ),
      shoots: photoshoots.length,
      editingPending: editing.filter(
        (item) =>
          item.editingStatus !== "Completed"
      ).length,
      albumsPending: albums.filter(
        (item) =>
          item.printingStatus !== "Printed"
      ).length,
      deliveriesPending: deliveries.filter(
        (item) =>
          item.status !== "Delivered" &&
          item.status !== "Cancelled"
      ).length,
      followupsPending: followups.filter(
        (item) =>
          item.status !== "Completed" &&
          item.status !== "Cancelled"
      ).length,
    };
  }, [data]);

  const upcomingBookings = useMemo(
    () =>
      data.bookings
        .filter((item) => {
          const date = String(
            bookingDate(item)
          ).slice(0, 10);

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

  const upcomingFollowups = useMemo(
    () =>
      data.followups
        .filter(
          (item) =>
            item.status !== "Completed" &&
            item.status !== "Cancelled"
        )
        .sort((a, b) =>
          String(
            a.followupDate || "9999"
          ).localeCompare(
            String(b.followupDate || "9999")
          )
        )
        .slice(0, 5),
    [data.followups]
  );

  const recentActivities = useMemo(() => {
    const activities = [];

    const addItems = (
      items,
      type,
      icon,
      dateFields
    ) => {
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
      [
        "createdAt",
        "bookingDate",
        "eventDate",
        "date",
      ]
    );

    addItems(
      data.payments,
      "Payment",
      Wallet,
      [
        "createdAt",
        "paymentDate",
        "date",
      ]
    );

    addItems(
      data.deliveries,
      "Delivery",
      Truck,
      [
        "deliveredDate",
        "expectedDate",
      ]
    );

    addItems(
      data.followups,
      "Follow-up",
      HeartHandshake,
      ["followupDate"]
    );

    return activities
      .sort((a, b) =>
        String(b.date).localeCompare(
          String(a.date)
        )
      )
      .slice(0, 6);
  }, [data]);

  const monthlyChart = useMemo(() => {
    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const d = new Date();

        d.setDate(1);
        d.setMonth(
          d.getMonth() - (5 - index)
        );

        return {
          key: `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`,
          label: d.toLocaleDateString(
            "en-IN",
            { month: "short" }
          ),
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
          String(date || "").slice(0, 7) ===
          entry.key
      );

      if (month) {
        month.bookings += 1;
      }
    });

    data.payments.forEach((item) => {
      const date =
        item.paymentDate ||
        item.createdAt ||
        item.date;

      const month = months.find(
        (entry) =>
          String(date || "").slice(0, 7) ===
          entry.key
      );

      if (month) {
        month.revenue += paidValue(item);
      }
    });

    return months;
  }, [data]);

  const maxBookings = Math.max(
    1,
    ...monthlyChart.map(
      (item) => item.bookings
    )
  );

  const maxRevenue = Math.max(
    1,
    ...monthlyChart.map(
      (item) => item.revenue
    )
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
      subtitle: "Customer leads",
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
      value: money(stats.paid),
      icon: IndianRupee,
      color: "bg-green-50 text-green-700",
      subtitle: "Recorded payments",
    },
    {
      title: "Pending Balance",
      value: money(stats.pending),
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
    {
      title: "Pending Follow-ups",
      value: stats.followupsPending,
      icon: HeartHandshake,
      color: "bg-teal-50 text-teal-700",
      subtitle: "Customer follow-ups",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">

      {/* DASHBOARD HEADING */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-8">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.18em] text-[#7690b2] lg:block">
            Studio Performance
          </p>

          <h1 className="text-xl font-bold text-[#10264d] sm:text-2xl lg:text-[30px] lg:font-extrabold lg:tracking-[-0.04em]">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm lg:mt-2 lg:text-[#8290a5]">
            Welcome to Studio Raw Picturez ERP & CRM
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] hover:bg-blue-50 sm:w-auto lg:rounded-2xl lg:border-[#e2e8f2] lg:px-5 lg:shadow-[0_4px_16px_rgba(16,38,77,0.04)] lg:transition-all lg:duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-md"
        >
          <RefreshCw size={17} />
          Refresh Dashboard
        </button>
      </div>

      {/* BUSINESS OVERVIEW BANNER */}
      <div className="mb-6 w-full min-w-0 overflow-hidden rounded-2xl bg-gradient-to-r from-[#10264d] to-[#244d8b] p-5 text-white shadow-lg sm:p-8 lg:relative lg:mb-8 lg:rounded-[28px] lg:bg-gradient-to-br lg:from-[#091b36] lg:via-[#143662] lg:to-[#28548b] lg:p-9 lg:shadow-[0_18px_45px_rgba(16,38,77,0.15)]">

        {/* DESKTOP DECORATION */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
          <div className="absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="absolute -right-10 -top-24 h-[300px] w-[300px] rounded-full border border-white/10" />
          <div className="absolute -right-32 bottom-[-170px] h-[350px] w-[350px] rounded-full bg-blue-300/10 blur-[70px]" />
        </div>

        <div className="relative flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-200 sm:text-sm lg:text-[12px] lg:font-semibold lg:tracking-[0.12em]">
              Studio Business Overview
            </p>

            <h2 className="mt-2 break-words text-xl font-bold sm:text-2xl lg:mt-4 lg:text-[30px] lg:font-extrabold lg:tracking-[-0.035em]">
              Manage Your Studio Smarter
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-6 text-blue-100 sm:text-sm lg:mt-4 lg:max-w-2xl lg:leading-7 lg:text-blue-100/75">
              Track customers, bookings, payments,
              production and deliveries from one dashboard.
            </p>
          </div>

          <div className="hidden shrink-0 rounded-2xl bg-white/10 p-4 sm:block lg:rounded-[22px] lg:border lg:border-white/15 lg:bg-white/10 lg:p-5 lg:backdrop-blur-sm">
            <Activity size={36} />
          </div>
        </div>

        {/* FINANCIAL DETAILS */}
        <div className="relative mt-6 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 md:grid-cols-3 lg:mt-8 lg:gap-5 lg:pt-7">
          {[
            ["Total Billed", stats.billed],
            ["Total Received", stats.paid],
            ["Pending Amount", stats.pending],
          ].map(([label, amount]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl bg-white/10 p-4 lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/[0.09] lg:p-5 lg:backdrop-blur-sm lg:transition-all lg:duration-300 lg:hover:bg-white/[0.15]"
            >
              <p className="text-xs text-blue-200 lg:text-[12px] lg:font-medium">
                {label}
              </p>

              <p className="mt-2 break-words text-xl font-bold lg:mt-3 lg:text-[clamp(19px,1.7vw,27px)] lg:font-extrabold">
                {money(amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ALL STATISTICS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 lg:mb-8 lg:gap-5">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            {...card}
          />
        ))}
      </div>

      {/* CHARTS */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 lg:mb-8 lg:gap-5">
        <ChartPanel
          title="Booking Overview"
          subtitle="Last six months"
          icon={TrendingUp}
          data={monthlyChart}
          dataKey="bookings"
          maxValue={maxBookings}
          barColor="bg-[#244d8b]"
        />

        <ChartPanel
          title="Revenue Overview"
          subtitle="Recorded receipts by month"
          icon={IndianRupee}
          data={monthlyChart}
          dataKey="revenue"
          maxValue={maxRevenue}
          barColor="bg-emerald-500"
          formatter={(value) =>
            value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : value
          }
        />
      </div>

      {/* UPCOMING BOOKINGS AND FOLLOW-UPS */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2 lg:mb-8 lg:gap-5">

        {/* UPCOMING BOOKINGS */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:border-[#e6ecf5] lg:p-7 lg:shadow-[0_6px_28px_rgba(16,38,77,0.045)]">
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
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 lg:rounded-2xl lg:border-[#e9eef6] lg:bg-[#f8faff] lg:p-5 lg:transition-all lg:hover:border-[#cbd9ee] lg:hover:bg-white lg:hover:shadow-sm"
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

        {/* FOLLOW-UP REMINDERS */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:border-[#e6ecf5] lg:p-7 lg:shadow-[0_6px_28px_rgba(16,38,77,0.045)]">
          <SectionTitle
            title="Customer Follow-up Reminders"
            subtitle="Pending customer communications"
            icon={HeartHandshake}
          />

          {upcomingFollowups.length === 0 ? (
            <EmptyState message="No pending follow-ups" />
          ) : (
            <div className="flex flex-col gap-3 lg:gap-4">
              {upcomingFollowups.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 lg:rounded-2xl lg:border-[#e9eef6] lg:bg-[#f8faff] lg:p-5 lg:transition-all lg:hover:border-[#cbd9ee] lg:hover:bg-white lg:hover:shadow-sm"
                >
                  <InfoRow
                    label="Customer"
                    value={
                      item.customer ||
                      item.customerName ||
                      "Customer"
                    }
                  />

                  <InfoRow
                    label="Follow-up Type"
                    value={item.type || "Follow-up"}
                  />

                  <InfoRow
                    label="Follow-up Date"
                    value={formatDate(item.followupDate)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[24px] lg:border-[#e6ecf5] lg:p-7 lg:shadow-[0_6px_28px_rgba(16,38,77,0.045)]">
        <SectionTitle
          title="Recent Activities"
          subtitle="Latest recorded studio workflow items"
          icon={Activity}
        />

        {recentActivities.length === 0 ? (
          <EmptyState message="No recent activities available" />
        ) : (
          <div className="flex flex-col gap-3 lg:gap-4">
            {recentActivities.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 lg:rounded-2xl lg:border-[#e9eef6] lg:bg-[#f8faff] lg:p-5 lg:transition-all lg:hover:border-[#cbd9ee] lg:hover:bg-white lg:hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-700 lg:rounded-2xl">
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

      {/* FOOTER */}
      <p className="mt-6 text-center text-xs leading-5 text-slate-400 lg:mt-8">
        StudioRaw Picturez ERP & CRM · Dashboard data
        stored locally in this browser
      </p>
    </div>
  );
}
