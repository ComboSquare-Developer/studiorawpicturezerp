
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  UserCircle,
  Building2,
  X,
  ShieldCheck,
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
    <header className="sticky top-0 z-30 w-full min-w-0 max-w-full border-b border-slate-200 bg-white shadow-sm lg:border-[#e6ebf3] lg:bg-white/95 lg:backdrop-blur-xl lg:shadow-[0_4px_24px_rgba(16,38,77,0.04)]">

      {/* MAIN HEADER */}
      <div className="flex h-[72px] w-full min-w-0 items-center justify-between gap-2 px-3 sm:px-5 lg:h-[88px] lg:px-7 xl:px-9 2xl:px-12">

        {/* LEFT SECTION */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-4">

          {/* MOBILE MENU - UNCHANGED */}
          <button
            type="button"
            onClick={openSidebar}
            aria-label="Open sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#10264d] transition hover:bg-slate-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* PAGE TITLE */}
          <div className="min-w-0 flex-1">
            <p className="hidden text-xs text-slate-400 sm:block lg:mb-1 lg:flex lg:items-center lg:gap-2 lg:text-[11px] lg:font-medium lg:tracking-wide">
              <span>Studio Management</span>

              <ChevronRight
                size={12}
                className="hidden text-slate-300 lg:block"
              />

              <span className="hidden text-[#5674a0] lg:inline">
                Workspace
              </span>
            </p>

            <h1 className="truncate text-sm font-bold leading-tight text-[#10264d] min-[400px]:text-base sm:text-xl lg:text-[24px] lg:font-extrabold lg:tracking-[-0.035em] xl:text-[26px] 2xl:text-[28px]">
              {title}
            </h1>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4">

          {/* PREMIUM DESKTOP SEARCH */}
          <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-[#F5F8FD] px-3 py-2.5 xl:flex xl:h-11 xl:w-[210px] xl:rounded-2xl xl:border-[#e2e9f3] xl:bg-[#f6f8fc] xl:px-4 xl:transition-all xl:duration-200 xl:focus-within:border-blue-300 xl:focus-within:bg-white xl:focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.06)] 2xl:w-[280px]">
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
              className="w-28 min-w-0 bg-transparent text-sm text-[#10264d] outline-none xl:w-full xl:flex-1 xl:placeholder:text-slate-400"
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

          {/* DESKTOP BRANCH INFORMATION */}
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 2xl:flex 2xl:h-11 2xl:rounded-2xl 2xl:border-[#e2e9f3] 2xl:bg-white 2xl:px-4 2xl:shadow-[0_2px_10px_rgba(16,38,77,0.025)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#244e83]">
              <Building2 size={15} />
            </div>

            <span className="font-medium text-[#304565]">
              Main Branch
            </span>
          </div>

          {/* MOBILE / TABLET SEARCH */}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#10264d] transition hover:bg-slate-100 sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-2xl lg:border lg:border-[#e6ebf3] lg:bg-[#f7f9fc] xl:hidden"
          >
            {searchOpen ? (
              <X size={19} />
            ) : (
              <Search size={19} />
            )}
          </button>

          {/* NOTIFICATIONS */}
          <button
            type="button"
            onClick={goToNotifications}
            aria-label="Open notifications"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F8FD] text-[#10264d] transition hover:bg-blue-50 sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-2xl lg:border lg:border-[#e6ebf3] lg:bg-[#f7f9fc] lg:hover:border-blue-200 lg:hover:shadow-sm"
          >
            <Bell size={19} />
          </button>

          {/* DESKTOP DIVIDER */}
          <div className="hidden h-9 w-px bg-[#e5eaf1] lg:block" />

          {/* PROFILE */}
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
              className="flex items-center gap-1 rounded-xl p-0.5 transition hover:bg-slate-50 sm:gap-2 lg:gap-3 lg:rounded-2xl lg:p-1.5 lg:hover:bg-[#f5f8fc]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10264d] text-white sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:border-[3px] lg:border-white lg:bg-gradient-to-br lg:from-[#183c6c] lg:to-[#0c2447] lg:shadow-[0_3px_12px_rgba(16,38,77,0.18)]">
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
                className={`hidden shrink-0 text-slate-500 transition-transform sm:block lg:text-[#6b7f9b] ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* PROFILE DROPDOWN */}
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-3 w-48 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-2 shadow-xl lg:w-60 lg:rounded-2xl lg:border-[#e4eaf3] lg:p-2.5 lg:shadow-[0_18px_50px_rgba(16,38,77,0.15)]"
              >
                <div className="border-b border-slate-100 px-3 py-3 2xl:hidden lg:mb-2 lg:rounded-xl lg:border-b-0 lg:bg-[#f7f9fd]">
                  <p className="text-sm font-semibold text-[#10264d]">
                    Demo Admin
                  </p>

                  <p className="text-xs text-slate-400">
                    Administrator
                  </p>
                </div>

                {/* DESKTOP PROFILE INFORMATION */}
                <div className="mb-2 hidden items-center gap-3 rounded-xl bg-[#f7f9fd] px-3 py-3 2xl:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8eff9] text-[#10264d]">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#10264d]">
                      My Workspace
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Admin Access
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 lg:rounded-xl"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE / TABLET SEARCH PANEL */}
      {searchOpen && (
        <div className="w-full min-w-0 border-t border-slate-100 px-3 py-3 sm:px-5 lg:border-[#e6ebf3] lg:px-7 xl:hidden">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 lg:rounded-2xl lg:border-[#e2e9f3] lg:bg-[#f7f9fc]">
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

      {/* SEARCH INFORMATION */}
      {search.trim() && (
        <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500 lg:border-[#e6ebf3] lg:bg-[#f8faff] lg:px-9">
          Global search is not connected yet.
        </p>
      )}
    </header>
  );
}
