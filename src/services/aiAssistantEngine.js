import { demoAuthService } from "./demo/demoAuthService";
import {
  formatMonthKey,
  getBookingsSummary,
  getCustomersSummary,
  getDeliveriesSummary,
  getEnquiriesSummary,
  getInventoryAndEquipmentSummary,
  getMonthlyExpensesSummary,
  getPaymentsSummary,
  getStaffSummary,
} from "./aiAssistantDataService";

/**
 * Studio Raw Picturez - AI Assistant Intent & Response Engine
 *
 * Hybrid architecture:
 * - Layer 1: Natural-language intent, entity, and date-period understanding.
 * - Layer 2: Read-only verified ERP data tools (aiAssistantDataService.js).
 * - Layer 3: Concise, accurate response formatting + optional server-side AI proxy
 *            via VITE_AI_ASSISTANT_ENDPOINT (zero secrets in frontend code).
 */

export const MODULE_ROUTES = {
  dashboard: { id: "dashboard", label: "Dashboard" },
  enquiries: { id: "enquiries", label: "Enquiries" },
  customers: { id: "customers", label: "Customers" },
  bookings: { id: "bookings", label: "Bookings" },
  payments: { id: "payments", label: "Payments" },
  deliveries: { id: "deliveries", label: "Deliveries" },
  equipment: { id: "equipment", label: "Equipment" },
  expenses: { id: "expenses", label: "Expenses" },
  staff: { id: "staff", label: "Staff" },
  reports: { id: "reports", label: "Reports" },
  settings: { id: "settings", label: "Settings" },
};

const MONTH_NAMES = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12,
};

/**
 * Extract date period from a natural-language question.
 */
export function extractPeriodFromQuery(text, defaultPeriod = { type: "this_month" }) {
  const q = String(text || "").toLowerCase();

  if (/\btoday\b|\btoday's\b|\btodays\b/.test(q)) {
    return { period: { type: "today" }, explicit: true };
  }
  if (/\byesterday\b/.test(q)) {
    return { period: { type: "yesterday" }, explicit: true };
  }
  if (/\blast week\b|\bprevious week\b/.test(q)) {
    return { period: { type: "last_week" }, explicit: true };
  }
  if (/\bthis week\b|\bcurrent week\b/.test(q)) {
    return { period: { type: "this_week" }, explicit: true };
  }
  if (/\blast month\b|\bprevious month\b/.test(q)) {
    return { period: { type: "previous_month" }, explicit: true };
  }
  if (/\bnext month\b/.test(q)) {
    return { period: { type: "next_month" }, explicit: true };
  }
  if (/\bthis month\b|\bcurrent month\b/.test(q)) {
    return { period: { type: "this_month" }, explicit: true };
  }
  if (/\bthis year\b|\bcurrent year\b/.test(q)) {
    return { period: { type: "this_year" }, explicit: true };
  }
  if (/\ball\b|\boverall\b|\btotal overall\b|\bever\b/.test(q)) {
    return { period: { type: "all" }, explicit: true };
  }

  // Specific ISO date YYYY-MM-DD
  const isoDateMatch = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoDateMatch) {
    return { period: { type: "date", dateKey: isoDateMatch[1] }, explicit: true };
  }

  // Specific YYYY-MM
  const isoMonthMatch = q.match(/\b(\d{4}-\d{2})\b/);
  if (isoMonthMatch) {
    return { period: { type: "month", monthKey: isoMonthMatch[1] }, explicit: true };
  }

  // Month name + optional 4-digit year
  const monthPattern = new RegExp(
    `\\b(${Object.keys(MONTH_NAMES).join("|")})\\b(?:\\s+(\\d{4}))?`,
    "i"
  );
  const monthMatch = q.match(monthPattern);
  if (monthMatch) {
    const monthNum = MONTH_NAMES[monthMatch[1].toLowerCase()];
    const year = monthMatch[2] ? Number(monthMatch[2]) : new Date().getFullYear();
    const monthKey = `${year}-${String(monthNum).padStart(2, "0")}`;
    return { period: { type: "month", monthKey }, explicit: true };
  }

  // Specific year like 2026
  const yearMatch = q.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    return { period: { type: "year", year: Number(yearMatch[1]) }, explicit: true };
  }

  return { period: defaultPeriod, explicit: false };
}

function detectNavigationTarget(q) {
  const isNavVerb = /\b(open|go to|take me to|navigate to|switch to|show me the)\b/.test(q);
  if (!isNavVerb) return null;

  const aliases = [
    { id: "dashboard", patterns: ["dashboard", "home", "overview"] },
    { id: "enquiries", patterns: ["enquir", "lead"] },
    { id: "customers", patterns: ["customer", "client"] },
    { id: "bookings", patterns: ["booking", "calendar", "schedule"] },
    { id: "payments", patterns: ["payment", "billing", "invoice"] },
    { id: "deliveries", patterns: ["deliver"] },
    { id: "equipment", patterns: ["equipment", "camera", "gear"] },
    { id: "expenses", patterns: ["expense"] },
    { id: "staff", patterns: ["staff", "employee", "team"] },
    { id: "reports", patterns: ["report", "analytic"] },
    { id: "settings", patterns: ["setting", "preference"] },
  ];

  for (const entry of aliases) {
    if (entry.patterns.some((p) => q.includes(p))) {
      return MODULE_ROUTES[entry.id];
    }
  }
  return null;
}

function buildHowToGuide(q) {
  if (q.includes("enquir") || q.includes("lead")) {
    return {
      text:
        "Here is how to add a new enquiry:\n\n" +
        "1. Open the **Enquiries** module from the sidebar.\n" +
        "2. Click the **Add Enquiry** (or **+ New Enquiry**) button at the top.\n" +
        "3. Enter the customer's name, phone number, city, service type, and event date.\n" +
        "4. Set the initial status (e.g., New or Follow Up) and click **Save**.\n\n" +
        "Would you like to open the Enquiries module now?",
      action: { type: "navigate", ...MODULE_ROUTES.enquiries },
    };
  }

  if (q.includes("booking")) {
    return {
      text:
        "Here is how to add a new booking:\n\n" +
        "1. Open the **Bookings** module from the sidebar.\n" +
        "2. Click **New Booking** or select a date on the calendar.\n" +
        "3. Choose the customer, event type, package amount, and assigned staff.\n" +
        "4. Save the booking — it will sync with your calendar and dashboard.",
      action: { type: "navigate", ...MODULE_ROUTES.bookings },
    };
  }

  if (q.includes("payment") || q.includes("invoice")) {
    return {
      text:
        "Here is how to record a payment or invoice:\n\n" +
        "1. Open the **Payments** module from the sidebar.\n" +
        "2. Click **Add Payment** to create a new invoice, or open an existing invoice to record an installment.\n" +
        "3. Enter the received amount, payment mode, and date, then save.",
      action: { type: "navigate", ...MODULE_ROUTES.payments },
    };
  }

  if (q.includes("expense")) {
    return {
      text:
        "Here is how to record an expense:\n\n" +
        "1. Open the **Expenses** module from the sidebar.\n" +
        "2. Click **Add Expense**.\n" +
        "3. Enter the title, category, amount, payment method, and date, then click **Save**.",
      action: { type: "navigate", ...MODULE_ROUTES.expenses },
    };
  }

  if (q.includes("customer")) {
    return {
      text:
        "Here is how to add a customer:\n\n" +
        "1. Open the **Customers** module from the sidebar.\n" +
        "2. Click **Add Customer**, fill in name, phone, email, and city, and save.",
      action: { type: "navigate", ...MODULE_ROUTES.customers },
    };
  }

  if (q.includes("staff") || q.includes("employee")) {
    return {
      text:
        "Here is how to add a staff member:\n\n" +
        "1. Open the **Staff** module from the sidebar.\n" +
        "2. Click **Add Staff**, enter their name, role/specialization, salary, salary date, and joining date, then save.",
      action: { type: "navigate", ...MODULE_ROUTES.staff },
    };
  }

  return {
    text:
      "I can walk you through adding Enquiries, Bookings, Customers, Payments, Expenses, or Staff. Which module would you like help with?",
  };
}

/**
 * Optional server-side AI proxy call (only invoked if VITE_AI_ASSISTANT_ENDPOINT is set).
 * Never stores or exposes API keys in the browser.
 */
async function enhanceWithServerProxyIfConfigured({ question, verifiedData, activePage, signal }) {
  const endpoint = import.meta.env?.VITE_AI_ASSISTANT_ENDPOINT;
  if (!endpoint || typeof fetch !== "function") {
    return null;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal,
      body: JSON.stringify({
        question,
        activePage,
        verifiedData,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json?.reply === "string" && json.reply.trim() ? json.reply.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Process a natural-language question against verified read-only ERP data.
 */
export async function askStudioAssistant({ question, activePage = "dashboard", signal }) {
  if (!demoAuthService.isAuthenticated()) {
    throw new Error("Please sign in to access studio records.");
  }

  const user = demoAuthService.getCurrentUser();
  const raw = String(question || "").trim();
  const q = raw.toLowerCase();

  if (!q) {
    return {
      text: "Please enter a question about your studio's bookings, payments, expenses, customers, enquiries, staff, or deliveries.",
    };
  }

  // 1. Greeting / small talk
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|good night|thanks|thank you)\b/.test(q) && q.split(/\s+/).length <= 4) {
    return {
      text: `Hello${user?.name && user.name !== "Admin" ? `, ${user.name}` : ""}! Ask me anything about your bookings, payments, expenses, customers, enquiries, staff, or deliveries.`,
    };
  }

  // 2. How-to / guidance questions (before data lookup so "explain how to add a new enquiry" doesn't trigger enquiry count)
  if (/\b(how to|how do i|explain|guide|steps to|want to add|create a new)\b/.test(q)) {
    return buildHowToGuide(q);
  }

  // 3. Direct module navigation requests
  const navTarget = detectNavigationTarget(q);
  if (navTarget) {
    return {
      text: `You can jump straight to the **${navTarget.label}** module using the button below.`,
      action: { type: "navigate", ...navTarget },
    };
  }

  // 4. Salary Expenses
  if (/\bsalary\b|\bsalaries\b|\bpayroll\b/.test(q)) {
    const { period } = extractPeriodFromQuery(q, { type: "this_month" });
    const exp = await getMonthlyExpensesSummary(period);
    const staffSummary = await getStaffSummary(user);

    if (!staffSummary.isAuthorizedForSalary) {
      return {
        text: "You do not have permission to view staff salary details.",
      };
    }

    const reply =
      `Your recorded **Staff Salary** expenses for **${exp.periodLabel}** are **${exp.formattedSalaryTotal}**` +
      (exp.salaryCount > 0 ? ` across **${exp.salaryCount}** staff salary ${exp.salaryCount === 1 ? "entry" : "entries"}.` : " (no salary entries recorded for this period).");

    return {
      text: reply,
      action: { type: "navigate", ...MODULE_ROUTES.expenses },
    };
  }

  // 5. Expenses & Expense Breakdown
  if (/\bexpense\b|\bexpenses\b|\bspending\b|\bspent\b/.test(q)) {
    const { period } = extractPeriodFromQuery(q, { type: "this_month" });
    const exp = await getMonthlyExpensesSummary(period);

    const topCats = exp.breakdown
      .slice(0, 4)
      .map((c) => `• ${c.category}: **${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(c.amount)}** (${c.percentage}%)`)
      .join("\n");

    const text =
      `Your total recorded expenses for **${exp.periodLabel}** are **${exp.formattedTotal}**.\n\n` +
      (exp.count > 0
        ? `This includes **${exp.count}** deduplicated expense ${exp.count === 1 ? "record" : "records"} saved for the selected period.` +
          (topCats ? `\n\n**Category Breakdown:**\n${topCats}` : "")
        : "There are currently no expense records saved for this period.");

    return {
      text,
      action: { type: "navigate", ...MODULE_ROUTES.expenses },
    };
  }

  // 6. Payments / Revenue / Pending Balance / Invoices
  if (/\bpayment\b|\bpayments\b|\bpending\b.*\b(amount|balance|payment|due)\b|\boutstanding\b|\bbalance\b|\brevenue\b|\bincome\b|\breceived\b|\binvoice\b|\bbilled\b/.test(q)) {
    // Check if user is actually asking about pending bookings or pending enquiries or pending deliveries
    if (/\bbooking\b|\bbookings\b/.test(q)) {
      // Fall through to bookings handler
    } else if (/\benquir\b/.test(q)) {
      // Fall through to enquiries handler
    } else if (/\bdeliver\b/.test(q)) {
      // Fall through to deliveries handler
    } else {
      const hasPeriodWord = /\b(this month|last month|previous month|next month|today|yesterday|this week|last week|this year|\d{4})\b/i.test(q) ||
        new RegExp(`\\b(${Object.keys(MONTH_NAMES).join("|")})\\b`, "i").test(q);
      const { period } = extractPeriodFromQuery(q, hasPeriodWord ? { type: "this_month" } : { type: "all" });
      const pay = await getPaymentsSummary(period);

      if (/\bmethod\b|\bmode\b|\bupi\b|\bcash\b|\bbank\b/.test(q)) {
        const list = pay.paymentMethods.length
          ? pay.paymentMethods.map((m) => `• ${m.method}: **${m.formattedAmount}**`).join("\n")
          : "No payment receipts recorded for this period.";
        return {
          text: `**Payment Method Breakdown (${pay.periodLabel}):**\n\n${list}`,
          action: { type: "navigate", ...MODULE_ROUTES.payments },
        };
      }

      if (/\bpending\b|\boutstanding\b|\bdue\b|\bbalance\b/.test(q)) {
        const pendingList = pay.pendingInvoices.length
          ? "\n\n**Pending Invoices:**\n" +
            pay.pendingInvoices.map((inv) => `• ${inv.customer} (${inv.id}): **${inv.formattedBalance}**`).join("\n")
          : "";
        return {
          text:
            `Your current pending payment balance is **${pay.formattedOverallPending}**` +
            ` across **${pay.pendingInvoiceCount}** pending ${pay.pendingInvoiceCount === 1 ? "invoice" : "invoices"}.\n\n` +
            `Total Billed: **${pay.formattedOverallBilled}** · Total Received: **${pay.formattedOverallReceived}**` +
            pendingList,
          action: { type: "navigate", ...MODULE_ROUTES.payments },
        };
      }

      if (/\bbilled\b|\btotal invoice\b|\binvoice amount\b/.test(q)) {
        return {
          text:
            `Your total invoice (billed) amount is **${pay.formattedOverallBilled}** across **${pay.invoiceCount}** valid ${pay.invoiceCount === 1 ? "invoice" : "invoices"}.\n\n` +
            `Received: **${pay.formattedOverallReceived}** · Pending: **${pay.formattedOverallPending}**`,
          action: { type: "navigate", ...MODULE_ROUTES.payments },
        };
      }

      // Default: Revenue / Received
      const periodText = period.type === "all"
        ? `Your total received revenue is **${pay.formattedOverallReceived}** (Total Billed: **${pay.formattedOverallBilled}**, Pending: **${pay.formattedOverallPending}**).`
        : `Your received revenue for **${pay.periodLabel}** is **${pay.formattedPeriodReceived}**.\n\nOverall Total Billed: **${pay.formattedOverallBilled}** · Overall Pending: **${pay.formattedOverallPending}**`;

      return {
        text: periodText,
        action: { type: "navigate", ...MODULE_ROUTES.payments },
      };
    }
  }

  // 7. Bookings
  if (/\bbooking\b|\bbookings\b|\bshoot\b|\bcalendar\b/.test(q)) {
    const isSpecificStatus = /\bcancelled\b|\bcanceled\b|\bpending\b|\bconfirmed\b|\bcompleted\b/.test(q);
    const { period, explicit } = extractPeriodFromQuery(q, { type: "all" });

    // Ambiguous booking question without period or status filter
    if (!explicit && !isSpecificStatus && /\bhow many\b|\bshow\b|\bget\b|\blist\b/.test(q)) {
      return {
        text: "Would you like to see bookings for **this month** or **all bookings**?",
      };
    }

    const bk = await getBookingsSummary(period);

    if (period.type === "today") {
      const list = bk.todayItems.length
        ? "\n\n" + bk.todayItems.map((b) => `• ${b.customer} — ${b.event} (${b.status})`).join("\n")
        : "";
      return {
        text: `You have **${bk.todayCount}** ${bk.todayCount === 1 ? "booking" : "bookings"} scheduled for **${bk.periodLabel}**.${list}`,
        action: { type: "navigate", ...MODULE_ROUTES.bookings },
      };
    }

    if (/\bcancelled\b|\bcanceled\b/.test(q)) {
      return {
        text: `You have **${bk.cancelled}** cancelled ${bk.cancelled === 1 ? "booking" : "bookings"} (${bk.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.bookings },
      };
    }

    if (/\bpending\b/.test(q)) {
      return {
        text: `You have **${bk.pending}** pending ${bk.pending === 1 ? "booking" : "bookings"} (${bk.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.bookings },
      };
    }

    if (/\bconfirmed\b/.test(q)) {
      return {
        text: `You have **${bk.confirmed}** confirmed ${bk.confirmed === 1 ? "booking" : "bookings"} (${bk.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.bookings },
      };
    }

    if (/\bcompleted\b/.test(q)) {
      return {
        text: `You have **${bk.completed}** completed ${bk.completed === 1 ? "booking" : "bookings"} (${bk.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.bookings },
      };
    }

    const summaryText =
      `Here is your booking summary for **${bk.periodLabel}**:\n\n` +
      `• Total Bookings: **${bk.total}**\n` +
      `• Confirmed: **${bk.confirmed}**\n` +
      `• Pending: **${bk.pending}**\n` +
      `• Completed: **${bk.completed}**\n` +
      `• Cancelled: **${bk.cancelled}**`;

    return {
      text: summaryText,
      action: { type: "navigate", ...MODULE_ROUTES.bookings },
    };
  }

  // 8. Customers
  if (/\bcustomer\b|\bcustomers\b|\bclient\b|\bclients\b/.test(q)) {
    const cust = await getCustomersSummary();

    if (/\bcit(y|ies)\b|\blocation\b/.test(q)) {
      const cities = cust.topCities.length
        ? cust.topCities.map((c) => `• ${c.city}: **${c.count}**`).join("\n")
        : "No city information is recorded on customer profiles yet.";
      return {
        text: `**Customers by City** (Total Registered: **${cust.total}**):\n\n${cities}`,
        action: { type: "navigate", ...MODULE_ROUTES.customers },
      };
    }

    if (/\blatest\b|\brecent\b|\bnew\b|\blist\b/.test(q)) {
      const list = cust.recent.length
        ? cust.recent.map((c) => `• ${c.name} (${c.id}) — ${c.city}`).join("\n")
        : "No customer records found yet.";
      return {
        text: `**Latest Customers** (Total Registered: **${cust.total}**):\n\n${list}`,
        action: { type: "navigate", ...MODULE_ROUTES.customers },
      };
    }

    return {
      text: `You currently have **${cust.total}** registered ${cust.total === 1 ? "customer" : "customers"}.`,
      action: { type: "navigate", ...MODULE_ROUTES.customers },
    };
  }

  // 9. Enquiries
  if (/\benquir\b|\blead\b|\bleads\b/.test(q)) {
    const { period } = extractPeriodFromQuery(q, { type: "all" });
    const enq = await getEnquiriesSummary(period);

    if (/\bconfirmed\b|\bconverted\b/.test(q)) {
      return {
        text: `You have **${enq.confirmed}** confirmed ${enq.confirmed === 1 ? "enquiry" : "enquiries"} (${enq.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.enquiries },
      };
    }

    if (/\bpending\b|\bnew\b|\bfollow\b/.test(q)) {
      return {
        text: `You have **${enq.pending}** pending/active ${enq.pending === 1 ? "enquiry" : "enquiries"} (${enq.periodLabel}).`,
        action: { type: "navigate", ...MODULE_ROUTES.enquiries },
      };
    }

    if (/\bservice\b/.test(q)) {
      const list = enq.byService.length
        ? enq.byService.map((s) => `• ${s.service}: **${s.count}**`).join("\n")
        : "No enquiries recorded yet.";
      return {
        text: `**Enquiries by Service (${enq.periodLabel}):**\n\n${list}`,
        action: { type: "navigate", ...MODULE_ROUTES.enquiries },
      };
    }

    if (/\bcit(y|ies)\b/.test(q)) {
      const list = enq.byCity.length
        ? enq.byCity.map((c) => `• ${c.city}: **${c.count}**`).join("\n")
        : "No city data recorded on enquiries yet.";
      return {
        text: `**Enquiries by City (${enq.periodLabel}):**\n\n${list}`,
        action: { type: "navigate", ...MODULE_ROUTES.enquiries },
      };
    }

    return {
      text:
        `Here is your enquiry summary (**${enq.periodLabel}**):\n\n` +
        `• Total Enquiries: **${enq.total}**\n` +
        `• Confirmed: **${enq.confirmed}**\n` +
        `• Pending / Follow-up: **${enq.pending}**`,
      action: { type: "navigate", ...MODULE_ROUTES.enquiries },
    };
  }

  // 10. Staff
  if (/\bstaff\b|\bemployee\b|\bemployees\b|\bteam\b/.test(q)) {
    const staff = await getStaffSummary(user);

    if (/\bdirectory\b|\blist\b|\bshow\b|\bwho\b/.test(q)) {
      const list = staff.directory.length
        ? staff.directory.map((s) => `• ${s.name} — ${s.role} (${s.status})`).join("\n")
        : "No staff members are currently registered.";
      return {
        text: `**Staff Directory** (Active: **${staff.active}**, Inactive: **${staff.inactive}**):\n\n${list}`,
        action: { type: "navigate", ...MODULE_ROUTES.staff },
      };
    }

    if (/\binactive\b/.test(q)) {
      return {
        text: `You have **${staff.inactive}** inactive staff ${staff.inactive === 1 ? "member" : "members"} out of **${staff.total}** total.`,
        action: { type: "navigate", ...MODULE_ROUTES.staff },
      };
    }

    return {
      text: `You currently have **${staff.active}** active staff ${staff.active === 1 ? "member" : "members"} (${staff.inactive} inactive, ${staff.total} total).`,
      action: { type: "navigate", ...MODULE_ROUTES.staff },
    };
  }

  // 11. Deliveries
  if (/\bdeliver\b/.test(q)) {
    const del = await getDeliveriesSummary();
    return {
      text:
        `Here is your delivery summary:\n\n` +
        `• Total Deliveries: **${del.total}**\n` +
        `• Pending / In Progress: **${del.pending}**\n` +
        `• Completed / Delivered: **${del.completed}**`,
      action: { type: "navigate", ...MODULE_ROUTES.deliveries },
    };
  }

  // 12. Equipment
  if (/\bequipment\b|\bcamera\b|\bgear\b/.test(q)) {
    const invEq = await getInventoryAndEquipmentSummary();
    return {
      text: `You currently have **${invEq.equipmentCount}** equipment records.`,
      action: {
        type: "navigate",
        ...MODULE_ROUTES.equipment,
      },
    };
  }

  // 13. Fallback: optional server-side AI proxy or clear helpful guidance
  const currentMonth = formatMonthKey(new Date());
  const proxyReply = await enhanceWithServerProxyIfConfigured({
    question: raw,
    activePage,
    verifiedData: { currentMonth },
    signal,
  });

  if (proxyReply) {
    return { text: proxyReply };
  }

  return {
    text:
      "I can help with **Expenses**, **Payments & Pending Balances**, **Bookings**, **Customers**, **Enquiries**, **Staff**, **Deliveries**, **Equipment**, and **Module Navigation**.\n\nTry asking one of the quick suggestions below or specify what you'd like to check!",
  };
}
