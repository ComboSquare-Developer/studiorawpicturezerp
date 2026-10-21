
import { useEffect, useState } from "react";

// Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Authentication
import Login from "./pages/Login";

// CRM & Dashboard
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Customers from "./pages/Customers";
import BookingCalendar from "./pages/BookingCalendar";
import Payments from "./pages/Payments";

// Photography Workflow
import PreShoot from "./pages/PreShoot";
import PhotoShoot from "./pages/PhotoShoot";
import PhotoEditing from "./pages/PhotoEditing";
import AlbumPrinting from "./pages/AlbumPrinting";
import Delivery from "./pages/Delivery";
import FollowUp from "./pages/FollowUp";

// ERP Management
import Inventory from "./pages/Inventory";
import Equipment from "./pages/Equipment";
import StaffAttendance from "./pages/StaffAttendance";
import Expenses from "./pages/Expenses";
import Branches from "./pages/Branches";

// Administration
import Reports from "./pages/Reports";
import RolesPermissions from "./pages/RolesPermissions";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("studioraw_logged_in") === "true";
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login
  const handleLogin = () => {
    localStorage.setItem("studioraw_logged_in", "true");

    setIsLoggedIn(true);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("studioraw_logged_in");

    setIsLoggedIn(false);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  // Navigation
  const handleNavigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Close sidebar using Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (!sidebarOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    if (!mediaQuery.matches) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  // Render active page
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;

      case "enquiries":
      case "leads":
        return <Enquiries />;

      case "customers":
        return <Customers />;

      case "bookings":
      case "calendar":
        return <BookingCalendar />;

      case "payments":
      case "billing":
        return <Payments />;

      case "preshoot":
        return <PreShoot />;

      case "photoshoot":
        return <PhotoShoot />;

      case "photoediting":
        return <PhotoEditing />;

      case "albumprinting":
        return <AlbumPrinting />;

      case "delivery":
        return <Delivery />;

      case "followup":
        return <FollowUp />;

      case "inventory":
        return <Inventory />;

      case "equipment":
        return <Equipment />;

      case "attendance":
        return <StaffAttendance />;

      case "expenses":
        return <Expenses />;

      case "branches":
        return <Branches />;

      case "reports":
        return <Reports />;

      case "roles":
        return <RolesPermissions />;

      case "notifications":
        return <Notifications />;

      case "auditlogs":
        return <AuditLogs />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard />;
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-slate-50 lg:bg-[#f5f7fb]">

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={handleNavigate}
        onNavigate={handleNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Layout */}
      <div
        className="
          flex min-h-screen w-full min-w-0 max-w-full flex-col
          lg:ml-[280px]
          lg:w-[calc(100%-280px)]
          lg:max-w-[calc(100%-280px)]
        "
      >

        {/* Header */}
        <Header
          activePage={activePage}
          setSidebarOpen={setSidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="w-full min-w-0 max-w-full flex-1 overflow-x-hidden lg:bg-[#f5f7fb]">
          <div className="w-full min-w-0 max-w-full">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
