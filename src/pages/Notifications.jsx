
import { useEffect, useMemo, useState } from "react";
import {
  Bell, Plus, Search, X, Pencil, Trash2, Clock,
  CalendarDays, CheckCircle, AlertTriangle, Filter,
  RefreshCw, Eye, BellRing, ClipboardList
} from "lucide-react";

const STORAGE_KEY = "studioraw_notifications";

const DEMO_DATA = [
  {
    id: 101,
    title: "Wedding Album Delivery",
    message: "Deliver the completed wedding album to the customer.",
    type: "Album Delivery",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Arun Kumar",
    dueDate: "2026-10-24",
    createdAt: "2026-10-20",
  },
  {
    id: 102,
    title: "Photography Session Reminder",
    message: "Confirm the pre-wedding outdoor photography session.",
    type: "Appointment",
    channel: "SMS",
    status: "Sent",
    priority: "Medium",
    customer: "Priya",
    dueDate: "2026-10-25",
    createdAt: "2026-10-19",
  },
  {
    id: 103,
    title: "Pending Payment Reminder",
    message: "Contact the customer regarding the remaining payment.",
    type: "Payment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Urgent",
    customer: "Vijay",
    dueDate: "2026-10-21",
    createdAt: "2026-10-18",
  },
  {
    id: 104,
    title: "Photo Selection Required",
    message: "The customer needs to select photos for the final album.",
    type: "Customer Follow-up",
    channel: "Email",
    status: "In Progress",
    priority: "Medium",
    customer: "Divya",
    dueDate: "2026-10-27",
    createdAt: "2026-10-21",
  },
  {
    id: 105,
    title: "Studio Equipment Check",
    message: "Check cameras, batteries, lighting and memory cards.",
    type: "Internal",
    channel: "In-App",
    status: "Completed",
    priority: "Low",
    customer: "Studio Team",
    dueDate: "2026-10-22",
    createdAt: "2026-10-20",
  },
  {
    id: 106,
    title: "Birthday Photoshoot Confirmation",
    message: "Confirm the booking time and decoration requirements.",
    type: "Appointment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Karthik",
    dueDate: "2026-10-23",
    createdAt: "2026-10-21",
  },
];

const TYPES = [
  "Appointment",
  "Payment",
  "Album Delivery",
  "Customer Follow-up",
  "Internal",
  "Other",
];

const CHANNELS = ["WhatsApp", "SMS", "Email", "In-App"];
const STATUSES = ["Pending", "In Progress", "Sent", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const makeId = () => Date.now() + Math.floor(Math.random() * 1000);

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      // Empty storage? Display demo records instead.
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { data: parsed, demo: false };
      }
    }
  } catch (error) {
    console.error("Could not load notifications:", error);
  }

  return { data: DEMO_DATA.map((item) => ({ ...item })), demo: true };
}

function formatDate(value) {
  if (!value) return "No due date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(item) {
  return Boolean(
    item.dueDate &&
    item.dueDate < today() &&
    !["Completed", "Sent"].includes(item.status)
  );
}

const statusClasses = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
  Sent: "bg-violet-50 text-violet-700 ring-violet-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const priorityClasses = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-rose-50 text-rose-700",
};

const blankForm = () => ({
  title: "",
  message: "",
  type: "Appointment",
  channel: "WhatsApp",
  status: "Pending",
  priority: "Medium",
  customer: "",
  dueDate: today(),
});

export default function Notifications() {
  const initial = useMemo(() => loadData(), []);

  const [notifications, setNotifications] = useState(initial.data);
  const [isDemo, setIsDemo] = useState(initial.demo);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [toast, setToast] = useState("");

  // Save actual data. Demo records are not saved until a change is made.
  useEffect(() => {
    if (isDemo) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Could not save notifications:", error);
    }
  }, [notifications, isDemo]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const activateRealData = () => {
    if (!isDemo) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Could not initialize storage:", error);
    }

    setIsDemo(false);
  };

  const stats = useMemo(() => ({
    total: notifications.length,
    pending: notifications.filter((n) => n.status === "Pending").length,
    progress: notifications.filter((n) => n.status === "In Progress").length,
    completed: notifications.filter((n) =>
      ["Sent", "Completed"].includes(n.status)
    ).length,
    overdue: notifications.filter(isOverdue).length,
  }), [notifications]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return notifications.filter((n) => {
      const matchesSearch = !q || [
        n.title, n.message, n.customer, n.type, n.channel,
      ].some((value) => String(value || "").toLowerCase().includes(q));

      return (
        matchesSearch &&
        (statusFilter === "All" || n.status === statusFilter) &&
        (typeFilter === "All" || n.type === typeFilter) &&
        (priorityFilter === "All" || n.priority === priorityFilter)
      );
    });
  }, [notifications, search, statusFilter, typeFilter, priorityFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm());
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      message: item.message || "",
      type: item.type || "Appointment",
      channel: item.channel || "WhatsApp",
      status: item.status || "Pending",
      priority: item.priority || "Medium",
      customer: item.customer || "",
      dueDate: item.dueDate || today(),
    });
    setViewingId(null);
    setModalOpen(true);
  };

  const saveNotification = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      showToast("Please enter the title and message.");
      return;
    }

    activateRealData();

    if (editingId !== null) {
      setNotifications((current) =>
        current.map((n) =>
          n.id === editingId
            ? { ...n, ...form, title: form.title.trim(), message: form.message.trim(), updatedAt: today() }
            : n
        )
      );
      showToast("Notification updated successfully.");
    } else {
      setNotifications((current) => [
        {
          ...form,
          title: form.title.trim(),
          message: form.message.trim(),
          id: makeId(),
          createdAt: today(),
        },
        ...current,
      ]);
      showToast("Notification created successfully.");
    }

    setModalOpen(false);
    setEditingId(null);
    setForm(blankForm());
  };

  const updateStatus = (id, status) => {
    activateRealData();
    setNotifications((current) =>
      current.map((n) => n.id === id ? { ...n, status, updatedAt: today() } : n)
    );
    showToast(`Status updated to ${status}.`);
  };

  const confirmDelete = () => {
    activateRealData();
    setNotifications((current) => current.filter((n) => n.id !== deleteId));
    setDeleteId(null);
    setViewingId(null);
    showToast("Notification deleted.");
  };

  const resetDemo = () => {
    if (!window.confirm("Restore the sample notification data?")) return;

    localStorage.removeItem(STORAGE_KEY);
    setNotifications(DEMO_DATA.map((item) => ({ ...item })));
    setIsDemo(true);
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPriorityFilter("All");
    setDeleteId(null);
    setViewingId(null);
    setModalOpen(false);
    showToast("Demo notifications restored.");
  };

  const currentView = notifications.find((n) => n.id === viewingId);

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  const statCards = [
    { title: "Total Notifications", value: stats.total, icon: Bell, color: "bg-blue-50 text-blue-600", note: "All reminders" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "bg-amber-50 text-amber-600", note: "Awaiting action" },
    { title: "In Progress", value: stats.progress, icon: RefreshCw, color: "bg-violet-50 text-violet-600", note: "Being handled" },
    { title: "Completed / Sent", value: stats.completed, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600", note: "Finished reminders" },
  ];

  const NotificationActions = ({ item }) => (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => setViewingId(item.id)} title="View"
        className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600">
        <Eye size={17} />
      </button>
      <button type="button" onClick={() => openEdit(item)} title="Edit"
        className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-600">
        <Pencil size={17} />
      </button>
      <button type="button" onClick={() => setDeleteId(item.id)} title="Delete"
        className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
        <Trash2 size={17} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
              <BellRing size={17} /> Studio Management
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Manage customer reminders, bookings and studio follow-ups.
            </p>
            {isDemo && (
              <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                Demo Data · Sample records
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetDemo}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100">
              <RefreshCw size={17} /> Reset Demo
            </button>
            <button type="button" onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              <Plus size={19} /> Create Notification
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    <p className="mt-3 text-3xl font-extrabold text-slate-900">{card.value}</p>
                    <p className="mt-2 text-xs text-slate-400">{card.note}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.color}`}><Icon size={23} /></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overdue reminder */}
        {stats.overdue > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
              <AlertTriangle size={21} />
            </div>
            <div>
              <p className="font-bold text-rose-800">
                {stats.overdue} overdue reminder{stats.overdue > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-sm text-rose-700">
                Review overdue reminders and update their status.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Search & Filters</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..." className={`${inputClass} pl-10`} />
            </div>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={inputClass}>
              <option value="All">All Types</option>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={inputClass}>
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* List header */}
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Notification List</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {filtered.length} of {notifications.length} notifications
            </p>
          </div>
          {(search || statusFilter !== "All" || typeFilter !== "All" || priorityFilter !== "All") && (
            <button type="button" onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setTypeFilter("All");
              setPriorityFilter("All");
            }} className="self-start text-sm font-semibold text-blue-600 hover:text-blue-800">
              Clear filters
            </button>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Notification</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Type / Channel</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Due Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/80">
                    <td className="max-w-[280px] px-5 py-4">
                      <button type="button" onClick={() => setViewingId(item.id)} className="text-left">
                        <p className="font-bold text-slate-900 hover:text-blue-600">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                      </button>
                      {isOverdue(item) && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                          <AlertTriangle size={12} /> Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-700">{item.customer || "—"}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-700">{item.type}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.channel}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityClasses[item.priority] || priorityClasses.Medium}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className={`flex items-center gap-1.5 text-sm ${isOverdue(item) ? "font-bold text-rose-600" : "text-slate-600"}`}>
                        <CalendarDays size={14} /> {formatDate(item.dueDate)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}
                        className={`rounded-full px-3 py-2 text-xs font-bold ring-1 outline-none ${statusClasses[item.status] || statusClasses.Pending}`}>
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4"><NotificationActions item={item} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <EmptyState />}
        </div>

        {/* Mobile / tablet cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">{item.message}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${priorityClasses[item.priority] || priorityClasses.Medium}`}>
                  {item.priority}
                </span>
              </div>

              {isOverdue(item) && <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-600"><AlertTriangle size={14} /> Overdue reminder</p>}

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
                <div><p className="text-xs text-slate-400">Customer</p><p className="mt-1 truncate text-sm font-semibold text-slate-700">{item.customer || "—"}</p></div>
                <div><p className="text-xs text-slate-400">Type</p><p className="mt-1 text-sm font-semibold text-slate-700">{item.type}</p></div>
                <div><p className="text-xs text-slate-400">Channel</p><p className="mt-1 text-sm font-semibold text-slate-700">{item.channel}</p></div>
                <div><p className="text-xs text-slate-400">Due Date</p><p className={`mt-1 text-sm font-semibold ${isOverdue(item) ? "text-rose-600" : "text-slate-700"}`}>{formatDate(item.dueDate)}</p></div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <select value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)}
                  className={`max-w-full rounded-full px-3 py-2 text-xs font-bold ring-1 outline-none ${statusClasses[item.status] || statusClasses.Pending}`}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <NotificationActions item={item} />
              </div>
            </article>
          ))}
          {filtered.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{editingId !== null ? "Edit Notification" : "Create Notification"}</h2>
                <p className="mt-1 text-sm text-slate-500">Enter reminder details below.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X size={21} /></button>
            </div>

            <form onSubmit={saveNotification} className="space-y-5 p-5 sm:p-7">
              <div>
                <label className={labelClass}>Notification Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter notification title" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Message *</label>
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write the reminder message..." className={`${inputClass} resize-y`} />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Customer / Recipient</label>
                  <input value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} placeholder="Customer name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Notification Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Channel</label>
                  <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} className={inputClass}>
                    {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                    {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  <CheckCircle size={17} /> {editingId !== null ? "Save Changes" : "Create Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View modal */}
      {currentView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setViewingId(null); }}>
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Bell size={23} /></div>
                <div>
                  <h2 className="font-extrabold text-slate-900">Notification Details</h2>
                  <p className="text-xs text-slate-500">Full reminder details</p>
                </div>
              </div>
              <button type="button" onClick={() => setViewingId(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{currentView.title}</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{currentView.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Customer", currentView.customer || "—"],
                  ["Type", currentView.type],
                  ["Channel", currentView.channel],
                  ["Due Date", formatDate(currentView.dueDate)],
                  ["Priority", currentView.priority],
                  ["Created", formatDate(currentView.createdAt)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className={labelClass}>Status</label>
                <select value={currentView.status} onChange={(e) => updateStatus(currentView.id, e.target.value)} className={inputClass}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => openEdit(currentView)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  <Pencil size={16} /> Edit
                </button>
                <button type="button" onClick={() => setDeleteId(currentView.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600"><Trash2 size={25} /></div>
            <h3 className="mt-4 text-center text-lg font-extrabold text-slate-900">Delete Notification?</h3>
            <p className="mt-2 text-center text-sm leading-6 text-slate-500">This notification will be removed from the saved list.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={confirmDelete} className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <CheckCircle size={18} className="shrink-0 text-emerald-400" />
          {toast}
          <button type="button" onClick={() => setToast("")} className="ml-1 rounded p-1 hover:bg-white/10"><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <Bell size={35} className="mx-auto text-slate-300" />
      <p className="mt-3 font-bold text-slate-700">No notifications found</p>
      <p className="mt-1 text-sm text-slate-500">Try another search or create a new notification.</p>
    </div>
  );
}
