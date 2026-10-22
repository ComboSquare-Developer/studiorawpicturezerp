
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  BellRing,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Save,
  CheckCheck,
  Clock3,
  CalendarDays,
  Send,
  AlertCircle,
  ChevronDown,
  Check,
  UserRound,
  Phone,
  Mail,
  MessageSquare,
  Tag,
  ShieldAlert,
} from "lucide-react";

const STORAGE_KEY = "studioraw_notifications";

const notificationTypes = [
  "Booking Confirmation",
  "Payment Reminder",
  "Shoot Reminder",
  "Editing Update",
  "Album Approval",
  "Delivery Reminder",
  "Follow-up Reminder",
  "Staff Notification",
  "General",
];

const channels = ["In-App", "WhatsApp", "SMS", "Email"];
const statuses = ["Pending", "Scheduled", "Completed", "Cancelled"];
const priorities = ["Low", "Normal", "High", "Urgent"];

const emptyForm = {
  title: "",
  type: "General",
  recipient: "",
  phone: "",
  email: "",
  message: "",
  channel: "In-App",
  date: "",
  time: "",
  status: "Pending",
  priority: "Normal",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

const statusColors = {
  Pending: "bg-amber-50 text-amber-700",
  Scheduled: "bg-blue-50 text-blue-700",
  Completed: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-rose-50 text-rose-700",
};

const priorityColors = {
  Low: "bg-slate-100 text-slate-600",
  Normal: "bg-blue-50 text-blue-700",
  High: "bg-orange-50 text-orange-700",
  Urgent: "bg-rose-50 text-rose-700",
};

function readArray() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `NOT-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localTime() {
  return new Date().toTimeString().slice(0, 5);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function formatTime(value) {
  if (!value) return "—";

  const [hours, minutes] = String(value).split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return value;
  }

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString(
    "en-IN",
    { hour: "2-digit", minute: "2-digit" }
  );
}

function isOverdue(item, now = new Date()) {
  if (!["Pending", "Scheduled"].includes(item.status)) return false;
  if (!item.date || !item.time) return false;

  const planned = new Date(`${item.date}T${item.time}`);

  return !Number.isNaN(planned.getTime()) && planned < now;
}

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const items = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  );

  const selected = items.find(
    (item) => String(item.value) === String(value)
  );

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          {items.map((item) => {
            const selectedItem =
              String(item.value) === String(value);

            return (
              <button
                key={String(item.value)}
                type="button"
                role="option"
                aria-selected={selectedItem}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm ${
                  selectedItem
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="break-words">{item.label}</span>
                {selectedItem && <Check size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoBox({ icon: Icon, label, value, full = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl bg-[#f7f9fc] p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 text-slate-400">
        {Icon && <Icon size={14} className="shrink-0" />}
        <span className="truncate text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[13px] font-bold leading-5 text-[#10264d]">
        {value === undefined || value === null || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const current = status || "Pending";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold ${
        statusColors[current] || "bg-slate-100 text-slate-600"
      }`}
    >
      {current}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const current = priority || "Normal";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-bold ${
        priorityColors[current] || priorityColors.Normal
      }`}
    >
      {current} Priority
    </span>
  );
}

function ActionButton({ icon: Icon, label, onClick, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    red: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${colors[color]}`}
    >
      <Icon size={16} />
    </button>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <h3 className={`mt-3 text-3xl font-extrabold ${stat.color}`}>
            {stat.value}
          </h3>
        </div>

        <div className={`shrink-0 rounded-xl p-3 ${stat.bg}`}>
          <Icon size={22} className={stat.color} />
        </div>
      </div>
    </div>
  );
}

function ReminderCard({
  item,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onComplete,
  now,
}) {
  const overdue = isOverdue(item, now);

  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Bell size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-extrabold leading-5 text-[#10264d] sm:text-base">
              {item.title || "Untitled Reminder"}
            </h3>

            <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
              {item.type || "General"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ActionButton
            icon={Eye}
            label="View Reminder"
            onClick={() => onView(item)}
          />

          <ActionButton
            icon={Pencil}
            label="Edit Reminder"
            color="amber"
            onClick={() => onEdit(item)}
          />

          <ActionButton
            icon={Trash2}
            label="Delete Reminder"
            color="red"
            onClick={() => onDelete(item)}
          />
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* BADGES */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={item.status} />
        <PriorityBadge priority={item.priority} />

        {overdue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600">
            <AlertCircle size={12} />
            Overdue
          </span>
        )}
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-2 gap-2.5">
        <InfoBox
          icon={UserRound}
          label="Recipient"
          value={item.recipient}
        />

        <InfoBox
          icon={Send}
          label="Channel"
          value={item.channel}
        />

        <InfoBox
          icon={CalendarDays}
          label="Reminder Date"
          value={formatDate(item.date)}
        />

        <InfoBox
          icon={Clock3}
          label="Reminder Time"
          value={formatTime(item.time)}
        />

        <InfoBox
          icon={Tag}
          label="Notification Type"
          value={item.type}
          full
        />

        <InfoBox
          icon={MessageSquare}
          label="Message"
          value={item.message}
          full
        />
      </div>

      {/* QUICK STATUS */}
      <div className="mt-auto pt-4">
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            Quick Status Update
          </p>

          <CustomDropdown
            value={item.status || "Pending"}
            options={statuses}
            onChange={(value) => onStatusChange(item.id, value)}
          />

          <button
            type="button"
            onClick={() => onComplete(item.id)}
            disabled={item.status === "Completed"}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck size={17} />
            {item.status === "Completed"
              ? "Completed"
              : "Mark Completed"}
          </button>
        </div>
      </div>
    </article>
  );
}

function Modal({ title, subtitle, icon: Icon, onClose, children, width = "max-w-[760px]" }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[94dvh] w-full ${width} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10264d] text-white">
              <Icon size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-xl font-extrabold text-[#10264d]">
                {title}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(readArray);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    const refreshTime = () => setNow(new Date());

    const interval = setInterval(refreshTime, 60000);

    window.addEventListener("focus", refreshTime);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshTime);
    };
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!showForm && !viewItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showForm) {
        closeForm();
      } else {
        setViewItem(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewItem, closeForm]);

  const openAdd = () => {
    setEditingId(null);
    setViewItem(null);
    setError("");

    setForm({
      ...emptyForm,
      date: localDate(),
      time: localTime(),
    });

    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setViewItem(null);
    setError("");

    setForm({
      ...emptyForm,
      ...item,
    });

    setShowForm(true);
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError("");
  };

  const saveNotification = (event) => {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.recipient.trim() ||
      !form.message.trim() ||
      !form.date ||
      !form.time
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const timestamp = new Date().toISOString();

    const record = {
      ...form,
      id: editingId || createId(),
      title: form.title.trim(),
      recipient: form.recipient.trim(),
      message: form.message.trim(),
      createdAt: editingId
        ? notifications.find((item) => item.id === editingId)
            ?.createdAt || timestamp
        : timestamp,
      updatedAt: timestamp,
    };

    if (editingId) {
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );
    } else {
      setNotifications((previous) => [record, ...previous]);
    }

    closeForm();
  };

  const deleteNotification = (item) => {
    if (!window.confirm(`Delete notification "${item.title}"?`)) {
      return;
    }

    setNotifications((previous) =>
      previous.filter((record) => record.id !== item.id)
    );

    if (viewItem?.id === item.id) {
      setViewItem(null);
    }

    if (editingId === item.id) {
      closeForm();
    }
  };

  const changeStatus = (id, status) => {
    const updatedAt = new Date().toISOString();

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status, updatedAt }
          : item
      )
    );

    setViewItem((previous) =>
      previous?.id === id
        ? { ...previous, status, updatedAt }
        : previous
    );
  };

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((item) => {
        const matchesSearch = [
          item.title,
          item.recipient,
          item.message,
          item.type,
          item.phone,
          item.email,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

        const matchesStatus =
          statusFilter === "All" ||
          item.status === statusFilter;

        const matchesType =
          typeFilter === "All" ||
          item.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) =>
        `${a.date || ""}T${a.time || ""}`.localeCompare(
          `${b.date || ""}T${b.time || ""}`
        )
      );
  }, [notifications, search, statusFilter, typeFilter]);

  const pending = notifications.filter(
    (item) => item.status === "Pending"
  ).length;

  const scheduled = notifications.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completed = notifications.filter(
    (item) => item.status === "Completed"
  ).length;

  const overdue = notifications.filter((item) =>
    isOverdue(item, now)
  ).length;

  const stats = [
    {
      label: "Total Notifications",
      value: notifications.length,
      icon: Bell,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Scheduled",
      value: scheduled,
      icon: CalendarDays,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Communication
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Notifications & Reminders
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage booking, payment, shoot and customer reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className={`${primaryButton} w-full shrink-0 sm:w-auto`}
        >
          <Plus size={18} />
          Create Reminder
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* OVERDUE ALERT */}
      {overdue > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert
            size={21}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div>
            <p className="font-bold text-amber-900">
              {overdue} overdue reminder{overdue !== 1 ? "s" : ""}
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-800">
              Review pending and scheduled reminders that have passed
              their planned date and time.
            </p>
          </div>
        </div>
      )}

      {/* REMINDERS */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#10264d]">
                <BellRing size={20} className="text-blue-600" />
                All Reminders
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filteredNotifications.length} of{" "}
                {notifications.length} reminders
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-60">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reminders..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <div className="w-full sm:w-40">
                <CustomDropdown
                  value={statusFilter}
                  options={[
                    { label: "All Status", value: "All" },
                    ...statuses,
                  ]}
                  onChange={setStatusFilter}
                />
              </div>

              <div className="w-full sm:w-48">
                <CustomDropdown
                  value={typeFilter}
                  options={[
                    { label: "All Types", value: "All" },
                    ...notificationTypes,
                  ]}
                  onChange={setTypeFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-20 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <Bell size={36} className="text-slate-300" />
            </div>

            <h3 className="font-bold text-[#10264d]">
              No reminders found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create a reminder or change your filters.
            </p>

            {notifications.length === 0 && (
              <button
                type="button"
                onClick={openAdd}
                className={`${primaryButton} mt-5`}
              >
                <Plus size={16} />
                Create Reminder
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-6">
            {filteredNotifications.map((item) => (
              <ReminderCard
                key={item.id}
                item={item}
                onView={setViewItem}
                onEdit={openEdit}
                onDelete={deleteNotification}
                onStatusChange={changeStatus}
                onComplete={(id) => changeStatus(id, "Completed")}
                now={now}
              />
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-6 text-slate-400">
        Demo mode: reminders are saved in this browser. WhatsApp,
        SMS and Email delivery require external integrations.
      </p>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <Modal
          title={editingId ? "Edit Reminder" : "Create New Reminder"}
          subtitle="Configure notification and reminder details"
          icon={BellRing}
          onClose={closeForm}
        >
          <form
            onSubmit={saveNotification}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Bell size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Reminder Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField label="Reminder Title" required>
                      <input
                        required
                        value={form.title}
                        onChange={(event) =>
                          updateField("title", event.target.value)
                        }
                        placeholder="e.g. Wedding shoot reminder"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  <FormField label="Notification Type">
                    <CustomDropdown
                      value={form.type}
                      options={notificationTypes}
                      onChange={(value) => updateField("type", value)}
                    />
                  </FormField>

                  <FormField label="Notification Channel">
                    <CustomDropdown
                      value={form.channel}
                      options={channels}
                      onChange={(value) => updateField("channel", value)}
                    />
                  </FormField>

                  <FormField label="Priority">
                    <CustomDropdown
                      value={form.priority}
                      options={priorities}
                      onChange={(value) => updateField("priority", value)}
                    />
                  </FormField>

                  <FormField label="Status">
                    <CustomDropdown
                      value={form.status}
                      options={statuses}
                      onChange={(value) => updateField("status", value)}
                    />
                  </FormField>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <UserRound size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Recipient Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FormField label="Recipient Name" required>
                      <input
                        required
                        value={form.recipient}
                        onChange={(event) =>
                          updateField("recipient", event.target.value)
                        }
                        placeholder="Customer / Staff name"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  <FormField label="Phone Number">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="Enter phone number"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Email Address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="Enter email address"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <CalendarDays size={18} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-[#10264d]">
                    Schedule & Message
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="Reminder Date" required>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(event) =>
                        updateField("date", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Reminder Time" required>
                    <input
                      type="time"
                      required
                      value={form.time}
                      onChange={(event) =>
                        updateField("time", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <div className="sm:col-span-2">
                    <FormField label="Reminder Message" required>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={(event) =>
                          updateField("message", event.target.value)
                        }
                        placeholder="Enter reminder message..."
                        className={`${inputClass} resize-y`}
                      />
                    </FormField>
                  </div>
                </div>
              </section>

              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <Send
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-700"
                />

                <p className="text-xs leading-6 text-blue-900">
                  Demo mode: reminders are saved locally. Selecting
                  WhatsApp, SMS or Email does not automatically send
                  messages. External delivery requires integration
                  and a backend scheduler.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className={secondaryButton}
                >
                  Cancel
                </button>

                <button type="submit" className={primaryButton}>
                  <Save size={17} />
                  {editingId ? "Update Reminder" : "Save Reminder"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {viewItem && !showForm && (
        <Modal
          title="Reminder Details"
          subtitle={viewItem.title || "Notification information"}
          icon={Bell}
          width="max-w-[650px]"
          onClose={() => setViewItem(null)}
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
            <h3 className="mb-3 break-words text-lg font-bold text-[#10264d]">
              {viewItem.title || "Untitled Reminder"}
            </h3>

            <div className="mb-5 flex flex-wrap gap-2">
              <StatusBadge status={viewItem.status} />
              <PriorityBadge priority={viewItem.priority} />

              {isOverdue(viewItem, now) && (
                <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">
                  Overdue
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox
                icon={UserRound}
                label="Recipient"
                value={viewItem.recipient}
              />

              <InfoBox
                icon={Tag}
                label="Type"
                value={viewItem.type}
              />

              <InfoBox
                icon={Send}
                label="Channel"
                value={viewItem.channel}
              />

              <InfoBox
                icon={Phone}
                label="Phone"
                value={viewItem.phone}
              />

              <InfoBox
                icon={Mail}
                label="Email"
                value={viewItem.email}
                full
              />

              <InfoBox
                icon={CalendarDays}
                label="Reminder Date"
                value={formatDate(viewItem.date)}
              />

              <InfoBox
                icon={Clock3}
                label="Reminder Time"
                value={formatTime(viewItem.time)}
              />

              <InfoBox
                icon={MessageSquare}
                label="Message"
                value={viewItem.message}
                full
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:justify-end sm:p-5">
            <button
              type="button"
              onClick={() => setViewItem(null)}
              className={secondaryButton}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => openEdit(viewItem)}
              className={primaryButton}
            >
              <Pencil size={16} />
              Edit Reminder
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
