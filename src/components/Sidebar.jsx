
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  CalendarDays,
  CreditCard,
  ClipboardCheck,
  Camera,
  Images,
  BookOpen,
  Truck,
  HeartHandshake,
  Boxes,
  Aperture,
  UserCheck,
  Wallet,
  Building2,
  BarChart3,
  ShieldCheck,
  Bell,
  ScrollText,
  Settings,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const menuGroups = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        key: "dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "CRM MANAGEMENT",
    items: [
      {
        label: "Enquiries & Leads",
        key: "enquiries",
        icon: MessageSquare,
      },
      {
        label: "Customers",
        key: "customers",
        icon: Users,
      },
      {
        label: "Booking & Calendar",
        key: "bookings",
        icon: CalendarDays,
      },
      {
        label: "Payment & Billing",
        key: "payments",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "PHOTOGRAPHY WORKFLOW",
    items: [
      {
        label: "Pre-Shoot Preparation",
        key: "preshoot",
        icon: ClipboardCheck,
      },
      {
        label: "Photo Shoot & Data",
        key: "photoshoot",
        icon: Camera,
      },
      {
        label: "Photo Selection & Editing",
        key: "photoediting",
        icon: Images,
      },
      {
        label: "Album Design & Printing",
        key: "albumprinting",
        icon: BookOpen,
      },
      {
        label: "Delivery Management",
        key: "delivery",
        icon: Truck,
      },
      {
        label: "Follow-up & CRM",
        key: "followup",
        icon: HeartHandshake,
      },
    ],
  },
  {
    title: "ERP MANAGEMENT",
    items: [
      {
        label: "Inventory Management",
        key: "inventory",
        icon: Boxes,
      },
      {
        label: "Equipment Management",
        key: "equipment",
        icon: Aperture,
      },
      {
        label: "Staff Attendance",
        key: "attendance",
        icon: UserCheck,
      },
      {
        label: "Expense & Profit",
        key: "expenses",
        icon: Wallet,
      },
      {
        label: "Multi-Branch Management",
        key: "branches",
        icon: Building2,
      },
    ],
  },
  {
    title: "ADMINISTRATION",
    items: [
      {
        label: "Reports & Analytics",
        key: "reports",
        icon: BarChart3,
      },
      {
        label: "Roles & Permissions",
        key: "roles",
        icon: ShieldCheck,
      },
      {
        label: "Notifications & Reminders",
        key: "notifications",
        icon: Bell,
      },
      {
        label: "Audit Logs & Activity",
        key: "auditlogs",
        icon: ScrollText,
      },
      {
        label: "Settings & Staff",
        key: "settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  onNavigate,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
}) {
  const navigate = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    } else if (typeof setActivePage === "function") {
      setActivePage(page);
    }

    setSidebarOpen?.(false);
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen?.(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* MAIN SIDEBAR */}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,85vw)] max-w-full flex-col overflow-hidden bg-[#10264d] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:w-[280px] lg:translate-x-0 lg:bg-[#081a34] lg:shadow-[8px_0_40px_rgba(8,26,52,0.12)] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* DESKTOP BACKGROUND DECORATION */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-b from-[#102b50] via-[#0a1e3b] to-[#061429]" />

          <div className="absolute -right-32 -top-28 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />
        </div>

        {/* BRAND SECTION */}
        <div className="relative z-10 flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 lg:h-[96px] lg:border-white/[0.08] lg:px-6">

          {/* MOBILE BRAND - UNCHANGED */}
          <div className="min-w-0 flex-1 lg:hidden">
            <h1 className="truncate text-lg font-bold tracking-wide">
              STUDIO RAW
            </h1>

            <p className="break-words text-[10px] tracking-[0.14em] text-blue-200">
              PICTUREZ ERP & CRM
            </p>
          </div>

          {/* PREMIUM DESKTOP BRAND */}
          <div className="hidden min-w-0 items-center gap-3 lg:flex">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-white/20 to-white/5 shadow-lg shadow-black/10">
              <Camera size={24} strokeWidth={1.6} />

              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-[3px] border-[#102b50] bg-blue-300" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-extrabold tracking-[0.045em] text-white">
                STUDIO RAW
              </h1>

              <p className="mt-1 text-[9px] font-medium tracking-[0.17em] text-blue-200/65">
                PICTUREZ ERP & CRM
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => setSidebarOpen?.(false)}
            aria-label="Close sidebar"
            className="shrink-0 rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* DESKTOP WORKSPACE CARD */}
        <div className="relative z-10 hidden px-4 pb-1 pt-5 lg:block">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/15 text-blue-200">
              <Sparkles size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white/90">
                Studio Workspace
              </p>

              <p className="mt-0.5 text-[10px] text-blue-200/55">
                Management Console
              </p>
            </div>

            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
          </div>
        </div>

        {/* NAVIGATION MENU */}
        <nav className="relative z-10 min-h-0 w-full flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-5 lg:space-y-7 lg:px-3 lg:pb-5 lg:pt-6 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.2)_transparent]">
          {menuGroups.map((group) => (
            <div
              key={group.title}
              className="w-full min-w-0"
            >
              {/* GROUP TITLE */}
              <p className="mb-3 px-4 text-[10px] font-bold tracking-[0.16em] text-blue-300/70 lg:mb-3.5 lg:text-[9px] lg:tracking-[0.2em] lg:text-blue-200/40">
                {group.title}
              </p>

              {/* GROUP ITEMS */}
              <div className="flex w-full flex-col gap-1 lg:gap-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigate(item.key)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex min-h-12 w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-medium transition lg:min-h-[45px] lg:rounded-xl lg:px-3.5 lg:py-2.5 lg:duration-200 ${
                        active
                          ? "bg-white text-[#10264d] shadow-sm lg:bg-gradient-to-r lg:from-[#f3f7ff] lg:to-white lg:text-[#10264d] lg:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
                          : "text-blue-100 hover:bg-white/10 hover:text-white lg:text-blue-100/65 lg:hover:bg-white/[0.075] lg:hover:text-white"
                      }`}
                    >
                      {/* DESKTOP ACTIVE INDICATOR */}
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 hidden w-[3px] rounded-r-full bg-[#4979c5] lg:block" />
                      )}

                      {/* DESKTOP ICON */}
                      <span
                        className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors lg:flex ${
                          active
                            ? "bg-[#10264d]/10 text-[#10264d]"
                            : "bg-white/[0.045] text-blue-100/70 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <Icon size={17} strokeWidth={1.8} />
                      </span>

                      {/* MOBILE ICON - UNCHANGED */}
                      <Icon
                        size={18}
                        className="shrink-0 lg:hidden"
                      />

                      {/* MENU LABEL */}
                      <span className="min-w-0 flex-1 break-words leading-5 lg:text-[12.5px] lg:font-medium">
                        {item.label}
                      </span>

                      {/* DESKTOP ARROW */}
                      <ChevronRight
                        size={14}
                        className={`hidden shrink-0 transition-all duration-200 lg:block ${
                          active
                            ? "text-[#315e9a] opacity-100"
                            : "text-blue-200/50 opacity-0 group-hover:opacity-100"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* LOGOUT SECTION */}
        <div className="relative z-10 w-full shrink-0 border-t border-white/10 bg-[#10264d] p-3 lg:border-white/[0.08] lg:bg-[#07172d]/80 lg:p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 hover:text-red-100 lg:rounded-xl lg:border lg:border-transparent lg:px-3.5 lg:text-[13px] lg:hover:border-red-300/10"
          >
            <LogOut
              size={19}
              className="shrink-0 lg:h-[18px] lg:w-[18px]"
            />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
