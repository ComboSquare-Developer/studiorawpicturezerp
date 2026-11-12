
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { createPortal } from "react-dom";
import {
  Search,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
  Users,
  Camera,
  Plus,
  X,
  Trash2,
  Pencil,
  HeartHandshake,
  Cake,
  Baby,
  PartyPopper,
  ChevronDown,
  LayoutGrid,
  List,
  IndianRupee,
  RotateCcw,
  FileText,
  UserRound,
  Save,
  CheckCircle2,
} from "lucide-react";

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY = "studioraw_enquiries";
const LEGACY_ENQUIRY_KEY = "studio_raw_enquiries";
const CUSTOMER_STORAGE_KEY = "studio_raw_customers";
const BOOKING_STORAGE_KEY = "studioraw_bookings";
const DATA_UPDATED_EVENT = "studioraw:data-updated";

const demoData = [];

const emptyForm = {
  name: "",
  email: "",
  number: "",
  mainEvent: "",
  serviceDetail: "",
  eventType: "",
  eventDate: "",
  city: "",
  weddingCoverage: "",
  notes: "",
  budget: "",
  status: "New",
};

// Main service categories shown in the enquiry form.
const serviceOptions = [
  "Wedding Photography",
  "Wedding Videography",
  "Functions We Arrange",
  "Event Management",
  "Customer Gifts",
];

// Related options are displayed after the customer selects a main service.
const serviceSubOptions = {
  "Wedding Photography": [
    "Traditional Photography",
    "Candid Photography",
    "Helicam Photography",
    "Pre-Wedding Photography",
    "Post-Wedding Photography",
    "Outdoor Photography",
    "Complete Wedding Photography Package",
  ],
  "Wedding Videography": [
    "Traditional Wedding Video",
    "Cinematic Wedding Film",
    "Drone / Helicam Video",
    "Wedding Highlight Video",
    "Full Wedding Film",
    "Pre-Wedding Video",
  ],
  "Functions We Arrange": [
    "Wedding",
    "Engagement",
    "Reception",
    "Birthday",
    "Baby Shower",
    "Naming Ceremony",
    "Anniversary",
    "Corporate Function",
  ],
  "Event Management": [
    "Wedding Event Management",
    "Birthday Event Management",
    "Engagement / Reception Management",
    "Corporate Event Management",
    "School / College Event Management",
    "Private Party Management",
  ],
  "Customer Gifts": [
    "Customized Photo Album",
    "Customized Photo Frame",
    "Customized Mug",
    "Personalized Photo Gifts",
    "Return Gifts",
    "Customized Gift Hampers",
  ],
};

// Event type is stored separately from the selected service.
const eventTypeOptions = [
  "Wedding",
  "Engagement",
  "Reception",
  "Birthday",
  "Baby Shower",
  "Naming Ceremony",
  "Anniversary",
  "Corporate Function",
  "School / College Event",
  "Maternity Shoot",
  "Pre-Wedding",
  "Post-Wedding",
  "Other",
];

// Keep legacy event values available for the existing enquiry filters.
const eventOptions = [
  "Wedding Photography",
  "Traditional photography",
  "Candid photography",
  "Helicam photography",
  "Pre-Wedding photography",
  "Post Wedding photography",
  "Custom Package",
  "Wedding Videography",
  "Functions We Arrange",
  "Event Management",
  "Customized Gifts",
  "Pre-Wedding / Outdoor Shoot",
  "Baby / Kids Shoot",
  "Complete Wedding Package",
  "Wedding",
  "Engagement",
  "Reception",
  "Birthday",
  "Baby Shower",
  "Naming Ceremony",
  "Maternity Shoot",
  "Pre-Wedding",
  "Post-Wedding",
  "Corporate Event",
  "Anniversary",
  "School / College Event",
  ...serviceOptions,
];

const coverageOptions = [
  "Full Day",
  "Half Day",
  "Two Days",
  "Three Days",
  "Candid Only",
  "Not Applicable",
];

const statusOptions = [
  "New",
  "In Discussion",
  "Follow-up",
  "Confirmed",
];

/* =========================================
   HELPERS
========================================= */

function readRecords(key) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    if (Array.isArray(value)) return value;

    for (const field of [
      "customers",
      "bookings",
      "data",
      "records",
      "items",
      "list",
    ]) {
      if (Array.isArray(value?.[field])) {
        return value[field];
      }
    }
  } catch (error) {
    console.error("Storage read failed:", key, error);
  }

  return [];
}

function notifyDataChanged(key, module) {
  window.dispatchEvent(
    new CustomEvent(DATA_UPDATED_EVENT, {
      detail: { key, module },
    })
  );
}

function normalizePhone(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(-10);
}

function normalizeDate(value) {
  const raw = String(value || "").trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    return raw.split("/").reverse().join("-");
  }

  return raw.slice(0, 10);
}

function parseAmount(value) {
  if (value === null || value === undefined) return 0;
  const str = String(value);
  if (str.toLowerCase().includes("nan")) return 0;
  const clean = str.replace(/[^\d.]/g, "");
  const amount = Number(clean);
  return Number.isFinite(amount) ? amount : 0;
}

function formatBudget(value) {
  if (value === null || value === undefined) return "Not specified";
  const raw = String(value).trim();
  if (!raw || raw.toLowerCase().includes("nan")) return "Not specified";
  const amount = parseAmount(raw);
  return amount > 0 ? `₹${amount.toLocaleString("en-IN")}` : "Not specified";
}

function formatDate(value) {
  if (!value) return "Not specified";

  const date = new Date(
    `${normalizeDate(value)}T12:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

function cleanEnquiry(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const { function: removedFunction, ...rest } = item;
  return rest;
}

function loadEnquiries() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_ENQUIRY_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed.map(cleanEnquiry).filter(Boolean);
      }
    }
  } catch (error) {
    console.error("Unable to load enquiries:", error);
  }

  return [];
}

/* =========================================
   CUSTOMER + BOOKING AUTO SYNC
========================================= */

function syncEnquiryToModules(enquiry) {
  if (!enquiry || typeof enquiry !== "object") {
    return enquiry;
  }

  const enquiryId = String(enquiry.id);
  const name = String(enquiry.name || "").trim();
  const phone = normalizePhone(
    enquiry.number || enquiry.phone
  );

  if (!name || phone.length !== 10) {
    return enquiry;
  }

  const now = new Date().toISOString();
  const email = String(enquiry.email || "").trim();
  const city = String(enquiry.city || "").trim();
  const eventName = String(
    enquiry.eventType || "Wedding"
  ).trim();

  const date = normalizeDate(enquiry.eventDate);
  const budget = parseAmount(enquiry.budget);

  const customers = readRecords(CUSTOMER_STORAGE_KEY);

  const confirmed =
    String(enquiry.status || "")
      .trim()
      .toLowerCase() === "confirmed";

  // Find customer using linked ID, enquiry ID, phone or email.
  const customerIndex = customers.findIndex((customer) => {
    const customerPhone = normalizePhone(
      customer.phone || customer.mobile
    );
    const customerEmail = String(customer.email || "").trim().toLowerCase();

    return (
      (enquiry.customerId &&
        String(customer.id) === String(enquiry.customerId)) ||
      (customer.enquiryId != null &&
        String(customer.enquiryId) === enquiryId) ||
      (customerPhone.length === 10 &&
        customerPhone === phone) ||
      (email && customerEmail && customerEmail === email.toLowerCase())
    );
  });

  const previousCustomer =
    customerIndex >= 0 ? customers[customerIndex] : null;

  const customerId =
    previousCustomer?.id || enquiry.customerId || `CUS-${Date.now().toString().slice(-4)}`;

  let nextCustomers = [...customers];

  if (confirmed) {
    // Only Confirmed enquiries create or update customer records
    const updatedCustomer = {
      ...(previousCustomer || {}),
      id: customerId,
      name,
      phone,
      email,
      address: city || previousCustomer?.address || "",
      city,
      gender: previousCustomer?.gender || "",
      language: previousCustomer?.language || "Tamil",
      source: enquiry.source || previousCustomer?.source || "Enquiry",
      notes: enquiry.notes || previousCustomer?.notes || "",
      enquiryId: previousCustomer?.enquiryId || enquiry.id,
      confirmationDate: previousCustomer?.confirmationDate || now.slice(0, 10),
      createdAt: previousCustomer?.createdAt || now.slice(0, 10),
      updatedAt: now,
      isDemo: false,
      isConfirmedCustomer: true,
    };

    if (customerIndex >= 0) {
      nextCustomers[customerIndex] = updatedCustomer;
    } else {
      nextCustomers.unshift(updatedCustomer);
    }

    localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(nextCustomers)
    );

    notifyDataChanged(CUSTOMER_STORAGE_KEY, "customers");

    return {
      ...enquiry,
      customerId,
    };
  } else {
    // Non-confirmed enquiries (New, In Discussion, Follow-up) do NOT create customer records.
    return enquiry;
  }
}

/* =========================================
   COLORS
========================================= */

const statColors = {
  blue: {
    bg: "bg-[#e5efff]",
    border: "border-[#bfd7ff]",
    icon: "bg-[#cbdfff] text-[#255caa]",
    text: "text-[#255caa]",
  },
  pink: {
    bg: "bg-[#ffe6ef]",
    border: "border-[#f8c6d9]",
    icon: "bg-[#ffd0e2] text-[#b63870]",
    text: "text-[#b63870]",
  },
  amber: {
    bg: "bg-[#fff0d0]",
    border: "border-[#f5dca6]",
    icon: "bg-[#ffe2aa] text-[#a16b14]",
    text: "text-[#98620e]",
  },
  green: {
    bg: "bg-[#ddf7e9]",
    border: "border-[#b4e8cd]",
    icon: "bg-[#c5eed7] text-[#17774e]",
    text: "text-[#17774e]",
  },
};

const eventIcons = {
  Wedding: Camera,
  Engagement: HeartHandshake,
  Birthday: Cake,
  "Baby Shower": Baby,
};

const statusStyles = {
  New: "border-violet-200 bg-violet-50 text-violet-700",
  "In Discussion":
    "border-amber-200 bg-amber-50 text-amber-700",
  "Follow-up":
    "border-blue-200 bg-blue-50 text-blue-700",
  Confirmed:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const inputClass =
  "w-full rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#102b53] outline-none transition placeholder:text-slate-400 focus:border-[#3b73b9] focus:ring-[3px] focus:ring-[#e7f0ff]";

/* =========================================
   ANIMATIONS
========================================= */

function useScrollReveal(containerRef, dependencies = []) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(
      "[data-enquiry-reveal]"
    );

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      elements.forEach((element) => {
        element.classList.add("enquiry-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("enquiry-visible");
          } else {
            entry.target.classList.remove(
              "enquiry-visible"
            );
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -15px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [containerRef, ...dependencies]);
}

function EnquiryAnimations() {
  return (
    <style>{`
      .enquiry-modal {
        animation: none !important;
        transform: none !important;
      }

      .enquiry-form-field {
        animation: none !important;
        transform: none !important;
        transition: none !important;
      }

      .enquiry-form-field:hover {
        transform: none !important;
      }

      [data-enquiry-reveal] {
        opacity: 0;
        transform: perspective(1100px)
          translateY(35px)
          rotateX(9deg)
          scale(0.96);
        transform-origin: center center;
        transition:
          opacity 0.6s ease,
          transform 0.65s cubic-bezier(0.22,1,0.36,1),
          box-shadow 0.3s ease;
        transition-delay: var(--reveal-delay, 0ms);
      }

      [data-enquiry-reveal].enquiry-visible {
        opacity: 1;
        transform: perspective(1100px)
          translateY(0)
          rotateX(0)
          scale(1);
      }

      [data-enquiry-reveal].enquiry-visible:hover {
        transform: perspective(1100px)
          translateY(-5px)
          rotateX(2deg)
          rotateY(-1deg);
        box-shadow:
          0 16px 30px rgba(16,43,83,0.11);
      }

      @media (prefers-reduced-motion: reduce) {
        [data-enquiry-reveal] {
          opacity: 1 !important;
          transform: none !important;
          transition: none !important;
        }

        [data-enquiry-reveal]:hover {
          transform: none !important;
        }
      }
    `}</style>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  index,
}) {
  const theme = statColors[color];

  return (
    <div
      data-enquiry-reveal
      style={{
        "--reveal-delay": `${index * 70}ms`,
      }}
      className={`rounded-[19px] border p-4 shadow-sm sm:p-5 ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-bold ${theme.text}`}>
            {title}
          </p>

          <h3 className="mt-3 text-[29px] font-black tracking-tight text-[#102b53]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <p className={`mt-3 text-[11px] font-medium ${theme.text}`}>
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================
   BADGES
========================================= */

function EventBadge({ event }) {
  const Icon = eventIcons[event] || PartyPopper;

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-[#28558d]">
      <Icon size={13} className="shrink-0" />
      <span className="break-words">
        {event || "Other"}
      </span>
    </span>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        statusStyles[status] || statusStyles.New
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "New"}
    </span>
  );
}

/* =========================================
   MODAL
========================================= */

function Modal({
  children,
  onClose,
  width = "max-w-[650px]",
}) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeRef.current?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07172b]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`enquiry-modal flex max-h-[94dvh] w-full ${width} flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

/* =========================================
   FORM FIELD
========================================= */

function FormField({
  label,
  name,
  value,
  onChange,
  icon: Icon,
  options,
  type = "text",
  placeholder = "",
  required = false,
  error,
}) {
  return (
    <label className="enquiry-form-field block space-y-2.5">
      <span className="flex items-center gap-2 text-xs font-bold text-[#30496c]">
        {Icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#3970ad]">
            <Icon size={14} />
          </span>
        )}

        {label}

        {required && (
          <span className="text-red-500">*</span>
        )}
      </span>

      {options ? (
        <div className="relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={`${inputClass} appearance-none pr-10`}
          >
            {value && !options.includes(value) && (
              <option value={value}>{value}</option>
            )}

            {!value && (
              <option value="">
                Select {label}
              </option>
            )}

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} ${
            error ? "border-red-400" : ""
          }`}
        />
      )}

      {error && (
        <p className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </label>
  );
}

/* =========================================
   ADD / EDIT ENQUIRY MODAL
========================================= */

function extractEnquiryPhone(data) {
  if (!data || typeof data !== "object") return "";
  const raw =
    data.number ??
    data.phone ??
    data.phoneNumber ??
    data.mobile ??
    data.contactNumber ??
    data.contact_number ??
    data.phone_number ??
    "";
  return String(raw ?? "").trim();
}

function buildEnquiryFormState(data = null) {
  const item = data || {};
  const parsed = parseAmount(item.budget);
  const phone = extractEnquiryPhone(item);

  return {
    ...emptyForm,
    ...item,
    name: item.name || item.customerName || item.customer_name || "",
    number: phone,
    phone: phone,
    email: item.email || item.emailAddress || "",
    city: item.city || item.location || "",
    mainEvent: item.mainEvent || item.service || item.service_type || "",
    serviceDetail: item.serviceDetail || item.service_detail || "",
    eventType: item.eventType || item.event_type || item.event || "",
    eventDate: item.eventDate || item.event_date || item.date || "",
    notes: item.notes || "",
    budget: parsed > 0 ? String(parsed) : (item.budget ? String(item.budget) : ""),
    status: item.status || "New",
  };
}

function AddEnquiryModal({
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState(() => buildEnquiryFormState(initialData));

  useEffect(() => {
    setForm(buildEnquiryFormState(initialData));
    setErrors({});
  }, [initialData]);

  const [errors, setErrors] = useState({});

  const change = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "mainEvent" ? { serviceDetail: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Customer name is required.";
    }

    if (!/^\d{10}$/.test(form.number.trim())) {
      nextErrors.number =
        "Enter a valid 10-digit phone number.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      number: form.number.trim(),
      phone: form.number.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      notes: form.notes.trim(),
      budget: formatBudget(form.budget),
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e9eef5] bg-white px-5 py-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102b53] text-white">
            <Plus size={22} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b89ad]">
              Enquiry Management
            </p>

            <h2 className="mt-1 text-lg font-black text-[#102b53]">
              {initialData
                ? "Edit Enquiry"
                : "Add New Enquiry"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {initialData
                ? "Update existing enquiry details"
                : "Create a new photography enquiry"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
        >
          <X size={19} />
        </button>
      </div>

      <form
        onSubmit={submit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f9fbff] px-5 py-6 sm:px-7">
          <FormField
            label="Customer Name"
            name="name"
            icon={UserRound}
            required
            value={form.name}
            onChange={change}
            error={errors.name}
            placeholder="Enter full name"
          />

          <FormField
            label="Phone Number"
            name="number"
            type="tel"
            icon={Phone}
            required
            value={form.number}
            onChange={change}
            error={errors.number}
            placeholder="Enter 10-digit mobile number"
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={change}
            placeholder="customer@example.com"
          />

          <FormField
            label="City / Location"
            name="city"
            icon={MapPin}
            value={form.city}
            onChange={change}
            placeholder="Enter city"
          />

          <FormField
            label="Services"
            name="mainEvent"
            icon={Camera}
            value={form.mainEvent}
            onChange={change}
            options={serviceOptions}
          />

          {serviceSubOptions[form.mainEvent] && (
            <FormField
              label="Select Related Service"
              name="serviceDetail"
              icon={PartyPopper}
              value={form.serviceDetail || ""}
              onChange={change}
              options={serviceSubOptions[form.mainEvent]}
            />
          )}

          <FormField
            label="Event Type"
            name="eventType"
            icon={PartyPopper}
            value={form.eventType || ""}
            onChange={change}
            options={eventTypeOptions}
          />

          <FormField
            label="Event Date"
            name="eventDate"
            type="date"
            icon={CalendarDays}
            value={form.eventDate}
            onChange={change}
          />

          <FormField
            label="Coverage Type"
            name="weddingCoverage"
            icon={Camera}
            value={form.weddingCoverage}
            onChange={change}
            options={coverageOptions}
          />

          <FormField
            label="Estimated Budget (₹)"
            name="budget"
            icon={IndianRupee}
            value={form.budget}
            onChange={change}
            placeholder="50000"
          />

          <FormField
            label="Enquiry Status"
            name="status"
            icon={CheckCircle2}
            value={form.status}
            onChange={change}
            options={statusOptions}
          />

          <label className="enquiry-form-field block space-y-2.5">
            <span className="flex items-center gap-2 text-xs font-bold text-[#30496c]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#3970ad]">
                <FileText size={14} />
              </span>
              Notes & Requirements
            </span>

            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={change}
              placeholder="Enter photography requirements..."
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102b53] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#244d80]"
          >
            <Save size={17} />
            {initialData
              ? "Save Changes"
              : "Save Enquiry"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* =========================================
   VIEW ENQUIRY MODAL
========================================= */

function EnquiryDetailsModal({
  enquiry,
  onClose,
  onDelete,
  onEdit,
}) {
  const details = [
    ["Services", enquiry.mainEvent],
    ["Related Service", enquiry.serviceDetail],
    ["Event Type", enquiry.eventType || enquiry.mainEvent],
    ["Event Date", formatDate(enquiry.eventDate)],
    ["City", enquiry.city],
    ["Coverage", enquiry.weddingCoverage],
    ["Estimated Budget", enquiry.budget],
    ["Status", enquiry.status],
  ];

  return (
    <Modal onClose={onClose} width="max-w-[610px]">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102b53] font-black text-white">
            {initials(enquiry.name)}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7990af]">
              Enquiry Profile
            </p>

            <h2 className="mt-1 truncate text-lg font-black text-[#102b53]">
              {enquiry.name}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              #ENQ-{String(enquiry.id).padStart(4, "0")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-500"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-6 sm:px-7">
        <div className="flex flex-wrap gap-2">
          <EventBadge event={enquiry.mainEvent} />
          <StatusBadge status={enquiry.status} />
        </div>

        <div className="rounded-2xl bg-[#f4f7fc] p-5">
          <h3 className="mb-5 text-xs font-extrabold uppercase tracking-wide text-[#102b53]">
            Event Information
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {details.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-[11px] text-slate-500">
                  {label}
                </p>

                <p className="mt-2 break-words text-sm font-extrabold text-[#102b53]">
                  {value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4eaf3] bg-white p-5">
          <h3 className="mb-4 text-xs font-extrabold uppercase text-[#102b53]">
            Contact Information
          </h3>

          <div className="flex flex-wrap gap-2">
            {enquiry.number && (
              <a
                href={`tel:${enquiry.number}`}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700"
              >
                <Phone size={15} />
                {enquiry.number}
              </a>
            )}

            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="inline-flex items-center gap-2 break-all rounded-xl bg-blue-50 px-4 py-3 text-xs font-bold text-blue-700"
              >
                <Mail size={15} />
                {enquiry.email}
              </a>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e4eaf3] bg-white p-5">
          <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#102b53]">
            <FileText
              size={16}
              className="text-violet-500"
            />
            Notes & Requirements
          </h3>

          <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-slate-600">
            {enquiry.notes || "No additional notes"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => onDelete(enquiry.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-100"
          >
            <Trash2 size={16} />
            Delete
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(enquiry)}
              className="rounded-xl border border-[#102b53] px-5 py-3 text-xs font-bold text-[#102b53] hover:bg-[#f4f7fc]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#102b53] px-7 py-3 text-xs font-bold text-white hover:bg-[#244d80]"
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
   MOBILE CARD
========================================= */

function MobileEnquiryCard({
  item,
  index,
  onOpen,
  onDelete,
}) {
  return (
    <article
      data-enquiry-reveal
      style={{
        "--reveal-delay": `${Math.min(index, 5) * 40}ms`,
      }}
      tabIndex={0}
      role="button"
      aria-label={`View enquiry for ${item.name}`}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpen(item);
        }
      }}
      className="cursor-pointer rounded-[20px] border border-[#e2e9f3] bg-white p-4 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e1ecff] text-xs font-extrabold text-[#2b62a9]">
            {initials(item.name)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-[#102b53]">
              {item.name}
            </h3>

            <p className="mt-1 text-[11px] text-slate-400">
              #ENQ-{String(item.id).padStart(4, "0")}
            </p>
          </div>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4">
        <EventBadge event={item.mainEvent} />
      </div>

      <div className="mt-4 space-y-3 rounded-xl bg-[#f5f8fd] p-4">
        {[
          ["Phone", item.number],
          ["Email", item.email],
          ["Date", formatDate(item.eventDate)],
          ["City", item.city],
          ["Coverage", item.weddingCoverage],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-start justify-between gap-3 text-xs"
          >
            <span className="shrink-0 text-slate-500">
              {label}
            </span>

            <span className="min-w-0 break-words text-right font-bold text-[#102b53]">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] text-slate-400">
            Estimated Budget
          </p>

          <p className="mt-1 text-base font-extrabold text-emerald-700">
            {item.budget || "—"}
          </p>
        </div>

        <button
          type="button"
          title="Delete enquiry"
          aria-label={`Delete enquiry for ${item.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(item.id);
          }}
          className="rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

/* =========================================
   GRID CARD
========================================= */

function GridEnquiryCard({
  item,
  index,
  onOpen,
  onDelete,
}) {
  return (
    <article
      data-enquiry-reveal
      style={{
        "--reveal-delay": `${Math.min(index, 5) * 40}ms`,
      }}
      tabIndex={0}
      role="button"
      aria-label={`View enquiry for ${item.name}`}
      onClick={() => onOpen(item)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onOpen(item);
        }
      }}
      className="cursor-pointer rounded-[20px] border border-[#e2e9f3] bg-white p-5 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-extrabold text-blue-700">
            {initials(item.name)}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-[#102b53]">
              {item.name}
            </h3>

            <p className="mt-1 text-[11px] text-slate-400">
              #ENQ-{String(item.id).padStart(4, "0")}
            </p>
          </div>
        </div>

        <EventBadge event={item.mainEvent} />
      </div>

      <div className="mt-4 space-y-3 rounded-xl bg-[#f5f8fd] p-4">
        {[
          ["Coverage", item.weddingCoverage],
          ["Date", formatDate(item.eventDate)],
          ["City", item.city],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-3 text-xs"
          >
            <span className="text-slate-500">
              {label}
            </span>

            <span className="text-right font-bold text-[#102b53]">
              {value || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <div>
          <p className="text-[10px] text-slate-400">
            Estimated Budget
          </p>

          <p className="mt-1 text-base font-extrabold text-emerald-700">
            {item.budget || "—"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${item.number}`}
            title="Call"
            onClick={(event) => event.stopPropagation()}
            className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"
          >
            <Phone size={16} />
          </a>

          <button
            type="button"
            title="Delete enquiry"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(item.id);
            }}
            className="rounded-xl bg-red-50 p-2.5 text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================
   MAIN ENQUIRIES PAGE
========================================= */

export default function Enquiries() {
  const pageRef = useRef(null);

  const [enquiries, setEnquiries] = useState(loadEnquiries);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  /* =========================================
     INITIAL SYNC
  ========================================= */

  useEffect(() => {
    let isMounted = true;
    api.enquiries
      .list()
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results;
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped = items.map((e) => {
            const rawNotes = e.notes || "";
            const serviceMatch = rawNotes.match(/(?:^|\n)Service:\s*(.*)/i);
            const relatedMatch = rawNotes.match(/(?:^|\n)Related Service:\s*(.*)/i);
            const cleanNotes = rawNotes
              .split("\n")
              .filter((line) => !/^\s*(Service|Related Service):/i.test(line))
              .join("\n")
              .trim();
            return {
              id: e.id,
              name: e.name,
              email: e.email || "",
              number: e.phone || "",
              mainEvent: serviceMatch?.[1]?.trim() || "Wedding Photography",
              serviceDetail: relatedMatch?.[1]?.trim() || "",
              eventType: e.event_type || "Wedding",
              eventDate: e.event_date || "",
              city: e.location || "",
              weddingCoverage: "Full Day",
              notes: cleanNotes,
              status: e.status || "New",
              budget: e.budget ? formatBudget(e.budget) : "Not specified",
            };
          });
          setEnquiries(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using local enquiries fallback:", err.message);
      });

    // Do not auto-create Customers / Bookings from demo or cached enquiries.

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================
     SAVE ENQUIRIES
  ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(enquiries)
      );
    } catch (error) {
      console.error(
        "Unable to save enquiries:",
        error
      );
    }
  }, [enquiries]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(
      () => setToast(""),
      3200
    );

    return () => clearTimeout(timer);
  }, [toast]);

  /* =========================================
     STATS
  ========================================= */

  const stats = useMemo(
    () => ({
      total: enquiries.length,
      weddings: enquiries.filter((item) =>
        String(item.mainEvent || "")
          .toLowerCase()
          .includes("wedding")
      ).length,
      other: enquiries.filter(
        (item) =>
          !String(item.mainEvent || "")
            .toLowerCase()
            .includes("wedding")
      ).length,
      cities: new Set(
        enquiries
          .map((item) =>
            String(item.city || "")
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ).size,
    }),
    [enquiries]
  );

  const cityOptions = useMemo(
    () =>
      [
        ...new Set(
          enquiries
            .map((item) =>
              String(item.city || "").trim()
            )
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [enquiries]
  );

  /* =========================================
     FILTER
  ========================================= */

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enquiries.filter((item) => {
      const matchesEvent =
        eventFilter === "All" ||
        item.mainEvent === eventFilter;

      const matchesCity =
        cityFilter === "All" ||
        item.city === cityFilter;

      const matchesSearch =
        !keyword ||
        [
          item.id,
          item.name,
          item.number,
          item.email,
          item.city,
          item.mainEvent,
          item.weddingCoverage,
          item.status,
          item.budget,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(keyword)
        );

      return (
        matchesEvent &&
        matchesCity &&
        matchesSearch
      );
    });
  }, [
    enquiries,
    search,
    eventFilter,
    cityFilter,
  ]);

  useScrollReveal(pageRef, [viewMode, filtered]);

  /* =========================================
     ACTIONS
  ========================================= */

  const clearFilters = () => {
    setSearch("");
    setEventFilter("All");
    setCityFilter("All");
  };

  // Sync records through Django, not only localStorage.
  // API endpoints must expose list/create/update as in src/api/client.js.
  const syncRemoteRelations = async (enquiry) => {
    const phone = normalizePhone(enquiry.number || enquiry.phone);
    if (!enquiry.name?.trim() || phone.length !== 10) {
      throw new Error("A name and valid 10-digit phone number are required.");
    }

    const isConfirmed =
      String(enquiry.status || "").trim().toLowerCase() === "confirmed";

    // Non-confirmed enquiries (New, In Discussion, Follow-up) do NOT create Customer or Booking.
    if (!isConfirmed) {
      return syncEnquiryToModules(enquiry);
    }

    const unwrap = (response) =>
      Array.isArray(response) ? response : (response?.results || []);

    const customers = unwrap(await api.customers.list());
    const existingCustomer = customers.find((c) =>
      normalizePhone(c.phone || c.mobile || c.number) === phone
    );
    const customerPayload = {
      name: enquiry.name.trim(),
      phone,
      email: enquiry.email || "",
      address: enquiry.city || "",
      source: enquiry.source || "Enquiry",
    };
    const customer = existingCustomer || await api.customers.create(customerPayload);
    if (!customer?.id) throw new Error("Customer API did not return an ID.");

    // Maintain compatibility with existing localStorage-based module views (Confirmed enquiry creates customer record).
    const linked = syncEnquiryToModules({
      ...enquiry,
      customerId: customer.id,
    });
    return { ...linked, customerId: customer.id };
  };

  const enquiryPayload = (data) => ({
    name: data.name,
    phone: data.number || data.phone || "",
    email: data.email || "",
    event_type: data.eventType || "Wedding",
    event_date: data.eventDate || null,
    location: data.city || "",
    budget: parseAmount(data.budget),
    status: data.status || "New",
    notes: [
      data.notes || "",
      data.mainEvent ? `Service: ${data.mainEvent}` : "",
      data.serviceDetail ? `Related Service: ${data.serviceDetail}` : "",
    ].filter(Boolean).join("\n"),
  });

  const saveEnquiry = async (data) => {
    try {
      const remote = await api.enquiries.create(enquiryPayload(data));
      if (!remote?.id) throw new Error("Enquiry API did not return an ID.");
      const saved = await syncRemoteRelations({ ...cleanEnquiry(data), id: remote.id });
      setEnquiries((prev) => [saved, ...prev.filter((e) => String(e.id) !== String(saved.id))]);
      notifyDataChanged(STORAGE_KEY, "enquiries");
      setAddOpen(false);
      setToast("Enquiry, Customer & Booking saved in Django successfully.");
    } catch (error) {
      console.error("Enquiry / Customer / Booking API save failed:", error);
      setToast(`Backend sync failed: ${error.message}. Check Console / Network.`);
    }
  };

  const updateEnquiry = async (data) => {
    if (!editing) return;
    try {
      await api.enquiries.update(editing.id, enquiryPayload(data));
      const saved = await syncRemoteRelations({ ...editing, ...cleanEnquiry(data), id: editing.id });
      setEnquiries((prev) => prev.map((e) => String(e.id) === String(saved.id) ? saved : e));
      notifyDataChanged(STORAGE_KEY, "enquiries");
      setEditing(null);
      setSelected(null);
      setToast("Enquiry, Customer & Booking synced with Django.");
    } catch (error) {
      console.error("Enquiry / Customer / Booking API update failed:", error);
      setToast(`Backend sync failed: ${error.message}. Check Console / Network.`);
    }
  };

  const deleteEnquiry = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) return;

    try {
      await api.enquiries.delete(id);
    } catch (err) {
      console.error("Backend enquiry delete failed:", err);
      setToast(`Unable to delete enquiry in Django: ${err.message}`);
      return;
    }

    const updatedEnquiries = enquiries.filter(
      (item) => String(item.id) !== String(id)
    );

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedEnquiries)
      );
    } catch (error) {
      console.error("Enquiry delete failed:", error);
      setToast("Unable to delete enquiry.");
      return;
    }

    setEnquiries(updatedEnquiries);
    notifyDataChanged(STORAGE_KEY, "enquiries");

    // Linked Customer and Booking records are preserved.
    setSelected(null);
    setToast("Enquiry deleted successfully.");
  };

  const openDetails = (item) => {
    setSelected(item);
  };

  const handleRowKey = (event, item) => {
    if (
      event.target === event.currentTarget &&
      (event.key === "Enter" ||
        event.key === " ")
    ) {
      event.preventDefault();
      openDetails(item);
    }
  };

  /* =========================================
     UI
  ========================================= */

  return (
    <div
      ref={pageRef}
      className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f8faff] px-3 py-5 text-[#102b53] sm:px-6 lg:px-8"
    >
      <EnquiryAnimations />

      <div className="mx-auto max-w-[1700px] space-y-5">
        {/* TOAST */}

        {toast && (
          <div
            role="status"
            className="fixed right-4 top-4 z-[10000] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-xs font-bold text-[#102b53] shadow-xl"
          >
            <CheckCircle2
              size={19}
              className="text-emerald-500"
            />

            {toast}

            <button
              type="button"
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
              className="text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ADD BUTTON */}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#102b53] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#244d80]"
          >
            <Plus size={19} />
            Add New Enquiry
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <StatCard
            title="Total Enquiries"
            value={stats.total}
            subtitle="All enquiries"
            icon={Users}
            color="blue"
            index={0}
          />

          <StatCard
            title="Wedding Events"
            value={stats.weddings}
            subtitle="Wedding enquiries"
            icon={HeartHandshake}
            color="pink"
            index={1}
          />

          <StatCard
            title="Other Events"
            value={stats.other}
            subtitle="Other photography events"
            icon={PartyPopper}
            color="amber"
            index={2}
          />

          <StatCard
            title="Active Cities"
            value={stats.cities}
            subtitle="Customer locations"
            icon={MapPin}
            color="green"
            index={3}
          />
        </div>

        {/* FILTER BAR */}

        <section
          data-enquiry-reveal
          className="rounded-[20px] border border-[#e3eaf3] bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-[260px]">
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
                  placeholder="Search enquiries..."
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative w-full sm:w-[175px]">
                <select
                  value={eventFilter}
                  onChange={(event) =>
                    setEventFilter(event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="All">
                    All Events
                  </option>

                  {eventOptions.map((event) => (
                    <option
                      key={event}
                      value={event}
                    >
                      {event}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative w-full sm:w-[175px]">
                <select
                  value={cityFilter}
                  onChange={(event) =>
                    setCityFilter(event.target.value)
                  }
                  className={`${inputClass} appearance-none pr-9`}
                >
                  <option value="All">
                    All Cities
                  </option>

                  {cityOptions.map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce5f1] bg-[#f7faff] px-4 py-3 text-xs font-bold text-[#45658f] hover:bg-[#edf4ff]"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>

            {/* VIEW SWITCH */}

            <div className="flex items-center gap-2 self-end rounded-xl bg-[#f2f5fa] p-1">
              <button
                type="button"
                title="Table view"
                onClick={() => setViewMode("table")}
                className={`rounded-lg p-2.5 transition ${
                  viewMode === "table"
                    ? "bg-[#102b53] text-white"
                    : "text-slate-500 hover:bg-white"
                }`}
              >
                <List size={18} />
              </button>

              <button
                type="button"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2.5 transition ${
                  viewMode === "grid"
                    ? "bg-[#102b53] text-white"
                    : "text-slate-500 hover:bg-white"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* DIRECTORY */}

        {viewMode === "table" ? (
          <section className="overflow-hidden rounded-[22px] border border-[#e3eaf3] bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
              <div>
                <h2 className="text-sm font-extrabold text-[#102b53]">
                  Enquiry Directory
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Click any enquiry to view details
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {filtered.length} Enquiries
              </span>
            </div>

            {/* MOBILE CARDS */}

            <div className="space-y-4 p-3 sm:p-4 lg:hidden">
              {filtered.map((item, index) => (
                <MobileEnquiryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={openDetails}
                  onDelete={deleteEnquiry}
                />
              ))}
            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#f7faff] text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4">
                      Customer
                    </th>
                    <th className="px-4 py-4">
                      Contact
                    </th>
                    <th className="px-4 py-4">
                      Event
                    </th>
                    <th className="px-4 py-4">
                      Date
                    </th>
                    <th className="px-4 py-4">
                      City
                    </th>
                    <th className="px-4 py-4">
                      Coverage
                    </th>
                    <th className="px-4 py-4">
                      Budget
                    </th>
                    <th className="px-4 py-4">
                      Status
                    </th>
                    <th className="px-4 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={0}
                      aria-label={`View enquiry for ${item.name}`}
                      onClick={() => openDetails(item)}
                      onKeyDown={(event) =>
                        handleRowKey(event, item)
                      }
                      className="cursor-pointer transition hover:bg-[#eef5ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e1ecff] text-xs font-extrabold text-[#2b62a9]">
                            {initials(item.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="whitespace-nowrap text-xs font-extrabold text-[#102b53]">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              #ENQ-
                              {String(item.id).padStart(
                                4,
                                "0"
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <a
                          href={`tel:${item.number}`}
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700"
                        >
                          <Phone
                            size={13}
                            className="text-emerald-500"
                          />
                          {item.number}
                        </a>

                        <p className="mt-2 max-w-[160px] truncate text-[11px] text-slate-400">
                          {item.email || "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <EventBadge
                          event={item.mainEvent}
                        />
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                        {formatDate(item.eventDate)}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {item.city || "—"}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {item.weddingCoverage || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-xs font-extrabold text-emerald-700">
                        {item.budget || "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={item.status}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="Edit enquiry"
                            aria-label={`Edit enquiry for ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelected(null);
                              setEditing({ ...item });
                            }}
                            className="rounded-xl border border-[#102b53] p-2.5 text-[#102b53] transition hover:bg-[#eef5ff]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            title="Delete enquiry"
                            aria-label={`Delete enquiry for ${item.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteEnquiry(item.id);
                            }}
                            className="rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
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

            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <Search
                  size={30}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-3 text-sm font-bold text-[#102b53]">
                  {enquiries.length === 0 ? "No enquiries available." : "No enquiries found"}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 text-xs font-bold text-blue-600"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <div className="border-t border-slate-100 bg-[#f9fbff] px-5 py-4 text-xs text-slate-500">
              Showing {filtered.length} of{" "}
              {enquiries.length} enquiries
            </div>
          </section>
        ) : (
          /* GRID VIEW */

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <GridEnquiryCard
                key={item.id}
                item={item}
                index={index}
                onOpen={openDetails}
                onDelete={deleteEnquiry}
              />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full py-14 text-center text-sm text-slate-500">
                {enquiries.length === 0 ? "No enquiries available." : "No enquiries found."}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 font-bold text-blue-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>
        )}

        <p className="flex items-center justify-center gap-2 pb-3 text-center text-[11px] text-slate-400">
          <Camera size={14} />
          Studio Raw Picturez · Enquiry Management
        </p>
      </div>

      {/* ADD ENQUIRY */}

      {addOpen && (
        <AddEnquiryModal
          onClose={() => setAddOpen(false)}
          onSave={saveEnquiry}
        />
      )}

      {/* EDIT ENQUIRY */}

      {editing && (
        <AddEnquiryModal
          initialData={editing}
          onClose={() => setEditing(null)}
          onSave={updateEnquiry}
        />
      )}

      {/* VIEW DETAILS */}

      {selected && (
        <EnquiryDetailsModal
          enquiry={selected}
          onClose={() => setSelected(null)}
          onDelete={deleteEnquiry}
          onEdit={(item) => {
            setSelected(null);
            setEditing(item);
          }}
        />
      )}
    </div>
  );
}