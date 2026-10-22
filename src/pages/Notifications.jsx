
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
  Volume2,
  VolumeX,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

const STORAGE_KEY = "studioraw_notifications";
const SOUND_KEY = "studioraw_notification_sounds";

const TYPES = [
  "Appointment",
  "Payment",
  "Album Delivery",
  "Customer Follow-up",
  "Internal",
  "Other",
];

const CHANNELS = ["WhatsApp", "SMS", "Email", "In-App"];
const STATUSES = ["Pending", "In Progress", "Sent", "Completed"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const DEMO_DATA = [
  {
    id: 101,
    title: "Wedding Album Delivery",
    message: "Deliver the completed wedding album to the customer.",
    type: "Album Delivery",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Arun Kumar",
    dueDate: "2026-10-24",
    createdAt: "2026-10-20",
  },
  {
    id: 102,
    title: "Pre-Wedding Shoot Reminder",
    message: "Confirm outdoor shooting location and reporting time.",
    type: "Appointment",
    channel: "SMS",
    status: "Sent",
    priority: "Medium",
    customer: "Priya Sharma",
    dueDate: "2026-10-25",
    createdAt: "2026-10-19",
  },
  {
    id: 103,
    title: "Pending Wedding Payment",
    message: "Follow up regarding the remaining wedding package payment.",
    type: "Payment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Urgent",
    customer: "Vijay Raj",
    dueDate: "2026-10-21",
    createdAt: "2026-10-18",
  },
  {
    id: 104,
    title: "Album Photo Selection",
    message: "Request customer approval for selected album photographs.",
    type: "Customer Follow-up",
    channel: "Email",
    status: "In Progress",
    priority: "Medium",
    customer: "Divya R",
    dueDate: "2026-10-27",
    createdAt: "2026-10-21",
  },
  {
    id: 105,
    title: "Studio Equipment Inspection",
    message: "Check cameras, lenses, batteries and lighting equipment.",
    type: "Internal",
    channel: "In-App",
    status: "Completed",
    priority: "Low",
    customer: "Studio Team",
    dueDate: "2026-10-22",
    createdAt: "2026-10-20",
  },
  {
    id: 106,
    title: "Birthday Photoshoot Confirmation",
    message: "Confirm birthday event timing and decoration details.",
    type: "Appointment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Karthik S",
    dueDate: "2026-10-23",
    createdAt: "2026-10-21",
  },
  {
    id: 107,
    title: "Engagement Album Dispatch",
    message: "Dispatch the engagement album through courier.",
    type: "Album Delivery",
    channel: "SMS",
    status: "In Progress",
    priority: "High",
    customer: "Meena Devi",
    dueDate: "2026-10-26",
    createdAt: "2026-10-21",
  },
  {
    id: 108,
    title: "Baby Shoot Appointment",
    message: "Remind customer about the upcoming baby photography session.",
    type: "Appointment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Medium",
    customer: "Nithya Kumar",
    dueDate: "2026-10-28",
    createdAt: "2026-10-22",
  },
  {
    id: 109,
    title: "Advance Payment Confirmation",
    message: "Confirm advance payment received for the engagement package.",
    type: "Payment",
    channel: "Email",
    status: "Completed",
    priority: "Low",
    customer: "Sanjay R",
    dueDate: "2026-10-20",
    createdAt: "2026-10-18",
  },
  {
    id: 110,
    title: "Wedding Video Approval",
    message: "Request feedback on the edited wedding highlight video.",
    type: "Customer Follow-up",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Aishwarya S",
    dueDate: "2026-10-29",
    createdAt: "2026-10-22",
  },
  {
    id: 111,
    title: "Camera Maintenance",
    message: "Schedule maintenance for the main studio camera.",
    type: "Internal",
    channel: "In-App",
    status: "In Progress",
    priority: "Medium",
    customer: "Technical Team",
    dueDate: "2026-10-30",
    createdAt: "2026-10-20",
  },
  {
    id: 112,
    title: "Portrait Album Collection",
    message: "Inform customer that the portrait album is ready for pickup.",
    type: "Album Delivery",
    channel: "SMS",
    status: "Sent",
    priority: "Medium",
    customer: "Rahul M",
    dueDate: "2026-10-24",
    createdAt: "2026-10-21",
  },
  {
    id: 113,
    title: "Corporate Event Confirmation",
    message: "Confirm event schedule and photography team requirements.",
    type: "Appointment",
    channel: "Email",
    status: "Pending",
    priority: "High",
    customer: "ABC Technologies",
    dueDate: "2026-11-02",
    createdAt: "2026-10-22",
  },
  {
    id: 114,
    title: "Birthday Package Balance",
    message: "Remind customer to complete the birthday photography payment.",
    type: "Payment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Urgent",
    customer: "Harini P",
    dueDate: "2026-10-22",
    createdAt: "2026-10-19",
  },
  {
    id: 115,
    title: "Wedding Album Printing",
    message: "Follow up with the printing team regarding album completion.",
    type: "Internal",
    channel: "In-App",
    status: "In Progress",
    priority: "High",
    customer: "Printing Team",
    dueDate: "2026-10-27",
    createdAt: "2026-10-21",
  },
  {
    id: 116,
    title: "Couple Shoot Confirmation",
    message: "Confirm couple shoot date, venue and outfit requirements.",
    type: "Appointment",
    channel: "WhatsApp",
    status: "Sent",
    priority: "Medium",
    customer: "Ajith & Kavya",
    dueDate: "2026-10-31",
    createdAt: "2026-10-22",
  },
  {
    id: 117,
    title: "Photo Frame Delivery",
    message: "Arrange delivery of customized photo frames.",
    type: "Album Delivery",
    channel: "SMS",
    status: "Pending",
    priority: "Medium",
    customer: "Deepa R",
    dueDate: "2026-11-01",
    createdAt: "2026-10-22",
  },
  {
    id: 118,
    title: "Engagement Payment Follow-up",
    message: "Contact customer regarding outstanding engagement balance.",
    type: "Payment",
    channel: "WhatsApp",
    status: "In Progress",
    priority: "High",
    customer: "Praveen Kumar",
    dueDate: "2026-10-26",
    createdAt: "2026-10-20",
  },
  {
    id: 119,
    title: "Album Design Approval",
    message: "Request final approval for the wedding album design.",
    type: "Customer Follow-up",
    channel: "Email",
    status: "Pending",
    priority: "Medium",
    customer: "Swetha S",
    dueDate: "2026-10-28",
    createdAt: "2026-10-22",
  },
  {
    id: 120,
    title: "Memory Card Backup",
    message: "Backup event photographs and videos to studio storage.",
    type: "Internal",
    channel: "In-App",
    status: "Completed",
    priority: "High",
    customer: "Editing Team",
    dueDate: "2026-10-21",
    createdAt: "2026-10-20",
  },
  {
    id: 121,
    title: "Maternity Shoot Reminder",
    message: "Remind customer about the maternity photoshoot appointment.",
    type: "Appointment",
    channel: "SMS",
    status: "Pending",
    priority: "Medium",
    customer: "Anu Joseph",
    dueDate: "2026-11-03",
    createdAt: "2026-10-22",
  },
  {
    id: 122,
    title: "Wedding Album Pickup",
    message: "Notify customer that the completed album is ready for collection.",
    type: "Album Delivery",
    channel: "WhatsApp",
    status: "Sent",
    priority: "Low",
    customer: "Manoj R",
    dueDate: "2026-10-23",
    createdAt: "2026-10-20",
  },
  {
    id: 123,
    title: "Photography Booking Advance",
    message: "Request advance payment to confirm the wedding booking.",
    type: "Payment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "High",
    customer: "Lakshmi N",
    dueDate: "2026-10-30",
    createdAt: "2026-10-22",
  },
  {
    id: 124,
    title: "Edited Photos Review",
    message: "Ask customer to review the edited birthday photographs.",
    type: "Customer Follow-up",
    channel: "Email",
    status: "In Progress",
    priority: "Medium",
    customer: "Rohit K",
    dueDate: "2026-10-29",
    createdAt: "2026-10-21",
  },
  {
    id: 125,
    title: "Lighting Equipment Purchase",
    message: "Follow up on the purchase of additional studio lighting.",
    type: "Internal",
    channel: "In-App",
    status: "Pending",
    priority: "Low",
    customer: "Purchase Team",
    dueDate: "2026-11-05",
    createdAt: "2026-10-22",
  },
  {
    id: 126,
    title: "Reception Photography Reminder",
    message: "Confirm reception venue and photographer reporting time.",
    type: "Appointment",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Urgent",
    customer: "Dinesh & Nisha",
    dueDate: "2026-10-23",
    createdAt: "2026-10-21",
  },
  {
    id: 127,
    title: "Baby Album Courier Update",
    message: "Send baby album courier tracking details to the customer.",
    type: "Album Delivery",
    channel: "SMS",
    status: "Completed",
    priority: "Low",
    customer: "Fathima A",
    dueDate: "2026-10-20",
    createdAt: "2026-10-18",
  },
  {
    id: 128,
    title: "Corporate Invoice Reminder",
    message: "Follow up regarding payment for corporate event coverage.",
    type: "Payment",
    channel: "Email",
    status: "Pending",
    priority: "High",
    customer: "Bright Solutions",
    dueDate: "2026-10-28",
    createdAt: "2026-10-22",
  },
  {
    id: 129,
    title: "Wedding Video Delivery",
    message: "Share the completed wedding video with the customer.",
    type: "Album Delivery",
    channel: "WhatsApp",
    status: "In Progress",
    priority: "Medium",
    customer: "Sathish P",
    dueDate: "2026-11-04",
    createdAt: "2026-10-22",
  },
  {
    id: 130,
    title: "Customer Feedback Request",
    message: "Request feedback after successful photography service delivery.",
    type: "Customer Follow-up",
    channel: "WhatsApp",
    status: "Pending",
    priority: "Low",
    customer: "Keerthana R",
    dueDate: "2026-11-06",
    createdAt: "2026-10-22",
  },
];

const today = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const blankForm = () => ({
  title: "",
  message: "",
  type: "Appointment",
  channel: "WhatsApp",
  status: "Pending",
  priority: "Medium",
  customer: "",
  dueDate: today(),
});

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#d9e3f2] bg-white px-3.5 py-3 text-sm text-[#10264d] outline-none transition placeholder:text-slate-400 focus:border-[#315b99] focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wide text-[#29416a]";

const statusClasses = {
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  "In Progress": "border-blue-200 bg-blue-50 text-blue-700",
  Sent: "border-violet-200 bg-violet-50 text-violet-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const priorityClasses = {
  Low: "border-slate-200 bg-slate-50 text-slate-600",
  Medium: "border-blue-200 bg-blue-50 text-blue-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Urgent: "border-rose-200 bg-rose-50 text-rose-700",
};

function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(item) {
  return Boolean(
    item.dueDate &&
      item.dueDate < today() &&
      !["Completed", "Sent"].includes(item.status)
  );
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `NOT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  );
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return { data: parsed, demo: false };
      }
    }
  } catch (error) {
    console.error("Could not load notifications:", error);
  }

  return {
    data: DEMO_DATA.map((item) => ({ ...item })),
    demo: true,
  };
}

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
      localStorage.setItem(SOUND_KEY, String(soundEnabled));
    } catch {
      // Storage unavailable.
    }
  }, [soundEnabled]);

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
          oscillator.frequency.setValueAtTime(frequency, start);

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
      // Audio should not interrupt user actions.
    }
  };

  return { soundEnabled, setSoundEnabled, playSound };
}

function CustomDropdown({
  value,
  options,
  onChange,
  playSound,
  placeholder = "Select option",
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

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          playSound?.("click");
          setOpen((prev) => !prev);
        }}
        className={`flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#d9e3f2] bg-white text-left text-sm font-semibold text-[#10264d] outline-none transition hover:border-[#315b99] focus:ring-2 focus:ring-blue-100 ${
          compact ? "px-3 py-2.5" : "px-3.5 py-3"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">
          {value || placeholder}
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
          role="listbox"
          className={`absolute left-0 right-0 z-[100] max-h-52 overflow-y-auto rounded-xl border border-[#d9e3f2] bg-white p-1 shadow-xl ${
            direction === "up"
              ? "bottom-full mb-1"
              : "top-full mt-1"
          }`}
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
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition sm:text-sm ${
                value === option
                  ? "bg-[#eaf1fc] font-bold text-[#10264d]"
                  : "text-slate-600 hover:bg-[#f4f7fc]"
              }`}
            >
              <span className="min-w-0 break-words">{option}</span>

              {value === option && (
                <Check size={15} className="shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ value, priority = false }) {
  const styles = priority ? priorityClasses : statusClasses;

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        styles[value] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
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
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InfoBox({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
        {Icon && <Icon size={12} className="shrink-0 text-[#315b99]" />}
        <span>{label}</span>
      </div>

      <p className="break-words text-xs font-bold leading-relaxed text-[#10264d]">
        {value || "—"}
      </p>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-2xl",
  footer,
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-5">
      <div
        className="absolute inset-0 bg-[#07152b]/70 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-[min(95dvh,850px)] w-full min-w-0 ${maxWidth} flex-col overflow-hidden rounded-2xl border border-white/40 bg-[#f4f7fc] shadow-2xl sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl`}
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
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-xl border border-[#d9e3f2] bg-white p-2.5 text-[#10264d] transition hover:bg-[#eaf1fc]"
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
        title="View Notification"
        aria-label="View Notification"
        onClick={() => onView(item)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1fc] text-[#173d77] transition hover:bg-[#dce9fb]"
      >
        <Eye size={16} />
      </button>

      <button
        type="button"
        title="Edit Notification"
        aria-label="Edit Notification"
        onClick={() => onEdit(item)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 transition hover:bg-amber-100"
      >
        <Pencil size={16} />
      </button>

      <button
        type="button"
        title="Delete Notification"
        aria-label="Delete Notification"
        onClick={() => onDelete(item.id)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function EmptyState({ hasRecords, onCreate, onClear }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center px-4 py-14 text-center sm:py-20">
      <div className="mb-4 rounded-2xl bg-[#eaf1fc] p-5">
        <Bell size={34} className="text-[#8ba5c9]" />
      </div>

      <h3 className="font-bold text-[#10264d]">
        No notifications found
      </h3>

      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasRecords
          ? "Try changing your search or filters."
          : "Start by creating your first notification."}
      </p>

      <button
        type="button"
        onClick={hasRecords ? onClear : onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#10264d] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#193b73]"
      >
        {hasRecords ? <RefreshCw size={16} /> : <Plus size={16} />}
        {hasRecords ? "Clear Filters" : "Create Notification"}
      </button>
    </div>
  );
}

export default function Notifications() {
  const initial = useMemo(() => loadData(), []);

  const [notifications, setNotifications] = useState(initial.data);
  const [isDemo, setIsDemo] = useState(initial.demo);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const toastTimerRef = useRef(null);

  const {
    soundEnabled,
    setSoundEnabled,
    playSound,
  } = useNotificationSounds();

  useEffect(() => {
    if (isDemo) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Could not save notifications:", error);
    }
  }, [notifications, isDemo]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast(message);

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 2800);
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) setError("");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPriorityFilter("All");
    playSound("click");
  };

  const stats = useMemo(() => {
    return {
      total: notifications.length,
      pending: notifications.filter(
        (item) => item.status === "Pending"
      ).length,
      progress: notifications.filter(
        (item) => item.status === "In Progress"
      ).length,
      completed: notifications.filter((item) =>
        ["Sent", "Completed"].includes(item.status)
      ).length,
      overdue: notifications.filter(isOverdue).length,
    };
  }, [notifications]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.title,
          item.message,
          item.customer,
          item.type,
          item.channel,
          item.priority,
          item.status,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return (
        matchesSearch &&
        (statusFilter === "All" ||
          item.status === statusFilter) &&
        (typeFilter === "All" ||
          item.type === typeFilter) &&
        (priorityFilter === "All" ||
          item.priority === priorityFilter)
      );
    });
  }, [
    notifications,
    search,
    statusFilter,
    typeFilter,
    priorityFilter,
  ]);

  const statCards = [
    {
      title: "Total Notifications",
      value: stats.total,
      icon: Bell,
      note: "All reminders",
      color: "text-[#173d77]",
      bg: "bg-[#eaf1fc]",
      accent: "from-[#10264d] to-[#315b99]",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock3,
      note: "Awaiting action",
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "from-amber-400 to-orange-500",
    },
    {
      title: "In Progress",
      value: stats.progress,
      icon: RefreshCw,
      note: "Being handled",
      color: "text-blue-700",
      bg: "bg-blue-50",
      accent: "from-blue-500 to-[#10264d]",
    },
    {
      title: "Completed / Sent",
      value: stats.completed,
      icon: CheckCircle2,
      note: "Finished reminders",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      accent: "from-emerald-400 to-green-600",
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
      type: item.type || "Appointment",
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

  const closeForm = () => {
    playSound("click");
    setModalOpen(false);
    setEditingId(null);
    setError("");
  };

  const closeView = () => {
    playSound("click");
    setViewingId(null);
  };

  const saveNotification = (event) => {
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

      showToast("Notification updated successfully.");
    } else {
      setNotifications((current) => [
        {
          ...data,
          id: makeId(),
          createdAt: today(),
        },
        ...current,
      ]);

      showToast("Notification created successfully.");
    }

    setIsDemo(false);
    playSound("success");
    setModalOpen(false);
    setEditingId(null);
    setForm(blankForm());
    setError("");
  };

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
    showToast(`Status updated to ${status}.`);
  };

  const openDelete = (id) => {
    playSound("click");
    setDeleteId(id);
  };

  const confirmDelete = () => {
    setNotifications((current) =>
      current.filter((item) => item.id !== deleteId)
    );

    setIsDemo(false);
    setDeleteId(null);
    setViewingId(null);

    playSound("delete");
    showToast("Notification deleted successfully.");
  };

  const resetDemo = () => {
    playSound("click");

    if (
      !window.confirm(
        "Restore all 30 sample notifications? This will replace your currently saved notifications."
      )
    ) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Could not reset notifications:", error);
    }

    setNotifications(
      DEMO_DATA.map((item) => ({ ...item }))
    );

    setIsDemo(true);
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setPriorityFilter("All");
    setModalOpen(false);
    setEditingId(null);
    setViewingId(null);
    setDeleteId(null);
    setError("");

    playSound("success");
    showToast("30 demo notifications restored.");
  };

  const currentView = notifications.find(
    (item) => item.id === viewingId
  );

  const closeDelete = () => {
    playSound("click");
    setDeleteId(null);
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#f4f7fc] px-3 py-4 text-slate-800 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#315b99] sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#173d77]" />
            Studio Raw / Communication
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#10264d] sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500 sm:text-sm">
            Manage customer reminders, appointments, payments,
            album deliveries and studio follow-ups.
          </p>

          {isDemo && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d9e3f2] bg-[#eaf1fc] px-3 py-1 text-[11px] font-semibold text-[#173d77]">
              <Bell size={12} />
              Demo Data · {notifications.length} sample records
            </span>
          )}
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
            aria-label={soundEnabled ? "Mute Sounds" : "Enable Sounds"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d9e3f2] bg-white text-[#10264d] shadow-sm transition hover:bg-[#eaf1fc]"
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
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#d9e3f2] bg-white px-3 py-2.5 text-xs font-bold text-[#10264d] shadow-sm transition hover:bg-[#eaf1fc] sm:flex-none sm:px-5 sm:text-sm"
          >
            <RefreshCw size={17} />
            Reset Demo
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-3 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#193b73] sm:flex-none sm:px-5 sm:text-sm"
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
              className="group relative min-w-0 overflow-hidden rounded-2xl border border-[#e0e7f1] bg-white p-3.5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5"
            >
              <div
                className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${stat.accent}`}
              />

              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium leading-5 text-slate-500 sm:text-sm">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#10264d] sm:mt-3 sm:text-3xl">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`shrink-0 rounded-xl p-2.5 sm:rounded-2xl sm:p-3.5 ${stat.bg}`}
                >
                  <Icon size={21} className={stat.color} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:mt-5 sm:text-xs">
                <ArrowUpRight
                  size={14}
                  className={`shrink-0 ${stat.color}`}
                />
                {stat.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* OVERDUE ALERT */}
      {stats.overdue > 0 && (
        <div className="mb-6 flex min-w-0 items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 sm:p-4">
          <div className="shrink-0 rounded-xl bg-amber-100 p-2 text-amber-700">
            <AlertTriangle size={20} />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-amber-900">
              {stats.overdue} Overdue Reminder
              {stats.overdue !== 1 ? "s" : ""}
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-amber-700 sm:text-sm">
              Some reminders have passed their due dates.
              Review them and update their status.
            </p>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <section className="mb-6 min-w-0 rounded-2xl border border-[#e0e7f1] bg-white p-3.5 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={19} className="text-[#173d77]" />

          <h2 className="text-sm font-bold text-[#10264d] sm:text-base">
            Search & Filters
          </h2>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative min-w-0">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <CustomDropdown
            value={statusFilter}
            options={["All", ...STATUSES]}
            onChange={setStatusFilter}
            playSound={playSound}
          />

          <CustomDropdown
            value={typeFilter}
            options={["All", ...TYPES]}
            onChange={setTypeFilter}
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

      {/* NOTIFICATION RECORDS */}
      <section className="min-w-0 rounded-2xl border border-[#e0e7f1] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-3.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#10264d] sm:text-lg">
              <ClipboardList
                size={20}
                className="shrink-0 text-[#173d77]"
              />
              Notification Records
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Showing {filtered.length} of {notifications.length} notifications
            </p>
          </div>

          {(search ||
            statusFilter !== "All" ||
            typeFilter !== "All" ||
            priorityFilter !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-xs font-bold text-[#173d77] transition hover:underline sm:text-sm"
            >
              Clear Filters
            </button>
          )}
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
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1040px] text-left">
                <thead className="border-b border-[#e0e7f1] bg-[#f7f9fd]">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-[#526581]">
                    <th className="px-5 py-4">Notification</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Type / Channel</th>
                    <th className="px-5 py-4">Priority</th>
                    <th className="px-5 py-4">Due Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#edf1f7]">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-[#f7f9fd]"
                    >
                      <td className="max-w-[260px] px-5 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => openView(item)}
                          className="text-left"
                        >
                          <p className="text-sm font-bold text-[#10264d] hover:text-[#315b99]">
                            {item.title}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
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

                      <td className="px-5 py-4 align-top text-sm font-semibold text-[#29416a]">
                        {item.customer || "—"}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="text-sm font-semibold text-[#10264d]">
                          {item.type}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {item.channel}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top">
                        <StatusBadge
                          value={item.priority}
                          priority
                        />
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div
                          className={`flex items-center gap-1.5 text-xs font-semibold ${
                            isOverdue(item)
                              ? "text-rose-600"
                              : "text-[#526581]"
                          }`}
                        >
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
                          aria-label={`Status for ${item.title}`}
                          className="max-w-[145px] rounded-xl border border-[#d9e3f2] bg-white px-2 py-2 text-xs font-bold text-[#10264d] outline-none focus:border-[#315b99]"
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE / TABLET CARDS */}
            <div className="grid min-w-0 grid-cols-1 items-stretch gap-3 p-3 lg:hidden sm:grid-cols-2 sm:gap-4 sm:p-5">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-[#e0e7f1] bg-white p-3.5 shadow-sm transition hover:border-[#a9bddc] hover:shadow-md sm:p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1fc] text-[#10264d]">
                        <Bell size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-bold leading-5 text-[#10264d]">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-[11px] text-[#315b99]">
                          {item.type}
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

                  <p className="mt-3 line-clamp-3 min-h-[40px] text-xs leading-relaxed text-slate-500">
                    {item.message}
                  </p>

                  {isOverdue(item) && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
                      <AlertTriangle size={14} />
                      Overdue Reminder
                    </div>
                  )}

                  <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
                    <InfoBox
                      label="Customer"
                      value={item.customer || "—"}
                      icon={UserRound}
                    />

                    <InfoBox
                      label="Channel"
                      value={item.channel}
                      icon={MessageSquare}
                    />

                    <InfoBox
                      label="Due Date"
                      value={formatDate(item.dueDate)}
                      icon={CalendarDays}
                    />

                    <div className="rounded-xl border border-[#e5ebf4] bg-[#f7f9fd] p-3">
                      <p className="mb-2 text-[10px] text-slate-500">
                        Priority
                      </p>

                      <StatusBadge
                        value={item.priority}
                        priority
                      />
                    </div>
                  </div>

                  <div className="mt-auto border-t border-slate-100 pt-3">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Update Status
                    </p>

                    <CustomDropdown
                      compact
                      value={item.status}
                      options={STATUSES}
                      onChange={(status) =>
                        updateStatus(item.id, status)
                      }
                      playSound={playSound}
                      direction="up"
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Showing {filtered.length} of {notifications.length} records
          </span>

          <span>Studio Raw ERP</span>
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
                className="rounded-xl border border-[#d9e3f2] bg-white px-6 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#eaf1fc]"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="notification-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#193b73]"
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
            {/* BASIC INFORMATION */}
            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                <BellRing size={18} className="text-[#173d77]" />
                Notification Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <FormField label="Notification Title" required>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={(event) =>
                        updateForm("title", event.target.value)
                      }
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
                      onChange={(event) =>
                        updateForm("message", event.target.value)
                      }
                      placeholder="Write reminder message..."
                      className={`${inputClass} resize-none`}
                    />
                  </FormField>
                </div>

                <FormField label="Customer / Recipient">
                  <input
                    type="text"
                    value={form.customer}
                    onChange={(event) =>
                      updateForm("customer", event.target.value)
                    }
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Notification Type">
                  <CustomDropdown
                    value={form.type}
                    options={TYPES}
                    onChange={(value) =>
                      updateForm("type", value)
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Channel">
                  <CustomDropdown
                    value={form.channel}
                    options={CHANNELS}
                    onChange={(value) =>
                      updateForm("channel", value)
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Priority">
                  <CustomDropdown
                    value={form.priority}
                    options={PRIORITIES}
                    onChange={(value) =>
                      updateForm("priority", value)
                    }
                    playSound={playSound}
                  />
                </FormField>
              </div>
            </div>

            {/* STATUS AND DATE */}
            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-sm font-bold text-[#10264d]">
                <CalendarDays
                  size={18}
                  className="text-[#173d77]"
                />
                Schedule & Status
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Notification Status">
                  <CustomDropdown
                    value={form.status}
                    options={STATUSES}
                    onChange={(value) =>
                      updateForm("status", value)
                    }
                    playSound={playSound}
                  />
                </FormField>

                <FormField label="Due Date">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      updateForm("dueDate", event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
              >
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
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
          subtitle="View complete reminder information."
          onClose={closeView}
          maxWidth="max-w-[620px]"
          footer={
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={closeView}
                className="rounded-xl border border-[#d9e3f2] bg-white px-6 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#eaf1fc]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openEdit(currentView)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#193b73]"
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
                <StatusBadge value={currentView.status} />
                <StatusBadge
                  value={currentView.priority}
                  priority
                />

                {isOverdue(currentView) && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                    <AlertTriangle size={13} />
                    Overdue
                  </span>
                )}
              </div>

              <h3 className="break-words text-lg font-extrabold text-[#10264d] sm:text-xl">
                {currentView.title}
              </h3>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">
                {currentView.message}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <InfoBox
                label="Customer"
                value={currentView.customer || "—"}
                icon={UserRound}
              />

              <InfoBox
                label="Type"
                value={currentView.type}
                icon={Bell}
              />

              <InfoBox
                label="Channel"
                value={currentView.channel}
                icon={MessageSquare}
              />

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

              <InfoBox
                label="Priority"
                value={currentView.priority}
                icon={AlertTriangle}
              />
            </div>

            <div className="rounded-2xl border border-[#e0e7f1] bg-white p-4">
              <FormField label="Update Status">
                <CustomDropdown
                  value={currentView.status}
                  options={STATUSES}
                  onChange={(status) =>
                    updateStatus(currentView.id, status)
                  }
                  playSound={playSound}
                  direction="up"
                />
              </FormField>
            </div>

            <button
              type="button"
              onClick={() => openDelete(currentView.id)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-100"
            >
              <Trash2 size={16} />
              Delete Notification
            </button>
          </div>
        </ModalShell>
      )}

      {/* DELETE CONFIRMATION */}
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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Trash2 size={28} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#10264d]">
              Remove this notification?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This notification will be permanently removed
              from your saved records.
            </p>
          </div>
        </ModalShell>
      )}

      {/* TOAST */}
      {toast &&
        createPortal(
          <div
            role="status"
            className="fixed bottom-4 left-4 right-4 z-[10000] flex items-center gap-3 rounded-xl bg-[#10264d] px-4 py-3 text-xs font-semibold text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm sm:text-sm"
          >
            <CheckCircle2
              size={18}
              className="shrink-0 text-white"
            />

            <span className="min-w-0 flex-1">{toast}</span>

            <button
              type="button"
              onClick={() => setToast("")}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
