
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  CalendarDays,
  Wallet,
  ClipboardCheck,
  Camera,
  PackageCheck,
  Boxes,
  Wrench,
  Receipt,
  Building2,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import studioRawLogo from "../assets/favicon.png";

const menuGroups = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", id: "dashboard", icon: LayoutDashboard },
      { label: "Enquiries", id: "enquiries", icon: MessageSquare },
      { label: "Customers", id: "customers", icon: Users },
      { label: "Booking Calendar", id: "bookings", icon: CalendarDays },
    ],
  },
  {
    title: "STUDIO OPERATIONS",
    items: [
      { label: "Payments", id: "payments", icon: Wallet },
      { label: "Shoot Readiness", id: "preshoot", icon: ClipboardCheck },
      { label: "Media Tracer", id: "photoshoot", icon: Camera },
      { label: "Delivery", id: "delivery", icon: PackageCheck },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      { label: "Inventory", id: "inventory", icon: Boxes },
      { label: "Equipment", id: "equipment", icon: Wrench },
      { label: "Expenses", id: "expenses", icon: Receipt },
      { label: "Branches", id: "branches", icon: Building2 },
    ],
  },
  {
    title: "INSIGHTS & SYSTEM",
    items: [
      { label: "Reports", id: "reports", icon: BarChart3 },
      { label: "Notifications", id: "notifications", icon: Bell },
      { label: "Settings", id: "settings", icon: Settings },
    ],
  },
];

export default function Sidebar({
  activePage = "dashboard",
  setActivePage = () => {},
  sidebarOpen = false,
  setSidebarOpen = () => {},
  onLogout = () => {},
}) {
  const normalize = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[-_\s]/g, "");

  const isActive = (id) => normalize(activePage) === normalize(id);

  const navigate = (id) => {
    setActivePage(id);
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
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Dark Blue Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden border-r border-white/10 bg-[#08152F] text-white shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Decorative Background */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Brand Header */}
<div className="relative flex h-[86px] shrink-0 items-center justify-between border-b border-white/10 px-4">
  <button
    type="button"
    onClick={() => navigate("dashboard")}
    aria-label="Go to Dashboard"
    className="flex min-w-0 items-center gap-2.5 text-left"
  >
    <img
      src={studioRawLogo}
      alt="Studio Raw Picturez Logo"
      className="h-12 w-12 shrink-0 object-contain"
    />

    <span className="whitespace-nowrap text-[15px] font-extrabold tracking-wide text-white">
      STUDIO RAW PICTUREZ
    </span>
  </button>

  <button
    type="button"
    aria-label="Close sidebar"
    onClick={() => setSidebarOpen(false)}
    className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
  >
    <X size={20} />
  </button>
</div>

        {/* Navigation */}
        <nav className="relative flex-1 space-y-6 overflow-y-auto px-4 py-6 [scrollbar-color:#334766_transparent] [scrollbar-width:thin]">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <div className="mb-3 flex items-center gap-2 px-3">
                <span className="h-1 w-1 rounded-full bg-blue-400" />

                <p className="text-[10px] font-extrabold tracking-[1.8px] text-slate-400">
                  {group.title}
                </p>
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.id)}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/40"
                          : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-200" />
                      )}

                      <Icon
                        size={19}
                        strokeWidth={active ? 2.3 : 1.8}
                        className={`shrink-0 transition-colors ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-blue-300"
                        }`}
                      />

                      <span
                        className={`text-left text-[12.5px] ${
                          active ? "font-bold" : "font-medium"
                        }`}
                      >
                        {item.label}
                      </span>

                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout and Footer */}
        <div className="relative shrink-0 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold text-slate-300 transition-all duration-200 hover:border-red-400/10 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <div className="mt-4 border-t border-white/[0.07] pt-3 text-center">
            <p className="text-[10px] font-medium tracking-wide text-white">
              STUDIO RAW ERP
            </p>
            <p className="mt-1 text-[9px] text-slate-400">
              © 2026 · All rights reserved
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
