
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  PhoneCall,
  Clock3,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  Check,
} from "lucide-react";

const KEY = "studio_raw_enquiries";

const stages = [
  "New",
  "Contacted",
  "Qualified",
  "Quoted",
  "Follow-up",
  "Won/Converted",
  "Lost",
];

const services = [
  "Wedding Photography",
  "Event Photography",
  "Maternity Photography",
  "Pre-Wedding Shoot",
  "Studio Portrait",
  "Videography",
  "Album & Printing",
  "Other",
];

const sources = [
  "Instagram",
  "Website",
  "Referral",
  "WhatsApp",
  "Walk-in",
  "Other",
];

const emptyForm = {
  customer: "",
  phone: "",
  service: "Wedding Photography",
  eventDate: "",
  budget: "",
  source: "Instagram",
  stage: "New",
  owner: "",
  nextFollowUp: "",
  notes: "",
};

const demoEnquiries = [
  {
    id: "ENQ-1001",
    customer: "Rahul",
    phone: "9876543210",
    service: "Wedding Photography",
    eventDate: "2026-11-15",
    budget: "85000",
    source: "Instagram",
    stage: "Qualified",
    owner: "Demo Admin",
    nextFollowUp: "2026-10-25",
    notes: "Interested in premium wedding package",
  },
  {
    id: "ENQ-1002",
    customer: "Anitha",
    phone: "9876501234",
    service: "Maternity Photography",
    eventDate: "2026-11-20",
    budget: "15000",
    source: "Referral",
    stage: "Follow-up",
    owner: "Demo Admin",
    nextFollowUp: "2026-10-22",
    notes: "Send package details",
  },
];

const fieldClass =
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

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
          className="mt-2 max-h-64 w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
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

function DetailRow({ label, value }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="break-words text-sm font-semibold text-[#10264d]">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon }) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-[#10264d]">
          {value}
        </h3>
      </div>

      <div className="shrink-0 rounded-xl bg-blue-50 p-3 text-blue-700">
        <Icon size={22} />
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (!saved) {
        return demoEnquiries;
      }

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : demoEnquiries;
    } catch {
      return demoEnquiries;
    }
  });

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      KEY,
      JSON.stringify(enquiries)
    );
  }, [enquiries]);

  const filtered = enquiries.filter((item) => {
    const matchesSearch = [
      item.customer,
      item.phone,
      item.service,
      item.id,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );

    const matchesStage =
      stageFilter === "All" ||
      item.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const openForm = (item = null) => {
    setEditing(item?.id || null);

    setForm(
      item
        ? { ...emptyForm, ...item }
        : { ...emptyForm }
    );

    setError("");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const save = (event) => {
    event.preventDefault();

    const customer = String(form.customer || "").trim();
    const phone = String(form.phone || "").trim();

    if (!customer || !/^\d{10}$/.test(phone)) {
      setError(
        "Enter customer name and valid 10-digit mobile number."
      );
      return;
    }

    const updatedForm = {
      ...form,
      customer,
      phone,
    };

    if (editing) {
      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === editing
            ? { ...item, ...updatedForm }
            : item
        )
      );
    } else {
      setEnquiries((previous) => [
        {
          ...updatedForm,
          id: `ENQ-${Date.now()}`,
        },
        ...previous,
      ]);
    }

    closeForm();
  };

  const remove = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this enquiry?"
      )
    ) {
      setEnquiries((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      if (editing === id) {
        closeForm();
      }
    }
  };

  const changeStage = (id, stage) => {
    setEnquiries((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, stage }
          : item
      )
    );
  };

  const counts = [
    {
      title: "Total Enquiries",
      value: enquiries.length,
      icon: PhoneCall,
    },
    {
      title: "New Leads",
      value: enquiries.filter(
        (item) => item.stage === "New"
      ).length,
      icon: Clock3,
    },
    {
      title: "Follow-ups",
      value: enquiries.filter(
        (item) => item.stage === "Follow-up"
      ).length,
      icon: CalendarDays,
    },
    {
      title: "Converted",
      value: enquiries.filter(
        (item) =>
          item.stage === "Won/Converted"
      ).length,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Header */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Enquiries & Leads
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Track customer enquiries, follow-ups and conversions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4274]"
        >
          <Plus size={18} />
          Add Enquiry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        {counts.map((item) => (
          <SummaryCard
            key={item.title}
            {...item}
          />
        ))}
      </div>

      {/* Enquiries List */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex w-full min-w-0 flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <h3 className="text-lg font-bold text-[#10264d]">
            Enquiries List
          </h3>

          {/* Search */}
          <div className="relative w-full min-w-0">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search enquiries..."
              className={`${fieldClass} pl-10`}
            />
          </div>

          {/* Stage Filter */}
          <div className="w-full min-w-0">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Filter by Stage
            </p>

            <CustomDropdown
              value={stageFilter}
              options={["All", ...stages]}
              onChange={setStageFilter}
            />
          </div>
        </div>

        {/* Vertical Enquiry Cards - Mobile & Desktop */}
        <div className="flex w-full min-w-0 flex-col gap-4 p-3 sm:p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No enquiries found.
            </p>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                {/* Customer */}
                <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0">
                    <h4 className="break-words text-base font-bold text-[#10264d]">
                      {item.customer}
                    </h4>

                    <p className="mt-1 break-all text-xs font-medium text-blue-700">
                      {item.id}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openForm(item)}
                      className="rounded-xl bg-blue-50 p-2.5 text-blue-700 transition hover:bg-blue-100"
                      aria-label="Edit enquiry"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-xl bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100"
                      aria-label="Delete enquiry"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 flex min-w-0 flex-col gap-3">
                  <DetailRow
                    label="Phone"
                    value={item.phone}
                  />

                  <DetailRow
                    label="Service"
                    value={item.service}
                  />

                  <DetailRow
                    label="Budget"
                    value={formatMoney(item.budget)}
                  />

                  <DetailRow
                    label="Event Date"
                    value={item.eventDate}
                  />

                  <DetailRow
                    label="Lead Source"
                    value={item.source}
                  />

                  <DetailRow
                    label="Assigned Staff"
                    value={item.owner}
                  />

                  <DetailRow
                    label="Next Follow-up"
                    value={item.nextFollowUp}
                  />

                  <DetailRow
                    label="Notes / Requirements"
                    value={item.notes}
                  />

                  {/* Stage Dropdown */}
                  <div className="w-full min-w-0 pt-1">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Lead Stage
                    </p>

                    <CustomDropdown
                      value={item.stage || "New"}
                      options={stages}
                      onChange={(stage) =>
                        changeStage(item.id, stage)
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add / Edit Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold text-[#10264d] sm:text-xl">
                {editing
                  ? "Edit Enquiry"
                  : "Add Enquiry"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Enter the enquiry details below.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="shrink-0 rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={21} />
            </button>
          </div>

          <form
            onSubmit={save}
            className="flex w-full min-w-0 flex-col gap-5 p-4 sm:p-6"
          >
            {/* Customer Name */}
            <FormField label="Customer Name">
              <input
                type="text"
                value={form.customer}
                onChange={(event) =>
                  updateField(
                    "customer",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                className={fieldClass}
                required
              />
            </FormField>

            {/* Phone */}
            <FormField label="Mobile Number">
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Enter 10-digit mobile number"
                className={fieldClass}
                required
              />
            </FormField>

            {/* Service */}
            <FormField label="Service">
              <CustomDropdown
                value={form.service}
                options={services}
                onChange={(value) =>
                  updateField("service", value)
                }
              />
            </FormField>

            {/* Event Date */}
            <FormField label="Preferred Event Date">
              <input
                type="date"
                value={form.eventDate}
                onChange={(event) =>
                  updateField(
                    "eventDate",
                    event.target.value
                  )
                }
                className={fieldClass}
              />
            </FormField>

            {/* Budget */}
            <FormField label="Budget (INR)">
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={(event) =>
                  updateField(
                    "budget",
                    event.target.value
                  )
                }
                placeholder="Enter budget"
                className={fieldClass}
              />
            </FormField>

            {/* Lead Source */}
            <FormField label="Lead Source">
              <CustomDropdown
                value={form.source}
                options={sources}
                onChange={(value) =>
                  updateField("source", value)
                }
              />
            </FormField>

            {/* Lead Stage */}
            <FormField label="Lead Stage">
              <CustomDropdown
                value={form.stage}
                options={stages}
                onChange={(value) =>
                  updateField("stage", value)
                }
              />
            </FormField>

            {/* Assigned Staff */}
            <FormField label="Assigned Staff">
              <input
                type="text"
                value={form.owner}
                onChange={(event) =>
                  updateField(
                    "owner",
                    event.target.value
                  )
                }
                placeholder="Enter staff name"
                className={fieldClass}
              />
            </FormField>

            {/* Follow-up Date */}
            <FormField label="Next Follow-up">
              <input
                type="date"
                value={form.nextFollowUp}
                onChange={(event) =>
                  updateField(
                    "nextFollowUp",
                    event.target.value
                  )
                }
                className={fieldClass}
              />
            </FormField>

            {/* Notes */}
            <FormField label="Notes / Requirements">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Enter enquiry requirements..."
                className={`${fieldClass} resize-y`}
              />
            </FormField>

            {/* Validation Error */}
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
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4274]"
              >
                {editing
                  ? "Update Enquiry"
                  : "Save Enquiry"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
