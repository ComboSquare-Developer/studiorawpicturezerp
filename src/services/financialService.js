/**
 * Studio Raw ERP - Centralized Financial Calculation Service
 *
 * Single source of truth for:
 * - Safe numeric parsing & currency formatting (prevents NaN / Infinity)
 * - Invoice & payment calculations (Total, Received, Pending, Status)
 * - Dynamic Staff salary expenses synced from Staff Management
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

/* ---------------- STAFF SALARIES & PAYROLL ---------------- */

/**
 * Read current staff records from localStorage.
 */
export function getStoredStaff() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem("studioraw_staff");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Extract day-of-month integer (1 to 31) from salary_date value.
 */
export function getSalaryDayOfMonth(salaryDateVal) {
  if (!salaryDateVal) return 1;
  const str = String(salaryDateVal).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const day = parseInt(str.slice(8, 10), 10);
    return Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1;
  }
  const day = parseInt(str, 10);
  return Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1;
}

/**
 * Determine exact salary payment date for a staff member in a given month (YYYY-MM-DD).
 */
export function getStaffSalaryDateForMonth(staff, monthStr) {
  const day = getSalaryDayOfMonth(staff?.salary_date);
  const [yearStr, monthNumStr] = (monthStr || "").split("-");
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthNumStr, 10) || (new Date().getMonth() + 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(Math.max(1, day), daysInMonth);
  return `${year}-${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}

/**
 * Identify matching staff member for an expense record.
 */
export function identifyStaffMember(item, staffList = null) {
  if (!item) return null;
  const list = Array.isArray(staffList) ? staffList : getStoredStaff();
  if (!list.length) return null;

  const staffId = item.staffId ? String(item.staffId) : "";
  const employeeId = item.employee_id ? String(item.employee_id).toLowerCase() : "";
  const text = `${item.title || ""} ${item.expense_title || ""} ${item.paidTo || ""} ${item.paid_to || ""} ${item.notes || ""} ${item.id || ""}`.toLowerCase();

  return list.find((s) => {
    if (staffId && String(s.id) === staffId) return true;
    if (employeeId && s.employee_id && String(s.employee_id).toLowerCase() === employeeId) return true;
    const name = String(s.staff_name || s.name || "").trim().toLowerCase();
    if (name && text.includes(name)) return true;
    if (s.employee_id && text.includes(String(s.employee_id).toLowerCase())) return true;
    return false;
  }) || null;
}

/**
 * Automatically sync and generate monthly staff salary expenses into localStorage.
 * Respects:
 * - Active employment status
 * - Salary date reaching current date (no premature future entries)
 * - Joining date (no salary before joining)
 * - Updates unpaid payroll on salary/date edits
 * - Cancels future unpaid payroll on deletion/deactivation
 * - Deduplication via unique reference SAL-EXP-{staffId}-{month}
 */
export function syncStaffSalaryExpenses() {
  if (typeof window === "undefined" || !window.localStorage) return [];

  const STAFF_KEY = "studioraw_staff";
  const EXPENSE_KEY = "studioraw_expenses";
  const UPDATE_EVENT = "studioraw:data-updated";

  const readStorage = (key) => {
    try {
      const p = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  };

  const staffList = readStorage(STAFF_KEY);
  let expenses = readStorage(EXPENSE_KEY);
  let changed = false;

  const todayStr = normalizeDate(new Date());
  const currentMonthStr = todayStr.slice(0, 7);

  // All existing staff identifiers (active, on leave, inactive)
  const allStaffKeys = new Set();
  staffList.forEach((s) => {
    if (s.id) allStaffKeys.add(String(s.id));
    if (s.employee_id) allStaffKeys.add(String(s.employee_id).toLowerCase());
    const name = String(s.staff_name || s.name || "").trim().toLowerCase();
    if (name) allStaffKeys.add(name);
  });

  // Active staff with salary > 0
  const activeStaff = staffList.filter((s) => {
    const status = String(s.status || "Active").trim().toLowerCase();
    return status === "active" && parseAmount(s.salary) > 0;
  });

  const activeStaffKeys = new Set();
  activeStaff.forEach((s) => {
    if (s.id) activeStaffKeys.add(String(s.id));
    if (s.employee_id) activeStaffKeys.add(String(s.employee_id).toLowerCase());
    const name = String(s.staff_name || s.name || "").trim().toLowerCase();
    if (name) activeStaffKeys.add(name);
  });

  const isAutoSalaryExpense = (e) => {
    if (e.isAutoSalary === true || e.generatedByPayroll === true || e.sourceType === "payroll") return true;
    const idStr = String(e.id || "");
    if (idStr.startsWith("SAL-EXP-")) return true;
    const cat = String(e.category || "").trim().toLowerCase();
    if (cat === "staff salary") {
      const notes = String(e.notes || "").toLowerCase();
      const title = String(e.title || e.expense_title || "").toLowerCase();
      if (notes.includes("monthly basic salary") || title.includes("monthly basic salary")) {
        return true;
      }
    }
    return false;
  };

  // 1. Remove salary expenses for deleted staff or future/unpaid for inactive staff
  const cleanedExpenses = expenses.filter((e) => {
    if (!isAutoSalaryExpense(e)) return true; // Keep manual expenses

    const eKey1 = e.staffId ? String(e.staffId) : "";
    const eKey2 = e.employee_id ? String(e.employee_id).toLowerCase() : "";
    const eName = String(e.paidTo || e.paid_to || "").trim().toLowerCase();

    // Check if linked staff member exists in staff roster
    const staffStillExists =
      (eKey1 && allStaffKeys.has(eKey1)) ||
      (eKey2 && allStaffKeys.has(eKey2)) ||
      (eName && allStaffKeys.has(eName));

    if (!staffStillExists) {
      // Staff member was deleted! Remove this linked auto salary expense immediately
      changed = true;
      return false;
    }

    const isStillActive =
      (eKey1 && activeStaffKeys.has(eKey1)) ||
      (eKey2 && activeStaffKeys.has(eKey2)) ||
      (eName && activeStaffKeys.has(eName));

    if (!isStillActive) {
      // Inactive or on-leave staff: remove future or unpaid entries
      const eDate = normalizeDate(e.date || e.expense_date);
      if (eDate >= todayStr || String(e.status || "").toLowerCase() === "pending" || String(e.status || "").toLowerCase() === "unpaid") {
        changed = true;
        return false;
      }
    }
    return true;
  });

  expenses = cleanedExpenses;

  // 2. For each active staff member, generate monthly salary expenses
  for (const staff of activeStaff) {
    const salary = parseAmount(staff.salary);
    if (salary <= 0) continue;
    const staffId = String(staff.id || staff.employee_id || "");
    const employeeId = staff.employee_id || staffId;
    const staffName = String(staff.staff_name || staff.name || "Staff Member").trim();
    const joiningDate = normalizeDate(staff.joining_date) || todayStr;
    const joiningMonth = joiningDate.slice(0, 7) || currentMonthStr;

    // Consider months from joiningMonth up to currentMonthStr (at most 12 months back)
    const [curYear, curMonth] = currentMonthStr.split("-").map(Number);
    const [joinYear, joinMonth] = joiningMonth.split("-").map(Number);

    const startYear = Math.max(joinYear, curYear - 1);
    const startMonth = startYear === joinYear ? joinMonth : 1;

    for (let y = startYear; y <= curYear; y++) {
      const mStart = y === startYear ? startMonth : 1;
      const mEnd = y === curYear ? curMonth : 12;

      for (let m = mStart; m <= mEnd; m++) {
        const monthStr = `${y}-${String(m).padStart(2, "0")}`;
        let salaryDate = getStaffSalaryDateForMonth(staff, monthStr);

        // If joining was in this month and configured salaryDate is before joiningDate:
        if (monthStr === joiningMonth && salaryDate < joiningDate) {
          salaryDate = joiningDate <= todayStr ? joiningDate : salaryDate;
        }

        // For current month, if salaryDate is in the future, use today's date if joined on or before today
        if (monthStr === currentMonthStr && salaryDate > todayStr && joiningDate <= todayStr) {
          salaryDate = todayStr;
        }

        if (salaryDate > todayStr) continue;
        if (salaryDate < joiningDate) continue;

        const uniqueId = `SAL-EXP-${employeeId || staffId}-${monthStr}`;

        // Check if an expense for this staff and month already exists
        const existingIdx = expenses.findIndex((e) => {
          if (e.id === uniqueId) return true;
          const isSalary = String(e.category || "").trim().toLowerCase() === "staff salary";
          if (!isSalary) return false;
          if (getMonthKey(e) !== monthStr) return false;

          if (e.staffId && String(e.staffId) === String(staff.id)) return true;
          if (e.employee_id && employeeId && String(e.employee_id).toLowerCase() === String(employeeId).toLowerCase()) return true;
          const ePaid = String(e.paidTo || e.paid_to || "").trim().toLowerCase();
          return ePaid && ePaid === staffName.toLowerCase();
        });

        const staffRole = staff.specialization || staff.role || "Staff";
        const expensePayload = {
          id: uniqueId,
          title: `Monthly basic salary for ${staffName}`,
          expense_title: `Monthly basic salary for ${staffName}`,
          category: "Staff Salary",
          amount: salary,
          date: salaryDate,
          expense_date: salaryDate,
          paymentMode: "Bank Transfer",
          payment_method: "Bank Transfer",
          paidTo: staffName,
          paid_to: staffName,
          status: "Paid",
          receipt_number: `SAL-${monthStr.replace("-", "")}-${String(staff.employee_id || staff.id || "001").slice(-3)}`,
          notes: `Monthly basic salary for ${staffName} (${staffRole})`,
          staffId: String(staff.id || ""),
          employee_id: employeeId,
          isAutoSalary: true,
          generatedByPayroll: true,
          sourceType: "payroll",
          expenseType: "salary",
          salaryMonth: monthStr,
          createdAt: `${salaryDate}T09:00:00.000Z`,
          updatedAt: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          const existing = expenses[existingIdx];
          if (
            existing.amount !== salary ||
            existing.date !== salaryDate ||
            !existing.staffId ||
            !existing.isAutoSalary
          ) {
            expenses[existingIdx] = {
              ...existing,
              ...expensePayload,
              id: existing.id || uniqueId,
              createdAt: existing.createdAt || expensePayload.createdAt,
              updatedAt: new Date().toISOString(),
            };
            changed = true;
          }
        } else {
          expenses.push(expensePayload);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, { detail: { key: EXPENSE_KEY, module: "expenses" } })
    );
  }

  return expenses;
}

/**
 * Generate standard staff salary records for a given month (YYYY-MM).
 */
export function generateMonthlySalaries(monthStr) {
  const staffList = getStoredStaff().filter(
    (s) => String(s.status || "Active").trim().toLowerCase() === "active" && parseAmount(s.salary) > 0
  );
  if (!staffList.length) return [];
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  return staffList.map((staff, idx) => {
    const salaryDate = getStaffSalaryDateForMonth(staff, monthStr);
    const staffName = staff.staff_name || staff.name || "Staff Member";
    const employeeId = staff.employee_id || staff.id || `EMP-${idx + 1}`;
    const staffRole = staff.specialization || staff.role || "Staff";

    return {
      id: `SAL-EXP-${employeeId}-${monthStr}`,
      title: `Monthly basic salary for ${staffName}`,
      expense_title: `Monthly basic salary for ${staffName}`,
      category: "Staff Salary",
      amount: parseAmount(staff.salary),
      date: salaryDate,
      expense_date: salaryDate,
      paymentMode: "Bank Transfer",
      payment_method: "Bank Transfer",
      paidTo: staffName,
      paid_to: staffName,
      status: "Paid",
      receipt_number: `SAL-${monthStr.replace("-", "")}-${String(idx + 1).padStart(3, "0")}`,
      notes: `Monthly basic salary for ${staffName} (${staffRole})`,
      staffId: String(staff.id || ""),
      employee_id: String(employeeId),
      isAutoSalary: true,
      generatedByPayroll: true,
      sourceType: "payroll",
      expenseType: "salary",
      salaryMonth: monthStr,
      createdAt: `${salaryDate}T09:00:00.000Z`,
      updatedAt: `${salaryDate}T09:00:00.000Z`,
    };
  });
}

/**
 * Remove automatically generated salary expenses linked to a deleted staff member.
 * Strictly preserves manual expenses, other staff members' salary expenses, and payment records.
 */
export function removeLinkedSalaryExpenses(staffMember) {
  if (typeof window === "undefined" || !window.localStorage || !staffMember) return [];

  const EXPENSE_KEYS = ["studioraw_expenses", "studio_raw_expenses"];
  const UPDATE_EVENT = "studioraw:data-updated";

  const targetId = staffMember.id ? String(staffMember.id).trim() : "";
  const targetEmpId = staffMember.employee_id ? String(staffMember.employee_id).trim().toLowerCase() : "";
  const targetName = String(staffMember.staff_name || staffMember.name || "").trim().toLowerCase();

  let anyModified = false;
  let updatedExpenses = [];

  EXPENSE_KEYS.forEach((storageKey) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const filtered = parsed.filter((item) => {
        const isSalary = String(item.category || "").trim().toLowerCase() === "staff salary";
        const isAuto =
          item.isAutoSalary === true ||
          item.generatedByPayroll === true ||
          item.sourceType === "payroll" ||
          String(item.id || "").startsWith("SAL-EXP-") ||
          (isSalary && (
            String(item.notes || "").toLowerCase().includes("monthly basic salary") ||
            String(item.title || "").toLowerCase().includes("monthly basic salary") ||
            String(item.expense_title || "").toLowerCase().includes("monthly basic salary")
          ));

        if (!isAuto) {
          // Keep all manually recorded expenses
          return true;
        }

        const itemStaffId = item.staffId ? String(item.staffId).trim() : "";
        const itemEmpId = item.employee_id ? String(item.employee_id).trim().toLowerCase() : "";
        const itemPaidTo = String(item.paidTo || item.paid_to || "").trim().toLowerCase();
        const itemId = String(item.id || "").toLowerCase();

        const matchId = targetId && itemStaffId && itemStaffId === targetId;
        const matchEmpId = targetEmpId && itemEmpId && itemEmpId === targetEmpId;
        const matchName = targetName && itemPaidTo && itemPaidTo === targetName;
        const matchIdInExpenseId =
          (targetEmpId && itemId.startsWith(`sal-exp-${targetEmpId}-`)) ||
          (targetId && itemId.startsWith(`sal-exp-${targetId.toLowerCase()}-`));

        if (matchId || matchEmpId || matchName || matchIdInExpenseId) {
          anyModified = true;
          return false; // Remove this linked salary expense
        }

        return true;
      });

      if (storageKey === "studioraw_expenses") {
        updatedExpenses = filtered;
      }

      localStorage.setItem(storageKey, JSON.stringify(filtered));
    } catch (err) {
      console.warn(`Error synchronizing salary expenses for deleted staff in ${storageKey}:`, err);
    }
  });

  if (anyModified) {
    window.dispatchEvent(
      new CustomEvent(UPDATE_EVENT, {
        detail: { key: "studioraw_expenses", module: "expenses" },
      })
    );
  }

  return updatedExpenses;
}

/**
 * Deduplicate staff salary expense records for a given month.
 *
 * Guarantees:
 * 1. Works exclusively from actual recorded expenses in the system.
 * 2. If multiple records exist for the same staff member in that month, keeps only the single valid one.
 * 3. Does NOT fabricate or inject unrecorded salary records into an empty expense list.
 * 4. Excludes automatically generated salary records belonging to deleted staff members.
 * 5. Preserves all non-salary expenses intact.
 */
export function getDeduplicatedMonthlyExpenses(allExpenses = [], monthStr) {
  if (!allExpenses || !allExpenses.length) return [];
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    const now = new Date();
    monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const staffList = getStoredStaff();

  // Filter to records belonging strictly to the selected month
  const monthRecords = (allExpenses || []).filter((item) => {
    const itemMonth = getMonthKey(item);
    return itemMonth === monthStr;
  });

  const nonSalaryExpenses = [];
  const staffSalaryMap = new Map(); // staff identifier -> single expense record

  for (const item of monthRecords) {
    const isSalaryCategory = String(item.category || "").trim().toLowerCase() === "staff salary";

    if (isSalaryCategory) {
      const isAuto =
        item.isAutoSalary === true ||
        item.generatedByPayroll === true ||
        item.sourceType === "payroll" ||
        String(item.id || "").startsWith("SAL-EXP-") ||
        String(item.notes || "").toLowerCase().includes("monthly basic salary") ||
        String(item.title || "").toLowerCase().includes("monthly basic salary");

      const matched = identifyStaffMember(item, staffList);

      // If auto-generated and staff member no longer exists in staff list (deleted), exclude it!
      if (isAuto && !matched) {
        continue;
      }

      const staffKey = matched
        ? String(matched.employee_id || matched.id).trim().toLowerCase()
        : String(
            item.staffId ||
            item.employee_id ||
            item.paidTo ||
            item.paid_to ||
            item.title ||
            item.id
          ).trim().toLowerCase();

      if (!staffSalaryMap.has(staffKey)) {
        staffSalaryMap.set(staffKey, {
          ...item,
          category: "Staff Salary",
          amount: parseAmount(item.amount),
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
            total += (st === "refund" || String(tx?.type || "").toLowerCase() === "refund" ? -amt : amt);
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
