
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  PhoneCall,
  CheckCircle2,
  CalendarDays,
  ChevronDown,
  Check,
  UserRound,
  Camera,
  ClipboardList,
  Save,
  Users,
  Phone,
  CalendarClock,
  MessageSquareText,
  ArrowUpRight,
  Filter,
  Inbox,
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

// DUMMY DATA
const dummyEnquiries = [
  {
    id: "ENQ-1001",
    customer: "Arun Kumar",
    phone: "9876543210",
    service: "Wedding Photography",
    eventDate: "2026-11-15",
    budget: "45000",
    source: "Instagram",
    stage: "New",
    owner: "Ravi",
    nextFollowUp: "2026-10-25",
    notes: "Wedding photography and candid coverage required.",
  },
  {
    id: "ENQ-1002",
    customer: "Priya S",
    phone: "9876543211",
    service: "Pre-Wedding Shoot",
    eventDate: "2026-11-20",
    budget: "25000",
    source: "Referral",
    stage: "Contacted",
    owner: "Karthik",
    nextFollowUp: "2026-10-26",
    notes: "Outdoor pre-wedding shoot.",
  },
  {
    id: "ENQ-1003",
    customer: "Vijay Raj",
    phone: "9876543212",
    service: "Event Photography",
    eventDate: "2026-12-05",
    budget: "18000",
    source: "WhatsApp",
    stage: "Qualified",
    owner: "Ravi",
    nextFollowUp: "2026-10-27",
    notes: "Birthday event photography.",
  },
  {
    id: "ENQ-1004",
    customer: "Meena Devi",
    phone: "9876543213",
    service: "Maternity Photography",
    eventDate: "2026-11-28",
    budget: "12000",
    source: "Website",
    stage: "Quoted",
    owner: "Priya",
    nextFollowUp: "2026-10-28",
    notes: "Indoor maternity photoshoot.",
  },
  {
    id: "ENQ-1005",
    customer: "Sanjay Kumar",
    phone: "9876543214",
    service: "Studio Portrait",
    eventDate: "2026-11-10",
    budget: "5000",
    source: "Walk-in",
    stage: "Follow-up",
    owner: "Karthik",
    nextFollowUp: "2026-10-24",
    notes: "Family portrait session.",
  },
  {
    id: "ENQ-1006",
    customer: "Divya R",
    phone: "9876543215",
    service: "Wedding Photography",
    eventDate: "2026-12-12",
    budget: "65000",
    source: "Instagram",
    stage: "Won/Converted",
    owner: "Ravi",
    nextFollowUp: "",
    notes: "Wedding package confirmed.",
  },
  {
    id: "ENQ-1007",
    customer: "Karthik M",
    phone: "9876543216",
    service: "Videography",
    eventDate: "2026-12-18",
    budget: "30000",
    source: "Referral",
    stage: "Lost",
    owner: "Priya",
    nextFollowUp: "",
    notes: "Customer chose another provider.",
  },
];

const fieldClass =
  "block w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100";

const formatMoney = (value) =>
  value === "" || value == null
    ? "—"
    : `₹${Number(value || 0).toLocaleString("en-IN")}`;

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

const stageStyles = {
  New: "bg-blue-50 text-blue-700 border-blue-100",
  Contacted: "bg-sky-50 text-sky-700 border-sky-100",
  Qualified: "bg-violet-50 text-violet-700 border-violet-100",
  Quoted: "bg-amber-50 text-amber-700 border-amber-100",
  "Follow-up": "bg-orange-50 text-orange-700 border-orange-100",
  "Won/Converted": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Lost: "bg-red-50 text-red-700 border-red-100",
};

const getStageStyle = (stage) =>
  stageStyles[stage] || "bg-slate-50 text-slate-600 border-slate-200";

function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select option",
  compact = false,
  status = false,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState(null);

  useEffect(() => {
    if (!open) return;

    const closeOutside = (event) => {
      if (
        !dropdownRef.current?.contains(event.target) &&
        !event.target.closest?.("[data-enquiry-dropdown-menu]")
      ) {
        setOpen(false);
      }
    };

    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const closeOnScroll = () => setOpen(false);

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [open]);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuHeight = Math.min(options.length * 41 + 12, 230);
      const openUp =
        window.innerHeight - rect.bottom < menuHeight &&
        rect.top > menuHeight;

      setMenuPosition({
        top: openUp
          ? Math.max(8, rect.top - menuHeight - 6)
          : rect.bottom + 6,
        left: Math.max(
          8,
          Math.min(
            rect.left,
            window.innerWidth - Math.max(rect.width, 175) - 8
          )
        ),
        width: Math.max(rect.width, 175),
      });
    }

    setOpen((previous) => !previous);
  };

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full min-w-0 items-center justify-between gap-1.5 border text-left font-semibold outline-none transition focus:ring-2 focus:ring-blue-100 ${
          status
            ? `rounded-lg px-2 py-2 text-[10px] xl:px-2.5 xl:text-[11px] ${getStageStyle(value)}`
            : `rounded-xl border-[#dce4ef] bg-white px-3.5 py-3 text-sm text-[#10264d] hover:border-blue-300 ${
                compact ? "min-h-[44px]" : ""
              }`
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        menuPosition &&
        createPortal(
          <div
            data-enquiry-dropdown-menu
            role="listbox"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              maxHeight: 230,
              zIndex: 9999,
            }}
            className="overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white p-1.5 shadow-[0_15px_40px_rgba(16,38,77,0.15)]"
          >
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={value === option}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${
                  value === option
                    ? "bg-blue-50 font-bold text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{option}</span>
                {value === option && <Check size={14} />}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-[0_4px_18px_rgba(16,38,77,0.04)] transition hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {title}
        </p>
        <h3 className="mt-2 text-2xl font-bold text-[#10264d]">
          {value}
        </h3>
      </div>
      <div className={`shrink-0 rounded-xl p-3 ${color}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-xs font-semibold text-[#344767]">
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
      <h4 className="text-[13px] font-bold text-[#10264d]">{title}</h4>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] text-slate-400">
        <Icon size={13} />
        {label}
      </div>
      <p className="break-words text-xs font-semibold text-[#243b60]">
        {value || "—"}
      </p>
    </div>
  );
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState(() => {
    try {
      const saved = localStorage.getItem(KEY);

      if (saved !== null) {
        const parsed = JSON.parse(saved);

        // Existing non-empty data is preserved.
        // Empty or invalid data is replaced with dummy data.
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      localStorage.setItem(KEY, JSON.stringify(dummyEnquiries));
      return dummyEnquiries;
    } catch {
      return dummyEnquiries;
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
    try {
      localStorage.setItem(KEY, JSON.stringify(enquiries));
    } catch (error) {
      console.error("Unable to save enquiries:", error);
    }
  }, [enquiries]);

  useEffect(() => {
    if (!showForm) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    customerInputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
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

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return enquiries.filter((item) => {
      const matchesSearch = [
        item.customer,
        item.phone,
        item.service,
        item.id,
        item.source,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        matchesSearch &&
        (stageFilter === "All" || item.stage === stageFilter)
      );
    });
  }, [enquiries, search, stageFilter]);

  const counts = [
    {
      title: "Total Enquiries",
      value: enquiries.length,
      icon: PhoneCall,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Follow-ups",
      value: enquiries.filter((item) => item.stage === "Follow-up").length,
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

  const openForm = (item = null) => {
    previousFocusRef.current = document.activeElement;
    setEditing(item?.id || null);
    setForm(item ? { ...emptyForm, ...item } : { ...emptyForm });
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
      setError("Enter customer name and valid 10-digit mobile number.");
      return;
    }

    const updatedForm = { ...form, customer, phone };

    if (editing) {
      setEnquiries((previous) =>
        previous.map((item) =>
          item.id === editing ? { ...item, ...updatedForm } : item
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
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
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

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 overflow-x-hidden bg-[#f5f7fb] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7e93af]">
            Customer Relationship Management
          </p>
          <h2 className="text-2xl font-extrabold text-[#10264d] lg:text-[29px]">
            Enquiries & Leads
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage enquiries, follow-ups and lead conversions.
          </p>
        </div>

        {/* Existing Add Enquiry button remains unchanged */}
        {/* <button
          type="button"
          onClick={() => openForm()}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4274]"
        >
          <Plus size={18} />
          Add Enquiry
        </button> */}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {counts.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </div>

      {/* ENQUIRIES LIST */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_4px_24px_rgba(16,38,77,0.035)]">
        <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
          <div>
            <h3 className="text-lg font-bold text-[#10264d]">
              Enquiries List
            </h3>
            <p className="mt-1 text-xs text-[#8b99ae]">
              {filtered.length} enquiries found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[260px] xl:w-[300px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search enquiries..."
                className="h-11 w-full rounded-xl border border-[#dce4ef] bg-white pl-10 pr-4 text-sm text-[#10264d] outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 sm:w-[190px]">
              <Filter
                size={16}
                className="shrink-0 text-slate-400 sm:hidden"
              />
              <div className="min-w-0 flex-1">
                <CustomDropdown
                  value={stageFilter}
                  options={["All", ...stages]}
                  onChange={setStageFilter}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden w-full min-w-0 lg:block">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col style={{ width: "10%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "6%" }} />
            </colgroup>

            <thead>
              <tr className="border-b border-[#e9eef5] bg-[#f8fafd]">
                {[
                  "Enquiry ID",
                  "Customer",
                  "Service",
                  "Event Date",
                  "Budget",
                  "Source",
                  "Stage",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`break-words px-2 py-3 text-[10px] font-bold uppercase tracking-[0.02em] text-[#8290a5] xl:px-3 xl:text-[11px] ${
                      heading === "Actions" ? "text-center" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#edf1f6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Inbox size={36} className="mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No enquiries found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="px-2 py-3 align-middle xl:px-3">
                      <span className="block break-all text-[10px] font-bold text-[#376aa7] xl:text-xs">
                        {item.id}
                      </span>
                    </td>

                    <td className="px-2 py-3 align-middle xl:px-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a] xl:flex">
                          <UserRound size={16} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-bold text-[#10264d] xl:text-[13px]"
                            title={item.customer}
                          >
                            {item.customer}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-[#8b99ae] xl:text-[11px]">
                            {item.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-3 align-middle xl:px-3">
                      <p
                        className="line-clamp-2 break-words text-xs leading-5 text-[#52627b]"
                        title={item.service}
                      >
                        {item.service || "—"}
                      </p>
                    </td>

                    <td className="px-2 py-3 align-middle xl:px-3">
                      <p className="text-[11px] leading-5 text-[#52627b] xl:text-xs">
                        {formatDate(item.eventDate)}
                      </p>
                    </td>

                    <td className="px-2 py-3 align-middle xl:px-3">
                      <p className="break-words text-[11px] font-bold text-[#10264d] xl:text-xs">
                        {formatMoney(item.budget)}
                      </p>
                    </td>

                    <td className="px-2 py-3 align-middle xl:px-3">
                      <p className="break-words text-xs text-[#52627b]">
                        {item.source || "—"}
                      </p>
                    </td>

                    <td className="px-1 py-3 align-middle xl:px-2">
                      <CustomDropdown
                        value={item.stage || "New"}
                        options={stages}
                        onChange={(stage) => changeStage(item.id, stage)}
                        status
                      />
                    </td>

                    <td className="px-0.5 py-3 align-middle">
                      <div className="flex items-center justify-center gap-0">
                        <button
                          type="button"
                          onClick={() => openForm(item)}
                          title="Edit enquiry"
                          aria-label={`Edit ${item.customer}`}
                          className="rounded-md p-1 text-[#376aa7] transition hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          title="Delete enquiry"
                          aria-label={`Delete ${item.customer}`}
                          className="rounded-md p-1 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE / TABLET CARDS */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-full flex flex-col items-center py-12 text-slate-400">
              <Inbox size={34} className="mb-3 text-slate-300" />
              <p className="text-sm">No enquiries found</p>
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className="min-w-0 rounded-xl border border-[#e5ebf3] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3fc] text-[#315f9a]">
                      <UserRound size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#10264d]">
                        {item.customer}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-[#4972a8]">
                        {item.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openForm(item)}
                      aria-label={`Edit ${item.customer}`}
                      className="rounded-lg bg-blue-50 p-2 text-blue-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      aria-label={`Delete ${item.customer}`}
                      className="rounded-lg bg-red-50 p-2 text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-[#10264d]">
                    {formatMoney(item.budget)}
                  </span>
                  <div className="w-[145px] max-w-[55%]">
                    <CustomDropdown
                      value={item.stage || "New"}
                      options={stages}
                      onChange={(stage) => changeStage(item.id, stage)}
                      status
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4">
                  <DetailItem icon={Phone} label="Phone" value={item.phone} />
                  <DetailItem
                    icon={CalendarDays}
                    label="Event Date"
                    value={formatDate(item.eventDate)}
                  />
                  <DetailItem
                    icon={Camera}
                    label="Service"
                    value={item.service}
                  />
                  <DetailItem
                    icon={ArrowUpRight}
                    label="Lead Source"
                    value={item.source}
                  />
                  <DetailItem
                    icon={UserRound}
                    label="Assigned Staff"
                    value={item.owner}
                  />
                  <DetailItem
                    icon={CalendarClock}
                    label="Follow-up"
                    value={formatDate(item.nextFollowUp)}
                  />
                </div>

                {item.notes && (
                  <div className="mt-4 rounded-lg bg-[#f7f9fd] p-3">
                    <DetailItem
                      icon={MessageSquareText}
                      label="Notes"
                      value={item.notes}
                    />
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-1 border-t border-[#edf1f6] px-4 py-4 text-xs text-[#8290a5] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            Showing {filtered.length} of {enquiries.length} enquiries
          </p>
          <span>Studio Raw Picturez CRM</span>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      {showForm &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/65 p-3 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeForm();
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="enquiry-modal-title"
              className="flex max-h-[calc(100dvh-24px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-40px)]"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e9eef5] px-5 py-4 sm:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                    {editing ? <Pencil size={19} /> : <Plus size={21} />}
                  </div>
                  <div className="min-w-0">
                    <h3
                      id="enquiry-modal-title"
                      className="text-lg font-bold text-[#10264d]"
                    >
                      {editing ? "Edit Enquiry" : "Add New Enquiry"}
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          updateField("customer", event.target.value)
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
                        onChange={(value) => updateField("source", value)}
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

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormSectionTitle
                      icon={Camera}
                      title="Event Details"
                    />

                    <FormField label="Photography Service">
                      <CustomDropdown
                        value={form.service}
                        options={services}
                        onChange={(value) => updateField("service", value)}
                      />
                    </FormField>

                    <FormField label="Preferred Event Date">
                      <input
                        type="date"
                        value={form.eventDate}
                        onChange={(event) =>
                          updateField("eventDate", event.target.value)
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
                          updateField("nextFollowUp", event.target.value)
                        }
                        className={fieldClass}
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormSectionTitle
                      icon={ClipboardList}
                      title="Lead Management"
                    />

                    <FormField label="Lead Stage">
                      <CustomDropdown
                        value={form.stage}
                        options={stages}
                        onChange={(value) => updateField("stage", value)}
                      />
                    </FormField>

                    <div className="hidden md:block" />

                    <div className="md:col-span-2">
                      <FormField label="Notes / Requirements">
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(event) =>
                            updateField("notes", event.target.value)
                          }
                          placeholder="Enter enquiry requirements or special notes..."
                          className={`${fieldClass} min-h-[85px] resize-y`}
                        />
                      </FormField>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-xl border border-[#dce4ef] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] hover:bg-[#eef3f9]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b467e]"
                  >
                    <Save size={17} />
                    {editing ? "Update Enquiry" : "Save Enquiry"}
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
