
import { useEffect, useRef, useState } from "react";
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
  "block w-full min-w-0 max-w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

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

function SummaryCard({
  title,
  value,
  icon: Icon,
}) {
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

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return initialCustomers;
      }

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

  const formRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(customers)
    );
  }, [customers]);

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
      (filter === "All" ||
        customer.status === filter)
    );
  });

  const viewing = customers.find(
    (customer) => customer.id === viewingId
  );

  const scrollToSection = (ref) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openAdd = () => {
    setEditing(null);
    setViewingId(null);
    setForm({ ...emptyForm });
    setError("");
    setShowForm(true);

    scrollToSection(formRef);
  };

  const openEdit = (customer) => {
    setEditing(customer.id);
    setViewingId(null);

    setForm({
      ...emptyForm,
      ...customer,
    });

    setError("");
    setShowForm(true);

    scrollToSection(formRef);
  };

  const openView = (customer) => {
    setShowForm(false);
    setViewingId(customer.id);
    scrollToSection(viewRef);
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
            ? {
                ...customer,
                ...updatedForm,
              }
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
      previous.filter(
        (customer) => customer.id !== id
      )
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
    },
    {
      title: "Active Customers",
      value: customers.filter(
        (customer) =>
          customer.status === "Active"
      ).length,
      icon: UserCheck,
    },
    {
      title: "Inactive Customers",
      value: customers.filter(
        (customer) =>
          customer.status === "Inactive"
      ).length,
      icon: UserX,
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full space-y-6 bg-slate-50 px-3 py-4 text-slate-800 sm:px-6 sm:py-6 lg:px-7">

      {/* Page Heading */}
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold text-[#10264d] sm:text-2xl">
            Customer Management
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Manage studio customers and contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4274]"
        >
          <Plus size={18} />
          Add Customer
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

      {/* Customer List */}
      <section className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Search and Filter */}
        <div className="flex w-full min-w-0 flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <h3 className="text-lg font-bold text-[#10264d]">
            Customers List
          </h3>

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
              placeholder="Search name, phone, email or ID..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <div className="w-full min-w-0">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Filter by Status
            </p>

            <CustomDropdown
              value={filter}
              options={["All", ...statuses]}
              onChange={setFilter}
            />
          </div>
        </div>

        {/* Customer Cards */}
        <div className="flex w-full min-w-0 flex-col gap-4 p-3 sm:p-5">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No customers found.
            </p>
          ) : (
            filtered.map((customer) => (
              <div
                key={customer.id}
                className="w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                {/* Customer Header */}
                <div className="flex min-w-0 items-start justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="min-w-0">
                    <h4 className="break-words text-base font-bold text-[#10264d]">
                      {customer.name}
                    </h4>

                    <p className="mt-1 break-all text-xs font-medium text-blue-700">
                      {customer.id}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openView(customer)}
                      className="rounded-xl bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                      aria-label="View customer"
                    >
                      <Eye size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(customer)}
                      className="rounded-xl bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
                      aria-label="Edit customer"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCustomer(customer.id)
                      }
                      className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      aria-label="Delete customer"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="mt-4 flex flex-col gap-3">
                  <DetailRow
                    label="Mobile Number"
                    value={customer.phone}
                  />

                  <DetailRow
                    label="Email Address"
                    value={customer.email}
                  />

                  <DetailRow
                    label="Location / Address"
                    value={customer.address}
                  />

                  <DetailRow
                    label="Lead Source"
                    value={customer.source}
                  />

                  <DetailRow
                    label="Preferred Language"
                    value={customer.language}
                  />

                  <DetailRow
                    label="Created Date"
                    value={customer.createdAt}
                  />

                  <DetailRow
                    label="Communication Consent"
                    value={
                      customer.consent
                        ? "Yes"
                        : "No"
                    }
                  />

                  <DetailRow
                    label="Notes"
                    value={customer.notes}
                  />

                  {/* Customer Status */}
                  <div className="w-full min-w-0 pt-1">
                    <p className="mb-2 text-xs font-medium text-slate-500">
                      Customer Status
                    </p>

                    <CustomDropdown
                      value={customer.status || "Active"}
                      options={statuses}
                      onChange={(status) =>
                        changeStatus(
                          customer.id,
                          status
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add / Edit Customer Form */}
      {showForm && (
        <section
          ref={formRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div className="min-w-0">
              <h3 className="break-words text-lg font-bold text-[#10264d] sm:text-xl">
                {editing
                  ? "Edit Customer"
                  : "Add New Customer"}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Enter customer details below.
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
            onSubmit={saveCustomer}
            className="flex w-full min-w-0 flex-col gap-5 p-4 sm:p-6"
          >
            <FormField label="Customer Name">
              <input
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter customer name"
                className={inputClass}
                required
              />
            </FormField>

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
                className={inputClass}
                required
              />
            </FormField>

            <FormField label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
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
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Enter location or address"
                className={inputClass}
              />
            </FormField>

            <FormField label="Lead Source">
              <CustomDropdown
                value={form.source}
                options={sources}
                onChange={(value) =>
                  updateField(
                    "source",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Preferred Language">
              <CustomDropdown
                value={form.language}
                options={languages}
                onChange={(value) =>
                  updateField(
                    "language",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Customer Status">
              <CustomDropdown
                value={form.status}
                options={statuses}
                onChange={(value) =>
                  updateField(
                    "status",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Enter customer notes..."
                className={`${inputClass} resize-y`}
              />
            </FormField>

            {/* Consent */}
            <label className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
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

              <span className="min-w-0 text-sm leading-6 text-slate-700">
                Customer has consented to communications
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="break-words text-sm font-medium text-red-600"
              >
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#10264d] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4274]"
              >
                {editing
                  ? "Update Customer"
                  : "Save Customer"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Customer Details View */}
      {viewing && (
        <section
          ref={viewRef}
          className="w-full min-w-0 scroll-mt-24 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#10264d]">
                Customer Details
              </h3>

              <p className="mt-1 break-all text-xs text-blue-700">
                {viewing.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewingId(null)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close details"
            >
              <X size={21} />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-4 sm:p-6">
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
              value={viewing.createdAt}
            />

            <DetailRow
              label="Communication Consent"
              value={
                viewing.consent
                  ? "Yes"
                  : "No"
              }
            />

            <DetailRow
              label="Notes"
              value={viewing.notes}
            />

            <button
              type="button"
              onClick={() => setViewingId(null)}
              className="w-full rounded-xl bg-[#10264d] px-5 py-3 text-sm font-semibold text-white"
            >
              Close Details
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
