
import { useEffect, useState, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import GlobalSound from "./components/GlobalSound";

const files = import.meta.glob("./pages/*.jsx");

const pageNames = {
  // OVERVIEW
  dashboard: "Dashboard",
  enquiries: "Enquiries",
  customers: "Customers",

  // SHOOT BOOKINGS & EVENTS
  bookings: "BookingCalendar",
  "booking-calendar": "BookingCalendar",
  "wedding-photography": "WeddingPhotography",
  "wedding-videography": "WeddingVideography",
  "functions-we-arrange": "FunctionsWeArrange",
  "event-management": "EventManagement",
  "customized-gifts": "CustomizedGifts",

  // OPERATIONS
  payments: "Payments",
  deliveries: "Delivery",
  delivery: "Delivery",
  inventory: "Inventory",
  equipment: "Equipment",
  expenses: "Expenses",

  // MANAGEMENT
  staff: "Staff",
  branches: "Branches",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
};

const getPage = (name) => {
  const file = Object.keys(files).find((path) => {
    const filename = path
      .split("/")
      .pop()
      .replace(".jsx", "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const target = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return filename === target;
  });

  return file ? lazy(files[file]) : null;
};

const components = Object.fromEntries(
  Object.entries(pageNames).map(([key, value]) => [
    key,
    getPage(value),
  ])
);

const Login = getPage("Login");

function Loader() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#dce6f4] border-t-[#10264d]" />
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("studioraw_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const handleThemeChange = (event) => {
      const nextTheme = event.detail?.theme;

      if (nextTheme === "dark" || nextTheme === "light") {
        setTheme(nextTheme);
      }
    };

    window.addEventListener(
      "studioraw-theme-change",
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        "studioraw-theme-change",
        handleThemeChange
      );
    };
  }, []);

  const ActivePage = components[activePage];

  const handleLogin = () => {
    setLoggedIn(true);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* GLOBAL SOUND - WORKS ON ALL PAGES */}
      <GlobalSound />

      {!loggedIn ? (
        <Suspense fallback={<Loader />}>
          {Login ? (
            <Login onLogin={handleLogin} />
          ) : (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
              <button
                type="button"
                onClick={handleLogin}
                className="rounded-xl bg-[#10264d] px-6 py-3 font-semibold text-white"
              >
                Login
              </button>
            </div>
          )}
        </Suspense>
      ) : (
        <div
          className={`flex min-h-screen min-w-0 transition-colors duration-300 ${
            theme === "dark"
              ? "bg-[#0b1730]"
              : "bg-[#f5f7fb]"
          }`}
        >
          {/* SIDEBAR */}
          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigation}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            onLogout={handleLogout}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            {/* HEADER */}
            <Header
              activePage={activePage}
              setSidebarOpen={setSidebarOpen}
              onNavigate={handleNavigation}
              onLogout={handleLogout}
            />

            {/* MAIN CONTENT */}
            <main className="min-w-0 flex-1">
              <Suspense fallback={<Loader />}>
                {ActivePage ? (
                  <ActivePage />
                ) : (
                  <div className="flex min-h-[70vh] items-center justify-center p-5">
                    <div
                      className={`w-full max-w-md rounded-2xl border p-8 text-center shadow-sm ${
                        theme === "dark"
                          ? "border-[#284267] bg-[#132746] text-white"
                          : "border-[#e2e9f3] bg-white text-[#10264d]"
                      }`}
                    >
                      <h2 className="text-xl font-bold">
                        {pageNames[activePage] || activePage}
                      </h2>

                      <p
                        className={`mt-2 text-sm ${
                          theme === "dark"
                            ? "text-[#b5c8e3]"
                            : "text-slate-500"
                        }`}
                      >
                        Page file not found in src/pages.
                      </p>
                    </div>
                  </div>
                )}
              </Suspense>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
