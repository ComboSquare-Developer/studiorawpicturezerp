import { api } from "../api/client";
import {
  calculateCategoryBreakdown,
  calculateMonthlyExpenseTotal,
  calculateMonthlyIncome,
  formatCurrency,
  getDeduplicatedMonthlyExpenses,
  getInvoiceBalance,
  getInvoiceReceived,
  getInvoiceStatus,
  getInvoiceTotal,
  getStoredStaff,
  normalizeDate,
  parseAmount,
} from "./financialService";

/**
 * Studio Raw Picturez - Read-Only AI Assistant Data Access Layer
 *
 * Strictly read-only. Reuses existing api.* services and financialService.js
 * calculations so every figure matches Dashboard, Payments, Expenses, and Reports.
 */

const INVALID_INVOICE_STATUSES = new Set(["cancelled", "canceled"]);
const INVALID_PAYMENT_FOR_RECEIVED = new Set(["failed", "unpaid"]);

function pad2(num) {
  return String(num).padStart(2, "0");
}

export function formatDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function formatMonthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

export function formatMonthLabel(monthKey) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey || "";
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateLabel(dateKey) {
  if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return dateKey || "";
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Resolve a natural-language or structured period into exact date bounds.
 */
export function resolvePeriod(period = { type: "this_month" }, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const type = period?.type || "this_month";

  if (type === "today") {
    const key = formatDateKey(today);
    return {
      type: "today",
      label: `Today (${formatDateLabel(key)})`,
      startDate: key,
      endDate: key,
      monthKey: formatMonthKey(today),
    };
  }

  if (type === "yesterday") {
    const yest = new Date(today);
    yest.setDate(today.getDate() - 1);
    const key = formatDateKey(yest);
    return {
      type: "yesterday",
      label: `Yesterday (${formatDateLabel(key)})`,
      startDate: key,
      endDate: key,
      monthKey: formatMonthKey(yest),
    };
  }

  if (type === "this_week" || type === "last_week") {
    const dayOfWeek = today.getDay(); // 0 = Sun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(today);
    start.setDate(today.getDate() + mondayOffset + (type === "last_week" ? -7 : 0));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const startKey = formatDateKey(start);
    const endKey = formatDateKey(end);
    return {
      type,
      label: `${type === "last_week" ? "Last Week" : "This Week"} (${formatDateLabel(startKey)} – ${formatDateLabel(endKey)})`,
      startDate: startKey,
      endDate: endKey,
      monthKey: formatMonthKey(start),
    };
  }

  if (type === "previous_month") {
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const monthKey = formatMonthKey(prev);
    const lastDay = new Date(prev.getFullYear(), prev.getMonth() + 1, 0);
    return {
      type: "previous_month",
      label: formatMonthLabel(monthKey),
      monthKey,
      startDate: `${monthKey}-01`,
      endDate: formatDateKey(lastDay),
    };
  }

  if (type === "next_month") {
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const monthKey = formatMonthKey(next);
    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0);
    return {
      type: "next_month",
      label: formatMonthLabel(monthKey),
      monthKey,
      startDate: `${monthKey}-01`,
      endDate: formatDateKey(lastDay),
    };
  }

  if (type === "month" && period.monthKey) {
    const [y, m] = period.monthKey.split("-").map(Number);
    const lastDay = new Date(y, m, 0);
    return {
      type: "month",
      label: formatMonthLabel(period.monthKey),
      monthKey: period.monthKey,
      startDate: `${period.monthKey}-01`,
      endDate: formatDateKey(lastDay),
    };
  }

  if (type === "this_year" || (type === "year" && period.year)) {
    const year = period.year || today.getFullYear();
    return {
      type: "year",
      year,
      label: `Year ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  }

  if (type === "date" && period.dateKey) {
    return {
      type: "date",
      label: formatDateLabel(period.dateKey),
      startDate: period.dateKey,
      endDate: period.dateKey,
      monthKey: period.dateKey.slice(0, 7),
    };
  }

  if (type === "range" && period.startDate && period.endDate) {
    return {
      type: "range",
      label: `${formatDateLabel(period.startDate)} – ${formatDateLabel(period.endDate)}`,
      startDate: period.startDate,
      endDate: period.endDate,
    };
  }

  if (type === "all") {
    return {
      type: "all",
      label: "All recorded periods",
      startDate: null,
      endDate: null,
    };
  }

  const monthKey = formatMonthKey(today);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    type: "this_month",
    label: formatMonthLabel(monthKey),
    monthKey,
    startDate: `${monthKey}-01`,
    endDate: formatDateKey(lastDay),
  };
}

function isDateInPeriod(rawDate, resolvedPeriod) {
  if (!resolvedPeriod || resolvedPeriod.type === "all") return true;
  const dateKey = normalizeDate(rawDate);
  if (!dateKey) return false;
  if (resolvedPeriod.startDate && dateKey < resolvedPeriod.startDate) return false;
  if (resolvedPeriod.endDate && dateKey > resolvedPeriod.endDate) return false;
  return true;
}

async function safeList(resource) {
  try {
    const res = await resource.list();
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
}

/* ==========================================
   A. FINANCIAL DATA (READ-ONLY)
========================================== */

export async function getMonthlyExpensesSummary(periodInput = { type: "this_month" }) {
  const period = resolvePeriod(periodInput);
  const allExpenses = await safeList(api.expenses);

  if (period.monthKey && ["this_month", "previous_month", "next_month", "month"].includes(period.type)) {
    const deduped = getDeduplicatedMonthlyExpenses(allExpenses, period.monthKey);
    const total = calculateMonthlyExpenseTotal(allExpenses, period.monthKey);
    const breakdown = calculateCategoryBreakdown(deduped);
    const salaryItems = deduped.filter(
      (item) => String(item.category || "").trim().toLowerCase() === "staff salary"
    );
    const salaryTotal = Math.round(
      salaryItems.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 100
    ) / 100;

    return {
      periodLabel: period.label,
      monthKey: period.monthKey,
      total,
      formattedTotal: formatCurrency(total),
      count: deduped.length,
      salaryTotal,
      formattedSalaryTotal: formatCurrency(salaryTotal),
      salaryCount: salaryItems.length,
      breakdown,
    };
  }

  const filtered = allExpenses.filter((item) =>
    isDateInPeriod(item.date || item.expense_date || item.createdAt, period)
  );
  const total = Math.round(
    filtered.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 100
  ) / 100;
  const breakdown = calculateCategoryBreakdown(filtered);
  const salaryItems = filtered.filter(
    (item) => String(item.category || "").trim().toLowerCase() === "staff salary"
  );
  const salaryTotal = Math.round(
    salaryItems.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 100
  ) / 100;

  return {
    periodLabel: period.label,
    total,
    formattedTotal: formatCurrency(total),
    count: filtered.length,
    salaryTotal,
    formattedSalaryTotal: formatCurrency(salaryTotal),
    salaryCount: salaryItems.length,
    breakdown,
  };
}

export async function getPaymentsSummary(periodInput = { type: "all" }) {
  const period = resolvePeriod(periodInput);
  const allPayments = await safeList(api.payments);

  const validInvoices = allPayments.filter((invoice) => {
    const s = String(invoice?.status || invoice?.paymentStatus || "").trim().toLowerCase();
    return !INVALID_INVOICE_STATUSES.has(s);
  });

  // Overall totals (matches Dashboard & Payments reconciliation)
  const overallBilled = Math.round(
    validInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0) * 100
  ) / 100;
  const overallReceived = Math.round(
    validInvoices.reduce((sum, inv) => {
      const st = getInvoiceStatus(inv).toLowerCase();
      if (INVALID_PAYMENT_FOR_RECEIVED.has(st)) return sum;
      return sum + getInvoiceReceived(inv);
    }, 0) * 100
  ) / 100;
  const overallPending = Math.max(0, Math.round((overallBilled - overallReceived) * 100) / 100);

  // Period-specific received amount
  let periodReceived = overallReceived;
  if (period.monthKey && ["this_month", "previous_month", "next_month", "month"].includes(period.type)) {
    periodReceived = calculateMonthlyIncome(validInvoices, period.monthKey);
  } else if (period.type !== "all") {
    periodReceived = 0;
    for (const inv of validInvoices) {
      if (Array.isArray(inv.transactions) && inv.transactions.length > 0) {
        for (const tx of inv.transactions) {
          if (isDateInPeriod(tx.date || tx.paymentDate || tx.createdAt, period)) {
            const st = String(tx.status || "").toLowerCase();
            if (!["failed", "cancelled", "canceled", "refunded", "void", "reversed"].includes(st)) {
              const amt = parseAmount(tx.amount ?? tx.paidAmount);
              periodReceived += st === "refund" || String(tx.type || "").toLowerCase() === "refund" ? -amt : amt;
            }
          }
        }
      } else if (isDateInPeriod(inv.date || inv.paymentDate || inv.createdAt, period)) {
        const st = getInvoiceStatus(inv).toLowerCase();
        if (!INVALID_PAYMENT_FOR_RECEIVED.has(st)) {
          periodReceived += getInvoiceReceived(inv);
        }
      }
    }
    periodReceived = Math.max(0, Math.round(periodReceived * 100) / 100);
  }

  // Payment method breakdown
  const methodMap = new Map();
  for (const inv of validInvoices) {
    if (Array.isArray(inv.transactions) && inv.transactions.length > 0) {
      for (const tx of inv.transactions) {
        if (period.type !== "all" && !isDateInPeriod(tx.date || tx.paymentDate || tx.createdAt, period)) {
          continue;
        }
        const st = String(tx.status || "").toLowerCase();
        if (["failed", "cancelled", "canceled", "refunded", "void", "reversed", "refund"].includes(st)) {
          continue;
        }
        const method = String(tx.paymentMode || tx.paymentMethod || tx.method || inv.paymentMode || "Other").trim() || "Other";
        methodMap.set(method, (methodMap.get(method) || 0) + parseAmount(tx.amount ?? tx.paidAmount));
      }
    } else if (period.type === "all" || isDateInPeriod(inv.date || inv.paymentDate || inv.createdAt, period)) {
      const rec = getInvoiceReceived(inv);
      if (rec > 0) {
        const method = String(inv.paymentMode || inv.paymentMethod || inv.payment_method || "Other").trim() || "Other";
        methodMap.set(method, (methodMap.get(method) || 0) + rec);
      }
    }
  }

  const paymentMethods = Array.from(methodMap.entries())
    .map(([method, amount]) => ({
      method,
      amount: Math.round(amount * 100) / 100,
      formattedAmount: formatCurrency(amount),
    }))
    .sort((a, b) => b.amount - a.amount);

  const pendingInvoices = validInvoices
    .filter((inv) => getInvoiceBalance(inv) > 0)
    .map((inv) => ({
      id: inv.id || inv.invoiceNo || "INV",
      customer: inv.customer || inv.customerName || inv.clientName || "Customer",
      balance: getInvoiceBalance(inv),
      formattedBalance: formatCurrency(getInvoiceBalance(inv)),
      status: getInvoiceStatus(inv),
    }));

  return {
    periodLabel: period.label,
    invoiceCount: validInvoices.length,
    overallBilled,
    formattedOverallBilled: formatCurrency(overallBilled),
    overallReceived,
    formattedOverallReceived: formatCurrency(overallReceived),
    overallPending,
    formattedOverallPending: formatCurrency(overallPending),
    periodReceived,
    formattedPeriodReceived: formatCurrency(periodReceived),
    pendingInvoiceCount: pendingInvoices.length,
    pendingInvoices: pendingInvoices.slice(0, 5),
    paymentMethods,
  };
}

/* ==========================================
   B. BOOKING DATA (READ-ONLY)
========================================== */

export async function getBookingsSummary(periodInput = { type: "all" }) {
  const period = resolvePeriod(periodInput);
  const allBookings = await safeList(api.bookings);
  const todayKey = formatDateKey(new Date());

  const filtered = period.type === "all"
    ? allBookings
    : allBookings.filter((b) =>
        isDateInPeriod(b.date || b.eventDate || b.event_date || b.createdAt, period)
      );

  const countByStatus = {
    confirmed: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const b of filtered) {
    const st = String(b.status || "").trim().toLowerCase();
    if (st === "confirmed") countByStatus.confirmed += 1;
    else if (st === "pending") countByStatus.pending += 1;
    else if (st === "completed") countByStatus.completed += 1;
    else if (st === "cancelled" || st === "canceled") countByStatus.cancelled += 1;
  }

  const todayBookings = allBookings.filter(
    (b) => normalizeDate(b.date || b.eventDate || b.event_date) === todayKey
  );

  const items = filtered.slice(0, 6).map((b) => ({
    id: b.id || "BK",
    customer: b.customer || b.customerName || b.name || "Customer",
    event: b.event || b.service || b.eventType || "Shoot",
    date: formatDateLabel(normalizeDate(b.date || b.eventDate || b.event_date)),
    status: b.status || "Pending",
  }));

  return {
    periodLabel: period.label,
    total: filtered.length,
    overallTotal: allBookings.length,
    ...countByStatus,
    todayCount: todayBookings.length,
    todayItems: todayBookings.slice(0, 5).map((b) => ({
      id: b.id || "BK",
      customer: b.customer || b.customerName || b.name || "Customer",
      event: b.event || b.service || b.eventType || "Shoot",
      status: b.status || "Pending",
    })),
    items,
  };
}

/* ==========================================
   C. CUSTOMER DATA (READ-ONLY)
========================================== */

export async function getCustomersSummary() {
  const customers = await safeList(api.customers);
  const uniqueKeys = new Set();
  const cityCounts = new Map();

  for (const c of customers) {
    const key = String(c.id || c.customerId || c.phone || c.mobile || c.name || "").trim().toLowerCase();
    if (key) uniqueKeys.add(key);

    const city = String(c.city || c.location || "").trim();
    if (city) {
      cityCounts.set(city, (cityCounts.get(city) || 0) + 1);
    }
  }

  const total = uniqueKeys.size || customers.length;
  const topCities = Array.from(cityCounts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recent = [...customers]
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
    .slice(0, 5)
    .map((c) => ({
      id: c.id || "CUS",
      name: c.name || c.customerName || "Customer",
      city: c.city || c.location || "—",
    }));

  return {
    total,
    topCities,
    recent,
  };
}

/* ==========================================
   D. ENQUIRY DATA (READ-ONLY)
========================================== */

export async function getEnquiriesSummary(periodInput = { type: "all" }) {
  const period = resolvePeriod(periodInput);
  const allEnquiries = await safeList(api.enquiries);

  const filtered = period.type === "all"
    ? allEnquiries
    : allEnquiries.filter((e) =>
        isDateInPeriod(e.date || e.eventDate || e.enquiryDate || e.createdAt, period)
      );

  let confirmed = 0;
  let pending = 0;
  let cancelled = 0;
  const byService = new Map();
  const byCity = new Map();

  for (const e of filtered) {
    const st = String(e.status || "New").trim().toLowerCase();
    if (st === "confirmed" || st === "converted") confirmed += 1;
    else if (st === "cancelled" || st === "canceled" || st === "lost" || st === "closed") cancelled += 1;
    else pending += 1;

    const service = String(e.service || e.customService || "General").trim() || "General";
    byService.set(service, (byService.get(service) || 0) + 1);

    const city = String(e.city || "").trim();
    if (city) byCity.set(city, (byCity.get(city) || 0) + 1);
  }

  return {
    periodLabel: period.label,
    total: filtered.length,
    confirmed,
    pending,
    cancelled,
    byService: Array.from(byService.entries())
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    byCity: Array.from(byCity.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    recent: filtered.slice(0, 5).map((e) => ({
      id: e.id || "ENQ",
      name: e.name || e.customerName || "Lead",
      service: e.service || e.customService || "General",
      status: e.status || "New",
    })),
  };
}

/* ==========================================
   E. STAFF DATA (READ-ONLY, ROLE-CHECKED)
========================================== */

export async function getStaffSummary(user) {
  const apiStaff = await safeList(api.staff);
  const storedStaff = getStoredStaff();
  const staffList = apiStaff.length ? apiStaff : storedStaff;

  const isAuthorizedForSalary =
    Boolean(user?.is_superuser) ||
    String(user?.role || "").toLowerCase().includes("admin");

  let active = 0;
  let inactive = 0;

  const directory = staffList.map((s) => {
    const st = String(s.status || "Active").trim().toLowerCase();
    const isActive = st !== "inactive" && st !== "on leave";
    if (isActive) active += 1;
    else inactive += 1;

    const entry = {
      id: s.employee_id || s.id || "STF",
      name: s.staff_name || s.name || "Staff Member",
      role: s.specialization || s.role || "Staff",
      status: isActive ? "Active" : "Inactive",
    };

    if (isAuthorizedForSalary) {
      entry.salary = formatCurrency(parseAmount(s.salary));
    }

    return entry;
  });

  return {
    total: staffList.length,
    active,
    inactive,
    isAuthorizedForSalary,
    directory: directory.slice(0, 8),
  };
}

/* ==========================================
   F. INVENTORY & EQUIPMENT (READ-ONLY)
========================================== */

export async function getInventoryAndEquipmentSummary() {
  const [inventory, equipment] = await Promise.all([
    safeList(api.inventory),
    safeList(api.equipment),
  ]);

  return {
    inventoryCount: inventory.length,
    equipmentCount: equipment.length,
    inventoryItems: inventory.slice(0, 5).map((i) => ({
      id: i.id || "INV",
      name: i.name || i.itemName || "Item",
      quantity: i.quantity ?? i.stock ?? 0,
      status: i.status || "Available",
    })),
    equipmentItems: equipment.slice(0, 5).map((e) => ({
      id: e.id || "EQP",
      name: e.name || e.equipmentName || "Equipment",
      status: e.status || "Available",
    })),
  };
}

/* ==========================================
   G. DELIVERY DATA (READ-ONLY)
========================================== */

export async function getDeliveriesSummary() {
  const deliveries = await safeList(api.deliveries);
  let pending = 0;
  let completed = 0;
  let cancelled = 0;

  for (const d of deliveries) {
    const st = String(d.status || "Pending").trim().toLowerCase();
    if (st === "delivered" || st === "completed") completed += 1;
    else if (st === "cancelled" || st === "canceled") cancelled += 1;
    else pending += 1;
  }

  return {
    total: deliveries.length,
    pending,
    completed,
    cancelled,
    recent: deliveries.slice(0, 5).map((d) => ({
      id: d.id || "DEL",
      customer: d.customer || d.customerName || "Customer",
      item: d.item || "Delivery",
      status: d.status || "Pending",
    })),
  };
}
