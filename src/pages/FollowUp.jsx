
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  HeartHandshake,
  Phone,
  MessageCircle,
  Mail,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  Star,
  UserRound,
  ChevronDown,
  Check,
} from "lucide-react";

const KEY = "studioraw_followups";

const createEmptyForm = () => ({
  customer: "",
  phone: "",
  email: "",
  event: "Wedding",
  type: "General Follow-up",
  method: "Phone Call",
  followupDate: "",
  priority: "Normal",
  assignedTo: "",
  status: "Pending",
  feedback: "",
  rating: "",
  notes: "",
});

const eventOptions = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Portrait",
  "Corporate",
  "Other",
];

const typeOptions = [
  "General Follow-up",
  "Booking Confirmation",
  "Payment Reminder",
  "Photo Selection Reminder",
  "Album Approval Reminder",
  "Delivery Follow-up",
  "Customer Feedback",
  "Google Review Request",
  "Repeat Booking",
];

const methodOptions = [
  "Phone Call",
  "WhatsApp",
  "Email",
  "SMS",
  "In Person",
];

const priorityOptions = [
  "Low",
  "Normal",
  "High",
  "Urgent",
];

const statusOptions = [
  "Pending",
  "In Progress",
  "Completed",
  "Cancelled",
];

const ratingOptions = [
  { label: "Not Rated", value: "" },
  { label: "1 Star", value: "1" },
  { label: "2 Stars", value: "2" },
  { label: "3 Stars", value: "3" },
  { label: "4 Stars", value: "4" },
  { label: "5 Stars", value: "5" },
];

const statusColors = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const priorityColors = {
  Low: "bg-slate-100 text-slate-600",
  Normal: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const dateKey = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatDate = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

function readRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `FOLLOW-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const normalizedOptions = options.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : option
  );

  const selected = normalizedOptions.find(
    (option) => String(option.value) === String(value)
  );

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

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className={`${inputClass} flex items-center justify-between gap-3 text-left font-medium`}
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label ?? "Select"}
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
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          {normalizedOptions.map((option) => {
            const isSelected =
              String(option.value) === String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 break-words">
                  {option.label}
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

function FormField({ label, children, required = false }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon
            size={15}
            className="mt-0.5 shrink-0 text-blue-600"
          />
        )}

        <p className="min-w-0 whitespace-pre-wrap break-words text-sm font-semibold text-[#10264d]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        statusColors[status] || statusColors.Pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Pending"}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
        priorityColors[priority] || priorityColors.Normal
      }`}
    >
      {priority || "Normal"} Priority
    </span>
  );
}

function RatingStars({ rating }) {
  if (!(Number(rating) > 0)) return null;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          className={
            index < Number(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }
        />
      ))}

      <span className="ml-1 text-xs font-semibold text-slate-600">
        {rating}/5
      </span>
    </div>
  );
}

export default function FollowUp() {
  const [records, setRecords] = useState(readRecords);
  const [form, setForm] = useState(createEmptyForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError("");
  };

  const openCreate = () => {
    setForm({
      ...createEmptyForm(),
      followupDate: dateKey(),
    });

    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      ...createEmptyForm(),
      ...item,
    });

    setEditingId(item.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
    setError("");
  };

  const saveRecord = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!form.followupDate) {
      setError("Please select follow-up date.");
      return;
    }

    const phone = String(form.phone || "").replace(/\D/g, "");

    if (
      phone &&
      phone.length !== 10 &&
      !(phone.length === 12 && phone.startsWith("91"))
    ) {
      setError("Enter a valid phone number.");
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      phone,
      id: editingId || createId(),
    };

    if (editingId) {
      setRecords((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setRecords((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteRecord = (id) => {
    if (!window.confirm("Delete this follow-up record?")) {
      return;
    }

    setRecords((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      closeForm();
    }
  };

  const markComplete = (id) => {
    setRecords((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: "Completed" }
          : item
      )
    );
  };

  const openWhatsApp = (item) => {
    const phone = String(item.phone || "").replace(/\D/g, "");

    if (
      phone.length !== 10 &&
      !(phone.length === 12 && phone.startsWith("91"))
    ) {
      window.alert("Please add a valid phone number.");
      return;
    }

    const number = phone.length === 10 ? `91${phone}` : phone;

    const message = encodeURIComponent(
      `Hello ${item.customer}, greetings from Studio Raw Picturez! We are following up regarding your ${item.event} photography service. Please let us know if you need any assistance. Thank you!`
    );

    window.open(
      `https://wa.me/${number}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return records.filter((item) => {
      const matches = [
        item.customer,
        item.phone,
        item.email,
        item.event,
        item.type,
        item.assignedTo,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matches && (
        filter === "All" || item.status === filter
      );
    });
  }, [records, search, filter]);

  const today = dateKey();

  const stats = [
    {
      title: "Total Follow-ups",
      value: records.length,
      icon: HeartHandshake,
      color: "text-blue-700",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
    },
    {
      title: "Pending",
      value: records.filter(
        (item) => item.status === "Pending"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "bg-amber-500",
    },
    {
      title: "Due Today",
      value: records.filter(
        (item) =>
          item.followupDate === today &&
          item.status !== "Completed" &&
          item.status !== "Cancelled"
      ).length,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      accent: "bg-rose-500",
    },
    {
      title: "Completed",
      value: records.filter(
        (item) => item.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "bg-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Customer Relations
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Follow-up & CRM
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage customer communication, reminders and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Follow-up
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className={`mt-3 text-3xl font-extrabold ${stat.color}`}>
                    {stat.value}
                  </h2>
                </div>

                <div className={`shrink-0 rounded-2xl p-3 ${stat.bg}`}>
                  <Icon size={23} className={stat.color} />
                </div>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Customer follow-up overview
              </p>
            </div>
          );
        })}
      </div>

      {/* RECORDS SECTION */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Customer Follow-ups
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filtered.length} of {records.length} records
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search follow-ups..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-48">
                <CustomDropdown
                  value={filter}
                  options={["All", ...statusOptions].map((status) => ({
                    label: status === "All" ? "All Status" : status,
                    value: status,
                  }))}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <HeartHandshake
              size={42}
              className="mb-4 text-slate-300"
            />

            <h3 className="font-bold text-[#10264d]">
              No follow-up records found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add a follow-up or adjust your search filters.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="mt-5 flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              New Follow-up
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="bg-[#f8faff]">
                  <tr className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Follow-up Type</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Assigned To</th>
                    <th className="px-5 py-4">Rating</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const overdue =
                      item.followupDate &&
                      item.followupDate < today &&
                      item.status !== "Completed" &&
                      item.status !== "Cancelled";

                    const dueToday =
                      item.followupDate === today &&
                      item.status !== "Completed" &&
                      item.status !== "Cancelled";

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-blue-50/30"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                              <UserRound size={19} />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-[#10264d]">
                                {item.customer}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {item.event}
                              </p>

                              {item.phone && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {item.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-slate-700">
                            {item.type}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.method}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm text-slate-600">
                            {formatDate(item.followupDate)}
                          </p>

                          {overdue && (
                            <span className="mt-1 inline-block text-xs font-semibold text-red-600">
                              Overdue
                            </span>
                          )}

                          {dueToday && (
                            <span className="mt-1 inline-block text-xs font-semibold text-amber-600">
                              Due Today
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <PriorityBadge priority={item.priority} />
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {item.assignedTo || "Unassigned"}
                        </td>

                        <td className="px-5 py-5">
                          <RatingStars rating={item.rating} />
                          {!Number(item.rating) && (
                            <span className="text-xs text-slate-400">
                              Not rated
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Manage Follow-up"
                              onClick={() => openEdit(item)}
                              className="rounded-lg bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
                            >
                              <Pencil size={16} />
                            </button>

                            {item.status !== "Completed" && (
                              <button
                                type="button"
                                title="Mark Completed"
                                onClick={() => markComplete(item.id)}
                                className="rounded-lg bg-green-50 p-2.5 text-green-700 hover:bg-green-100"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}

                            {item.phone && (
                              <button
                                type="button"
                                title="Open WhatsApp"
                                onClick={() => openWhatsApp(item)}
                                className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700 hover:bg-emerald-100"
                              >
                                <MessageCircle size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Delete Follow-up"
                              onClick={() => deleteRecord(item.id)}
                              className="rounded-lg bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filtered.map((item) => {
                const overdue =
                  item.followupDate &&
                  item.followupDate < today &&
                  item.status !== "Completed" &&
                  item.status !== "Cancelled";

                const dueToday =
                  item.followupDate === today &&
                  item.status !== "Completed" &&
                  item.status !== "Cancelled";

                return (
                  <article
                    key={item.id}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start gap-3 border-b border-slate-200 pb-4">
                      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                        <UserRound size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-bold text-[#10264d]">
                          {item.customer}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.event}
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />

                      {overdue && (
                        <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                          Overdue
                        </span>
                      )}

                      {dueToday && (
                        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                          Due Today
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Detail
                        label="Follow-up Type"
                        value={item.type}
                        icon={HeartHandshake}
                      />

                      <Detail
                        label="Phone Number"
                        value={item.phone || "No phone"}
                        icon={Phone}
                      />

                      {item.email && (
                        <Detail
                          label="Email Address"
                          value={item.email}
                          icon={Mail}
                        />
                      )}

                      <Detail
                        label="Follow-up Date"
                        value={formatDate(item.followupDate)}
                        icon={CalendarDays}
                      />

                      <Detail
                        label="Assigned Staff"
                        value={item.assignedTo || "Not assigned"}
                        icon={UserRound}
                      />

                      <Detail
                        label="Contact Method"
                        value={item.method}
                        icon={MessageCircle}
                      />

                      {item.feedback && (
                        <div className="rounded-xl bg-white p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Customer Feedback
                          </p>

                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                            {item.feedback}
                          </p>
                        </div>
                      )}

                      {Number(item.rating) > 0 && (
                        <div className="rounded-xl bg-white p-4">
                          <p className="mb-3 text-xs font-semibold text-slate-500">
                            Customer Rating
                          </p>

                          <RatingStars rating={item.rating} />
                        </div>
                      )}

                      {item.notes && (
                        <Detail
                          label="Follow-up Notes"
                          value={item.notes}
                        />
                      )}
                    </div>

                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white"
                      >
                        <Pencil size={16} />
                        Manage Follow-up
                      </button>

                      {item.status !== "Completed" && (
                        <button
                          type="button"
                          onClick={() => markComplete(item.id)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700"
                        >
                          <CheckCircle2 size={16} />
                          Mark Completed
                        </button>
                      )}

                      {item.phone && (
                        <button
                          type="button"
                          onClick={() => openWhatsApp(item)}
                          className="flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700"
                        >
                          <MessageCircle size={16} />
                          Open WhatsApp
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteRecord(item.id)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete Follow-up
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* CENTER MODAL */}
      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">

            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-sm"
              onClick={closeForm}
            />

            {/* MODAL CONTAINER */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={
                editingId ? "Manage Follow-up" : "New Follow-up"
              }
              className="relative z-10 mx-auto flex max-h-[92dvh] w-full max-w-[780px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#f8faff] shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl"
            >
              {/* MODAL HEADER */}
              <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
                      Studio Raw / Customer Relations
                    </p>

                    <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
                      {editingId
                        ? "Manage Follow-up"
                        : "New Follow-up"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Enter customer relationship details.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    aria-label="Close form"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={saveRecord}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* SCROLLABLE CONTENT */}
                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">

                  {/* CUSTOMER INFORMATION */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <UserRound
                        size={18}
                        className="text-blue-600"
                      />
                      Customer Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField
                        label="Customer Name"
                        required
                      >
                        <input
                          type="text"
                          required
                          value={form.customer}
                          onChange={(event) =>
                            update("customer", event.target.value)
                          }
                          placeholder="Enter customer name"
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Phone Number">
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={12}
                          value={form.phone}
                          onChange={(event) =>
                            update(
                              "phone",
                              event.target.value.replace(/\D/g, "")
                            )
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
                            update("email", event.target.value)
                          }
                          placeholder="Enter email address"
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Event Type">
                        <CustomDropdown
                          value={form.event}
                          options={eventOptions}
                          onChange={(value) =>
                            update("event", value)
                          }
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* FOLLOW-UP INFORMATION */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <HeartHandshake
                        size={18}
                        className="text-blue-600"
                      />
                      Follow-up Details
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <FormField label="Follow-up Type">
                        <CustomDropdown
                          value={form.type}
                          options={typeOptions}
                          onChange={(value) =>
                            update("type", value)
                          }
                        />
                      </FormField>

                      <FormField label="Contact Method">
                        <CustomDropdown
                          value={form.method}
                          options={methodOptions}
                          onChange={(value) =>
                            update("method", value)
                          }
                        />
                      </FormField>

                      <FormField
                        label="Follow-up Date"
                        required
                      >
                        <input
                          type="date"
                          required
                          value={form.followupDate}
                          onChange={(event) =>
                            update(
                              "followupDate",
                              event.target.value
                            )
                          }
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Assigned Staff">
                        <input
                          type="text"
                          value={form.assignedTo}
                          onChange={(event) =>
                            update(
                              "assignedTo",
                              event.target.value
                            )
                          }
                          placeholder="Enter staff name"
                          className={inputClass}
                        />
                      </FormField>

                      <FormField label="Priority">
                        <CustomDropdown
                          value={form.priority}
                          options={priorityOptions}
                          onChange={(value) =>
                            update("priority", value)
                          }
                        />
                      </FormField>

                      <FormField label="Follow-up Status">
                        <CustomDropdown
                          value={form.status}
                          options={statusOptions}
                          onChange={(value) =>
                            update("status", value)
                          }
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* FEEDBACK */}
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                      <Star
                        size={18}
                        className="text-blue-600"
                      />
                      Feedback & Notes
                    </h3>

                    <div className="space-y-5">
                      <FormField label="Customer Rating">
                        <CustomDropdown
                          value={form.rating}
                          options={ratingOptions}
                          onChange={(value) =>
                            update("rating", value)
                          }
                        />
                      </FormField>

                      <FormField label="Customer Feedback">
                        <textarea
                          rows={3}
                          value={form.feedback}
                          onChange={(event) =>
                            update(
                              "feedback",
                              event.target.value
                            )
                          }
                          placeholder="Enter customer feedback..."
                          className={`${inputClass} resize-y`}
                        />
                      </FormField>

                      <FormField label="Follow-up Notes">
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(event) =>
                            update("notes", event.target.value)
                          }
                          placeholder="Additional notes..."
                          className={`${inputClass} resize-y`}
                        />
                      </FormField>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                    >
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />
                      {error}
                    </div>
                  )}
                </div>

                {/* FIXED FOOTER */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-semibold text-white hover:bg-blue-900"
                    >
                      <Save size={17} />
                      {editingId
                        ? "Update Follow-up"
                        : "Save Follow-up"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
