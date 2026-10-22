
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  Eye,
  ChevronDown,
  Check,
  UserCheck,
  UserX,
  UserRound,
  ShieldCheck,
  Save,
  ContactRound,
  FileText,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Languages,
  MessageSquare,
} from "lucide-react";

const STORAGE_KEY = "studio_raw_customers";

const initialCustomers = [
  {
    id: "CUS-1001",
    name: "Arun Kumar",
    phone: "9876543210",
    email: "arun@example.com",
    address: "Nagercoil",
    source: "Instagram",
    language: "Tamil",
    consent: true,
    status: "Active",
    createdAt: "2026-10-12",
    notes: "Wedding photography enquiry",
  },
  {
    id: "CUS-1002",
    name: "Priya",
    phone: "9876501234",
    email: "priya@example.com",
    address: "Chennai",
    source: "Referral",
    language: "English",
    consent: true,
    status: "Active",
    createdAt: "2026-10-15",
    notes: "Maternity photography",
  },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  source: "Instagram",
  language: "Tamil",
  consent: false,
  status: "Active",
  notes: "",
};

const sources = [
  "Instagram",
  "Referral",
  "Website",
  "Walk-in",
  "WhatsApp",
  "Other",
];

const languages = [
  "Tamil",
  "English",
  "Malayalam",
  "Other",
];

const statuses = ["Active", "Inactive"];

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100 lg:h-[46px] lg:rounded-[10px] lg:px-3.5 lg:py-2.5";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* CUSTOM DROPDOWN */

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
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#dce4ef] bg-white px-3 py-2.5 text-left text-xs font-medium text-[#10264d] transition hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:text-sm ${
          compact
            ? "lg:h-[46px] lg:rounded-[10px] lg:px-3.5 lg:py-2.5"
            : ""
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
        </span>

        <ChevronDown
          size={16}
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
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition sm:text-sm ${
                  selected
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 break-words">
                  {option}
                </span>

                {selected && (
                  <Check size={15} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* COMPACT MOBILE DETAIL */

function MobileDetail({
  icon: Icon,
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border border-[#edf1f6] bg-[#f8fafd] p-3 ${
        full ? "col-span-2" : ""
      }`}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-[#7890af]"
          />
        )}

        <p className="min-w-0 text-[10px] font-medium text-[#8491a5] sm:text-xs">
          {label}
        </p>
      </div>

      <p className="min-w-0 break-words text-xs font-semibold leading-5 text-[#10264d] sm:text-sm">
        {value === "" || value == null ? "—" : value}
      </p>
    </div>
  );
}

/* MODAL DETAIL */

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

/* FORM FIELD */

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

/* FORM SECTION */

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

/* SUMMARY CARD */

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:rounded-[18px] lg:border-[#e5ebf3] lg:p-5 lg:shadow-[0_4px_18px_rgba(16,38,77,0.04)] lg:transition-all lg:hover:-translate-y-0.5 lg:hover:shadow-md">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 lg:text-[12px]">
          {title}
        </p>

        <h3 className="mt-2 text-2xl font-bold text-[#10264d] lg:text-[27px]">
          {value}
        </h3>
      </div>

      <div
        className={`shrink-0 rounded-xl p-2.5 lg:p-3 ${
          color || "bg-blue-50 text-blue-700"
        }`}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

/* MAIN PAGE */

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return initialCustomers;

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed)
        ? parsed
        : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [error, setError] = useState("");

  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

  const modalOpen = showForm || Boolean(viewingId);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (showForm) {
      firstInputRef.current?.focus();
    } else {
      modalRef.current?.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
        setViewingId(null);
        setEditing(null);
        setError("");
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (element) => element.getClientRects().length > 0
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
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
  }, [modalOpen, showForm]);

  const filtered = customers.filter((customer) => {
    const matchesSearch = [
      customer.name,
      customer.phone,
      customer.email,
      customer.id,
      customer.address,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );

    return (
      matchesSearch &&
      (filter === "All" || customer.status === filter)
    );
  });

  const viewing = customers.find(
    (customer) => customer.id === viewingId
  );

  const openAdd = () => {
    previousFocusRef.current = document.activeElement;

    setEditing(null);
    setViewingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowForm(true);
  };

  const openEdit = (customer) => {
    previousFocusRef.current = document.activeElement;

    setEditing(customer.id);
    setViewingId(null);
    setForm({
      ...emptyForm,
      ...customer,
    });
    setError("");
    setShowForm(true);
  };

  const openView = (customer) => {
    previousFocusRef.current = document.activeElement;

    setShowForm(false);
    setEditing(null);
    setViewingId(customer.id);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const closeView = () => {
    setViewingId(null);
  };

  const updateField = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveCustomer = (event) => {
    event.preventDefault();

    const name = String(form.name || "").trim();
    const phone = String(form.phone || "").trim();

    if (!name || !/^\d{10}$/.test(phone)) {
      setError(
        "Enter customer name and valid 10-digit phone number."
      );
      return;
    }

    if (
      customers.some(
        (customer) =>
          customer.phone === phone &&
          customer.id !== editing
      )
    ) {
      setError(
        "A customer with this phone number already exists."
      );
      return;
    }

    const updatedForm = {
      ...form,
      name,
      phone,
    };

    if (editing) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editing
            ? { ...customer, ...updatedForm }
            : customer
        )
      );
    } else {
      const customer = {
        ...updatedForm,
        id: `CUS-${Date.now()}`,
        createdAt: new Date()
          .toISOString()
          .slice(0, 10),
      };

      setCustomers((previous) => [
        customer,
        ...previous,
      ]);
    }

    closeForm();
  };

  const deleteCustomer = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this customer?"
      )
    ) {
      return;
    }

    setCustomers((previous) =>
      previous.filter((customer) => customer.id !== id)
    );

    if (viewingId === id) {
      setViewingId(null);
    }

    if (editing === id) {
      closeForm();
    }
  };

  const changeStatus = (id, status) => {
    setCustomers((previous) =>
      previous.map((customer) =>
        customer.id === id
          ? { ...customer, status }
          : customer
      )
    );
  };

  const counts = [
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Active Customers",
      value: customers.filter(
        (customer) => customer.status === "Active"
      ).length,
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Inactive Customers",
      value: customers.filter(
        (customer) => customer.status === "Inactive"
      ).length,
      icon: UserX,
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-5 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:space-y-7 lg:bg-[#f5f7fb] lg:px-8 lg:py-8 2xl:px-10">

      {/* PAGE HEADING */}
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="mb-2 hidden text-[11px] font-bold uppercase tracking-[0.17em] text-[#7e93af] lg:block">
            Customer Relationship Management
          </p>

          <h2 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl lg:text-[29px] lg:font-extrabold lg:tracking-[-0.035em]">
            Customer Management
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500 lg:text-[#8491a5]">
            Manage studio customers and contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4274] lg:w-auto lg:px-6 lg:shadow-[0_8px_20px_rgba(16,38,77,0.16)] lg:hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {counts.map((item, index) => (
          <div
            key={item.title}
            className={index === 0 ? "col-span-2 lg:col-span-1" : ""}
          >
            <SummaryCard {...item} />
          </div>
        ))}
      </div>

      {/* CUSTOMER LIST */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm lg:rounded-[22px] lg:border-[#e5ebf3] lg:shadow-[0_5px_24px_rgba(16,38,77,0.045)]">

        {/* TOOLBAR */}
        <div className="flex w-full min-w-0 flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-5 lg:border-[#edf1f6] lg:px-6 lg:py-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-[#10264d]">
              Customers List
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {filtered.length} customers found
            </p>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row lg:w-auto lg:items-end">
            <div className="relative w-full min-w-0 lg:w-[270px] xl:w-[330px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, email or ID..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <div className="w-full min-w-0 sm:w-[180px] lg:w-[175px]">
              <p className="mb-2 text-xs font-medium text-slate-500 lg:hidden">
                Filter by Status
              </p>

              <CustomDropdown
                value={filter}
                options={["All", ...statuses]}
                onChange={setFilter}
                compact
              />
            </div>
          </div>
        </div>

        {/* COMPACT MOBILE CUSTOMER CARDS */}
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:hidden">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Users
                size={32}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="text-sm font-medium text-slate-500">
                No customers found.
              </p>
            </div>
          ) : (
            filtered.map((customer) => (
              <article
                key={customer.id}
                className="min-w-0 rounded-2xl border border-[#e5ebf3] bg-white p-3.5 shadow-[0_3px_14px_rgba(16,38,77,0.035)] sm:p-4"
              >
                {/* CARD HEADER */}
                <div className="flex min-w-0 items-start justify-between gap-2 border-b border-[#edf1f6] pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3fc] text-[#315f9a]">
                      <UserRound size={19} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-[#10264d]">
                        {customer.name || "Unnamed Customer"}
                      </h4>

                      <p className="mt-0.5 truncate text-[11px] font-medium text-[#4972a8]">
                        {customer.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openView(customer)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700 transition hover:bg-blue-100"
                      aria-label="View customer"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition hover:bg-amber-100"
                      aria-label="Edit customer"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCustomer(customer.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                      aria-label="Delete customer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* CUSTOMER STATUS */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-500">
                    Customer Status
                  </span>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      customer.status === "Inactive"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {customer.status || "Active"}
                  </span>
                </div>

                {/* 2 COLUMN DETAILS */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MobileDetail
                    icon={Phone}
                    label="Phone"
                    value={customer.phone}
                  />

                  <MobileDetail
                    icon={Mail}
                    label="Email"
                    value={customer.email}
                  />

                  <MobileDetail
                    icon={MapPin}
                    label="Location"
                    value={customer.address}
                  />

                  <MobileDetail
                    icon={Users}
                    label="Lead Source"
                    value={customer.source}
                  />

                  <MobileDetail
                    icon={Languages}
                    label="Language"
                    value={customer.language}
                  />

                  <MobileDetail
                    icon={CalendarDays}
                    label="Joined Date"
                    value={formatDate(customer.createdAt)}
                  />

                  <MobileDetail
                    icon={ShieldCheck}
                    label="Consent"
                    value={customer.consent ? "Yes" : "No"}
                  />

                  <MobileDetail
                    icon={MessageSquare}
                    label="Notes"
                    value={customer.notes}
                  />
                </div>

                {/* STATUS DROPDOWN */}
                <div className="mt-3 border-t border-[#edf1f6] pt-3">
                  <CustomDropdown
                    value={customer.status || "Active"}
                    options={statuses}
                    onChange={(status) =>
                      changeStatus(customer.id, status)
                    }
                  />
                </div>
              </article>
            ))
          )}
        </div>

        {/* DESKTOP TABLE - EXISTING DESIGN */}
        <div className="hidden w-full min-w-0 overflow-x-auto lg:block">
          <table className="w-full min-w-[950px] border-collapse text-left">
            <thead className="bg-[#f7f9fd]">
              <tr className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#8290a5]">
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Customer ID</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Lead Source</th>
                <th className="px-5 py-4">Joined Date</th>
                <th className="px-5 py-4">Status</th>
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
                    No customers found.
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-[#f8faff]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] text-[#315f9a]">
                          <UserRound size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-[#10264d]">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {customer.language || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-xs font-bold text-[#4972a8]">
                      {customer.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm text-[#52627b]">
                        {customer.phone || "—"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {customer.email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {customer.address || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-[#52627b]">
                      {customer.source || "—"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-[#52627b]">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="min-w-[145px] px-5 py-4">
                      <span
                        className={`mb-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                          customer.status === "Inactive"
                            ? "border-rose-100 bg-rose-50 text-rose-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {customer.status || "Active"}
                      </span>

                      <CustomDropdown
                        value={customer.status || "Active"}
                        options={statuses}
                        onChange={(status) =>
                          changeStatus(customer.id, status)
                        }
                        compact
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openView(customer)}
                          aria-label={`View ${customer.name}`}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          aria-label={`Edit ${customer.name}`}
                          className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCustomer(customer.id)}
                          aria-label={`Delete ${customer.name}`}
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
            Showing {filtered.length} of {customers.length} customers
          </p>

          <span className="text-xs text-[#8290a5]">
            Studio Raw Picturez CRM
          </span>
        </div>
      </section>

      {/* ADD / EDIT CUSTOMER MODAL */}
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
              aria-labelledby="customer-modal-title"
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
                      id="customer-modal-title"
                      className="text-lg font-bold text-[#10264d] lg:text-[19px]"
                    >
                      {editing
                        ? "Edit Customer"
                        : "Add New Customer"}
                    </h3>

                    <p className="mt-1 text-xs text-[#8491a5]">
                      {editing
                        ? "Update customer profile information"
                        : "Create a new customer profile"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close customer popup"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#10264d]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* FORM */}
              <form
                onSubmit={saveCustomer}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 lg:space-y-5 lg:px-8 lg:py-6">

                  {/* BASIC INFORMATION */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={ContactRound}
                      title="Basic Information"
                    />

                    <FormField label="Customer Name" required>
                      <input
                        ref={firstInputRef}
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          updateField("name", event.target.value)
                        }
                        placeholder="Enter customer name"
                        className={inputClass}
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
                        className={inputClass}
                        required
                      />
                    </FormField>

                    <FormField label="Email Address">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="Enter email address"
                        className={inputClass}
                      />
                    </FormField>

                    <FormField label="Location / Address">
                      <input
                        type="text"
                        value={form.address}
                        onChange={(event) =>
                          updateField("address", event.target.value)
                        }
                        placeholder="Enter location or address"
                        className={inputClass}
                      />
                    </FormField>
                  </div>

                  {/* CUSTOMER PREFERENCES */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={Users}
                      title="Customer Preferences"
                    />

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

                    <FormField label="Preferred Language">
                      <CustomDropdown
                        value={form.language}
                        options={languages}
                        onChange={(value) =>
                          updateField("language", value)
                        }
                        compact
                      />
                    </FormField>

                    <FormField label="Customer Status">
                      <CustomDropdown
                        value={form.status}
                        options={statuses}
                        onChange={(value) =>
                          updateField("status", value)
                        }
                        compact
                      />
                    </FormField>

                    <div className="hidden md:block" />
                  </div>

                  {/* NOTES & CONSENT */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-x-5 lg:gap-y-4">
                    <FormSectionTitle
                      icon={FileText}
                      title="Notes & Communication"
                    />

                    <div className="md:col-span-2">
                      <FormField label="Customer Notes">
                        <textarea
                          rows={3}
                          value={form.notes}
                          onChange={(event) =>
                            updateField("notes", event.target.value)
                          }
                          placeholder="Enter customer notes..."
                          className={`${inputClass} h-auto resize-y lg:h-auto lg:min-h-[85px]`}
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-[#e3eaf4] bg-[#f8fafd] p-4">
                        <input
                          type="checkbox"
                          checked={Boolean(form.consent)}
                          onChange={(event) =>
                            updateField(
                              "consent",
                              event.target.checked
                            )
                          }
                          className="mt-1 h-4 w-4 shrink-0 accent-[#10264d]"
                        />

                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-semibold text-[#10264d]">
                            <ShieldCheck size={17} />
                            Communication Consent
                          </span>

                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            Customer has consented to receive communications.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* MODAL FOOTER */}
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
                      ? "Update Customer"
                      : "Save Customer"}
                  </button>
                </div>
              </form>
            </section>
          </div>,
          document.body
        )}

      {/* VIEW CUSTOMER MODAL */}
      {viewing &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07172d]/65 p-3 backdrop-blur-[3px] sm:p-5"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeView();
              }
            }}
          >
            <section
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-view-title"
              tabIndex={-1}
              className="flex max-h-[calc(100dvh-24px)] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-40px)]"
            >
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#e9eef5] px-5 py-5 sm:px-7">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
                    <UserRound size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      id="customer-view-title"
                      className="text-lg font-bold text-[#10264d]"
                    >
                      Customer Details
                    </h3>

                    <p className="mt-1 text-xs font-medium text-[#4972a8]">
                      {viewing.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeView}
                  aria-label="Close customer details"
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
                <div className="mb-5 flex items-center gap-4 rounded-xl bg-[#f5f8fd] p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e3edfa] text-[#315f9a]">
                    <UserRound size={24} />
                  </div>

                  <div className="min-w-0">
                    <h4 className="break-words text-lg font-bold text-[#10264d]">
                      {viewing.name}
                    </h4>

                    <span
                      className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        viewing.status === "Inactive"
                          ? "bg-rose-50 text-rose-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {viewing.status || "Active"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailRow
                    label="Customer Name"
                    value={viewing.name}
                  />
                  <DetailRow
                    label="Mobile Number"
                    value={viewing.phone}
                  />
                  <DetailRow
                    label="Email Address"
                    value={viewing.email}
                  />
                  <DetailRow
                    label="Location / Address"
                    value={viewing.address}
                  />
                  <DetailRow
                    label="Lead Source"
                    value={viewing.source}
                  />
                  <DetailRow
                    label="Preferred Language"
                    value={viewing.language}
                  />
                  <DetailRow
                    label="Customer Status"
                    value={viewing.status}
                  />
                  <DetailRow
                    label="Created Date"
                    value={formatDate(viewing.createdAt)}
                  />
                  <DetailRow
                    label="Communication Consent"
                    value={viewing.consent ? "Yes" : "No"}
                  />

                  <div className="sm:col-span-2">
                    <DetailRow
                      label="Notes"
                      value={viewing.notes}
                    />
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end border-t border-[#e9eef5] px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={closeView}
                  className="w-full rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1b467e] sm:w-auto"
                >
                  Close Details
                </button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}
