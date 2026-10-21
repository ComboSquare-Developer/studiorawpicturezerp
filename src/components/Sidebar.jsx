
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

    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,85vw)] max-w-full flex-col overflow-hidden bg-[#10264d] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:w-64 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-wide">
              STUDIO RAW
            </h1>

            <p className="break-words text-[10px] tracking-[0.14em] text-blue-200">
              PICTUREZ ERP & CRM
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="shrink-0 rounded-lg p-2 transition hover:bg-white/10 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 w-full flex-1 space-y-6 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-5">
          {menuGroups.map((group) => (
            <div
              key={group.title}
              className="w-full min-w-0"
            >
              <p className="mb-3 px-4 text-[10px] font-bold tracking-[0.16em] text-blue-300/70">
                {group.title}
              </p>

              <div className="flex w-full flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    activePage === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        navigate(item.key)
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      className={`flex min-h-12 w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-[13px] font-medium transition ${
                        active
                          ? "bg-white text-[#10264d] shadow-sm"
                          : "text-blue-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon
                        size={18}
                        className="shrink-0"
                      />

                      <span className="min-w-0 flex-1 break-words leading-5">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="w-full shrink-0 border-t border-white/10 bg-[#10264d] p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 hover:text-red-100"
          >
            <LogOut
              size={19}
              className="shrink-0"
            />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
