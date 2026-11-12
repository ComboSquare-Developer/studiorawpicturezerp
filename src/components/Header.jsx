
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  Bell,
  ChevronRight,
  Camera,
  CalendarDays,
  Truck,
  CheckCircle2,
} from "lucide-react";
import studioLogo from "../assets/favicon.png";
import {
  getGeneratedNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  UPDATE_EVENT,
} from "../services/notificationService";

/* ==========================================
   CONSTANTS
========================================== */

const SOUND_KEY = "studioraw_sound";
const PROFILE_KEY = "studioraw_admin_profile";

// Dummy admin profile image
// For a permanent local image, place admin-profile.jpg
// in public/ and change this to "/admin-profile.jpg".
const ADMIN_IMAGE = "https://i.pravatar.cc/150?img=47";

const pageTitles = {
  dashboard: "Dashboard",
  enquiries: "Enquiries & Leads",
  leads: "Enquiries & Leads",
  customers: "Customers",
  bookings: "Booking & Calendar",
  "booking-calendar": "Booking & Calendar",
  calendar: "Booking & Calendar",
  "wedding-photography": "Wedding Photography",
  "wedding-videography": "Wedding Videography",
  "functions-we-arrange": "Functions We Arrange",
  "event-management": "Event Management",
  "customized-gifts": "Customized Gifts",
  payments: "Payment & Billing",
  billing: "Payment & Billing",
  preshoot: "Pre-Shoot Preparation",
  photoshoot: "Photo Shoot & Data",
  photoediting: "Photo Selection & Editing",
  albumprinting: "Album Design & Printing",
  deliveries: "Delivery Management",
  delivery: "Delivery Management",
  followup: "Follow-up & CRM",
  inventory: "Inventory Management",
  equipment: "Equipment Management",
  attendance: "Staff Attendance",
  staff: "Staff Management",
  expenses: "Expense & Profit",
  branches: "Multi-Branch Management",
  reports: "Reports & Analytics",
  roles: "Roles & Permissions",
  notifications: "Notifications & Upcoming Schedule",
  auditlogs: "Audit Logs & Activity",
  settings: "Studio Settings",
};

const defaultProfile = {
  name: "Admin",
  role: "Administrator",
  email: "admin@studiorawpicturez.com",
};

/* ==========================================
   HELPERS
========================================== */

function readSetting(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function readProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        let name = parsed.name || defaultProfile.name;
        if (name === "Prathiksha (Admin)" || name === "Prathiksha") name = "Admin";
        return {
          ...defaultProfile,
          name,
          email: parsed.email || defaultProfile.email,
          role: parsed.role || defaultProfile.role,
        };
      }
    }
  } catch {
    // Use default profile
  }

  return { ...defaultProfile };
}

function getInitials(name) {
  return String(name || "Admin")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/* ==========================================
   ADMIN AVATAR
========================================== */

function AdminAvatar({
  name,
  className = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#10264d] to-[#315b99] text-xs font-extrabold text-white ${className}`}
    >
      {!imageFailed ? (
        <img
          src={ADMIN_IMAGE}
          alt={`${name || "Admin"} profile`}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

/* ==========================================
   BUTTON CLICK SOUND
========================================== */

function useBeautifulSound() {
  const [soundEnabled, setSoundEnabled] = useState(
    () => readSetting(SOUND_KEY, "true") !== "false"
  );

  const audioRef = useRef(null);

  useEffect(() => {
    const syncSound = () => {
      setSoundEnabled(
        readSetting(SOUND_KEY, "true") !== "false"
      );
    };

    window.addEventListener("storage", syncSound);
    window.addEventListener(
      "studioraw-sound-change",
      syncSound
    );

    return () => {
      window.removeEventListener("storage", syncSound);
      window.removeEventListener(
        "studioraw-sound-change",
        syncSound
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.close?.();
    };
  }, []);

  const playSound = (type = "click") => {
    if (!soundEnabled) return;
    if (readSetting(SOUND_KEY, "true") === "false") return;

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioContextClass();
      }

      const context = audioRef.current;

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      const sounds = {
        click: [659.25],
        profile: [587.33, 783.99],
        notification: [783.99, 987.77],
        save: [523.25, 659.25, 783.99],
        logout: [659.25, 523.25, 392],
        close: [587.33, 493.88],
      };

      const notes = sounds[type] || sounds.click;

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        const start =
          context.currentTime + index * 0.075;

        const end = start + 0.19;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
          frequency,
          start
        );

        gain.gain.setValueAtTime(0.0001, start);

        gain.gain.exponentialRampToValueAtTime(
          0.035,
          start + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          end
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(end + 0.01);
      });
    } catch {
      // Audio unavailable
    }
  };

  return playSound;
}

/* ==========================================
   SHARED MODAL STYLES
========================================== */

const modalInputClass =
  "flex min-w-0 items-center gap-3 rounded-2xl border border-[#dce5f2] bg-[#f8fbff] px-4 transition-all duration-300 focus-within:border-[#173d77] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(36,77,139,0.09)]";

const modalTextClass =
  "w-full min-w-0 bg-transparent py-3.5 text-sm font-semibold text-[#10264d] outline-none placeholder:text-[#61758f]";

function useModalEscape(onClose) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCloseRef.current?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);
}

/* ==========================================
   EDIT ADMIN PROFILE MODAL
========================================== */

function EditProfileModal({
  profile,
  onClose,
  onSave,
  playSound,
}) {
  const [form, setForm] = useState({
    name: profile.name || "",
    email: profile.email || "",
    password: "",
    reenterPassword: "",
  });

  const [visible, setVisible] = useState({
    password: false,
    reenterPassword: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useModalEscape(onClose);

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const toggleVisibility = (key) => {
    playSound("click");

    setVisible((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const name = form.name.trim();
    const email = form.email.trim();

    if (!name) {
      setError("Please enter the admin name.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    const wantsPasswordChange =
      Boolean(form.password) ||
      Boolean(form.reenterPassword);

    if (wantsPasswordChange) {
      if (form.password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (form.password !== form.reenterPassword) {
        setError(
          "New Password and Re-enter Password do not match."
        );
        return;
      }

      setError(
        "For security, change your password using Forgot Password from the profile menu. You must verify your current password."
      );
      return;
    }

    setSaving(true);

    try {
      const result = await onSave({
        name,
        email,
        role: profile.role,
      });

      if (result) {
        playSound("save");
        setSuccess(true);

        setForm((previous) => ({
          ...previous,
          password: "",
          reenterPassword: "",
        }));
      } else {
        setError("Unable to save profile changes.");
      }
    } catch {
      setError("Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#06152b]/65 backdrop-blur-[6px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="sr-premium-modal relative flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-[#dce5f2] bg-white text-[#10264d] shadow-[0_30px_90px_rgba(5,20,45,0.25)]"
      >
        {/* MODAL HEADER */}

        <div className="relative shrink-0 overflow-hidden bg-[#10264d] px-5 py-5 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <UserCircle size={26} />
              </div>

              <div className="min-w-0">
                <h2
                  id="edit-profile-title"
                  className="text-lg font-extrabold text-white sm:text-xl"
                >
                  Edit Admin Profile
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Manage your administrator details
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("close");
                onClose();
              }}
              aria-label="Close edit profile"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#e1e8f3] bg-[#f5f8fd] p-4">
            <AdminAvatar
              name={profile.name}
              className="h-12 w-12 rounded-2xl border border-[#dce5f2]"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#10264d]">
                {profile.name}
              </p>

              <p className="mt-1 text-xs font-semibold text-[#526581]">
                {profile.role}
              </p>
            </div>
          </div>

          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* ADMIN NAME */}

            <div>
              <label
                htmlFor="admin-edit-name"
                className="mb-2 block text-sm font-bold text-[#10264d]"
              >
                Admin Name
              </label>

              <div className={modalInputClass}>
                <User
                  size={18}
                  className="shrink-0 text-[#244d8b]"
                />

                <input
                  id="admin-edit-name"
                  type="text"
                  required
                  maxLength={80}
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter admin name"
                  className={modalTextClass}
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="admin-edit-email"
                className="mb-2 block text-sm font-bold text-[#10264d]"
              >
                Email Address
              </label>

              <div className={modalInputClass}>
                <Mail
                  size={18}
                  className="shrink-0 text-[#244d8b]"
                />

                <input
                  id="admin-edit-email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                  className={modalTextClass}
                />
              </div>
            </div>

            {/* NEW PASSWORD */}

            <div>
              <label
                htmlFor="admin-edit-password"
                className="mb-2 block text-sm font-bold text-[#10264d]"
              >
                New Password
              </label>

              <div className={modalInputClass}>
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-[#244d8b]"
                />

                <input
                  id="admin-edit-password"
                  type={
                    visible.password
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) =>
                    updateForm(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Enter new password"
                  className={modalTextClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    toggleVisibility("password")
                  }
                  aria-label={
                    visible.password
                      ? "Hide password"
                      : "Show password"
                  }
                  className="shrink-0 text-[#244d8b] transition hover:text-[#10264d]"
                >
                  {visible.password ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* RE-ENTER PASSWORD */}

            <div>
              <label
                htmlFor="admin-edit-confirm"
                className="mb-2 block text-sm font-bold text-[#10264d]"
              >
                Re-enter Password
              </label>

              <div className={modalInputClass}>
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-[#244d8b]"
                />

                <input
                  id="admin-edit-confirm"
                  type={
                    visible.reenterPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={form.reenterPassword}
                  onChange={(event) =>
                    updateForm(
                      "reenterPassword",
                      event.target.value
                    )
                  }
                  placeholder="Re-enter new password"
                  className={modalTextClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    toggleVisibility(
                      "reenterPassword"
                    )
                  }
                  aria-label={
                    visible.reenterPassword
                      ? "Hide re-entered password"
                      : "Show re-entered password"
                  }
                  className="shrink-0 text-[#244d8b] transition hover:text-[#10264d]"
                >
                  {visible.reenterPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs font-medium text-[#526581]">
                Leave password fields empty to update
                only your name and email.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-[#10264d]"
              >
                <CheckCircle2 size={18} />
                Profile saved successfully.
              </div>
            )}
          </form>
        </div>

        {/* MODAL FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e3eaf4] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={() => {
              playSound("close");
              onClose();
            }}
            className="rounded-xl border border-[#dce5f2] bg-white px-5 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#eef4fc]"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="edit-profile-form"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#244d8b] disabled:opacity-60"
          >
            <CheckCircle2 size={17} />

            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* ==========================================
   RESET PASSWORD MODAL
========================================== */

function ResetPasswordModal({
  onClose,
  playSound,
  onResetPassword,
}) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useModalEscape(onClose);

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const toggleVisibility = (key) => {
    playSound("click");

    setVisible((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const passwordFields = [
    {
      key: "currentPassword",
      label: "Current Password",
      placeholder: "Enter current password",
      autoComplete: "current-password",
    },
    {
      key: "newPassword",
      label: "New Password",
      placeholder: "Enter new password",
      autoComplete: "new-password",
    },
    {
      key: "confirmPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter new password",
      autoComplete: "new-password",
    },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      setError(
        "Please fill in all password fields."
      );
      return;
    }

    if (form.newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (
      form.currentPassword ===
      form.newPassword
    ) {
      setError(
        "New password must be different from current password."
      );
      return;
    }

    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (
      typeof onResetPassword !== "function"
    ) {
      setError(
        "Password reset is not connected to authentication yet."
      );
      return;
    }

    setSaving(true);

    try {
      const result = await onResetPassword({
        currentPassword:
          form.currentPassword,
        newPassword: form.newPassword,
      });

      if (
        result === true ||
        result?.success === true
      ) {
        playSound("save");

        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setSuccess(true);
      } else {
        setError(
          result?.message ||
            "Unable to reset password. Please check your current password."
        );
      }
    } catch {
      setError(
        "Password reset failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-[#06152b]/65 backdrop-blur-[6px]"
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        className="sr-premium-modal relative flex max-h-[95dvh] w-full max-w-lg flex-col overflow-hidden rounded-[26px] border border-[#dce5f2] bg-white text-[#10264d] shadow-[0_30px_90px_rgba(5,20,45,0.25)]"
      >
        {/* HEADER */}

        <div className="relative shrink-0 overflow-hidden bg-[#10264d] px-5 py-6 text-white sm:px-7">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                <KeyRound size={25} />
              </div>

              <div>
                <h2
                  id="reset-password-title"
                  className="text-lg font-extrabold text-white sm:text-xl"
                >
                  Forgot Password
                </h2>

                <p className="mt-1 text-xs text-blue-100">
                  Update your admin account password
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound("close");
                onClose();
              }}
              aria-label="Close reset password"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* CONTENT */}

        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-[#dce8f8] bg-[#f5f8fd] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6eef9] text-[#244d8b]">
              <ShieldCheck size={21} />
            </div>

            <div>
              <p className="text-sm font-extrabold text-[#10264d]">
                Account Security
              </p>

              <p className="mt-1 text-xs leading-5 text-[#526581]">
                Choose a strong password with at
                least 8 characters. Your current
                password must be verified by your
                authentication system.
              </p>
            </div>
          </div>

          <form
            id="reset-password-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {passwordFields.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="mb-2 block text-sm font-bold text-[#10264d]"
                >
                  {field.label}
                </label>

                <div className={modalInputClass}>
                  <LockKeyhole
                    size={18}
                    className="shrink-0 text-[#244d8b]"
                  />

                  <input
                    id={field.key}
                    type={
                      visible[field.key]
                        ? "text"
                        : "password"
                    }
                    autoComplete={
                      field.autoComplete
                    }
                    value={form[field.key]}
                    onChange={(event) =>
                      updateForm(
                        field.key,
                        event.target.value
                      )
                    }
                    placeholder={
                      field.placeholder
                    }
                    required
                    className={modalTextClass}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      toggleVisibility(field.key)
                    }
                    aria-label={
                      visible[field.key]
                        ? `Hide ${field.label}`
                        : `Show ${field.label}`
                    }
                    className="shrink-0 text-[#244d8b] transition hover:text-[#10264d]"
                  >
                    {visible[field.key] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  Password updated successfully.
                </span>
              </div>
            )}
          </form>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[#e3eaf4] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
          <button
            type="button"
            onClick={() => {
              playSound("close");
              onClose();
            }}
            className="rounded-xl border border-[#dce5f2] bg-white px-5 py-3 text-sm font-bold text-[#10264d] transition hover:bg-[#f0f4fa]"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="reset-password-form"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10264d] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#244d8b] disabled:opacity-60"
          >
            <KeyRound size={17} />

            {saving
              ? "Updating..."
              : "Reset Password"}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

/* ==========================================
   MAIN HEADER
========================================== */

export default function Header({
  activePage = "dashboard",
  setSidebarOpen,
  onMenuClick,
  onLogout,
  onNavigate,
  onResetPassword,
}) {
  const playSound = useBeautifulSound();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [notifications, setNotifications] = useState(() => getGeneratedNotifications());
  const [unreadCount, setUnreadCount] = useState(() => getUnreadNotificationCount());

  const title =
    pageTitles[activePage] || "Dashboard";

  useEffect(() => {
    const syncNotifs = () => {
      setNotifications(getGeneratedNotifications());
      setUnreadCount(getUnreadNotificationCount());
    };
    syncNotifs();
    window.addEventListener("storage", syncNotifs);
    window.addEventListener(UPDATE_EVENT, syncNotifs);
    return () => {
      window.removeEventListener("storage", syncNotifs);
      window.removeEventListener(UPDATE_EVENT, syncNotifs);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setNotifOpen(false);
  }, [activePage]);

  const openSidebar = () => {
    playSound("click");
    setNotifOpen(false);

    if (
      typeof onMenuClick === "function"
    ) {
      onMenuClick();
    } else {
      setSidebarOpen?.(true);
    }
  };

  const navigateTo = (page) => {
    playSound(
      page === "notifications"
        ? "notification"
        : "click"
    );

    setNotifOpen(false);
    onNavigate?.(page);
  };

  const handleNotifClick = (notif) => {
    playSound("notification");
    markNotificationAsRead(notif.id);
    setNotifOpen(false);
    if (notif.targetModule) {
      navigateTo(notif.targetModule);
    }
  };

  const handleMarkAllRead = () => {
    playSound("click");
    markAllNotificationsAsRead();
    setNotifications(getGeneratedNotifications());
    setUnreadCount(0);
  };

  return (
    <>
      {/* ANIMATIONS */}

      <style>{`
        @keyframes srHeaderEnter {
          from {
            opacity: 0;
            transform: translateY(-14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes srTitleEnter {
          from {
            opacity: 0;
            transform: translateY(9px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes srDropdownEnter {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes srBellRing {
          0%, 100% {
            transform: rotate(0deg);
          }
          15% {
            transform: rotate(12deg);
          }
          30% {
            transform: rotate(-10deg);
          }
          45% {
            transform: rotate(7deg);
          }
          60% {
            transform: rotate(-4deg);
          }
        }

        @keyframes srPulse {
          0%, 100% {
            box-shadow:
              0 0 0 0 rgba(49,91,153,0.25);
          }
          50% {
            box-shadow:
              0 0 0 5px rgba(49,91,153,0);
          }
        }

        @keyframes srShimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        .sr-premium-header {
          animation:
            srHeaderEnter 0.55s ease-out both;
        }

        .sr-premium-title {
          animation:
            srTitleEnter 0.45s ease-out both;
        }

        .sr-premium-dropdown {
          animation:
            srDropdownEnter 0.25s ease-out both;
        }

        .sr-premium-modal {
          animation:
            srDropdownEnter 0.35s
            cubic-bezier(0.22,1,0.36,1) both;
        }

        .sr-premium-control {
          transition:
            transform 0.25s ease,
            background-color 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .sr-premium-control:hover {
          transform: translateY(-2px);
          box-shadow:
            0 7px 18px rgba(16,38,77,0.09);
        }

        .sr-premium-control:active {
          transform: scale(0.95);
        }

        .sr-premium-bell:hover svg {
          animation:
            srBellRing 0.65s ease-in-out;
          transform-origin: top center;
        }

        .sr-premium-dot {
          animation: srPulse 2.5s infinite;
        }

        .sr-header-shimmer {
          animation:
            srShimmer 5s linear infinite;
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .sr-premium-header,
          .sr-premium-title,
          .sr-premium-dropdown,
          .sr-premium-modal,
          .sr-premium-dot,
          .sr-header-shimmer {
            animation: none !important;
          }

          .sr-premium-control {
            transition: none !important;
          }
        }
      `}</style>

      {/* HEADER */}

      <header className="sr-premium-header sticky top-0 z-30 w-full min-w-0 border-b border-[#e2e9f3] bg-white/95 text-[#10264d] shadow-[0_4px_25px_rgba(16,38,77,0.055)] backdrop-blur-xl">
        {/* TOP LINE */}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-[#e8f0fc]">
          <div className="sr-header-shimmer h-full w-1/2 bg-gradient-to-r from-transparent via-[#244d8b] to-transparent" />
        </div>

        {/* HEADER CONTENT */}

        <div className="flex h-[70px] w-full min-w-0 items-center justify-between gap-2 px-3 sm:h-[78px] sm:px-5 lg:h-[84px] lg:px-7 xl:px-9">
          {/* LEFT */}

          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label="Open sidebar"
              className="sr-premium-control flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dce5f2] bg-white text-[#10264d] lg:hidden"
            >
              <Menu size={21} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-1 hidden items-center gap-1.5 text-[10px] font-semibold tracking-[0.04em] text-[#526581] sm:flex">
                <Camera size={12} />
                <span>Studio Management</span>
                <ChevronRight size={12} />
                <span>Workspace</span>
              </div>

              <h1
                key={activePage}
                className="sr-premium-title truncate text-sm font-extrabold tracking-[-0.035em] text-[#10264d] min-[390px]:text-base sm:text-xl lg:text-2xl xl:text-[26px]"
              >
                {title}
              </h1>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* NOTIFICATIONS */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  playSound("notification");
                  setNotifOpen((previous) => !previous);
                }}
                aria-label="Open notifications"
                aria-expanded={notifOpen}
                title="Notifications"
                className={`sr-premium-control sr-premium-bell relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 sm:h-11 sm:w-11 ${
                  notifOpen
                    ? "border-[#244d8b] bg-[#eef5ff] text-[#244d8b] shadow-[0_0_0_3px_rgba(36,77,139,0.08)]"
                    : "border-[#dce5f2] bg-[#f8fbff] text-[#10264d] hover:bg-[#edf4fc]"
                }`}
              >
                <Bell size={19} />

                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#244d8b] px-1 text-[9px] font-black text-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-400 px-1 text-[9px] font-black text-white shadow-sm">
                    0
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN PANEL */}
              {notifOpen && (
                <div
                  role="dialog"
                  aria-label="Notifications panel"
                  className="sr-premium-dropdown absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-24px)] overflow-hidden rounded-[22px] border border-[#dce5f2] bg-white shadow-[0_22px_60px_rgba(16,38,77,0.18)] sm:w-96"
                >
                  {/* PANEL HEADER */}
                  <div className="flex items-center justify-between border-b border-[#e5effb] bg-gradient-to-r from-[#f0f6ff] to-[#f8fbff] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#10264d]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="rounded-full bg-[#244d8b] px-2 py-0.5 text-[10px] font-bold text-white">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-[#2d64a6] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* NOTIFICATION LIST */}
                  <div className="max-h-[380px] divide-y divide-[#edf3fa] overflow-y-auto bg-white">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf5ff] text-[#2d64a6]">
                          <Bell size={22} />
                        </div>
                        <p className="text-sm font-extrabold text-[#10264d]">No notifications yet</p>
                        <p className="mt-1 text-xs text-[#7188a8]">
                          No upcoming bookings or delivery reminders.
                        </p>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isBooking = n.module === "bookings";
                        const urgencyBadgeStyles = {
                          overdue: "bg-rose-50 text-rose-700 border-rose-200",
                          today: "bg-amber-50 text-amber-800 border-amber-200",
                          upcoming: "bg-blue-50 text-blue-700 border-blue-200",
                          completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                        };

                        return (
                          <div
                            key={n.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleNotifClick(n)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleNotifClick(n);
                              }
                            }}
                            className={`group flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-[#f5f9ff] ${
                              !n.isRead ? "bg-[#fcfdff]" : "bg-white opacity-80"
                            }`}
                          >
                            {/* ICON */}
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                isBooking
                                  ? "bg-blue-100 text-[#1f508d]"
                                  : n.urgency === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isBooking ? (
                                <CalendarDays size={17} />
                              ) : n.urgency === "completed" ? (
                                <CheckCircle2 size={17} />
                              ) : (
                                <Truck size={17} />
                              )}
                            </div>

                            {/* CONTENT */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6c86a6]">
                                  {isBooking ? "Booking" : "Delivery"}
                                </span>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                                    urgencyBadgeStyles[n.urgency] || urgencyBadgeStyles.upcoming
                                  }`}
                                >
                                  {n.urgencyLabel}
                                </span>
                              </div>

                              <p className="mt-1 truncate text-xs font-black text-[#10264d]">
                                {n.customer}
                              </p>
                              <p className="text-[11px] font-semibold text-[#486383]">
                                {n.event}
                              </p>

                              <p className="mt-1 text-[11px] text-[#7188a8]">
                                {n.dateFormatted} {n.timeFormatted ? `· ${n.timeFormatted}` : ""}
                                {n.staff ? ` · Staff: ${n.staff}` : ""}
                              </p>
                            </div>

                            {/* UNREAD DOT */}
                            {!n.isRead && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#244d8b]" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* PANEL FOOTER */}
                  <div className="border-t border-[#e5effb] bg-[#f8fbff] p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigateTo("notifications");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244d8b] hover:underline"
                    >
                      View All Notifications & Schedule
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DIVIDER */}
            <div className="mx-0.5 hidden h-8 w-px bg-[#e1e8f2] sm:block" />

            {/* STUDIO RAW PICTUREZ LOGO */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11"
              title="Studio Raw Picturez"
            >
              <img
                src={studioLogo}
                alt="Studio Raw Picturez"
                className="h-full w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
