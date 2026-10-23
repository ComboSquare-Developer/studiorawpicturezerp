
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  Users,
  UserCheck,
  UserX,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  ChevronDown,
  UserRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  Filter,
  ContactRound,
} from "lucide-react";

const STORAGE_KEY = "studio_raw_customers";
const DEMO_SEED_KEY = "studio_raw_customers_demo_v4_100";
const SOUND_KEY = "studioraw_customers_sounds";

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
  ["Ashwin Kumar", "Male", "Nagercoil", "Instagram"],
  ["Reshma P", "Female", "Tirunelveli", "Referral"],
  ["Gokul Raj", "Male", "Marthandam", "Facebook"],
  ["Abinaya S", "Female", "Kanyakumari", "Website"],
  ["Mohan Raj", "Male", "Chennai", "Walk-in"],
  ["Lakshmi P", "Female", "Nagercoil", "Instagram"],
  ["Sathish Kumar", "Male", "Thuckalay", "Referral"],
  ["Shalini R", "Female", "Colachel", "Facebook"],
  ["Vignesh S", "Male", "Nagercoil", "Instagram"],
  ["Yamini P", "Female", "Kuzhithurai", "Website"],
  ["Prakash Raj", "Male", "Tirunelveli", "Walk-in"],
  ["Varsha S", "Female", "Chennai", "Referral"],
  ["Kishore Kumar", "Male", "Nagercoil", "Instagram"],
  ["Sandhiya R", "Female", "Kanyakumari", "Facebook"],
  ["Ranjith Kumar", "Male", "Marthandam", "Walk-in"],
  ["Sneha P", "Female", "Thuckalay", "Instagram"],
  ["Hari Prasad", "Male", "Nagercoil", "Referral"],
  ["Dhanya S", "Female", "Tirunelveli", "Website"],
  ["Muthu Kumar", "Male", "Colachel", "Facebook"],
  ["Kavya R", "Female", "Chennai", "Instagram"],
];

const customerNotes = [
  "Wedding photography enquiry",
  "Pre-wedding photography customer",
  "Birthday event photography",
  "Family portrait booking",
  "Album printing enquiry",
  "Regular studio customer",
  "Engagement photography enquiry",
  "Maternity photoshoot enquiry",
  "Traditional wedding coverage",
  "Candid photography package",
  "Outdoor photoshoot booking",
  "Wedding videography enquiry",
];

function createDummyCustomers() {
  return Array.from({ length: 100 }, (_, index) => {
    const person = sampleNames[index % sampleNames.length];

    const date = new Date(
      2026,
      index % 10,
      (index % 28) + 1
    );

    const number = index + 1;

    const name =
      index < sampleNames.length
        ? person[0]
        : `${person[0]} ${Math.floor(index / sampleNames.length) + 1}`;

    return {
      id: `CUS${String(number).padStart(3, "0")}`,
      name,
      phone: String(9000010000 + index * 173),
      email: `${name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}${number}@example.com`,
      address: `${person[2]}, Tamil Nadu`,
      gender: person[1],
      status: index % 7 === 0 ? "Inactive" : "Active",
      language:
        index % 5 === 0 ? "Tamil & English" : "Tamil",
      source: person[3],
      notes: customerNotes[index % customerNotes.length],
      createdAt: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
      isDemo: true,
    };
  });
}

const initialCustomers = createDummyCustomers();

function loadCustomers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    const existing = Array.isArray(parsed) ? parsed : [];

    if (localStorage.getItem(DEMO_SEED_KEY) === "true") {
      return existing;
    }

    const existingIds = new Set(
      existing.map((item) => String(item.id))
    );

    const existingPhones = new Set(
      existing.map((item) => String(item.phone))
    );

    const missingDemo = initialCustomers.filter(
      (item) =>
        !existingIds.has(String(item.id)) &&
        !existingPhones.has(String(item.phone))
    );

    const merged = [...existing, ...missingDemo];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    localStorage.setItem(DEMO_SEED_KEY, "true");

    return merged;
  } catch {
    return initialCustomers;
  }
}

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
  "w-full min-w-0 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#4676b6] focus:ring-2 focus:ring-blue-100";

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function useCustomerSounds() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(SOUND_KEY) !== "false"
  );

  const audioRef = useRef(null);

  const play = (type = "click") => {
    if (!enabled) return;

    try {
      const AudioClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioClass();
      }

      const ctx = audioRef.current;

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const patterns = {
        click: [520],
        open: [420, 580],
        success: [440, 660, 880],
        delete: [440, 300],
        toggle: [470, 620],
        error: [250, 210],
      };

      const notes = patterns[type] || patterns.click;

      notes.forEach((frequency, index) => {
        const start = ctx.currentTime + index * 0.075;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(
          0.028,
          start + 0.012
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          start + 0.14
        );

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.15);
      });
    } catch {
      // Sound is optional.
    }
  };

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(SOUND_KEY, String(next));
  };

  useEffect(() => {
    return () => {
      audioRef.current?.close?.().catch(() => {});
    };
  }, []);

  return { enabled, toggle, play };
}

function SummaryCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#e5ebf3] bg-white p-4 shadow-[0_4px_18px_rgba(16,38,77,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {title}
        </p>

        <h3 className="mt-2 truncate whitespace-nowrap text-xl font-extrabold tracking-tight text-[#10264d] sm:text-2xl xl:text-3xl">
          {value}
        </h3>
      </div>

      <div className={`shrink-0 rounded-xl p-3 ${bg}`}>
        <Icon size={21} className={color} />
      </div>
    </div>
  );
}

function FormField({ label, children, required = false }) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-xs font-semibold text-[#344767]">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>
      {children}
    </div>
  );
}

function CustomerModal({
  open,
  onClose,
  onSave,
  customer,
  playSound,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const nameRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    setForm(
      customer
        ? { ...emptyForm, ...customer }
        : { ...emptyForm }
    );

    setError("");

    const timer = window.setTimeout(() => {
      nameRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
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

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name || !/^\d{10}$/.test(phone)) {
      setError(
        "Enter customer name and a valid 10-digit phone number."
      );
      playSound("error");
      return;
    }

    const success = onSave({
      ...form,
      name,
      phone,
      email: form.email.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
    });

    if (success !== false) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07172d]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="flex max-h-[calc(100dvh-24px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.28)] sm:max-h-[calc(100dvh-40px)]"
      >
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e9eef5] px-5 py-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#102f62] text-white">
              {customer ? (
                <Pencil size={19} />
              ) : (
                <Plus size={21} />
              )}
            </div>

            <div className="min-w-0">
              <h2
                id="customer-modal-title"
                className="text-lg font-bold text-[#10264d]"
              >
                {customer
                  ? "Edit Customer"
                  : "Add New Customer"}
              </h2>

              <p className="mt-1 text-xs text-[#8491a5]">
                {customer
                  ? "Update customer information"
                  : "Enter customer details below"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3 border-b border-[#edf1f6] pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3fc] text-[#17477e]">
                <UserRound size={17} />
              </div>

              <h3 className="text-[13px] font-bold text-[#10264d]">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" required>
                <input
                  ref={nameRef}
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
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={form.phone}
                  onChange={(event) =>
                    updateField(
                      "phone",
                      event.target.value.replace(/\D/g, "")
                    )
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
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10`}
                    value={form.gender}
                    onChange={(event) => {
                      playSound("click");
                      updateField("gender", event.target.value);
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </FormField>

              <FormField label="Preferred Language">
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10`}
                    value={form.language}
                    onChange={(event) => {
                      playSound("click");
                      updateField("language", event.target.value);
                    }}
                  >
                    <option value="Tamil">Tamil</option>
                    <option value="English">English</option>
                    <option value="Tamil & English">
                      Tamil & English
                    </option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </FormField>

              <FormField label="Customer Source">
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10`}
                    value={form.source}
                    onChange={(event) => {
                      playSound("click");
                      updateField("source", event.target.value);
                    }}
                  >
                    <option value="">Select source</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Website">Website</option>
                    <option value="Other">Other</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </FormField>

              <FormField label="Customer Status">
                <div className="relative">
                  <select
                    className={`${inputClass} appearance-none pr-10`}
                    value={form.status}
                    onChange={(event) => {
                      playSound("click");
                      updateField("status", event.target.value);
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
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
                    className={`${inputClass} min-h-[90px] resize-y`}
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

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e9eef5] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#dce4ef] bg-[#f8fafd] px-6 py-3 text-sm font-semibold text-[#344767] hover:bg-[#eef3f9]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#102f62] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1b467e]"
            >
              <Save size={17} />
              {customer
                ? "Update Customer"
                : "Save Customer"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState(loadCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [notice, setNotice] = useState("");

  const { enabled: soundEnabled, toggle: toggleSound, play } =
    useCustomerSounds();

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
        customer.address,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const openAdd = () => {
    play("open");
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    play("open");
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
  };

  const saveCustomer = (form) => {
    const duplicate = customers.some(
      (customer) =>
        customer.phone === form.phone &&
        customer.id !== editingCustomer?.id
    );

    if (duplicate) {
      setNotice("This phone number already exists.");
      play("error");
      return false;
    }

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...form }
            : customer
        )
      );

      setNotice("Customer updated successfully.");
      play("success");
      return true;
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
    play("success");
    return true;
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
    play("delete");
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

    play("toggle");
  };

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-[#f5f7fb] px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      <div className="w-full min-w-0 space-y-6">
        {/* NOTIFICATION */}
        {notice && (
          <div
            role="status"
            className="fixed right-3 top-3 z-[60] flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-xl border border-[#dce4ef] bg-white px-4 py-3 text-sm font-medium text-[#10264d] shadow-xl sm:right-5 sm:top-5"
          >
            <CheckCircle2
              className="shrink-0 text-[#315f9a]"
              size={20}
            />

            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="ml-1 text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#7e93af]">
              STUDIO RAW PICTUREZ
            </p>

            <h1 className="text-2xl font-extrabold text-[#10264d] lg:text-[29px]">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your customer information in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openAdd}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1d4274] sm:text-sm"
            >
              <Plus size={18} />
              Add Customer
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
            icon={Users}
            color="text-blue-700"
            bg="bg-blue-50"
          />

          <SummaryCard
            title="Active Customers"
            value={activeCount}
            icon={UserCheck}
            color="text-emerald-700"
            bg="bg-emerald-50"
          />

          <SummaryCard
            title="Inactive Customers"
            value={inactiveCount}
            icon={UserX}
            color="text-orange-700"
            bg="bg-orange-50"
          />

          <SummaryCard
            title="Customer Records"
            value={filteredCustomers.length}
            icon={ShieldCheck}
            color="text-violet-700"
            bg="bg-violet-50"
          />
        </div>

        {/* DIRECTORY */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5ebf3] bg-white shadow-[0_4px_24px_rgba(16,38,77,0.035)]">
          <div className="flex flex-col gap-4 border-b border-[#edf1f6] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#10264d]">
                Customer Directory
              </h2>

              <p className="mt-1 text-xs text-[#8b99ae]">
                Search, edit and manage your customers.
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
                  className={`${inputClass} h-11 pl-10`}
                  placeholder="Search customers..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <div className="relative w-full sm:w-[190px]">
                <select
                  className={`${inputClass} h-11 appearance-none pr-10`}
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value);
                    play("click");
                  }}
                  aria-label="Filter customers by status"
                >
                  <option value="All">All Customers</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden w-full min-w-0 lg:block">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col style={{ width: "24%" }} />
                <col style={{ width: "29%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>

              <thead>
                <tr className="border-b border-[#e9eef5] bg-[#f8fafd]">
                  {[
                    "Customer",
                    "Contact",
                    "Added Date",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-3 py-4 text-[11px] font-bold uppercase tracking-[0.02em] text-[#8290a5] xl:px-5 ${
                        heading === "Actions"
                          ? "text-center"
                          : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1f6]">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-[#f8faff]"
                  >
                    <td className="px-3 py-4 xl:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf3fc] font-bold text-[#315f9a]">
                          {customer.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div className="min-w-0">
                          <p
                            className="truncate text-xs font-bold text-[#10264d] xl:text-[13px]"
                            title={customer.name}
                          >
                            {customer.name}
                          </p>

                          <p className="mt-1 truncate text-[11px] text-[#8b99ae]">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 xl:px-5">
                      <div className="flex items-center gap-2 text-xs text-[#52627b]">
                        <Phone
                          size={14}
                          className="shrink-0 text-slate-400"
                        />
                        <span className="truncate">
                          {customer.phone}
                        </span>
                      </div>

                      {customer.email && (
                        <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] text-[#8b99ae]">
                          <Mail
                            size={14}
                            className="shrink-0 text-slate-400"
                          />

                          <span
                            className="truncate"
                            title={customer.email}
                          >
                            {customer.email}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-4 xl:px-5">
                      <div className="flex items-center gap-2 text-xs text-[#52627b]">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        {formatDate(customer.createdAt)}
                      </div>
                    </td>

                    <td className="px-3 py-4 xl:px-5">
                      <button
                        type="button"
                        onClick={() => toggleStatus(customer)}
                        title="Click to change status"
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold transition ${
                          customer.status === "Active"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            customer.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-slate-400"
                          }`}
                        />

                        {customer.status}
                      </button>
                    </td>

                    <td className="px-2 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          title="Edit customer"
                          aria-label={`Edit ${customer.name}`}
                          className="rounded-lg p-2 text-[#376aa7] transition hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteCustomer(customer)}
                          title="Delete customer"
                          aria-label={`Delete ${customer.name}`}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <AlertCircle
                  size={36}
                  className="mb-3 text-slate-300"
                />

                <p className="text-sm font-medium">
                  No customers found
                </p>
              </div>
            )}
          </div>

          {/* MOBILE / TABLET CARDS */}
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className="min-w-0 rounded-xl border border-[#e5ebf3] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#edf1f6] pb-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf3fc] text-lg font-bold text-[#315f9a]">
                      {customer.name
                        ?.charAt(0)
                        ?.toUpperCase() || "C"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#10264d]">
                        {customer.name}
                      </p>

                      <p className="mt-1 text-[11px] font-semibold text-[#4972a8]">
                        {customer.id}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    aria-label={`Edit ${customer.name}`}
                    className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-700"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(customer)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                      customer.status === "Active"
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
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

                  <span className="text-[11px] text-slate-400">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-[#52627b]">
                    <Phone
                      size={15}
                      className="shrink-0 text-slate-400"
                    />
                    <span>{customer.phone}</span>
                  </div>

                  {customer.email && (
                    <div className="flex min-w-0 items-center gap-3 text-xs text-[#52627b]">
                      <Mail
                        size={15}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="min-w-0 break-all">
                        {customer.email}
                      </span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-start gap-3 text-xs text-[#52627b]">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span className="break-words">
                        {customer.address}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-[#edf1f6] pt-3">
                  <button
                    type="button"
                    onClick={() => toggleStatus(customer)}
                    className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-[#dce4ef] px-2 py-2.5 text-[11px] font-semibold text-[#344767] transition hover:bg-blue-50"
                  >
                    {customer.status === "Active" ? (
                      <UserX size={15} />
                    ) : (
                      <UserCheck size={15} />
                    )}

                    Mark{" "}
                    {customer.status === "Active"
                      ? "Inactive"
                      : "Active"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteCustomer(customer)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 px-3 py-2.5 text-[11px] font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="col-span-full flex flex-col items-center py-12 text-slate-400">
                <Users
                  size={36}
                  className="mb-3 text-slate-300"
                />

                <p className="text-sm">
                  No customers found
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col gap-1 border-t border-[#edf1f6] px-4 py-4 text-xs text-[#8290a5] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </p>

            <span>Studio Raw Picturez CRM</span>
          </div>
        </section>

        <CustomerModal
          open={modalOpen}
          onClose={closeModal}
          onSave={saveCustomer}
          customer={editingCustomer}
          playSound={play}
        />
      </div>
    </div>
  );
}
