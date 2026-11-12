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

  // Clean up any legacy auto-generated enquiry bookings so Bookings only has explicitly created records
  const cleanBookings = bookings.filter((b) => {
    const isAutoEnquiryBooking = String(b.id || "").startsWith("BOOK-ENQ-") && b.source === "Enquiry" && !b.isManualBooking;
    if (isAutoEnquiryBooking) {
      bookingsChanged = true;
      return false;
    }
    return true;
  });

  for (const enquiry of enquiries) {
    const isConfirmed = String(enquiry.status || "").trim().toLowerCase() === "confirmed";
    const id = String(enquiry.id);

    // If enquiry is NOT confirmed, ensure it does NOT create or keep an enquiry-derived customer
    if (!isConfirmed) {
      const cIdx = customers.findIndex((c) =>
        ((c.enquiryId != null && String(c.enquiryId) === id) ||
         (enquiry.customerId && String(c.id) === String(enquiry.customerId))) &&
        c.source === "Enquiry"
      );
      if (cIdx >= 0) {
        customers.splice(cIdx, 1);
        customersChanged = true;
      }
      continue;
    }

    const name = String(enquiry.name || "").trim();
    const phone = phoneOf(enquiry.number || enquiry.phone);
    if (!name || phone.length !== 10) continue;
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
      isConfirmedCustomer: true,
    };
    if (existingCustomerIndex < 0) {
      customers.unshift(nextCustomer); customersChanged = true; customersAdded++;
    } else if (["name", "phone", "email", "address"].some((key) => existingCustomer[key] !== nextCustomer[key])) {
      customers[existingCustomerIndex] = { ...nextCustomer, updatedAt: now }; customersChanged = true;
    }
  }

  // Write keys before publishing events to avoid partially updated views.
  if (customersChanged) localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customers));
  if (bookingsChanged) localStorage.setItem(BOOKING_KEY, JSON.stringify(cleanBookings));
  if (customersChanged) notify(CUSTOMER_KEY);
  if (bookingsChanged) notify(BOOKING_KEY);
  return { customers: customersAdded, bookings: 0 };
}
