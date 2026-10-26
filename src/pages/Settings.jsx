
import { useEffect, useRef, useState } from "react";
import {
  Settings as SettingsIcon,
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
  Sparkles,
  Aperture,
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
   DESIGN STYLES
========================================== */

const inputClass =
  "block w-full min-w-0 rounded-xl border border-[#cbd8ea] bg-white px-3.5 py-3 text-[13px] font-bold text-[#10264d] outline-none transition-all duration-300 placeholder:text-[#526581] hover:border-[#8cadd3] focus:border-[#10264d] focus:ring-4 focus:ring-[#e2edfb]";

const PAGE_CSS = `
  .sr-settings {
    color-scheme: light;
    isolation: isolate;
    color: #10264d;
    min-height: 100%;
    overflow-x: hidden;
    overflow-y: visible;
  }

  .sr-settings input,
  .sr-settings textarea {
    color-scheme: light !important;
    color: #10264d !important;
    -webkit-text-fill-color: #10264d;
    caret-color: #10264d;
  }

  .sr-settings input::placeholder,
  .sr-settings textarea::placeholder {
    color: #526581 !important;
    opacity: 1;
  }

  .sr-settings label {
    color: #10264d !important;
  }

  @keyframes srEnter {
    from {
      opacity: 0;
      transform: translateY(16px) scale(.985);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes srFloat {
    0%, 100% {
      transform: translate3d(0,0,0) rotate(-8deg);
    }
    50% {
      transform: translate3d(0,-14px,12px) rotate(8deg);
    }
  }

  @keyframes srOrbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes srPulse {
    0%, 100% {
      opacity: .5;
      transform: scale(.95);
    }
    50% {
      opacity: .85;
      transform: scale(1.05);
    }
  }

  @keyframes srShine {
    from {
      transform: translateX(-150%) skewX(-22deg);
    }
    to {
      transform: translateX(350%) skewX(-22deg);
    }
  }

  .sr-enter {
    animation: srEnter .6s cubic-bezier(.22,1,.36,1) both;
  }

  .sr-float {
    animation: srFloat 7s ease-in-out infinite;
  }

  .sr-orbit {
    animation: srOrbit 22s linear infinite;
  }

  .sr-pulse {
    animation: srPulse 5s ease-in-out infinite;
  }

  .sr-glass {
    background: rgba(255,255,255,.97);
    backdrop-filter: blur(14px);
  }

  .sr-tilt {
    transform-style: preserve-3d;
    transition:
      transform .2s ease-out,
      box-shadow .3s ease;
  }

  .sr-tilt-content {
    transform: translateZ(10px);
  }

  .sr-shine {
    position: relative;
    overflow: hidden;
  }

  .sr-shine::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -40%;
    width: 35%;
    height: 200%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,.2),
      transparent
    );
    transform: translateX(-150%) skewX(-22deg);
    pointer-events: none;
  }

  .sr-shine:hover::after {
    animation: srShine .75s ease-out;
  }

  html {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    .sr-enter,
    .sr-float,
    .sr-orbit,
    .sr-pulse {
      animation: none !important;
    }

    .sr-tilt {
      transform: none !important;
    }

    html {
      scroll-behavior: auto;
    }
  }
`;

/* ==========================================
   3D TILT CARD
========================================== */

function TiltCard({ children, className = "" }) {
  const cardRef = useRef(null);

  const handleMove = (event) => {
    if (!cardRef.current) return;

    if (
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {
      return;
    }

    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const rect =
      cardRef.current.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

    const rotateY = (x - 0.5) * 4;
    const rotateX = (0.5 - y) * 4;

    cardRef.current.style.transform =
      `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const reset = () => {
    if (!cardRef.current) return;

    cardRef.current.style.transform =
      "perspective(1100px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`sr-tilt ${className}`}
    >
      {children}
    </div>
  );
}

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
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 flex items-center gap-1 text-[11px] font-extrabold text-[#10264d]">
        {label}

        {required && (
          <span className="text-rose-600">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#244d8b]"
          />
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
            Icon ? "pl-9" : ""
          }`}
        />
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
    <div className="sr-settings relative w-full min-w-0 bg-[#f4f8fe] px-3 py-4 text-[#10264d] sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <style>{PAGE_CSS}</style>

      {/* ANIMATED BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="sr-pulse absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#dceaff] opacity-60 blur-3xl" />

        <div className="sr-pulse absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#d5e6ff] opacity-50 blur-3xl" />

        <div className="sr-float absolute right-[8%] top-[14%] hidden h-24 w-24 rounded-[28px] border border-[#c8dcf5] bg-white/40 shadow-[12px_20px_35px_rgba(16,38,77,.08)] lg:block" />

        <div className="sr-float absolute bottom-[10%] left-[4%] hidden h-16 w-16 rounded-2xl border border-[#bdd6f5] bg-[#dfeeff]/60 shadow-lg lg:block" />

        <div className="sr-orbit absolute right-[18%] top-[25%] hidden h-48 w-48 rounded-full border border-dashed border-[#b6cdeb]/70 lg:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1450px]">
        {/* HEADER */}

        <div className="sr-enter mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#10264d]">
              {/* <SettingsIcon size={14} />
              Studio Administration */}
            </div>

            {/* <h1 className="mt-1 text-xl font-black tracking-tight text-[#10264d] sm:text-2xl">
              Studio Settings
            </h1> */}
          </div>

          {/* <div className="flex items-center gap-2 rounded-xl border border-[#d5e2f3] bg-white px-3 py-2 text-[11px] font-extrabold text-[#10264d] shadow-sm">
            {/* <ShieldCheck size={16} /> */}
            {/* Studio Raw Picturez ERP */} 
          {/* </div> */}
        </div>

        {/* STATUS MESSAGE */}

        {(savedMessage || error) && (
          <div
            role="status"
            className={`sr-enter mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-[#cbdcf1] bg-white text-[#10264d]"
            }`}
          >
            {error ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {error || savedMessage}
          </div>
        )}

        {/* MAIN FORM */}

        <form onSubmit={saveStudio} className="sr-enter">
          <div className="sr-glass overflow-hidden rounded-[24px] border border-[#d8e5f5] shadow-[0_14px_45px_rgba(16,38,77,.08)]">
            {/* HEADER BANNER */}

            <div className="relative overflow-hidden bg-gradient-to-r from-[#10264d] to-[#244d8b] px-5 py-5 text-white sm:px-6">
              <div className="pointer-events-none absolute -right-4 -top-12 h-36 w-36 rounded-full border-[20px] border-white/10" />

              <div className="pointer-events-none absolute right-28 top-0 h-28 w-28 rounded-full border border-white/15" />

              <div className="relative flex items-center gap-3">
                <div className="sr-float flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 shadow-lg">
                  <Aperture size={23} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-black text-white sm:text-lg">
                    Studio Information
                  </h2>

                  <p className="mt-1 text-[11px] font-semibold text-white">
                    Manage your business profile and studio details.
                  </p>
                </div>

                <Sparkles
                  size={20}
                  className="ml-auto hidden text-white sm:block"
                />
              </div>
            </div>

            {/* CONTENT */}

            <div className="grid grid-cols-1 gap-4 p-3 sm:p-5 lg:grid-cols-12 lg:gap-5">
              {/* LEFT PANEL */}

              <TiltCard className="rounded-2xl border border-[#dce5f2] bg-white p-4 shadow-sm lg:col-span-7">
                <div className="sr-tilt-content">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#e8eef7] pb-3">
                    <div className="rounded-lg bg-[#eaf1fc] p-2 text-[#10264d]">
                      <Building2 size={17} />
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#10264d] sm:text-sm">
                        Business & Contact Details
                      </h3>

                      <p className="text-[10px] font-bold text-[#10264d]">
                        Primary studio information
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    <Field
                      label="Studio Name"
                      value={studio.name}
                      onChange={(value) =>
                        updateStudio("name", value)
                      }
                      icon={Building2}
                      required
                    />

                    <Field
                      label="Email Address"
                      value={studio.email}
                      onChange={(value) =>
                        updateStudio("email", value)
                      }
                      icon={Mail}
                      type="email"
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
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Studio Address"
                        value={studio.address}
                        onChange={(value) =>
                          updateStudio("address", value)
                        }
                        icon={MapPin}
                      />
                    </div>

                    <Field
                      label="City"
                      value={studio.city}
                      onChange={(value) =>
                        updateStudio("city", value)
                      }
                      icon={MapPin}
                    />

                    <Field
                      label="State"
                      value={studio.state}
                      onChange={(value) =>
                        updateStudio("state", value)
                      }
                      icon={MapPin}
                    />
                  </div>
                </div>
              </TiltCard>

              {/* RIGHT PANEL */}

              <TiltCard className="flex flex-col rounded-2xl border border-[#dce5f2] bg-white p-4 shadow-sm lg:col-span-5">
                <div className="sr-tilt-content flex h-full flex-col">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#e8eef7] pb-3">
                    <div className="rounded-lg bg-[#eaf1fc] p-2 text-[#10264d]">
                      <FileText size={17} />
                    </div>

                    <div>
                      <h3 className="text-xs font-black text-[#10264d] sm:text-sm">
                        Business Preferences
                      </h3>

                      <p className="text-[10px] font-bold text-[#10264d]">
                        Tax and studio description
                      </p>
                    </div>
                  </div>

                  <Field
                    label="GST Number"
                    value={studio.gst}
                    onChange={(value) =>
                      updateStudio("gst", value)
                    }
                    icon={FileText}
                  />

                  <div className="mt-4 flex flex-1 flex-col">
                    <label className="mb-1.5 text-[11px] font-extrabold text-[#10264d]">
                      Studio Description
                    </label>

                    <textarea
                      rows={5}
                      value={studio.description}
                      onChange={(event) =>
                        updateStudio(
                          "description",
                          event.target.value
                        )
                      }
                      placeholder="Enter studio description"
                      className={`${inputClass} min-h-[120px] resize-y`}
                    />
                  </div>

                  {/* 3D DECORATION */}

                  <div className="relative mt-4 hidden min-h-[100px] overflow-hidden rounded-xl border border-[#dce8f8] bg-gradient-to-r from-[#eef5ff] to-white p-4 xl:block">
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="sr-float flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#10264d] text-white shadow-[6px_8px_15px_rgba(16,38,77,.2)]">
                        <Camera size={23} />
                      </div>

                      <div>
                        <p className="text-xs font-black text-[#10264d]">
                          Studio Raw Picturez
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#10264d]">
                          Creative Studio Management
                        </p>
                      </div>
                    </div>

                    <div className="sr-orbit pointer-events-none absolute -right-7 -top-12 h-32 w-32 rounded-full border-[12px] border-[#d4e4f9]" />
                  </div>
                </div>
              </TiltCard>
            </div>

            {/* FOOTER */}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1eaf6] bg-white px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#10264d]">
                <ShieldCheck size={15} />
                Settings saved locally in your browser
              </div>

              <div className="flex w-full gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={restoreSaved}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d5e2f3] bg-white px-4 py-3 text-xs font-extrabold text-[#10264d] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#eaf1fc] sm:flex-none"
                >
                  <RotateCcw size={15} />
                  Reset Changes
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="sr-shine inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10264d] px-5 py-3 text-xs font-extrabold text-white shadow-[0_5px_15px_rgba(16,38,77,.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#244d8b] hover:shadow-lg disabled:opacity-60 sm:flex-none"
                >
                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
