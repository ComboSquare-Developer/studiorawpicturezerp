import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  Search,
  Clock3,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Check,
  Truck,
  ArrowRight,
  CalendarClock,
  Sparkles,
  CheckCheck,
} from "lucide-react";
import {
  getGeneratedNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  UPDATE_EVENT,
} from "../services/notificationService";

/* ==========================================
   CSS STYLES & ANIMATIONS
   Preserves Studio Raw ERP aesthetics
========================================== */

const PAGE_CSS = `
  @keyframes snFadeUp {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .sn-fade-up {
    animation: snFadeUp .45s ease-out both;
  }

  .sn-card-hover {
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }

  .sn-card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px rgba(16, 55, 110, 0.09);
    border-color: #bad3f0;
  }

  @media (prefers-reduced-motion: reduce) {
    .sn-fade-up {
      animation: none !important;
    }
    .sn-card-hover {
      transition: none !important;
    }
  }
`;

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = previous.current;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      previous.current = end;
      setValue(end);
      return;
    }

    let frame;
    let started;

    const animate = (time) => {
      if (started === undefined) started = time;
      const progress = Math.min((time - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;

      previous.current = next;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previous.current = end;
        setValue(end);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return Math.round(value);
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const animatedValue = useCountUp(stat.value);

  return (
    <div
      className="sn-fade-up group relative min-w-0 overflow-hidden rounded-[24px] border border-[#dbe8f7] bg-gradient-to-br from-white via-[#f8fbff] to-[#edf5ff] p-4 shadow-[0_8px_28px_rgba(16,55,110,.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b5d1ef] hover:shadow-[0_16px_36px_rgba(16,55,110,.11)] sm:p-5"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#7089a5] sm:text-sm">
            {stat.title}
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            {animatedValue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${stat.bg}`}>
          <Icon size={23} className={stat.color} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[#e2edf9] pt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7eb0e0]" />
        <p className="text-[11px] font-medium text-[#8ba0b9]">
          {stat.note}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   MAIN AUTOMATED NOTIFICATIONS COMPONENT
========================================== */

export default function Notifications({ onNavigate }) {
  const [notifications, setNotifications] = useState(() => getGeneratedNotifications());
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const syncList = () => {
    setNotifications(getGeneratedNotifications());
  };

  useEffect(() => {
    syncList();
    window.addEventListener("storage", syncList);
    window.addEventListener(UPDATE_EVENT, syncList);
    return () => {
      window.removeEventListener("storage", syncList);
      window.removeEventListener(UPDATE_EVENT, syncList);
    };
  }, []);

  const navigateTo = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    } else {
      window.dispatchEvent(new CustomEvent("studioraw:navigate", { detail: { page } }));
    }
  };

  const handleOpenRecord = (notif) => {
    markNotificationAsRead(notif.id);
    syncList();
    if (notif.targetModule) {
      navigateTo(notif.targetModule);
    }
  };

  const handleToggleRead = (e, notif) => {
    e.stopPropagation();
    if (notif.isRead) {
      markNotificationAsUnread(notif.id);
    } else {
      markNotificationAsRead(notif.id);
    }
    syncList();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    syncList();
  };

  /* ---------------- DERIVED STATS ---------------- */

  const stats = useMemo(() => {
    const total = notifications.length;
    const todayCount = notifications.filter((n) => n.urgency === "today").length;
    const upcomingCount = notifications.filter((n) => n.urgency === "upcoming").length;
    const overdueCount = notifications.filter((n) => n.urgency === "overdue").length;
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return { total, todayCount, upcomingCount, overdueCount, unreadCount };
  }, [notifications]);

  const statCards = [
    {
      title: "Total Reminders",
      value: stats.total,
      icon: BellRing,
      note: "All active schedule alerts",
      color: "text-[#245c9b]",
      bg: "bg-[#e1efff]",
      accent: "from-[#173d77] to-[#79b3ed]",
    },
    {
      title: "Due Today",
      value: stats.todayCount,
      icon: Clock3,
      note: "Shoots & deliveries today",
      color: "text-[#bf7827]",
      bg: "bg-[#fff0d9]",
      accent: "from-[#e7a143] to-[#ffd18b]",
    },
    {
      title: "Upcoming (Next 3 Days)",
      value: stats.upcomingCount,
      icon: CalendarClock,
      note: "Approaching schedules",
      color: "text-[#1685a8]",
      bg: "bg-[#ddf4ff]",
      accent: "from-[#2188b4] to-[#89d7f0]",
    },
    {
      title: "Overdue Items",
      value: stats.overdueCount,
      icon: AlertTriangle,
      note: "Past shoots or deliveries",
      color: "text-[#c4415a]",
      bg: "bg-[#ffebef]",
      accent: "from-[#c4415a] to-[#fca5b7]",
    },
  ];

  /* ---------------- FILTERING & SEARCH ---------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return notifications.filter((item) => {
      // Type/Urgency filter
      if (activeFilter === "Bookings" && item.module !== "bookings") return false;
      if (activeFilter === "Deliveries" && item.module !== "deliveries") return false;
      if (activeFilter === "Today" && item.urgency !== "today") return false;
      if (activeFilter === "Overdue" && item.urgency !== "overdue") return false;
      if (activeFilter === "Unread" && item.isRead) return false;

      // Query search
      if (!q) return true;
      const haystack = [
        item.title,
        item.message,
        item.customer,
        item.event,
        item.item,
        item.staff,
        item.status,
        item.urgencyLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [notifications, search, activeFilter]);

  const filterTabs = [
    { id: "All", label: "All Reminders", count: notifications.length },
    { id: "Bookings", label: "Bookings", count: notifications.filter((n) => n.module === "bookings").length },
    { id: "Deliveries", label: "Deliveries", count: notifications.filter((n) => n.module === "deliveries").length },
    { id: "Today", label: "Today", count: stats.todayCount },
    { id: "Overdue", label: "Overdue", count: stats.overdueCount },
    { id: "Unread", label: "Unread", count: stats.unreadCount },
  ];

  return (
    <div className="studio-notifications-premium min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <style>{PAGE_CSS}</style>

      {/* HEADER SECTION */}
      <div className="sn-fade-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe9f8] bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#3468a3]">
            <Sparkles size={13} />
            Automated ERP Schedule Alerts
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            Notifications & Upcoming Schedule
          </h1>
          <p className="mt-1 text-xs text-[#738da8] sm:text-sm">
            Live reminders automatically synchronized with your Bookings and Deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {stats.unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-[#d2e3f5] bg-white px-4 py-2.5 text-xs font-bold text-[#23538c] shadow-sm transition hover:bg-[#edf5ff]"
            >
              <CheckCheck size={16} />
              Mark All as Read
            </button>
          )}

          <button
            type="button"
            onClick={syncList}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d2e3f5] bg-white px-3.5 py-2.5 text-xs font-bold text-[#45688f] shadow-sm transition hover:bg-[#edf5ff]"
            title="Refresh schedule"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* OVERDUE BANNER ALERT */}
      {stats.overdueCount > 0 && (
        <div className="sn-fade-up mb-6 flex items-start gap-3 rounded-[22px] border border-[#f5dba8] bg-gradient-to-r from-[#fffaf0] to-[#fff2db] p-4 sm:p-5">
          <div className="shrink-0 rounded-2xl bg-[#ffebc6] p-3 text-[#b77922]">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[#9b651b]">
              {stats.overdueCount} Overdue Reminder{stats.overdueCount !== 1 ? "s" : ""}
            </h3>
            <p className="mt-0.5 text-xs text-[#ad844a]">
              Some shoot bookings or album/video deliveries have passed their scheduled dates and are awaiting completion or update.
            </p>
          </div>
        </div>
      )}

      {/* CONTROLS: TABS & SEARCH */}
      <div className="sn-fade-up mb-6 flex flex-col gap-3 rounded-[22px] border border-[#dce8f7] bg-white p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* TABS */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterTabs.map((tab) => {
            const active = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition-all ${
                  active
                    ? "bg-[#10264d] text-white shadow-sm"
                    : "bg-[#f1f6fc] text-[#557193] hover:bg-[#e4effc]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    active ? "bg-white/20 text-white" : "bg-white text-[#406286]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH */}
        <div className="relative min-w-[220px] sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7f99b5]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, event, staff..."
            className="w-full rounded-xl border border-[#dce7f5] bg-[#f9fcff] py-2.5 pl-9 pr-3 text-xs text-[#10264d] outline-none transition focus:border-[#7ca7dc] focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="sn-fade-up space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#dce8f7] bg-white px-4 py-16 text-center shadow-sm">
            <div className="mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#2b5d99]">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-black text-[#10264d]">
              No upcoming bookings or delivery reminders.
            </h3>
            <p className="mt-1 text-xs text-[#7e96b0]">
              {search || activeFilter !== "All"
                ? "No schedule records match your selected filter or search."
                : "All bookings and deliveries are currently up to date."}
            </p>
            {(search || activeFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All");
                }}
                className="mt-4 rounded-xl border border-[#d2e3f5] bg-[#f5f9ff] px-4 py-2 text-xs font-bold text-[#27538a] hover:bg-[#eaf3fe]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((item) => {
            const isBooking = item.module === "bookings";
            const urgencyBadges = {
              overdue: "border-rose-200 bg-rose-50 text-rose-700",
              today: "border-amber-200 bg-amber-50 text-amber-800",
              upcoming: "border-blue-200 bg-blue-50 text-blue-700",
              completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
            };

            return (
              <article
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenRecord(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenRecord(item);
                  }
                }}
                className={`sn-card-hover relative flex flex-col justify-between gap-4 rounded-[22px] border bg-white p-4.5 sm:flex-row sm:items-center sm:p-5 ${
                  !item.isRead
                    ? "border-[#b9d5f5] bg-gradient-to-r from-[#fbfdff] to-[#f4f9ff] shadow-sm"
                    : "border-[#e2edf8] bg-white opacity-90"
                }`}
              >
                {/* LEFT CONTENT */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${
                      isBooking
                        ? "bg-[#e2efff] text-[#215391]"
                        : item.urgency === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isBooking ? (
                      <CalendarDays size={20} />
                    ) : item.urgency === "completed" ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <Truck size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6484a8]">
                        {isBooking ? "Booking" : "Delivery"}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          urgencyBadges[item.urgency] || urgencyBadges.upcoming
                        }`}
                      >
                        {item.urgencyLabel}
                      </span>
                      {!item.isRead && (
                        <span className="flex items-center gap-1 rounded-full bg-[#244d8b] px-2 py-0.5 text-[9px] font-bold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          Unread
                        </span>
                      )}
                    </div>

                    <h3 className="mt-1 text-sm font-black text-[#10264d] sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#526e8e]">
                      {item.message}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-[#7189a5]">
                      <span className="font-semibold text-[#10264d]">
                        Date: {item.dateFormatted} {item.timeFormatted ? `at ${item.timeFormatted}` : ""}
                      </span>
                      {item.staff && (
                        <span>
                          Assigned: <strong className="text-[#2b5993]">{item.staff}</strong>
                        </span>
                      )}
                      <span>
                        Status: <strong className="text-[#2b5993]">{item.status}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#edf4fb] pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(e, item)}
                    title={item.isRead ? "Mark as unread" : "Mark as read"}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d9e7f6] bg-[#f8fbff] px-3 text-xs font-bold text-[#45688f] transition hover:bg-[#edf5ff]"
                  >
                    {item.isRead ? <RefreshCw size={13} /> : <Check size={14} />}
                    {item.isRead ? "Unread" : "Read"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRecord(item)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#10264d] px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#204980]"
                  >
                    <span>{isBooking ? "Open Booking" : "Open Delivery"}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
