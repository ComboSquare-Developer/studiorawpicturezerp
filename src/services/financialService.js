/**
 * Studio Raw ERP - Centralized Financial Calculation Service
 *
 * Single source of truth for:
 * - Safe numeric parsing & currency formatting (prevents NaN / Infinity)
 * - Invoice & payment calculations (Total, Received, Pending, Status)
 * - Staff salary expenses (Exactly 3 staff members @ ₹10,000/mo = ₹30,000/mo)
 * - Deduplication of salary expenses per staff member per month
 * - Shared Monthly Income, Expenses, Category Breakdown & Net Profit
 */

export const STAFF_SALARIES = [];

export const MONTHLY_SALARY_TOTAL = 0;

/**
 * Safely parse any value into a finite non-negative number.
 * Never returns NaN, null, undefined or Infinity.
 */
export function parseAmount(value) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : 0;
  const str = String(value).trim();
  if (!str || str.toLowerCase().includes("nan") || str.toLowerCase().includes("infinity")) return 0;
  const clean = str.replace(/[₹,\s]/g, "");
  const num = Number(clean);
  return Number.isFinite(num) ? Math.max(0, num) : 0;
}

/**
 * Format a number into Indian Rupee currency string.
 */
export function formatCurrency(value) {
  const num = parseAmount(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Normalize date into YYYY-MM-DD.
 */
export function normalizeDate(value) {
  if (!value) return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s.split("/").reverse().join("-");
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Get YYYY-MM from date or item.
 */
export function getMonthKey(value) {
  const d = normalizeDate(typeof value === "object" ? (value?.date || value?.expense_date || value?.payment_date || value?.createdAt) : value);
  return d ? d.slice(0, 7) : "";
}

/* ---------------- PAYMENTS & INVOICES ---------------- */

const INVALID_TX_STATUSES = ["failed", "cancelled", "canceled", "refunded", "void", "reversed"];

export function getInvoiceTotal(invoice) {
  if (!invoice) return 0;
  return parseAmount(
    invoice.total ?? invoice.totalAmount ?? invoice.total_amount ??
    invoice.grandTotal ?? invoice.packageAmount ?? invoice.bookingAmount ?? invoice.amount
  );
}

export function getInvoiceReceived(invoice) {
  if (!invoice) return 0;
  if (Array.isArray(invoice.transactions) && invoice.transactions.length > 0) {
    const validSum = invoice.transactions.reduce((sum, tx) => {
      const st = String(tx?.status || "").toLowerCase();
      if (INVALID_TX_STATUSES.includes(st)) return sum;
      const amt = parseAmount(tx.amount ?? tx.paidAmount ?? tx.receivedAmount);
      return sum + (st === "refund" || String(tx?.type || "").toLowerCase() === "refund" ? -amt : amt);
    }, 0);
    return Math.max(0, Math.round(validSum * 100) / 100);
  }
  return parseAmount(
    invoice.paidAmount ?? invoice.paid_amount ?? invoice.amountPaid ??
    invoice.receivedAmount ?? invoice.amountReceived ?? invoice.totalPaid ??
    invoice.advance ?? invoice.advanceAmount
  );
}

export function getInvoiceBalance(invoice) {
  const total = getInvoiceTotal(invoice);
  const received = getInvoiceReceived(invoice);
  return Math.max(0, Math.round((total - received) * 100) / 100);
}

export function getInvoiceStatus(invoice) {
  if (!invoice) return "Pending";
  const explicit = String(invoice.status || invoice.paymentStatus || "").trim().toLowerCase();
  if (explicit === "failed") return "Failed";
  if (explicit === "refunded") return "Refunded";
  if (explicit === "unpaid") return "Unpaid";
  const total = getInvoiceTotal(invoice);
  const received = getInvoiceReceived(invoice);
  if (total > 0 && received >= total - 0.01) return "Paid";
  if (received > 0) return "Partial";
  return "Pending";
}

/* ---------------- STAFF SALARIES & EXPENSES ---------------- */

/**
 * Determine which staff member an expense record belongs to, if it is a salary record.
 */
export function identifyStaffMember(item) {
  if (!item) return null;
  const isSalaryCategory = String(item.category || "").trim().toLowerCase() === "staff salary";
  const text = `${item.title || ""} ${item.expense_title || ""} ${item.paidTo || ""} ${item.paid_to || ""} ${item.notes || ""} ${item.id || ""}`.toLowerCase();
  
  if (text.includes("vignesh") || text.includes("emp-2026-001")) {
    return STAFF_SALARIES[0]; // Vignesh Sundaram
  }
  if (text.includes("santhosh") || text.includes("emp-2026-002")) {
    return STAFF_SALARIES[1]; // Santhosh Kumar
  }
  if (text.includes("priya") || text.includes("emp-2026-003")) {
    return STAFF_SALARIES[2]; // Priya Natarajan
  }
  if (isSalaryCategory) {
    // If category is Staff Salary but name not matched, match by employee ID pattern
    for (const staff of STAFF_SALARIES) {
      if (text.includes(staff.employee_id.toLowerCase())) return staff;
    }
  }
  return null;
}

/**
 * Generate standard staff salary records for a given month (YYYY-MM).
 * Clean initial state: returns empty array if no staff salaries exist.
 */
export function generateMonthlySalaries(monthStr) {
  if (!STAFF_SALARIES || !STAFF_SALARIES.length) return [];
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  const dateStr = `${monthStr}-01`;
  return STAFF_SALARIES.map((staff, idx) => ({
    id: `SAL-EXP-${staff.employee_id}-${monthStr}`,
    title: `Monthly salary – ${staff.name}`,
    expense_title: `Monthly salary – ${staff.name}`,
    category: "Staff Salary",
    amount: staff.salary,
    date: dateStr,
    expense_date: dateStr,
    paymentMode: "Bank Transfer",
    payment_method: "Bank Transfer",
    paidTo: staff.name,
    paid_to: staff.name,
    status: "Paid",
    receipt_number: `SAL-${monthStr.replace("-", "")}-00${idx + 1}`,
    notes: `Monthly basic salary for ${staff.name} (${staff.role})`,
    createdAt: `${dateStr}T09:00:00.000Z`,
    updatedAt: `${dateStr}T09:00:00.000Z`,
  }));
}

/**
 * Deduplicate staff salary expense records for a given month.
 *
 * Guarantees:
 * 1. Works exclusively from actual recorded expenses in the system.
 * 2. If multiple records exist for the same staff member in that month, keeps only the first valid one.
 * 3. Does NOT fabricate or inject unrecorded salary records into an empty expense list.
 * 4. Preserves all non-salary expenses intact.
 */
export function getDeduplicatedMonthlyExpenses(allExpenses = [], monthStr) {
  if (!allExpenses || !allExpenses.length) return [];
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  // Filter to records belonging strictly to the selected month
  const monthRecords = (allExpenses || []).filter((item) => {
    const itemMonth = getMonthKey(item);
    return itemMonth === monthStr;
  });

  const nonSalaryExpenses = [];
  const staffSalaryMap = new Map(); // staff.employee_id -> single expense record

  for (const item of monthRecords) {
    const staff = identifyStaffMember(item);
    const isSalary = staff || String(item.category || "").trim().toLowerCase() === "staff salary";

    if (isSalary && staff) {
      if (!staffSalaryMap.has(staff.employee_id)) {
        staffSalaryMap.set(staff.employee_id, {
          ...item,
          id: item.id || `SAL-EXP-${staff.employee_id}-${monthStr}`,
          title: item.title || item.expense_title || `Monthly salary – ${staff.name}`,
          category: "Staff Salary",
          amount: parseAmount(item.amount) || staff.salary,
          date: normalizeDate(item.date || item.expense_date) || `${monthStr}-01`,
          paidTo: staff.name,
          status: item.status || "Paid",
        });
      }
    } else {
      nonSalaryExpenses.push(item);
    }
  }

  const salaries = Array.from(staffSalaryMap.values());
  return [...salaries, ...nonSalaryExpenses];
}

/**
 * Calculate total monthly expenses for a given month.
 */
export function calculateMonthlyExpenseTotal(allExpenses = [], monthStr) {
  const deduped = getDeduplicatedMonthlyExpenses(allExpenses, monthStr);
  return Math.round(deduped.reduce((sum, item) => sum + parseAmount(item.amount), 0) * 100) / 100;
}

/**
 * Calculate total monthly income received for a given month.
 */
export function calculateMonthlyIncome(allPayments = [], monthStr) {
  if (!monthStr) return 0;
  let total = 0;

  for (const payment of allPayments || []) {
    if (Array.isArray(payment.transactions) && payment.transactions.length > 0) {
      for (const tx of payment.transactions) {
        const txMonth = getMonthKey(tx.date || tx.paymentDate || tx.createdAt);
        if (txMonth === monthStr) {
          const st = String(tx.status || "").toLowerCase();
          if (!INVALID_TX_STATUSES.includes(st)) {
            const amt = parseAmount(tx.amount ?? tx.paidAmount);
            total += (st === "refund" || String(tx.type || "").toLowerCase() === "refund" ? -amt : amt);
          }
        }
      }
    } else {
      const payMonth = getMonthKey(payment.date || payment.paymentDate || payment.createdAt);
      if (payMonth === monthStr) {
        const st = String(payment.status || payment.paymentStatus || "").toLowerCase();
        if (st !== "failed" && st !== "unpaid") {
          total += getInvoiceReceived(payment);
        }
      }
    }
  }

  return Math.max(0, Math.round(total * 100) / 100);
}

/**
 * Category-wise breakdown from a list of monthly expenses.
 */
export function calculateCategoryBreakdown(monthlyExpenses = []) {
  const total = monthlyExpenses.reduce((sum, item) => sum + parseAmount(item.amount), 0);
  const byCategory = new Map();

  for (const item of monthlyExpenses) {
    const cat = item.category || "Other";
    const amt = parseAmount(item.amount);
    byCategory.set(cat, (byCategory.get(cat) || 0) + amt);
  }

  const result = [];
  for (const [category, amount] of byCategory.entries()) {
    const percentage = total > 0 ? Math.round((amount / total) * 1000) / 10 : 0;
    result.push({ category, amount, percentage });
  }

  return result.sort((a, b) => b.amount - a.amount);
}
