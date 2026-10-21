
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#10264d]">
            {value}
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-xl p-3 ${color}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  subtitle,
  icon: Icon,
}) {
  return (
    <div className="mb-5 flex min-w-0 items-center gap-3">
      <div className="shrink-0 rounded-xl bg-blue-50 p-2.5 text-[#10264d]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-base font-bold text-[#10264d] sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400">
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
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <SectionTitle
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      <div className="w-full min-w-0">
        <div className="grid h-56 w-full grid-cols-6 items-end gap-1 border-b border-slate-200 pb-2 sm:gap-3">
          {data.map((item) => {
            const value = item[dataKey] || 0;

            const height = value
              ? Math.max(6, (value / maxValue) * 85)
              : 2;

            return (
              <div
                key={item.key}
                className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
              >
                <span
                  className="w-full truncate text-center text-[9px] font-semibold text-[#10264d] sm:text-xs"
                  title={String(value)}
                >
                  {formatter
                    ? formatter(value)
                    : value}
                </span>

                <div
                  className={`w-full max-w-12 rounded-t-lg transition-all duration-300 ${barColor}`}
                  style={{
                    height: `${height}%`,
                  }}
                />

                <span className="text-[10px] text-slate-500 sm:text-xs">
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

function InfoRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
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
    <div className="min-h-screen w-full min-w-0 max-w-full bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Dashboard Heading */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#10264d] sm:text-2xl lg:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Welcome to Studio Raw Picturez ERP & CRM
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] hover:bg-blue-50 sm:w-auto"
        >
          <RefreshCw size={17} />
          Refresh Dashboard
        </button>
      </div>

      {/* Business Overview Banner */}
      <div className="mb-6 w-full min-w-0 overflow-hidden rounded-2xl bg-gradient-to-r from-[#10264d] to-[#244d8b] p-5 text-white shadow-lg sm:p-8">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-blue-200 sm:text-sm">
              Studio Business Overview
            </p>

            <h2 className="mt-2 break-words text-xl font-bold sm:text-2xl">
              Manage Your Studio Smarter
            </h2>

            <p className="mt-2 max-w-xl text-xs leading-6 text-blue-100 sm:text-sm">
              Track customers, bookings, payments,
              production and deliveries from one dashboard.
            </p>
          </div>

          <div className="hidden shrink-0 rounded-2xl bg-white/10 p-4 sm:block">
            <Activity size={36} />
          </div>
        </div>

        {/* Financial Details - Mobile Vertical */}
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 md:grid-cols-3">
          {[
            ["Total Billed", stats.billed],
            ["Total Received", stats.paid],
            ["Pending Amount", stats.pending],
          ].map(([label, amount]) => (
            <div
              key={label}
              className="min-w-0 rounded-xl bg-white/10 p-4"
            >
              <p className="text-xs text-blue-200">
                {label}
              </p>

              <p className="mt-2 break-words text-xl font-bold">
                {money(amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* All Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            {...card}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
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

      {/* Upcoming Bookings */}
      <div className="mb-6 grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
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
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
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

        {/* Follow-up Reminders */}
        <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <SectionTitle
            title="Customer Follow-up Reminders"
            subtitle="Pending customer communications"
            icon={HeartHandshake}
          />

          {upcomingFollowups.length === 0 ? (
            <EmptyState message="No pending follow-ups" />
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingFollowups.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
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

      {/* Recent Activities */}
      <div className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <SectionTitle
          title="Recent Activities"
          subtitle="Latest recorded studio workflow items"
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
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-700">
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

      {/* Footer */}
      <p className="mt-6 text-center text-xs leading-5 text-slate-400">
        StudioRaw Picturez ERP & CRM · Dashboard data
        stored locally in this browser
      </p>
    </div>
  );
}
