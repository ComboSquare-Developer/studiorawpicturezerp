
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  CalendarCheck2,
  Clock3,
  CheckCircle2,
  Plus,
  Search,
  X,
  MapPin,
  UserRound,
  Camera,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Phone,
  Filter,
  Save,
  CalendarPlus,
  CalendarRange,
  ClipboardList,
  IndianRupee,
  Link2,
  Sparkles,
} from "lucide-react";

/* ==========================================
   STUDIO RAW PICTUREZ
   PREMIUM CONNECTED BOOKING CALENDAR
========================================== */

const STORAGE_KEY = "studioraw_bookings";
const CUSTOMER_KEY = "studio_raw_customers";
const PAYMENT_KEY = "studioraw_payments";
const DEMO_KEY = "studioraw_bookings_demo_20_v1";
const UPDATE_EVENT = "studioraw:data-updated";

const events = [
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
];

const statuses = [
  "Confirmed",
  "Pending",
  "Completed",
  "Cancelled",
];

const photographers = [
  "Rahul",
  "Karthik",
  "Arun",
  "Vignesh",
  "Sanjay",
  "Priya",
  "Divya",
  "Not Assigned",
];

const packages = [
  "Standard Photography",
  "Premium Wedding",
  "Wedding Photography & Videography",
  "Engagement Package",
  "Birthday Photography",
  "Pre-Wedding Shoot",
  "Baby Shoot Package",
  "Corporate Event Package",
  "Custom Package",
];

const locations = [
  "Nagercoil",
  "Marthandam",
  "Kanyakumari",
  "Chennai",
  "Tirunelveli",
  "Trivandrum",
  "Madurai",
  "Coimbatore",
  "Other",
];

const demoNames = [
  "Arun Kumar",
  "Priya",
  "Vijay",
  "Divya",
  "Karthik Raj",
  "Meena Devi",
  "Sanjay Kumar",
  "Nithya",
  "Rahul S",
  "Keerthana",
  "Ajay Kumar",
  "Harini",
  "Dinesh Raj",
  "Swetha",
  "Praveen",
  "Aishwarya",
  "Vignesh",
  "Ramya",
  "Naveen Kumar",
  "Abinaya",
];

const emptyForm = {
  customerId: "",
  customer: "",
  phone: "",
  event: "Wedding Photography",
  date: "",
  time: "10:00",
  location: "Nagercoil",
  photographer: "Not Assigned",
  totalAmount: "",
  status: "Confirmed",
};

/* ==========================================
   DATE HELPERS
========================================== */

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value;
  }

  const raw = String(value).trim();
  let date;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    date = new Date(`${raw}T12:00:00`);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw
      .split("/")
      .map(Number);

    date = new Date(
      year,
      month - 1,
      day,
      12
    );
  } else {
    date = new Date(raw);
  }

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatDate(value) {
  const date = parseDate(value);

  if (!date) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "—";

  const [hours, minutes] = String(value)
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return String(value);
  }

  return new Date(
    2000,
    0,
    1,
    hours,
    minutes
  ).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/* ==========================================
   AMOUNT HELPERS
========================================== */

function amount(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(
    String(value ?? 0).replace(/[₹,\s]/g, "")
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

function roundAmount(value) {
  return (
    Math.round(
      (amount(value) + Number.EPSILON) * 100
    ) / 100
  );
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount(value));
}

function normalizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
}

function firstNumber(item, fields) {
  for (const field of fields) {
    const value = item?.[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return roundAmount(value);
    }
  }

  return 0;
}

/* ==========================================
   STORAGE
========================================== */

function readArray(key) {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      for (const field of [
        "data",
        "records",
        "items",
        "list",
        "customers",
        "bookings",
        "payments",
      ]) {
        if (Array.isArray(parsed[field])) {
          return parsed[field];
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

function notifyUpdate(key) {
  window.dispatchEvent(
    new CustomEvent(UPDATE_EVENT, {
      detail: {
        key,
        module: "bookings",
      },
    })
  );
}

function saveArray(key, records) {
  localStorage.setItem(
    key,
    JSON.stringify(records)
  );

  notifyUpdate(key);
}

/* ==========================================
   CUSTOMER CONNECTION
========================================== */

function customerName(customer) {
  return String(
    customer?.name ||
      customer?.customerName ||
      customer?.customer ||
      ""
  ).trim();
}

function customerPhone(customer) {
  return normalizePhone(
    customer?.phone ||
      customer?.mobile ||
      customer?.contactNumber
  );
}

function findMatchingCustomer(
  customers,
  booking
) {
  if (booking?.customerId) {
    const matched = customers.find(
      (customer) =>
        String(customer.id) ===
        String(booking.customerId)
    );

    if (matched) return matched;
  }

  const phone = normalizePhone(
    booking?.phone
  );

  if (!phone) return null;

  return (
    customers.find(
      (customer) =>
        customerPhone(customer) === phone
    ) || null
  );
}

/* ==========================================
   PAYMENT CONNECTION
========================================== */

function paymentTotal(payment) {
  return Math.max(
    0,
    firstNumber(payment, [
      "total",
      "totalAmount",
      "total_amount",
      "grandTotal",
      "grand_total",
      "packageAmount",
      "bookingAmount",
      "amount",
    ])
  );
}

function paymentReceived(payment) {
  const transactions = Array.isArray(
    payment?.transactions
  )
    ? payment.transactions
    : [];

  if (transactions.length > 0) {
    const received = transactions.reduce(
      (sum, transaction) => {
        const status = String(
          transaction.status || ""
        ).toLowerCase();

        if (
          [
            "failed",
            "cancelled",
            "canceled",
          ].includes(status)
        ) {
          return sum;
        }

        const value = Math.max(
          0,
          firstNumber(transaction, [
            "amount",
            "paidAmount",
            "amountPaid",
            "received",
          ])
        );

        if (
          status === "refunded" ||
          String(
            transaction.type || ""
          ).toLowerCase() === "refund"
        ) {
          return sum - value;
        }

        return sum + value;
      },
      0
    );

    return Math.max(
      0,
      roundAmount(received)
    );
  }

  return Math.max(
    0,
    firstNumber(payment, [
      "paidAmount",
      "amountPaid",
      "receivedAmount",
      "amountReceived",
      "totalPaid",
      "paid",
      "advance",
      "advanceAmount",
    ])
  );
}

function linkedPayments(
  booking,
  payments
) {
  return payments.filter(
    (payment) =>
      payment.bookingId != null &&
      String(payment.bookingId) ===
        String(booking.id)
  );
}

function getBookingFinancials(
  booking,
  payments
) {
  const invoices = linkedPayments(
    booking,
    payments
  );

  const billed = roundAmount(
    invoices.reduce(
      (sum, payment) =>
        sum + paymentTotal(payment),
      0
    )
  );

  const received = roundAmount(
    invoices.reduce(
      (sum, payment) =>
        sum + paymentReceived(payment),
      0
    )
  );

  const pending = Math.max(
    0,
    roundAmount(billed - received)
  );

  let paymentStatus = "Not Invoiced";

  if (invoices.length) {
    if (
      billed > 0 &&
      received >= billed
    ) {
      paymentStatus = "Paid";
    } else if (received > 0) {
      paymentStatus = "Partial";
    } else {
      paymentStatus = "Pending";
    }
  }

  return {
    invoices,
    billed,
    received,
    pending,
    paymentStatus,
    invoice: invoices[0] || null,
  };
}

/* ==========================================
   BOOKING -> PAYMENT SYNC
========================================== */

function syncBookingInvoice(booking) {
  const payments = readArray(
    PAYMENT_KEY
  );

  const linked = linkedPayments(
    booking,
    payments
  );

  if (!linked.length) {
    return {
      updated: false,
      payments,
      requiresReview: false,
    };
  }

  const requestedTotal = Math.max(
    0,
    roundAmount(booking.totalAmount)
  );

  const totalReceived = roundAmount(
    linked.reduce(
      (sum, payment) =>
        sum + paymentReceived(payment),
      0
    )
  );

  const requiresReview =
    linked.length > 1 ||
    requestedTotal < totalReceived;

  const now = new Date().toISOString();

  const nextPayments = payments.map(
    (payment) => {
      if (
        payment.bookingId == null ||
        String(payment.bookingId) !==
          String(booking.id)
      ) {
        return payment;
      }

      const common = {
        ...payment,
        customerId:
          booking.customerId || "",
        customer: booking.customer,
        phone: booking.phone,
        updatedAt: now,
      };

      // Package field removed from form.
      // Preserve old invoice package data.
      if (
        booking.package !== undefined
      ) {
        common.packageName =
          booking.package;
      }

      if (linked.length !== 1) {
        return common;
      }

      if (
        requestedTotal <
        paymentReceived(payment)
      ) {
        return common;
      }

      return {
        ...common,
        total: requestedTotal,
      };
    }
  );

  saveArray(
    PAYMENT_KEY,
    nextPayments
  );

  return {
    updated: true,
    payments: nextPayments,
    requiresReview,
  };
}

/* ==========================================
   DEMO BOOKINGS
========================================== */

const dummyBookings = demoNames.map(
  (customer, index) => ({
    id: `BOOK-DEMO-${String(
      index + 1
    ).padStart(3, "0")}`,
    customerId: "",
    customer,
    phone: String(
      9876543210 - index * 137
    ),
    event:
      events[index % events.length],
    date: addDays(index * 2 - 8),
    time: [
      "09:00",
      "10:00",
      "11:30",
      "14:00",
      "16:00",
      "17:30",
    ][index % 6],
    location:
      locations[
        index % (locations.length - 1)
      ],
    photographer:
      photographers[
        index % photographers.length
      ],
    package:
      packages[index % packages.length],
    totalAmount: 0,
    status:
      statuses[index % statuses.length],
    createdAt: addDays(-index - 1),
    isDemo: true,
  })
);

function loadBookings() {
  try {
    const existing = readArray(
      STORAGE_KEY
    );

    if (
      localStorage.getItem(DEMO_KEY) ===
      "true"
    ) {
      return existing;
    }

    const ids = new Set(
      existing.map((item) =>
        String(item.id)
      )
    );

    const merged = [
      ...existing,
      ...dummyBookings.filter(
        (item) =>
          !ids.has(String(item.id))
      ),
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(merged)
    );

    localStorage.setItem(
      DEMO_KEY,
      "true"
    );

    return merged;
  } catch {
    return readArray(STORAGE_KEY);
  }
}

/* ==========================================
   COUNT ANIMATION
========================================== */

function useCountUp(
  target,
  duration = 1100
) {
  const [
    displayValue,
    setDisplayValue,
  ] = useState(0);

  const frameRef = useRef(null);

  const animate = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(
        frameRef.current
      );
    }

    const end = Math.max(
      0,
      Number(target) || 0
    );

    if (
      window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      setDisplayValue(end);
      return;
    }

    setDisplayValue(0);

    const startTime =
      performance.now();

    const tick = (now) => {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setDisplayValue(
        Math.round(end * eased)
      );

      if (progress < 1) {
        frameRef.current =
          requestAnimationFrame(tick);
      } else {
        setDisplayValue(end);
        frameRef.current = null;
      }
    };

    frameRef.current =
      requestAnimationFrame(tick);
  }, [target, duration]);

  useEffect(() => {
    animate();

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(
          frameRef.current
        );
      }
    };
  }, [animate]);

  return {
    displayValue,
    replay: animate,
  };
}

/* ==========================================
   THEMES
========================================== */

const statusTheme = {
  Confirmed: {
    badge:
      "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    event:
      "bg-[#e7f0ff] text-[#245da4] border-[#cfe1fc]",
  },
  Pending: {
    badge:
      "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    event:
      "bg-[#fff1d9] text-[#9b6816] border-[#f8e2b5]",
  },
  Completed: {
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    event:
      "bg-[#def8eb] text-[#167650] border-[#bcebd2]",
  },
  Cancelled: {
    badge:
      "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    event:
      "bg-[#ffe7eb] text-[#b5445e] border-[#ffd0d9]",
  },
};

const cardThemes = [
  {
    surface:
      "bg-[#deedff] border-[#bcd9ff]",
    icon:
      "bg-[#c4ddff] text-[#1e5da7]",
    accent: "bg-[#4287d4]",
  },
  {
    surface:
      "bg-[#ede3ff] border-[#d9c8ff]",
    icon:
      "bg-[#dfceff] text-[#7046b2]",
    accent: "bg-[#a17ce2]",
  },
  {
    surface:
      "bg-[#fff0cf] border-[#f4dfa9]",
    icon:
      "bg-[#ffe3aa] text-[#a16a17]",
    accent: "bg-[#e6b44d]",
  },
  {
    surface:
      "bg-[#dcf8e9] border-[#b6ebcf]",
    icon:
      "bg-[#c3efd8] text-[#197b55]",
    accent: "bg-[#42b78b]",
  },
];

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#dce5f1] bg-white px-4 py-3 text-sm text-[#10264d] outline-none transition focus:border-[#6b99d5] focus:ring-2 focus:ring-blue-100";

/* ==========================================
   STATUS BADGE
========================================== */

function StatusBadge({ status }) {
  const theme =
    statusTheme[status] ||
    statusTheme.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${theme.badge}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${theme.dot}`}
      />
      {status || "Pending"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const colors = {
    Paid:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    Partial:
      "bg-blue-50 text-blue-700 border-blue-200",
    Pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    "Not Invoiced":
      "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        colors[status] ||
        colors["Not Invoiced"]
      }`}
    >
      {status}
    </span>
  );
}

/* ==========================================
   PREMIUM 3D STAT CARD
========================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  index,
}) {
  const theme =
    cardThemes[
      index % cardThemes.length
    ];

  const {
    displayValue,
    replay,
  } = useCountUp(value, 1200);

  return (
    <button
      type="button"
      onClick={replay}
      aria-label={`${title}: ${value}`}
      style={{
        "--float-delay": `${
          index * -0.85
        }s`,
      }}
      className={`sr-stat-float group relative w-full min-w-0 overflow-hidden rounded-[22px] border p-4 text-left shadow-[0_8px_25px_rgba(20,50,90,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#285a99] sm:p-5 ${theme.surface}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/40 blur-xl" />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#526781] sm:text-sm">
            {title}
          </p>

          <h2 className="mt-3 text-[30px] font-black leading-none text-[#10264d] sm:text-[35px]">
            {displayValue.toLocaleString(
              "en-IN"
            )}
          </h2>

          <p className="mt-3 text-[10px] font-semibold text-[#61758d]">
            Studio booking overview
          </p>
        </div>

        <div
          className={`sr-stat-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 shadow-sm sm:h-12 sm:w-12 ${theme.icon}`}
        >
          <Icon size={22} />
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-[3px] w-full ${theme.accent}`}
      />
    </button>
  );
}

/* ==========================================
   SECTION HEADER
========================================== */

function DoubleShadeHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  count,
  alternate = false,
}) {
  return (
    <div
      className={`relative overflow-hidden border-b border-[#d3e4f9] px-4 py-5 sm:px-6 ${
        alternate
          ? "bg-gradient-to-r from-[#c5ddfb] via-[#d9e9ff] to-[#edf5ff]"
          : "bg-gradient-to-r from-[#d5e7ff] via-[#e3efff] to-[#f0f7ff]"
      }`}
    >
      <div className="pointer-events-none absolute -right-12 -top-20 h-44 w-44 rounded-full border border-white/60" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[#b5d3fa] text-[#285a99] shadow-sm sm:h-14 sm:w-14">
            <Icon size={24} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#557aa9]">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-lg font-black tracking-tight text-[#173f74] sm:text-xl">
              {title}
            </h2>

            <p className="mt-1 text-xs font-medium text-[#6485ac]">
              {description}
            </p>
          </div>
        </div>

        {count !== undefined && (
          <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-[#afcdf5] px-3 text-lg font-black text-[#173f74] shadow-sm">
            {String(count).padStart(
              2,
              "0"
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================
   BOOKING FORM
   NO PACKAGE FIELD
   NO BOOKING INFORMATION BOX
   NO MOVING ANIMATION
========================================== */

function BookingModal({
  booking,
  customers,
  payments,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState({
    ...emptyForm,
    ...booking,
    totalAmount:
      booking?.totalAmount ??
      booking?.total ??
      booking?.amount ??
      "",
  });

  const [error, setError] =
    useState("");

  const financials = useMemo(
    () =>
      booking?.id
        ? getBookingFinancials(
            booking,
            payments
          )
        : null,
    [booking, payments]
  );

  useEffect(() => {
    const previous =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previous;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  const update = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const selectCustomer = (id) => {
    if (!id) {
      setForm((previous) => ({
        ...previous,
        customerId: "",
      }));

      setError("");
      return;
    }

    const customer = customers.find(
      (item) =>
        String(item.id) ===
        String(id)
    );

    if (!customer) return;

    setForm((previous) => ({
      ...previous,
      customerId: String(
        customer.id
      ),
      customer:
        customerName(customer),
      phone:
        customerPhone(customer),
    }));

    setError("");
  };

  const submit = (event) => {
    event.preventDefault();

    const name = String(
      form.customer || ""
    ).trim();

    const phone = normalizePhone(
      form.phone
    );

    if (!name) {
      setError(
        "Please enter customer name."
      );
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      !form.date ||
      !form.time ||
      !parseDate(form.date)
    ) {
      setError(
        "Please select a valid booking date and time."
      );
      return;
    }

    const rawAmount = String(
      form.totalAmount ?? ""
    ).trim();

    if (
      rawAmount &&
      (
        !Number.isFinite(
          Number(rawAmount)
        ) ||
        Number(rawAmount) < 0
      )
    ) {
      setError(
        "Please enter a valid booking amount."
      );
      return;
    }

    const matchedCustomer =
      form.customerId
        ? customers.find(
            (customer) =>
              String(customer.id) ===
              String(form.customerId)
          )
        : customers.find(
            (customer) =>
              customerPhone(
                customer
              ) === phone
          );

    onSave({
      ...form,
      customerId: matchedCustomer
        ? String(
            matchedCustomer.id
          )
        : "",
      customer: name,
      phone,
      totalAmount: roundAmount(
        rawAmount || 0
      ),
    });
  };

  const fields = [
    {
      label: "Customer Name",
      name: "customer",
      icon: UserRound,
      placeholder:
        "Enter customer name",
      required: true,
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      placeholder:
        "Enter mobile number",
      required: true,
    },
    {
      label: "Event Type",
      name: "event",
      icon: Camera,
      options: events,
    },
    {
      label: "Booking Date",
      name: "date",
      icon: CalendarDays,
      type: "date",
      required: true,
    },
    {
      label: "Booking Time",
      name: "time",
      icon: Clock3,
      type: "time",
      required: true,
    },
    {
      label: "Location",
      name: "location",
      icon: MapPin,
      options: locations,
    },
    {
      label: "Photographer",
      name: "photographer",
      icon: Camera,
      options: photographers,
    },
    {
      label: "Booking Status",
      name: "status",
      icon: CheckCircle2,
      options: statuses,
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07182f]/65 p-3 backdrop-blur-[3px] sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[94dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-[25px] bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e7edf5] bg-gradient-to-r from-[#d5e7ff] to-[#f4f9ff] px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b5d3fa] text-[#285a99]">
              <CalendarPlus size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6686ad]">
                Studio Raw Picturez
              </p>

              <h2 className="mt-1 text-lg font-black text-[#173f74]">
                {booking?.id
                  ? "Edit Booking"
                  : "New Booking"}
              </h2>

              {booking?.date && (
                <p className="mt-1 text-xs font-semibold text-[#6586ad]">
                  {formatDate(
                    booking.date
                  )}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-[#d3e3f6] bg-white p-2.5 text-[#55779e] hover:bg-blue-50"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fbff] px-5 py-6 sm:px-7">

            {/* EXISTING CUSTOMER */}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                <span className="rounded-lg bg-[#e8f1ff] p-1.5 text-[#4077b4]">
                  <Link2 size={14} />
                </span>
                Select Existing Customer
              </span>

              <select
                value={
                  form.customerId || ""
                }
                onChange={(event) =>
                  selectCustomer(
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select customer / Enter manually
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={
                        customer.id
                      }
                      value={String(
                        customer.id
                      )}
                    >
                      {customerName(
                        customer
                      )}{" "}
                      -{" "}
                      {customerPhone(
                        customer
                      )}
                    </option>
                  )
                )}
              </select>

              <p className="mt-2 text-[11px] text-[#6485ac]">
                Existing customer select
                pannina name and phone
                auto-fill aagum.
              </p>
            </label>

            {/* FORM FIELDS */}

            {fields.map((field) => {
              const Icon =
                field.icon;

              return (
                <label
                  key={field.name}
                  className="block"
                >
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                    <span className="rounded-lg bg-[#e8f1ff] p-1.5 text-[#4077b4]">
                      <Icon size={14} />
                    </span>

                    {field.label}

                    {field.required && (
                      <span className="text-red-500">
                        *
                      </span>
                    )}
                  </span>

                  {field.options ? (
                    <select
                      value={
                        form[
                          field.name
                        ] || ""
                      }
                      onChange={(
                        event
                      ) =>
                        update(
                          field.name,
                          event.target
                            .value
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {field.options.map(
                        (option) => (
                          <option
                            key={
                              option
                            }
                            value={
                              option
                            }
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <input
                      type={
                        field.type ||
                        "text"
                      }
                      required={
                        field.required
                      }
                      value={
                        form[
                          field.name
                        ] || ""
                      }
                      onChange={(
                        event
                      ) => {
                        const value =
                          event.target
                            .value;

                        if (
                          field.name ===
                            "customer" ||
                          field.name ===
                            "phone"
                        ) {
                          setForm(
                            (
                              previous
                            ) => ({
                              ...previous,
                              [field.name]:
                                field.name ===
                                "phone"
                                  ? value
                                      .replace(
                                        /\D/g,
                                        ""
                                      )
                                      .slice(
                                        0,
                                        10
                                      )
                                  : value,
                              customerId:
                                "",
                            })
                          );

                          setError(
                            ""
                          );
                        } else {
                          update(
                            field.name,
                            value
                          );
                        }
                      }}
                      placeholder={
                        field.placeholder
                      }
                      className={
                        inputClass
                      }
                    />
                  )}
                </label>
              );
            })}

            {/* BOOKING AMOUNT */}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-xs font-bold text-[#38506f]">
                <span className="rounded-lg bg-[#e8f1ff] p-1.5 text-[#4077b4]">
                  <IndianRupee
                    size={14}
                  />
                </span>
                Total Booking Amount (₹)
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={
                  form.totalAmount ??
                  ""
                }
                onChange={(event) =>
                  update(
                    "totalAmount",
                    event.target.value
                  )
                }
                placeholder="Enter booking amount"
                className={inputClass}
              />

              <p className="mt-2 text-[11px] text-[#6485ac]">
                Payments-la booking
                select pannina amount
                auto-fill aagum.
              </p>
            </label>

            {/* PAYMENT CONNECTION */}

            {booking?.id && (
              <div className="rounded-2xl border border-[#dce8f8] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black text-[#173f74]">
                    Payment Connection
                  </p>

                  <PaymentBadge
                    status={
                      financials?.paymentStatus ||
                      "Not Invoiced"
                    }
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    [
                      "Billed",
                      financials?.billed ||
                        0,
                    ],
                    [
                      "Received",
                      financials?.received ||
                        0,
                    ],
                    [
                      "Pending",
                      financials?.pending ||
                        0,
                    ],
                  ].map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={
                          label
                        }
                        className="min-w-0 rounded-xl bg-[#edf5ff] p-3"
                      >
                        <p className="text-[10px] text-[#7890ac]">
                          {label}
                        </p>

                        <p className="mt-2 break-words text-xs font-black text-[#173f74]">
                          {money(
                            value
                          )}
                        </p>
                      </div>
                    )
                  )}
                </div>

                {financials?.invoice && (
                  <p className="mt-3 text-xs font-bold text-[#376aa8]">
                    Invoice:{" "}
                    {financials
                      .invoice
                      .invoice ||
                      financials
                        .invoice.id}
                  </p>
                )}

                {(financials?.invoices
                  .length || 0) >
                  1 && (
                  <p className="mt-3 text-xs font-semibold text-amber-700">
                    Multiple invoices
                    linked. Review
                    amounts in Payments.
                  </p>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#e4ecf7] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#dce5f1] px-6 py-3 text-sm font-bold text-[#5b7190] hover:bg-[#f5f9ff]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#173f74]"
            >
              <Save size={17} />
              Save Booking
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

/* ==========================================
   BOOKING CARD
========================================== */

function BookingCard({
  booking,
  index = 0,
  onEdit,
  onDelete,
  onStatus,
  financials,
}) {
  return (
    <article className="sr-booking-card group relative min-w-0 overflow-hidden rounded-[20px] border border-[#d5e5fa] bg-gradient-to-br from-[#e8f2ff] via-[#f1f7ff] to-[#e2efff] shadow-[0_5px_18px_rgba(43,92,153,0.05)]">
      <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#80aee7]" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7694b9]">
              Booking{" "}
              {String(
                index + 1
              ).padStart(2, "0")}
            </p>

            <h3 className="mt-2 truncate text-base font-black text-[#173f74]">
              {booking.customer ||
                "Customer"}
            </h3>
          </div>

          <StatusBadge
            status={
              booking.status
            }
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#d3e4f8] pt-4">
          {[
            [
              "Event Type",
              booking.event,
            ],
            [
              "Event Date",
              formatDate(
                booking.date
              ),
            ],
            [
              "Time",
              formatTime(
                booking.time
              ),
            ],
            [
              "Location",
              booking.location,
            ],
          ].map(
            ([label, value]) => (
              <div
                key={label}
                className="min-w-0 rounded-xl border border-[#dce9f8] bg-white/90 p-3"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#8a9fba]">
                  {label}
                </p>

                <p className="mt-1.5 break-words text-xs font-extrabold text-[#285a99]">
                  {value || "—"}
                </p>
              </div>
            )
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#dce9f8] bg-white/75 px-3 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase text-[#8a9fba]">
              Booking Amount
            </p>

            <p className="mt-1 text-xs font-black text-[#173f74]">
              {money(
                booking.totalAmount ??
                  booking.total ??
                  booking.amount ??
                  0
              )}
            </p>
          </div>

          <div className="text-right">
            <PaymentBadge
              status={
                financials?.paymentStatus ||
                "Not Invoiced"
              }
            />

            {(financials?.invoices
              ?.length || 0) >
              0 && (
              <p className="mt-1 text-[10px] font-bold text-[#6485ac]">
                Due:{" "}
                {money(
                  financials.pending
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={
              booking.status ||
              "Pending"
            }
            onChange={(event) =>
              onStatus(
                booking.id,
                event.target.value
              )
            }
            aria-label={`Status for ${booking.customer}`}
            className="min-w-0 flex-1 rounded-xl border border-[#cfdef2] bg-white px-3 py-2.5 text-xs font-bold text-[#285a99] outline-none focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={() =>
              onEdit(booking)
            }
            title="Edit Booking"
            className="rounded-xl border border-[#cddff6] bg-white p-2.5 text-[#356cae] transition hover:bg-[#dcecff]"
          >
            <Pencil size={17} />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(
                booking.id
              )
            }
            title="Delete Booking"
            className="rounded-xl border border-[#f5d7dc] bg-white p-2.5 text-[#d65c72] transition hover:bg-red-50"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function BookingCalendar() {
  const [bookings, setBookings] =
    useState(loadBookings);

  const [customers, setCustomers] =
    useState(() =>
      readArray(CUSTOMER_KEY)
    );

  const [payments, setPayments] =
    useState(() =>
      readArray(PAYMENT_KEY)
    );

  const bookingsRef =
    useRef(bookings);

  bookingsRef.current = bookings;

  const [month, setMonth] =
    useState(
      () =>
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        )
    );

  const [showForm, setShowForm] =
    useState(false);

  const [
    editingBooking,
    setEditingBooking,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("All");

  /* ========================================
     LIVE MODULE SYNC
  ======================================== */

  useEffect(() => {
    const refresh = (event) => {
      const key =
        event?.detail?.key ||
        event?.key;

      if (
        !key ||
        key === CUSTOMER_KEY
      ) {
        setCustomers(
          readArray(
            CUSTOMER_KEY
          )
        );
      }

      if (
        !key ||
        key === PAYMENT_KEY
      ) {
        setPayments(
          readArray(
            PAYMENT_KEY
          )
        );
      }

      if (
        !key ||
        key === STORAGE_KEY
      ) {
        const latest =
          readArray(
            STORAGE_KEY
          );

        if (
          JSON.stringify(
            latest
          ) !==
          JSON.stringify(
            bookingsRef.current
          )
        ) {
          bookingsRef.current =
            latest;

          setBookings(
            latest
          );
        }
      }
    };

    window.addEventListener(
      "storage",
      refresh
    );

    window.addEventListener(
      UPDATE_EVENT,
      refresh
    );

    window.addEventListener(
      "focus",
      refresh
    );

    return () => {
      window.removeEventListener(
        "storage",
        refresh
      );

      window.removeEventListener(
        UPDATE_EVENT,
        refresh
      );

      window.removeEventListener(
        "focus",
        refresh
      );
    };
  }, []);

  const commitBookings = (
    next
  ) => {
    try {
      saveArray(
        STORAGE_KEY,
        next
      );

      bookingsRef.current =
        next;

      setBookings(next);

      return true;
    } catch (error) {
      console.error(
        "Failed to save bookings:",
        error
      );

      window.alert(
        "Unable to save bookings in browser storage."
      );

      return false;
    }
  };

  /* ========================================
     FINANCIAL MAP
  ======================================== */

  const financialMap =
    useMemo(() => {
      const map =
        new Map();

      bookings.forEach(
        (booking) => {
          map.set(
            String(
              booking.id
            ),
            getBookingFinancials(
              booking,
              payments
            )
          );
        }
      );

      return map;
    }, [
      bookings,
      payments,
    ]);

  /* ========================================
     STATS
  ======================================== */

  const stats = useMemo(
    () => [
      {
        title:
          "Total Bookings",
        value:
          bookings.length,
        icon:
          CalendarDays,
      },
      {
        title:
          "Confirmed",
        value:
          bookings.filter(
            (booking) =>
              String(
                booking.status
              ).toLowerCase() ===
              "confirmed"
          ).length,
        icon:
          CalendarCheck2,
      },
      {
        title:
          "Pending",
        value:
          bookings.filter(
            (booking) =>
              String(
                booking.status
              ).toLowerCase() ===
              "pending"
          ).length,
        icon:
          Clock3,
      },
      {
        title:
          "Completed",
        value:
          bookings.filter(
            (booking) =>
              String(
                booking.status
              ).toLowerCase() ===
              "completed"
          ).length,
        icon:
          CheckCircle2,
      },
    ],
    [bookings]
  );

  /* ========================================
     SEARCH AND FILTER
  ======================================== */

  const filtered =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      return bookings.filter(
        (booking) => {
          const matchesSearch =
            [
              booking.customer,
              booking.phone,
              booking.event,
              booking.location,
              booking.photographer,
              booking.package,
              booking.id,
              booking.customerId,
            ].some(
              (value) =>
                String(
                  value || ""
                )
                  .toLowerCase()
                  .includes(
                    keyword
                  )
            );

          return (
            matchesSearch &&
            (
              filter ===
                "All" ||
              String(
                booking.status ||
                  ""
              ).toLowerCase() ===
                filter.toLowerCase()
            )
          );
        }
      );
    }, [
      bookings,
      search,
      filter,
    ]);

  /* ========================================
     UPCOMING BOOKINGS
  ======================================== */

  const upcoming =
    useMemo(
      () =>
        bookings
          .filter(
            (booking) => {
              const date =
                parseDate(
                  booking.date
                );

              const status =
                String(
                  booking.status ||
                    ""
                ).toLowerCase();

              return (
                date &&
                dateKey(
                  date
                ) >=
                  dateKey(
                    new Date()
                  ) &&
                ![
                  "completed",
                  "cancelled",
                  "canceled",
                ].includes(
                  status
                )
              );
            }
          )
          .sort(
            (a, b) =>
              String(
                a.date
              ).localeCompare(
                String(
                  b.date
                )
              ) ||
              String(
                a.time
              ).localeCompare(
                String(
                  b.time
                )
              )
          )
          .slice(
            0,
            6
          ),
      [bookings]
    );

  /* ========================================
     CALENDAR MAP
  ======================================== */

  const bookingMap =
    useMemo(() => {
      const map =
        new Map();

      bookings.forEach(
        (booking) => {
          const parsed =
            parseDate(
              booking.date
            );

          if (!parsed)
            return;

          const key =
            dateKey(
              parsed
            );

          if (
            !map.has(
              key
            )
          ) {
            map.set(
              key,
              []
            );
          }

          map
            .get(
              key
            )
            .push(
              booking
            );
        }
      );

      return map;
    }, [
      bookings,
    ]);

  /* ========================================
     CALENDAR DATES
  ======================================== */

  const firstDay =
    new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    );

  const daysInMonth =
    new Date(
      month.getFullYear(),
      month.getMonth() +
        1,
      0
    ).getDate();

  const cells = [
    ...Array(
      firstDay.getDay()
    ).fill(null),
    ...Array.from(
      {
        length:
          daysInMonth,
      },
      (_, index) =>
        index + 1
    ),
  ];

  while (
    cells.length %
      7 !==
    0
  ) {
    cells.push(
      null
    );
  }

  const monthPrefix =
    `${month.getFullYear()}-${String(
      month.getMonth() + 1
    ).padStart(2, "0")}`;

  const monthlyCount =
    bookings.filter(
      (booking) => {
        const parsed =
          parseDate(
            booking.date
          );

        return (
          parsed &&
          dateKey(
            parsed
          ).startsWith(
            monthPrefix
          )
        );
      }
    ).length;

  /* ========================================
     ACTIONS
  ======================================== */

  const changeMonth = (
    offset
  ) => {
    setMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() +
            offset,
          1
        )
    );
  };

  const openNew = (
    date = ""
  ) => {
    setCustomers(
      readArray(
        CUSTOMER_KEY
      )
    );

    setPayments(
      readArray(
        PAYMENT_KEY
      )
    );

    setEditingBooking({
      ...emptyForm,
      date,
    });

    setShowForm(
      true
    );
  };

  const openEdit = (
    booking
  ) => {
    const latestCustomers =
      readArray(
        CUSTOMER_KEY
      );

    const matched =
      findMatchingCustomer(
        latestCustomers,
        booking
      );

    setCustomers(
      latestCustomers
    );

    setPayments(
      readArray(
        PAYMENT_KEY
      )
    );

    setEditingBooking({
      ...booking,
      customerId:
        booking.customerId ||
        matched?.id ||
        "",
    });

    setShowForm(
      true
    );
  };

  const closeForm =
    useCallback(
      () => {
        setShowForm(
          false
        );

        setEditingBooking(
          null
        );
      },
      []
    );

  /* ========================================
     CREATE / UPDATE BOOKING
  ======================================== */

  const saveBooking = (
    data
  ) => {
    const now =
      new Date().toISOString();

    if (
      editingBooking?.id
    ) {
      const updatedBooking =
        {
          ...editingBooking,
          ...data,
          id:
            editingBooking.id,
          createdAt:
            editingBooking.createdAt ||
            now,
          updatedAt:
            now,
        };

      const next =
        bookingsRef.current.map(
          (booking) =>
            String(
              booking.id
            ) ===
            String(
              editingBooking.id
            )
              ? updatedBooking
              : booking
        );

      if (
        !commitBookings(
          next
        )
      ) {
        return;
      }

      try {
        const result =
          syncBookingInvoice(
            updatedBooking
          );

        if (
          result.updated
        ) {
          setPayments(
            result.payments
          );
        }

        if (
          result.requiresReview
        ) {
          window.alert(
            "Booking saved. Please review the linked invoice in Payments. Multiple invoices or received payments need manual amount adjustment."
          );
        }
      } catch (
        error
      ) {
        console.error(
          "Invoice sync failed:",
          error
        );

        window.alert(
          "Booking saved, but linked invoice could not be updated."
        );
      }

      closeForm();
      return;
    }

    const newBooking =
      {
        ...data,
        id:
          globalThis.crypto?.randomUUID?.() ||
          `BOOK-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
        createdAt:
          now,
        updatedAt:
          now,
      };

    if (
      commitBookings([
        newBooking,
        ...bookingsRef.current,
      ])
    ) {
      closeForm();
    }
  };

  /* ========================================
     DELETE BOOKING
  ======================================== */

  const deleteBooking = (
    id
  ) => {
    const latestPayments =
      readArray(
        PAYMENT_KEY
      );

    const linkedInvoices =
      latestPayments.filter(
        (payment) =>
          payment.bookingId !=
            null &&
          String(
            payment.bookingId
          ) ===
            String(
              id
            )
      );

    if (
      linkedInvoices.length
    ) {
      window.alert(
        "This booking has a linked payment invoice. Please remove or unlink the invoice in Payments before deleting the booking."
      );
      return;
    }

    if (
      !window.confirm(
        "Delete this booking?"
      )
    ) {
      return;
    }

    commitBookings(
      bookingsRef.current.filter(
        (booking) =>
          String(
            booking.id
          ) !==
          String(
            id
          )
      )
    );
  };

  /* ========================================
     CHANGE STATUS
  ======================================== */

  const changeStatus = (
    id,
    status
  ) => {
    commitBookings(
      bookingsRef.current.map(
        (booking) =>
          String(
            booking.id
          ) ===
          String(
            id
          )
            ? {
                ...booking,
                status,
                updatedAt:
                  new Date().toISOString(),
              }
            : booking
      )
    );
  };

  /* ========================================
     RENDER
  ======================================== */

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f7f9fd] px-3 py-5 text-[#10264d] sm:px-5 lg:px-7">
      <style>{`
        @keyframes srFloat3D {
          0%, 100% {
            transform:
              perspective(1100px)
              translateY(0)
              rotateX(0deg);
          }

          50% {
            transform:
              perspective(1100px)
              translateY(-7px)
              rotateX(1.2deg);
          }
        }

        @keyframes srCalendarGlow {
          0%, 100% {
            box-shadow:
              0 12px 40px
              rgba(22,53,96,.07);
          }

          50% {
            box-shadow:
              0 18px 45px
              rgba(40,90,153,.12);
          }
        }

        @keyframes srCardShine {
          0% {
            transform:
              translateX(-150%)
              skewX(-18deg);
          }

          100% {
            transform:
              translateX(350%)
              skewX(-18deg);
          }
        }

        .sr-stat-float {
          animation:
            srFloat3D
            5.5s
            ease-in-out
            infinite;

          animation-delay:
            var(--float-delay, 0s);

          transform-style:
            preserve-3d;

          transition:
            box-shadow .3s ease,
            filter .3s ease;
        }

        .sr-stat-float:hover {
          animation-play-state:
            paused;

          filter:
            saturate(1.08);

          box-shadow:
            0 18px 38px
            rgba(22,53,96,.16);
        }

        .sr-stat-icon {
          transition:
            transform .35s ease;
        }

        .sr-stat-float:hover
        .sr-stat-icon {
          transform:
            translateZ(16px)
            rotate(-8deg)
            scale(1.1);
        }

        .sr-calendar-premium {
          animation:
            srCalendarGlow
            7s ease-in-out infinite;
        }

        .sr-booking-card {
          position: relative;

          transform-style:
            preserve-3d;

          transition:
            transform .35s ease,
            box-shadow .35s ease,
            border-color .35s ease;
        }

        .sr-booking-card:hover {
          transform:
            perspective(1000px)
            translateY(-7px)
            rotateX(2deg);

          border-color:
            #abcdf4;

          box-shadow:
            0 20px 38px
            rgba(43,92,153,.15);
        }

        .sr-calendar-day {
          transform-style:
            preserve-3d;

          transition:
            transform .3s ease,
            border-color .3s ease,
            box-shadow .3s ease,
            background .3s ease;
        }

        .sr-calendar-day:hover {
          transform:
            perspective(900px)
            translateY(-5px)
            rotateX(4deg);

          border-color:
            #8fb9ee;

          background:
            #f0f7ff;

          box-shadow:
            0 15px 30px
            rgba(30,70,130,.14);
        }

        .sr-calendar-event {
          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .sr-calendar-event:hover {
          transform:
            translateX(3px)
            translateZ(6px);

          box-shadow:
            0 5px 12px
            rgba(30,70,130,.12);
        }

        .sr-section-3d {
          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .sr-section-3d:hover {
          box-shadow:
            0 18px 42px
            rgba(30,70,130,.11);
        }

        @media (prefers-reduced-motion: reduce) {
          .sr-stat-float,
          .sr-calendar-premium {
            animation: none !important;
          }

          .sr-booking-card,
          .sr-calendar-day,
          .sr-calendar-event,
          .sr-stat-icon,
          .sr-section-3d {
            transition: none !important;
          }

          .sr-booking-card:hover,
          .sr-calendar-day:hover,
          .sr-calendar-event:hover {
            transform: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1800px] space-y-6">

        {/* NEW BOOKING */}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() =>
              openNew()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#285a99] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#173f74]"
          >
            <Plus size={18} />
            New Booking
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map(
            (
              stat,
              index
            ) => (
              <StatCard
                key={
                  stat.title
                }
                {...stat}
                index={
                  index
                }
              />
            )
          )}
        </div>

        {/* PREMIUM CALENDAR */}

        <section className="sr-calendar-premium overflow-hidden rounded-[26px] border border-[#dce6f4] bg-white shadow-[0_12px_40px_rgba(22,53,96,0.07)]">
          <div className="h-1 bg-gradient-to-r from-[#8ab9f6] via-[#b4a0ed] to-[#91dfc0]" />

          <div className="flex flex-col gap-5 border-b border-[#e8eef7] bg-gradient-to-r from-[#f1f7ff] via-white to-[#f8f4ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-[#d7e6fa] bg-[#e4efff] text-[#2e65a7] shadow-sm">
                <CalendarRange
                  size={26}
                />
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8298b7]">
                  Photography Calendar
                </p>

                <h2 className="mt-1 text-[22px] font-black tracking-tight text-[#10264d] sm:text-[27px]">
                  {month.toLocaleString(
                    "en-IN",
                    {
                      month:
                        "long",
                      year:
                        "numeric",
                    }
                  )}
                </h2>

                <p className="mt-1 text-xs text-[#8194ae]">
                  Click any date to
                  create a booking
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-[#dce8f8] bg-white px-4 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f2ff] text-[#3869a9]">
                  <CalendarCheck2
                    size={18}
                  />
                </div>

                <div>
                  <p className="text-lg font-black leading-none text-[#10264d]">
                    {
                      monthlyCount
                    }
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-[#8a9bb0]">
                    Monthly Bookings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-2xl border border-[#e1e9f4] bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() =>
                    changeMonth(
                      -1
                    )
                  }
                  aria-label="Previous month"
                  className="rounded-xl p-2.5 text-[#536f91] transition hover:bg-[#eaf3ff]"
                >
                  <ChevronLeft
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const today =
                      new Date();

                    setMonth(
                      new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                      )
                    );
                  }}
                  className="rounded-xl bg-[#285a99] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#173f74]"
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() =>
                    changeMonth(
                      1
                    )
                  }
                  aria-label="Next month"
                  className="rounded-xl p-2.5 text-[#536f91] transition hover:bg-[#eaf3ff]"
                >
                  <ChevronRight
                    size={19}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* LEGEND */}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-[#edf1f7] bg-white px-4 py-4 sm:px-6">
            {statuses.map(
              (status) => (
                <div
                  key={
                    status
                  }
                  className="flex items-center gap-2 text-[11px] font-semibold text-[#657992]"
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusTheme[
                        status
                      ].dot
                    }`}
                  />

                  {status}
                </div>
              )
            )}
          </div>

          {/* CALENDAR GRID */}

          <div className="bg-[#fcfdff] p-2.5 sm:p-5 lg:p-6">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 lg:gap-3">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map(
                (day) => (
                  <div
                    key={
                      day
                    }
                    className="rounded-xl border border-[#e4ebf5] bg-[#edf4ff] py-3.5 text-center text-[10px] font-extrabold uppercase tracking-wide text-[#5679a4] sm:text-xs"
                  >
                    {day}
                  </div>
                )
              )}

              {cells.map(
                (
                  day,
                  index
                ) => {
                  if (
                    !day
                  ) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[78px] rounded-2xl border border-dashed border-[#edf1f7] bg-[#f8faff] sm:min-h-[125px] lg:min-h-[155px]"
                      />
                    );
                  }

                  const date =
                    dateKey(
                      new Date(
                        month.getFullYear(),
                        month.getMonth(),
                        day
                      )
                    );

                  const dayBookings =
                    bookingMap.get(
                      date
                    ) ||
                    [];

                  const isToday =
                    date ===
                    dateKey(
                      new Date()
                    );

                  return (
                    <button
                      key={
                        date
                      }
                      type="button"
                      onClick={() =>
                        openNew(
                          date
                        )
                      }
                      aria-label={`Add booking for ${formatDate(
                        date
                      )}`}
                      className={`sr-calendar-day group relative flex min-h-[78px] min-w-0 flex-col overflow-hidden rounded-2xl border p-1.5 text-left sm:min-h-[125px] sm:p-3 lg:min-h-[155px] lg:p-3.5 ${
                        isToday
                          ? "border-[#9fbfea] bg-[#eff6ff] shadow-[0_5px_15px_rgba(43,95,165,0.07)]"
                          : dayBookings.length
                          ? "border-[#dce7f6] bg-white"
                          : "border-[#e8edf5] bg-white"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold sm:h-9 sm:w-9 sm:text-sm ${
                            isToday
                              ? "bg-[#285a99] text-white shadow-sm"
                              : "bg-[#f0f5fc] text-[#47617f] group-hover:bg-[#dceaff] group-hover:text-[#285c9b]"
                          }`}
                        >
                          {
                            day
                          }
                        </span>

                        {dayBookings.length >
                          0 && (
                          <span className="rounded-lg border border-[#d6e5f9] bg-[#e9f3ff] px-1.5 py-1 text-[9px] font-extrabold text-[#3c6fae] sm:px-2 sm:text-[10px]">
                            {
                              dayBookings.length
                            }
                          </span>
                        )}
                      </div>

                      {dayBookings.length >
                        0 && (
                        <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                          {dayBookings
                            .slice(
                              0,
                              4
                            )
                            .map(
                              (
                                booking
                              ) => (
                                <span
                                  key={
                                    booking.id
                                  }
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    statusTheme[
                                      booking
                                        .status
                                    ]
                                      ?.dot ||
                                    "bg-slate-400"
                                  }`}
                                />
                              )
                            )}
                        </div>
                      )}

                      <div className="mt-3 hidden w-full min-w-0 space-y-1.5 sm:block">
                        {dayBookings
                          .slice(
                            0,
                            2
                          )
                          .map(
                            (
                              booking
                            ) => (
                              <div
                                key={
                                  booking.id
                                }
                                title={`${booking.customer} - ${booking.event}`}
                                className={`sr-calendar-event flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-[10px] font-bold ${
                                  statusTheme[
                                    booking
                                      .status
                                  ]
                                    ?.event ||
                                  "border-slate-100 bg-slate-50 text-slate-600"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                    statusTheme[
                                      booking
                                        .status
                                    ]
                                      ?.dot ||
                                    "bg-slate-400"
                                  }`}
                                />

                                <span className="min-w-0 truncate">
                                  {
                                    booking.customer
                                  }
                                </span>
                              </div>
                            )
                          )}

                        {dayBookings.length >
                          2 && (
                          <p className="pl-1 text-[10px] font-bold text-[#6686b2]">
                            +
                            {dayBookings.length -
                              2}{" "}
                            more
                          </p>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2 hidden h-7 w-7 items-center justify-center rounded-lg bg-[#dceaff] text-[#3266a7] opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex">
                        <Plus
                          size={15}
                        />
                      </div>

                      {isToday && (
                        <span className="absolute bottom-2 left-2 hidden rounded-md bg-[#dceaff] px-2 py-0.5 text-[9px] font-extrabold text-[#376aa8] sm:block">
                          TODAY
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf1f7] bg-[#f9fbff] px-5 py-4">
            <p className="flex items-center gap-2 text-[11px] font-medium text-[#8b9db4]">
              <CalendarPlus
                size={14}
              />
              Select any date to
              create a new booking
            </p>

            <p className="text-[11px] font-extrabold tracking-wide text-[#7391b7]">
              STUDIO RAW PICTUREZ
            </p>
          </div>
        </section>

        {/* UPCOMING SHOOTS */}

        <section className="sr-section-3d overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff] shadow-[0_8px_28px_rgba(43,92,153,0.06)]">
          <DoubleShadeHeader
            eyebrow="Studio Schedule"
            title="Upcoming Shoots"
            description="Scheduled customer photography events"
            icon={
              CalendarDays
            }
            count={
              upcoming.length
            }
          />

          <div className="p-4 sm:p-6">
            {upcoming.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {upcoming.map(
                  (
                    booking,
                    index
                  ) => (
                    <BookingCard
                      key={
                        booking.id
                      }
                      booking={
                        booking
                      }
                      index={
                        index
                      }
                      onEdit={
                        openEdit
                      }
                      onDelete={
                        deleteBooking
                      }
                      onStatus={
                        changeStatus
                      }
                      financials={financialMap.get(
                        String(
                          booking.id
                        )
                      )}
                    />
                  )
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#cbdff8] bg-[#eaf3ff] p-10 text-center">
                <CalendarDays
                  size={30}
                  className="mx-auto text-[#7ca5d8]"
                />

                <p className="mt-3 text-sm font-bold text-[#55779e]">
                  No upcoming bookings
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ALL BOOKINGS */}

        <section className="sr-section-3d overflow-hidden rounded-[25px] border border-[#d4e4fa] bg-[#f8fbff] shadow-[0_8px_28px_rgba(43,92,153,0.06)]">
          <DoubleShadeHeader
            eyebrow="Booking Management"
            title="All Bookings"
            description="Manage customer bookings and assignments"
            icon={
              ClipboardList
            }
            count={
              bookings.length
            }
            alternate
          />

          {/* SEARCH AND FILTER */}

          <div className="border-b border-[#e0eaf7] bg-[#f4f9ff] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-[#6685ab]">
                {
                  filtered.length
                }{" "}
                bookings found
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"
                  />

                  <input
                    type="search"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search bookings..."
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8da5c2]"
                  />

                  <select
                    value={
                      filter
                    }
                    onChange={(
                      event
                    ) =>
                      setFilter(
                        event.target
                          .value
                      )
                    }
                    className={`${inputClass} pl-10`}
                  >
                    <option value="All">
                      All Status
                    </option>

                    {statuses.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="bg-[#e1eeff] text-[11px] font-extrabold uppercase tracking-wide text-[#557ba9]">
                  <th className="px-5 py-4">
                    Customer
                  </th>
                  <th className="px-5 py-4">
                    Event
                  </th>
                  <th className="px-5 py-4">
                    Date & Time
                  </th>
                  <th className="px-5 py-4">
                    Location
                  </th>
                  <th className="px-5 py-4">
                    Photographer
                  </th>
                  <th className="px-5 py-4">
                    Payment
                  </th>
                  <th className="px-5 py-4">
                    Status
                  </th>
                  <th className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#dce8f8]">
                {filtered.map(
                  (
                    booking,
                    index
                  ) => {
                    const financials =
                      financialMap.get(
                        String(
                          booking.id
                        )
                      );

                    return (
                      <tr
                        key={
                          booking.id
                        }
                        className={`transition hover:bg-[#dcecff] ${
                          index %
                            2 ===
                          0
                            ? "bg-[#f8fbff]"
                            : "bg-[#edf5ff]"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <p className="text-xs font-extrabold text-[#173f74]">
                            {
                              booking.customer
                            }
                          </p>

                          <p className="mt-1 text-[11px] text-[#8a9fba]">
                            {
                              booking.phone
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-[#385b85]">
                          {
                            booking.event
                          }
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-[#173f74]">
                            {formatDate(
                              booking.date
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-[#8a9fba]">
                            {formatTime(
                              booking.time
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-xs text-[#55779e]">
                          {
                            booking.location
                          }
                        </td>

                        <td className="px-5 py-4 text-xs text-[#55779e]">
                          {
                            booking.photographer
                          }
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <PaymentBadge
                              status={
                                financials?.paymentStatus ||
                                "Not Invoiced"
                              }
                            />

                            {(financials
                              ?.invoices
                              ?.length ||
                              0) >
                              0 && (
                              <p className="text-[10px] font-bold text-[#6485ac]">
                                Due:{" "}
                                {money(
                                  financials.pending
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={
                              booking.status ||
                              "Pending"
                            }
                            onChange={(
                              event
                            ) =>
                              changeStatus(
                                booking.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="max-w-[135px] rounded-xl border border-[#cfdef2] bg-white px-2 py-2 text-xs font-bold text-[#285a99] outline-none"
                          >
                            {statuses.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  booking
                                )
                              }
                              title="Edit"
                              className="rounded-xl border border-[#d3e3f7] bg-white p-2.5 text-[#356cae] hover:bg-[#dcecff]"
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteBooking(
                                  booking.id
                                )
                              }
                              title="Delete"
                              className="rounded-xl border border-[#f5d7dc] bg-white p-2.5 text-[#d65c72] hover:bg-red-50"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}

          <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
            {filtered.map(
              (
                booking,
                index
              ) => (
                <BookingCard
                  key={
                    booking.id
                  }
                  booking={
                    booking
                  }
                  index={
                    index
                  }
                  onEdit={
                    openEdit
                  }
                  onDelete={
                    deleteBooking
                  }
                  onStatus={
                    changeStatus
                  }
                  financials={financialMap.get(
                    String(
                      booking.id
                    )
                  )}
                />
              )
            )}
          </div>

          {!filtered.length && (
            <div className="py-12 text-center">
              <Search
                size={28}
                className="mx-auto text-[#91afd2]"
              />

              <p className="mt-3 text-sm font-bold text-[#6685ab]">
                No bookings found
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch(
                    ""
                  );

                  setFilter(
                    "All"
                  );
                }}
                className="mt-2 text-xs font-bold text-[#356cae]"
              >
                Clear Filters
              </button>
            </div>
          )}

          <div className="border-t border-[#dce8f8] bg-[#eaf3ff] px-5 py-4 text-xs font-medium text-[#6685ab]">
            Showing{" "}
            {
              filtered.length
            }{" "}
            of{" "}
            {
              bookings.length
            }{" "}
            bookings
          </div>
        </section>

        <p className="pb-3 text-center text-[11px] font-semibold text-[#9aabc0]">
          Studio Raw Picturez ·
          Booking Management
        </p>
      </div>

      {/* BOOKING MODAL */}

      {showForm && (
        <BookingModal
          booking={
            editingBooking
          }
          customers={
            customers
          }
          payments={
            payments
          }
          onClose={
            closeForm
          }
          onSave={
            saveBooking
          }
        />
      )}
    </div>
  );
}
