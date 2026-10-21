
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, X, BookOpen, Printer, CheckCircle2,
  Pencil, Trash2, CalendarDays, UserRound, Save,
  Package, ChevronDown, AlertCircle, Layers3,
  ClipboardCheck, FileText,
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
  "Wedding", "Engagement", "Birthday", "Pre-Wedding",
  "Baby Shoot", "Portrait", "Corporate", "Other",
];

const albumTypes = [
  "Premium Photo Album", "Classic Album", "Candid Album",
  "Wedding Album", "Mini Album", "Photo Book",
];

const albumSizes = [
  "12x36", "12x30", "12x24", "10x30", "10x24", "8x12",
];

const designStatuses = [
  "Not Started", "In Progress", "Completed",
];

const approvalStatuses = [
  "Pending", "Approved", "Rejected",
];

const printingStatuses = [
  "Not Started", "Sent to Print", "Printing", "Printed",
];

const statusColor = {
  "Not Started": "bg-slate-100 text-slate-600",
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Completed: "bg-green-100 text-green-700",
  "Sent to Print": "bg-indigo-100 text-indigo-700",
  Printing: "bg-blue-100 text-blue-700",
  Printed: "bg-green-100 text-green-700",
};

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-[#8ca0bd] focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getProgress = (item) => {
  if (item.printingStatus === "Printed") return 100;
  if (item.printingStatus === "Printing") return 85;
  if (item.printingStatus === "Sent to Print") return 70;
  if (item.approvalStatus === "Approved") return 60;
  if (item.designStatus === "Completed") return 45;
  if (item.designStatus === "In Progress") return 25;
  return 0;
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex w-fit rounded-lg px-3 py-1.5 text-xs font-semibold ${
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
        {required && <span className="ml-1 text-red-500">*</span>}
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
            progress === 100 ? "bg-green-500" : "bg-blue-700"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="min-w-0 border-b border-slate-100 pb-3 last:border-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-[#10264d]">
        {value || "—"}
      </p>
    </div>
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

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07152d]/65 p-2 backdrop-blur-[4px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[96dvh] w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[93dvh] sm:rounded-[22px]"
      >
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e5ebf3] bg-white px-5 py-5 sm:px-9 sm:py-7">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#112e60] text-white">
              <BookOpen size={23} />
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
            aria-label="Close"
            className="rounded-lg p-2 text-[#627895] hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* SCROLLABLE BODY */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-9 sm:py-7">
            {children}
          </div>

          {/* FIXED FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e5ebf3] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-9 sm:py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d9e3f2] bg-[#f7f9fd] px-7 py-3.5 text-sm font-semibold text-[#18345f] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a4384]"
            >
              <Save size={18} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlbumPrinting() {
  const [albums, setAlbums] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(albums));
  }, [albums]);

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

  const openEdit = (album) => {
    setForm({
      ...createEmptyForm(),
      ...album,
    });
    setEditingId(album.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
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
      id:
        editingId ||
        globalThis.crypto?.randomUUID?.() ||
        `ALBUM-${Date.now()}`,
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
    <div className="min-h-screen w-full min-w-0 space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[#10264d] sm:text-2xl">
            Album Design & Printing
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage album designs, approvals, printing and delivery schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#112e60] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a4384] sm:w-auto"
        >
          <Plus size={18} />
          New Album Project
        </button>
      </div>

      {/* STATISTICS */}
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
                  <h2 className={`mt-3 text-2xl font-bold ${stat.color}`}>
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

      {/* ALBUM PROJECTS */}
      <section className="min-w-0 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Album Projects
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track design, approval and printing progress.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative w-full sm:min-w-[220px] lg:w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search albums..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="w-full sm:w-44">
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
          <div className="py-16 text-center">
            <BookOpen size={42} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-400">
              No album projects found
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[1150px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {[
                      "Customer / Event",
                      "Album Details",
                      "Designer / Vendor",
                      "Deadlines",
                      "Design",
                      "Approval",
                      "Printing",
                      "Progress",
                      "Actions",
                    ].map((heading) => (
                      <th key={heading} className="px-4 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="align-top transition hover:bg-blue-50/40"
                    >
                      <td className="px-4 py-5">
                        <p className="text-sm font-bold text-[#10264d]">
                          {item.customer}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.event}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="max-w-36 break-words text-sm font-medium text-[#10264d]">
                          {item.albumType}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.albumSize}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.pages} Pages · {item.quantity} Qty
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-xs font-semibold text-[#10264d]">
                          {item.designer || "Not assigned"}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.printerName || "No vendor"}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-xs text-slate-600">
                          Design: {item.designDeadline || "—"}
                        </p>
                        <p className="mt-2 text-xs text-slate-600">
                          Delivery: {item.deliveryDate || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge value={item.designStatus} />
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge value={item.approvalStatus} />
                      </td>

                      <td className="px-4 py-5">
                        <StatusBadge value={item.printingStatus} />
                      </td>

                      <td className="min-w-[125px] px-4 py-5">
                        <ProgressBar item={item} />
                      </td>

                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Manage Album"
                            aria-label={`Manage ${item.customer} album`}
                            onClick={() => openEdit(item)}
                            className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            title="Delete Album"
                            aria-label={`Delete ${item.customer} album`}
                            onClick={() => deleteAlbum(item.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
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

            {/* MOBILE AND TABLET CARDS */}
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
                      <p className="mt-1 text-xs text-slate-500">
                        {item.event}
                      </p>
                    </div>
                    <StatusBadge value={item.printingStatus} />
                  </div>

                  <div className="mt-4 space-y-3">
                    <Detail label="Album Type" value={item.albumType} />
                    <Detail label="Album Size" value={item.albumSize} />
                    <Detail label="Total Pages" value={item.pages} />
                    <Detail label="Album Quantity" value={item.quantity} />
                    <Detail
                      label="Assigned Designer"
                      value={item.designer || "Not assigned"}
                    />
                    <Detail
                      label="Printing Vendor"
                      value={item.printerName || "Not assigned"}
                    />
                    <Detail
                      label="Design Deadline"
                      value={item.designDeadline || "Not scheduled"}
                    />
                    <Detail
                      label="Expected Delivery"
                      value={item.deliveryDate || "Not scheduled"}
                    />

                    <div>
                      <p className="mb-2 text-xs text-slate-400">
                        Design Status
                      </p>
                      <StatusBadge value={item.designStatus} />
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-slate-400">
                        Client Approval
                      </p>
                      <StatusBadge value={item.approvalStatus} />
                    </div>

                    <div className="rounded-xl bg-white p-4">
                      <ProgressBar item={item} />
                    </div>

                    {item.notes && (
                      <Detail label="Album Notes" value={item.notes} />
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#112e60] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a4384]"
                    >
                      <Pencil size={17} />
                      Manage Album
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteAlbum(item.id)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Album
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CREATE / EDIT MODAL */}
      {showForm && (
        <ModalShell
          title={editingId ? "Manage Album Project" : "New Album Project"}
          description="Enter album design and printing details"
          onClose={closeForm}
          onSubmit={saveAlbum}
          submitLabel={editingId ? "Update Album" : "Save Album"}
        >
          <div className="space-y-8">

            {/* BASIC INFORMATION */}
            <section>
              <SectionHeading icon={UserRound} title="Basic Information" />
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
              </div>
            </section>

            {/* ALBUM DETAILS */}
            <section>
              <SectionHeading icon={Layers3} title="Album Details" />
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Album Type">
                  <CustomDropdown
                    value={form.albumType}
                    options={albumTypes}
                    onChange={(value) => update("albumType", value)}
                  />
                </FormField>

                <FormField label="Album Size">
                  <CustomDropdown
                    value={form.albumSize}
                    options={albumSizes}
                    onChange={(value) => update("albumSize", value)}
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
              <SectionHeading icon={Printer} title="Design & Printing Assignment" />
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
              <SectionHeading icon={CalendarDays} title="Project Schedule" />
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
              <SectionHeading icon={ClipboardCheck} title="Project Status" />
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <FormField label="Design Status">
                  <CustomDropdown
                    value={form.designStatus}
                    options={designStatuses}
                    onChange={(value) => update("designStatus", value)}
                  />
                </FormField>

                <FormField label="Client Approval">
                  <CustomDropdown
                    value={form.approvalStatus}
                    options={approvalStatuses}
                    onChange={(value) => update("approvalStatus", value)}
                  />
                </FormField>

                <FormField label="Printing Status">
                  <CustomDropdown
                    value={form.printingStatus}
                    options={printingStatuses}
                    onChange={(value) => update("printingStatus", value)}
                  />
                </FormField>
              </div>
            </section>

            {/* NOTES */}
            <section>
              <SectionHeading icon={FileText} title="Additional Information" />
              <FormField label="Album Notes">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                  placeholder="Album cover, paper type, client requests..."
                  className={inputClass}
                />
              </FormField>
            </section>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                {error}
              </p>
            )}
          </div>
        </ModalShell>
      )}
    </div>
  );
}
