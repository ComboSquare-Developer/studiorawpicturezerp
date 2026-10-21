
import { useMemo, useState } from "react";
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getDate(record, fields) {
  for (const field of fields) {
    if (record[field]) {
      return String(record[field]).slice(0, 10);
    }
  }

  return "";
}

function paymentAmount(payment) {
  const value = Number(
    payment.paidAmount ??
      payment.amountPaid ??
      payment.amount ??
      0
  );

  return Number.isFinite(value) ? value : 0;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function FormField({ label, children }) {
  return (
    <div className="w-full min-w-0">
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </p>

      {children}
    </div>
  );
}

function ProgressItem({
  label,
  value,
  percentage,
  color = "bg-[#10264d]",
}) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-3 flex w-full min-w-0 flex-col gap-1">
        <p className="break-words text-sm font-medium text-slate-600">
          {label}
        </p>

        <p className="break-words text-sm font-bold text-[#10264d]">
          {money(value)}
        </p>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all`}
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

export default function Reports() {
  const [month, setMonth] = useState(currentMonth);
  const [refreshKey, setRefreshKey] = useState(0);

  const data = useMemo(() => {
    const result = {};

    Object.entries(KEYS).forEach(([name, key]) => {
      result[name] = readArray(key);
    });

    return result;
  }, [refreshKey]);

  const report = useMemo(() => {
    const monthlyPayments = data.payments.filter((item) =>
      getDate(item, [
        "paymentDate",
        "date",
        "createdAt",
      ]).startsWith(month)
    );

    const monthlyExpenses = data.expenses.filter((item) =>
      getDate(item, ["date", "createdAt"]).startsWith(month)
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
      String(item.date || "").startsWith(month)
    );

    const income = monthlyPayments.reduce(
      (sum, item) => sum + paymentAmount(item),
      0
    );

    const expenses = monthlyExpenses.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    const lowStock = data.inventory.filter(
      (item) =>
        Number(item.quantity || 0) <=
        Number(item.minimumStock || 0)
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
          Number(item.amount || 0);

        return result;
      },
      {}
    );

    return {
      income,
      expenses,
      profit: income - expenses,
      bookings: monthlyBookings.length,
      customers: data.customers.length,
      leads: data.enquiries.length,
      lowStock,
      equipmentInUse,
      activeBranches,
      attendancePresent,
      expenseByCategory,
    };
  }, [data, month]);

  const stats = [
    {
      label: "Monthly Revenue",
      value: money(report.income),
      icon: TrendingUp,
      color: "text-green-700",
    },
    {
      label: "Monthly Expenses",
      value: money(report.expenses),
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      label: "Estimated Profit",
      value: money(report.profit),
      icon: Wallet,
      color:
        report.profit >= 0
          ? "text-blue-700"
          : "text-red-600",
    },
    {
      label: "Monthly Bookings",
      value: report.bookings,
      icon: CalendarDays,
      color: "text-indigo-700",
    },
    {
      label: "Total Customers",
      value: report.customers,
      icon: Users,
      color: "text-blue-700",
    },
    {
      label: "Total Leads",
      value: report.leads,
      icon: MessageSquare,
      color: "text-violet-700",
    },
    {
      label: "Low Stock Items",
      value: report.lowStock,
      icon: Boxes,
      color: "text-amber-700",
    },
    {
      label: "Equipment In Use",
      value: report.equipmentInUse,
      icon: Camera,
      color: "text-blue-700",
    },
    {
      label: "Present Attendance Entries",
      value: report.attendancePresent,
      icon: UserCheck,
      color: "text-green-700",
    },
    {
      label: "Active Branches",
      value: report.activeBranches,
      icon: Building2,
      color: "text-indigo-700",
    },
  ];

  const categories = Object.entries(
    report.expenseByCategory
  ).sort((a, b) => b[1] - a[1]);

  const financialItems = [
    {
      label: "Revenue",
      value: report.income,
      color: "bg-green-500",
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
    ["Bookings This Month", report.bookings],
    ["Registered Customers", report.customers],
    ["Enquiries & Leads", report.leads],
    ["Low Stock Alerts", report.lowStock],
    ["Equipment Currently In Use", report.equipmentInUse],
    ["Active Studio Branches", report.activeBranches],
  ];

  const exportCSV = () => {
    const rows = [
      ["StudioRaw_Picturez Reports", month],
      ["Metric", "Value"],
      ["Revenue", report.income],
      ["Expenses", report.expenses],
      ["Estimated Profit", report.profit],
      ["Bookings", report.bookings],
      ["Customers", report.customers],
      ["Leads", report.leads],
      ["Low Stock", report.lowStock],
      ["Equipment In Use", report.equipmentInUse],
      [
        "Present Attendance Entries",
        report.attendancePresent,
      ],
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
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
              <BarChart3 size={23} />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold text-[#10264d]">
                Reports & Analytics
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Studio performance and business overview
              </p>
            </div>
          </div>
        </div>

        {/* Month & Actions */}
        <div className="flex w-full min-w-0 flex-col gap-3">
          <FormField label="Select Report Month">
            <input
              type="month"
              value={month}
              onChange={(event) =>
                setMonth(event.target.value)
              }
              className={inputClass}
            />
          </FormField>

          <button
            type="button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50"
          >
            <RefreshCw size={18} />
            Refresh Reports
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Financial Overview */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-6 break-words text-lg font-bold text-[#10264d]">
          Financial Overview
        </h2>

        <div className="flex w-full min-w-0 flex-col gap-6">
          {financialItems.map((item) => (
            <ProgressItem
              key={item.label}
              label={item.label}
              value={item.value}
              percentage={
                (item.value / financialMax) * 100
              }
              color={item.color}
            />
          ))}
        </div>
      </section>

      {/* Expense Category Breakdown */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-6 break-words text-lg font-bold text-[#10264d]">
          Expense Category Breakdown
        </h2>

        {categories.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No expenses recorded for this month.
          </p>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-6">
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
                color="bg-[#10264d]"
              />
            ))}
          </div>
        )}
      </section>

      {/* Operational Summary */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-5 break-words text-lg font-bold text-[#10264d]">
          Operational Summary
        </h2>

        <div className="flex w-full min-w-0 flex-col gap-4">
          {operations.map(([label, value]) => (
            <div
              key={label}
              className="w-full min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-5"
            >
              <p className="break-words text-sm font-medium text-slate-500">
                {label}
              </p>

              <p className="mt-3 break-words text-2xl font-bold text-[#10264d]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Notice */}
      <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4">
        <AlertTriangle
          size={20}
          className="mt-0.5 shrink-0 text-amber-700"
        />

        <p className="min-w-0 break-words text-xs leading-6 text-amber-900">
          These reports use data saved in this browser.
          Revenue is estimated from payment records and may
          require field mapping adjustments in Payments.jsx.
          Profit represents recorded income minus recorded
          expenses, not an audited financial statement.
          Customer, lead, equipment and branch counts are
          overall totals; bookings and financial values use
          the selected month.
        </p>
      </div>
    </div>
  );
}
