/**
 * Studio Raw ERP - Centralized Demo Customer Data
 *
 * Strict business rule:
 * Customers are created exclusively from Confirmed enquiries.
 * In the initial demo dataset:
 * - CUS-2026-101: Priya & Karthik (from Confirmed ENQ-2026-001)
 * - CUS-2026-102: Arun & Divya (from Confirmed ENQ-2026-002)
 *
 * Unconfirmed enquiries (New, In Discussion, Follow-up) do not appear here.
 */

export const demoCustomers = [
  {
    id: "CUS-2026-101",
    name: "Priya & Karthik",
    phone: "9876543210",
    email: "priya.karthik@gmail.com",
    address: "14 Anna Nagar West, Chennai, Tamil Nadu",
    city: "Chennai",
    gender: "Other",
    language: "Tamil & English",
    source: "Referral",
    enquiryId: "ENQ-2026-001",
    event_type: "Wedding",
    eventType: "Wedding",
    status: "Active",
    notes: "VIP 2-day wedding setup. Candid photography, 4K film and drone coverage.",
    confirmationDate: "2026-10-25",
    createdAt: "2026-10-25",
    created_at: "2026-10-25T14:30:00Z",
    isConfirmedCustomer: true,
  },
  {
    id: "CUS-2026-102",
    name: "Arun & Divya",
    phone: "9845123456",
    email: "arun.divya@gmail.com",
    address: "45 Race Course Road, Coimbatore, Tamil Nadu",
    city: "Coimbatore",
    gender: "Other",
    language: "Tamil",
    source: "Instagram",
    enquiryId: "ENQ-2026-002",
    event_type: "Reception",
    eventType: "Reception",
    status: "Active",
    notes: "Grand reception with live streaming display and 40-page flush mount photobook.",
    confirmationDate: "2026-10-28",
    createdAt: "2026-10-28",
    created_at: "2026-10-28T09:10:00Z",
    isConfirmedCustomer: true,
  },
];
