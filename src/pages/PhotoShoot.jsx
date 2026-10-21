
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  Camera,
  Images,
  HardDrive,
  CalendarDays,
  MapPin,
  UserRound,
  Trash2,
  Pencil,
  CheckCircle2,
  Save,
  ChevronDown,
  FolderOpen,
  Video,
  AlertCircle,
  ClipboardList,
  Database,
} from "lucide-react";

const KEY = "studioraw_photoshoots";

const createEmptyForm = () => ({
  customer: "",
  event: "Wedding",
  shootDate: "",
  location: "",
  photographer: "",
  videographer: "",
  camera: "",
  memoryCard: "",
  totalPhotos: "",
  totalVideos: "",
  storageLocation: "",
  backup: "Pending",
  status: "Scheduled",
  notes: "",
});

const events = [
  "Wedding",
  "Engagement",
  "Birthday",
  "Pre-Wedding",
  "Baby Shoot",
  "Portrait",
  "Corporate",
  "Other",
];

const statuses = [
  "Scheduled",
  "In Progress",
  "Completed",
  "Cancelled",
];

const backupStatuses = ["Pending", "Completed"];

const statusColors = {
  Scheduled: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const countNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

const formatCount = (value) =>
  countNumber(value).toLocaleString("en-IN");

function CustomDropdown({ value, options, onChange }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-11`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-semibold text-[#29416a]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-[#10264d]">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-start gap-2">
        {Icon && (
          <Icon
            size={16}
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

function StatusBadge({ value, backup = false }) {
  const color = backup
    ? value === "Completed"
      ? "bg-green-100 text-green-700"
      : "bg-orange-100 text-orange-700"
    : statusColors[value] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${color}`}
    >
      {value || "Pending"}
    </span>
  );
}

function ModalShell({
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  children,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/65 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[96dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]"
      >
        {/* Fixed Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <Camera size={23} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#10264d] sm:text-[23px]">
                {title}
              </h2>

              <p className="mt-1 text-xs text-[#8090aa] sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="shrink-0 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Scrollable Form Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            {children}
          </div>

          {/* Fixed Footer */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d9e3f2] bg-[#f7f9fd] px-7 py-3 text-sm font-semibold text-[#18345f] transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384]"
            >
              <Save size={18} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function PhotoShoot() {
  const [shoots, setShoots] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(shoots));
  }, [shoots]);

  const update = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError("");
  };

  const openCreate = () => {
    setForm(createEmptyForm());
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
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  };

  const saveShoot = (event) => {
    event.preventDefault();

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!form.shootDate) {
      setError("Please select shoot date.");
      return;
    }

    const photos = Number(form.totalPhotos || 0);
    const videos = Number(form.totalVideos || 0);

    if (
      !Number.isFinite(photos) ||
      !Number.isFinite(videos) ||
      photos < 0 ||
      videos < 0 ||
      !Number.isInteger(photos) ||
      !Number.isInteger(videos)
    ) {
      setError(
        "Enter valid non-negative whole numbers for photos and videos."
      );
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      totalPhotos: photos,
      totalVideos: videos,
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `SHOOT-${Date.now()}`,
    };

    if (editingId) {
      setShoots((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setShoots((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteShoot = (id) => {
    if (!window.confirm("Delete this shoot record?")) {
      return;
    }

    setShoots((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) closeForm();
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return shoots.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.photographer,
        item.videographer,
        item.location,
        item.camera,
        item.storageLocation,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matches &&
        (filter === "All" || item.status === filter)
      );
    });
  }, [shoots, search, filter]);

  const totalPhotos = shoots.reduce(
    (sum, item) => sum + countNumber(item.totalPhotos),
    0
  );

  const stats = [
    {
      title: "Total Shoots",
      value: shoots.length,
      icon: Camera,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Completed Shoots",
      value: shoots.filter(
        (item) => item.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      title: "Total Photos",
      value: totalPhotos.toLocaleString("en-IN"),
      icon: Images,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      title: "Backup Pending",
      value: shoots.filter(
        (item) => item.backup === "Pending"
      ).length,
      icon: HardDrive,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const renderActions = (item, compact = false) => (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "flex items-center justify-end gap-2"
      }
    >
      <button
        type="button"
        onClick={() => openEdit(item)}
        title="Manage Shoot"
        className={
          compact
            ? "flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-4 py-3 text-sm font-semibold text-white"
            : "rounded-lg bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
        }
      >
        <Pencil size={17} />
        {compact && "Manage Shoot"}
      </button>

      <button
        type="button"
        onClick={() => deleteShoot(item.id)}
        title="Delete Shoot"
        className={
          compact
            ? "flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600"
            : "rounded-lg bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
        }
      >
        <Trash2 size={17} />
        {compact && "Delete Shoot"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
            Photo Shoot & Data Collection
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage shoots, media collection, storage and backup tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] sm:w-auto"
        >
          <Plus size={18} />
          New Shoot
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <h2
                    className={`mt-3 break-words text-2xl font-bold tracking-tight ${stat.color}`}
                  >
                    {stat.value}
                  </h2>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${stat.bg}`}>
                  <Icon size={22} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shoot Records */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Shoot Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage photography shoot records.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[230px] lg:w-72">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search shoots..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-44">
                <CustomDropdown
                  value={filter}
                  options={["All", ...statuses]}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Camera
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />
            <p className="text-sm text-slate-400">
              No photo shoot records found
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {[
                      "Customer / Event",
                      "Shoot Date",
                      "Location",
                      "Team",
                      "Media",
                      "Backup",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-blue-50/40"
                    >
                      <td className="px-5 py-5">
                        <p className="max-w-44 break-words text-sm font-semibold text-[#10264d]">
                          {item.customer}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.event}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-700">
                        {item.shootDate || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-40 break-words text-sm text-slate-700">
                          {item.location || "Not specified"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="max-w-40 break-words text-sm font-medium text-[#10264d]">
                          {item.photographer || "Not assigned"}
                        </p>
                        <p className="mt-1 max-w-40 break-words text-xs text-slate-500">
                          {item.videographer || "No videographer"}
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <p className="whitespace-nowrap text-sm font-semibold text-[#10264d]">
                          {formatCount(item.totalPhotos)} Photos
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatCount(item.totalVideos)} Videos
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge
                          value={item.backup || "Pending"}
                          backup
                        />
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge
                          value={item.status || "Scheduled"}
                        />
                      </td>

                      <td className="px-5 py-5">
                        {renderActions(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.event}
                      </p>
                    </div>

                    <StatusBadge
                      value={item.status || "Scheduled"}
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <Detail
                      label="Shoot Date"
                      value={item.shootDate}
                      icon={CalendarDays}
                    />

                    <Detail
                      label="Location"
                      value={item.location || "Not specified"}
                      icon={MapPin}
                    />

                    <Detail
                      label="Photographer"
                      value={item.photographer || "Not assigned"}
                      icon={UserRound}
                    />

                    <Detail
                      label="Videographer"
                      value={item.videographer || "Not assigned"}
                      icon={UserRound}
                    />

                    <Detail
                      label="Camera Model"
                      value={item.camera || "Not specified"}
                      icon={Camera}
                    />

                    <Detail
                      label="Memory Card"
                      value={item.memoryCard || "Not specified"}
                      icon={HardDrive}
                    />

                    <Detail
                      label="Storage Location / Folder"
                      value={item.storageLocation || "Not specified"}
                      icon={FolderOpen}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-xl bg-blue-50 p-4">
                        <p className="text-xs text-slate-500">
                          Total Photos
                        </p>
                        <p className="mt-2 break-all text-xl font-bold text-blue-800">
                          {formatCount(item.totalPhotos)}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl bg-indigo-50 p-4">
                        <p className="text-xs text-slate-500">
                          Total Videos
                        </p>
                        <p className="mt-2 break-all text-xl font-bold text-indigo-800">
                          {formatCount(item.totalVideos)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <p className="mb-2 text-xs font-medium text-slate-500">
                        Backup Status
                      </p>
                      <StatusBadge
                        value={item.backup || "Pending"}
                        backup
                      />
                    </div>

                    {item.notes && (
                      <Detail label="Shoot Notes" value={item.notes} />
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    {renderActions(item, true)}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Create / Edit Popup */}
      {showForm && (
        <ModalShell
          title={editingId ? "Manage Photo Shoot" : "New Photo Shoot"}
          description="Enter shoot and media collection details"
          onClose={closeForm}
          onSubmit={saveShoot}
          submitLabel={editingId ? "Update Shoot" : "Save Shoot"}
        >
          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <SectionHeading
                icon={UserRound}
                title="Shoot Information"
                description="Customer, event and shoot schedule"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Customer Name" required>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={form.customer}
                    onChange={(event) =>
                      update("customer", event.target.value)
                    }
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Event Type">
                  <CustomDropdown
                    value={form.event}
                    options={events}
                    onChange={(value) => update("event", value)}
                  />
                </FormField>

                <FormField label="Shoot Date" required>
                  <input
                    type="date"
                    required
                    value={form.shootDate}
                    onChange={(event) =>
                      update("shootDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Shoot Location">
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
            </section>

            {/* Section 2 */}
            <section>
              <SectionHeading
                icon={Camera}
                title="Team & Equipment"
                description="Assigned team and camera details"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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

                <FormField label="Videographer">
                  <input
                    type="text"
                    value={form.videographer}
                    onChange={(event) =>
                      update("videographer", event.target.value)
                    }
                    placeholder="Enter videographer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Camera Model">
                  <input
                    type="text"
                    value={form.camera}
                    onChange={(event) =>
                      update("camera", event.target.value)
                    }
                    placeholder="Enter camera model"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Memory Card Details">
                  <input
                    type="text"
                    value={form.memoryCard}
                    onChange={(event) =>
                      update("memoryCard", event.target.value)
                    }
                    placeholder="Enter memory card details"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <SectionHeading
                icon={Database}
                title="Media & Storage"
                description="Collected media and storage location"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Total Photos">
                  <div className="relative">
                    <Images
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.totalPhotos}
                      onChange={(event) =>
                        update("totalPhotos", event.target.value)
                      }
                      placeholder="Enter total photos"
                      className={`${inputClass} pr-11`}
                    />
                  </div>
                </FormField>

                <FormField label="Total Videos">
                  <div className="relative">
                    <Video
                      size={17}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.totalVideos}
                      onChange={(event) =>
                        update("totalVideos", event.target.value)
                      }
                      placeholder="Enter total videos"
                      className={`${inputClass} pr-11`}
                    />
                  </div>
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Storage Location / Folder">
                    <input
                      type="text"
                      value={form.storageLocation}
                      onChange={(event) =>
                        update("storageLocation", event.target.value)
                      }
                      placeholder="Enter storage location or folder path"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <SectionHeading
                icon={ClipboardList}
                title="Shoot Tracking"
                description="Backup and shoot progress"
              />

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Backup Status">
                  <CustomDropdown
                    value={form.backup}
                    options={backupStatuses}
                    onChange={(value) => update("backup", value)}
                  />
                </FormField>

                <FormField label="Shoot Status">
                  <CustomDropdown
                    value={form.status}
                    options={statuses}
                    onChange={(value) => update("status", value)}
                  />
                </FormField>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <SectionHeading
                icon={FolderOpen}
                title="Additional Information"
                description="Shoot notes and special instructions"
              />

              <FormField label="Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Shoot notes and instructions..."
                  className={`${inputClass} resize-y`}
                />
              </FormField>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span className="break-words">{error}</span>
              </div>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
