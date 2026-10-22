
import { useEffect, useMemo, useState } from "react";
import {
  Plus, Search, X, Users, UserCheck, UserX, Pencil,
  Trash2, Phone, Mail, MapPin, CalendarDays,
  ChevronDown, UserRound, CheckCircle2, AlertCircle,
  ShieldCheck,
} from "lucide-react";

const STORAGE_KEY = "studio_raw_customers";
const DEMO_SEED_KEY = "studio_raw_customers_demo_v3";

const sampleNames = [
  ["Arun Kumar", "Male", "Nagercoil", "Instagram"],
  ["Priya Devi", "Female", "Kanyakumari", "Referral"],
  ["Karthik Raj", "Male", "Marthandam", "Facebook"],
  ["Divya S", "Female", "Thuckalay", "Instagram"],
  ["Vijay Anand", "Male", "Nagercoil", "Walk-in"],
  ["Meena R", "Female", "Colachel", "Website"],
  ["Sanjay Kumar", "Male", "Chennai", "Referral"],
  ["Nithya P", "Female", "Tirunelveli", "Instagram"],
  ["Rahul M", "Male", "Kuzhithurai", "Facebook"],
  ["Anitha S", "Female", "Nagercoil", "Walk-in"],
  ["Ajith Kumar", "Male", "Kanyakumari", "Instagram"],
  ["Swetha R", "Female", "Chennai", "Referral"],
  ["Dinesh B", "Male", "Nagercoil", "Website"],
  ["Keerthana V", "Female", "Marthandam", "Instagram"],
  ["Praveen Raj", "Male", "Tirunelveli", "Facebook"],
  ["Aishwarya S", "Female", "Thuckalay", "Referral"],
  ["Manoj Kumar", "Male", "Nagercoil", "Walk-in"],
  ["Harini P", "Female", "Kanyakumari", "Instagram"],
  ["Suresh Babu", "Male", "Colachel", "Referral"],
  ["Deepika R", "Female", "Chennai", "Website"],
  ["Vishnu Kumar", "Male", "Nagercoil", "Instagram"],
  ["Lavanya M", "Female", "Marthandam", "Facebook"],
  ["Aravind S", "Male", "Tirunelveli", "Walk-in"],
  ["Janani K", "Female", "Nagercoil", "Referral"],
  ["Bala Murugan", "Male", "Kuzhithurai", "Instagram"],
  ["Pavithra S", "Female", "Thuckalay", "Website"],
  ["Ramesh Kumar", "Male", "Kanyakumari", "Referral"],
  ["Gayathri P", "Female", "Nagercoil", "Facebook"],
  ["Naveen Raj", "Male", "Chennai", "Instagram"],
  ["Monisha R", "Female", "Colachel", "Walk-in"],
];

const initialCustomers = sampleNames.map((item, index) => {
  const number = index + 1;
  const day = String((index % 28) + 1).padStart(2, "0");
  const month = String((index % 9) + 1).padStart(2, "0");

  return {
    id: `CUS${String(number).padStart(3, "0")}`,
    name: item[0],
    phone: `90000${String(10000 + index)}`,
    email: `${item[0]
      .toLowerCase()
      .replace(/[^a-z]/g, "")}${number}@example.com`,
    address: `${item[2]}, Tamil Nadu`,
    gender: item[1],
    status: index % 7 === 0 ? "Inactive" : "Active",
    language: index % 5 === 0 ? "Tamil & English" : "Tamil",
    source: item[3],
    notes: [
      "Wedding photography enquiry",
      "Pre-wedding photography customer",
      "Birthday event photography",
      "Family portrait booking",
      "Album printing enquiry",
      "Regular studio customer",
    ][index % 6],
    createdAt: `2026-${month}-${day}`,
  };
});

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gender: "",
  status: "Active",
  language: "Tamil",
  source: "",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const formatDate = (date) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function SummaryCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </h3>
        </div>
        <div className={`rounded-2xl p-3 ${bg}`}>
          <Icon size={25} className={color} />
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function CustomerModal({ open, onClose, onSave, customer }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(
      customer
        ? { ...emptyForm, ...customer }
        : { ...emptyForm }
    );
  }, [open, customer]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) return;

    onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
              {customer ? "Edit Customer" : "Add New Customer"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {customer
                ? "Update customer information"
                : "Enter the customer details below"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <UserRound size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500">
                Customer contact and profile details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="Customer Name" required>
              <input
                className={inputClass}
                placeholder="Enter full name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                required
              />
            </FormField>

            <FormField label="Phone Number" required>
              <input
                className={inputClass}
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                required
              />
            </FormField>

            <FormField label="Email Address">
              <input
                className={inputClass}
                type="email"
                placeholder="customer@example.com"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
              />
            </FormField>

            <FormField label="Gender">
              <select
                className={inputClass}
                value={form.gender}
                onChange={(event) =>
                  updateField("gender", event.target.value)
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>

            <FormField label="Preferred Language">
              <select
                className={inputClass}
                value={form.language}
                onChange={(event) =>
                  updateField("language", event.target.value)
                }
              >
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Tamil & English">
                  Tamil & English
                </option>
              </select>
            </FormField>

            <FormField label="Customer Source">
              <select
                className={inputClass}
                value={form.source}
                onChange={(event) =>
                  updateField("source", event.target.value)
                }
              >
                <option value="">Select source</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </FormField>

            <FormField label="Customer Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(event) =>
                  updateField("status", event.target.value)
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FormField>

            <FormField label="Address">
              <input
                className={inputClass}
                placeholder="Enter address"
                value={form.address}
                onChange={(event) =>
                  updateField("address", event.target.value)
                }
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Notes">
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  placeholder="Additional customer information..."
                  value={form.notes}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  rows={3}
                />
              </FormField>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CheckCircle2 size={18} />
              {customer ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const existing = saved ? JSON.parse(saved) : [];

      const validExisting = Array.isArray(existing)
        ? existing
        : [];

      const alreadySeeded =
        localStorage.getItem(DEMO_SEED_KEY) === "true";

      if (alreadySeeded) {
        return validExisting;
      }

      const existingIds = new Set(
        validExisting.map((item) => String(item.id))
      );

      const existingPhones = new Set(
        validExisting.map((item) => String(item.phone))
      );

      const missingDemo = initialCustomers.filter(
        (item) =>
          !existingIds.has(String(item.id)) &&
          !existingPhones.has(String(item.phone))
      );

      localStorage.setItem(DEMO_SEED_KEY, "true");

      return [...validExisting, ...missingDemo];
    } catch {
      return initialCustomers;
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(customers)
      );
    } catch (error) {
      console.error("Unable to save customers:", error);
    }
  }, [customers]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(
      () => setNotice(""),
      3000
    );

    return () => window.clearTimeout(timer);
  }, [notice]);

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const inactiveCount = customers.filter(
    (customer) => customer.status === "Inactive"
  ).length;

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch = [
        customer.name,
        customer.id,
        customer.phone,
        customer.email,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term)
      );

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const openAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const saveCustomer = (form) => {
    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...form }
            : customer
        )
      );

      setNotice("Customer updated successfully.");
      return;
    }

    const newCustomer = {
      ...form,
      id: `CUS${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setCustomers((previous) => [
      newCustomer,
      ...previous,
    ]);

    setNotice("Customer added successfully.");
  };

  const deleteCustomer = (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    setCustomers((previous) =>
      previous.filter(
        (item) => item.id !== customer.id
      )
    );

    setNotice("Customer deleted successfully.");
  };

  const toggleStatus = (customer) => {
    const nextStatus =
      customer.status === "Active"
        ? "Inactive"
        : "Active";

    setCustomers((previous) =>
      previous.map((item) =>
        item.id === customer.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setNotice(
      `Customer marked ${nextStatus.toLowerCase()}.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {notice && (
          <div
            role="status"
            className="fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border border-blue-100 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-xl"
          >
            <CheckCircle2
              className="shrink-0 text-blue-600"
              size={20}
            />
            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-2 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-blue-600">
              STUDIO RAW PICTUREZ
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Customers
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Manage your customer information in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
            icon={Users}
            color="text-blue-600"
            bg="bg-blue-50"
          />

          <SummaryCard
            title="Active Customers"
            value={activeCount}
            icon={UserCheck}
            color="text-emerald-600"
            bg="bg-emerald-50"
          />

          <SummaryCard
            title="Inactive Customers"
            value={inactiveCount}
            icon={UserX}
            color="text-orange-600"
            bg="bg-orange-50"
          />

          <SummaryCard
            title="Customer Records"
            value={filteredCustomers.length}
            icon={ShieldCheck}
            color="text-violet-600"
            bg="bg-violet-50"
          />
        </div>

        {/* DIRECTORY */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Customer Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search, edit and manage your customers.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative flex-1 sm:min-w-64">
                <Search
                  size={19}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className={`${inputClass} pl-11`}
                  placeholder="Search name, ID, phone..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="relative sm:min-w-44">
                <select
                  className={`${inputClass} appearance-none pr-10`}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter customers by status"
                >
                  <option value="All">All Customers</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="mt-6 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50">
                  {[
                    "Customer",
                    "Contact",
                    "Added Date",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                        heading === "Actions"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                          {customer.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone
                          size={15}
                          className="text-slate-400"
                        />
                        {customer.phone}
                      </div>

                      {customer.email && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <Mail
                            size={14}
                            className="text-slate-400"
                          />
                          {customer.email}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-slate-400"
                        />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(customer)}
                        title="Click to change status"
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          customer.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            customer.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {customer.status}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          title="Edit customer"
                          className="rounded-lg border border-blue-100 p-2.5 text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCustomer(customer)}
                          title="Delete customer"
                          className="rounded-lg border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="py-16 text-center">
                <AlertCircle
                  className="mx-auto mb-3 text-slate-300"
                  size={38}
                />

                <p className="font-semibold text-slate-600">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>

          {/* MOBILE CARDS */}
          <div className="mt-5 space-y-4 md:hidden">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-700">
                    {customer.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-bold text-slate-800">
                      {customer.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {customer.id}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    className="rounded-lg border border-blue-100 p-2 text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil size={17} />
                  </button>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                    <span>{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex min-w-0 items-center gap-3 text-sm text-slate-600">
                      <Mail
                        size={16}
                        className="shrink-0 text-slate-400"
                      />
                      <span className="break-all">
                        {customer.email}
                      </span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start gap-3 text-sm text-slate-600">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CalendarDays
                      size={16}
                      className="shrink-0 text-slate-400"
                    />
                    <span>
                      Added {formatDate(customer.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => toggleStatus(customer)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    {customer.status === "Active" ? (
                      <UserX size={16} />
                    ) : (
                      <UserCheck size={16} />
                    )}
                    Mark{" "}
                    {customer.status === "Active"
                      ? "Inactive"
                      : "Active"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCustomer(customer)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center">
                <Users
                  className="mx-auto mb-3 text-slate-300"
                  size={38}
                />

                <p className="font-semibold text-slate-600">
                  No customers found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try changing your search or filter.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredCustomers.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {customers.length}
              </span>{" "}
              customers
            </p>

            <p className="text-xs text-slate-400">
              Customer data is saved in this browser.
            </p>
          </div>
        </div>

        <CustomerModal
          open={modalOpen}
          onClose={closeModal}
          onSave={saveCustomer}
          customer={editingCustomer}
        />
      </div>
    </div>
  );
}
