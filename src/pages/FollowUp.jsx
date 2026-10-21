
import { useEffect, useMemo, useRef, useState } from "react";
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function CustomDropdown({
  value,
  options,
  onChange,
}) {
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
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      handleOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

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

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {selected?.label || value || "Select"}
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
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  isSelected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option.label}
                </span>

                {isSelected && (
                  <Check
                    size={16}
                    className="shrink-0"
                  />
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
      <p className="mb-2 text-sm font-medium text-slate-700">
        {label}
      </p>

      {children}
    </div>
  );
}

function Detail({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon
            size={16}
            className="mt-0.5 shrink-0 text-blue-600"
          />
        )}

        <p className="min-w-0 break-words text-sm font-semibold text-[#10264d]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function FollowUp() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(KEY)
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(
    createEmptyForm
  );

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(records)
    );
  }, [records]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openCreate = () => {
    setForm({
      ...createEmptyForm(),
      followupDate: dateKey(),
    });

    setEditingId(null);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (item) => {
    setForm({
      ...createEmptyForm(),
      ...item,
    });

    setEditingId(item.id);
    setError("");
    setShowForm(true);
    scrollToForm();
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

    const phone = String(form.phone || "")
      .replace(/\D/g, "");

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
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `FOLLOW-${Date.now()}`,
    };

    if (editingId) {
      setRecords((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setRecords((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteRecord = (id) => {
    if (
      !window.confirm(
        "Delete this follow-up record?"
      )
    ) {
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
    const phone = String(item.phone || "")
      .replace(/\D/g, "");

    if (
      phone.length !== 10 &&
      !(phone.length === 12 && phone.startsWith("91"))
    ) {
      window.alert(
        "Please add a valid phone number."
      );
      return;
    }

    const number =
      phone.length === 10
        ? `91${phone}`
        : phone;

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
    const query = search
      .toLowerCase()
      .trim();

    return records.filter((item) => {
      const matches = [
        item.customer,
        item.phone,
        item.email,
        item.event,
        item.type,
        item.assignedTo,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matches &&
        (filter === "All" ||
          item.status === filter)
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
    },
    {
      title: "Pending",
      value: records.filter(
        (item) => item.status === "Pending"
      ).length,
      icon: Clock3,
      color: "text-amber-600",
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
      color: "text-red-600",
    },
    {
      title: "Completed",
      value: records.filter(
        (item) => item.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Follow-up & CRM
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage customer communication, reminders and feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Follow-up
        </button>
      </div>

      {/* Statistics */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
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

      {/* Follow-up Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Customer Follow-ups
        </h2>

        {/* Search */}
        <div className="relative mb-4 w-full min-w-0">
          <Search
            size={17}
            className="absolute left-3 top-3.5 text-slate-400"
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

        {/* Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...statusOptions]}
            onChange={setFilter}
          />
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <HeartHandshake
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No follow-up records found
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
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
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  {/* Customer */}
                  <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.event}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2">
                      <span
                        className={`max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                          statusColors[item.status] ||
                          statusColors.Pending
                        }`}
                      >
                        {item.status || "Pending"}
                      </span>

                      <span
                        className={`max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                          priorityColors[item.priority] ||
                          priorityColors.Normal
                        }`}
                      >
                        {item.priority || "Normal"} Priority
                      </span>

                      {overdue && (
                        <span className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">
                          Overdue
                        </span>
                      )}

                      {dueToday && (
                        <span className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                          Due Today
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details */}
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
                    value={
                      item.assignedTo ||
                      "Not assigned"
                    }
                    icon={UserRound}
                  />

                  <Detail
                    label="Contact Method"
                    value={item.method}
                    icon={MessageCircle}
                  />

                  {item.feedback && (
                    <div className="w-full min-w-0 rounded-xl bg-white p-4">
                      <p className="text-xs font-semibold text-slate-500">
                        Customer Feedback
                      </p>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                        {item.feedback}
                      </p>
                    </div>
                  )}

                  {Number(item.rating) > 0 && (
                    <div className="w-full min-w-0 rounded-xl bg-white p-4">
                      <p className="mb-3 text-xs font-semibold text-slate-500">
                        Customer Rating
                      </p>

                      <div className="flex flex-wrap items-center gap-1">
                        {Array.from(
                          { length: 5 },
                          (_, index) => (
                            <Star
                              key={index}
                              size={19}
                              className={
                                index < Number(item.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              }
                            />
                          )
                        )}

                        <span className="ml-2 text-sm font-semibold text-[#10264d]">
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <Detail
                      label="Follow-up Notes"
                      value={item.notes}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      <Pencil size={17} />
                      Manage Follow-up
                    </button>

                    {item.status !== "Completed" && (
                      <button
                        type="button"
                        onClick={() =>
                          markComplete(item.id)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        <CheckCircle2 size={17} />
                        Mark Completed
                      </button>
                    )}

                    {item.phone && (
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsApp(item)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        <MessageCircle size={17} />
                        Open WhatsApp
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        deleteRecord(item.id)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Follow-up
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Add / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
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
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveRecord}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Customer Name">
              <input
                type="text"
                required
                value={form.customer}
                onChange={(event) =>
                  update(
                    "customer",
                    event.target.value
                  )
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
                  update(
                    "email",
                    event.target.value
                  )
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

            <FormField label="Follow-up Date">
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
                rows={4}
                value={form.feedback}
                onChange={(event) =>
                  update(
                    "feedback",
                    event.target.value
                  )
                }
                placeholder="Enter customer feedback..."
                className={inputClass}
              />
            </FormField>

            <FormField label="Follow-up Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Additional notes..."
                className={inputClass}
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 break-words text-sm font-medium text-red-600"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </p>
            )}

            <div className="flex w-full flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                <Save size={17} />
                {editingId
                  ? "Update Follow-up"
                  : "Save Follow-up"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
