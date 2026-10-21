
import { useEffect, useMemo, useRef, useState } from "react";
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
  Check,
  FolderOpen,
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const countNumber = (value) => {
  const number = Number(value || 0);

  return Number.isFinite(number)
    ? Math.max(0, number)
    : 0;
};

function CustomDropdown({
  value,
  options,
  onChange,
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
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="listbox"
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

export default function PhotoShoot() {
  const [shoots, setShoots] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(KEY)
      );

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

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(shoots)
    );
  }, [shoots]);

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
          item.id === editingId
            ? data
            : item
        )
      );
    } else {
      setShoots((previous) => [
        data,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteShoot = (id) => {
    if (
      !window.confirm(
        "Delete this shoot record?"
      )
    ) {
      return;
    }

    setShoots((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    if (editingId === id) {
      closeForm();
    }
  };

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

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
  }, [shoots, search, filter]);

  const totalPhotos = shoots.reduce(
    (sum, item) =>
      sum + countNumber(item.totalPhotos),
    0
  );

  const stats = [
    {
      title: "Total Shoots",
      value: shoots.length,
      icon: Camera,
      color: "text-blue-700",
    },
    {
      title: "Completed Shoots",
      value: shoots.filter(
        (item) =>
          item.status === "Completed"
      ).length,
      icon: CheckCircle2,
      color: "text-green-700",
    },
    {
      title: "Total Photos",
      value: totalPhotos.toLocaleString("en-IN"),
      icon: Images,
      color: "text-indigo-700",
    },
    {
      title: "Backup Pending",
      value: shoots.filter(
        (item) =>
          item.backup === "Pending"
      ).length,
      icon: HardDrive,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Photo Shoot & Data Collection
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage shoots, media collection, storage and backup tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          <Plus size={18} />
          New Shoot
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
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <h2
                className={`mt-3 break-words text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Shoot Records */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-5 text-lg font-bold text-[#10264d]">
          Shoot Records
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
            placeholder="Search shoots..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {/* Status Filter */}
        <div className="mb-5 w-full min-w-0">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Filter by Shoot Status
          </p>

          <CustomDropdown
            value={filter}
            options={["All", ...statuses]}
            onChange={setFilter}
          />
        </div>

        {/* Shoot Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Camera
              size={42}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-sm text-slate-400">
              No photo shoot records found
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-4">
            {filtered.map((item) => (
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
                      statusColors[item.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.status || "Scheduled"}
                  </span>
                </div>

                {/* Shoot Details */}
                <Detail
                  label="Shoot Date"
                  value={item.shootDate}
                  icon={CalendarDays}
                />

                <Detail
                  label="Location"
                  value={
                    item.location ||
                    "Not specified"
                  }
                  icon={MapPin}
                />

                <Detail
                  label="Photographer"
                  value={
                    item.photographer ||
                    "Not assigned"
                  }
                  icon={UserRound}
                />

                <Detail
                  label="Videographer"
                  value={
                    item.videographer ||
                    "Not assigned"
                  }
                  icon={UserRound}
                />

                <Detail
                  label="Camera Model"
                  value={
                    item.camera ||
                    "Camera not specified"
                  }
                  icon={Camera}
                />

                <Detail
                  label="Memory Card Details"
                  value={
                    item.memoryCard ||
                    "Not specified"
                  }
                  icon={HardDrive}
                />

                <Detail
                  label="Storage Location / Folder"
                  value={
                    item.storageLocation ||
                    "Not specified"
                  }
                  icon={FolderOpen}
                />

                {/* Photos and Videos */}
                <div className="flex w-full min-w-0 flex-col gap-3">
                  <div className="w-full min-w-0 rounded-xl bg-blue-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Images size={16} />
                      Total Photos
                    </div>

                    <p className="mt-2 break-all text-2xl font-bold text-blue-800">
                      {countNumber(
                        item.totalPhotos
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="w-full min-w-0 rounded-xl bg-indigo-50 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Camera size={16} />
                      Total Videos
                    </div>

                    <p className="mt-2 break-all text-2xl font-bold text-indigo-800">
                      {countNumber(
                        item.totalVideos
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* Backup */}
                <div className="flex w-full min-w-0 flex-col gap-2 rounded-xl bg-white p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <HardDrive size={17} />
                    Backup Status
                  </p>

                  <span
                    className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                      item.backup === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {item.backup || "Pending"}
                  </span>
                </div>

                {item.notes && (
                  <Detail
                    label="Shoot Notes"
                    value={item.notes}
                  />
                )}

                {/* Actions */}
                <div className="flex w-full flex-col gap-3 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEdit(item)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                  >
                    <Pencil size={17} />
                    Manage Shoot
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteShoot(item.id)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                    Delete Shoot
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* New / Edit Shoot Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex min-w-0 items-start justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-[#10264d]">
                {editingId
                  ? "Manage Photo Shoot"
                  : "New Photo Shoot"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter shoot and media collection details.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close shoot form"
            >
              <X size={22} />
            </button>
          </div>

          <form
            onSubmit={saveShoot}
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

            <FormField label="Event Type">
              <CustomDropdown
                value={form.event}
                options={events}
                onChange={(value) =>
                  update("event", value)
                }
              />
            </FormField>

            <FormField label="Shoot Date">
              <input
                type="date"
                required
                value={form.shootDate}
                onChange={(event) =>
                  update(
                    "shootDate",
                    event.target.value
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Shoot Location">
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

            <FormField label="Videographer">
              <input
                type="text"
                value={form.videographer}
                onChange={(event) =>
                  update(
                    "videographer",
                    event.target.value
                  )
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
                  update(
                    "camera",
                    event.target.value
                  )
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
                  update(
                    "memoryCard",
                    event.target.value
                  )
                }
                placeholder="Enter memory card details"
                className={inputClass}
              />
            </FormField>

            <FormField label="Storage Location / Folder">
              <input
                type="text"
                value={form.storageLocation}
                onChange={(event) =>
                  update(
                    "storageLocation",
                    event.target.value
                  )
                }
                placeholder="Enter storage location"
                className={inputClass}
              />
            </FormField>

            <FormField label="Total Photos">
              <input
                type="number"
                min="0"
                step="1"
                value={form.totalPhotos}
                onChange={(event) =>
                  update(
                    "totalPhotos",
                    event.target.value
                  )
                }
                placeholder="Enter total photos"
                className={inputClass}
              />
            </FormField>

            <FormField label="Total Videos">
              <input
                type="number"
                min="0"
                step="1"
                value={form.totalVideos}
                onChange={(event) =>
                  update(
                    "totalVideos",
                    event.target.value
                  )
                }
                placeholder="Enter total videos"
                className={inputClass}
              />
            </FormField>

            <FormField label="Backup Status">
              <CustomDropdown
                value={form.backup}
                options={backupStatuses}
                onChange={(value) =>
                  update("backup", value)
                }
              />
            </FormField>

            <FormField label="Shoot Status">
              <CustomDropdown
                value={form.status}
                options={statuses}
                onChange={(value) =>
                  update("status", value)
                }
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Shoot notes and instructions..."
                className={inputClass}
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
                {editingId
                  ? "Update Shoot"
                  : "Save Shoot"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
