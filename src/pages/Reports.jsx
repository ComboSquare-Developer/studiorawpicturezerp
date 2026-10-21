
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  Users,
  MessageSquare,
  Boxes,
  Camera,
  UserCheck,
  Building2,
  Download,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  IndianRupee,
  PieChart,
  FileSpreadsheet,
  CheckCircle2,
  Clock3,
} from "lucide-react";

const KEYS = {
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

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function currentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function money(value) {
  const number = Number(value || 0);

  return `₹${(Number.isFinite(number) ? number : 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
}

function safeNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function getDate(record, fields) {
  for (const field of fields) {
    if (record?.[field]) {
      return String(record[field]).slice(0, 10);
    }
  }

  return "";
}

function paymentAmount(payment) {
  return safeNumber(
    payment.paidAmount ??
      payment.amountPaid ??
      payment.advance ??
      payment.amount ??
      0
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatMonth(value) {
  if (!value) return "All Months";

  const [year, month] = value.split("-").map(Number);

  if (!year || !month) return value;

  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function ProgressItem({
  label,
  value,
  percentage,
  color = "bg-[#10264d]",
}) {
  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 break-words text-sm font-medium text-[#52627d]">
          {label}
        </p>

        <p className="shrink-0 text-sm font-bold text-[#10264d]">
          {money(value)}
        </p>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#edf2f8]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{
            width: `${Math.max(
              0,
              Math.min(100, percentage)
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#e8edf5] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div
        className={`absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-50 ${stat.bg}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#72819a]">
            {stat.label}
          </p>

          <h3
            className={`mt-4 break-words text-2xl font-bold tracking-tight sm:text-[27px] ${stat.color}`}
          >
            {stat.value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.bg}`}
        >
          <Icon size={22} className={stat.color} />
        </div>
      </div>

      <div className="relative mt-5 h-1 w-12 rounded-full bg-[#e9eef7] transition-all group-hover:w-20">
        <div
          className={`h-full w-full rounded-full ${stat.bar}`}
        />
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6 flex min-w-0 items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#174b91]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h2 className="break-words text-base font-bold text-[#10264d] sm:text-lg">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-[#8794a8] sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const [month, setMonth] = useState(currentMonth);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const data = useMemo(() => {
    const result = {};

    Object.entries(KEYS).forEach(([name, key]) => {
      result[name] = readArray(key);
    });

    return result;
  }, [refreshKey]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        !event.key ||
        Object.values(KEYS).includes(event.key)
      ) {
        setRefreshKey((previous) => previous + 1);
      }
    };

    window.addEventListener("storage", handleStorage);

    return () =>
      window.removeEventListener("storage", handleStorage);
  }, []);

  const report = useMemo(() => {
    const monthlyPayments = data.payments.filter((item) =>
      getDate(item, [
        "paymentDate",
        "date",
        "createdAt",
      ]).startsWith(month)
    );

    const monthlyExpenses = data.expenses.filter((item) =>
      getDate(item, [
        "date",
        "expenseDate",
        "createdAt",
      ]).startsWith(month)
    );

    const monthlyBookings = data.bookings.filter((item) =>
      getDate(item, [
        "eventDate",
        "bookingDate",
        "date",
        "createdAt",
      ]).startsWith(month)
    );

    const monthlyAttendance = data.attendance.filter((item) =>
      getDate(item, ["date", "attendanceDate"]).startsWith(
        month
      )
    );

    const income = monthlyPayments.reduce(
      (sum, item) => sum + paymentAmount(item),
      0
    );

    const expenses = monthlyExpenses.reduce(
      (sum, item) => sum + safeNumber(item.amount),
      0
    );

    const profit = income - expenses;

    const lowStock = data.inventory.filter(
      (item) =>
        safeNumber(item.quantity) <=
        safeNumber(item.minimumStock)
    ).length;

    const equipmentInUse = data.equipment.filter(
      (item) => item.status === "In Use"
    ).length;

    const activeBranches = data.branches.filter(
      (item) => item.status === "Active"
    ).length;

    const attendancePresent = monthlyAttendance.filter(
      (item) => item.status === "Present"
    ).length;

    const expenseByCategory = monthlyExpenses.reduce(
      (result, item) => {
        const category = item.category || "Other";

        result[category] =
          (result[category] || 0) +
          safeNumber(item.amount);

        return result;
      },
      {}
    );

    const totalBilling = monthlyPayments.reduce(
      (sum, item) =>
        sum +
        safeNumber(
          item.total ??
            item.totalAmount ??
            item.billAmount ??
            item.amount ??
            0
        ),
      0
    );

    const pendingBalance = monthlyPayments.reduce(
      (sum, item) => {
        const total = safeNumber(
          item.total ??
            item.totalAmount ??
            item.billAmount ??
            0
        );

        const received = paymentAmount(item);

        return sum + Math.max(0, total - received);
      },
      0
    );

    return {
      income,
      expenses,
      profit,
      totalBilling,
      pendingBalance,
      bookings: monthlyBookings.length,
      customers: data.customers.length,
      leads: data.enquiries.length,
      lowStock,
      equipmentInUse,
      activeBranches,
      attendancePresent,
      expenseByCategory,
      paymentCount: monthlyPayments.length,
      expenseCount: monthlyExpenses.length,
    };
  }, [data, month]);

  const stats = [
    {
      label: "Monthly Revenue",
      value: money(report.income),
      icon: TrendingUp,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
    },
    {
      label: "Monthly Expenses",
      value: money(report.expenses),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      bar: "bg-red-500",
    },
    {
      label: "Estimated Profit",
      value: money(report.profit),
      icon: Wallet,
      color:
        report.profit >= 0
          ? "text-blue-700"
          : "text-red-600",
      bg:
        report.profit >= 0
          ? "bg-blue-50"
          : "bg-red-50",
      bar:
        report.profit >= 0
          ? "bg-blue-600"
          : "bg-red-500",
    },
    {
      label: "Monthly Bookings",
      value: report.bookings,
      icon: CalendarDays,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      bar: "bg-indigo-500",
    },
    {
      label: "Total Customers",
      value: report.customers,
      icon: Users,
      color: "text-blue-700",
      bg: "bg-blue-50",
      bar: "bg-blue-600",
    },
    {
      label: "Total Leads",
      value: report.leads,
      icon: MessageSquare,
      color: "text-violet-700",
      bg: "bg-violet-50",
      bar: "bg-violet-500",
    },
    {
      label: "Low Stock Items",
      value: report.lowStock,
      icon: Boxes,
      color: "text-amber-700",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
    },
    {
      label: "Equipment In Use",
      value: report.equipmentInUse,
      icon: Camera,
      color: "text-blue-700",
      bg: "bg-blue-50",
      bar: "bg-blue-500",
    },
    {
      label: "Present Attendance Entries",
      value: report.attendancePresent,
      icon: UserCheck,
      color: "text-green-700",
      bg: "bg-green-50",
      bar: "bg-green-500",
    },
    {
      label: "Active Branches",
      value: report.activeBranches,
      icon: Building2,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
      bar: "bg-indigo-500",
    },
  ];

  const categories = Object.entries(
    report.expenseByCategory
  ).sort((a, b) => b[1] - a[1]);

  const financialItems = [
    {
      label: "Revenue",
      value: report.income,
      color: "bg-emerald-500",
    },
    {
      label: "Expenses",
      value: report.expenses,
      color: "bg-red-500",
    },
    {
      label: "Positive Profit",
      value: Math.max(report.profit, 0),
      color: "bg-blue-700",
    },
  ];

  const financialMax = Math.max(
    report.income,
    report.expenses,
    Math.max(report.profit, 0),
    1
  );

  const operations = [
    {
      label: "Bookings This Month",
      value: report.bookings,
      icon: CalendarDays,
    },
    {
      label: "Registered Customers",
      value: report.customers,
      icon: Users,
    },
    {
      label: "Enquiries & Leads",
      value: report.leads,
      icon: MessageSquare,
    },
    {
      label: "Low Stock Alerts",
      value: report.lowStock,
      icon: Boxes,
    },
    {
      label: "Equipment Currently In Use",
      value: report.equipmentInUse,
      icon: Camera,
    },
    {
      label: "Active Studio Branches",
      value: report.activeBranches,
      icon: Building2,
    },
  ];

  const refreshReports = () => {
    setRefreshKey((previous) => previous + 1);

    setLastUpdated(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const exportCSV = () => {
    const rows = [
      ["Studio Raw Picturez - Reports", formatMonth(month)],
      [],
      ["Financial Report", "Amount"],
      ["Revenue", report.income],
      ["Expenses", report.expenses],
      ["Estimated Profit", report.profit],
      ["Total Billing", report.totalBilling],
      ["Pending Balance", report.pendingBalance],
      [],
      ["Operational Report", "Count"],
      ["Bookings", report.bookings],
      ["Customers", report.customers],
      ["Leads", report.leads],
      ["Low Stock", report.lowStock],
      ["Equipment In Use", report.equipmentInUse],
      ["Present Attendance Entries", report.attendancePresent],
      ["Active Branches", report.activeBranches],
      [],
      ["Expense Category", "Amount"],
      ...categories,
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `studioraw-report-${month}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-[#f7f9fc] px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white shadow-sm">
            <BarChart3 size={24} />
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
              Reports & Analytics
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#8190a7]">
              Studio performance and business overview
            </p>
          </div>
        </div>

        {/* Report Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <div className="w-full sm:w-56">
            <label className="mb-2 block text-xs font-semibold text-[#52627d]">
              Select Report Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={refreshReports}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50 sm:w-auto"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] sm:w-auto"
          >
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/* Reporting Period */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7edf6] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <CalendarDays size={19} />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">
              Reporting Period
            </p>

            <p className="mt-1 text-sm font-bold text-[#10264d]">
              {formatMonth(month)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 size={15} className="text-green-600" />
          Last refreshed at {lastUpdated}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.slice(0, 4).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.slice(4).map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Financial Overview + Expense Breakdown */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Financial Overview */}
        <section className="min-w-0 rounded-2xl border border-[#e7edf6] bg-white p-5 shadow-sm sm:p-7">
          <SectionTitle
            icon={BarChart3}
            title="Financial Overview"
            subtitle="Revenue, expenses and estimated profit comparison"
          />

          <div className="space-y-7">
            {financialItems.map((item) => (
              <ProgressItem
                key={item.label}
                label={item.label}
                value={item.value}
                percentage={(item.value / financialMax) * 100}
                color={item.color}
              />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                <IndianRupee size={15} />
                Total Billing
              </div>

              <p className="mt-3 break-words text-xl font-bold text-[#10264d]">
                {money(report.totalBilling)}
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
                <Clock3 size={15} />
                Pending Balance
              </div>

              <p className="mt-3 break-words text-xl font-bold text-[#10264d]">
                {money(report.pendingBalance)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#f7f9fc] p-4">
            {report.profit >= 0 ? (
              <ArrowUpRight
                size={20}
                className="shrink-0 text-emerald-600"
              />
            ) : (
              <ArrowDownRight
                size={20}
                className="shrink-0 text-red-600"
              />
            )}

            <p className="text-xs leading-6 text-slate-500">
              Estimated profit for {formatMonth(month)} is{" "}
              <span className="font-bold text-[#10264d]">
                {money(report.profit)}
              </span>
              . This is based on recorded payment and expense
              values.
            </p>
          </div>
        </section>

        {/* Expense Breakdown */}
        <section className="min-w-0 rounded-2xl border border-[#e7edf6] bg-white p-5 shadow-sm sm:p-7">
          <SectionTitle
            icon={PieChart}
            title="Expense Category Breakdown"
            subtitle="Category-wise monthly spending analysis"
          />

          {categories.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-slate-50 p-5">
                <PieChart size={35} className="text-slate-300" />
              </div>

              <p className="text-sm font-semibold text-slate-500">
                No expenses recorded
              </p>

              <p className="mt-2 text-xs text-slate-400">
                No expense data available for {formatMonth(month)}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map(([category, amount]) => (
                <ProgressItem
                  key={category}
                  label={category}
                  value={amount}
                  percentage={
                    report.expenses > 0
                      ? (amount / report.expenses) * 100
                      : 0
                  }
                  color="bg-[#112e60]"
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Operational Summary */}
      <section className="min-w-0 rounded-2xl border border-[#e7edf6] bg-white p-5 shadow-sm sm:p-7">
        <SectionTitle
          icon={Activity}
          title="Operational Summary"
          subtitle="Business activity and resource overview"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operations.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="group flex min-w-0 items-center justify-between gap-4 rounded-xl border border-[#edf1f7] bg-[#f9fbfe] p-5 transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div className="min-w-0">
                  <p className="break-words text-xs font-medium leading-5 text-[#72819a]">
                    {item.label}
                  </p>

                  <p className="mt-3 text-2xl font-bold text-[#10264d]">
                    {item.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <Icon size={20} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Report Data Summary */}
      <section className="min-w-0 rounded-2xl border border-[#e7edf6] bg-white p-5 shadow-sm sm:p-7">
        <SectionTitle
          icon={FileSpreadsheet}
          title="Monthly Report Summary"
          subtitle="Summary of records used for financial reporting"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-blue-50 p-5">
            <p className="text-xs font-medium text-blue-700">
              Payment Records
            </p>

            <p className="mt-3 text-2xl font-bold text-[#10264d]">
              {report.paymentCount}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-5">
            <p className="text-xs font-medium text-red-700">
              Expense Records
            </p>

            <p className="mt-3 text-2xl font-bold text-[#10264d]">
              {report.expenseCount}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-50 p-5">
            <p className="text-xs font-medium text-indigo-700">
              Monthly Bookings
            </p>

            <p className="mt-3 text-2xl font-bold text-[#10264d]">
              {report.bookings}
            </p>
          </div>
        </div>
      </section>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 sm:p-5">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-amber-700"
        />

        <p className="min-w-0 break-words text-xs leading-6 text-amber-900">
          These reports use data saved in this browser. Revenue
          includes the received or advance amount recorded in
          Payments. Additional payments are included in the
          invoice's current received total, so they are
          attributed to the invoice date rather than their
          individual transaction dates. Estimated profit is
          recorded income minus recorded expenses, not an
          audited financial statement. Customer, lead,
          equipment and branch counts are overall totals;
          bookings and financial values use the selected month.
        </p>
      </div>
    </div>
  );
}

