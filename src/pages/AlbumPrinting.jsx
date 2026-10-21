
import { useEffect, useMemo, useRef, useState } from "react";
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
  Check,
  AlertCircle,
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const getProgress = (item) => {
  if (item.printingStatus === "Printed") return 100;
  if (item.printingStatus === "Printing") return 85;
  if (item.printingStatus === "Sent to Print") return 70;
  if (item.approvalStatus === "Approved") return 60;
  if (item.designStatus === "Completed") return 45;
  if (item.designStatus === "In Progress") return 25;
  return 0;
};

function CustomDropdown({ value, options, onChange }) {
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
    <div ref={dropdownRef} className="w-full min-w-0 max-w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <span className="min-w-0 flex-1 break-words">
          {value}
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
                className={`flex w-full min-w-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
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

function Detail({ label, value, icon: Icon }) {
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

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(albums));
  }, [albums]);

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
    setForm(createEmptyForm());
    setEditingId(null);
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const openEdit = (album) => {
    setForm({
      ...createEmptyForm(),
      ...album,
    });

    setEditingId(album.id);
    setError("");
    setShowForm(true);
    scrollToForm();
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

    if (!form.customer.trim()) {
      setError("Please enter customer name.");
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
    if (!window.confirm("Delete this album project?")) {
      return;
    }

    setAlbums((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (editingId === id) {
      closeForm();
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
    },
    {
      title: "Design Completed",
      value: albums.filter(
        (item) => item.designStatus === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
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
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Album Design & Printing
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage album designs, approvals, printing and delivery schedules.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Album Project
        </button>
      </div>

      {/* Statistics - Vertical */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="shrink-0 rounded-xl bg-blue-50 p-3">
                  <Icon size={22} className={stat.color} />
                </div>
              </div>

              <h2 className={`mt-3 break-words text-3xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Album Projects */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Album Projects
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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search albums..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Status Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Printing Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...printingStatuses]}
            onChange={setFilter}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No album projects found
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((item) => {
              const progress = getProgress(item);

              return (
                <article
                  key={item.id}
                  className="flex w-full min-w-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:shadow-md sm:p-5"
                >
                  {/* Card Header */}
                  <div className="flex min-w-0 flex-col gap-3 border-b border-slate-200 pb-4">
                    <div className="min-w-0">
                      <h3 className="break-words text-base font-bold text-[#10264d]">
                        {item.customer}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {item.event}
                      </p>
                    </div>

                    <span
                      className={`w-fit max-w-full rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColor[item.printingStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.printingStatus || "Not Started"}
                    </span>
                  </div>

                  {/* Album Details */}
                  <Detail
                    label="Album Type"
                    value={item.albumType}
                    icon={BookOpen}
                  />

                  <Detail
                    label="Album Size"
                    value={item.albumSize}
                  />

                  <Detail
                    label="Assigned Designer"
                    value={item.designer || "Not assigned"}
                    icon={UserRound}
                  />

                  <Detail
                    label="Printing Vendor"
                    value={item.printerName || "Not assigned"}
                    icon={Printer}
                  />

                  <Detail
                    label="Design Deadline"
                    value={item.designDeadline || "Not scheduled"}
                    icon={CalendarDays}
                  />

                  <Detail
                    label="Expected Delivery"
                    value={item.deliveryDate || "Not scheduled"}
                    icon={CalendarDays}
                  />

                  {/* Pages and Quantity */}
                  <div className="flex w-full min-w-0 flex-col gap-3">
                    <div className="w-full min-w-0 rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Total Pages
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-blue-800">
                        {Number(item.pages || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="w-full min-w-0 rounded-xl bg-indigo-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Album Quantity
                      </p>

                      <p className="mt-2 break-all text-2xl font-bold text-indigo-800">
                        {Number(item.quantity || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Design Status */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="text-xs font-medium text-slate-400">
                      Design Status
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColor[item.designStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.designStatus || "Not Started"}
                    </span>
                  </div>

                  {/* Client Approval */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="text-xs font-medium text-slate-400">
                      Client Approval
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColor[item.approvalStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.approvalStatus || "Pending"}
                    </span>
                  </div>

                  {/* Printing Status */}
                  <div className="flex w-full min-w-0 flex-col gap-2 border-b border-slate-100 pb-3">
                    <p className="text-xs font-medium text-slate-400">
                      Printing Status
                    </p>

                    <span
                      className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                        statusColor[item.printingStatus] ||
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.printingStatus || "Not Started"}
                    </span>
                  </div>

                  {/* Album Progress */}
                  <div className="w-full min-w-0 rounded-xl bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-slate-500">
                        Album Progress
                      </p>

                      <p className="shrink-0 text-sm font-bold text-[#10264d]">
                        {progress}%
                      </p>
                    </div>

                    <div
                      role="progressbar"
                      aria-label="Album progress"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          progress === 100
                            ? "bg-green-500"
                            : "bg-blue-700"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <Detail
                      label="Album Notes"
                      value={item.notes}
                    />
                  )}

                  {/* Actions */}
                  <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                    >
                      <Pencil size={17} />
                      Manage Album
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteAlbum(item.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete Album
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* New / Edit Album Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Manage Album Project"
                  : "New Album Project"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter album design and printing details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              aria-label="Close album form"
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveAlbum}
            className="flex w-full min-w-0 flex-col gap-5"
          >
            <FormField label="Customer Name">
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

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={events}
                onChange={(value) => update("event", value)}
              />
            </FormField>

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

            <FormField label="Total Pages">
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

            <FormField label="Album Quantity">
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

            {/* Form Actions */}
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
                {editingId ? "Update Album" : "Save Album"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
