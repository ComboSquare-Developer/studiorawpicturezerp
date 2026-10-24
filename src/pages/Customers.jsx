
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  X,
  Users,
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
  Eye,
  ContactRound,
  Volume2,
  VolumeX,
  FileText,
  Globe2,
  HeartHandshake,
  Camera,
  Sparkles,
} from "lucide-react";

/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "studio_raw_customers";
const DEMO_SEED_KEY = "studio_raw_customers_demo_v4_100";
const SOUND_KEY = "studioraw_customers_sounds";

/* =====================================================
   ORIGINAL 100 DUMMY CUSTOMERS - UNCHANGED
===================================================== */

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
    const date = new Date(2026, index % 10, (index % 28) + 1);
    const number = index + 1;

    const name =
      index < sampleNames.length
        ? person[0]
        : `${person[0]} ${
            Math.floor(index / sampleNames.length) + 1
          }`;

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

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );
    localStorage.setItem(DEMO_SEED_KEY, "true");

    return merged;
  } catch {
    return initialCustomers;
  }
}

/* =====================================================
   HELPERS
===================================================== */

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gender: "",
  language: "Tamil",
  source: "",
  notes: "",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#e1e7f0] bg-white px-4 py-3 text-sm text-[#17233b] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#8ea9d4] focus:ring-[3px] focus:ring-blue-100/70";

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

function getInitials(name) {
  return String(name || "C")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const avatarThemes = [
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-rose-50 text-rose-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-cyan-50 text-cyan-700",
];

const borderThemes = [
  "customer-border-blue",
  "customer-border-violet",
  "customer-border-rose",
  "customer-border-green",
  "customer-border-amber",
  "customer-border-cyan",
];

/* =====================================================
   SOUNDS
===================================================== */

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
      // Optional sound
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

/* =====================================================
   ANIMATED NUMBER
===================================================== */

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;

    const animate = (time) => {
      if (start === null) start = time;

      const progress = Math.min(
        (time - start) / 850,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display.toLocaleString("en-IN");
}

/* =====================================================
   PREMIUM SUMMARY CARDS
===================================================== */

const summaryThemes = {
  blue: {
    bg: "bg-[#eff6ff]",
    border: "border-[#dbeafe]",
    icon: "bg-[#dbeafe] text-[#2563eb]",
    accent: "bg-blue-500",
  },
  violet: {
    bg: "bg-[#f5f3ff]",
    border: "border-[#e9e2ff]",
    icon: "bg-[#ede9fe] text-[#7c3aed]",
    accent: "bg-violet-500",
  },
  rose: {
    bg: "bg-[#fff1f5]",
    border: "border-[#ffe0e9]",
    icon: "bg-[#ffe4ec] text-[#e11d48]",
    accent: "bg-rose-500",
  },
  green: {
    bg: "bg-[#effcf6]",
    border: "border-[#d4f5e2]",
    icon: "bg-[#d1fae5] text-[#059669]",
    accent: "bg-emerald-500",
  },
};

function SummaryCard({
  title,
  value,
  icon: Icon,
  theme,
  index,
}) {
  const style = summaryThemes[theme] || summaryThemes.blue;

  return (
    <div
      className={`customer-summary group relative min-w-0 overflow-hidden rounded-[22px] border ${style.border} ${style.bg} p-4 sm:p-5`}
      style={{
        animationDelay: `${index * 90}ms`,
      }}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-600 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-4 text-[30px] font-black tracking-tight text-[#17233b] sm:text-[38px]">
            <AnimatedNumber value={value} />
          </h3>
        </div>

        <div
          className={`customer-summary-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}
        >
          <Icon size={23} strokeWidth={1.9} />
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/80">
        <div
          className={`customer-progress h-full w-[65%] rounded-full ${style.accent}`}
        />
      </div>
    </div>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  children,
  required = false,
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-xs font-semibold text-slate-600">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =====================================================
   CUSTOMER DETAILS
===================================================== */

function DetailField({
  label,
  value,
  icon: Icon,
  full = false,
}) {
  return (
    <div
      className={`customer-detail-field min-w-0 rounded-2xl border border-[#e7edf5] bg-[#fbfcff] p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
        <Icon size={15} />
        {label}
      </div>

      <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#17233b]">
        {value || "—"}
      </p>
    </div>
  );
}

function CustomerDetailsModal({
  customer,
  onClose,
  onEdit,
}) {
  useEffect(() => {
    if (!customer) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [customer, onClose]);

  if (!customer) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/55 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-details-title"
        className="customer-modal flex max-h-[94dvh] w-full max-w-[740px] flex-col overflow-hidden rounded-[24px] border border-white bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2
              id="customer-details-title"
              className="text-xl font-bold text-[#14233f]"
            >
              Customer Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {customer.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close details"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-xl font-extrabold text-blue-700">
              {getInitials(customer.name)}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="break-words text-lg font-bold text-[#14233f]">
                {customer.name}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {customer.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailField
              label="Customer Name"
              value={customer.name}
              icon={UserRound}
            />

            <DetailField
              label="Customer ID"
              value={customer.id}
              icon={ContactRound}
            />

            <DetailField
              label="Phone Number"
              value={customer.phone}
              icon={Phone}
            />

            <DetailField
              label="Email Address"
              value={customer.email}
              icon={Mail}
            />

            <DetailField
              label="Gender"
              value={customer.gender}
              icon={Users}
            />

            <DetailField
              label="Preferred Language"
              value={customer.language}
              icon={Globe2}
            />

            <DetailField
              label="Customer Source"
              value={customer.source}
              icon={HeartHandshake}
            />

            <DetailField
              label="Added Date"
              value={formatDate(customer.createdAt)}
              icon={CalendarDays}
            />

            <DetailField
              label="Address"
              value={customer.address}
              icon={MapPin}
              full
            />

            <DetailField
              label="Notes"
              value={customer.notes}
              icon={FileText}
              full
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 bg-white p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit(customer)}
            className="flex items-center gap-2 rounded-xl bg-[#243a62] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#314e80]"
          >
            <Pencil size={16} />
            Edit Customer
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* =====================================================
   ADD / EDIT CUSTOMER MODAL
===================================================== */

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
        ? {
            ...emptyForm,
            ...customer,
          }
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

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener(
        "keydown",
        handleEscape
      );
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

    const { status, ...formWithoutStatus } = form;

    const success = onSave({
      ...formWithoutStatus,
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/55 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="customer-modal flex max-h-[calc(100dvh-24px)] w-full max-w-[780px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              {customer ? (
                <Pencil size={21} />
              ) : (
                <Plus size={22} />
              )}
            </div>

            <div>
              <h2
                id="customer-modal-title"
                className="text-lg font-bold text-[#14233f]"
              >
                {customer
                  ? "Edit Customer"
                  : "Add New Customer"}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {customer
                  ? "Update customer information"
                  : "Enter customer details below"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-7">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#14233f]">
                <UserRound
                  size={18}
                  className="text-blue-600"
                />
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField
                label="Customer Name"
                required
              >
                <input
                  ref={nameRef}
                  className={inputClass}
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  required
                />
              </FormField>

              <FormField
                label="Phone Number"
                required
              >
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
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
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
                    updateField(
                      "email",
                      event.target.value
                    )
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
                      updateField(
                        "gender",
                        event.target.value
                      );
                    }}
                  >
                    <option value="">
                      Select gender
                    </option>
                    <option value="Male">
                      Male
                    </option>
                    <option value="Female">
                      Female
                    </option>
                    <option value="Other">
                      Other
                    </option>
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
                      updateField(
                        "language",
                        event.target.value
                      );
                    }}
                  >
                    <option value="Tamil">
                      Tamil
                    </option>
                    <option value="English">
                      English
                    </option>
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
                      updateField(
                        "source",
                        event.target.value
                      );
                    }}
                  >
                    <option value="">
                      Select source
                    </option>
                    <option value="Instagram">
                      Instagram
                    </option>
                    <option value="Facebook">
                      Facebook
                    </option>
                    <option value="Referral">
                      Referral
                    </option>
                    <option value="Walk-in">
                      Walk-in
                    </option>
                    <option value="Website">
                      Website
                    </option>
                    <option value="Other">
                      Other
                    </option>
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
                    updateField(
                      "address",
                      event.target.value
                    )
                  }
                />
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Notes">
                  <textarea
                    className={`${inputClass} min-h-[100px] resize-y`}
                    placeholder="Additional customer information..."
                    value={form.notes}
                    onChange={(event) =>
                      updateField(
                        "notes",
                        event.target.value
                      )
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
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />
                {error}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#243a62] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#314e80]"
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

/* =====================================================
   MAIN PAGE
===================================================== */

export default function Customers() {
  const [customers, setCustomers] =
    useState(loadCustomers);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [viewCustomer, setViewCustomer] =
    useState(null);

  const [notice, setNotice] = useState("");

  const {
    enabled: soundEnabled,
    toggle: toggleSound,
    play,
  } = useCustomerSounds();

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(customers)
      );
    } catch (error) {
      console.error(
        "Unable to save customers:",
        error
      );
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

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.id,
        customer.phone,
        customer.email,
        customer.address,
        customer.gender,
        customer.language,
        customer.source,
        customer.notes,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [customers, search]);

  const uniqueCities = useMemo(() => {
    const cities = customers
      .map((customer) =>
        String(customer.address || "")
          .split(",")[0]
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

    return new Set(cities).size;
  }, [customers]);

  const uniqueSources = useMemo(() => {
    return new Set(
      customers
        .map((customer) =>
          String(customer.source || "")
            .trim()
            .toLowerCase()
        )
        .filter(Boolean)
    ).size;
  }, [customers]);

  const openAdd = () => {
    play("open");
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const openEdit = (customer) => {
    play("open");
    setViewCustomer(null);
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
      setNotice(
        "This phone number already exists."
      );
      play("error");
      return false;
    }

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                ...form,
              }
            : customer
        )
      );

      setNotice(
        "Customer updated successfully."
      );
      play("success");
      return true;
    }

    const newCustomer = {
      ...form,
      id: `CUS${Date.now()}`,
      createdAt: new Date()
        .toISOString()
        .slice(0, 10),
    };

    setCustomers((previous) => [
      newCustomer,
      ...previous,
    ]);

    setNotice(
      "Customer added successfully."
    );
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

    setNotice(
      "Customer deleted successfully."
    );
    play("delete");
  };

  const openView = (customer) => {
    play("open");
    setViewCustomer(customer);
  };

  return (
    <div className="customer-page min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-transparent px-3 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-8">
      <style>{`
        @keyframes customerEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes customerBorderMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes customerProgress {
          from {
            transform: translateX(-110%);
          }
          to {
            transform: translateX(0);
          }
        }

        .customer-summary {
          animation: customerEnter .65s ease both;
          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .customer-summary:hover {
          transform: translateY(-6px);
          box-shadow:
            0 15px 30px rgba(15,23,42,.07);
        }

        .customer-summary-icon {
          transition: transform .4s ease;
        }

        .customer-summary:hover
        .customer-summary-icon {
          transform:
            rotate(-8deg) scale(1.1);
        }

        .customer-progress {
          animation:
            customerProgress 1.2s ease both;
        }

        .customer-directory {
          animation:
            customerEnter .7s ease both;
        }

        .customer-border-blue {
          --customer-border-a: #dbeafe;
          --customer-border-b: #bfdbfe;
        }

        .customer-border-violet {
          --customer-border-a: #ede9fe;
          --customer-border-b: #ddd6fe;
        }

        .customer-border-rose {
          --customer-border-a: #ffe4e6;
          --customer-border-b: #fecdd3;
        }

        .customer-border-green {
          --customer-border-a: #d1fae5;
          --customer-border-b: #a7f3d0;
        }

        .customer-border-amber {
          --customer-border-a: #fef3c7;
          --customer-border-b: #fde68a;
        }

        .customer-border-cyan {
          --customer-border-a: #cffafe;
          --customer-border-b: #a5f3fc;
        }

        .customer-record {
          position: relative;
          isolation: isolate;
          border: 1px solid
            var(--customer-border-a, #e2e8f0);
          transition:
            transform .3s ease,
            box-shadow .3s ease,
            border-color .3s ease;
        }

        .customer-record::before {
          content: "";
          position: absolute;
          inset: -1px;
          z-index: -1;
          border-radius: inherit;
          background: linear-gradient(
            115deg,
            var(--customer-border-a),
            var(--customer-border-b),
            #ffffff,
            var(--customer-border-a)
          );
          background-size: 300% 300%;
          opacity: 0;
          transition: opacity .3s ease;
        }

        .customer-record:hover {
          transform: translateY(-5px);
          box-shadow:
            0 12px 28px rgba(15,23,42,.07);
        }

        .customer-record:hover::before {
          opacity: 1;
          animation:
            customerBorderMove 4s linear infinite;
        }

        .customer-avatar {
          transition:
            transform .3s ease;
        }

        .customer-record:hover
        .customer-avatar {
          transform:
            scale(1.1) rotate(-5deg);
        }

        .customer-action {
          transition:
            transform .2s ease,
            background .2s ease;
        }

        .customer-action:hover {
          transform:
            translateY(-2px) scale(1.08);
        }

        .customer-detail-field {
          transition:
            transform .25s ease,
            border-color .25s ease;
        }

        .customer-detail-field:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
        }

        .customer-modal {
          animation:
            customerEnter .35s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .customer-summary,
          .customer-directory,
          .customer-modal,
          .customer-progress,
          .customer-record:hover::before {
            animation: none !important;
          }

          .customer-record:hover,
          .customer-summary:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[1700px] space-y-6">
        {/* NOTIFICATION */}

        {notice && (
          <div
            role="status"
            className="fixed right-3 top-3 z-[10000] flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#14233f] shadow-xl sm:right-5 sm:top-5"
          >
            <CheckCircle2
              size={20}
              className="shrink-0 text-emerald-600"
            />

            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* TOP ACTIONS - NO EXTRA PAGE HEADING */}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleSound}
            title={
              soundEnabled
                ? "Mute sounds"
                : "Enable sounds"
            }
            aria-label={
              soundEnabled
                ? "Mute sounds"
                : "Enable sounds"
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
          >
            {soundEnabled ? (
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>

          <button
            type="button"
            onClick={openAdd}
            className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#243a62] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#314e80] hover:shadow-lg"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
            icon={Users}
            theme="blue"
            index={0}
          />

          <SummaryCard
            title="Customer Records"
            value={filteredCustomers.length}
            icon={ContactRound}
            theme="violet"
            index={1}
          />

          <SummaryCard
            title="Customer Cities"
            value={uniqueCities}
            icon={MapPin}
            theme="rose"
            index={2}
          />

          <SummaryCard
            title="Customer Sources"
            value={uniqueSources}
            icon={Camera}
            theme="green"
            index={3}
          />
        </div>

        {/* CUSTOMER DIRECTORY */}

        <section className="customer-directory min-w-0 overflow-hidden rounded-[24px] border border-[#e5eaf2] bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]">
          <div className="flex flex-col gap-4 border-b border-[#edf0f5] p-5 xl:flex-row xl:items-center xl:justify-between xl:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ContactRound size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#14233f]">
                  Customer Directory
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Search, view and manage customer records.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-[320px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search customers..."
                className={`${inputClass} h-11 pl-10`}
              />
            </div>
          </div>

          {/* DESKTOP CUSTOMER TABLE */}

          <div className="hidden w-full lg:block">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col style={{ width: "23%" }} />
                <col style={{ width: "29%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>

              <thead>
                <tr className="border-b border-[#e7ecf5] bg-[#f8faff]">
                  {[
                    "Customer",
                    "Contact",
                    "Added Date",
                    "Location",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className={`px-3 py-4 text-[11px] font-bold uppercase tracking-[.04em] text-slate-500 xl:px-5 ${
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

              <tbody>
                {filteredCustomers.map(
                  (customer, index) => {
                    const themeIndex =
                      index % borderThemes.length;

                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-[#f0f3f8] transition-colors duration-300 hover:bg-[#fafcff]"
                      >
                        <td className="px-3 py-3 xl:px-5">
                          <div
                            className={`customer-record ${
                              borderThemes[themeIndex]
                            } flex min-w-0 items-center gap-3 rounded-2xl bg-white p-2.5`}
                          >
                            <div
                              className={`customer-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                                avatarThemes[themeIndex]
                              }`}
                            >
                              {getInitials(
                                customer.name
                              )}
                            </div>

                            <div className="min-w-0">
                              <p
                                className="truncate text-[13px] font-bold text-[#14233f]"
                                title={customer.name}
                              >
                                {customer.name}
                              </p>

                              <p className="mt-1 truncate text-[11px] text-slate-400">
                                {customer.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 xl:px-5">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone
                              size={14}
                              className="shrink-0 text-slate-400"
                            />
                            <span>
                              {customer.phone}
                            </span>
                          </div>

                          {customer.email && (
                            <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-500">
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
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <CalendarDays
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            {formatDate(
                              customer.createdAt
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-4 xl:px-5">
                          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
                            <MapPin
                              size={15}
                              className="shrink-0 text-slate-400"
                            />

                            <span
                              className="truncate"
                              title={customer.address}
                            >
                              {customer.address || "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-2 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openView(customer)
                              }
                              title="View customer"
                              aria-label={`View ${customer.name}`}
                              className="customer-action rounded-xl p-2 text-slate-600 hover:bg-slate-100"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(customer)
                              }
                              title="Edit customer"
                              aria-label={`Edit ${customer.name}`}
                              className="customer-action rounded-xl p-2 text-blue-600 hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteCustomer(customer)
                              }
                              title="Delete customer"
                              aria-label={`Delete ${customer.name}`}
                              className="customer-action rounded-xl p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {filteredCustomers.length === 0 && (
              <div className="flex flex-col items-center py-16 text-slate-400">
                <Search size={30} />
                <p className="mt-3 text-sm">
                  No customers found
                </p>
              </div>
            )}
          </div>

          {/* MOBILE / TABLET CUSTOMER CARDS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {filteredCustomers.map(
              (customer, index) => {
                const themeIndex =
                  index % borderThemes.length;

                return (
                  <article
                    key={customer.id}
                    className={`customer-record ${
                      borderThemes[themeIndex]
                    } min-w-0 rounded-[20px] bg-white p-4`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`customer-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-extrabold ${
                          avatarThemes[themeIndex]
                        }`}
                      >
                        {getInitials(
                          customer.name
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-bold text-[#14233f]">
                          {customer.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {customer.id}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openView(customer)
                        }
                        className="rounded-xl bg-slate-50 p-2 text-slate-600"
                        aria-label={`View ${customer.name}`}
                      >
                        <Eye size={17} />
                      </button>
                    </div>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <Phone
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        {customer.phone}
                      </div>

                      {customer.email && (
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <Mail
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="break-all">
                            {customer.email}
                          </span>
                        </div>
                      )}

                      {customer.address && (
                        <div className="flex items-start gap-3 text-xs text-slate-600">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <span className="break-words">
                            {customer.address}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <CalendarDays
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        {formatDate(
                          customer.createdAt
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          openView(customer)
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEdit(customer)
                        }
                        className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600"
                        aria-label={`Edit ${customer.name}`}
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCustomer(customer)
                        }
                        className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-500"
                        aria-label={`Delete ${customer.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                );
              }
            )}

            {filteredCustomers.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-slate-500">
                No customers found
              </p>
            )}
          </div>

          {/* FOOTER */}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500">
            <span>
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </span>

            <span>
              Studio Raw Picturez CRM
            </span>
          </div>
        </section>

        {/* MODALS */}

        <CustomerModal
          open={modalOpen}
          onClose={closeModal}
          onSave={saveCustomer}
          customer={editingCustomer}
          playSound={play}
        />

        <CustomerDetailsModal
          customer={viewCustomer}
          onClose={() =>
            setViewCustomer(null)
          }
          onEdit={openEdit}
        />
      </div>
    </div>
  );
}
