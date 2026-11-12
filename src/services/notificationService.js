/**
 * Studio Raw ERP - Automatic Notification Service
 *
 * Automatically generates notification records from:
 * 1. Bookings (studioraw_bookings)
 *    - Booking today
 *    - Booking tomorrow
 *    - Booking within next 3 days
 *    - Booking date passed without completion (Overdue)
 *    - Skips cancelled bookings
 * 2. Deliveries (studioraw_deliveries)
 *    - Delivery due today
 *    - Approaching delivery (within 3-5 days)
 *    - Overdue delivery (past expected date and not delivered)
 *    - Completed delivery (delivered)
 *    - Skips cancelled deliveries
 *
 * Provides:
 * - Deterministic, non-duplicated notification generation
 * - Read/Unread state management persisted in localStorage
 * - Unread count calculation for header badge
 */

const BOOKING_KEY = "studioraw_bookings";
const DELIVERY_KEY = "studioraw_deliveries";
const READ_KEY = "studioraw_read_notifications";
export const UPDATE_EVENT = "studioraw:data-updated";

function parseDateOnly(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(12, 0, 0, 0);
  return d;
}

export function getTodayDateString() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

export function formatDateDisplay(value) {
  const d = parseDateOnly(value);
  if (!d) return "Not recorded";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatTimeDisplay(v) {
  if (!v) return "10:00 AM";
  const [h, m] = String(v).split(":").map(Number);
  if (Number.isFinite(h) && Number.isFinite(m)) {
    return new Date(2000, 0, 1, h, m).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return String(v);
}

function daysDiffFromToday(targetDateStr) {
  const target = parseDateOnly(targetDateStr);
  if (!target) return null;
  const today = parseDateOnly(getTodayDateString());
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function readStorageArray(key) {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    for (const f of ["data", "records", "items", "list", "bookings", "deliveries"]) {
      if (Array.isArray(parsed?.[f])) return parsed[f];
    }
  } catch {}
  return [];
}

export function getReadNotificationIds() {
  if (typeof window === "undefined" || !window.localStorage) return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export function markNotificationAsRead(id) {
  if (!id || typeof window === "undefined" || !window.localStorage) return;
  try {
    const current = getReadNotificationIds();
    current.add(String(id));
    localStorage.setItem(READ_KEY, JSON.stringify([...current]));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key: READ_KEY, module: "notifications" } }));
  } catch (err) {
    console.warn("Unable to mark notification as read:", err);
  }
}

export function markNotificationAsUnread(id) {
  if (!id || typeof window === "undefined" || !window.localStorage) return;
  try {
    const current = getReadNotificationIds();
    current.delete(String(id));
    localStorage.setItem(READ_KEY, JSON.stringify([...current]));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key: READ_KEY, module: "notifications" } }));
  } catch (err) {
    console.warn("Unable to mark notification as unread:", err);
  }
}

export function markAllNotificationsAsRead() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const notifications = getGeneratedNotifications();
    const allIds = notifications.map((n) => String(n.id));
    localStorage.setItem(READ_KEY, JSON.stringify(allIds));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { key: READ_KEY, module: "notifications" } }));
  } catch (err) {
    console.warn("Unable to mark all notifications as read:", err);
  }
}

/**
 * Generate automatic notifications from actual bookings and deliveries.
 */
export function getGeneratedNotifications() {
  const bookings = readStorageArray(BOOKING_KEY);
  const deliveries = readStorageArray(DELIVERY_KEY);
  const readSet = getReadNotificationIds();

  const list = [];

  // 1. Process Bookings
  for (const b of bookings) {
    const status = String(b.status || "Pending").trim().toLowerCase();
    // Exclude cancelled bookings completely
    if (status === "cancelled" || status === "canceled") continue;
    // Exclude auto-enquiry artifacts if any
    if (String(b.id || "").startsWith("BOOK-ENQ-")) continue;

    const bDate = b.date || b.eventDate || b.event_date;
    if (!bDate) continue;

    const diff = daysDiffFromToday(bDate);
    if (diff === null) continue;

    const customer = String(b.customer || b.customer_name || "Customer").trim();
    const event = String(b.event || b.service || "Shoot").trim();
    const staff = b.photographer && b.photographer !== "Not Assigned" ? b.photographer : "";
    const timeFormatted = formatTimeDisplay(b.time);
    const dateFormatted = formatDateDisplay(bDate);

    // Conditions:
    // A. Booking date passed without completion
    if (diff < 0 && status !== "completed") {
      const daysAgo = Math.abs(diff);
      list.push({
        id: `notif-book-${b.id}`,
        recordId: b.id,
        module: "bookings",
        targetModule: "bookings",
        type: "Booking Overdue",
        title: `Booking Date Passed · ${customer}`,
        message: `${event} was scheduled on ${dateFormatted} (${daysAgo} day${daysAgo > 1 ? "s" : ""} ago) at ${timeFormatted} and is awaiting completion.`,
        customer,
        event,
        date: bDate,
        dateFormatted,
        time: b.time || "10:00",
        timeFormatted,
        staff,
        status: b.status || "Confirmed",
        urgency: "overdue",
        priority: "Urgent",
        urgencyLabel: `${daysAgo}d Overdue`,
        isRead: readSet.has(`notif-book-${b.id}`),
        sortScore: 100 + daysAgo,
      });
    } else if (diff === 0) {
      // B. Booking Today
      list.push({
        id: `notif-book-${b.id}`,
        recordId: b.id,
        module: "bookings",
        targetModule: "bookings",
        type: "Booking Today",
        title: `Booking Scheduled Today · ${customer}`,
        message: `${event} is scheduled today at ${timeFormatted}.${staff ? ` Assigned: ${staff}.` : ""}`,
        customer,
        event,
        date: bDate,
        dateFormatted,
        time: b.time || "10:00",
        timeFormatted,
        staff,
        status: b.status || "Confirmed",
        urgency: "today",
        priority: "High",
        urgencyLabel: "Today",
        isRead: readSet.has(`notif-book-${b.id}`),
        sortScore: 90,
      });
    } else if (diff === 1) {
      // C. Booking Tomorrow
      list.push({
        id: `notif-book-${b.id}`,
        recordId: b.id,
        module: "bookings",
        targetModule: "bookings",
        type: "Booking Tomorrow",
        title: `Booking Tomorrow · ${customer}`,
        message: `${event} scheduled tomorrow (${dateFormatted}) at ${timeFormatted}.${staff ? ` Assigned: ${staff}.` : ""}`,
        customer,
        event,
        date: bDate,
        dateFormatted,
        time: b.time || "10:00",
        timeFormatted,
        staff,
        status: b.status || "Confirmed",
        urgency: "upcoming",
        priority: "High",
        urgencyLabel: "Tomorrow",
        isRead: readSet.has(`notif-book-${b.id}`),
        sortScore: 80,
      });
    } else if (diff >= 2 && diff <= 3) {
      // D. Booking within next 3 days
      list.push({
        id: `notif-book-${b.id}`,
        recordId: b.id,
        module: "bookings",
        targetModule: "bookings",
        type: "Upcoming Booking",
        title: `Upcoming Booking in ${diff} Days · ${customer}`,
        message: `${event} scheduled on ${dateFormatted} at ${timeFormatted}.${staff ? ` Assigned: ${staff}.` : ""}`,
        customer,
        event,
        date: bDate,
        dateFormatted,
        time: b.time || "10:00",
        timeFormatted,
        staff,
        status: b.status || "Confirmed",
        urgency: "upcoming",
        priority: "Medium",
        urgencyLabel: `In ${diff} days`,
        isRead: readSet.has(`notif-book-${b.id}`),
        sortScore: 70 - diff,
      });
    }
  }

  // 2. Process Deliveries
  for (const d of deliveries) {
    const status = String(d.status || "Pending").trim().toLowerCase();
    // Exclude cancelled deliveries
    if (status === "cancelled" || status === "canceled") continue;

    const customer = String(d.customer || "Customer").trim();
    const item = String(d.item || d.deliveryItem || "Order Deliverable").trim();
    const expDate = d.expectedDate || d.expected_date || d.dueDate || d.date;
    const dateFormatted = expDate ? formatDateDisplay(expDate) : "—";

    // Condition A: Completed delivery
    if (status === "delivered") {
      const deliveredOn = d.deliveredDate ? formatDateDisplay(d.deliveredDate) : dateFormatted;
      list.push({
        id: `notif-deliv-${d.id}`,
        recordId: d.id,
        module: "deliveries",
        targetModule: "deliveries",
        type: "Delivery Completed",
        title: `Delivery Completed · ${customer}`,
        message: `${item} was marked delivered (${deliveredOn}).`,
        customer,
        event: item,
        item,
        date: d.deliveredDate || expDate || getTodayDateString(),
        dateFormatted: deliveredOn,
        staff: d.assignedTo || "",
        status: "Delivered",
        urgency: "completed",
        priority: "Low",
        urgencyLabel: "Delivered",
        isRead: readSet.has(`notif-deliv-${d.id}`),
        sortScore: 20,
      });
      continue;
    }

    if (!expDate) continue;
    const diff = daysDiffFromToday(expDate);
    if (diff === null) continue;

    // Condition B: Overdue delivery
    if (diff < 0) {
      const daysOverdue = Math.abs(diff);
      list.push({
        id: `notif-deliv-${d.id}`,
        recordId: d.id,
        module: "deliveries",
        targetModule: "deliveries",
        type: "Delivery Overdue",
        title: `Delivery Overdue · ${customer}`,
        message: `${item} expected on ${dateFormatted} is ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue. Status: ${d.status || "Pending"}.`,
        customer,
        event: item,
        item,
        date: expDate,
        dateFormatted,
        staff: d.assignedTo || "",
        status: d.status || "Pending",
        urgency: "overdue",
        priority: "Urgent",
        urgencyLabel: `${daysOverdue}d Overdue`,
        isRead: readSet.has(`notif-deliv-${d.id}`),
        sortScore: 95 + daysOverdue,
      });
    } else if (diff === 0) {
      // Condition C: Delivery due today
      list.push({
        id: `notif-deliv-${d.id}`,
        recordId: d.id,
        module: "deliveries",
        targetModule: "deliveries",
        type: "Delivery Due Today",
        title: `Delivery Due Today · ${customer}`,
        message: `${item} is scheduled for delivery today (${dateFormatted}). Status: ${d.status || "Pending"}.`,
        customer,
        event: item,
        item,
        date: expDate,
        dateFormatted,
        staff: d.assignedTo || "",
        status: d.status || "Pending",
        urgency: "today",
        priority: "High",
        urgencyLabel: "Due Today",
        isRead: readSet.has(`notif-deliv-${d.id}`),
        sortScore: 88,
      });
    } else if (diff >= 1 && diff <= 5) {
      // Condition D: Approaching delivery
      list.push({
        id: `notif-deliv-${d.id}`,
        recordId: d.id,
        module: "deliveries",
        targetModule: "deliveries",
        type: "Approaching Delivery",
        title: `Delivery Due in ${diff} Day${diff > 1 ? "s" : ""} · ${customer}`,
        message: `${item} is scheduled for delivery on ${dateFormatted}. Status: ${d.status || "Pending"}.`,
        customer,
        event: item,
        item,
        date: expDate,
        dateFormatted,
        staff: d.assignedTo || "",
        status: d.status || "Pending",
        urgency: "upcoming",
        priority: diff <= 2 ? "High" : "Medium",
        urgencyLabel: diff === 1 ? "Due Tomorrow" : `Due in ${diff}d`,
        isRead: readSet.has(`notif-deliv-${d.id}`),
        sortScore: 65 - diff,
      });
    }
  }

  // Sort: Unread first, then highest sortScore (overdue -> today -> tomorrow -> upcoming -> completed)
  return list.sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    return (b.sortScore || 0) - (a.sortScore || 0);
  });
}

/**
 * Get current unread notification count directly from actual records.
 */
export function getUnreadNotificationCount() {
  const notifications = getGeneratedNotifications();
  return notifications.filter((n) => !n.isRead).length;
}
