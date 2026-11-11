/**
 * Studio Raw ERP - Centralized Demo Data Service
 *
 * Implements a completely offline, frontend-only data layer for all ERP modules.
 * Reads and persists state in localStorage, supports full CRUD operations,
 * computes live dashboard/reports statistics, and emits synchronization events.
 */

import {
  demoCustomers,
  demoEnquiries,
  demoBookings,
  demoPayments,
  demoExpenses,
  demoDeliveries,
  demoEmployees,
  demoAttendance,
  demoLeaves,
  demoPayroll,
  demoDepartments,
  demoWeddingPhotography,
  demoWeddingVideography,
  demoFunctions,
  demoEvents,
  demoGifts,
  demoNotifications,
  demoSettings,
  demoDashboardData,
  demoReportSummary,
  demoEquipment,
  demoInventory,
} from "../../data/demo/index.js";

import {
  generateMonthlySalaries,
  getDeduplicatedMonthlyExpenses,
  STAFF_SALARIES,
  getInvoiceTotal,
  getInvoiceReceived,
  getInvoiceBalance,
  getInvoiceStatus,
} from "../financialService.js";

const SEED_FLAG = "studioraw_demo_seeded_v9_finance_fix";
const UPDATE_EVENT = "studioraw:data-updated";

/**
 * Staff salary configuration:
 * Default demo salary date: 1st day of every month (configurable).
 * Fixed ₹10,000/month basic salary for each of the 3 staff members.
 * Total monthly salary expense: ₹30,000.
 */
export const SALARY_CONFIG = {
  paymentDay: 1, // 1st of every month
  staffSalaries: STAFF_SALARIES,
};

export function getSalaryExpensesForMonth(monthStr, day = SALARY_CONFIG.paymentDay) {
  return generateMonthlySalaries(monthStr);
}

const STORAGE_KEYS = {
  customers: "studio_raw_customers",
  customersAlt: "studioraw_customers",
  enquiries: "studioraw_enquiries",
  bookings: "studioraw_bookings",
  payments: "studioraw_payments",
  expenses: "studioraw_expenses",
  deliveries: "studioraw_deliveries",
  staff: "studioraw_staff",
  attendance: "studioraw_attendance",
  leaves: "studioraw_leaves",
  payroll: "studioraw_payroll",
  departments: "studioraw_departments",
  weddingPhotography: "studioraw_wedding_photography",
  weddingVideography: "studioraw_wedding_videography",
  functions: "studioraw_functions_we_arrange",
  events: "studioraw_event_management",
  gifts: "studioraw_customized_gifts",
  notifications: "studioraw_notifications",
  settings: "studioraw_settings",
  branches: "studioraw_branches",
  inventory: "studioraw_inventory",
  equipment: "studioraw_equipment",
};

const demoBranches = [
  {
    id: 1,
    branch_name: "Main Branch - Nagercoil",
    branch_code: "BR-NGC-01",
    city: "Nagercoil",
    state: "Tamil Nadu",
    phone: "9876543210",
    email: "nagercoil@studiorawpicturez.com",
    address: "Main Road, Near Court Complex, Nagercoil",
    manager_name: "Divya Balakrishnan",
    status: "Active",
  },
  {
    id: 2,
    branch_name: "Chennai Creative Studio",
    branch_code: "BR-CHN-02",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "9876543211",
    email: "chennai@studiorawpicturez.com",
    address: "14 Anna Nagar West, Chennai",
    manager_name: "Rahul Verma",
    status: "Active",
  },
  {
    id: 3,
    branch_name: "Coimbatore Studio Lounge",
    branch_code: "BR-CBE-03",
    city: "Coimbatore",
    state: "Tamil Nadu",
    phone: "9876543212",
    email: "coimbatore@studiorawpicturez.com",
    address: "45 Race Course Road, Coimbatore",
    manager_name: "Vignesh Sundaram",
    status: "Active",
  },
];

// Seed initial demo data into localStorage
export function initializeDemoData(force = false) {
  try {
    if (typeof localStorage === "undefined") return;
    const isSeeded = localStorage.getItem(SEED_FLAG);
    if (isSeeded && !force) {
      return;
    }

    const setCleanData = (key, data) => {
      localStorage.setItem(key, JSON.stringify(data));
    };

    setCleanData(STORAGE_KEYS.customers, demoCustomers);
    setCleanData(STORAGE_KEYS.customersAlt, demoCustomers);
    setCleanData(STORAGE_KEYS.enquiries, demoEnquiries);
    setCleanData(STORAGE_KEYS.bookings, demoBookings);
    setCleanData(STORAGE_KEYS.payments, demoPayments);
    setCleanData(STORAGE_KEYS.deliveries, demoDeliveries);
    setCleanData(STORAGE_KEYS.staff, demoEmployees);
    setCleanData(STORAGE_KEYS.attendance, demoAttendance);
    setCleanData(STORAGE_KEYS.leaves, demoLeaves);
    setCleanData(STORAGE_KEYS.payroll, demoPayroll);
    setCleanData(STORAGE_KEYS.equipment, demoEquipment);
    setCleanData(STORAGE_KEYS.inventory, demoInventory);

    const setIfMissing = (key, data) => {
      if (force || !localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    };

    setIfMissing(STORAGE_KEYS.expenses, demoExpenses);
    setIfMissing(STORAGE_KEYS.departments, demoDepartments);
    setIfMissing(STORAGE_KEYS.weddingPhotography, demoWeddingPhotography);
    setIfMissing(STORAGE_KEYS.weddingVideography, demoWeddingVideography);
    setIfMissing(STORAGE_KEYS.functions, demoFunctions);
    setIfMissing(STORAGE_KEYS.events, demoEvents);
    setIfMissing(STORAGE_KEYS.gifts, demoGifts);
    setIfMissing(STORAGE_KEYS.notifications, demoNotifications);
    setIfMissing(STORAGE_KEYS.settings, demoSettings);
    setIfMissing(STORAGE_KEYS.branches, demoBranches);

    localStorage.setItem(SEED_FLAG, "true");
  } catch (err) {
    console.warn("Storage seed notice:", err);
  }
}

// Auto-seed immediately on module load
initializeDemoData(false);

function getStorageItems(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      for (const prop of ["data", "records", "items", "results"]) {
        if (Array.isArray(parsed[prop])) return parsed[prop];
      }
    }
    return fallback;
  } catch {
    return fallback;
  }
}

function setStorageItems(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, {
        detail: { key, count: items.length },
      })
    );
  } catch (err) {
    console.error(`Unable to persist ${key} in localStorage:`, err);
  }
}

function createGenericResource(storageKey, defaultData, idPrefix = "ID") {
  return {
    async list(params = {}) {
      let items = getStorageItems(storageKey, defaultData);

      // Support basic search
      if (params.search) {
        const query = String(params.search).toLowerCase();
        items = items.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(query)
        );
      }

      // Support status filter
      if (params.status && params.status !== "All") {
        items = items.filter(
          (item) =>
            String(item.status || item.bookingStatus || "").toLowerCase() ===
            String(params.status).toLowerCase()
        );
      }

      return items;
    },

    async get(id) {
      const items = getStorageItems(storageKey, defaultData);
      const match = items.find(
        (item) => String(item.id) === String(id) || String(item.employee_id) === String(id)
      );
      if (!match) {
        throw new Error(`Record with id ${id} not found.`);
      }
      return match;
    },

    async create(data) {
      const items = getStorageItems(storageKey, defaultData);
      const newId =
        data.id ||
        `${idPrefix}-${Date.now().toString().slice(-6)}`;

      const newItem = {
        ...data,
        id: newId,
        created_at: data.created_at || new Date().toISOString(),
      };

      const updated = [newItem, ...items];
      setStorageItems(storageKey, updated);

      return newItem;
    },

    async update(id, data) {
      const items = getStorageItems(storageKey, defaultData);
      const index = items.findIndex(
        (item) => String(item.id) === String(id) || String(item.employee_id) === String(id)
      );

      if (index === -1) {
        // If not found, append
        return this.create({ ...data, id });
      }

      const existing = items[index];
      const updatedItem = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const updated = [...items];
      updated[index] = updatedItem;
      setStorageItems(storageKey, updated);

      return updatedItem;
    },

    async put(id, data) {
      return this.update(id, data);
    },

    async delete(id) {
      const items = getStorageItems(storageKey, defaultData);
      const filtered = items.filter(
        (item) => String(item.id) !== String(id) && String(item.employee_id) !== String(id)
      );
      setStorageItems(storageKey, filtered);

      return { success: true, id };
    },
  };
}

export const demoDataService = {
  // Re-seed demo data to original pristine state
  resetAll() {
    initializeDemoData(true);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    return { success: true, message: "Demo data reset successfully" };
  },

  customers: createGenericResource(STORAGE_KEYS.customers, demoCustomers, "CUS"),
  enquiries: createGenericResource(STORAGE_KEYS.enquiries, demoEnquiries, "ENQ"),
  bookings: createGenericResource(STORAGE_KEYS.bookings, demoBookings, "BK"),
  payments: createGenericResource(STORAGE_KEYS.payments, demoPayments, "PAY"),
  expenses: {
    ...createGenericResource(STORAGE_KEYS.expenses, demoExpenses, "EXP"),
    async list(params = {}) {
      let items = getStorageItems(STORAGE_KEYS.expenses, demoExpenses);

      // Automatically guarantee deterministic salary expenses for active months
      const activeMonths = new Set(["2026-11", "2026-10"]);
      if (params.month) activeMonths.add(params.month);
      const currentMonth = new Date().toISOString().slice(0, 7);
      activeMonths.add(currentMonth);

      const existingIds = new Set(items.map((i) => i.id));
      let updated = false;
      for (const m of activeMonths) {
        const salaries = getSalaryExpensesForMonth(m);
        for (const s of salaries) {
          if (!existingIds.has(s.id)) {
            items.push(s);
            existingIds.add(s.id);
            updated = true;
          }
        }
      }
      if (updated) {
        setStorageItems(STORAGE_KEYS.expenses, items);
      }

      // Support basic search
      if (params.search) {
        const query = String(params.search).toLowerCase();
        items = items.filter((item) =>
          JSON.stringify(item).toLowerCase().includes(query)
        );
      }

      // Support category filter
      if (params.category && params.category !== "All") {
        items = items.filter(
          (item) => String(item.category).toLowerCase() === String(params.category).toLowerCase()
        );
      }

      return items;
    },
  },
  deliveries: createGenericResource(STORAGE_KEYS.deliveries, demoDeliveries, "DEL"),
  staff: createGenericResource(STORAGE_KEYS.staff, demoEmployees, "EMP"),
  attendance: createGenericResource(STORAGE_KEYS.attendance, demoAttendance, "ATT"),
  leaves: createGenericResource(STORAGE_KEYS.leaves, demoLeaves, "LEV"),
  payroll: createGenericResource(STORAGE_KEYS.payroll, demoPayroll, "PAY"),
  departments: createGenericResource(STORAGE_KEYS.departments, demoDepartments, "DEP"),
  weddingPhotography: createGenericResource(
    STORAGE_KEYS.weddingPhotography,
    demoWeddingPhotography,
    "WP"
  ),
  weddingVideography: createGenericResource(
    STORAGE_KEYS.weddingVideography,
    demoWeddingVideography,
    "WV"
  ),
  functionsWeArrange: createGenericResource(
    STORAGE_KEYS.functions,
    demoFunctions,
    "FNC"
  ),
  eventManagement: createGenericResource(
    STORAGE_KEYS.events,
    demoEvents,
    "EVT"
  ),
  customizedGifts: createGenericResource(
    STORAGE_KEYS.gifts,
    demoGifts,
    "GFT"
  ),
  branches: createGenericResource(STORAGE_KEYS.branches, demoBranches, "BR"),
  inventory: createGenericResource(STORAGE_KEYS.inventory, demoInventory, "INV"),
  equipment: createGenericResource(STORAGE_KEYS.equipment, demoEquipment, "EQP"),

  notifications: {
    ...createGenericResource(
      STORAGE_KEYS.notifications,
      demoNotifications,
      "NOTIF"
    ),

    async unreadCount() {
      const items = getStorageItems(
        STORAGE_KEYS.notifications,
        demoNotifications
      );
      const count = items.filter((n) => !n.is_read).length;
      return { unread_count: count };
    },

    async markRead(id) {
      const items = getStorageItems(
        STORAGE_KEYS.notifications,
        demoNotifications
      );
      const updated = items.map((item) =>
        String(item.id) === String(id)
          ? { ...item, is_read: true, read_at: new Date().toISOString() }
          : item
      );
      setStorageItems(STORAGE_KEYS.notifications, updated);
      return { success: true, id };
    },

    async markAllRead() {
      const items = getStorageItems(
        STORAGE_KEYS.notifications,
        demoNotifications
      );
      const updated = items.map((item) => ({
        ...item,
        is_read: true,
        read_at: new Date().toISOString(),
      }));
      setStorageItems(STORAGE_KEYS.notifications, updated);
      return { success: true };
    },
  },

  reports: {
    async summary(_params = {}) {
      // Calculate dynamic totals from current localStorage so edits reflect!
      const payments = getStorageItems(STORAGE_KEYS.payments, demoPayments);
      const bookings = getStorageItems(STORAGE_KEYS.bookings, demoBookings);
      const enquiries = getStorageItems(STORAGE_KEYS.enquiries, demoEnquiries);
      const customers = getStorageItems(STORAGE_KEYS.customers, demoCustomers);
      const expenses = getStorageItems(STORAGE_KEYS.expenses, demoExpenses);

      const totalRevenue = payments.reduce(
        (sum, p) => sum + (Number(p.total || p.totalAmount || 0)),
        0
      );
      const totalReceived = payments.reduce(
        (sum, p) => {
          const status = String(p.status || p.paymentStatus || "").toLowerCase();
          if (["failed", "unpaid", "cancelled", "refunded"].includes(status)) return sum;
          return sum + (Number(p.advance || p.paidAmount || 0));
        },
        0
      );
      const totalExpenseSum = expenses.reduce(
        (sum, e) => sum + (Number(e.amount || 0)),
        0
      );

      return {
        ...demoReportSummary,
        total_customers: customers.length,
        total_enquiries: enquiries.length,
        total_bookings: bookings.length,
        total_revenue: totalRevenue || demoReportSummary.total_revenue,
        total_received: totalReceived || demoReportSummary.total_received,
        pending_payments: Math.max(0, totalRevenue - totalReceived) || demoReportSummary.pending_payments,
        total_expenses: totalExpenseSum || demoReportSummary.total_expenses,
        net_profit: Math.max(0, totalReceived - totalExpenseSum),
      };
    },

    exportCsvUrl(type = "summary") {
      const rows = [
        ["Report Type", type],
        ["Generated Date", new Date().toLocaleDateString("en-IN")],
        ["Studio", "Studio Raw Picturez"],
        ["Total Revenue", demoReportSummary.total_revenue],
        ["Amount Received", demoReportSummary.total_received],
        ["Pending Balance", demoReportSummary.pending_payments],
        ["Total Expenses", demoReportSummary.total_expenses],
        ["Net Profit", demoReportSummary.net_profit],
      ];
      const csvContent =
        "data:text/csv;charset=utf-8," +
        rows.map((e) => e.join(",")).join("\n");
      return encodeURI(csvContent);
    },
  },

  settings: {
    async get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.settings);
        if (raw) return JSON.parse(raw);
      } catch {}
      return demoSettings;
    },

    async update(data = {}) {
      try {
        const current = await this.get();
        const updated = { ...current, ...data };
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
        return updated;
      } catch {
        return demoSettings;
      }
    },
  },

  dashboard: {
    async stats() {
      const payments = getStorageItems(STORAGE_KEYS.payments, demoPayments);
      const bookings = getStorageItems(STORAGE_KEYS.bookings, demoBookings);
      const enquiries = getStorageItems(STORAGE_KEYS.enquiries, demoEnquiries);
      const customers = getStorageItems(STORAGE_KEYS.customers, demoCustomers);
      const expenses = getStorageItems(STORAGE_KEYS.expenses, demoExpenses);
      const deliveries = getStorageItems(STORAGE_KEYS.deliveries, demoDeliveries);

      const validInvoices = payments.filter((p) => {
        const s = String(p.status || p.paymentStatus || "").toLowerCase();
        return s !== "cancelled" && s !== "canceled";
      });

      const totalRevenue = Math.round(
        validInvoices.reduce((sum, p) => sum + getInvoiceTotal(p), 0) * 100
      ) / 100;

      const totalReceived = Math.round(
        validInvoices.reduce((sum, p) => {
          const status = getInvoiceStatus(p);
          if (["failed", "unpaid"].includes(status)) return sum;
          return sum + getInvoiceReceived(p);
        }, 0) * 100
      ) / 100;

      const pendingBalance = Math.max(0, Math.round((totalRevenue - totalReceived) * 100) / 100);

      const totalExpenseSum = Math.round(
        expenses.reduce((sum, e) => sum + (Number(e.amount || 0)), 0) * 100
      ) / 100;

      const pendingDeliveries = deliveries.filter((d) => {
        const status = String(d.status || "").toLowerCase();
        return !["delivered", "completed", "cancelled", "canceled"].includes(status);
      }).length;

      const uniqueCusts = new Set();
      customers.forEach((c) => {
        const k = String(c.id || c.customerId || c.phone || c.mobile || c.name || "").trim().toLowerCase();
        if (k) uniqueCusts.add(k);
      });
      const customerCount = uniqueCusts.size || customers.length;

      return {
        ...demoDashboardData,
        customers: customerCount,
        total_customers: customerCount,
        enquiries: enquiries.length,
        total_enquiries: enquiries.length,
        bookings: bookings.length,
        total_bookings: bookings.length,
        billed: totalRevenue,
        total_contracted_revenue: totalRevenue,
        paid: totalReceived,
        total_payments_received: totalReceived,
        payments_received: totalReceived,
        pending: pendingBalance,
        pending_payment_balance: pendingBalance,
        pending_balance: pendingBalance,
        deliveriesPending: pendingDeliveries,
        pending_deliveries: pendingDeliveries,
        total_expenses: totalExpenseSum,
      };
    },
  },
};

export default demoDataService;
