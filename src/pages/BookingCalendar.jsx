
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Plus,
  Search,
  X,
  MapPin,
  UserRound,
  Camera,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Clock3,
  CheckCircle2,
  AlertCircle,
  CalendarCheck2,
  Save,
  Phone,
} from "lucide-react";

const STORAGE_KEY = "studioraw_bookings";

const emptyForm = {
  customer: "",
  phone: "",
  event: "Wedding",
  date: "",
  time: "10:00",
  location: "",
  photographer: "",
  package: "",
  status: "Confirmed",
};

const events = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Baby Shoot",
  "Pre-Wedding",
  "Portrait",
  "Corporate",
  "Other",
];

const statuses = [
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
];

const statusStyle = {
  Confirmed: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-100",
};

const dateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const [hours, minutes] = String(value).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return String(value);
  }

  return new Date(
    2000,
    0,
    1,
    hours,
    minutes
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100 lg:h-[46px] lg:rounded-[10px] lg:px-3.5 lg:py-2.5";

/* DROPDOWN */

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  compact = false,
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

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
          compact
            ? "lg:h-[46px] lg:rounded-[10px] lg:px-3.5 lg:py-2.5"
            : ""
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-[90] mt-1 max-h-52 overflow-y-auto rounded-xl border border-[#dce4ef] bg-white p-1 shadow-[0_12px_35px_rgba(16,38,77,0.15)]"
        >
          {options.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && <Check size={16} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* SMALL COMPONENTS */

function Detail({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="break-words text-sm font-semibold text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-700 lg:mb-1.5 lg:text-[12px] lg:font-semibold lg:text-[#344767]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function FormSectionTitle({ icon: Icon, title }) {
  return (
    <div className="col-span-full flex items-center gap-2.5 border-b border-[#edf1f6] pb-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3fc] text-[#17477e]">
        <Icon size={17} />
      </div>
      <h4 className="text-[13px] font-bold text-[#10264d]">
        {title}
      </h4>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        statusStyle[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status || "—"}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:rounded-[18px] lg:border-[#e5ebf3] lg:shadow-[0_4px_18px_rgba(16,38,77,0.04)] lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 lg:text-xs">
          {title}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[#10264d]">
          {value}
        </h2>
      </div>

      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={21} />
      </div>
    </div>
  );
}

/* MAIN */

export default function BookingCalendar() {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  /* MODAL SCROLL LOCK & KEYBOARD */
  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    firstInputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setEditingId(null);
        setError("");
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [showForm]);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const openBooking = (date = "") => {
    previousFocusRef.current = document.activeElement;
    setEditingId(null);
    setForm({ ...emptyForm, date });
    setError("");
    setShowForm(true);
  };

  const editBooking = (booking) => {
    previousFocusRef.current = document.activeElement;
    setEditingId(booking.id);
    setForm({ ...emptyForm, ...booking });
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const saveBooking = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError("Enter customer name and valid 10-digit phone number.");
      return;
    }

    if (!form.date || !form.time) {
      setError("Please select booking date and time.");
      return;
    }

    if (editingId) {
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === editingId
            ? { ...booking, ...form, customer, phone }
            : booking
        )
      );
    } else {
      const booking = {
        ...form,
        id:
          globalThis.crypto?.randomUUID?.() ||
          `BOOK-${Date.now()}`,
        customer,
        phone,
      };

      setBookings((previous) => [booking, ...previous]);
    }

    closeForm();
  };

  const deleteBooking = (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    setBookings((previous) =>
      previous.filter((booking) => booking.id !== id)
    );

    if (editingId === id) closeForm();
  };

  const changeStatus = (id, status) => {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return bookings.filter((booking) => {
      const matchesSearch = [
        booking.customer,
        booking.phone,
        booking.event,
        booking.photographer,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return matchesSearch &&
        (filter === "All" || booking.status === filter);
    });
  }, [bookings, search, filter]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            String(booking.date || "") >= dateKey(new Date()) &&
            booking.status !== "Cancelled"
        )
        .sort(
          (a, b) =>
            String(a.date || "").localeCompare(String(b.date || "")) ||
            String(a.time || "").localeCompare(String(b.time || ""))
        )
        .slice(0, 6),
    [bookings]
  );

  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  );

  const totalDays = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const cells = [
    ...Array(firstDay.getDay()).fill(null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];

  const changeMonth = (offset) => {
    setMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + offset,
          1
        )
    );
  };

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Confirmed",
      value: bookings.filter((b) => b.status === "Confirmed").length,
      icon: CalendarCheck2,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "Pending",
      value: bookings.filter((b) => b.status === "Pending").length,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Completed",
      value: bookings.filter((b) => b.status === "Completed").length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:space-y-7 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">

      {/* PAGE HEADER */}
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af] lg:block">
            Photography Operations
          </p>

          <h1 className="text-xl font-bold text-[#10264d] sm:text-2xl lg:text-[29px] lg:font-extrabold lg:tracking-[-0.035em]">
            Booking & Calendar
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500 lg:text-[#8491a5]">
            Manage photography bookings, schedules and assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 lg:w-auto lg:px-6 lg:shadow-[0_8px_20px_rgba(16,38,77,0.16)] lg:hover:-translate-y-0.5"
        >
          <Plus size={18} />
          New Booking
        </button>
      </div>

      {/* STATS */}
      <div className="flex min-w-0 flex-col gap-4 lg:grid lg:grid-cols-4 lg:gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* CALENDAR + UPCOMING */}
      <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)]">

        {/* CALENDAR */}
        <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5 lg:rounded-[22px] lg:border-[#e5ebf3] lg:p-6 lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-[#10264d] sm:text-lg">
                <CalendarDays size={20} />
                {month.toLocaleString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>

              <p className="mt-1 hidden text-xs text-slate-400 lg:block">
                Select a date to schedule a new booking
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                type="button"
                onClick={() => setMonth(new Date())}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#10264d] sm:flex-none"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 transition hover:bg-slate-100"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid w-full min-w-0 grid-cols-7 gap-1 text-center sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div
                  key={day}
                  className="min-w-0 py-2 text-[9px] font-semibold text-slate-500 sm:text-xs lg:py-3"
                >
                  {day}
                </div>
              )
            )}

            {cells.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} />;
              }

              const date = dateKey(
                new Date(
                  month.getFullYear(),
                  month.getMonth(),
                  day
                )
              );

              const dayBookings = bookings.filter(
                (booking) => booking.date === date
              );

              const isToday = date === dateKey(new Date());

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => openBooking(date)}
                  aria-label={`Add booking for ${date}`}
                  className={`flex min-h-12 min-w-0 flex-col items-center rounded-lg border p-1 text-center transition hover:border-blue-400 hover:bg-blue-50 sm:min-h-20 sm:items-start sm:rounded-xl sm:p-2 sm:text-left lg:min-h-[86px] lg:border-[#edf1f6] ${
                    isToday
                      ? "border-blue-400 bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? "bg-[#102f62] text-white"
                        : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>

                  {dayBookings.length > 0 && (
                    <>
                      <span className="mt-1 rounded-full bg-blue-600 px-1.5 text-[9px] font-bold text-white sm:hidden">
                        {dayBookings.length}
                      </span>

                      <div className="hidden w-full min-w-0 sm:block">
                        {dayBookings.slice(0, 2).map((booking) => (
                          <div
                            key={booking.id}
                            className="mt-1 w-full truncate rounded bg-[#eaf1fc] px-1 py-1 text-[10px] font-medium text-[#315f9a]"
                          >
                            {booking.customer}
                          </div>
                        ))}

                        {dayBookings.length > 2 && (
                          <span className="text-[10px] text-slate-500">
                            +{dayBookings.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* UPCOMING SHOOTS */}
        <section className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 lg:rounded-[22px] lg:border-[#e5ebf3] lg:p-6 lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Upcoming Shoots
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Your next scheduled photography events
              </p>
            </div>

            <span className="rounded-lg bg-[#edf3fc] px-2.5 py-1 text-xs font-bold text-[#315f9a]">
              {upcoming.length}
            </span>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays size={30} className="text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                No upcoming shoots
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-xl border border-[#e9eef6] bg-[#f9fbfe] p-4 transition hover:border-[#cbd9ee] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#10264d]">
                        {booking.customer}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.event}
                      </p>
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {formatDate(booking.date)}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {formatTime(booking.time)}
                    </span>
                  </div>

                  {booking.location && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin size={13} className="mt-0.5 shrink-0" />
                      {booking.location}
                    </p>
                  )}

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Camera size={13} />
                    {booking.photographer || "Not assigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ALL BOOKINGS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm lg:rounded-[22px] lg:border-[#e5ebf3] lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)]">

        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-5">
          <div>
            <h2 className="text-lg font-bold text-[#10264d]">
              All Bookings
            </h2>

            <p className="mt-1 hidden text-xs text-slate-400 lg:block">
              {filtered.length} bookings found
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-[280px] xl:w-[330px]">
              <Search
                size={17}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bookings..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="w-full lg:w-[170px]">
              <p className="mb-2 text-xs font-medium text-slate-500 lg:hidden">
                Filter by Status
              </p>

              <CustomDropdown
                value={filter}
                options={["All", ...statuses]}
                onChange={setFilter}
                compact
              />
            </div>
          </div>
        </div>

        {/* MOBILE CARDS */}
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:hidden">
          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No bookings found
            </p>
          ) : (
            filtered.map((booking) => (
              <div
                key={booking.id}
                className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-bold text-[#10264d]">
                      {booking.customer}
                    </h3>

                    <p className="mt-1 break-all text-xs text-blue-700">
                      {booking.id}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => editBooking(booking)}
                      className="rounded-xl bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
                      aria-label="Edit booking"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteBooking(booking.id)}
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                      aria-label="Delete booking"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <Detail label="Phone" value={booking.phone} />
                <Detail label="Event" value={booking.event} />
                <Detail label="Date" value={booking.date} />
                <Detail label="Time" value={booking.time} />
                <Detail label="Location" value={booking.location} />
                <Detail
                  label="Photographer"
                  value={booking.photographer || "Not assigned"}
                />
                <Detail label="Package" value={booking.package} />

                <div className="pt-1">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Booking Status
                  </p>

                  <CustomDropdown
                    value={booking.status || "Confirmed"}
                    options={statuses}
                    onChange={(status) =>
                      changeStatus(booking.id, status)
                    }
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden w-full overflow-x-auto lg:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#f7f9fd]">
              <tr className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8290a5]">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Event</th>
                <th className="px-5 py-4">Date & Time</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Photographer</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1f6]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-[#f8faff]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#10264d]">
                            {booking.customer}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {booking.event || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="text-sm font-medium text-[#52627b]">
                        {formatDate(booking.date)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatTime(booking.time)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {booking.location || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {booking.photographer || "Not assigned"}
                    </td>

                    <td className="min-w-[145px] px-5 py-4">
                      <div className="mb-1">
                        <StatusBadge status={booking.status} />
                      </div>

                      <CustomDropdown
                        value={booking.status || "Confirmed"}
                        options={statuses}
                        onChange={(status) =>
                          changeStatus(booking.id, status)
                        }
                        compact
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => editBooking(booking)}
                          aria-label={`Edit booking for ${booking.customer}`}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteBooking(booking.id)}
                          aria-label={`Delete booking for ${booking.customer}`}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="hidden items-center justify-between border-t border-[#edf1f6] px-6 py-4 lg:flex">
          <p className="text-xs text-[#8290a5]">
            Showing {filtered.length} of {bookings.length} bookings
          </p>

          <span className="text-xs text-[#8290a5]">
            Studio Raw Picturez ERP
          </span>
        </div>
      </section>

      {/* NEW / EDIT BOOKING MODAL */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/65 p-3 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeForm();
              }
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-modal-title"
              className="flex max-h-[calc(100dvh-24px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-40px)] lg:max-w-[800px] lg:rounded-[18px]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e9eef5] px-5 py-4 sm:px-7 lg:px-8 lg:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                    {editingId ? (
                      <Pencil size={19} />
                    ) : (
                      <CalendarDays size={21} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="booking-modal-title"
                      className="text-lg font-bold text-[#10264d] lg:text-[19px]"
                    >
                      {editingId
                        ? "Edit Booking"
                        : "Create New Booking"}
                    </h3>

                    <p className="mt-1 text-xs text-[#8491a5]">
                      {editingId
                        ? "Update photography booking details"
                        : "Schedule a new photography event"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close booking popup"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={saveBooking}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 lg:space-y-5 lg:px-8 lg:py-6">

                  {/* CUSTOMER */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5">
                    <FormSectionTitle
                      icon={UserRound}
                      title="Customer Information"
                    />

                    <FormField label="Customer Name" required>
                      <input
                        ref={firstInputRef}
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

                    <FormField label="Phone Number" required>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={form.phone}
                        onChange={(event) =>
                          update(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="Enter 10-digit phone number"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  {/* EVENT */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5">
                    <FormSectionTitle
                      icon={CalendarDays}
                      title="Event & Schedule"
                    />

                    <FormField label="Event Type">
                      <CustomDropdown
                        value={form.event}
                        options={events}
                        onChange={(value) => update("event", value)}
                        compact
                      />
                    </FormField>

                    <FormField label="Booking Date" required>
                      <input
                        type="date"
                        required
                        value={form.date}
                        onChange={(event) =>
                          update("date", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Booking Time" required>
                      <input
                        type="time"
                        required
                        value={form.time}
                        onChange={(event) =>
                          update("time", event.target.value)
                        }
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Location">
                      <input
                        type="text"
                        value={form.location}
                        onChange={(event) =>
                          update("location", event.target.value)
                        }
                        placeholder="Enter shoot location"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  {/* ASSIGNMENT */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5">
                    <FormSectionTitle
                      icon={Camera}
                      title="Photography Assignment"
                    />

                    <FormField label="Photographer">
                      <input
                        type="text"
                        value={form.photographer}
                        onChange={(event) =>
                          update("photographer", event.target.value)
                        }
                        placeholder="Enter photographer name"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Photography Package">
                      <input
                        type="text"
                        value={form.package}
                        onChange={(event) =>
                          update("package", event.target.value)
                        }
                        placeholder="Enter photography package"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Booking Status">
                      <CustomDropdown
                        value={form.status}
                        options={statuses}
                        onChange={(value) => update("status", value)}
                        compact
                      />
                    </FormField>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER */}
                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7 lg:px-8">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="w-full rounded-xl border border-[#dce4ef] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] transition hover:bg-[#eef3f9] sm:w-auto"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b467e] sm:w-auto"
                  >
                    <Save size={17} />
                    {editingId
                      ? "Update Booking"
                      : "Save Booking"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}
