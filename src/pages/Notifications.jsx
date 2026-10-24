
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  BellRing,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Clock3,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw,
  Eye,
  ChevronDown,
  Check,
  Save,
  UserRound,
  MessageSquare,
  ClipboardList,
  Volume2,
  VolumeX,
  Camera,
  Video,
  PackageCheck,
  Users,
  BookOpen,
  Send,
} from "lucide-react";

/* ==========================================
   STORAGE
========================================== */

const STORAGE_KEY = "studioraw_notifications";
const SOUND_KEY = "studioraw_notification_sounds";

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
  "Arun Kumar",
  "Priya Sharma",
  "Vijay Raj",
  "Divya R",
  "Karthik S",
  "Meena Devi",
  "Rahul Kumar",
  "Anitha S",
  "Sanjay R",
  "Deepa R",
  "Manoj R",
  "Keerthana R",
  "Ajith & Kavya",
  "Harini P",
  "Praveen Kumar",
  "Swetha S",
  "Anu Joseph",
  "Sathish P",
  "Nithya Kumar",
  "Lakshmi N",
];

const DEMO_STATUSES = [
  "Pending",
  "In Progress",
  "Pending",
  "Sent",
  "Completed",
];

const DEMO_PRIORITIES = [
  "High",
  "Medium",
  "Urgent",
  "Low",
  "Medium",
];

const DEMO_CHANNELS = ["WhatsApp", "SMS", "Email", "In-App"];

/* ==========================================
   DATE HELPERS
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

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(item) {
  return Boolean(
    item.dueDate &&
      String(item.dueDate).slice(0, 10) < today() &&
      !["Completed", "Sent"].includes(item.status)
  );
}

/* ==========================================
   GENERATE 135 DUMMY NOTIFICATIONS
========================================== */

function makeDemoData() {
  const base = new Date();
  base.setHours(12, 0, 0, 0);

  return MODULE_CONFIG.flatMap((group, moduleIndex) =>
    group.titles.map((title, index) => {
      const due = new Date(base);

      due.setDate(
        due.getDate() + ((index + moduleIndex * 2) % 17) - 5
      );

      const created = new Date(base);

      created.setDate(
        created.getDate() - (index % 8) - 1
      );

      let type = group.type;

      if (group.module === "Deliveries") {
        if (title.toLowerCase().includes("video")) {
          type = "Video Delivery";
        } else if (
          title.toLowerCase().includes("selection")
        ) {
          type = "Photo Selection";
        } else {
          type = "Album Delivery";
        }
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
        channel:
          DEMO_CHANNELS[
            (index + moduleIndex) % DEMO_CHANNELS.length
          ],
        status:
          DEMO_STATUSES[
            (index + moduleIndex) % DEMO_STATUSES.length
          ],
        priority:
          DEMO_PRIORITIES[
            (index + moduleIndex) % DEMO_PRIORITIES.length
          ],
        customer:
          group.module === "Internal"
            ? "Studio Team"
            : CUSTOMERS[
                (index * 3 + moduleIndex) %
                  CUSTOMERS.length
              ],
        dueDate: localDate(due),
        createdAt: localDate(created),
        demo: true,
      };
    })
  );
}

/* ==========================================
   MODULE DETECTION FOR OLD RECORDS
========================================== */

function detectModule(item) {
  if (MODULES.includes(item.module)) {
    return item.module;
  }

  const text = [
    item.title,
    item.message,
    item.type,
    item.category,
    item.source,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    text.includes("wedding videography") ||
    text.includes("wedding video enquiry") ||
    text.includes("drone enquiry")
  ) {
    return "Wedding Videography";
  }

  if (
    text.includes("wedding photography") ||
    text.includes("photoshoot") ||
    text.includes("photo shoot")
  ) {
    return "Wedding Photography";
  }

  if (
    text.includes("delivery") ||
    text.includes("album") ||
    text.includes("courier") ||
    text.includes("photo selection")
  ) {
    return "Deliveries";
  }

  if (
    text.includes("editing") ||
    text.includes("videography") ||
    text.includes("cinematic") ||
    text.includes("video")
  ) {
    return "Videography";
  }

  if (
    text.includes("booking") ||
    text.includes("appointment")
  ) {
    return "Bookings";
  }

  if (
    text.includes("customer") ||
    text.includes("payment") ||
    text.includes("balance")
  ) {
    return "Customers";
  }

  if (
    text.includes("maintenance") ||
    text.includes("internal")
  ) {
    return "Internal";
  }

  return "Enquiries";
}

/* ==========================================
   FIX OLD LOCALSTORAGE + MERGE DEMO
========================================== */

function loadData() {
  const demoRecords = makeDemoData();

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        const existingRecords = parsed.map((item) => ({
          ...item,
          module: detectModule(item),
        }));

        const existingIds = new Set(
          existingRecords.map((item) => String(item.id))
        );

        const missingDemoRecords = demoRecords.filter(
          (item) => !existingIds.has(String(item.id))
        );

        return {
          data: [...existingRecords, ...missingDemoRecords],
          demo: missingDemoRecords.length > 0,
        };
      }
    }
  } catch (error) {
    console.error("Could not load notifications:", error);
  }

  return {
    data: demoRecords,
    demo: true,
  };
}

/* ==========================================
   OTHER HELPERS
========================================== */

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `NOT-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;

const blankForm = () => ({
  title: "",
  message: "",
  module: "Enquiries",
  type: "New Enquiry",
  channel: "WhatsApp",
  status: "Pending",
  priority: "Medium",
  customer: "",
  dueDate: today(),
});

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-3.5 py-3 text-sm font-medium text-[#10264d] outline-none transition placeholder:text-slate-500 focus:border-[#315b99] focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-[#29416a]";

const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-800",
  Sent: "border-violet-200 bg-violet-50 text-violet-800",
  Completed:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
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

/* ==========================================
   LIGHT THEME CSS
========================================== */

const LIGHT_CSS = `
  .studio-notifications-light {
    color-scheme: light;
    background-color: #f4f7fc;
    color: #10264d;
  }

  .studio-notifications-light input,
  .studio-notifications-light textarea,
  .studio-notifications-light select {
    color-scheme: light;
    background-color: #ffffff;
    color: #10264d;
  }

  .studio-notifications-light input::placeholder,
  .studio-notifications-light textarea::placeholder {
    color: #64748b;
  }

  .studio-notifications-light option {
    background: white;
    color: #10264d;
  }

  @keyframes notificationFadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .notification-animate {
    animation: notificationFadeUp 0.35s ease both;
  }

  @media (prefers-reduced-motion: reduce) {
    .notification-animate {
      animation: none;
    }
  }
`;

/* ==========================================
   SOUND
========================================== */

function useNotificationSounds() {
  const audioRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        SOUND_KEY,
        String(soundEnabled)
      );
    } catch {
      // Ignore storage errors.
    }
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      const context = audioRef.current;

      if (context && context.state !== "closed") {
        context.close().catch(() => {});
      }
    };
  }, []);

  const playSound = (type = "click") => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (
        !audioRef.current ||
        audioRef.current.state === "closed"
      ) {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const patterns = {
        click: [[580, 0, 0.055]],
        open: [
          [520, 0, 0.07],
          [720, 0.075, 0.08],
        ],
        success: [
          [520, 0, 0.09],
          [660, 0.1, 0.09],
          [880, 0.2, 0.13],
        ],
        delete: [
          [440, 0, 0.09],
          [290, 0.1, 0.12],
        ],
        error: [
          [250, 0, 0.1],
          [200, 0.11, 0.13],
        ],
      };

      (patterns[type] || patterns.click).forEach(
        ([frequency, delay, duration]) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          const start = context.currentTime + delay;

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(
            frequency,
            start
          );

          gain.gain.setValueAtTime(0.0001, start);

          gain.gain.exponentialRampToValueAtTime(
            0.045,
            start + 0.012
          );

          gain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + duration
          );

          oscillator.connect(gain);
          gain.connect(context.destination);

          oscillator.start(start);
          oscillator.stop(start + duration + 0.01);
        }
      );
    } catch {
      // Sound should not interrupt actions.
    }
  };

  return {
    soundEnabled,
    setSoundEnabled,
    playSound,
  };
}

/* ==========================================
   DROPDOWN
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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const closeOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const closeEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "pointerdown",
      closeOutside
    );

    document.addEventListener(
      "keydown",
      closeEscape
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside
      );

      document.removeEventListener(
        "keydown",
        closeEscape
      );
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative w-full min-w-0"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          playSound?.("click");
          setOpen((prev) => !prev);
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#d9e3f2] bg-white text-left text-sm font-semibold text-[#10264d] outline-none transition hover:border-[#315b99] focus:ring-2 focus:ring-blue-100 ${
          compact
            ? "px-3 py-2.5"
            : "px-3.5 py-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || "Select"}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 z-[150] max-h-52 overflow-y-auto rounded-xl border border-[#d9e3f2] bg-white p-1 shadow-xl ${
            direction === "up"
              ? "bottom-full mb-1"
              : "top-full mt-1"
          }`}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                playSound?.("click");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                value === option
                  ? "bg-[#eaf1fc] font-bold text-[#10264d]"
                  : "text-[#425673] hover:bg-[#f4f7fc]"
              }`}
            >
              <span className="min-w-0 break-words">
                {option}
              </span>

              {value === option && (
                <Check
                  size={15}
                  className="shrink-0"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   BADGE
========================================== */

function StatusBadge({
  value,
  priority = false,
}) {
  const classes = priority
    ? priorityClasses
    : statusClasses;

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        classes[value] ||
        "border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

      <span className="truncate">
        {value || "Pending"}
      </span>
    </span>
  );
}

/* ==========================================
   FORM FIELD
========================================== */

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ==========================================
   INFO BOX
========================================== */

function InfoBox({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-[#526581]">
        {Icon && (
          <Icon
            size={13}
            className="shrink-0 text-[#315b99]"
          />
        )}

        <span>{label}</span>
      </div>

      <p className="break-words text-xs font-bold leading-relaxed text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

/* ==========================================
   MODAL
========================================== */

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-2xl",
  footer,
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeRef.current();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = previous;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return createPortal(
    <div className="studio-notifications-light fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5">
      <style>{LIGHT_CSS}</style>

      <div
        className="absolute inset-0 bg-[#07152b]/65 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-[min(95dvh,850px)] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-2xl border border-[#d9e3f2] bg-[#f4f7fc] shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e0e7f1] bg-white px-4 py-4 sm:px-7 sm:py-5">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#315b99]">
              Studio Raw / Notifications
            </p>

            <h2 className="text-xl font-extrabold text-[#10264d] sm:text-2xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-xs text-[#526581] sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-[#d9e3f2] bg-white p-2.5 text-[#10264d] hover:bg-[#eaf1fc]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-6">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-[#e0e7f1] bg-white px-4 py-3 sm:px-7 sm:py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/* ==========================================
   ACTION BUTTONS
========================================== */

function NotificationActions({
  item,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        title="View"
        onClick={() => onView(item)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1fc] text-[#173d77] hover:bg-[#dce9fb]"
      >
        <Eye size={16} />
      </button>

      <button
        type="button"
        title="Edit"
        onClick={() => onEdit(item)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        title="Delete"
        onClick={() => onDelete(item.id)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

/* ==========================================
   EMPTY STATE
========================================== */

function EmptyState({
  hasRecords,
  onCreate,
  onClear,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-2xl bg-[#eaf1fc] p-5">
        <Bell
          size={34}
          className="text-[#315b99]"
        />
      </div>

      <h3 className="font-bold text-[#10264d]">
        No notifications found
      </h3>

      <p className="mt-2 max-w-sm text-sm text-[#526581]">
        {hasRecords
          ? "Try changing your search or filters."
          : "Create your first notification to get started."}
      </p>

      <button
        type="button"
        onClick={
          hasRecords ? onClear : onCreate
        }
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#193b73]"
      >
        {hasRecords ? (
          <RefreshCw size={16} />
        ) : (
          <Plus size={16} />
        )}

        {hasRecords
          ? "Clear Filters"
          : "Create Notification"}
      </button>
    </div>
  );
}

/* ==========================================
   MAIN COMPONENT
========================================== */

export default function Notifications() {
  const initial = useMemo(
    () => loadData(),
    []
  );

  const [notifications, setNotifications] =
    useState(initial.data);

  const [isDemo, setIsDemo] =
    useState(initial.demo);

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [modalOpen, setModalOpen] =
    useState(false);
  const [editingId, setEditingId] =
    useState(null);
  const [viewingId, setViewingId] =
    useState(null);
  const [deleteId, setDeleteId] =
    useState(null);

  const [form, setForm] =
    useState(blankForm);

  const [error, setError] =
    useState("");

  const [toast, setToast] =
    useState("");

  const toastTimerRef = useRef(null);

  const {
    soundEnabled,
    setSoundEnabled,
    playSound,
  } = useNotificationSounds();

  /* ========================================
     SAVE DATA
  ======================================== */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error(
        "Could not save notifications:",
        error
      );
    }
  }, [notifications]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  /* ========================================
     TOAST
  ======================================== */

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(message);

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 2800);
  };

  /* ========================================
     FORM
  ======================================== */

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    if (error) setError("");
  };

  /* ========================================
     FILTERS
  ======================================== */

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");

    playSound("click");
  };

  /* ========================================
     STATISTICS
  ======================================== */

  const stats = useMemo(
    () => ({
      total: notifications.length,

      pending: notifications.filter(
        (item) =>
          item.status === "Pending"
      ).length,

      progress: notifications.filter(
        (item) =>
          item.status === "In Progress"
      ).length,

      completed: notifications.filter(
        (item) =>
          ["Sent", "Completed"].includes(
            item.status
          )
      ).length,

      overdue:
        notifications.filter(isOverdue)
          .length,
    }),
    [notifications]
  );

  /* ========================================
     FILTERED RECORDS
  ======================================== */

  const filtered = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return notifications
      .filter((item) => {
        const matchesSearch =
          !query ||
          [
            item.title,
            item.message,
            item.customer,
            item.module,
            item.type,
            item.channel,
            item.priority,
            item.status,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          );

        return (
          matchesSearch &&
          (moduleFilter === "All" ||
            item.module === moduleFilter) &&
          (statusFilter === "All" ||
            item.status === statusFilter) &&
          (priorityFilter === "All" ||
            item.priority === priorityFilter)
        );
      })
      .sort((a, b) => {
        const priorityOrder = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        const aOverdue = isOverdue(a)
          ? 1
          : 0;

        const bOverdue = isOverdue(b)
          ? 1
          : 0;

        if (aOverdue !== bOverdue) {
          return bOverdue - aOverdue;
        }

        return (
          (priorityOrder[b.priority] || 0) -
          (priorityOrder[a.priority] || 0)
        );
      });
  }, [
    notifications,
    search,
    moduleFilter,
    statusFilter,
    priorityFilter,
  ]);

  /* ========================================
     MODULE COUNTS - FIXED
  ======================================== */

  const moduleSummary = useMemo(() => {
    return MODULES.map((module) => ({
      module,

      count: notifications.filter(
        (item) =>
          String(item.module || "")
            .trim()
            .toLowerCase() ===
          module.toLowerCase()
      ).length,
    }));
  }, [notifications]);

  const statCards = [
    {
      title: "Total Notifications",
      value: stats.total,
      icon: Bell,
      note: "All reminders",
      color: "text-[#173d77]",
      bg: "bg-[#eaf1fc]",
      accent:
        "from-[#10264d] to-[#315b99]",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      note: "Awaiting action",
      color: "text-amber-700",
      bg: "bg-amber-50",
      accent:
        "from-amber-400 to-orange-500",
    },
    {
      title: "In Progress",
      value: stats.progress,
      icon: RefreshCw,
      note: "Being handled",
      color: "text-blue-700",
      bg: "bg-blue-50",
      accent:
        "from-blue-500 to-[#10264d]",
    },
    {
      title: "Completed / Sent",
      value: stats.completed,
      icon: CheckCircle2,
      note: "Finished reminders",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      accent:
        "from-emerald-400 to-green-600",
    },
  ];

  /* ========================================
     CREATE
  ======================================== */

  const openCreate = () => {
    playSound("open");

    setEditingId(null);
    setForm(blankForm());
    setError("");
    setViewingId(null);
    setModalOpen(true);
  };

  /* ========================================
     EDIT
  ======================================== */

  const openEdit = (item) => {
    playSound("open");

    setEditingId(item.id);

    setForm({
      title: item.title || "",
      message: item.message || "",
      module:
        item.module || "Enquiries",
      type: item.type || "Other",
      channel:
        item.channel || "WhatsApp",
      status:
        item.status || "Pending",
      priority:
        item.priority || "Medium",
      customer:
        item.customer || "",
      dueDate:
        item.dueDate || today(),
    });

    setError("");
    setViewingId(null);
    setModalOpen(true);
  };

  /* ========================================
     VIEW
  ======================================== */

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

  /* ========================================
     SAVE
  ======================================== */

  const saveNotification = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError(
        "Please enter notification title."
      );

      playSound("error");
      return;
    }

    if (!form.message.trim()) {
      setError(
        "Please enter notification message."
      );

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
      setNotifications((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...data,
                updatedAt: today(),
              }
            : item
        )
      );

      showToast(
        "Notification updated successfully."
      );
    } else {
      setNotifications((current) => [
        {
          ...data,
          id: makeId(),
          createdAt: today(),
        },
        ...current,
      ]);

      showToast(
        "Notification created successfully."
      );
    }

    setIsDemo(false);
    playSound("success");

    setModalOpen(false);
    setEditingId(null);
    setForm(blankForm());
    setError("");
  };

  /* ========================================
     UPDATE STATUS
  ======================================== */

  const updateStatus = (id, status) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              updatedAt: today(),
            }
          : item
      )
    );

    setIsDemo(false);
    playSound("success");

    showToast(
      `Status updated to ${status}.`
    );
  };

  /* ========================================
     DELETE
  ======================================== */

  const openDelete = (id) => {
    playSound("click");
    setDeleteId(id);
  };

  const confirmDelete = () => {
    setNotifications((current) =>
      current.filter(
        (item) => item.id !== deleteId
      )
    );

    setIsDemo(false);
    setDeleteId(null);
    setViewingId(null);

    playSound("delete");

    showToast(
      "Notification deleted successfully."
    );
  };

  const closeDelete = () => {
    playSound("click");
    setDeleteId(null);
  };

  /* ========================================
     RESET DEMO
  ======================================== */

  const resetDemo = () => {
    playSound("click");

    const demoRecords = makeDemoData();

    if (
      !window.confirm(
        `Restore all ${demoRecords.length} sample notifications? This will replace your currently saved notifications.`
      )
    ) {
      return;
    }

    setNotifications(demoRecords);
    setIsDemo(true);

    setSearch("");
    setModuleFilter("All");
    setStatusFilter("All");
    setPriorityFilter("All");

    setModalOpen(false);
    setEditingId(null);
    setViewingId(null);
    setDeleteId(null);
    setError("");

    playSound("success");

    showToast(
      `${demoRecords.length} sample notifications restored.`
    );
  };

  const currentView =
    notifications.find(
      (item) =>
        item.id === viewingId
    );

  /* ========================================
     UI
  ======================================== */

  return (
    <div className="studio-notifications-light min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f7fc] px-3 py-4 text-[#10264d] sm:px-5 sm:py-6 lg:px-7 lg:py-8">
      <style>{LIGHT_CSS}</style>

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#315b99]">
            <span className="h-2 w-2 rounded-full bg-[#173d77]" />
            Studio Raw / Communication
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#526581]">
            Track enquiries, wedding photography,
            wedding videography, bookings,
            customers, videography and deliveries
            in one place.
          </p>

          {isDemo && (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d9e3f2] bg-[#eaf1fc] px-3 py-1 text-xs font-bold text-[#173d77]">
              <Bell size={13} />
              Sample Notifications Available
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(
                (value) => !value
              );
            }}
            title={
              soundEnabled
                ? "Mute Sounds"
                : "Enable Sounds"
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9e3f2] bg-white text-[#10264d] shadow-sm hover:bg-[#eaf1fc]"
          >
            {soundEnabled ? (
              <Volume2 size={19} />
            ) : (
              <VolumeX size={19} />
            )}
          </button>

          <button
            type="button"
            onClick={resetDemo}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-4 text-sm font-bold text-[#10264d] shadow-sm hover:bg-[#eaf1fc]"
          >
            <RefreshCw size={17} />
            Reset Demo
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-4 text-sm font-bold text-white shadow-lg hover:bg-[#193b73]"
          >
            <Plus size={18} />
            Create Notification
          </button>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="notification-animate group relative min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.accent}`}
              />

              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#526581] sm:text-sm">
                    {stat.title}
                  </p>

                  <h2 className="mt-3 text-2xl font-extrabold text-[#10264d] sm:text-3xl">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`shrink-0 rounded-xl p-3 ${stat.bg}`}
                >
                  <Icon
                    size={22}
                    className={stat.color}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-[#526581]">
                {stat.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* MODULE NOTIFICATIONS */}
      <section className="mb-6 rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList
            size={19}
            className="text-[#173d77]"
          />

          <h2 className="text-base font-extrabold text-[#10264d]">
            Module Notifications
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {moduleSummary.map((item) => {
            const Icon =
              moduleIcons[item.module] ||
              Bell;

            return (
              <button
                key={item.module}
                type="button"
                onClick={() => {
                  setModuleFilter(
                    item.module
                  );

                  playSound("click");
                }}
                className={`rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  moduleFilter === item.module
                    ? "border-[#315b99] bg-[#eaf1fc]"
                    : "border-[#e0e7f1] bg-[#f8faff]"
                }`}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#173d77] shadow-sm">
                  <Icon size={18} />
                </div>

                <p className="min-h-[32px] text-xs font-bold leading-4 text-[#29416a]">
                  {item.module}
                </p>

                <p className="mt-2 text-2xl font-extrabold text-[#10264d]">
                  {item.count}
                </p>

                <p className="mt-1 text-[10px] font-medium text-[#526581]">
                  Notifications
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* OVERDUE ALERT */}
      {stats.overdue > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="shrink-0 rounded-xl bg-amber-100 p-2 text-amber-800">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-amber-950">
              {stats.overdue} Overdue Reminder
              {stats.overdue !== 1
                ? "s"
                : ""}
            </h3>

            <p className="mt-1 text-xs leading-6 text-amber-900 sm:text-sm">
              Some reminders have passed their
              due dates. Review them and update
              their status.
            </p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <section className="mb-6 rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter
            size={19}
            className="text-[#173d77]"
          />

          <h2 className="text-base font-bold text-[#10264d]">
            Search & Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative min-w-0">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#526581]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search notifications..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <CustomDropdown
            value={moduleFilter}
            options={[
              "All",
              ...MODULES,
            ]}
            onChange={
              setModuleFilter
            }
            playSound={playSound}
          />

          <CustomDropdown
            value={statusFilter}
            options={[
              "All",
              ...STATUSES,
            ]}
            onChange={
              setStatusFilter
            }
            playSound={playSound}
          />

          <CustomDropdown
            value={priorityFilter}
            options={[
              "All",
              ...PRIORITIES,
            ]}
            onChange={
              setPriorityFilter
            }
            playSound={playSound}
          />
        </div>
      </section>

      {/* RECORDS */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e0e7f1] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#10264d]">
              <ClipboardList size={20} />
              Notification Records
            </h2>

            <p className="mt-1 text-xs font-medium text-[#526581]">
              Showing {filtered.length} of{" "}
              {notifications.length} notifications
            </p>
          </div>

          {(search ||
            moduleFilter !== "All" ||
            statusFilter !== "All" ||
            priorityFilter !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-bold text-[#173d77] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            hasRecords={
              notifications.length > 0
            }
            onCreate={openCreate}
            onClear={clearFilters}
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-[#e0e7f1] bg-[#f7f9fd]">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-[#425673]">
                    <th className="px-5 py-4">
                      Notification
                    </th>
                    <th className="px-5 py-4">
                      Module
                    </th>
                    <th className="px-5 py-4">
                      Customer
                    </th>
                    <th className="px-5 py-4">
                      Priority
                    </th>
                    <th className="px-5 py-4">
                      Due Date
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf1f7]">
                  {filtered.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-[#f7f9fd]"
                      >
                        <td className="max-w-[280px] px-5 py-4 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              openView(item)
                            }
                            className="text-left"
                          >
                            <p className="text-sm font-bold text-[#10264d] hover:text-[#315b99]">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#526581]">
                              {item.message}
                            </p>
                          </button>

                          {isOverdue(
                            item
                          ) && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                              <AlertTriangle
                                size={12}
                              />
                              Overdue
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="text-sm font-bold text-[#29416a]">
                            {item.module ||
                              "General"}
                          </p>

                          <p className="mt-1 text-xs text-[#526581]">
                            {item.type}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top text-sm font-semibold text-[#29416a]">
                          {item.customer ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <StatusBadge
                            value={
                              item.priority
                            }
                            priority
                          />
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div
                            className={`flex items-center gap-1.5 text-xs font-bold ${
                              isOverdue(
                                item
                              )
                                ? "text-rose-700"
                                : "text-[#425673]"
                            }`}
                          >
                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              item.dueDate
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <select
                            value={
                              item.status
                            }
                            onChange={(
                              event
                            ) =>
                              updateStatus(
                                item.id,
                                event.target.value
                              )
                            }
                            className="max-w-[145px] rounded-xl border border-[#d9e3f2] bg-white px-2 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#315b99]"
                          >
                            {STATUSES.map(
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

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end">
                            <NotificationActions
                              item={
                                item
                              }
                              onView={
                                openView
                              }
                              onEdit={
                                openEdit
                              }
                              onDelete={
                                openDelete
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-5 lg:hidden">
              {filtered.map(
                (item) => {
                  const Icon =
                    moduleIcons[
                      item.module
                    ] || Bell;

                  return (
                    <article
                      key={
                        item.id
                      }
                      className="notification-animate flex min-w-0 flex-col rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-[#edf1f7] pb-3">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#173d77]">
                            <Icon
                              size={
                                19
                              }
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words text-sm font-bold text-[#10264d]">
                              {
                                item.title
                              }
                            </h3>

                            <p className="mt-1 text-xs font-semibold text-[#315b99]">
                              {
                                item.module
                              }
                            </p>
                          </div>
                        </div>

                        <NotificationActions
                          item={
                            item
                          }
                          onView={
                            openView
                          }
                          onEdit={
                            openEdit
                          }
                          onDelete={
                            openDelete
                          }
                        />
                      </div>

                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-[#526581]">
                        {
                          item.message
                        }
                      </p>

                      {isOverdue(
                        item
                      ) && (
                        <p className="mt-3 flex items-center gap-1 text-xs font-bold text-rose-700">
                          <AlertTriangle
                            size={
                              14
                            }
                          />
                          Overdue Reminder
                        </p>
                      )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <InfoBox
                          label="Customer"
                          value={
                            item.customer
                          }
                          icon={
                            UserRound
                          }
                        />

                        <InfoBox
                          label="Channel"
                          value={
                            item.channel
                          }
                          icon={
                            MessageSquare
                          }
                        />

                        <InfoBox
                          label="Due Date"
                          value={formatDate(
                            item.dueDate
                          )}
                          icon={
                            CalendarDays
                          }
                        />

                        <div className="rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3">
                          <p className="mb-2 text-xs font-medium text-[#526581]">
                            Priority
                          </p>

                          <StatusBadge
                            value={
                              item.priority
                            }
                            priority
                          />
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <div className="border-t border-[#edf1f7] pt-3">
                          <p className="mb-2 text-xs font-bold text-[#29416a]">
                            Update Status
                          </p>

                          <CustomDropdown
                            compact
                            value={
                              item.status
                            }
                            options={
                              STATUSES
                            }
                            onChange={(
                              status
                            ) =>
                              updateStatus(
                                item.id,
                                status
                              )
                            }
                            playSound={
                              playSound
                            }
                            direction="up"
                          />
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-[#edf1f7] px-4 py-4 text-xs font-semibold text-[#526581] sm:px-6">
          <span>
            Showing {filtered.length} of{" "}
            {notifications.length} records
          </span>

          <span>
            Studio Raw ERP
          </span>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <ModalShell
          title={
            editingId !== null
              ? "Edit Notification"
              : "Create Notification"
          }
          subtitle="Enter notification and reminder details."
          onClose={closeForm}
          maxWidth="max-w-[760px]"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-[#d9e3f2] bg-white px-6 py-3 text-sm font-bold text-[#10264d] hover:bg-[#eaf1fc]"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="notification-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-bold text-white hover:bg-[#193b73]"
              >
                <Save size={17} />

                {editingId !== null
                  ? "Update Notification"
                  : "Save Notification"}
              </button>
            </div>
          }
        >
          <form
            id="notification-form"
            onSubmit={saveNotification}
            className="space-y-4 sm:space-y-5"
          >
            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-[#edf1f7] pb-4 text-sm font-extrabold text-[#10264d]">
                <BellRing size={18} />
                Notification Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField
                    label="Notification Title"
                    required
                  >
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(event) =>
                        updateForm(
                          "title",
                          event.target.value
                        )
                      }
                      placeholder="Enter notification title"
                      className={inputClass}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField
                    label="Message"
                    required
                  >
                    <textarea
                      required
                      rows={3}
                      value={form.message}
                      onChange={(event) =>
                        updateForm(
                          "message",
                          event.target.value
                        )
                      }
                      placeholder="Write notification message..."
                      className={`${inputClass} resize-none`}
                    />
                  </FormField>
                </div>

                <FormField label="Customer / Recipient">
                  <input
                    type="text"
                    value={form.customer}
                    onChange={(event) =>
                      updateForm(
                        "customer",
                        event.target.value
                      )
                    }
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Module">
                  <CustomDropdown
                    value={form.module}
                    options={MODULES}
                    onChange={(value) =>
                      updateForm(
                        "module",
                        value
                      )
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Notification Type">
                  <CustomDropdown
                    value={form.type}
                    options={TYPES}
                    onChange={(value) =>
                      updateForm(
                        "type",
                        value
                      )
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Channel">
                  <CustomDropdown
                    value={form.channel}
                    options={CHANNELS}
                    onChange={(value) =>
                      updateForm(
                        "channel",
                        value
                      )
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Priority">
                  <CustomDropdown
                    value={form.priority}
                    options={PRIORITIES}
                    onChange={(value) =>
                      updateForm(
                        "priority",
                        value
                      )
                    }
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-[#edf1f7] pb-4 text-sm font-extrabold text-[#10264d]">
                <CalendarDays size={18} />
                Schedule & Status
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Notification Status">
                  <CustomDropdown
                    value={form.status}
                    options={STATUSES}
                    onChange={(value) =>
                      updateForm(
                        "status",
                        value
                      )
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Due Date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm(
                        "dueDate",
                        event.target.value
                      )
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-800">
                <AlertTriangle
                  size={18}
                  className="shrink-0"
                />

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
                className="rounded-xl border border-[#d9e3f2] bg-white px-6 py-3 text-sm font-bold text-[#10264d] hover:bg-[#eaf1fc]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  openEdit(currentView)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white hover:bg-[#193b73]"
              >
                <Pencil size={16} />
                Edit Notification
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge
                  value={
                    currentView.status
                  }
                />

                <StatusBadge
                  value={
                    currentView.priority
                  }
                  priority
                />

                {isOverdue(
                  currentView
                ) && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                    <AlertTriangle
                      size={13}
                    />
                    Overdue
                  </span>
                )}
              </div>

              <h3 className="break-words text-xl font-extrabold text-[#10264d]">
                {
                  currentView.title
                }
              </h3>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[#425673]">
                {
                  currentView.message
                }
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoBox
                label="Customer"
                value={
                  currentView.customer
                }
                icon={UserRound}
              />

              <InfoBox
                label="Module"
                value={
                  currentView.module
                }
                icon={
                  ClipboardList
                }
              />

              <InfoBox
                label="Type"
                value={
                  currentView.type
                }
                icon={Bell}
              />

              <InfoBox
                label="Channel"
                value={
                  currentView.channel
                }
                icon={Send}
              />

              <InfoBox
                label="Due Date"
                value={formatDate(
                  currentView.dueDate
                )}
                icon={
                  CalendarDays
                }
              />

              <InfoBox
                label="Created Date"
                value={formatDate(
                  currentView.createdAt
                )}
                icon={
                  CalendarDays
                }
              />
            </div>

            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4">
              <FormField label="Update Status">
                <CustomDropdown
                  value={
                    currentView.status
                  }
                  options={
                    STATUSES
                  }
                  onChange={(
                    status
                  ) =>
                    updateStatus(
                      currentView.id,
                      status
                    )
                  }
                  playSound={
                    playSound
                  }
                  direction="up"
                />
              </FormField>
            </div>

            <button
              type="button"
              onClick={() =>
                openDelete(
                  currentView.id
                )
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 hover:bg-rose-100"
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
                className="flex-1 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm font-bold text-[#10264d] hover:bg-[#eaf1fc]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          }
        >
          <div className="py-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <Trash2 size={28} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#10264d]">
              Remove this notification?
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#526581]">
              This notification will be
              permanently removed from your
              saved records.
            </p>
          </div>
        </ModalShell>
      )}

      {/* TOAST */}
      {toast &&
        createPortal(
          <div className="studio-notifications-light fixed bottom-4 left-4 right-4 z-[10000] flex items-center gap-3 rounded-xl border border-[#d9e3f2] bg-white px-4 py-3 text-sm font-bold text-[#10264d] shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
            <CheckCircle2
              size={18}
              className="shrink-0 text-emerald-700"
            />

            <span className="min-w-0 flex-1">
              {toast}
            </span>

            <button
              type="button"
              onClick={() =>
                setToast("")
              }
              className="rounded-lg p-1 text-[#10264d] hover:bg-[#eaf1fc]"
            >
              <X size={16} />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
