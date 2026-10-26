
import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Save,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  RotateCcw,
} from "lucide-react";

/* ==========================================
   STORAGE
========================================== */

const STUDIO_KEY = "studioraw_studio_settings";
const UPDATE_EVENT = "studioraw:data-updated";

const initialStudio = {
  name: "Studio Raw Picturez",
  email: "contact@studiorawpicturez.com",
  phone: "9876543210",
  whatsapp: "9876543210",
  address: "Studio Raw Picturez, Main Road",
  city: "Nagercoil",
  state: "Tamil Nadu",
  gst: "",
  currency: "INR",
  description:
    "Professional wedding photography, cinematography, portraits, albums and creative photography services.",
};

/* ==========================================
   STORAGE HELPER
========================================== */

function readStudioSettings() {
  try {
    const saved = localStorage.getItem(STUDIO_KEY);

    if (!saved) return { ...initialStudio };

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return { ...initialStudio };
    }

    const { invoicePrefix, ...savedStudio } = parsed;

    return {
      ...initialStudio,
      ...savedStudio,
    };
  } catch {
    return { ...initialStudio };
  }
}

/* ==========================================
   STYLES
========================================== */

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#e2e8f0] bg-white px-3.5 py-3 text-[13px] font-semibold text-[#334155] outline-none transition-colors duration-200 placeholder:text-[#94a3b8] hover:border-[#cbd5e1] focus:border-[#a78bfa] focus:ring-4 focus:ring-[#f3e8ff]";

const PAGE_CSS = `
  .sr-settings {
    color-scheme: light;
    color: #334155;
    min-height: 100%;
    overflow-x: hidden;
  }

  .sr-settings input,
  .sr-settings textarea {
    color-scheme: light !important;
    color: #334155 !important;
    -webkit-text-fill-color: #334155;
    caret-color: #334155;
  }

  .sr-settings input::placeholder,
  .sr-settings textarea::placeholder {
    color: #94a3b8 !important;
    opacity: 1;
  }

  .sr-settings label {
    color: #475569;
  }
`;

/* ==========================================
   INPUT FIELD
========================================== */

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  required = false,
  maxLength,
  iconColor = "text-violet-500",
  iconBg = "bg-violet-50",
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 flex items-center gap-1 text-[12px] font-bold text-slate-600">
        {label}

        {required && (
          <span className="text-rose-500">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <div
            className={`pointer-events-none absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
          >
            <Icon size={15} />
          </div>
        )}

        <input
          type={type}
          value={value ?? ""}
          onChange={(event) =>
            onChange(event.target.value)
          }
          required={required}
          maxLength={maxLength}
          placeholder={label}
          className={`${inputClass} ${
            Icon ? "pl-12" : ""
          }`}
        />
      </div>
    </div>
  );
}

/* ==========================================
   SECTION HEADING
========================================== */

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  iconBg,
  iconColor,
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        <Icon size={20} />
      </div>

      <div>
        <h3 className="text-sm font-extrabold text-[#334155]">
          {title}
        </h3>

        <p className="mt-1 text-[11px] font-medium text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ==========================================
   MAIN SETTINGS PAGE
========================================== */

export default function Settings() {
  const [studio, setStudio] = useState(
    readStudioSettings
  );

  const [savedMessage, setSavedMessage] =
    useState("");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const toastTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const updateStudio = (key, value) => {
    setStudio((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSavedMessage("");
  };

  const showMessage = (message) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setSavedMessage(message);

    toastTimer.current = setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  };

  const saveStudio = (event) => {
    event.preventDefault();

    setError("");

    if (!studio.name.trim()) {
      setError("Studio name is required.");
      return;
    }

    if (
      studio.phone.trim() &&
      !/^\d{10}$/.test(studio.phone.trim())
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    if (
      studio.whatsapp.trim() &&
      !/^\d{10}$/.test(studio.whatsapp.trim())
    ) {
      setError(
        "Please enter a valid 10-digit WhatsApp number."
      );
      return;
    }

    setSaving(true);

    try {
      const updatedStudio =
        Object.fromEntries(
          Object.entries(studio).map(
            ([key, value]) => [
              key,
              typeof value === "string"
                ? value.trim()
                : value,
            ]
          )
        );

      localStorage.setItem(
        STUDIO_KEY,
        JSON.stringify(updatedStudio)
      );

      setStudio(updatedStudio);

      window.dispatchEvent(
        new CustomEvent(UPDATE_EVENT, {
          detail: {
            key: STUDIO_KEY,
          },
        })
      );

      showMessage(
        "Studio settings saved successfully."
      );
    } catch (saveError) {
      console.error(
        "Unable to save studio settings:",
        saveError
      );

      setError(
        "Unable to save studio settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const restoreSaved = () => {
    setStudio(readStudioSettings());
    setError("");
    setSavedMessage("");
  };

  return (
    <div className="sr-settings min-h-screen w-full min-w-0 bg-[#f8faff] px-3 py-5 sm:px-6 lg:px-8">
      <style>{PAGE_CSS}</style>

      <div className="mx-auto max-w-[1450px] space-y-5">

        {/* MINIMAL HEADER */}

        <div className="rounded-[22px] border border-[#e8eaf3] bg-white px-5 py-5 shadow-sm sm:px-7 sm:py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3e8ff] text-[#9333ea]">
              <Building2 size={23} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-[#334155] sm:text-2xl">
                Studio Settings
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Manage your studio information and business preferences.
              </p>
            </div>
          </div>
        </div>

        {/* STATUS MESSAGE */}

        {(savedMessage || error) && (
          <div
            role="status"
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error ? (
              <AlertCircle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}

            {error || savedMessage}
          </div>
        )}

        {/* MAIN FORM */}

        <form
          onSubmit={saveStudio}
          className="overflow-hidden rounded-[24px] border border-[#e8eaf3] bg-white shadow-[0_8px_35px_rgba(30,41,59,0.04)]"
        >
          {/* FORM HEADER */}

          <div className="flex items-center gap-3 border-b border-[#edf0f5] bg-white px-5 py-5 sm:px-7">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
              <Camera size={21} />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-[#334155]">
                Studio Information
              </h2>

              <p className="mt-1 text-[11px] text-slate-400">
                Update your business profile and studio details.
              </p>
            </div>
          </div>

          {/* FORM CONTENT */}

          <div className="grid grid-cols-1 gap-5 p-4 sm:p-6 lg:grid-cols-12">

            {/* LEFT PANEL */}

            <section className="rounded-[20px] border border-[#e8eaf3] bg-white p-4 sm:p-5 lg:col-span-7">
              <SectionHeading
                icon={Building2}
                title="Business & Contact Details"
                subtitle="Primary studio information"
                iconBg="bg-[#f3e8ff]"
                iconColor="text-[#9333ea]"
              />

              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field
                  label="Studio Name"
                  value={studio.name}
                  onChange={(value) =>
                    updateStudio("name", value)
                  }
                  icon={Building2}
                  required
                  iconBg="bg-violet-50"
                  iconColor="text-violet-500"
                />

                <Field
                  label="Email Address"
                  value={studio.email}
                  onChange={(value) =>
                    updateStudio("email", value)
                  }
                  icon={Mail}
                  type="email"
                  iconBg="bg-sky-50"
                  iconColor="text-sky-500"
                />

                <Field
                  label="Phone Number"
                  value={studio.phone}
                  onChange={(value) =>
                    updateStudio("phone", value)
                  }
                  icon={Phone}
                  type="tel"
                  maxLength={10}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-500"
                />

                <Field
                  label="WhatsApp Number"
                  value={studio.whatsapp}
                  onChange={(value) =>
                    updateStudio("whatsapp", value)
                  }
                  icon={Phone}
                  type="tel"
                  maxLength={10}
                  iconBg="bg-teal-50"
                  iconColor="text-teal-500"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Studio Address"
                    value={studio.address}
                    onChange={(value) =>
                      updateStudio("address", value)
                    }
                    icon={MapPin}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                  />
                </div>

                <Field
                  label="City"
                  value={studio.city}
                  onChange={(value) =>
                    updateStudio("city", value)
                  }
                  icon={MapPin}
                  iconBg="bg-pink-50"
                  iconColor="text-pink-500"
                />

                <Field
                  label="State"
                  value={studio.state}
                  onChange={(value) =>
                    updateStudio("state", value)
                  }
                  icon={MapPin}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-500"
                />
              </div>
            </section>

            {/* RIGHT PANEL */}

            <section className="flex flex-col rounded-[20px] border border-[#e8eaf3] bg-white p-4 sm:p-5 lg:col-span-5">
              <SectionHeading
                icon={FileText}
                title="Business Preferences"
                subtitle="Tax and studio description"
                iconBg="bg-[#fff1e6]"
                iconColor="text-[#ea580c]"
              />

              <Field
                label="GST Number"
                value={studio.gst}
                onChange={(value) =>
                  updateStudio("gst", value)
                }
                icon={FileText}
                iconBg="bg-orange-50"
                iconColor="text-orange-500"
              />

              <div className="mt-5 flex flex-1 flex-col">
                <label className="mb-2 text-[12px] font-bold text-slate-600">
                  Studio Description
                </label>

                <textarea
                  rows={6}
                  value={studio.description}
                  onChange={(event) =>
                    updateStudio(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Enter studio description"
                  className={`${inputClass} min-h-[145px] resize-y`}
                />
              </div>

              {/* STUDIO INFO */}

              <div className="mt-5 rounded-2xl border border-[#e9e5fb] bg-[#faf7ff] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ede9fe] text-[#8b5cf6]">
                    <Camera size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-[#475569]">
                      Studio Raw Picturez
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Creative Studio Management
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col gap-4 border-t border-[#edf0f5] bg-[#fcfdff] px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
              <ShieldCheck
                size={16}
                className="text-emerald-500"
              />
              Settings saved locally in your browser
            </div>

            <div className="flex w-full gap-3 sm:w-auto">
              <button
                type="button"
                onClick={restoreSaved}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
              >
                <RotateCcw size={15} />
                Reset Changes
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#7c3aed] disabled:opacity-60 sm:flex-none"
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : "Save Settings"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
