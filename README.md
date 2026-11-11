# Studio Raw ERP & CRM - Frontend-Only Demo Mode

This application has been converted into a completely independent, frontend-only demonstration application. It showcases the exact Studio Raw ERP interface, layouts, tables, forms, charts, and interactions without requiring the Django backend server, database, or external network connectivity.

## Demo Login Credentials

- **Username:** `prathi`
- **Password:** `prathi`

*(Alternative admin credentials: `admin` / `admin`)*

## Running the Application Locally

```bash
# Navigate to the frontend directory
cd studio-raw-erp

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Open `http://localhost:5173` in your browser.

## Key Demo Features

- **Zero Backend Dependency:** All live fetch requests targeting Django have been disconnected. The app runs completely offline.
- **Centralized Demo Data Layer:** Located in `src/data/demo/` and managed via `src/services/demo/demoDataService.js`.
- **Consistent Data Relationships:** The same employee, customer, booking, and invoice IDs are synchronized across all modules.
- **Local State Persistence:** Edits, additions, status updates, and deletions persist in `localStorage` across page reloads.
- **Interactive Modules:**
  - **Dashboard:** Real-time statistics, monthly trend charts, upcoming bookings, and recent activities.
  - **Customers:** Client directory, search, filter, and profile inspection.
  - **Enquiries:** Lead status pipeline (New, Contacted, Follow Up, Won, Converted, Lost).
  - **Booking Calendar:** Shoot bookings calendar with date filters and staff assignments.
  - **Payments & Billing:** Invoices, payment transaction history, and jsPDF invoice printing.
  - **Deliveries:** Milestone delivery tracking and status management.
  - **Expenses:** Operating expense log with category breakdowns.
  - **Staff Management:** Complete employee directory with roles, departments, and salaries in ₹.
  - **Staff Attendance:** Daily attendance marking (Present, Absent, Leave, Half Day).
  - **Wedding Photography & Videography:** Shoot orders and crew management.
  - **Reports & Analytics:** Precalculated and dynamic conversion rates, revenue, and profitability charts.
  - **Studio Settings:** Editable studio profile and preferences.
