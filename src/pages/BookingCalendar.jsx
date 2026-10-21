
import { useEffect, useMemo, useRef, useState } from "react";
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
  Confirmed: "bg-blue-50 text-blue-700",
  Pending: "bg-amber-50 text-amber-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

const dateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const inputClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="w-full min-w-0 max-w-full"
    >
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value || placeholder}
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
                className={`flex w-full min-w-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
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

function Detail({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-[#10264d]">
        {value || "—"}
      </p>
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

export default function BookingCalendar() {
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [month, setMonth] = useState(
    () => new Date()
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bookings)
    );
  }, [bookings]);

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

  const openBooking = (date = "") => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      date,
    });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const editBooking = (booking) => {
    setEditingId(booking.id);
    setForm({
      ...emptyForm,
      ...booking,
    });
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const saveBooking = (event) => {
    event.preventDefault();

    const customer = String(
      form.customer || ""
    ).trim();

    const phone = String(
      form.phone || ""
    ).trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError(
        "Enter customer name and valid 10-digit phone number."
      );
      return;
    }

    if (!form.date || !form.time) {
      setError(
        "Please select booking date and time."
      );
      return;
    }

    if (editingId) {
      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === editingId
            ? {
                ...booking,
                ...form,
                customer,
                phone,
              }
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

      setBookings((previous) => [
        booking,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteBooking = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this booking?"
      )
    ) {
      setBookings((previous) =>
        previous.filter(
          (booking) => booking.id !== id
        )
      );

      if (editingId === id) {
        closeForm();
      }
    }
  };

  const changeStatus = (id, status) => {
    setBookings((previous) =>
      previous.map((booking) =>
        booking.id === id
          ? { ...booking, status }
          : booking
      )
    );
  };

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const query = search
        .toLowerCase()
        .trim();

      const matchesSearch = [
        booking.customer,
        booking.phone,
        booking.event,
        booking.photographer,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );

      return (
        matchesSearch &&
        (filter === "All" ||
          booking.status === filter)
      );
    });
  }, [bookings, search, filter]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            String(booking.date || "") >=
              dateKey(new Date()) &&
            booking.status !== "Cancelled"
        )
        .sort(
          (a, b) =>
            String(
              a.date || ""
            ).localeCompare(
              String(b.date || "")
            ) ||
            String(
              a.time || ""
            ).localeCompare(
              String(b.time || "")
            )
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
    ...Array.from(
      { length: totalDays },
      (_, index) => index + 1
    ),
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
      color: "text-blue-700",
    },
    {
      title: "Confirmed",
      value: bookings.filter(
        (booking) =>
          booking.status === "Confirmed"
      ).length,
      color: "text-indigo-700",
    },
    {
      title: "Pending",
      value: bookings.filter(
        (booking) =>
          booking.status === "Pending"
      ).length,
      color: "text-amber-600",
    },
    {
      title: "Completed",
      value: bookings.filter(
        (booking) =>
          booking.status === "Completed"
      ).length,
      color: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Booking & Calendar
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage photography bookings, schedules and assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBooking()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Booking
        </button>
      </div>

      {/* Statistics */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {stat.title}
            </p>

            <h2
              className={`mt-3 text-3xl font-bold ${stat.color}`}
            >
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm sm:p-5">
        <div className="mb-5 flex flex-col gap-3">
          <h2 className="flex min-w-0 items-center gap-2 break-words text-base font-bold text-[#10264d] sm:text-lg">
            <CalendarDays
              size={20}
              className="shrink-0"
            />

            {month.toLocaleString("en-IN", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <div className="flex w-full items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => setMonth(new Date())}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#10264d]"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Responsive Calendar Grid */}
        <div className="grid w-full min-w-0 grid-cols-7 gap-1 text-center sm:gap-2">
          {[
            "Sun",
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
          ].map((day) => (
            <div
              key={day}
              className="min-w-0 py-2 text-[9px] font-semibold text-slate-500 sm:text-xs"
            >
              {day}
            </div>
          ))}

          {cells.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-w-0"
                />
              );
            }

            const date = dateKey(
              new Date(
                month.getFullYear(),
                month.getMonth(),
                day
              )
            );

            const dayBookings = bookings.filter(
              (booking) =>
                booking.date === date
            );

            const isToday =
              date === dateKey(new Date());

            return (
              <button
                key={date}
                type="button"
                onClick={() => openBooking(date)}
                aria-label={`Add booking for ${date}`}
                className={`flex min-h-12 min-w-0 flex-col items-center rounded-lg border p-1 text-center transition hover:border-blue-400 hover:bg-blue-50 sm:min-h-20 sm:items-start sm:rounded-xl sm:p-2 sm:text-left ${
                  isToday
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-100"
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isToday
                      ? "text-blue-700"
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
                      {dayBookings
                        .slice(0, 2)
                        .map((booking) => (
                          <div
                            key={booking.id}
                            className="mt-1 w-full truncate rounded bg-blue-100 px-1 py-1 text-[10px] text-blue-800"
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

      {/* Upcoming Shoots */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Upcoming Shoots
        </h2>

        {upcoming.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No upcoming shoots
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((booking) => (
              <div
                key={booking.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              >
                <Detail
                  label="Customer"
                  value={booking.customer}
                />

                <Detail
                  label="Event"
                  value={booking.event}
                />

                <Detail
                  label="Date"
                  value={booking.date}
                />

                <Detail
                  label="Time"
                  value={booking.time}
                />

                <Detail
                  label="Location"
                  value={booking.location}
                />

                <Detail
                  label="Photographer"
                  value={
                    booking.photographer ||
                    "Not assigned"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Bookings */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          All Bookings
        </h2>

        {/* Search */}
        <div className="mb-4 relative w-full min-w-0">
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
            placeholder="Search bookings..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Filter Dropdown */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...statuses]}
            onChange={setFilter}
          />
        </div>

        {/* Booking Cards */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            No bookings found
          </p>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                {/* Booking Heading */}
                <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-200 pb-4">
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
                      onClick={() =>
                        editBooking(booking)
                      }
                      className="rounded-xl bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-100"
                      aria-label="Edit booking"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBooking(booking.id)
                      }
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100"
                      aria-label="Delete booking"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                <Detail
                  label="Phone"
                  value={booking.phone}
                />

                <Detail
                  label="Event"
                  value={booking.event}
                />

                <Detail
                  label="Date"
                  value={booking.date}
                />

                <Detail
                  label="Time"
                  value={booking.time}
                />

                <Detail
                  label="Location"
                  value={booking.location}
                />

                <Detail
                  label="Photographer"
                  value={
                    booking.photographer ||
                    "Not assigned"
                  }
                />

                <Detail
                  label="Package"
                  value={booking.package}
                />

                {/* Booking Status */}
                <div className="w-full min-w-0 pt-1">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Booking Status
                  </p>

                  <div
                    className={`rounded-xl p-1 ${
                      statusStyle[
                        booking.status
                      ] || "bg-slate-100"
                    }`}
                  >
                    <CustomDropdown
                      value={
                        booking.status ||
                        "Confirmed"
                      }
                      options={statuses}
                      onChange={(status) =>
                        changeStatus(
                          booking.id,
                          status
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* New / Edit Booking Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Edit Booking"
                  : "Create New Booking"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter photography booking details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close booking form"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveBooking}
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
                maxLength={10}
                required
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Enter 10-digit phone number"
                className={inputClass}
              />
            </FormField>

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={events}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Booking Date">
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  update(
                    "date",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Time">
              <input
                type="time"
                required
                value={form.time}
                onChange={(event) =>
                  update(
                    "time",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  update(
                    "location",
                    event.target.value
                  )
                }
                placeholder="Enter shoot location"
                className={inputClass}
              />
            </FormField>

            <FormField label="Photographer">
              <input
                type="text"
                value={form.photographer}
                onChange={(event) =>
                  update(
                    "photographer",
                    event.target.value
                  )
                }
                placeholder="Enter photographer name"
                className={inputClass}
              />
            </FormField>

            <FormField label="Package">
              <input
                type="text"
                value={form.package}
                onChange={(event) =>
                  update(
                    "package",
                    event.target.value
                  )
                }
                placeholder="Enter photography package"
                className={inputClass}
              />
            </FormField>

            <FormField label="Booking Status">
              <CustomDropdown
                value={form.status}
                options={statuses}
                onChange={(value) =>
                  update("status", value)
                }
              />
            </FormField>

            {error && (
              <p
                role="alert"
                className="break-words text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}

            {/* Form Buttons */}
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
                className="w-full rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-900"
              >
                {editingId
                  ? "Update Booking"
                  : "Save Booking"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
