
import { useEffect, useState, lazy, Suspense } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import GlobalSound from "./components/GlobalSound";
import { apiRequest } from "./api/client";

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
  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("studioraw_logged_in") === "true";
    } catch {
      return false;
    }
  });
  const [checkingSession, setCheckingSession] = useState(true);
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
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  }, [theme]);

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

  /* ==========================================
     VERIFY DJANGO SESSION ON PAGE LOAD
  ========================================== */

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        await apiRequest("auth/me/");

        if (active) {
          setLoggedIn(true);
          try {
            localStorage.setItem("studioraw_logged_in", "true");
          } catch {}
        }
      } catch {
        if (active) {
          const locallyLoggedIn =
            localStorage.getItem("studioraw_logged_in") === "true";
          setLoggedIn(locallyLoggedIn);
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const ActivePage = components[activePage];

  /* ==========================================
     LOGIN SUCCESS
  ========================================== */

  const handleLogin = (user) => {
    try {
      localStorage.setItem("studioraw_logged_in", "true");
      if (user) {
        localStorage.setItem("studioraw_user", JSON.stringify(user));
      }
    } catch {}
    setLoggedIn(true);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  /* ==========================================
     DJANGO LOGOUT
  ========================================== */

  const handleLogout = async () => {
    try {
      await apiRequest("logout/", {
        method: "POST",
      });
    } catch (error) {
      console.warn("Logout notice:", error);
    } finally {
      try {
        localStorage.removeItem("studioraw_logged_in");
        localStorage.removeItem("studioraw_user");
      } catch {}
      setLoggedIn(false);
      setActivePage("dashboard");
      setSidebarOpen(false);
    }
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const handleForgotPassword = async ({ email }) => {
    try {
      const res = await apiRequest("auth/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { success: true, message: res?.message };
    } catch (err) {
      return { success: false, message: err?.message };
    }
  };

  const handleResetPassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await apiRequest("auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return { success: true, message: res?.message || "Password updated successfully." };
    } catch (err) {
      return { success: false, message: err?.message || "Failed to update password." };
    }
  };

  if (checkingSession) {
    return (
      <>
        <GlobalSound />
        <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
          <Loader />
        </div>
      </>
    );
  }

  return (
    <>
      {/* GLOBAL SOUND - WORKS ON ALL PAGES */}
      <GlobalSound />

      {!loggedIn ? (
        <Suspense fallback={<Loader />}>
          {Login ? (
            <Login
              onLogin={handleLogin}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
              <p className="text-sm text-red-600">
                Login page file not found.
              </p>
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
              onResetPassword={handleResetPassword}
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
