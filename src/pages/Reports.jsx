
import { useCallback, useEffect, useMemo, useState } from "react";
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
  IndianRupee,
  ClipboardList,
  Package,
  Building2,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";

const STORAGE_KEYS = {
  payments: "studioraw_payments",
  expenses: "studioraw_expenses",
  bookings: "studioraw_bookings",
  customers: "studioraw_customers",
  enquiries: "studio_raw_enquiries",
  inventory: "studioraw_inventory",
  equipment: "studioraw_equipment",
  attendance: "studioraw_attendance",
  branches: "studioraw_branches",
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const numberFormat = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const today = () => new Date().toISOString().slice(0, 10);

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getMonth = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return `${parsed.getFullYear()}-${String(
    parsed.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getDate = (item) =>
  item?.date ||
  item?.paymentDate ||
  item?.payment_date ||
  item?.expenseDate ||
  item?.bookingDate ||
  item?.eventDate ||
  item?.createdAt ||
  item?.created_at ||
  item?.dateAdded ||
  item?.attendanceDate ||
  item?.enquiryDate ||
  item?.updatedAt ||
  "";

const getAmount = (item) =>
  Number(
    item?.amount ??
      item?.totalAmount ??
      item?.total_amount ??
      item?.paidAmount ??
      item?.paid_amount ??
      item?.price ??
      item?.cost ??
      item?.total ??
      item?.grandTotal ??
      item?.grand_total ??
      0
  ) || 0;

const getStatus = (item) =>
  String(item?.status || item?.paymentStatus || item?.payment_status || "")
    .trim()
    .toLowerCase();

const getName = (item) =>
  item?.name ||
  item?.customerName ||
  item?.customer_name ||
  item?.title ||
  item?.itemName ||
  item?.item_name ||
  item?.projectName ||
  item?.branchName ||
  item?.branch_name ||
  "Untitled";

const makeDemoData = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = (day) =>
    `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(
      2,
      "0"
    )}`;

  return {
    payments: [
      {
        id: "demo-pay-1",
        customerName: "Arun Kumar",
        amount: 15000,
        date: date(3),
        status: "Paid",
        paymentMethod: "UPI",
      },
      {
        id: "demo-pay-2",
        customerName: "Priya Wedding",
        amount: 25000,
        date: date(8),
        status: "Paid",
        paymentMethod: "Cash",
      },
      {
        id: "demo-pay-3",
        customerName: "Karthik Studio",
        amount: 8500,
        date: date(12),
        status: "Paid",
        paymentMethod: "Bank Transfer",
      },
      {
        id: "demo-pay-4",
        customerName: "Divya Portraits",
        amount: 12000,
        date: date(18),
        status: "Pending",
        paymentMethod: "UPI",
      },
      {
        id: "demo-pay-5",
        customerName: "Rahul & Meena",
        amount: 18000,
        date: date(22),
        status: "Paid",
        paymentMethod: "Cash",
      },
    ],
    expenses: [
      {
        id: "demo-exp-1",
        title: "Camera Accessories",
        category: "Equipment",
        amount: 4500,
        date: date(4),
      },
      {
        id: "demo-exp-2",
        title: "Studio Electricity",
        category: "Utilities",
        amount: 1800,
        date: date(10),
      },
      {
        id: "demo-exp-3",
        title: "Photo Album Printing",
        category: "Printing",
        amount: 3200,
        date: date(15),
      },
      {
        id: "demo-exp-4",
        title: "Travel Expenses",
        category: "Travel",
        amount: 1500,
        date: date(20),
      },
    ],
    bookings: [
      {
        id: "demo-book-1",
        customerName: "Priya Wedding",
        title: "Wedding Photography",
        amount: 25000,
        date: date(8),
        status: "Confirmed",
      },
      {
        id: "demo-book-2",
        customerName: "Arun Kumar",
        title: "Birthday Photography",
        amount: 10000,
        date: date(12),
        status: "Completed",
      },
      {
        id: "demo-book-3",
        customerName: "Divya Portraits",
        title: "Portrait Session",
        amount: 12000,
        date: date(18),
        status: "Pending",
      },
      {
        id: "demo-book-4",
        customerName: "Rahul & Meena",
        title: "Pre-wedding Shoot",
        amount: 18000,
        date: date(22),
        status: "Confirmed",
      },
    ],
    customers: [
      { id: "demo-cus-1", name: "Arun Kumar", createdAt: date(2) },
      { id: "demo-cus-2", name: "Priya Wedding", createdAt: date(5) },
      { id: "demo-cus-3", name: "Karthik Studio", createdAt: date(9) },
      { id: "demo-cus-4", name: "Divya Portraits", createdAt: date(14) },
      { id: "demo-cus-5", name: "Rahul & Meena", createdAt: date(20) },
      { id: "demo-cus-6", name: "Meera Family", createdAt: date(23) },
    ],
    enquiries: [
      { id: "demo-enq-1", name: "Wedding Enquiry", createdAt: date(3), status: "New" },
      { id: "demo-enq-2", name: "Birthday Enquiry", createdAt: date(7), status: "Contacted" },
      { id: "demo-enq-3", name: "Portrait Enquiry", createdAt: date(13), status: "Converted" },
    ],
    inventory: [
      { id: "demo-inv-1", itemName: "Photo Paper", quantity: 120 },
      { id: "demo-inv-2", itemName: "Album Covers", quantity: 35 },
      { id: "demo-inv-3", itemName: "Memory Cards", quantity: 8 },
    ],
    equipment: [
      { id: "demo-eq-1", name: "Canon Camera", status: "Available" },
      { id: "demo-eq-2", name: "Studio Lighting Kit", status: "In Use" },
      { id: "demo-eq-3", name: "Tripod", status: "Available" },
    ],
    attendance: [
      { id: "demo-att-1", name: "Photographer", date: date(2), status: "Present" },
      { id: "demo-att-2", name: "Editor", date: date(2), status: "Present" },
      { id: "demo-att-3", name: "Assistant", date: date(2), status: "Absent" },
    ],
    branches: [
      { id: "demo-br-1", name: "Nagercoil Branch", status: "Active" },
      { id: "demo-br-2", name: "Chennai Branch", status: "Active" },
    ],
  };
};

function readStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    if (parsed && typeof parsed === "object") {
      for (const field of ["data", "items", "records", "list", "results"]) {
        if (Array.isArray(parsed[field])) return parsed[field];
      }
    }

    return [];
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return [];
  }
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    red: "bg-rose-50 text-rose-600 ring-rose-100",
    purple: "bg-violet-50 text-violet-600 ring-violet-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${colors[color]}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [storedData, setStoredData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  const loadReports = useCallback(() => {
    setLoading(true);

    const nextData = {};

    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      nextData[name] = readStoredArray(key);
    });

    setStoredData(nextData);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const demoData = useMemo(
    () => makeDemoData(selectedMonth),
    [selectedMonth]
  );

  const data = useMemo(() => {
    const result = {};

    Object.keys(STORAGE_KEYS).forEach((name) => {
      const realRecords = storedData[name] || [];

      // Show demo records only when the corresponding localStorage
      // collection is empty. Nothing is written back to localStorage.
      result[name] =
        realRecords.length === 0 && showDemo
          ? demoData[name] || []
          : realRecords;
    });

    return result;
  }, [storedData, demoData, showDemo]);

  const monthly = useMemo(() => {
    const filterMonth = (items) =>
      (items || []).filter((item) => getMonth(getDate(item)) === selectedMonth);

    const payments = filterMonth(data.payments);
    const expenses = filterMonth(data.expenses);
    const bookings = filterMonth(data.bookings);
    const customers = filterMonth(data.customers);
    const enquiries = filterMonth(data.enquiries);
    const attendance = filterMonth(data.attendance);

    const paidPayments = payments.filter((item) => {
      const status = getStatus(item);
      return (
        !status ||
        ["paid", "completed", "success", "successful", "received"].includes(
          status
        )
      );
    });

    const revenue = paidPayments.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const expenseTotal = expenses.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const pendingPayments = payments.filter((item) =>
      ["pending", "unpaid", "due", "partially paid", "partial"].includes(
        getStatus(item)
      )
    );

    const pendingAmount = pendingPayments.reduce(
      (sum, item) => sum + getAmount(item),
      0
    );

    const confirmedBookings = bookings.filter((item) =>
      ["confirmed", "completed", "booked", "success"].includes(
        getStatus(item)
      )
    );

    return {
      payments,
      expenses,
      bookings,
      customers,
      enquiries,
      attendance,
      revenue,
      expenseTotal,
      profit: revenue - expenseTotal,
      pendingAmount,
      pendingCount: pendingPayments.length,
      confirmedBookings: confirmedBookings.length,
    };
  }, [data, selectedMonth]);

  const isUsingDemoData = useMemo(
    () =>
      Object.keys(STORAGE_KEYS).some(
        (name) =>
          !(storedData[name] || []).length &&
          showDemo &&
          (demoData[name] || []).length > 0
      ),
    [storedData, showDemo, demoData]
  );

  const monthlyActivity = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedMonth}-${String(day).padStart(2, "0")}`;

      const revenue = monthly.payments
        .filter((item) => {
          const status = getStatus(item);
          const paid =
            !status ||
            ["paid", "completed", "success", "successful", "received"].includes(
              status
            );

          return getDate(item).slice(0, 10) === dateKey && paid;
        })
        .reduce((sum, item) => sum + getAmount(item), 0);

      const expenses = monthly.expenses
        .filter((item) => getDate(item).slice(0, 10) === dateKey)
        .reduce((sum, item) => sum + getAmount(item), 0);

      days.push({ day, revenue, expenses });
    }

    // Display a compact sample of the month in the chart.
    const step = Math.max(1, Math.ceil(days.length / 10));
    return days.filter(
      (_, index) =>
        index % step === 0 || index === days.length - 1
    );
  }, [monthly, selectedMonth]);

  const maxActivity = Math.max(
    1,
    ...monthlyActivity.map((item) =>
      Math.max(item.revenue, item.expenses)
    )
  );

  const paymentMethodSummary = useMemo(() => {
    const methods = {};

    monthly.payments.forEach((item) => {
      const status = getStatus(item);
      if (
        status &&
        !["paid", "completed", "success", "successful", "received"].includes(
          status
        )
      ) {
        return;
      }

      const method =
        item.paymentMethod ||
        item.payment_method ||
        item.method ||
        item.mode ||
        "Other";

      methods[method] = (methods[method] || 0) + getAmount(item);
    });

    return Object.entries(methods).sort((a, b) => b[1] - a[1]);
  }, [monthly]);

  const exportCSV = useCallback(() => {
    const rows = [
      ["Studio Raw Picturez - Monthly Report"],
      ["Report Month", selectedMonth],
      ["Generated At", lastUpdated.toLocaleString("en-IN")],
      ["Data Mode", isUsingDemoData ? "Demo fallback included" : "Stored data"],
      [],
      ["SUMMARY"],
      ["Metric", "Value"],
      ["Revenue", monthly.revenue],
      ["Expenses", monthly.expenseTotal],
      ["Net Profit", monthly.profit],
      ["Pending Payments", monthly.pendingAmount],
      ["Bookings", monthly.bookings.length],
      ["New Customers", monthly.customers.length],
      ["Enquiries", monthly.enquiries.length],
      [],
      ["PAYMENTS"],
      ["Date", "Customer", "Amount", "Status", "Method"],
      ...monthly.payments.map((item) => [
        getDate(item),
        getName(item),
        getAmount(item),
        item.status || item.paymentStatus || "—",
        item.paymentMethod || item.payment_method || item.method || "—",
      ]),
      [],
      ["EXPENSES"],
      ["Date", "Expense", "Category", "Amount"],
      ...monthly.expenses.map((item) => [
        getDate(item),
        getName(item),
        item.category || "—",
        getAmount(item),
      ]),
      [],
      ["BOOKINGS"],
      ["Date", "Customer / Project", "Status", "Amount"],
      ...monthly.bookings.map((item) => [
        getDate(item),
        getName(item),
        item.status || "—",
        getAmount(item),
      ]),
    ];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Studio-Reports-${selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [selectedMonth, lastUpdated, isUsingDemoData, monthly]);

  const formatMonth = (month) => {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(year, monthNumber - 1, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const badgeClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      ["paid", "completed", "confirmed", "success", "active", "present"].includes(
        value
      )
    ) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (["pending", "new", "in use", "contacted"].includes(value)) {
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    if (["cancelled", "canceled", "failed", "absent", "inactive"].includes(value)) {
      return "bg-rose-50 text-rose-700 ring-rose-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
  };

  const tableClass =
    "min-w-full divide-y divide-slate-100 text-left text-sm";

  const thClass =
    "whitespace-nowrap bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500";

  const tdClass = "whitespace-nowrap px-4 py-4 text-slate-600";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* Header */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BarChart3 size={17} />
              STUDIO MANAGEMENT
            </div>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Monitor your studio performance, revenue, expenses, bookings and
              business activity from one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <CalendarDays size={18} className="text-blue-600" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none"
                aria-label="Select report month"
              />
            </div>

            <button
              type="button"
              onClick={loadReports}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Demo notice */}
        {isUsingDemoData && (
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <FileText size={20} />
              </div>

              <div>
                <p className="font-bold text-blue-900">
                  Demo preview is enabled
                </p>
                <p className="mt-1 text-sm leading-5 text-blue-700">
                  Empty sections display sample data for preview. Your real
                  localStorage records are not changed.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDemo((value) => !value)}
              className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
            >
              {showDemo ? "Hide Demo Data" : "Show Demo Data"}
            </button>
          </div>
        )}

        {!isUsingDemoData && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={21} className="text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Report data loaded
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Last updated: {lastUpdated.toLocaleTimeString("en-IN")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDemo((value) => !value)}
              className="text-left text-sm font-bold text-blue-600 hover:text-blue-800 sm:text-right"
            >
              {showDemo ? "Demo fallback enabled" : "Demo fallback disabled"}
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Overview — {formatMonth(selectedMonth)}
          </h2>

          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            Updated {lastUpdated.toLocaleTimeString("en-IN")}
          </span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={money(monthly.revenue)}
            subtitle={`${monthly.payments.length} payment records this month`}
            icon={TrendingUp}
            color="green"
          />

          <StatCard
            title="Total Expenses"
            value={money(monthly.expenseTotal)}
            subtitle={`${monthly.expenses.length} expense records this month`}
            icon={TrendingDown}
            color="red"
          />

          <StatCard
            title="Net Profit"
            value={money(monthly.profit)}
            subtitle="Revenue minus recorded expenses"
            icon={IndianRupee}
            color={monthly.profit >= 0 ? "blue" : "red"}
          />

          <StatCard
            title="Pending Payments"
            value={money(monthly.pendingAmount)}
            subtitle={`${monthly.pendingCount} pending payment records`}
            icon={Wallet}
            color="purple"
          />

          <StatCard
            title="Bookings"
            value={numberFormat(monthly.bookings.length)}
            subtitle={`${monthly.confirmedBookings} confirmed or completed`}
            icon={Camera}
            color="cyan"
          />

          <StatCard
            title="New Customers"
            value={numberFormat(monthly.customers.length)}
            subtitle="Customer records created this month"
            icon={Users}
            color="blue"
          />

          <StatCard
            title="Enquiries"
            value={numberFormat(monthly.enquiries.length)}
            subtitle="Enquiries received this month"
            icon={ClipboardList}
            color="amber"
          />

          <StatCard
            title="Attendance Records"
            value={numberFormat(monthly.attendance.length)}
            subtitle="Attendance entries this month"
            icon={Clock}
            color="purple"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <SectionTitle
              icon={BarChart3}
              title="Revenue & Expense Activity"
              description={`Daily financial activity for ${formatMonth(
                selectedMonth
              )}`}
            />

            <div className="flex flex-wrap gap-4 pb-5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-full bg-blue-600" />
                Revenue
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                Expenses
              </div>
            </div>

            {monthlyActivity.length > 0 ? (
              <div className="flex h-64 items-end gap-2 border-b border-l border-slate-200 px-2 pb-2 pt-4 sm:gap-4">
                {monthlyActivity.map((item) => (
                  <div
                    key={item.day}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    title={`Day ${item.day}: Revenue ${money(
                      item.revenue
                    )}, Expenses ${money(item.expenses)}`}
                  >
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <div
                        className="w-[42%] max-w-5 rounded-t-md bg-blue-600 transition-all duration-500 hover:bg-blue-700"
                        style={{
                          height: `${Math.max(
                            item.revenue > 0 ? 4 : 0,
                            (item.revenue / maxActivity) * 100
                          )}%`,
                        }}
                      />
                      <div
                        className="w-[42%] max-w-5 rounded-t-md bg-rose-400 transition-all duration-500 hover:bg-rose-500"
                        style={{
                          height: `${Math.max(
                            item.expenses > 0 ? 4 : 0,
                            (item.expenses / maxActivity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 sm:text-xs">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                No financial activity for this month.
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-slate-400">
              The chart uses the selected month's payment and expense records.
              Hover over a bar to view its daily totals.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <SectionTitle
              icon={Wallet}
              title="Payment Methods"
              description="Revenue by payment method"
            />

            {paymentMethodSummary.length > 0 ? (
              <div className="space-y-5">
                {paymentMethodSummary.map(([method, amount]) => {
                  const percentage =
                    monthly.revenue > 0
                      ? Math.min(100, (amount / monthly.revenue) * 100)
                      : 0;

                  return (
                    <div key={method}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-700">
                          {method}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {money(amount)}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Collected revenue</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {money(monthly.revenue)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-48 items-center justify-center text-center text-sm text-slate-400">
                No payment method records found.
              </div>
            )}
          </div>
        </div>

        {/* Payments and expenses */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
              <SectionTitle
                icon={Receipt}
                title="Recent Payments"
                description="Payments for the selected month"
              />
              <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {monthly.payments.length} records
              </span>
            </div>

            {monthly.payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Customer</th>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Amount</th>
                      <th className={thClass}>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...monthly.payments]
                      .sort(
                        (a, b) =>
                          new Date(getDate(b)) - new Date(getDate(a))
                      )
                      .slice(0, 8)
                      .map((item, index) => {
                        const status =
                          item.status || item.paymentStatus || "Paid";

                        return (
                          <tr
                            key={item.id || item._id || `payment-${index}`}
                            className="transition hover:bg-slate-50"
                          >
                            <td className={`${tdClass} font-semibold text-slate-800`}>
                              {getName(item)}
                            </td>
                            <td className={tdClass}>
                              {formatDate(getDate(item))}
                            </td>
                            <td className={`${tdClass} font-bold text-slate-900`}>
                              {money(getAmount(item))}
                            </td>
                            <td className={tdClass}>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${badgeClass(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                No payments found for this month.
              </div>
            )}
          </section>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 p-5 sm:p-6">
              <SectionTitle
                icon={Receipt}
                title="Recent Expenses"
                description="Expenses for the selected month"
              />
              <span className="shrink-0 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                {monthly.expenses.length} records
              </span>
            </div>

            {monthly.expenses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th className={thClass}>Expense</th>
                      <th className={thClass}>Date</th>
                      <th className={thClass}>Category</th>
                      <th className={thClass}>Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...monthly.expenses]
                      .sort(
                        (a, b) =>
                          new Date(getDate(b)) - new Date(getDate(a))
                      )
                      .slice(0, 8)
                      .map((item, index) => (
                        <tr
                          key={item.id || item._id || `expense-${index}`}
                          className="transition hover:bg-slate-50"
                        >
                          <td className={`${tdClass} font-semibold text-slate-800`}>
                            {getName(item)}
                          </td>
                          <td className={tdClass}>
                            {formatDate(getDate(item))}
                          </td>
                          <td className={tdClass}>
                            {item.category || item.type || "General"}
                          </td>
                          <td className={`${tdClass} font-bold text-rose-600`}>
                            {money(getAmount(item))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                No expenses found for this month.
              </div>
            )}
          </section>
        </div>

        {/* Bookings */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <SectionTitle
              icon={Camera}
              title="Booking Report"
              description="Photography projects and event bookings"
            />
            <div className="rounded-xl bg-blue-50 px-4 py-2">
              <span className="text-sm font-bold text-blue-700">
                {monthly.bookings.length} bookings
              </span>
            </div>
          </div>

          {monthly.bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th className={thClass}>Project / Customer</th>
                    <th className={thClass}>Booking Date</th>
                    <th className={thClass}>Event / Service</th>
                    <th className={thClass}>Amount</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...monthly.bookings]
                    .sort(
                      (a, b) =>
                        new Date(getDate(b)) - new Date(getDate(a))
                    )
                    .map((item, index) => {
                      const status = item.status || "Pending";

                      return (
                        <tr
                          key={item.id || item._id || `booking-${index}`}
                          className="transition hover:bg-slate-50"
                        >
                          <td className={`${tdClass} font-semibold text-slate-800`}>
                            {getName(item)}
                          </td>
                          <td className={tdClass}>
                            {formatDate(getDate(item))}
                          </td>
                          <td className={tdClass}>
                            {item.service ||
                              item.eventType ||
                              item.event_type ||
                              item.title ||
                              "Photography"}
                          </td>
                          <td className={`${tdClass} font-bold text-slate-900`}>
                            {money(getAmount(item))}
                          </td>
                          <td className={tdClass}>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${badgeClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-slate-400">
              No bookings found for this month.
            </div>
          )}
        </section>

        {/* Business summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
                <Users size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Customer Records</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {numberFormat(data.customers.length)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Total customer records available to the report.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <ClipboardList size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Enquiries</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {numberFormat(data.enquiries.length)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Total enquiries available in the selected data source.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Package size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Inventory Items</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {numberFormat(data.inventory.length)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Items recorded in the inventory list.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Building2 size={21} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Branches</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">
                  {numberFormat(data.branches.length)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Branch records available in the system.
            </p>
          </div>
        </div>

        {/* Bottom info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                Report Information
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Financial totals are calculated from the payment and expense
                records for the selected month. The profit shown is revenue
                minus recorded expenses; it does not include unrecorded costs.
                Customer, inventory, equipment and branch counts show the
                records available in the selected data source. When a storage
                collection is empty, demo preview records can be used to help
                review the interface.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Last refreshed: {lastUpdated.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
