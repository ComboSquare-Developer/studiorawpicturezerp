
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Plus,
  Search,
  X,
  Save,
  Trash2,
  Pencil,
  CheckCheck,
  Clock3,
  CalendarDays,
  Send,
  AlertCircle,
  BellRing,
  ChevronDown,
  Check,
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

const statuses = [
  "Pending",
  "Scheduled",
  "Completed",
  "Cancelled",
];

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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

const primaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950";

const secondaryButton =
  "flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

function readArray() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function localDate() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function localTime() {
  return new Date().toTimeString().slice(0, 5);
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
      document.removeEventListener(
        "pointerdown",
        handleOutside
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const items = options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : option
  );

  const selected = items.find(
    (item) => item.value === value
  );

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-[#10264d] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label || placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="mt-2 max-h-60 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {items.map((item) => {
            const isSelected = item.value === value;

            return (
              <button
                key={item.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {item.label}
                </span>

                {isSelected && (
                  <Check size={16} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="w-full min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="w-full min-w-0 rounded-xl bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
        {value || "-"}
      </p>
    </div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(readArray);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showForm, editingId]);

  const openAdd = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      date: localDate(),
      time: localTime(),
    });

    setShowForm(true);

    if (showForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  const openEdit = (notification) => {
    setEditingId(notification.id);

    setForm({
      ...emptyForm,
      ...notification,
    });

    setShowForm(true);

    if (showForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
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
      alert("Please complete the required fields.");
      return;
    }

    const record = {
      ...form,
      id: editingId || crypto.randomUUID(),
      title: form.title.trim(),
      recipient: form.recipient.trim(),
      message: form.message.trim(),
      createdAt: editingId
        ? notifications.find(
            (item) => item.id === editingId
          )?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setNotifications((previous) =>
        previous.map((item) =>
          item.id === editingId ? record : item
        )
      );
    } else {
      setNotifications((previous) => [
        record,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteNotification = (notification) => {
    if (
      !window.confirm(
        `Delete notification "${notification.title}"?`
      )
    ) {
      return;
    }

    setNotifications((previous) =>
      previous.filter(
        (item) => item.id !== notification.id
      )
    );
  };

  const changeStatus = (id, status) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
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
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query)
        );

        const matchesStatus =
          statusFilter === "All" ||
          item.status === statusFilter;

        const matchesType =
          typeFilter === "All" ||
          item.type === typeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType
        );
      })
      .sort((a, b) =>
        `${a.date}T${a.time}`.localeCompare(
          `${b.date}T${b.time}`
        )
      );
  }, [
    notifications,
    search,
    statusFilter,
    typeFilter,
  ]);

  const total = notifications.length;

  const pending = notifications.filter(
    (item) => item.status === "Pending"
  ).length;

  const scheduled = notifications.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completed = notifications.filter(
    (item) => item.status === "Completed"
  ).length;

  const overdue = notifications.filter(
    (item) =>
      ["Pending", "Scheduled"].includes(item.status) &&
      `${item.date}T${item.time}` <
        `${localDate()}T${localTime()}`
  ).length;

  const stats = [
    {
      label: "Total Notifications",
      value: total,
      icon: Bell,
      color: "text-blue-700",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      color: "text-amber-600",
    },
    {
      label: "Scheduled",
      value: scheduled,
      icon: CalendarDays,
      color: "text-indigo-700",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCheck,
      color: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">
      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
            <BellRing size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-2xl font-bold text-[#10264d]">
              Notifications & Reminders
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage booking, payment, shoot and customer
              reminders
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className={primaryButton}
        >
          <Plus size={18} />
          Create Reminder
        </button>
      </div>

      {/* Stats */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 text-sm font-medium text-slate-500">
                  {stat.label}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Overdue Alert */}
      {overdue > 0 && (
        <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-amber-700"
          />

          <div className="min-w-0">
            <p className="break-words font-semibold text-amber-900">
              {overdue} overdue reminder(s)
            </p>

            <p className="mt-2 break-words text-sm leading-6 text-amber-800">
              Review pending and scheduled reminders
              that have passed their planned date and time.
            </p>
          </div>
        </div>
      )}

      {/* Reminder List */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex w-full min-w-0 flex-col gap-3">
          <h2 className="text-lg font-bold text-[#10264d]">
            All Reminders
          </h2>

          <div className="w-full rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
            {filteredNotifications.length} Records
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex w-full min-w-0 flex-col gap-4">
          <FormField label="Search Reminders">
            <div className="relative w-full min-w-0">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reminders..."
                className={`${inputClass} pl-11`}
              />
            </div>
          </FormField>

          <FormField label="Filter by Status">
            <CustomDropdown
              value={statusFilter}
              options={[
                {
                  value: "All",
                  label: "All Status",
                },
                ...statuses,
              ]}
              onChange={setStatusFilter}
            />
          </FormField>

          <FormField label="Filter by Type">
            <CustomDropdown
              value={typeFilter}
              options={[
                {
                  value: "All",
                  label: "All Types",
                },
                ...notificationTypes,
              ]}
              onChange={setTypeFilter}
            />
          </FormField>
        </div>

        {/* Vertical Reminder Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4">
          {filteredNotifications.map((item) => (
            <article
              key={item.id}
              className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-[#10264d]">
                  <Bell size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-lg font-bold text-[#10264d]">
                    {item.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <DetailField
                  label="Recipient"
                  value={item.recipient}
                />

                <DetailField
                  label="Notification Type"
                  value={item.type}
                />

                <DetailField
                  label="Channel"
                  value={item.channel}
                />

                <DetailField
                  label="Reminder Date"
                  value={item.date}
                />

                <DetailField
                  label="Reminder Time"
                  value={item.time}
                />

                <DetailField
                  label="Priority"
                  value={item.priority || "Normal"}
                />
              </div>

              <div className="w-full min-w-0">
                <p className={labelClass}>
                  Reminder Status
                </p>

                <div className="mb-3">
                  <span
                    className={`inline-flex rounded-lg px-3 py-2 text-xs font-semibold ${
                      statusColors[item.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <CustomDropdown
                  value={item.status}
                  options={statuses}
                  onChange={(value) =>
                    changeStatus(item.id, value)
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className={primaryButton}
                >
                  <Pencil size={17} />
                  Edit Reminder
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeStatus(item.id, "Completed")
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                >
                  <CheckCheck size={17} />
                  Mark Completed
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteNotification(item)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Trash2 size={17} />
                  Delete Reminder
                </button>
              </div>
            </article>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <Bell
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="text-sm text-slate-400">
                No reminders found. Create your first reminder.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inline Create/Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex w-full min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Edit Reminder"
                  : "Create New Reminder"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Configure notification details
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close reminder form"
              className="shrink-0 rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={saveNotification}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Reminder Title">
              <input
                required
                value={form.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                className={inputClass}
                placeholder="e.g. Wedding shoot reminder"
              />
            </FormField>

            <FormField label="Notification Type">
              <CustomDropdown
                value={form.type}
                options={notificationTypes}
                onChange={(value) =>
                  updateField("type", value)
                }
              />
            </FormField>

            <FormField label="Recipient Name">
              <input
                required
                value={form.recipient}
                onChange={(event) =>
                  updateField("recipient", event.target.value)
                }
                className={inputClass}
                placeholder="Customer / Staff name"
              />
            </FormField>

            <FormField label="Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                className={inputClass}
                placeholder="Enter phone number"
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                className={inputClass}
                placeholder="Enter email address"
              />
            </FormField>

            <FormField label="Message">
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                className={`${inputClass} resize-y`}
                placeholder="Enter reminder message..."
              />
            </FormField>

            <FormField label="Notification Channel">
              <CustomDropdown
                value={form.channel}
                options={channels}
                onChange={(value) =>
                  updateField("channel", value)
                }
              />
            </FormField>

            <FormField label="Priority">
              <CustomDropdown
                value={form.priority}
                options={priorities}
                onChange={(value) =>
                  updateField("priority", value)
                }
              />
            </FormField>

            <FormField label="Reminder Date">
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

            <FormField label="Reminder Time">
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

            <FormField label="Status">
              <CustomDropdown
                value={form.status}
                options={statuses}
                onChange={(value) =>
                  updateField("status", value)
                }
              />
            </FormField>

            {/* Demo Notice */}
            <div className="flex w-full min-w-0 items-start gap-3 rounded-xl bg-blue-50 p-4">
              <Send
                size={18}
                className="mt-0.5 shrink-0 text-blue-700"
              />

              <p className="min-w-0 break-words text-xs leading-6 text-blue-900">
                Demo mode: reminders are saved locally.
                Selecting WhatsApp, SMS or Email does not
                automatically send messages. External delivery
                requires an integration and backend scheduler.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex w-full min-w-0 flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={primaryButton}
              >
                <Save size={18} />
                {editingId
                  ? "Update Reminder"
                  : "Save Reminder"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
