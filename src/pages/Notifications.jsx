
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { createPortal } from "react-dom";
import {
  Bell, BellRing, Plus, Search, X, Pencil, Trash2,
  Clock3, CalendarDays, CheckCircle2, AlertTriangle,
  Filter, RefreshCw, Eye, ChevronDown, Check, Save,
  UserRound, MessageSquare, ClipboardList, Camera,
  Video, PackageCheck, Users, BookOpen, Send,
  Sparkles, ArrowUpRight, ShieldCheck, Zap,
} from "lucide-react";

/* ==========================================
   STORAGE & OPTIONS
========================================== */

const STORAGE_KEY = "studioraw_notifications";
const SOUND_KEY = "studioraw_notification_sounds";
const UPDATE_EVENT = "studioraw:data-updated";

const MODULES = [
  "Enquiries",
  "Wedding Photography",
  "Wedding Videography",
  "Bookings",
  "Customers",
  "Videography",
  "Deliveries",
  "Internal",
];

const TYPES = [
  "New Enquiry",
  "Customer Follow-up",
  "Booking Confirmation",
  "Payment Reminder",
  "Photoshoot Reminder",
  "Video Editing",
  "Photo Selection",
  "Album Delivery",
  "Video Delivery",
  "Internal Task",
  "Other",
];

const CHANNELS = ["WhatsApp", "SMS", "Email", "In-App"];
const STATUSES = ["Pending", "In Progress", "Sent", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const MODULE_CONFIG = [
  {
    module: "Enquiries",
    type: "New Enquiry",
    titles: [
      "New Wedding Photography Enquiry",
      "Birthday Photoshoot Enquiry",
      "Engagement Photography Enquiry",
      "Maternity Photoshoot Enquiry",
      "Baby Photography Enquiry",
      "Reception Photography Enquiry",
      "Pre-Wedding Shoot Enquiry",
      "Outdoor Couple Shoot Enquiry",
      "Corporate Event Enquiry",
      "Traditional Photography Enquiry",
      "Candid Photography Enquiry",
      "Family Portrait Enquiry",
      "Wedding Package Enquiry",
      "Anniversary Photography Enquiry",
      "Studio Portrait Enquiry",
      "Wedding Photography Quotation",
      "Event Photography Package Request",
      "New Customer Photography Enquiry",
      "Wedding Album Package Enquiry",
    ],
  },
  {
    module: "Wedding Photography",
    type: "Photoshoot Reminder",
    titles: [
      "Wedding Shoot Date Confirmation",
      "Bride Photography Schedule",
      "Groom Photography Schedule",
      "Pre-Wedding Outdoor Shoot",
      "Wedding Venue Confirmation",
      "Candid Photography Preparation",
      "Traditional Photography Planning",
      "Reception Photography Schedule",
      "Wedding Photography Team Allocation",
      "Couple Portrait Session",
      "Wedding Camera Equipment Check",
      "Wedding Photography Follow-up",
      "Wedding Shoot Timing Reminder",
      "Wedding Photography Package Approval",
      "Wedding Photography Final Confirmation",
      "Bride Makeup Photography",
      "Wedding Group Photography",
      "Wedding Photography Backup",
    ],
  },
  {
    module: "Wedding Videography",
    type: "Customer Follow-up",
    titles: [
      "Wedding Videography Enquiry",
      "Cinematic Wedding Film Enquiry",
      "Wedding Trailer Package Enquiry",
      "Reception Videography Enquiry",
      "Traditional Wedding Video Enquiry",
      "Wedding Videography Booking",
      "Videography Team Confirmation",
      "Wedding Drone Video Enquiry",
      "Wedding Highlight Film Planning",
      "Wedding Video Shoot Schedule",
      "Wedding Videography Quotation",
      "Cinematic Video Package Follow-up",
      "Wedding Video Equipment Check",
      "Wedding Video Location Confirmation",
      "Wedding Videography Final Reminder",
      "Engagement Videography Confirmation",
      "Wedding Film Package Approval",
      "Reception Video Team Allocation",
      "Cinematic Wedding Video Follow-up",
    ],
  },
  {
    module: "Bookings",
    type: "Booking Confirmation",
    titles: [
      "Wedding Booking Confirmation",
      "Engagement Booking Confirmation",
      "Birthday Photography Booking",
      "Reception Photography Booking",
      "Pre-Wedding Booking Confirmation",
      "Maternity Shoot Booking",
      "Baby Shoot Booking",
      "Corporate Event Booking",
      "Wedding Advance Payment",
      "Photography Booking Follow-up",
      "Wedding Package Booking",
      "Couple Shoot Booking",
      "Traditional Photography Booking",
      "Candid Photography Booking",
      "Booking Date Confirmation",
      "Wedding Venue Booking Details",
      "Event Schedule Confirmation",
      "Photography Team Booking",
      "Booking Advance Confirmation",
    ],
  },
  {
    module: "Customers",
    type: "Customer Follow-up",
    titles: [
      "Customer Payment Reminder",
      "Customer Profile Verification",
      "Wedding Customer Follow-up",
      "Customer Package Confirmation",
      "Customer Contact Update",
      "Customer Feedback Request",
      "Customer Album Approval",
      "Customer Video Approval",
      "Customer Advance Payment",
      "Customer Balance Payment",
      "Customer Event Details Confirmation",
      "Customer Delivery Follow-up",
      "Customer Photo Selection Reminder",
      "Customer Booking Status Update",
      "Customer Service Follow-up",
      "Customer Address Confirmation",
      "Customer Wedding Date Reminder",
      "Customer Package Balance Follow-up",
    ],
  },
  {
    module: "Videography",
    type: "Video Editing",
    titles: [
      "Wedding Highlight Video Editing",
      "Birthday Video Editing",
      "Engagement Video Editing",
      "Reception Video Editing",
      "Cinematic Wedding Trailer",
      "Wedding Film Color Grading",
      "Wedding Video Audio Mixing",
      "Wedding Video Review",
      "Customer Video Approval",
      "Wedding Video Export",
      "Event Video Backup",
      "Video Editing Team Assignment",
      "Wedding Video Final Cut",
      "Cinematic Trailer Approval",
      "Completed Video Quality Check",
      "Traditional Wedding Video Editing",
      "Reception Highlight Video",
      "Wedding Film Final Approval",
    ],
  },
  {
    module: "Deliveries",
    type: "Album Delivery",
    titles: [
      "Wedding Album Delivery",
      "Engagement Album Delivery",
      "Birthday Album Delivery",
      "Wedding Video Delivery",
      "Photo Frame Delivery",
      "Wedding Album Printing",
      "Photo Selection Pending",
      "Customer Album Pickup",
      "Album Courier Dispatch",
      "Video Delivery Link Sharing",
      "Wedding Album Design Approval",
      "Photo Selection Return Reminder",
      "Album Delivery Date Confirmation",
      "Printed Album Quality Check",
      "Final Wedding Package Delivery",
      "Reception Album Delivery",
      "Wedding Photo Drive Delivery",
      "Customer Photo Selection Approval",
      "Album Courier Tracking Update",
      "Wedding Video Link Delivery",
      "Printed Photo Frame Collection",
      "Album Dispatch Confirmation",
      "Final Album Handover",
    ],
  },
  {
    module: "Internal",
    type: "Internal Task",
    titles: ["Studio Camera Maintenance"],
  },
];

const CUSTOMERS = [
  "Arun Kumar", "Priya Sharma", "Vijay Raj", "Divya R",
  "Karthik S", "Meena Devi", "Rahul Kumar", "Anitha S",
  "Sanjay R", "Deepa R", "Manoj R", "Keerthana R",
  "Ajith & Kavya", "Harini P", "Praveen Kumar", "Swetha S",
  "Anu Joseph", "Sathish P", "Nithya Kumar", "Lakshmi N",
];

const DEMO_STATUSES = [
  "Pending", "In Progress", "Pending", "Sent", "Completed",
];
const DEMO_PRIORITIES = [
  "High", "Medium", "Urgent", "Low", "Medium",
];
const DEMO_CHANNELS = ["WhatsApp", "SMS", "Email", "In-App"];

/* ==========================================
   HELPERS
========================================== */

function localDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

const today = () => localDate(new Date());

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function isOverdue(item) {
  return Boolean(
    item.dueDate &&
    String(item.dueDate).slice(0, 10) < today() &&
    !["Completed", "Sent"].includes(item.status)
  );
}

function makeDemoData() {
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  return MODULE_CONFIG.flatMap((group, moduleIndex) =>
    group.titles.map((title, index) => {
      const due = new Date(base);
      due.setDate(due.getDate() + ((index + moduleIndex * 2) % 17) - 5);

      const created = new Date(base);
      created.setDate(created.getDate() - (index % 8) - 1);

      let type = group.type;
      if (group.module === "Deliveries") {
        type = title.toLowerCase().includes("video")
          ? "Video Delivery"
          : title.toLowerCase().includes("selection")
          ? "Photo Selection"
          : "Album Delivery";
      }

      if (
        ["Bookings", "Customers"].includes(group.module) &&
        title.toLowerCase().includes("payment")
      ) {
        type = "Payment Reminder";
      }

      return {
        id: `DEMO-${moduleIndex + 1}-${index + 1}`,
        title,
        message: `${title}. Contact the customer or responsible studio team, confirm the required details and update the reminder status.`,
        module: group.module,
        type,
        channel: DEMO_CHANNELS[(index + moduleIndex) % DEMO_CHANNELS.length],
        status: DEMO_STATUSES[(index + moduleIndex) % DEMO_STATUSES.length],
        priority: DEMO_PRIORITIES[(index + moduleIndex) % DEMO_PRIORITIES.length],
        customer:
          group.module === "Internal"
            ? "Studio Team"
            : CUSTOMERS[(index * 3 + moduleIndex) % CUSTOMERS.length],
        dueDate: localDate(due),
        createdAt: localDate(created),
        demo: true,
      };
    })
  );
}

function detectModule(item) {
  if (MODULES.includes(item.module)) return item.module;

  const text = [
    item.title, item.message, item.type, item.category, item.source,
  ].filter(Boolean).join(" ").toLowerCase();

  if (
    text.includes("wedding videography") ||
    text.includes("wedding video enquiry") ||
    text.includes("drone enquiry")
  ) return "Wedding Videography";

  if (
    text.includes("wedding photography") ||
    text.includes("photoshoot") ||
    text.includes("photo shoot")
  ) return "Wedding Photography";

  if (
    text.includes("delivery") ||
    text.includes("album") ||
    text.includes("courier") ||
    text.includes("photo selection")
  ) return "Deliveries";

  if (
    text.includes("editing") ||
    text.includes("videography") ||
    text.includes("cinematic") ||
    text.includes("video")
  ) return "Videography";

  if (text.includes("booking") || text.includes("appointment")) {
    return "Bookings";
  }

  if (
    text.includes("customer") ||
    text.includes("payment") ||
    text.includes("balance")
  ) return "Customers";

  if (text.includes("maintenance") || text.includes("internal")) {
    return "Internal";
  }

  return "Enquiries";
}

function loadData() {
  const demoRecords = makeDemoData();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const existing = parsed.map((item) => ({
          ...item,
          module: detectModule(item),
        }));

        const ids = new Set(existing.map((item) => String(item.id)));
        const missing = demoRecords.filter(
          (item) => !ids.has(String(item.id))
        );

        return {
          data: [...existing, ...missing],
          demo: missing.length > 0,
        };
      }
    }
  } catch (error) {
    console.error("Could not load notifications:", error);
  }

  return { data: demoRecords, demo: true };
}

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `NOT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const blankForm = () => ({
  title: "",
  message: "",
  module: "",
  type: "",
  channel: "",
  status: "",
  priority: "",
  customer: "",
  dueDate: today(),
});

const inputClass =
  "block w-full min-w-0 rounded-2xl border border-[#d8e5f5] bg-white px-4 py-3 text-sm font-medium text-[#10264d] outline-none transition-all duration-300 placeholder:text-[#9aacc2] hover:border-[#b8cfe9] focus:border-[#3974b7] focus:ring-4 focus:ring-[#e6f1ff]";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[#526f91]";

const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-800",
  Sent: "border-violet-200 bg-violet-50 text-violet-800",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const priorityClasses = {
  Low: "border-slate-200 bg-slate-50 text-slate-700",
  Medium: "border-blue-200 bg-blue-50 text-blue-800",
  High: "border-orange-200 bg-orange-50 text-orange-800",
  Urgent: "border-rose-200 bg-rose-50 text-rose-800",
};

const moduleIcons = {
  Enquiries: MessageSquare,
  "Wedding Photography": Camera,
  "Wedding Videography": Video,
  Bookings: BookOpen,
  Customers: Users,
  Videography: Video,
  Deliveries: PackageCheck,
  Internal: Bell,
};

const moduleColors = {
  Enquiries: "from-[#e8f2ff] to-[#d9eaff] text-[#2563a3]",
  "Wedding Photography": "from-[#f0eaff] to-[#e4dcff] text-[#7051b0]",
  "Wedding Videography": "from-[#e5f5ff] to-[#d4efff] text-[#197ea5]",
  Bookings: "from-[#e7f8f0] to-[#d7f2e6] text-[#188265]",
  Customers: "from-[#fff1e6] to-[#ffe5d1] text-[#b66c2e]",
  Videography: "from-[#e9edff] to-[#dce4ff] text-[#536ab2]",
  Deliveries: "from-[#e5f8f6] to-[#d3f0eb] text-[#168b7a]",
  Internal: "from-[#f0f3fa] to-[#e4eaf5] text-[#526b92]",
};

/* ==========================================
   PREMIUM STYLES & ANIMATIONS
========================================== */

const PAGE_CSS = `
  .studio-notifications-premium {
    color-scheme: light;
    background: #f5f8fd;
    color: #10264d;
  }

  .studio-notifications-premium input,
  .studio-notifications-premium textarea,
  .studio-notifications-premium select {
    color-scheme: light;
  }

  .studio-notifications-premium input::placeholder,
  .studio-notifications-premium textarea::placeholder {
    color: #98aac0;
  }

  .studio-notifications-premium option {
    background: white;
    color: #10264d;
  }

  @keyframes snFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes snScaleIn {
    from { opacity: 0; transform: scale(.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes snProgress {
    from { width: 0; }
  }

  .sn-fade-up {
    animation: snFadeUp .55s cubic-bezier(.22,1,.36,1) both;
  }

  .sn-scale-in {
    animation: snScaleIn .3s cubic-bezier(.22,1,.36,1) both;
  }

  .sn-progress {
    animation: snProgress 1.2s ease-out both;
  }

  .sn-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .sn-scroll::-webkit-scrollbar-thumb {
    background: #c8d9ee;
    border-radius: 99px;
  }

  .sn-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  @media (prefers-reduced-motion: reduce) {
    .sn-fade-up, .sn-scale-in, .sn-progress {
      animation: none !important;
    }
  }
`;

/* ==========================================
   CLICK SOUND ONLY
========================================== */

function useNotificationSounds() {
  const audioRef = useRef(null);

  const soundEnabled = useMemo(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "false";
    } catch {
      return true;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current?.state !== "closed") {
        audioRef.current?.close().catch(() => {});
      }
    };
  }, []);

  const playSound = (type = "click") => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioRef.current || audioRef.current.state === "closed") {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const patterns = {
        click: [[580, 0, 0.055]],
        open: [[520, 0, 0.07], [720, 0.075, 0.08]],
        success: [
          [520, 0, 0.09],
          [660, 0.1, 0.09],
          [880, 0.2, 0.13],
        ],
        delete: [[440, 0, 0.09], [290, 0.1, 0.12]],
        error: [[250, 0, 0.1], [200, 0.11, 0.13]],
      };

      (patterns[type] || patterns.click).forEach(
        ([frequency, delay, duration]) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + delay;

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);

          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(0.035, start + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
        }
      );
    } catch {
      // Sound never interrupts an action.
    }
  };

  return { playSound };
}

/* ==========================================
   ANIMATED COUNTER
========================================== */

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = previous.current;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      previous.current = end;
      setValue(end);
      return;
    }

    let frame;
    let started;

    const animate = (time) => {
      if (started === undefined) started = time;
      const progress = Math.min((time - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (end - start) * eased;

      previous.current = next;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        previous.current = end;
        setValue(end);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return Math.round(value);
}

/* ==========================================
   CUSTOM DROPDOWN
========================================== */

function CustomDropdown({
  value,
  options,
  onChange,
  playSound,
  compact = false,
  direction = "down",
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const desiredHeight = Math.min(options.length * 43 + 12, 250);
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;

    const openAbove =
      direction === "up"
        ? above > 100
        : below < desiredHeight + 12 && above > below;

    const space = openAbove ? above : below;
    const height = Math.min(desiredHeight, Math.max(70, space - 12));
    const width = Math.min(rect.width, window.innerWidth - 16);

    setPosition({
      position: "fixed",
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
      top: openAbove
        ? Math.max(8, rect.top - height - 6)
        : rect.bottom + 6,
      maxHeight: height,
      zIndex: 10050,
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleScroll = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    };

    const handleResize = () => setOpen(false);

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open, options.length, direction]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          playSound?.("click");
          if (!open) updatePosition();
          setOpen((prev) => !prev);
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl border border-[#d8e5f5] bg-white text-left text-sm font-semibold text-[#10264d] outline-none transition-all duration-300 hover:border-[#8cb5e2] focus:ring-4 focus:ring-[#e6f1ff] ${
          compact ? "px-3 py-2.5" : "px-4 py-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{value || "Select"}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#7392b4] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={position}
          className="sn-scroll sn-scale-in overflow-y-auto overscroll-contain rounded-2xl border border-[#d7e5f6] bg-white p-1.5 shadow-[0_20px_55px_rgba(16,38,77,.2)]"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => {
                onChange(option);
                playSound?.("click");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                value === option
                  ? "bg-[#eaf3ff] font-bold text-[#194c87]"
                  : "text-[#526b89] hover:bg-[#f2f7ff]"
              }`}
            >
              <span className="break-words">{option}</span>
              {value === option && <Check size={15} className="shrink-0" />}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

/* ==========================================
   REUSABLE UI
========================================== */

function StatusBadge({ value, priority = false }) {
  const classes = priority ? priorityClasses : statusClasses;

  return (
    <span className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-extrabold ${
      classes[value] || "border-slate-200 bg-slate-50 text-slate-700"
    }`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{value || "Pending"}</span>
    </span>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e0ebf8] bg-gradient-to-br from-[#f8fbff] to-[#edf5ff] p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#7892ae]">
        {Icon && <Icon size={13} className="shrink-0 text-[#3e7bb9]" />}
        <span>{label}</span>
      </div>
      <p className="break-words text-xs font-extrabold leading-relaxed text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

function ModalShell({
  title, subtitle, onClose, children,
  maxWidth = "max-w-2xl", footer,
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") closeRef.current();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return createPortal(
    <div className="studio-notifications-premium fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5">
      <style>{PAGE_CSS}</style>

      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`sn-scale-in relative flex h-[min(95dvh,850px)] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-[24px] border border-[#d9e7f7] bg-[#f5f9ff] shadow-[0_30px_90px_rgba(5,25,55,.3)] sm:h-auto sm:max-h-[92dvh] sm:rounded-[28px]`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0ebf8] bg-gradient-to-r from-white to-[#edf5ff] px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[.18em] text-[#4a83be]">
              Studio Raw / Notifications
            </p>
            <h2 className="text-xl font-black tracking-tight text-[#10264d] sm:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-xs text-[#8299b3] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-xl border border-[#d9e7f7] bg-white p-2.5 text-[#45688d] transition-all duration-300 hover:rotate-90 hover:bg-[#eaf3ff]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sn-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-[#e0ebf8] bg-white px-5 py-4 sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function NotificationActions({ item, onView, onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        title="View"
        aria-label="View notification"
        onClick={() => onView(item)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f5ef] text-[#168365] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d2eee2]"
      >
        <Eye size={16} />
      </button>

      <button
        type="button"
        title="Edit"
        aria-label="Edit notification"
        onClick={() => onEdit(item)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f2ff] text-[#2764a5] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d4e7ff]"
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        title="Delete"
        aria-label="Delete notification"
        onClick={() => onDelete(item.id)}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffedf1] text-[#d44b65] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffdae3]"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EmptyState({ hasRecords, onCreate, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-[24px] bg-[#eaf3ff] p-5 text-[#326da9]">
        <Bell size={34} />
      </div>
      <h3 className="text-base font-black text-[#10264d]">
        No notifications found
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[#8299b3]">
        {hasRecords
          ? "Try changing your search or filters."
          : "Create your first notification to get started."}
      </p>
      <button
        type="button"
        onClick={hasRecords ? onClear : onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#10264d] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#244d82] hover:shadow-lg"
      >
        {hasRecords ? <RefreshCw size={16} /> : <Plus size={16} />}
        {hasRecords ? "Clear Filters" : "Create Notification"}
      </button>
    </div>
  );
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  const animatedValue = useCountUp(stat.value);

  return (
    <div
      className="sn-fade-up group relative min-w-0 overflow-hidden rounded-[24px] border border-[#dbe8f7] bg-gradient-to-br from-white via-[#f8fbff] to-[#edf5ff] p-4 shadow-[0_8px_28px_rgba(16,55,110,.05)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#b5d1ef] hover:shadow-[0_18px_40px_rgba(16,55,110,.13)] sm:p-5"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#7089a5] sm:text-sm">
            {stat.title}
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            {animatedValue.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white shadow-sm transition-transform duration-500 group-hover:scale-110 ${stat.bg}`}>
          <Icon size={23} className={stat.color} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-[#e2edf9] pt-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#7eb0e0]" />
        <p className="text-[11px] font-medium text-[#8ba0b9]">
          {stat.note}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function Notifications() {
  const initial = useMemo(() => loadData(), []);

  const [notifications, setNotifications] = useState(initial.data);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const { playSound } = useNotificationSounds();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, { detail: { key: STORAGE_KEY } })
      );
    } catch (error) {
      console.error("Could not save notifications:", error);
    }
  }, [notifications]);

  useEffect(() => {
    let isMounted = true;
    api.notifications
      .list()
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.results;
        if (isMounted && Array.isArray(items) && items.length > 0) {
          const mapped = items.map((item) => ({
            id: item.id,
            title: item.title,
            message: item.message,
            module: item.module || "Internal",
            type: item.type || "Other",
            channel: item.channel || "In-App",
            status: item.status || "Pending",
            priority: item.priority || "Medium",
            customer: item.customer || "Studio Customer",
            dueDate: item.due_date || today(),
            createdAt: item.created_at ? item.created_at.slice(0, 10) : today(),
            isRead: item.is_read,
          }));
          setNotifications(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using local notifications:", err.message);
      });

    return () => {
      isMounted = false;
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => setToast(""), 2800);
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (error) setError("");
  };

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");
    playSound("click");
  };

  const stats = useMemo(() => ({
    total: notifications.length,
    pending: notifications.filter((item) => item.status === "Pending").length,
    progress: notifications.filter((item) => item.status === "In Progress").length,
    completed: notifications.filter((item) =>
      ["Sent", "Completed"].includes(item.status)
    ).length,
    overdue: notifications.filter(isOverdue).length,
  }), [notifications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((item) => {
        const matchesSearch =
          !query ||
          [
            item.title, item.message, item.customer,
            item.module, item.type, item.channel,
            item.priority, item.status,
          ].some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

        return (
          matchesSearch &&
          (moduleFilter === "All" || item.module === moduleFilter) &&
          (statusFilter === "All" || item.status === statusFilter) &&
          (priorityFilter === "All" || item.priority === priorityFilter)
        );
      })
      .sort((a, b) => {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        const aOverdue = isOverdue(a) ? 1 : 0;
        const bOverdue = isOverdue(b) ? 1 : 0;

        if (aOverdue !== bOverdue) return bOverdue - aOverdue;
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      });
  }, [notifications, search, moduleFilter, statusFilter, priorityFilter]);

  const moduleSummary = useMemo(() =>
    MODULES.map((module) => ({
      module,
      count: notifications.filter(
        (item) => String(item.module || "").trim().toLowerCase() === module.toLowerCase()
      ).length,
    })),
  [notifications]);

  const statCards = [
    {
      title: "Total Notifications",
      value: stats.total,
      icon: BellRing,
      note: "All studio reminders",
      color: "text-[#245c9b]",
      bg: "bg-[#e1efff]",
      accent: "from-[#173d77] to-[#79b3ed]",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      note: "Awaiting action",
      color: "text-[#bf7827]",
      bg: "bg-[#fff0d9]",
      accent: "from-[#e7a143] to-[#ffd18b]",
    },
    {
      title: "In Progress",
      value: stats.progress,
      icon: RefreshCw,
      note: "Currently being handled",
      color: "text-[#1685a8]",
      bg: "bg-[#ddf4ff]",
      accent: "from-[#2188b4] to-[#89d7f0]",
    },
    {
      title: "Completed / Sent",
      value: stats.completed,
      icon: CheckCircle2,
      note: "Finished reminders",
      color: "text-[#158268]",
      bg: "bg-[#dcf6ed]",
      accent: "from-[#159a7b] to-[#8be0c7]",
    },
  ];

  const openCreate = () => {
    playSound("open");
    setEditingId(null);
    setForm(blankForm());
    setError("");
    setViewingId(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    playSound("open");
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      message: item.message || "",
      module: item.module || "Enquiries",
      type: item.type || "Other",
      channel: item.channel || "WhatsApp",
      status: item.status || "Pending",
      priority: item.priority || "Medium",
      customer: item.customer || "",
      dueDate: item.dueDate || today(),
    });
    setError("");
    setViewingId(null);
    setModalOpen(true);
  };

  const openView = (item) => {
    playSound("open");
    setViewingId(item.id);
  };

  const closeView = () => {
    playSound("click");
    setViewingId(null);
  };

  const closeForm = () => {
    playSound("click");
    setModalOpen(false);
    setEditingId(null);
    setError("");
  };

  const saveNotification = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter notification title.");
      playSound("error");
      return;
    }

    if (!form.message.trim()) {
      setError("Please enter notification message.");
      playSound("error");
      return;
    }

    const data = {
      ...form,
      title: form.title.trim(),
      message: form.message.trim(),
      customer: form.customer.trim(),
    };

    if (editingId !== null) {
      try {
        await api.notifications.update(editingId, {
          title: data.title,
          message: data.message,
          module: data.module,
          channel: data.channel,
          status: data.status,
          priority: data.priority,
          customer: data.customer,
          due_date: data.dueDate || null,
        });
      } catch (err) {
        console.warn("Backend update failed, saving locally:", err.message);
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...item, ...data, updatedAt: today() }
            : item
        )
      );
      showToast("Notification updated successfully.");
    } else {
      let createdId = makeId();
      try {
        const remote = await api.notifications.create({
          title: data.title,
          message: data.message,
          module: data.module,
          channel: data.channel,
          status: data.status,
          priority: data.priority,
          customer: data.customer,
          due_date: data.dueDate || null,
        });
        if (remote && remote.id) {
          createdId = remote.id;
        }
      } catch (err) {
        console.warn("Backend create failed, saving locally:", err.message);
      }

      setNotifications((current) => [
        { ...data, id: createdId, createdAt: today() },
        ...current,
      ]);
      showToast("Notification created successfully.");
    }

    playSound("success");
    setModalOpen(false);
    setEditingId(null);
    setForm(blankForm());
    setError("");
  };

  const updateStatus = async (id, status) => {
    try {
      await api.notifications.update(id, { status });
    } catch (err) {
      console.warn("Backend status update notice:", err.message);
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status, updatedAt: today() }
          : item
      )
    );
    playSound("success");
    showToast(`Status updated to ${status}.`);
  };

  const openDelete = (id) => {
    playSound("click");
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    const idToDelete = deleteId;
    try {
      await api.notifications.delete(idToDelete);
    } catch (err) {
      console.warn("Backend delete notice:", err.message);
    }

    setNotifications((current) =>
      current.filter((item) => item.id !== idToDelete)
    );
    setDeleteId(null);
    setViewingId(null);
    playSound("delete");
    showToast("Notification deleted successfully.");
  };

  const closeDelete = () => {
    playSound("click");
    setDeleteId(null);
  };

  const currentView = notifications.find((item) => item.id === viewingId);

  return (
    <div className="studio-notifications-premium min-h-screen w-full min-w-0 overflow-x-hidden px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <style>{PAGE_CSS}</style>

      {/* HEADER */}
      <div className="sn-fade-up mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {/* <div className="inline-flex items-center gap-2 rounded-full border border-[#dbe9f8] bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#4a80b8]">
            <Sparkles size={13} />
            Studio Communication Center
          </div> */}

          {/* <h1 className="mt-3 text-2xl font-black tracking-tight text-[#10264d] sm:text-3xl">
            Notifications
          </h1> */}

          {/* <p className="mt-2 text-xs leading-6 text-[#8299b3] sm:text-sm">
            Manage reminders, customer updates and studio activities.
          </p> */}
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="group inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-2xl bg-gradient-to-r from-[#10264d] to-[#2b5c9b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_9px_24px_rgba(16,38,77,.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(16,38,77,.28)]"
        >
          <Plus size={19} className="transition-transform duration-300 group-hover:rotate-90" />
          Create Notification
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* MODULE OVERVIEW */}
      <section className="sn-fade-up mb-7 overflow-hidden rounded-[26px] border border-[#dce8f7] bg-white p-4 shadow-[0_8px_30px_rgba(16,55,110,.05)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-[#10264d] sm:text-lg">
              <ClipboardList size={20} className="text-[#3677b9]" />
              Module Notifications
            </h2>
            <p className="mt-1 text-xs text-[#8ba1bb]">
              Notification distribution across studio modules
            </p>
          </div>
          <span className="rounded-xl border border-[#d9e9fa] bg-[#edf5ff] px-3 py-2 text-xs font-extrabold text-[#3b76b3]">
            {MODULES.length} Modules
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {moduleSummary.map((item, index) => {
            const Icon = moduleIcons[item.module] || Bell;
            const selected = moduleFilter === item.module;
            const percentage = stats.total
              ? (item.count / stats.total) * 100
              : 0;

            return (
              <button
                key={item.module}
                type="button"
                onClick={() => {
                  setModuleFilter(selected ? "All" : item.module);
                  playSound("click");
                }}
                className={`sn-fade-up group min-w-0 rounded-[20px] border p-3.5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(16,55,110,.11)] ${
                  selected
                    ? "border-[#6397cf] bg-[#eaf3ff] shadow-md"
                    : "border-[#e0eaf6] bg-gradient-to-br from-[#fbfdff] to-[#f1f7ff] hover:border-[#b7d3f0]"
                }`}
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                  moduleColors[item.module]
                }`}>
                  <Icon size={20} />
                </div>

                <p className="min-h-[36px] break-words text-[11px] font-extrabold leading-4 text-[#385678]">
                  {item.module}
                </p>

                <p className="mt-2 text-2xl font-black text-[#10264d]">
                  {item.count}
                </p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dfeaf7]">
                  <div
                    className="sn-progress h-full rounded-full bg-gradient-to-r from-[#295b99] to-[#86b9ee]"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-2 text-[10px] font-semibold text-[#94a9c0]">
                  Notifications
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* OVERDUE ALERT */}
      {stats.overdue > 0 && (
        <div className="sn-fade-up mb-7 flex items-start gap-3 rounded-[22px] border border-[#f5dba8] bg-gradient-to-r from-[#fffaf0] to-[#fff2db] p-4 sm:p-5">
          <div className="shrink-0 rounded-2xl bg-[#ffebc6] p-3 text-[#b77922]">
            <AlertTriangle size={21} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[#9b651b]">
              {stats.overdue} Overdue Reminder{stats.overdue !== 1 ? "s" : ""}
            </h3>
            <p className="mt-1 text-xs leading-6 text-[#ad844a] sm:text-sm">
              Some reminders have passed their due dates. Review and update their status.
            </p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <section className="mb-7 rounded-[25px] border border-[#dce8f7] bg-white p-4 shadow-[0_8px_28px_rgba(16,55,110,.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-black text-[#10264d]">
              <Filter size={19} className="text-[#3477b9]" />
              Search & Filters
            </h2>
            <p className="mt-1 text-xs text-[#8ba1bb]">
              Find notifications quickly
            </p>
          </div>

          {(search || moduleFilter !== "All" ||
            statusFilter !== "All" || priorityFilter !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#326eae] hover:underline"
            >
              <RefreshCw size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative min-w-0">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8aa3be]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className={`${inputClass} pl-11`}
            />
          </div>

          <CustomDropdown
            value={moduleFilter}
            options={["All", ...MODULES]}
            onChange={setModuleFilter}
            playSound={playSound}
          />
          <CustomDropdown
            value={statusFilter}
            options={["All", ...STATUSES]}
            onChange={setStatusFilter}
            playSound={playSound}
          />
          <CustomDropdown
            value={priorityFilter}
            options={["All", ...PRIORITIES]}
            onChange={setPriorityFilter}
            playSound={playSound}
          />
        </div>
      </section>

      {/* RECORDS */}
      <section className="min-w-0 overflow-hidden rounded-[26px] border border-[#dce8f7] bg-white shadow-[0_8px_30px_rgba(16,55,110,.05)]">
        <div className="flex flex-col gap-3 border-b border-[#e3edf9] bg-gradient-to-r from-white to-[#f1f7ff] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-[#10264d]">
              <ClipboardList size={20} className="text-[#3477b9]" />
              Notification Records
            </h2>
            <p className="mt-1 text-xs font-medium text-[#8ba1bb]">
              Showing {filtered.length} of {notifications.length} notifications
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-[#dbe9f8] bg-white px-3 py-1.5 text-xs font-bold text-[#4c7eaf]">
            <span className="h-2 w-2 rounded-full bg-[#4c9bdf]" />
            Studio Activity
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            hasRecords={notifications.length > 0}
            onCreate={openCreate}
            onClear={clearFilters}
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="sn-scroll hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-[#e2edf9] bg-[#f5f9ff]">
                  <tr className="text-[11px] font-extrabold uppercase tracking-[.09em] text-[#6885a5]">
                    <th className="px-5 py-4">Notification</th>
                    <th className="px-5 py-4">Module</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Due Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf2f9]">
                  {filtered.map((item) => {
                    const Icon = moduleIcons[item.module] || Bell;

                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors duration-300 hover:bg-[#f5f9ff]"
                      >
                        <td className="max-w-[290px] px-5 py-4 align-top">
                          <button
                            type="button"
                            onClick={() => openView(item)}
                            className="text-left"
                          >
                            <p className="text-sm font-extrabold text-[#10264d] transition-colors group-hover:text-[#2865a7]">
                              {item.title}
                            </p>
                            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#8299b3]">
                              {item.message}
                            </p>
                          </button>

                          {isOverdue(item) && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                              <AlertTriangle size={12} />
                              Overdue
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${
                              moduleColors[item.module] || moduleColors.Internal
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-[#345476]">
                                {item.module || "General"}
                              </p>
                              <p className="mt-1 text-[11px] text-[#91a4ba]">
                                {item.type}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top text-sm font-semibold text-[#496786]">
                          {item.customer || "—"}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBadge value={item.priority} priority />
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className={`flex items-center gap-1.5 text-xs font-bold ${
                            isOverdue(item) ? "text-rose-600" : "text-[#63809f]"
                          }`}>
                            <CalendarDays size={14} />
                            {formatDate(item.dueDate)}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <select
                            value={item.status}
                            onChange={(event) =>
                              updateStatus(item.id, event.target.value)
                            }
                            className="max-w-[145px] rounded-xl border border-[#d9e7f7] bg-white px-2.5 py-2 text-xs font-bold text-[#10264d] outline-none transition focus:border-[#3477b9] focus:ring-2 focus:ring-[#e6f1ff]"
                          >
                            {STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end">
                            <NotificationActions
                              item={item}
                              onView={openView}
                              onEdit={openEdit}
                              onDelete={openDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid min-w-0 grid-cols-1 gap-3 bg-[#f7faff] p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
              {filtered.map((item) => {
                const Icon = moduleIcons[item.module] || Bell;

                return (
                  <article
                    key={item.id}
                    className="sn-fade-up flex min-w-0 flex-col rounded-[22px] border border-[#dce8f7] bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#bdd6f0] hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#e9f0f9] pb-3">
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                          moduleColors[item.module] || moduleColors.Internal
                        }`}>
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words text-sm font-extrabold text-[#10264d]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-xs font-bold text-[#4782be]">
                            {item.module}
                          </p>
                        </div>
                      </div>

                      <NotificationActions
                        item={item}
                        onView={openView}
                        onEdit={openEdit}
                        onDelete={openDelete}
                      />
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs leading-6 text-[#7e95af]">
                      {item.message}
                    </p>

                    {isOverdue(item) && (
                      <p className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-600">
                        <AlertTriangle size={14} />
                        Overdue Reminder
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoBox label="Customer" value={item.customer} icon={UserRound} />
                      <InfoBox label="Channel" value={item.channel} icon={MessageSquare} />
                      <InfoBox
                        label="Due Date"
                        value={formatDate(item.dueDate)}
                        icon={CalendarDays}
                      />

                      <div className="rounded-2xl border border-[#e0ebf8] bg-[#f5f9ff] p-3">
                        <p className="mb-2 text-[11px] font-semibold text-[#7892ae]">
                          Priority
                        </p>
                        <StatusBadge value={item.priority} priority />
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="border-t border-[#e9f0f9] pt-3">
                        <p className="mb-2 text-xs font-bold text-[#456586]">
                          Update Status
                        </p>
                        <CustomDropdown
                          compact
                          value={item.status}
                          options={STATUSES}
                          onChange={(status) => updateStatus(item.id, status)}
                          playSound={playSound}
                          direction="up"
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#e9f0f9] bg-white px-4 py-4 text-xs font-semibold text-[#8ba1bb] sm:px-6">
          <span>Showing {filtered.length} of {notifications.length} records</span>
          <span>Studio Raw ERP</span>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <ModalShell
          title={editingId !== null ? "Edit Notification" : "Create Notification"}
          subtitle="Enter notification and reminder details."
          onClose={closeForm}
          maxWidth="max-w-[760px]"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-[#d9e7f7] bg-white px-6 py-3 text-sm font-bold text-[#52718f] transition hover:bg-[#f0f6ff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="notification-form"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#10264d] to-[#2b5c9b] px-7 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg"
              >
                <Save size={17} />
                {editingId !== null ? "Update Notification" : "Save Notification"}
              </button>
            </div>
          }
        >
          <form
            id="notification-form"
            onSubmit={saveNotification}
            className="space-y-4 sm:space-y-5"
          >
            <div className="rounded-[22px] border border-[#dce8f7] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-[#e9f0f9] pb-4 text-sm font-black text-[#10264d]">
                <BellRing size={18} className="text-[#3477b9]" />
                Notification Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Notification Title" required>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                      placeholder="Enter notification title"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Message" required>
                    <textarea
                      required
                      rows={3}
                      value={form.message}
                      onChange={(event) => updateForm("message", event.target.value)}
                      placeholder="Write notification message..."
                      className={`${inputClass} resize-none`}
                    />
                  </FormField>
                </div>

                <FormField label="Customer / Recipient">
                  <input
                    type="text"
                    value={form.customer}
                    onChange={(event) => updateForm("customer", event.target.value)}
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Module">
                  <CustomDropdown
                    value={form.module}
                    options={MODULES}
                    onChange={(value) => updateForm("module", value)}
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Notification Type">
                  <CustomDropdown
                    value={form.type}
                    options={TYPES}
                    onChange={(value) => updateForm("type", value)}
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Channel">
                  <CustomDropdown
                    value={form.channel}
                    options={CHANNELS}
                    onChange={(value) => updateForm("channel", value)}
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Priority">
                  <CustomDropdown
                    value={form.priority}
                    options={PRIORITIES}
                    onChange={(value) => updateForm("priority", value)}
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#dce8f7] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-[#e9f0f9] pb-4 text-sm font-black text-[#10264d]">
                <CalendarDays size={18} className="text-[#3477b9]" />
                Schedule & Status
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Notification Status">
                  <CustomDropdown
                    value={form.status}
                    options={STATUSES}
                    onChange={(value) => updateForm("status", value)}
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Due Date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => updateForm("dueDate", event.target.value)}
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </ModalShell>
      )}

      {/* VIEW MODAL */}
      {currentView && (
        <ModalShell
          title="Notification Details"
          subtitle="Complete notification information."
          onClose={closeView}
          maxWidth="max-w-[620px]"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeView}
                className="rounded-2xl border border-[#d9e7f7] bg-white px-6 py-3 text-sm font-bold text-[#52718f] transition hover:bg-[#f0f6ff]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => openEdit(currentView)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#254f88]"
              >
                <Pencil size={16} />
                Edit Notification
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-[22px] border border-[#dce8f7] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <StatusBadge value={currentView.status} />
                <StatusBadge value={currentView.priority} priority />
                {isOverdue(currentView) && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                    <AlertTriangle size={13} />
                    Overdue
                  </span>
                )}
              </div>

              <h3 className="break-words text-xl font-black text-[#10264d]">
                {currentView.title}
              </h3>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#607c9a]">
                {currentView.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox label="Customer" value={currentView.customer} icon={UserRound} />
              <InfoBox label="Module" value={currentView.module} icon={ClipboardList} />
              <InfoBox label="Type" value={currentView.type} icon={Bell} />
              <InfoBox label="Channel" value={currentView.channel} icon={Send} />
              <InfoBox
                label="Due Date"
                value={formatDate(currentView.dueDate)}
                icon={CalendarDays}
              />
              <InfoBox
                label="Created Date"
                value={formatDate(currentView.createdAt)}
                icon={CalendarDays}
              />
            </div>

            <div className="rounded-[22px] border border-[#dce8f7] bg-white p-4">
              <FormField label="Update Status">
                <CustomDropdown
                  value={currentView.status}
                  options={STATUSES}
                  onChange={(status) => updateStatus(currentView.id, status)}
                  playSound={playSound}
                  direction="up"
                />
              </FormField>
            </div>

            <button
              type="button"
              onClick={() => openDelete(currentView.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <Trash2 size={16} />
              Delete Notification
            </button>
          </div>
        </ModalShell>
      )}

      {/* DELETE MODAL */}
      {deleteId !== null && (
        <ModalShell
          title="Delete Notification?"
          subtitle="This action cannot be undone."
          onClose={closeDelete}
          maxWidth="max-w-[420px]"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={closeDelete}
                className="flex-1 rounded-2xl border border-[#d9e7f7] bg-white px-4 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#f0f6ff]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          }
        >
          <div className="py-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-rose-50 text-rose-600">
              <Trash2 size={28} />
            </div>
            <h3 className="mt-4 text-base font-black text-[#10264d]">
              Remove this notification?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#8299b3]">
              This notification will be permanently removed from your saved records.
            </p>
          </div>
        </ModalShell>
      )}

      {/* TOAST */}
      {toast && createPortal(
        <div className="studio-notifications-premium sn-scale-in fixed bottom-4 left-4 right-4 z-[10000] flex items-center gap-3 rounded-2xl border border-[#d9e7f7] bg-white px-4 py-3 text-sm font-bold text-[#10264d] shadow-[0_16px_45px_rgba(16,38,77,.18)] sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
          <div className="rounded-xl bg-[#e2f7ed] p-2 text-[#168365]">
            <CheckCircle2 size={18} />
          </div>
          <span className="min-w-0 flex-1">{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            className="rounded-lg p-1 text-[#6f89a5] hover:bg-[#edf5ff]"
          >
            <X size={16} />
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
