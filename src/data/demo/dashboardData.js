/**
 * Studio Raw ERP - Demo Dashboard Statistics & Summary Data
 *
 * All figures are 100% mathematically consistent with the demo records:
 * - Total Customers: 10
 * - Total Enquiries: 8
 * - Total Bookings: 8
 * - Contracted Revenue: ₹8,85,000
 * - Amount Received: ₹4,80,000
 * - Pending Balance: ₹4,05,000
 * - Pending Deliveries: 4
 * - Total Expenses: ₹1,33,000
 */

export const demoDashboardData = {
  total_customers: 10,
  total_enquiries: 8,
  total_bookings: 8,
  total_payments_received: 480000,
  total_contracted_revenue: 885000,
  pending_payment_balance: 405000,
  pending_deliveries: 4,
  total_expenses: 133000,
  active_staff_count: 12,
  present_today_count: 10,
  on_leave_today_count: 1,

  upcoming_events: [
    {
      id: "BK-2026-001",
      title: "Priya & Karthik - Wedding",
      date: "2026-11-20",
      location: "Leela Palace, Chennai",
      status: "Confirmed",
      total_amount: 150000,
    },
    {
      id: "BK-2026-002",
      title: "Arun & Divya - Reception",
      date: "2026-11-25",
      location: "Radisson Blu, Coimbatore",
      status: "Confirmed",
      total_amount: 85000,
    },
    {
      id: "BK-2026-005",
      title: "Rajesh Kumar - Birthday Function",
      date: "2026-11-28",
      location: "Nagercoil Club",
      status: "Pending",
      total_amount: 35000,
    },
    {
      id: "BK-2026-008",
      title: "Dr. Arvind Swaminathan - Corporate Event",
      date: "2026-11-30",
      location: "ITC Grand Chola, Chennai",
      status: "Completed",
      total_amount: 90000,
    },
    {
      id: "BK-2026-004",
      title: "Deepak & Anjali - Engagement",
      date: "2026-12-05",
      location: "Heritage Madurai",
      status: "Confirmed",
      total_amount: 65000,
    },
    {
      id: "BK-2026-006",
      title: "Sunil & Meenakshi - Wedding & Reception",
      date: "2026-12-12",
      location: "Royal Palace, Tirunelveli",
      status: "Confirmed",
      total_amount: 175000,
    },
  ],

  recent_activities: [
    {
      id: "act-1",
      type: "payment",
      title: "Payment received from Vikram & Pooja",
      description: "₹1,20,000 via Bank Transfer (Partial)",
      time: "2026-10-30T10:30:00Z",
    },
    {
      id: "act-2",
      type: "booking",
      title: "Booking confirmed for Vikram & Pooja",
      description: "Destination Wedding on 2026-12-22 (Confirmed)",
      time: "2026-10-30T10:00:00Z",
    },
    {
      id: "act-3",
      type: "payment",
      title: "Payment received from Arun & Divya",
      description: "₹40,000 via UPI (Partial)",
      time: "2026-10-28T11:00:00Z",
    },
    {
      id: "act-4",
      type: "booking",
      title: "Booking confirmed for Arun & Divya",
      description: "Reception on 2026-11-25 (Confirmed)",
      time: "2026-10-28T09:10:00Z",
    },
    {
      id: "act-5",
      type: "payment",
      title: "Payment received from Priya & Karthik",
      description: "₹75,000 via Bank Transfer (Partial)",
      time: "2026-10-25T15:30:00Z",
    },
    {
      id: "act-6",
      type: "booking",
      title: "Booking confirmed for Priya & Karthik",
      description: "Wedding on 2026-11-20 (Confirmed)",
      time: "2026-10-25T14:30:00Z",
    },
    {
      id: "act-7",
      type: "enquiry",
      title: "New enquiry from Anand & Keerthi",
      description: "Wedding enquiry via Instagram (New)",
      time: "2026-11-10T11:20:00Z",
    },
    {
      id: "act-8",
      type: "delivery",
      title: "Delivery completed for Dr. Arvind Swaminathan",
      description: "Digital 4K Video Cloud Link + Master SSD Drive delivered",
      time: "2026-11-05T14:00:00Z",
    },
  ],

  monthly_trends: [
    { month: "Jun 2026", revenue: 280000, bookings: 4, expenses: 85000 },
    { month: "Jul 2026", revenue: 320000, bookings: 5, expenses: 95000 },
    { month: "Aug 2026", revenue: 410000, bookings: 6, expenses: 110000 },
    { month: "Sep 2026", revenue: 490000, bookings: 7, expenses: 125000 },
    { month: "Oct 2026", revenue: 650000, bookings: 9, expenses: 140000 },
    { month: "Nov 2026", revenue: 480000, bookings: 8, expenses: 133000 },
  ],
};

export default demoDashboardData;
