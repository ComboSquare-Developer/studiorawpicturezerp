/**
 * Studio Raw ERP - Demo Reports & Analytics Summary Data
 *
 * Precalculated business metrics, conversion ratios, profitability,
 * category breakdowns and monthly comparisons matching all demo records.
 */

export const demoReportSummary = {
  total_customers: 10,
  total_enquiries: 8,
  converted_enquiries: 2,
  lost_enquiries: 1,
  conversion_rate: 25.0,

  total_bookings: 8,
  confirmed_bookings: 6,
  pending_bookings: 1,
  completed_bookings: 2,

  total_revenue: 885000,
  total_received: 480000,
  pending_payments: 405000,
  total_expenses: 133000,
  net_profit: 347000,
  profit_margin: 72.3,

  category_breakdown: [
    { name: "Wedding Photography", revenue: 475000, count: 3, percentage: 53.7 },
    { name: "Destination Wedding", revenue: 240000, count: 1, percentage: 27.1 },
    { name: "Reception Coverage", revenue: 85000, count: 1, percentage: 9.6 },
    { name: "Corporate Event", revenue: 90000, count: 1, percentage: 10.2 },
    { name: "Pre-Wedding & Portraiture", revenue: 110000, count: 2, percentage: 12.4 },
    { name: "Functions & Birthdays", revenue: 35000, count: 1, percentage: 4.0 },
  ],

  expense_breakdown: [
    { category: "Studio Rent", amount: 45000, percentage: 33.8 },
    { category: "Storage & Media", amount: 28000, percentage: 21.1 },
    { category: "Printing & Lab", amount: 22000, percentage: 16.5 },
    { category: "Equipment Maintenance", amount: 14500, percentage: 10.9 },
    { category: "Travel & Fuel", amount: 12500, percentage: 9.4 },
    { category: "Utilities & Software", amount: 6800, percentage: 5.1 },
    { category: "Hospitality", amount: 4200, percentage: 3.2 },
  ],

  monthly_comparison: [
    { month: "Jun 2026", revenue: 280000, received: 250000, expenses: 85000, profit: 165000 },
    { month: "Jul 2026", revenue: 320000, received: 290000, expenses: 95000, profit: 195000 },
    { month: "Aug 2026", revenue: 410000, received: 380000, expenses: 110000, profit: 270000 },
    { month: "Sep 2026", revenue: 490000, received: 450000, expenses: 125000, profit: 325000 },
    { month: "Oct 2026", revenue: 650000, received: 590000, expenses: 140000, profit: 450000 },
    { month: "Nov 2026", revenue: 885000, received: 480000, expenses: 133000, profit: 347000 },
  ],
};

export default demoReportSummary;
