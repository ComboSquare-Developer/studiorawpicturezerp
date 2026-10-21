
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  UserRound,
  Camera,
  ClipboardList,
  Save,
  Filter,
  Users,
  IndianRupee,
  FileText,
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
  "block w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100 lg:h-[46px] lg:rounded-[10px] lg:px-3.5 lg:py-2.5";

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStageStyle = (stage) => {
  switch (stage) {
    case "New":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "Contacted":
      return "bg-sky-50 text-sky-700 border-sky-100";
    case "Qualified":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "Quoted":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "Follow-up":
      return "bg-orange-50 text-orange-700 border-orange-100";
    case "Won/Converted":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "Lost":
      return "bg-red-50 text-red-700 border-red-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

/* ==============================
   CUSTOM DROPDOWN
============================== */

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
      className="relative w-full min-w-0"
    >
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

/* ==============================
   SUMMARY CARD
============================== */

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:rounded-[18px] lg:border-[#e5ebf3] lg:p-5 lg:shadow-[0_4px_18px_rgba(16,38,77,0.04)] lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 lg:text-[12px]">
          {title}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-[#10264d] lg:text-[27px]">
          {value}
        </h3>
      </div>

      <div
        className={`shrink-0 rounded-xl p-3 ${
          color || "bg-blue-50 text-blue-700"
        }`}
      >
        <Icon size={21} />
      </div>
    </div>
  );
}

/* ==============================
   MOBILE DETAIL ROW
============================== */

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

/* ==============================
   FORM FIELD
============================== */

function FormField({ label, required = false, children }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block text-sm font-medium text-slate-700 lg:mb-1.5 lg:text-[12px] lg:font-semibold lg:text-[#344767]">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ==============================
   FORM SECTION TITLE
============================== */

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

/* ==============================
   MAIN ENQUIRIES PAGE
============================== */

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (!saved) return demoEnquiries;

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : demoEnquiries;
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

  const modalRef = useRef(null);
  const customerInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(enquiries));
  }, [enquiries]);

  /* Lock background scroll while modal is open */
  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    customerInputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setEditing(null);
        setError("");
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
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
      stageFilter === "All" || item.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const openForm = (item = null) => {
    previousFocusRef.current = document.activeElement;

    setEditing(item?.id || null);
    setForm(
      item ? { ...emptyForm, ...item } : { ...emptyForm }
    );
    setError("");
    setShowForm(true);
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
        previous.filter((item) => item.id !== id)
      );

      if (editing === id) closeForm();
    }
  };

  const changeStage = (id, stage) => {
    setEnquiries((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, stage } : item
      )
    );
  };

  const counts = [
    {
      title: "Total Enquiries",
      value: enquiries.length,
      icon: PhoneCall,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "New Leads",
      value: enquiries.filter((item) => item.stage === "New").length,
      icon: Clock3,
      color: "bg-violet-50 text-violet-700",
    },
    {
      title: "Follow-ups",
      value: enquiries.filter(
        (item) => item.stage === "Follow-up"
      ).length,
      icon: CalendarDays,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "Converted",
      value: enquiries.filter(
        (item) => item.stage === "Won/Converted"
      ).length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:space-y-7 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">

      {/* PAGE HEADER */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af] lg:block">
            Customer Relationship Management
          </p>

          <h2 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl lg:text-[29px] lg:font-extrabold lg:tracking-[-0.035em]">
            Enquiries & Leads
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 lg:text-[#8491a5]">
            Track customer enquiries, follow-ups and conversions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openForm()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4274] lg:w-auto lg:rounded-xl lg:px-6 lg:shadow-[0_8px_20px_rgba(16,38,77,0.16)] lg:hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Enquiry
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        {counts.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </div>

      {/* ENQUIRIES LIST */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm lg:rounded-[22px] lg:border-[#e5ebf3] lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)]">

        {/* TOOLBAR */}
        <div className="flex w-full min-w-0 flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:border-[#edf1f6] lg:px-6 lg:py-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#10264d]">
              Enquiries List
            </h3>

            <p className="mt-1 hidden text-xs text-slate-400 lg:block">
              {filtered.length} enquiries found
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-4 lg:w-auto lg:flex-row lg:items-end lg:gap-3">
            <div className="relative w-full min-w-0 lg:w-[260px] xl:w-[320px]">
              <Search
                size={18}
                className="absolute left-3 top-3.5 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search enquiries..."
                className={`${fieldClass} pl-10`}
              />
            </div>

            <div className="w-full min-w-0 lg:w-[190px]">
              <p className="mb-2 text-xs font-medium text-slate-500 lg:hidden">
                Filter by Stage
              </p>

              <CustomDropdown
                value={stageFilter}
                options={["All", ...stages]}
                onChange={setStageFilter}
                compact
              />
            </div>
          </div>
        </div>

        {/* MOBILE ENQUIRY CARDS */}
        <div className="flex w-full min-w-0 flex-col gap-4 p-3 sm:p-5 lg:hidden">
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

                <div className="mt-4 flex min-w-0 flex-col gap-3">
                  <DetailRow label="Phone" value={item.phone} />
                  <DetailRow label="Service" value={item.service} />
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

        {/* DESKTOP TABLE */}
        <div className="hidden w-full min-w-0 overflow-x-auto lg:block">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead className="bg-[#f7f9fd]">
              <tr className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8290a5]">
                <th className="px-5 py-4">Enquiry ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Event Date</th>
                <th className="px-5 py-4">Budget</th>
                <th className="px-5 py-4">Lead Source</th>
                <th className="px-5 py-4">Stage</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1f6]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-sm text-slate-400"
                  >
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[#f8faff]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-[#4972a8]">
                      {item.id}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#10264d]">
                            {item.customer}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {item.service || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#52627b]">
                      {formatDate(item.eventDate)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#10264d]">
                      {formatMoney(item.budget)}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {item.source || "—"}
                    </td>

                    <td className="min-w-[160px] px-5 py-4">
                      <div className="relative">
                        <span
                          className={`mb-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStageStyle(
                            item.stage || "New"
                          )}`}
                        >
                          {item.stage || "New"}
                        </span>

                        <CustomDropdown
                          value={item.stage || "New"}
                          options={stages}
                          onChange={(stage) =>
                            changeStage(item.id, stage)
                          }
                          compact
                        />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(item)}
                          aria-label={`Edit ${item.customer}`}
                          className="rounded-lg p-2 text-[#376aa7] transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Delete ${item.customer}`}
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

        {/* LIST FOOTER */}
        <div className="hidden items-center justify-between border-t border-[#edf1f6] px-6 py-4 lg:flex">
          <p className="text-xs text-[#8290a5]">
            Showing {filtered.length} of {enquiries.length} enquiries
          </p>

          <span className="text-xs text-[#8290a5]">
            Studio Raw Picturez CRM
          </span>
        </div>
      </section>

      {/* CENTERED ADD / EDIT MODAL */}
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
              aria-labelledby="enquiry-modal-title"
              className="flex max-h-[calc(100dvh-24px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-40px)] lg:max-w-[800px] lg:rounded-[18px]"
            >
              {/* MODAL HEADER */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e9eef5] px-5 py-4 sm:px-7 lg:px-8 lg:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                    {editing ? (
                      <Pencil size={19} />
                    ) : (
                      <Plus size={21} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="enquiry-modal-title"
                      className="text-lg font-bold text-[#10264d] lg:text-[19px]"
                    >
                      {editing
                        ? "Edit Enquiry"
                        : "Add New Enquiry"}
                    </h3>

                    <p className="mt-1 text-xs text-[#8491a5]">
                      {editing
                        ? "Update customer enquiry information"
                        : "Capture and manage customer enquiries"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close enquiry popup"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#10264d]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form
                id="enquiry-form"
                onSubmit={save}
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* SCROLLABLE FORM BODY */}
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 lg:space-y-5 lg:px-8 lg:py-6">

                  {/* CUSTOMER INFORMATION */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={Users}
                      title="Customer Information"
                    />

                    <FormField label="Customer Name" required>
                      <input
                        ref={customerInputRef}
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

                    <FormField label="Mobile Number" required>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={form.phone}
                        onChange={(event) =>
                          updateField(
                            "phone",
                            event.target.value.replace(/\D/g, "")
                          )
                        }
                        placeholder="Enter 10-digit mobile number"
                        className={fieldClass}
                        required
                      />
                    </FormField>

                    <FormField label="Lead Source">
                      <CustomDropdown
                        value={form.source}
                        options={sources}
                        onChange={(value) =>
                          updateField("source", value)
                        }
                        compact
                      />
                    </FormField>

                    <FormField label="Assigned Staff">
                      <input
                        type="text"
                        value={form.owner}
                        onChange={(event) =>
                          updateField("owner", event.target.value)
                        }
                        placeholder="Enter staff name"
                        className={fieldClass}
                      />
                    </FormField>
                  </div>

                  {/* EVENT DETAILS */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={Camera}
                      title="Event Details"
                    />

                    <FormField label="Photography Service">
                      <CustomDropdown
                        value={form.service}
                        options={services}
                        onChange={(value) =>
                          updateField("service", value)
                        }
                        compact
                      />
                    </FormField>

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

                    <FormField label="Budget (INR)">
                      <input
                        type="number"
                        min="0"
                        value={form.budget}
                        onChange={(event) =>
                          updateField("budget", event.target.value)
                        }
                        placeholder="Enter estimated budget"
                        className={fieldClass}
                      />
                    </FormField>

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
                  </div>

                  {/* LEAD MANAGEMENT */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={ClipboardList}
                      title="Lead Management"
                    />

                    <FormField label="Lead Stage">
                      <CustomDropdown
                        value={form.stage}
                        options={stages}
                        onChange={(value) =>
                          updateField("stage", value)
                        }
                        compact
                      />
                    </FormField>

                    <div className="hidden md:block" />

                    <div className="md:col-span-2">
                      <FormField label="Notes / Requirements">
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(event) =>
                            updateField(
                              "notes",
                              event.target.value
                            )
                          }
                          placeholder="Enter enquiry requirements or special notes..."
                          className={`${fieldClass} h-auto resize-y lg:h-auto lg:min-h-[85px]`}
                        />
                      </FormField>
                    </div>
                  </div>

                  {/* ERROR */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* FIXED MODAL FOOTER */}
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b467e] sm:w-auto"
                  >
                    <Save size={17} />
                    {editing
                      ? "Update Enquiry"
                      : "Save Enquiry"}
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
