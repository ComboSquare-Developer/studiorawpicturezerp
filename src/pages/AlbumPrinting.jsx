
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  BookOpen,
  Printer,
  CheckCircle2,
  Pencil,
  Trash2,
  CalendarDays,
  UserRound,
  Save,
  Package,
  ChevronDown,
  AlertCircle,
  Layers3,
  ClipboardCheck,
  FileText,
  Eye,
  Clock3,
  Building2,
  Hash,
} from "lucide-react";

const KEY = "studioraw_album_printing";

const createEmptyForm = () => ({
  customer: "",
  event: "Wedding",
  albumType: "Premium Photo Album",
  albumSize: "12x36",
  pages: "",
  quantity: "1",
  designer: "",
  printerName: "",
  designDeadline: "",
  deliveryDate: "",
  designStatus: "Not Started",
  approvalStatus: "Pending",
  printingStatus: "Not Started",
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

const albumTypes = [
  "Premium Photo Album",
  "Classic Album",
  "Candid Album",
  "Wedding Album",
  "Mini Album",
  "Photo Book",
];

const albumSizes = [
  "12x36",
  "12x30",
  "12x24",
  "10x30",
  "10x24",
  "8x12",
];

const designStatuses = [
  "Not Started",
  "In Progress",
  "Completed",
];

const approvalStatuses = [
  "Pending",
  "Approved",
  "Rejected",
];

const printingStatuses = [
  "Not Started",
  "Sent to Print",
  "Printing",
  "Printed",
];

const statusColor = {
  "Not Started": "bg-slate-100 text-slate-600",
  Pending: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
  Completed: "bg-emerald-50 text-emerald-700",
  "Sent to Print": "bg-indigo-50 text-indigo-700",
  Printing: "bg-blue-50 text-blue-700",
  Printed: "bg-emerald-50 text-emerald-700",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#8ca0bd] focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1a4384]";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-5 py-3 text-sm font-semibold text-[#10264d] transition hover:bg-slate-50";

function readAlbums() {
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
    `ALBUM-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function formatDate(value) {
  if (!value) return "Not scheduled";

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getProgress(item) {
  if (item.printingStatus === "Printed") return 100;
  if (item.printingStatus === "Printing") return 85;
  if (item.printingStatus === "Sent to Print") return 70;
  if (item.approvalStatus === "Approved") return 60;
  if (item.designStatus === "Completed") return 45;
  if (item.designStatus === "In Progress") return 25;
  return 0;
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-[11px] font-bold ${
        statusColor[value] || statusColor["Not Started"]
      }`}
    >
      {value || "Not Started"}
    </span>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-[13px] font-semibold text-[#29416a]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4ff] text-[#174b91]">
        <Icon size={19} />
      </div>
      <h3 className="text-sm font-bold text-[#10264d]">
        {title}
      </h3>
    </div>
  );
}

function CustomDropdown({ value, options, onChange }) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
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

function ProgressBar({ item }) {
  const progress = getProgress(item);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500">
          Album Progress
        </span>
        <span className="text-xs font-bold text-[#10264d]">
          {progress}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Album progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress === 100
              ? "bg-emerald-500"
              : "bg-blue-700"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
  full = false,
}) {
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
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

function StatCard({ stat }) {
  const Icon = stat.icon;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            {stat.title}
          </p>
          <h2 className={`mt-3 text-2xl font-bold sm:text-3xl ${stat.color}`}>
            {stat.value}
          </h2>
        </div>

        <div className={`rounded-xl p-3 ${stat.bg}`}>
          <Icon size={21} className={stat.color} />
        </div>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label, color, onClick }) {
  const colors = {
    view: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    edit: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    delete: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        colors[color] || colors.edit
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

function AlbumCard({
  item,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-[#e3eaf4] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      {/* CARD HEADER */}
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#174b91]">
            <BookOpen size={21} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words text-sm font-extrabold leading-5 text-[#10264d] sm:text-base">
              {item.customer || "Unnamed Customer"}
            </h3>
            <p className="mt-1 text-[11px] text-slate-500">
              {item.event || "Other Event"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            icon={Eye}
            label="View Album"
            color="view"
            onClick={() => onView(item)}
          />
          <IconButton
            icon={Pencil}
            label="Edit Album"
            color="edit"
            onClick={() => onEdit(item)}
          />
          <IconButton
            icon={Trash2}
            label="Delete Album"
            color="delete"
            onClick={() => onDelete(item.id)}
          />
        </div>
      </div>

      <div className="my-4 border-t border-slate-100" />

      {/* STATUS */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge value={item.printingStatus} />
        <StatusBadge value={item.approvalStatus} />
      </div>

      {/* TWO COLUMN DETAILS */}
      <div className="grid grid-cols-2 gap-2.5">
        <DetailBox
          icon={Layers3}
          label="Album Type"
          value={item.albumType}
          full
        />
        <DetailBox
          icon={BookOpen}
          label="Album Size"
          value={item.albumSize}
        />
        <DetailBox
          icon={FileText}
          label="Total Pages"
          value={item.pages}
        />
        <DetailBox
          icon={Package}
          label="Quantity"
          value={item.quantity}
        />
        <DetailBox
          icon={UserRound}
          label="Designer"
          value={item.designer || "Not assigned"}
        />
        <DetailBox
          icon={Printer}
          label="Printing Vendor"
          value={item.printerName || "Not assigned"}
          full
        />
        <DetailBox
          icon={CalendarDays}
          label="Design Deadline"
          value={formatDate(item.designDeadline)}
        />
        <DetailBox
          icon={CalendarDays}
          label="Delivery Date"
          value={formatDate(item.deliveryDate)}
        />
      </div>

      {/* PROGRESS */}
      <div className="mt-4 rounded-xl border border-slate-100 bg-[#fafcff] p-3.5">
        <ProgressBar item={item} />
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">
            {item.designStatus || "Not Started"}
          </span>

          <button
            type="button"
            onClick={() => onView(item)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            <Eye size={15} />
            View Details
          </button>
        </div>
      </div>
    </article>
  );
}

function Modal({
  title,
  description,
  icon: Icon,
  onClose,
  children,
  width = "max-w-[960px]",
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5">
      <div
        className="absolute inset-0 bg-[#07152d]/65 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex max-h-[96dvh] w-full ${width} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#fafcff] shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]`}
      >
        {/* FIXED HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#112e60] text-white sm:h-12 sm:w-12 sm:rounded-2xl">
              <Icon size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-lg font-bold text-[#10264d] sm:text-[23px]">
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
            aria-label="Close popup"
            className="shrink-0 rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  );
}

export default function AlbumPrinting() {
  const [albums, setAlbums] = useState(readAlbums);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [viewAlbum, setViewAlbum] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(albums));
  }, [albums]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!showForm && !viewAlbum) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;

      if (showForm) {
        closeForm();
      } else {
        setViewAlbum(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForm, viewAlbum, closeForm]);

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
    setViewAlbum(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (album) => {
    setForm({
      ...createEmptyForm(),
      ...album,
    });
    setEditingId(album.id);
    setViewAlbum(null);
    setError("");
    setShowForm(true);
  };

  const saveAlbum = (event) => {
    event.preventDefault();

    const pages = Number(form.pages);
    const quantity = Number(form.quantity);

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (
      String(form.pages).trim() === "" ||
      String(form.quantity).trim() === "" ||
      !Number.isInteger(pages) ||
      !Number.isInteger(quantity) ||
      pages <= 0 ||
      quantity <= 0
    ) {
      setError("Enter valid album pages and quantity.");
      return;
    }

    const data = {
      ...form,
      customer: form.customer.trim(),
      id: editingId || createId(),
      pages,
      quantity,
    };

    if (editingId) {
      setAlbums((previous) =>
        previous.map((item) =>
          item.id === editingId ? data : item
        )
      );
    } else {
      setAlbums((previous) => [data, ...previous]);
    }

    closeForm();
  };

  const deleteAlbum = (id) => {
    if (!window.confirm("Delete this album project?")) return;

    setAlbums((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) closeForm();

    if (viewAlbum?.id === id) {
      setViewAlbum(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return albums.filter((item) => {
      const matches = [
        item.customer,
        item.event,
        item.designer,
        item.albumType,
        item.printerName,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matches &&
        (filter === "All" || item.printingStatus === filter)
      );
    });
  }, [albums, search, filter]);

  const stats = [
    {
      title: "Total Album Projects",
      value: albums.length,
      icon: BookOpen,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Design Completed",
      value: albums.filter(
        (item) => item.designStatus === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
      bg: "bg-green-50",
    },
    {
      title: "Printing In Progress",
      value: albums.filter(
        (item) =>
          item.printingStatus === "Printing" ||
          item.printingStatus === "Sent to Print"
      ).length,
      icon: Printer,
      color: "text-indigo-700",
      bg: "bg-indigo-50",
    },
    {
      title: "Albums Printed",
      value: albums
        .filter((item) => item.printingStatus === "Printed")
        .reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        ),
      icon: Package,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden bg-[#f6f8fc] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            Studio Raw / Production
          </p>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Album Design & Printing
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage album designs, approvals, printing and delivery schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className={`${primaryButton} w-full shrink-0 sm:w-auto`}
        >
          <Plus size={18} />
          New Album Project
        </button>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* ALBUM PROJECTS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Album Projects
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing {filtered.length} of {albums.length} album projects
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[220px] lg:w-64">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search albums..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-48">
                <CustomDropdown
                  value={filter}
                  options={["All", ...printingStatuses]}
                  onChange={setFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-slate-50 p-5">
              <BookOpen size={36} className="text-slate-300" />
            </div>

            <h3 className="font-bold text-[#10264d]">
              No album projects found
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Add an album project or change your filters.
            </p>

            {albums.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className={`${primaryButton} mt-5`}
              >
                <Plus size={17} />
                New Album Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:p-6">
            {filtered.map((item) => (
              <AlbumCard
                key={item.id}
                item={item}
                onView={setViewAlbum}
                onEdit={openEdit}
                onDelete={deleteAlbum}
              />
            ))}
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <Modal
          title={
            editingId
              ? "Manage Album Project"
              : "New Album Project"
          }
          description="Enter album design and printing details"
          icon={BookOpen}
          onClose={closeForm}
        >
          <form
            onSubmit={saveAlbum}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* SCROLLABLE BODY */}
            <div className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-contain bg-white px-5 py-6 sm:px-9 sm:py-7">
              {/* BASIC INFORMATION */}
              <section>
                <SectionHeading
                  icon={UserRound}
                  title="Basic Information"
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
                      onChange={(value) =>
                        update("event", value)
                      }
                    />
                  </FormField>
                </div>
              </section>

              {/* ALBUM DETAILS */}
              <section>
                <SectionHeading
                  icon={Layers3}
                  title="Album Details"
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField label="Album Type">
                    <CustomDropdown
                      value={form.albumType}
                      options={albumTypes}
                      onChange={(value) =>
                        update("albumType", value)
                      }
                    />
                  </FormField>

                  <FormField label="Album Size">
                    <CustomDropdown
                      value={form.albumSize}
                      options={albumSizes}
                      onChange={(value) =>
                        update("albumSize", value)
                      }
                    />
                  </FormField>

                  <FormField label="Total Pages" required>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.pages}
                      onChange={(event) =>
                        update("pages", event.target.value)
                      }
                      placeholder="Enter total pages"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Album Quantity" required>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.quantity}
                      onChange={(event) =>
                        update("quantity", event.target.value)
                      }
                      placeholder="Enter album quantity"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              {/* ASSIGNMENT */}
              <section>
                <SectionHeading
                  icon={Printer}
                  title="Design & Printing Assignment"
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField label="Assigned Designer">
                    <input
                      type="text"
                      value={form.designer}
                      onChange={(event) =>
                        update("designer", event.target.value)
                      }
                      placeholder="Enter designer name"
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Printing Vendor">
                    <input
                      type="text"
                      value={form.printerName}
                      onChange={(event) =>
                        update("printerName", event.target.value)
                      }
                      placeholder="Enter printing vendor"
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              {/* SCHEDULE */}
              <section>
                <SectionHeading
                  icon={CalendarDays}
                  title="Project Schedule"
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField label="Design Deadline">
                    <input
                      type="date"
                      value={form.designDeadline}
                      onChange={(event) =>
                        update("designDeadline", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Expected Delivery Date">
                    <input
                      type="date"
                      value={form.deliveryDate}
                      onChange={(event) =>
                        update("deliveryDate", event.target.value)
                      }
                      className={inputClass}
                    />
                  </FormField>
                </div>
              </section>

              {/* STATUS */}
              <section>
                <SectionHeading
                  icon={ClipboardCheck}
                  title="Project Status"
                />

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                  <FormField label="Design Status">
                    <CustomDropdown
                      value={form.designStatus}
                      options={designStatuses}
                      onChange={(value) =>
                        update("designStatus", value)
                      }
                    />
                  </FormField>

                  <FormField label="Client Approval">
                    <CustomDropdown
                      value={form.approvalStatus}
                      options={approvalStatuses}
                      onChange={(value) =>
                        update("approvalStatus", value)
                      }
                    />
                  </FormField>

                  <FormField label="Printing Status">
                    <CustomDropdown
                      value={form.printingStatus}
                      options={printingStatuses}
                      onChange={(value) =>
                        update("printingStatus", value)
                      }
                    />
                  </FormField>
                </div>
              </section>

              {/* NOTES */}
              <section>
                <SectionHeading
                  icon={FileText}
                  title="Additional Information"
                />

                <FormField label="Album Notes">
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(event) =>
                      update("notes", event.target.value)
                    }
                    placeholder="Album cover, paper type, client requests..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </section>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                >
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  {error}
                </div>
              )}
            </div>

            {/* FIXED FOOTER */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
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
                  ? "Update Album"
                  : "Save Album"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW ALBUM MODAL */}
      {viewAlbum && !showForm && (
        <Modal
          title="Album Project Details"
          description="Complete design and printing information"
          icon={BookOpen}
          onClose={() => setViewAlbum(null)}
          width="max-w-[700px]"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <BookOpen size={23} />
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-lg font-extrabold text-[#10264d]">
                  {viewAlbum.customer}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {viewAlbum.event} · {viewAlbum.albumType}
                </p>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              <StatusBadge value={viewAlbum.designStatus} />
              <StatusBadge value={viewAlbum.approvalStatus} />
              <StatusBadge value={viewAlbum.printingStatus} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DetailBox
                icon={Layers3}
                label="Album Type"
                value={viewAlbum.albumType}
                full
              />

              <DetailBox
                icon={BookOpen}
                label="Album Size"
                value={viewAlbum.albumSize}
              />

              <DetailBox
                icon={FileText}
                label="Total Pages"
                value={viewAlbum.pages}
              />

              <DetailBox
                icon={Package}
                label="Quantity"
                value={viewAlbum.quantity}
              />

              <DetailBox
                icon={UserRound}
                label="Designer"
                value={viewAlbum.designer || "Not assigned"}
              />

              <DetailBox
                icon={Building2}
                label="Printing Vendor"
                value={viewAlbum.printerName || "Not assigned"}
                full
              />

              <DetailBox
                icon={CalendarDays}
                label="Design Deadline"
                value={formatDate(viewAlbum.designDeadline)}
              />

              <DetailBox
                icon={CalendarDays}
                label="Delivery Date"
                value={formatDate(viewAlbum.deliveryDate)}
              />

              <DetailBox
                icon={ClipboardCheck}
                label="Design Status"
                value={viewAlbum.designStatus}
              />

              <DetailBox
                icon={CheckCircle2}
                label="Client Approval"
                value={viewAlbum.approvalStatus}
              />

              <DetailBox
                icon={Printer}
                label="Printing Status"
                value={viewAlbum.printingStatus}
                full
              />

              <DetailBox
                icon={FileText}
                label="Album Notes"
                value={viewAlbum.notes}
                full
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-white p-4">
              <ProgressBar item={viewAlbum} />
            </div>
          </div>

          {/* VIEW FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white p-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={() => setViewAlbum(null)}
              className={secondaryButton}
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => openEdit(viewAlbum)}
              className={primaryButton}
            >
              <Pencil size={17} />
              Manage Album
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
