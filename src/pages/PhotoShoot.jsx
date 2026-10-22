
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  X,
  Camera,
  Users,
  Images,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  Film,
  IndianRupee,
  ChevronDown,
} from "lucide-react";

const STORAGE_KEY = "studioraw_photoshoots";

const eventOptions = [
  "Wedding Photography",
  "Traditional Photography",
  "Candid Photography",
  "Helicam(Drone) Photography",
  "PreWedding Photography",
  "Post Wedding Photography",
  "Custom Package",
  "Wedding Videography",
  "Function We Arrange",
  "Event Management",
  "Customized Gifts",
  "Pre-Wedding / Outdoor Shoot",
  "Baby & Kids Shoot",
  "Complete Wedding Package",
];

const initialRecords = [
  {
    id: 1001,
    clientName: "Arun Kumar",
    eventType: "Wedding Photography",
    shootDate: "2026-10-10",
    location: "Nagercoil",
    photographer: "Prathiksha",
    packageType: "Premium",
    totalPhotos: 850,
    status: "Completed",
    paymentStatus: "Paid",
  },
  {
    id: 1002,
    clientName: "Priya & Karthik",
    eventType: "Pre-Wedding / Outdoor Shoot",
    shootDate: "2026-10-14",
    location: "Kanyakumari",
    photographer: "Arun",
    packageType: "Luxury",
    totalPhotos: 420,
    status: "Editing",
    paymentStatus: "Partial",
  },
  {
    id: 1003,
    clientName: "Divya Raj",
    eventType: "Baby & Kids Shoot",
    shootDate: "2026-10-17",
    location: "Marthandam",
    photographer: "Prathiksha",
    packageType: "Standard",
    totalPhotos: 280,
    status: "In Progress",
    paymentStatus: "Pending",
  },
  {
    id: 1004,
    clientName: "Michael & Sarah",
    eventType: "Complete Wedding Package",
    shootDate: "2026-10-20",
    location: "Tirunelveli",
    photographer: "David",
    packageType: "Luxury",
    totalPhotos: 1200,
    status: "Scheduled",
    paymentStatus: "Partial",
  },
  {
    id: 1005,
    clientName: "Sneha",
    eventType: "Candid Photography",
    shootDate: "2026-10-25",
    location: "Nagercoil",
    photographer: "Arun",
    packageType: "Standard",
    totalPhotos: 150,
    status: "Scheduled",
    paymentStatus: "Pending",
  },
];

const emptyForm = {
  clientName: "",
  eventType: "Wedding Photography",
  shootDate: "",
  location: "",
  photographer: "",
  packageType: "Standard",
  totalPhotos: "",
  status: "Scheduled",
  paymentStatus: "Pending",
};

const locationOptions = [
  "Nagercoil",
  "Kanyakumari",
  "Marthandam",
  "Tirunelveli",
  "Chennai",
  "Trivandrum",
];

const photographerOptions = [
  "Prathiksha",
  "Arun",
  "David",
  "Rahul",
  "Studio Team",
];

const packageOptions = [
  "Standard",
  "Premium",
  "Luxury",
  "Custom",
];

const statusOptions = [
  "Scheduled",
  "In Progress",
  "Editing",
  "Completed",
  "Cancelled",
];

const paymentOptions = [
  "Pending",
  "Partial",
  "Paid",
];

function readRecords() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialRecords)
      );
      return initialRecords;
    }

    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed) && parsed.length === 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialRecords)
      );
      return initialRecords;
    }

    return Array.isArray(parsed)
      ? parsed
      : initialRecords;
  } catch {
    return initialRecords;
  }
}

function formatDate(date) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function statusStyle(status) {
  const styles = {
    Completed:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Scheduled:
      "bg-blue-50 text-blue-700 ring-blue-200",
    "In Progress":
      "bg-amber-50 text-amber-700 ring-amber-200",
    Editing:
      "bg-violet-50 text-violet-700 ring-violet-200",
    Cancelled:
      "bg-red-50 text-red-700 ring-red-200",
    Paid:
      "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Partial:
      "bg-amber-50 text-amber-700 ring-amber-200",
    Pending:
      "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    styles[status] ||
    "bg-gray-100 text-gray-700 ring-gray-200"
  );
}

function Badge({ children }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle(
        children
      )}`}
    >
      {children}
    </span>
  );
}

function Field({ label, children, required = false }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <Field label={label} required={required}>
      <div className="relative">
        <select
          className={`${inputClass} appearance-none pr-10`}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={17}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </Field>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  options,
  required = false,
}) {
  const listId = `suggestions-${label.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}`;

  return (
    <Field label={label} required={required}>
      <input
        className={inputClass}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        list={options ? listId : undefined}
        autoComplete="off"
        required={required}
      />

      {options && (
        <datalist id={listId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}
    </Field>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

export default function PhotoShoot() {
  const [records, setRecords] = useState(readRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(records)
    );
  }, [records]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch = [
        record.clientName,
        record.eventType,
        record.location,
        record.photographer,
        record.packageType,
        String(record.id),
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term)
      );

      const matchesStatus =
        statusFilter === "All" ||
        record.status === statusFilter;

      const matchesEvent =
        eventFilter === "All" ||
        record.eventType === eventFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEvent
      );
    });
  }, [records, search, statusFilter, eventFilter]);

  const stats = useMemo(
    () => ({
      total: records.length,
      scheduled: records.filter(
        (record) => record.status === "Scheduled"
      ).length,
      completed: records.filter(
        (record) => record.status === "Completed"
      ).length,
      photos: records.reduce(
        (sum, record) =>
          sum + (Number(record.totalPhotos) || 0),
        0
      ),
    }),
    [records]
  );

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEditModal(record) {
    setEditingId(record.id);

    setForm({
      clientName: record.clientName || "",
      eventType:
        record.eventType || "Wedding Photography",
      shootDate: record.shootDate || "",
      location: record.location || "",
      photographer: record.photographer || "",
      packageType: record.packageType || "Standard",
      totalPhotos: String(record.totalPhotos ?? ""),
      status: record.status || "Scheduled",
      paymentStatus: record.paymentStatus || "Pending",
    });

    setModalOpen(true);
    setViewRecord(null);
  }

  function saveRecord(event) {
    event.preventDefault();

    const recordData = {
      ...form,
      clientName: form.clientName.trim(),
      location: form.location.trim(),
      photographer: form.photographer.trim(),
      totalPhotos: Number(form.totalPhotos) || 0,
    };

    if (editingId !== null) {
      setRecords((previous) =>
        previous.map((record) =>
          record.id === editingId
            ? { ...record, ...recordData }
            : record
        )
      );
    } else {
      setRecords((previous) => [
        {
          ...recordData,
          id: Date.now(),
        },
        ...previous,
      ]);
    }

    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function deleteRecord() {
    setRecords((previous) =>
      previous.filter(
        (record) => record.id !== deleteId
      )
    );

    setDeleteId(null);
    setViewRecord(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-600 p-3.5 text-white shadow-lg shadow-blue-200">
              <Camera size={28} />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Studio Management
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Studio Media Tracker
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
                Manage studio bookings, shoot schedules,
                photographers and project records in one place.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus size={19} />
            Add New Record
          </button>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Records"
            value={stats.total}
            subtitle="All studio projects"
            icon={Images}
            iconClass="bg-blue-50 text-blue-600"
          />

          <StatCard
            title="Scheduled Shoots"
            value={stats.scheduled}
            subtitle="Upcoming studio projects"
            icon={CalendarDays}
            iconClass="bg-violet-50 text-violet-600"
          />

          <StatCard
            title="Completed Projects"
            value={stats.completed}
            subtitle="Successfully completed"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <StatCard
            title="Total Photos"
            value={stats.photos.toLocaleString("en-IN")}
            subtitle="Across all records"
            icon={Film}
            iconClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* SHOOT RECORDS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* FILTER HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Shoot Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sample records are available to explore and edit.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-10`}
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search records..."
                />
              </div>

              {/* STATUS FILTER */}
              <div className="relative sm:w-44">
                <select
                  className={`${inputClass} appearance-none pr-9`}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All</option>

                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* EVENT FILTER */}
              <div className="relative sm:w-56">
                <select
                  className={`${inputClass} appearance-none pr-9`}
                  value={eventFilter}
                  onChange={(event) =>
                    setEventFilter(event.target.value)
                  }
                >
                  <option value="All">All Events</option>

                  {eventOptions.map((eventType) => (
                    <option
                      key={eventType}
                      value={eventType}
                    >
                      {eventType}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">
                    Project / Client
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Event Type
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Shoot Date
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Photographer
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Photos
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Payment
                  </th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">
                          {(record.clientName || "")
                            .split(" ")
                            .filter(Boolean)
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {record.clientName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            ID: #{record.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm">
                      {record.eventType}
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays
                          size={15}
                          className="text-slate-400"
                        />
                        {formatDate(record.shootDate)}
                      </div>
                    </td>

                    <td className="px-5 py-5 text-sm">
                      {record.photographer || "Not assigned"}
                    </td>

                    <td className="px-5 py-5 text-sm font-semibold">
                      {Number(
                        record.totalPhotos || 0
                      ).toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-5">
                      <Badge>{record.status}</Badge>
                    </td>

                    <td className="px-5 py-5">
                      <Badge>{record.paymentStatus}</Badge>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-1">
                        <button
                          title="View record"
                          onClick={() =>
                            setViewRecord(record)
                          }
                          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit record"
                          onClick={() =>
                            openEditModal(record)
                          }
                          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete record"
                          onClick={() =>
                            setDeleteId(record.id)
                          }
                          className="rounded-lg p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {filteredRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                      {(record.clientName || "")
                        .split(" ")
                        .filter(Boolean)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-slate-900">
                        {record.clientName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: #{record.id}
                      </p>
                    </div>
                  </div>

                  <button
                    title="View record"
                    onClick={() => setViewRecord(record)}
                    className="shrink-0 rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye size={19} />
                  </button>
                </div>

                <div className="my-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Event Type
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {record.eventType}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Shoot Date
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {formatDate(record.shootDate)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Photographer
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold">
                      {record.photographer || "Not assigned"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">
                      Total Photos
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {Number(
                        record.totalPhotos || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{record.status}</Badge>
                  <Badge>{record.paymentStatus}</Badge>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => openEditModal(record)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteId(record.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredRecords.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Camera size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No records found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filter.
              </p>

              <button
                onClick={openCreateModal}
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Add New Record
              </button>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredRecords.length} of{" "}
              {records.length} records
            </span>

            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Studio Raw ERP
            </span>
          </div>
        </section>
      </main>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  {editingId !== null ? (
                    <Pencil size={22} />
                  ) : (
                    <Plus size={22} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {editingId !== null
                      ? "Manage Record"
                      : "Add New Record"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Enter the studio project details below.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={saveRecord}>
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">

                <TextField
                  label="Client Name"
                  value={form.clientName}
                  onChange={(value) =>
                    updateField("clientName", value)
                  }
                  placeholder="Enter client name"
                  required
                />

                {/* UPDATED EVENT TYPE */}
                <SelectField
                  label="Event Type"
                  value={form.eventType}
                  onChange={(value) =>
                    updateField("eventType", value)
                  }
                  options={
                    eventOptions.includes(form.eventType)
                      ? eventOptions
                      : [form.eventType, ...eventOptions]
                  }
                  required
                />

                <Field label="Shoot Date" required>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.shootDate}
                    onChange={(event) =>
                      updateField(
                        "shootDate",
                        event.target.value
                      )
                    }
                    required
                  />
                </Field>

                <TextField
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    updateField("location", value)
                  }
                  placeholder="Select or type a location"
                  options={locationOptions}
                  required
                />

                <TextField
                  label="Photographer"
                  value={form.photographer}
                  onChange={(value) =>
                    updateField("photographer", value)
                  }
                  placeholder="Select or type a name"
                  options={photographerOptions}
                  required
                />

                <SelectField
                  label="Package Type"
                  value={form.packageType}
                  onChange={(value) =>
                    updateField("packageType", value)
                  }
                  options={packageOptions}
                  required
                />

                <Field label="Total Photos">
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.totalPhotos}
                    onChange={(event) =>
                      updateField(
                        "totalPhotos",
                        event.target.value
                      )
                    }
                    placeholder="Enter photo count"
                  />
                </Field>

                <SelectField
                  label="Project Status"
                  value={form.status}
                  onChange={(value) =>
                    updateField("status", value)
                  }
                  options={statusOptions}
                  required
                />

                <div className="sm:col-span-2">
                  <SelectField
                    label="Payment Status"
                    value={form.paymentStatus}
                    onChange={(value) =>
                      updateField("paymentStatus", value)
                    }
                    options={paymentOptions}
                    required
                  />
                </div>
              </div>

              {/* FORM BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-100 hover:bg-blue-700"
                >
                  <CheckCircle2 size={17} />

                  {editingId !== null
                    ? "Save Changes"
                    : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RECORD MODAL */}
      {viewRecord && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  Project Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {viewRecord.clientName}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Record ID: #{viewRecord.id}
                </p>
              </div>

              <button
                onClick={() => setViewRecord(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Project status
                </span>
                <Badge>{viewRecord.status}</Badge>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Event type
                </span>
                <span className="text-right text-sm font-semibold">
                  {viewRecord.eventType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />
                  Shoot date
                </span>
                <span className="text-right text-sm font-semibold">
                  {formatDate(viewRecord.shootDate)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  Location
                </span>
                <span className="text-right text-sm font-semibold">
                  {viewRecord.location}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Users size={16} />
                  Photographer
                </span>
                <span className="text-right text-sm font-semibold">
                  {viewRecord.photographer}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  Package
                </span>
                <span className="text-right text-sm font-semibold">
                  {viewRecord.packageType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <Images size={16} />
                  Total photos
                </span>
                <span className="text-right text-sm font-semibold">
                  {Number(
                    viewRecord.totalPhotos || 0
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-500">
                  <IndianRupee size={16} />
                  Payment
                </span>
                <Badge>{viewRecord.paymentStatus}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setDeleteId(viewRecord.id);
                  setViewRecord(null);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                onClick={() => openEditModal(viewRecord)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={25} />
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
              Delete this record?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              This record will be removed from your
              Studio Media Tracker.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={deleteRecord}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
