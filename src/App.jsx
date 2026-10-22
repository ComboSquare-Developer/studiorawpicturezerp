
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Customers from "./pages/Customers";
import BookingCalendar from "./pages/BookingCalendar";
import Payments from "./pages/Payments";
import PreShoot from "./pages/PreShoot";
import PhotoShoot from "./pages/PhotoShoot";
import Delivery from "./pages/Delivery";
import Inventory from "./pages/Inventory";
import Equipment from "./pages/Equipment";
import Expenses from "./pages/Expenses";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("studioraw_logged_in") === "true";
  });

  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("studioraw_logged_in", "true");
    } else {
      localStorage.removeItem("studioraw_logged_in");
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    localStorage.setItem("studioraw_logged_in", "true");
    setIsLoggedIn(true);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("studioraw_logged_in");
    setIsLoggedIn(false);
    setSidebarOpen(false);
    setActivePage("dashboard");
  };

  const handleNavigate = (page) => {
    setActivePage(String(page).toLowerCase());
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard setActivePage={handleNavigate} />;

      case "enquiries":
      case "leads":
        return <Enquiries />;

      case "customers":
        return <Customers />;

      case "bookings":
      case "bookingcalendar":
      case "calendar":
        return <BookingCalendar />;

      case "payments":
      case "billing":
        return <Payments />;

      case "preshoot":
      case "shootreadiness":
        return <PreShoot />;

      case "photoshoot":
        return <PhotoShoot />;

      case "delivery":
        return <Delivery />;

      case "inventory":
        return <Inventory />;

      case "equipment":
        return <Equipment />;

      case "expenses":
        return <Expenses />;

      case "branches":
        return <Branches />;

      case "reports":
        return <Reports />;

      case "notifications":
        return <Notifications />;

      case "auditlogs":
      case "audit-logs":
        return <AuditLogs />;

      case "settings":
        return <Settings />;

      default:
        return <Dashboard setActivePage={handleNavigate} />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        setActivePage={handleNavigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="min-h-screen min-w-0 lg:ml-[280px]">
        <Header
          activePage={activePage}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
        />

        <main className="min-w-0 p-3 sm:p-5 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}