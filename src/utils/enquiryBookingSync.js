/** Sync enquiries into the existing Customers and Booking Calendar localStorage schemas. */
const ENQUIRY_KEYS = ["studioraw_enquiries", "studio_raw_enquiries"];
const CUSTOMER_KEY = "studio_raw_customers";
const BOOKING_KEY = "studioraw_bookings";
const EVENT = "studioraw:data-updated";

function read(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(parsed)) return parsed;
    for (const field of ["data", "records", "items", "list", "customers", "bookings", "enquiries"]) {
      if (Array.isArray(parsed?.[field])) return parsed[field];
    }
  } catch (error) { console.error("Storage read error:", key, error); }
  return [];
}
const phoneOf = (value) => String(value || "").replace(/\D/g, "").slice(-10);
const dateOf = (value) => {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    return `${year}-${month}-${day}`;
  }
  return "";
};
const amountOf = (value) => Number(String(value ?? "").replace(/[^\d.]/g, "")) || 0;
const notify = (key) => window.dispatchEvent(new CustomEvent(EVENT, { detail: { key, module: key === BOOKING_KEY ? "bookings" : "customers" } }));

export function syncEnquiriesToBookings() {
  const allEnquiries = ENQUIRY_KEYS.flatMap(read);
  const enquiries = [...new Map(allEnquiries.filter((e) => e?.id != null).reverse().map((e) => [String(e.id), e])).values()];
  if (!enquiries.length) return { customers: 0, bookings: 0 };

  const customers = read(CUSTOMER_KEY);
  const bookings = read(BOOKING_KEY);
  let customersChanged = false;
  let bookingsChanged = false;
  let customersAdded = 0;
  let bookingsAdded = 0;

  for (const enquiry of enquiries) {
    const name = String(enquiry.name || "").trim();
    const phone = phoneOf(enquiry.number || enquiry.phone);
    if (!name || phone.length !== 10) continue;
    const id = String(enquiry.id);
    const date = dateOf(enquiry.eventDate);
    const now = new Date().toISOString();
    const existingCustomerIndex = customers.findIndex((c) =>
      (enquiry.customerId && String(c.id) === String(enquiry.customerId)) ||
      (c.enquiryId != null && String(c.enquiryId) === id) ||
      phoneOf(c.phone || c.mobile) === phone
    );
    const existingCustomer = customers[existingCustomerIndex];
    const customerId = existingCustomer?.id || `CUS-ENQ-${id}`;
    const nextCustomer = {
      ...(existingCustomer || {}), id: customerId, name, phone,
      email: enquiry.email || existingCustomer?.email || "",
      address: enquiry.city || existingCustomer?.address || "",
      source: existingCustomer?.source || "Enquiry",
      enquiryId: existingCustomer?.enquiryId ?? enquiry.id,
      notes: enquiry.notes || existingCustomer?.notes || "",
      createdAt: existingCustomer?.createdAt || now.slice(0, 10),
      updatedAt: existingCustomer?.updatedAt || now,
      isDemo: false,
    };
    if (existingCustomerIndex < 0) {
      customers.unshift(nextCustomer); customersChanged = true; customersAdded++;
    } else if (["name", "phone", "email", "address"].some((key) => existingCustomer[key] !== nextCustomer[key])) {
      customers[existingCustomerIndex] = { ...nextCustomer, updatedAt: now }; customersChanged = true;
    }

    // Booking Calendar needs a real event date to position a booking in the calendar.
    if (!date) continue;
    const eventName = String(enquiry.mainEvent || "Wedding Photography").trim();
    const bookingIndex = bookings.findIndex((b) =>
      (b.enquiryId != null && String(b.enquiryId) === id) ||
      (enquiry.bookingId && String(b.id) === String(enquiry.bookingId)) ||
      (!b.enquiryId && phoneOf(b.phone) === phone && dateOf(b.date) === date &&
        String(b.event || "").trim().toLowerCase() === eventName.toLowerCase())
    );
    const old = bookings[bookingIndex];
    const status = String(enquiry.status || "").toLowerCase() === "confirmed" ? "Confirmed" : "Pending";
    const nextBooking = {
      ...(old || {}), id: old?.id || `BOOK-ENQ-${id}`, enquiryId: enquiry.id,
      customerId, customer: name, phone, event: eventName, date,
      time: old?.time || "10:00", location: enquiry.city || old?.location || "Nagercoil",
      photographer: old?.photographer || "Not Assigned", totalAmount: amountOf(enquiry.budget),
      status: ["Completed", "Cancelled"].includes(old?.status) ? old.status : status,
      source: "Enquiry", weddingCoverage: enquiry.weddingCoverage || "",
      notes: enquiry.notes || "", createdAt: old?.createdAt || now,
      updatedAt: old?.updatedAt || now,
    };
    if (bookingIndex < 0) {
      bookings.unshift(nextBooking); bookingsChanged = true; bookingsAdded++;
    } else if (["customerId", "customer", "phone", "event", "date", "location", "totalAmount", "status"].some((key) => old[key] !== nextBooking[key])) {
      bookings[bookingIndex] = { ...nextBooking, updatedAt: now }; bookingsChanged = true;
    }
  }

  // Write both keys before publishing events to avoid partially updated views.
  if (customersChanged) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
  if (bookingsChanged) localStorage.setItem(BOOKING_KEY, JSON.stringify(bookings));
  if (customersChanged) notify(CUSTOMER_KEY);
  if (bookingsChanged) notify(BOOKING_KEY);
  return { customers: customersAdded, bookings: bookingsAdded };
}
