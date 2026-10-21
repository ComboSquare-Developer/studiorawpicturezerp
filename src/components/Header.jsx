
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  UserCircle,
  Building2,
  X,
} from "lucide-react";

const pageTitles = {
  dashboard: "Dashboard",
  enquiries: "Enquiries & Leads",
  leads: "Enquiries & Leads",
  customers: "Customers",
  bookings: "Booking & Calendar",
  calendar: "Booking & Calendar",
  payments: "Payment & Billing",
  billing: "Payment & Billing",
  preshoot: "Pre-Shoot Preparation",
  photoshoot: "Photo Shoot & Data",
  photoediting: "Photo Selection & Editing",
  albumprinting: "Album Design & Printing",
  delivery: "Delivery Management",
  followup: "Follow-up & CRM",
  inventory: "Inventory Management",
  equipment: "Equipment Management",
  attendance: "Staff Attendance",
  expenses: "Expense & Profit",
  branches: "Multi-Branch Management",
  reports: "Reports & Analytics",
  roles: "Roles & Permissions",
  notifications: "Notifications & Reminders",
  auditlogs: "Audit Logs & Activity",
  settings: "Settings & Staff",
};

export default function Header({
  activePage,
  setSidebarOpen,
  onMenuClick,
  onLogout,
  onNavigate,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  const title = pageTitles[activePage] || "Dashboard";

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutsideClick
    );

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setSearchOpen(false);
  }, [activePage]);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  const openSidebar = () => {
    setProfileOpen(false);

    if (typeof onMenuClick === "function") {
      onMenuClick();
    } else {
      setSidebarOpen?.(true);
    }
  };

  const goToNotifications = () => {
    setProfileOpen(false);
    setSearchOpen(false);
    onNavigate?.("notifications");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setSearchOpen(false);
    onLogout?.();
  };

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 max-w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Main Header */}
      <div className="flex h-[72px] w-full min-w-0 items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
        {/* Left Section */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#10264d] transition hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Page Title */}
          <div className="min-w-0 flex-1">
            <p className="hidden text-xs text-slate-400 sm:block">
              Studio Management
            </p>

            <h1 className="truncate text-sm font-bold leading-tight text-[#10264d] min-[400px]:text-base sm:text-xl xl:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Desktop Search */}
          <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-[#F5F8FD] px-3 py-2.5 xl:flex">
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search workspace..."
              aria-label="Search workspace"
              className="w-28 min-w-0 bg-transparent text-sm text-[#10264d] outline-none 2xl:w-44"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="shrink-0 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Branch Information */}
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 2xl:flex">
            <Building2 size={17} />
            <span>Main Branch</span>
          </div>

          {/* Mobile / Tablet Search */}
          <button
            type="button"
            onClick={() =>
              setSearchOpen((previous) => !previous)
            }
            aria-label={
              searchOpen
                ? "Close search"
                : "Open search"
            }
            aria-expanded={searchOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#10264d] transition hover:bg-slate-100 sm:h-10 sm:w-10 xl:hidden"
          >
            {searchOpen ? (
              <X size={19} />
            ) : (
              <Search size={19} />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={goToNotifications}
            aria-label="Open notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F8FD] text-[#10264d] transition hover:bg-blue-50 sm:h-10 sm:w-10"
          >
            <Bell size={19} />
          </button>

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((previous) => !previous)
              }
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1 rounded-xl p-0.5 transition hover:bg-slate-50 sm:gap-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10264d] text-white sm:h-10 sm:w-10">
                <UserCircle size={22} />
              </div>

              <div className="hidden text-left 2xl:block">
                <p className="text-sm font-semibold text-[#10264d]">
                  Demo Admin
                </p>

                <p className="text-xs text-slate-400">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden shrink-0 text-slate-500 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-48 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
              >
                <div className="border-b border-slate-100 px-3 py-3 2xl:hidden">
                  <p className="text-sm font-semibold text-[#10264d]">
                    Demo Admin
                  </p>

                  <p className="text-xs text-slate-400">
                    Administrator
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Search */}
      {searchOpen && (
        <div className="w-full min-w-0 border-t border-slate-100 px-3 py-3 sm:px-5 xl:hidden">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <Search
              size={18}
              className="shrink-0 text-slate-400"
            />

            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search workspace..."
              aria-label="Search workspace"
              className="w-full min-w-0 flex-1 bg-transparent text-sm text-[#10264d] outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="shrink-0 text-slate-400 hover:text-slate-600"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Information */}
      {search.trim() && (
        <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          Global search is not connected yet.
        </p>
      )}
    </header>
  );
}
