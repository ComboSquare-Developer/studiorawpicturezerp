
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  Users,
  UserRound,
  ContactRound,
  Plus,
  Search,
  Filter,
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  Globe2,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock3,
  BarChart3,
  Camera,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

/* =========================================
   STORAGE & CONSTANTS
========================================= */

const STORAGE_KEY = "studio_raw_customers";
const DEMO_KEY = "studio_raw_customers_demo_v4_100";
const PAYMENT_KEY = "studioraw_payments";
const BOOKING_KEY = "studioraw_bookings";
const UPDATE_EVENT = "studioraw:data-updated";
const PAGE_SIZE = 10;

const sources = [
  "Instagram",
  "Facebook",
  "Referral",
  "Walk-in",
  "Website",
];

const names = [
  "Arun Kumar", "Priya Devi", "Karthik Raj", "Divya S",
  "Vijay Anand", "Meena R", "Sanjay Kumar", "Nithya P",
  "Rahul M", "Anitha S", "Ajith Kumar", "Swetha R",
  "Dinesh B", "Keerthana V", "Praveen Raj", "Aishwarya S",
  "Manoj Kumar", "Harini P", "Suresh Babu", "Deepika R",
  "Vishnu Kumar", "Lavanya M", "Aravind S", "Janani K",
  "Bala Murugan", "Pavithra S", "Ramesh Kumar",
  "Gayathri P", "Naveen Raj", "Monisha R", "Ashwin Kumar",
  "Reshma P", "Gokul Raj", "Abinaya S", "Mohan Raj",
  "Lakshmi P", "Sathish Kumar", "Shalini R", "Vignesh S",
  "Yamini P", "Prakash Raj", "Varsha S", "Kishore Kumar",
  "Sandhiya R", "Ranjith Kumar", "Sneha P", "Hari Prasad",
  "Dhanya S", "Muthu Kumar", "Kavya R",
];

const cities = [
  "Nagercoil",
  "Kanyakumari",
  "Marthandam",
  "Thuckalay",
  "Colachel",
  "Chennai",
  "Tirunelveli",
  "Kuzhithurai",
  "Madurai",
];

const demoNotes = [
  "Wedding photography enquiry",
  "Pre-wedding photography",
  "Birthday event coverage",
  "Family portrait session",
  "Album printing enquiry",
  "Engagement photography",
  "Candid wedding photography",
  "Traditional wedding photography",
  "Wedding videography",
  "Outdoor photoshoot",
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  gender: "",
  language: "Tamil",
  source: "",
  address: "",
  notes: "",
};

/* =========================================
   HELPERS
========================================= */

function todayLocal() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function readStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    for (const field of [
      "data",
      "records",
      "items",
      "list",
      "customers",
      "payments",
      "bookings",
    ]) {
      if (Array.isArray(parsed?.[field])) {
        return parsed[field];
      }
    }

    return [];
  } catch {
    return [];
  }
}

function notifyDataUpdated(key = STORAGE_KEY) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, {
      detail: {
        key,
        module: "customers",
      },
    })
  );
}

function generateCustomerId(customers) {
  const existing = new Set(
    customers.map((customer) => String(customer.id))
  );

  let id;

  do {
    id = `CUS${Date.now()}${Math.floor(
      Math.random() * 10000
    )}`;
  } while (existing.has(id));

  return id;
}

function normalizePhone(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(-10);
}

function recordMatchesCustomer(record, customer) {
  const customerId = String(customer.id || "").trim();

  const linkedId = String(
    record.customerId ?? record.clientId ?? ""
  ).trim();

  if (linkedId && customerId) {
    return linkedId === customerId;
  }

  const customerPhone = normalizePhone(customer.phone);

  const recordPhone = normalizePhone(
    record.phone ??
      record.customerPhone ??
      record.mobile ??
      record.contactNumber ??
      ""
  );

  if (customerPhone && recordPhone) {
    return customerPhone === recordPhone;
  }

  return false;
}

function hasCustomerLinkedRecords(
  customer,
  payments,
  bookings
) {
  return (
    payments.some((payment) =>
      recordMatchesCustomer(payment, customer)
    ) ||
    bookings.some((booking) =>
      recordMatchesCustomer(booking, customer)
    )
  );
}

function initials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(
    `${String(value).slice(0, 10)}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCity(address) {
  return (
    String(address || "").split(",")[0].trim() ||
    "Unknown"
  );
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

function avatarColor(name) {
  const number = String(name || "")
    .split("")
    .reduce(
      (sum, character) => sum + character.charCodeAt(0),
      0
    );

  return avatarColors[number % avatarColors.length];
}

/* =========================================
   DEMO CUSTOMERS
========================================= */

function generateDemoCustomers() {
  return Array.from({ length: 100 }, (_, index) => {
    const number = index + 1;
    const baseName = names[index % names.length];

    const name =
      index < names.length
        ? baseName
        : `${baseName} ${
            Math.floor(index / names.length) + 1
          }`;

    const date = new Date(
      2026,
      index % 10,
      (index % 28) + 1
    );

    return {
      id: `CUS${String(number).padStart(3, "0")}`,
      name,
      phone: String(9000010000 + index * 173),
      email: `${name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")}${number}@example.com`,
      address: `${cities[index % cities.length]}, Tamil Nadu`,
      gender: index % 2 === 0 ? "Male" : "Female",
      language:
        index % 5 === 0 ? "Tamil & English" : "Tamil",
      source: sources[index % sources.length],
      notes: demoNotes[index % demoNotes.length],
      createdAt: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
      isDemo: true,
    };
  });
}

function loadCustomers() {
  try {
    const existing = readStoredArray(STORAGE_KEY);

    if (localStorage.getItem(DEMO_KEY) === "true") {
      return existing;
    }

    const ids = new Set(
      existing.map((customer) => String(customer.id))
    );

    const phones = new Set(
      existing.map((customer) =>
        normalizePhone(customer.phone)
      )
    );

    const missing = generateDemoCustomers().filter(
      (customer) =>
        !ids.has(String(customer.id)) &&
        !phones.has(normalizePhone(customer.phone))
    );

    const merged = [...existing, ...missing];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );

    localStorage.setItem(DEMO_KEY, "true");

    return merged;
  } catch {
    return generateDemoCustomers();
  }
}

/* =========================================
   3D PAGE ANIMATIONS
   NO FORM / MODAL ANIMATIONS
========================================= */

function CustomerAnimationStyles() {
  return (
    <style>{`
      .customer-3d-reveal {
        opacity: 0;
        transform:
          perspective(1100px)
          translate3d(0, 38px, -25px)
          rotateX(7deg)
          scale(0.97);
        transform-origin: center center;
        transition:
          opacity 650ms ease,
          transform 750ms cubic-bezier(0.22,1,0.36,1),
          box-shadow 300ms ease;
        will-change: transform, opacity;
      }

      .customer-3d-reveal.customer-3d-visible {
        opacity: 1;
        transform:
          perspective(1100px)
          translate3d(0,0,0)
          rotateX(0deg)
          scale(1);
        animation:
          customerFloat3D 5s ease-in-out 750ms infinite;
      }

      @keyframes customerFloat3D {
        0%, 100% {
          transform:
            perspective(1100px)
            translate3d(0,0,0)
            rotateX(0deg);
        }

        50% {
          transform:
            perspective(1100px)
            translate3d(0,-7px,0)
            rotateX(1.5deg);
        }
      }

      .customer-3d-reveal.customer-3d-visible:hover {
        animation-play-state: paused;
        box-shadow:
          0 16px 30px rgba(16,43,83,0.10);
      }

      .customer-table-row {
        transition:
          background-color 220ms ease,
          transform 280ms ease;
      }

      .customer-table-row:hover {
        background-color: #eef5ff;
      }

      .customer-source-bar {
        transition:
          width 800ms cubic-bezier(0.22,1,0.36,1);
      }

      .customer-action-button {
        transition:
          transform 200ms ease,
          background-color 200ms ease,
          box-shadow 200ms ease;
      }

      .customer-action-button:hover {
        transform: translateY(-2px);
      }

      @media (prefers-reduced-motion: reduce) {
        .customer-3d-reveal,
        .customer-3d-reveal.customer-3d-visible {
          opacity: 1 !important;
          transform: none !important;
          animation: none !important;
          transition: none !important;
        }

        .customer-action-button:hover {
          transform: none !important;
        }
      }
    `}</style>
  );
}

function useCustomerScrollAnimation(
  containerRef,
  dependencies
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll(
      ".customer-3d-reveal"
    );

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      elements.forEach((element) =>
        element.classList.add("customer-3d-visible")
      );

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "customer-3d-visible"
            );
          } else {
            entry.target.classList.remove(
              "customer-3d-visible"
            );
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -10px 0px",
      }
    );

    elements.forEach((element) =>
      observer.observe(element)
    );

    return () => observer.disconnect();
  }, dependencies);
}

/* =========================================
   AUTO COUNT ANIMATION
========================================= */

function AnimatedCustomerCount({ value }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      setCount(0);
      return;
    }

    const target = Number(value) || 0;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setCount(target);
      return;
    }

    let frame;
    const duration = 1100;
    const start = performance.now();

    const animate = (now) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value, visible]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString("en-IN")}
    </span>
  );
}

/* =========================================
   SUMMARY CARDS
========================================= */

const statThemes = {
  blue: {
    bg: "from-[#edf5ff] via-[#e5f0ff] to-[#d7e8ff]",
    border: "border-[#bed7ff]",
    icon: "bg-[#d4e5ff] text-blue-600",
    label: "text-blue-600",
    bar: "bg-blue-500",
  },
  purple: {
    bg: "from-[#f5edff] via-[#f0e5ff] to-[#e7d8ff]",
    border: "border-[#e0ceff]",
    icon: "bg-[#e6d6ff] text-violet-600",
    label: "text-violet-600",
    bar: "bg-violet-500",
  },
  green: {
    bg: "from-[#edfff5] via-[#e1faed] to-[#d0f5e1]",
    border: "border-[#acebcf]",
    icon: "bg-[#d0f4e0] text-emerald-600",
    label: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  orange: {
    bg: "from-[#fff9ed] via-[#fff1d9] to-[#ffe8be]",
    border: "border-[#f9dea1]",
    icon: "bg-[#ffe7b9] text-amber-600",
    label: "text-amber-600",
    bar: "bg-amber-500",
  },
};

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  theme,
}) {
  const style = statThemes[theme];

  return (
    <div
      className={`customer-3d-reveal relative overflow-hidden rounded-[24px] border bg-gradient-to-br p-5 shadow-sm sm:p-6 ${style.bg} ${style.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`text-xs font-bold sm:text-sm ${style.label}`}
          >
            {title}
          </p>

          <h2 className="mt-5 text-3xl font-black text-[#102b53]">
            <AnimatedCustomerCount value={value} />
          </h2>

          <p className="mt-3 text-[11px] text-[#536783]">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:h-14 sm:w-14 ${style.icon}`}
        >
          <Icon size={24} />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 w-full ${style.bar}`}
      />
    </div>
  );
}

/* =========================================
   SOURCE BADGE
========================================= */

function SourceBadge({ source }) {
  const styles = {
    Instagram:
      "bg-pink-50 text-pink-600 border-pink-100",
    Facebook:
      "bg-blue-50 text-blue-600 border-blue-100",
    Referral:
      "bg-violet-50 text-violet-600 border-violet-100",
    "Walk-in":
      "bg-amber-50 text-amber-700 border-amber-100",
    Website:
      "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        styles[source] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {source || "Unknown"}
    </span>
  );
}

/* =========================================
   CUSTOMER SOURCES
========================================= */

function SourceDistribution({ customers }) {
  const data = useMemo(() => {
    const counts = {};

    customers.forEach((customer) => {
      const source = customer.source || "Unknown";
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    );
  }, [customers]);

  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
  ];

  return (
    <section className="customer-3d-reveal rounded-[24px] border border-[#e4eaf3] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#102b53]">
            Customer Sources
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Customer acquisition channels
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <BarChart3 size={19} />
        </div>
      </div>

      <div className="space-y-4">
        {data.length ? (
          data.map(([source, count], index) => {
            const percentage =
              (count / Math.max(customers.length, 1)) *
              100;

            return (
              <div key={source}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">
                    {source}
                  </span>

                  <span className="font-bold text-[#102b53]">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`customer-source-bar h-full rounded-full ${
                      colors[index % colors.length]
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">
            No source data
          </p>
        )}
      </div>
    </section>
  );
}

/* =========================================
   RECENT CUSTOMERS
========================================= */

function RecentCustomers({ customers, onView }) {
  const recent = useMemo(
    () =>
      [...customers]
        .sort((a, b) =>
          String(b.createdAt || "").localeCompare(
            String(a.createdAt || "")
          )
        )
        .slice(0, 4),
    [customers]
  );

  return (
    <section className="customer-3d-reveal rounded-[24px] border border-[#e4eaf3] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[#102b53]">
            Recent Customers
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Latest customer records
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
          <Clock3 size={19} />
        </div>
      </div>

      <div className="space-y-2">
        {recent.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onView(customer)}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-blue-50"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${avatarColor(
                customer.name
              )}`}
            >
              {initials(customer.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#102b53]">
                {customer.name}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                {getCity(customer.address)}
              </p>
            </div>

            <span className="text-[10px] text-slate-400">
              {formatDate(customer.createdAt)}
            </span>
          </button>
        ))}

        {!recent.length && (
          <p className="py-8 text-center text-xs text-slate-400">
            No recent customers
          </p>
        )}
      </div>
    </section>
  );
}

/* =========================================
   MODAL - NO ANIMATION
========================================= */

function Modal({
  children,
  onClose,
  width = "max-w-2xl",
}) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (event) => {
      if (event.key === "Escape") {
        closeRef.current?.();
      }
    };

    window.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener(
        "keydown",
        onEscape
      );
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#09172c]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[94dvh] w-full ${width} flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* =========================================
   FORM FIELD - NO ANIMATION
========================================= */

function PremiumField({
  label,
  icon: Icon,
  required = false,
  children,
}) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-2 text-xs font-bold text-[#30486b]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf4ff] text-[#3465a5]">
          <Icon size={14} />
        </span>

        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================
   CUSTOMER ADD / EDIT
========================================= */

function CustomerFormModal({
  customer,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() =>
    customer
      ? { ...emptyForm, ...customer }
      : { ...emptyForm }
  );

  const [error, setError] = useState("");

  const update = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    const success = onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
    });

    if (!success) {
      setError("This phone number already exists.");
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-[#dfe7f2] bg-white px-4 py-3.5 text-[13px] font-medium text-[#102b53] outline-none transition placeholder:text-slate-400 hover:border-[#b9cce7] focus:border-[#3265a8] focus:ring-[3px] focus:ring-[#e5efff]";

  return (
    <Modal onClose={onClose} width="max-w-[660px]">
      <div className="shrink-0 border-b border-[#e8edf5] bg-white px-5 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#102b53] text-white shadow-lg">
              {customer ? (
                <Pencil size={23} />
              ) : (
                <UserRound size={24} />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5377a5]">
                Customer Management
              </p>

              <h2 className="mt-1 text-xl font-black text-[#102b53]">
                {customer
                  ? "Edit Customer Profile"
                  : "Create Customer Profile"}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {customer
                  ? "Update customer information"
                  : "Add a new customer to your studio"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={19} />
          </button>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="flex min-h-0 flex-1 flex-col bg-[#f9fbff]"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-8">
          <PremiumField
            label="Full Name"
            icon={UserRound}
            required
          >
            <input
              autoFocus
              required
              className={inputClass}
              value={form.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              placeholder="Enter customer's full name"
            />
          </PremiumField>

          <PremiumField
            label="Mobile Number"
            icon={Phone}
            required
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r border-slate-200 pr-3 text-xs font-bold text-[#45658f]">
                +91
              </span>

              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                className={`${inputClass} pl-[69px]`}
                value={form.phone}
                onChange={(event) =>
                  update(
                    "phone",
                    event.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter mobile number"
              />
            </div>
          </PremiumField>

          <PremiumField
            label="Email Address"
            icon={Mail}
          >
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(event) =>
                update("email", event.target.value)
              }
              placeholder="customer@example.com"
            />
          </PremiumField>

          <PremiumField
            label="Gender"
            icon={Users}
          >
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-10`}
                value={form.gender}
                onChange={(event) =>
                  update("gender", event.target.value)
                }
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </PremiumField>

          <PremiumField
            label="Preferred Language"
            icon={Globe2}
          >
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-10`}
                value={form.language}
                onChange={(event) =>
                  update("language", event.target.value)
                }
              >
                <option value="Tamil">Tamil</option>
                <option value="English">English</option>
                <option value="Tamil & English">
                  Tamil & English
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </PremiumField>

          <PremiumField
            label="Customer Source"
            icon={HeartHandshake}
          >
            <div className="relative">
              <select
                className={`${inputClass} appearance-none pr-10`}
                value={form.source}
                onChange={(event) =>
                  update("source", event.target.value)
                }
              >
                <option value="">Select Source</option>

                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}

                <option value="Other">Other</option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </PremiumField>

          <PremiumField
            label="Customer Address"
            icon={MapPin}
          >
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={form.address}
              onChange={(event) =>
                update("address", event.target.value)
              }
              placeholder="Enter complete address"
            />
          </PremiumField>

          <PremiumField
            label="Notes & Requirements"
            icon={FileText}
          >
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={form.notes}
              onChange={(event) =>
                update("notes", event.target.value)
              }
              placeholder="Enter customer requirements..."
            />
          </PremiumField>

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-500">
            <ShieldCheck
              size={16}
              className="text-blue-600"
            />
            Customer information is stored in this browser.
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#102b53] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#204678]"
          >
            <Save size={17} />

            {customer
              ? "Update Customer"
              : "Create Customer"}

            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================
   CUSTOMER DETAILS MODAL
   BOOKING INFORMATION REMOVED
========================================= */

function CustomerViewModal({
  customer,
  onClose,
  onEdit,
  onDelete,
}) {
  const details = [
    {
      label: "Gender",
      value: customer.gender || "Not specified",
      color: "text-[#326cff]",
    },
    {
      label: "Language",
      value: customer.language || "Not specified",
      color: "text-[#d99400]",
    },
    {
      label: "Location",
      value: getCity(customer.address),
      color: "text-[#ec5275]",
    },
    {
      label: "Customer Source",
      value: customer.source || "Not specified",
      color: "text-[#059f79]",
    },
    {
      label: "Customer Since",
      value: formatDate(customer.createdAt),
      color: "text-[#102b53]",
    },
    {
      label: "Customer ID",
      value: customer.id || "—",
      color: "text-[#102b53]",
    },
  ];

  return (
    <Modal onClose={onClose} width="max-w-[680px]">
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#edf0f5] pb-6">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#102b53] to-[#3567a6] text-lg font-black text-white shadow-lg">
              {initials(customer.name)}
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7990af]">
                Customer Profile
              </p>

              <h2 className="truncate text-[22px] font-black tracking-tight text-[#102b53] sm:text-[25px]">
                {customer.name}
              </h2>

              <p className="mt-1 text-[11px] font-medium text-[#8091a9]">
                {customer.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e7edf5] bg-[#f8faff] text-[#536984] hover:bg-[#eaf1fa]"
          >
            <X size={19} />
          </button>
        </div>

        {/* CUSTOMER INFORMATION */}

        <div className="mt-6 rounded-[22px] bg-[#f5f7fb] p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-[#326cff]" />

            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
              Customer Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-6">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="min-w-0"
              >
                <p className="mb-2 text-[11px] font-medium text-[#627695]">
                  {detail.label}
                </p>

                <p
                  className={`break-words text-[13px] font-extrabold sm:text-[15px] ${detail.color}`}
                >
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT INFORMATION */}

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Phone
              size={16}
              className="text-[#326cff]"
            />

            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
              Contact Information
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#e4f8f2] px-4 py-3 text-xs font-extrabold text-[#00a982]"
              >
                <Phone size={16} />
                {customer.phone}
              </a>
            )}

            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="inline-flex max-w-full items-center gap-2 break-all rounded-xl bg-[#eaf2ff] px-4 py-3 text-xs font-extrabold text-[#4384f5]"
              >
                <Mail size={16} />
                {customer.email}
              </a>
            )}

            {!customer.phone && !customer.email && (
              <p className="text-xs text-slate-400">
                No contact information provided.
              </p>
            )}
          </div>
        </div>

        {/* CUSTOMER ADDRESS */}

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <MapPin
              size={16}
              className="text-[#ec5275]"
            />

            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
              Customer Address
            </h3>
          </div>

          <p className="text-[13px] leading-6 text-[#536984]">
            {customer.address || "No address provided"}
          </p>
        </div>

        {/* NOTES */}

        <div className="mt-4 rounded-[20px] border border-[#e3eaf4] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <FileText
              size={16}
              className="text-[#a268d9]"
            />

            <h3 className="text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
              Notes & Requirements
            </h3>
          </div>

          <p className="whitespace-pre-wrap break-words text-[13px] leading-6 text-[#536984]">
            {customer.notes || "No additional notes"}
          </p>
        </div>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f5] pt-5">
          <button
            type="button"
            onClick={() => onDelete(customer)}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] font-semibold text-[#f43f5e] hover:bg-red-50"
          >
            <Trash2 size={17} />
            Delete Customer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(customer)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-[13px] font-bold text-[#102b53] hover:bg-[#f5f8fc]"
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#102b53] px-7 py-3 text-[13px] font-bold text-white shadow-md hover:bg-[#204678]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================
   DELETE CONFIRMATION
========================================= */

function DeleteCustomerModal({
  customer,
  onClose,
  onConfirm,
  linked,
}) {
  return (
    <Modal onClose={onClose} width="max-w-[420px]">
      <div className="p-7 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Trash2 size={27} />
        </div>

        <h3 className="mt-5 text-xl font-extrabold text-[#102b53]">
          Delete Customer?
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <strong>{customer.name}</strong>?
          This action cannot be undone.
        </p>

        {linked && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs leading-5 text-amber-800">
            <AlertCircle
              size={18}
              className="shrink-0"
            />

            This customer has linked records.
            Delete is blocked to protect existing data.
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={linked}
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================
   MAIN CUSTOMERS PAGE
========================================= */

export default function Customers() {
  const customerPageRef = useRef(null);

  const [customers, setCustomers] =
    useState(loadCustomers);

  const [payments, setPayments] = useState(() =>
    readStoredArray(PAYMENT_KEY)
  );

  const [bookings, setBookings] = useState(() =>
    readStoredArray(BOOKING_KEY)
  );

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] =
    useState("All");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState(null);
  const [viewCustomer, setViewCustomer] =
    useState(null);
  const [deleteCustomer, setDeleteCustomer] =
    useState(null);

  const [toast, setToast] = useState("");

  /* SAVE CUSTOMERS */

  useEffect(() => {
    try {
      const serialized = JSON.stringify(customers);

      if (
        localStorage.getItem(STORAGE_KEY) !== serialized
      ) {
        localStorage.setItem(
          STORAGE_KEY,
          serialized
        );

        notifyDataUpdated();
      }
    } catch (error) {
      console.error("Customer save error:", error);
    }
  }, [customers]);

  /* SYNC PAYMENTS, BOOKINGS & CUSTOMERS */

  useEffect(() => {
    const sync = (event) => {
      const key =
        event?.type === "storage"
          ? event.key
          : event?.detail?.key;

      if (
        key &&
        ![
          STORAGE_KEY,
          PAYMENT_KEY,
          BOOKING_KEY,
        ].includes(key)
      ) {
        return;
      }

      if (!key || key === STORAGE_KEY) {
        const latest = readStoredArray(STORAGE_KEY);

        setCustomers((previous) =>
          JSON.stringify(previous) ===
          JSON.stringify(latest)
            ? previous
            : latest
        );
      }

      if (!key || key === PAYMENT_KEY) {
        const latest = readStoredArray(PAYMENT_KEY);

        setPayments((previous) =>
          JSON.stringify(previous) ===
          JSON.stringify(latest)
            ? previous
            : latest
        );
      }

      if (!key || key === BOOKING_KEY) {
        const latest = readStoredArray(BOOKING_KEY);

        setBookings((previous) =>
          JSON.stringify(previous) ===
          JSON.stringify(latest)
            ? previous
            : latest
        );
      }
    };

    window.addEventListener("storage", sync);
    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  /* TOAST */

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      3500
    );

    return () => clearTimeout(timer);
  }, [toast]);

  /* SUMMARY */

  const uniqueCities = useMemo(
    () =>
      new Set(
        customers
          .map((customer) =>
            getCity(customer.address)
          )
          .filter((city) => city !== "Unknown")
      ).size,
    [customers]
  );

  const uniqueSources = useMemo(
    () =>
      new Set(
        customers
          .map((customer) => customer.source)
          .filter(Boolean)
      ).size,
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim();

    return customers.filter((customer) => {
      const matchesSource =
        sourceFilter === "All" ||
        customer.source === sourceFilter;

      const matchesSearch =
        !term ||
        [
          customer.id,
          customer.name,
          customer.phone,
          customer.email,
          customer.address,
          customer.source,
          customer.notes,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(term)
        );

      return matchesSource && matchesSearch;
    });
  }, [customers, search, sourceFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, sourceFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredCustomers.length / PAGE_SIZE
    )
  );

  const currentPage = Math.min(page, totalPages);

  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* SCROLL ANIMATION */

  useCustomerScrollAnimation(customerPageRef, [
    currentPage,
    search,
    sourceFilter,
    customers.length,
  ]);

  const currentViewCustomer =
    customers.find(
      (customer) =>
        customer.id === viewCustomer?.id
    ) || null;

  const currentDeleteCustomer =
    customers.find(
      (customer) =>
        customer.id === deleteCustomer?.id
    ) || null;

  const hasLinkedRecords = Boolean(
    currentDeleteCustomer &&
      hasCustomerLinkedRecords(
        currentDeleteCustomer,
        payments,
        bookings
      )
  );

  /* ACTIONS */

  const openAdd = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer) => {
    setViewCustomer(null);
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const saveCustomer = (form) => {
    const duplicate = customers.some(
      (customer) =>
        normalizePhone(customer.phone) ===
          normalizePhone(form.phone) &&
        customer.id !== editingCustomer?.id
    );

    if (duplicate) return false;

    if (editingCustomer) {
      setCustomers((previous) =>
        previous.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                ...form,
                id: customer.id,
                createdAt: customer.createdAt,
                updatedAt: new Date().toISOString(),
              }
            : customer
        )
      );

      setToast("Customer updated successfully.");
    } else {
      const newCustomer = {
        ...form,
        id: generateCustomerId(customers),
        createdAt: todayLocal(),
        updatedAt: new Date().toISOString(),
        isDemo: false,
      };

      setCustomers((previous) => [
        newCustomer,
        ...previous,
      ]);

      setToast("Customer added successfully.");
      setPage(1);
    }

    setFormOpen(false);
    setEditingCustomer(null);

    return true;
  };

  const confirmDelete = () => {
    if (!currentDeleteCustomer) return;

    const latestPayments =
      readStoredArray(PAYMENT_KEY);

    const latestBookings =
      readStoredArray(BOOKING_KEY);

    if (
      hasCustomerLinkedRecords(
        currentDeleteCustomer,
        latestPayments,
        latestBookings
      )
    ) {
      setPayments(latestPayments);
      setBookings(latestBookings);

      setToast(
        "Cannot delete customer with linked records."
      );

      return;
    }

    setCustomers((previous) =>
      previous.filter(
        (customer) =>
          customer.id !== currentDeleteCustomer.id
      )
    );

    setDeleteCustomer(null);
    setViewCustomer(null);

    setToast("Customer deleted successfully.");
  };

  return (
    <div
      ref={customerPageRef}
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8faff] px-3 py-5 sm:px-6 lg:px-8"
    >
      <CustomerAnimationStyles />

      <div className="mx-auto max-w-[1700px] space-y-6">
        {/* TOAST */}

        {toast && (
          <div
            role="status"
            className="fixed right-4 top-4 z-[10000] flex max-w-sm items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-[#102b53] shadow-xl"
          >
            <CheckCircle2
              size={19}
              className="shrink-0 text-emerald-500"
            />

            <span>{toast}</span>

            <button
              type="button"
              onClick={() => setToast("")}
              className="ml-2 text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ADD CUSTOMER */}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={openAdd}
            className="customer-action-button flex items-center gap-2 rounded-xl bg-[#102b53] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#204678]"
          >
            <Plus size={19} />
            Add Customer
          </button>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
            subtitle="Registered customers"
            icon={Users}
            theme="blue"
          />

          <SummaryCard
            title="Customer Records"
            value={filteredCustomers.length}
            subtitle="Matching current filters"
            icon={ContactRound}
            theme="purple"
          />

          <SummaryCard
            title="Customer Cities"
            value={uniqueCities}
            subtitle="Customer locations"
            icon={MapPin}
            theme="green"
          />

          <SummaryCard
            title="Customer Sources"
            value={uniqueSources}
            subtitle="Acquisition channels"
            icon={HeartHandshake}
            theme="orange"
          />
        </div>

        {/* ANALYTICS */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SourceDistribution customers={customers} />

          <RecentCustomers
            customers={customers}
            onView={setViewCustomer}
          />
        </div>

        {/* CUSTOMER DIRECTORY */}

        <section className="customer-3d-reveal overflow-hidden rounded-[25px] border border-[#e5eaf2] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ContactRound size={22} />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#102b53]">
                  Customer Directory
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Click any customer to view details
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-[260px]">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search customers..."
                  className="w-full rounded-xl border border-slate-200 bg-[#f9fbff] py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
                />
              </div>

              <div className="relative sm:w-[165px]">
                <Filter
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={sourceFilter}
                  onChange={(event) =>
                    setSourceFilter(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-[#f9fbff] py-3 pl-9 pr-8 text-xs outline-none focus:border-blue-400"
                >
                  <option value="All">All Sources</option>

                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}

                  <option value="Other">Other</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#f8faff] text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">
                    Customer
                  </th>

                  <th className="px-5 py-4">
                    Contact
                  </th>

                  <th className="px-5 py-4">
                    Location
                  </th>

                  <th className="px-5 py-4">
                    Source
                  </th>

                  <th className="px-5 py-4 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${customer.name}`}
                    onClick={() =>
                      setViewCustomer(customer)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        (event.key === "Enter" ||
                          event.key === " ")
                      ) {
                        event.preventDefault();
                        setViewCustomer(customer);
                      }
                    }}
                    className="customer-table-row cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${avatarColor(
                            customer.name
                          )}`}
                        >
                          {initials(customer.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#102b53]">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Phone
                          size={13}
                          className="text-slate-400"
                        />
                        {customer.phone}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                        <Mail size={13} />

                        <span className="max-w-[190px] truncate">
                          {customer.email || "—"}
                        </span>
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <MapPin
                          size={14}
                          className="text-blue-400"
                        />
                        {getCity(customer.address)}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatDate(customer.createdAt)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <SourceBadge source={customer.source} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Edit Customer"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEdit(customer);
                          }}
                          className="customer-action-button rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete Customer"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDeleteCustomer(customer);
                          }}
                          className="customer-action-button rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {visibleCustomers.map((customer) => (
              <div
                key={customer.id}
                tabIndex={0}
                role="button"
                aria-label={`View ${customer.name}`}
                onClick={() =>
                  setViewCustomer(customer)
                }
                onKeyDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" ||
                      event.key === " ")
                  ) {
                    event.preventDefault();
                    setViewCustomer(customer);
                  }
                }}
                className="customer-3d-reveal cursor-pointer rounded-[20px] border border-slate-200 bg-white p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${avatarColor(
                      customer.name
                    )}`}
                  >
                    {initials(customer.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-[#102b53]">
                      {customer.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {customer.id}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  <p className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone size={14} />
                    {customer.phone}
                  </p>

                  <p className="flex items-center gap-2 break-all text-xs text-slate-600">
                    <Mail size={14} />
                    {customer.email || "—"}
                  </p>

                  <p className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin size={14} />
                    {customer.address || "—"}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      {formatDate(customer.createdAt)}
                    </span>

                    <SourceBadge source={customer.source} />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEdit(customer);
                    }}
                    className="rounded-xl bg-blue-50 p-2.5 text-blue-600"
                    aria-label="Edit customer"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteCustomer(customer);
                    }}
                    className="rounded-xl bg-red-50 p-2.5 text-red-500"
                    aria-label="Delete customer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!visibleCustomers.length && (
            <div className="py-16 text-center">
              <Search
                size={32}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm font-bold text-[#102b53]">
                No customers found
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Try another search or filter
              </p>
            </div>
          )}

          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-slate-100 bg-[#f9fbff] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-slate-500 sm:text-left">
              Showing{" "}
              <strong>
                {filteredCustomers.length
                  ? (currentPage - 1) * PAGE_SIZE + 1
                  : 0}
                –
                {Math.min(
                  currentPage * PAGE_SIZE,
                  filteredCustomers.length
                )}
              </strong>{" "}
              of{" "}
              <strong>
                {filteredCustomers.length}
              </strong>{" "}
              customers
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-xs font-bold text-[#102b53]">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((previous) =>
                    Math.min(totalPages, previous + 1)
                  )
                }
                className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <p className="flex items-center justify-center gap-2 pb-3 text-center text-[11px] text-slate-400">
          <Camera size={14} />
          Studio Raw Picturez · Customer Management
        </p>
      </div>

      {/* ADD / EDIT MODAL */}

      {formOpen && (
        <CustomerFormModal
          key={editingCustomer?.id || "new"}
          customer={editingCustomer}
          onClose={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSave={saveCustomer}
        />
      )}

      {/* CUSTOMER DETAILS */}

      {currentViewCustomer && (
        <CustomerViewModal
          customer={currentViewCustomer}
          onClose={() => setViewCustomer(null)}
          onEdit={openEdit}
          onDelete={(customer) => {
            setViewCustomer(null);
            setDeleteCustomer(customer);
          }}
        />
      )}

      {/* DELETE CONFIRMATION */}

      {currentDeleteCustomer && (
        <DeleteCustomerModal
          customer={currentDeleteCustomer}
          linked={hasLinkedRecords}
          onClose={() => setDeleteCustomer(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

