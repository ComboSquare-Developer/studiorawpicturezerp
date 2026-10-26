
import { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  UsersRound,
  ChartNoAxesCombined,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

/* ==========================================
   RESPONSIVE STUDIO LOGO
========================================== */

const LOGO_PATHS = [
  "/favicon.png",
  "/assets/favicon.png",
];

function StudioLogo({ size = "desktop" }) {
  const [logoIndex, setLogoIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const sizeClass =
    size === "mobile"
      ? "h-14 w-14 sm:h-16 sm:w-16"
      : "h-12 w-12 xl:h-14 xl:w-14";

  if (failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-[#e9d5b0] font-black text-[#102b53] ${sizeClass}`}
        aria-label="Studio Raw Picturez"
      >
        SR
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden ${sizeClass}`}
    >
      <img
        src={LOGO_PATHS[logoIndex]}
        alt="Studio Raw Picturez Logo"
        onError={() => {
          if (logoIndex < LOGO_PATHS.length - 1) {
            setLogoIndex((previous) => previous + 1);
          } else {
            setFailed(true);
          }
        }}
        className="block h-full w-full object-contain"
      />
    </div>
  );
}

/* ==========================================
   FEATURES
========================================== */

const features = [
  { icon: CalendarDays, title: "Bookings" },
  { icon: UsersRound, title: "Clients & Team" },
  { icon: ChartNoAxesCombined, title: "Analytics" },
];

/* ==========================================
   LOGIN PAGE
========================================== */

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");

    if (typeof onLogin === "function") {
      onLogin();
    }
  };

  return (
    <div
      className="h-[100dvh] w-full overflow-hidden bg-[#f6f8fc] font-sans text-[#142b4d]"
      style={{ colorScheme: "light" }}
    >
      <div className="flex h-full w-full">

        {/* ==========================================
            LEFT BRAND SECTION
        ========================================== */}

        <section className="relative hidden h-full w-[52%] flex-col justify-between overflow-hidden bg-[#0b1f3a] px-9 py-6 text-white lg:flex xl:px-14 xl:py-8 2xl:px-16">

          {/* BRAND HEADER */}

          <div className="relative z-10 flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-3">

              <StudioLogo size="desktop" />

              <div>
                <h1 className="text-sm font-bold tracking-[0.12em] xl:text-base">
                  STUDIO RAW PICTUREZ
                </h1>

                <p className="mt-1 text-[9px] font-medium tracking-[0.25em] text-[#d5bb8e]">
                  ERP &amp; CRM
                </p>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}

          <div className="relative z-10 my-auto max-w-[620px] py-3">

            {/* WORKSPACE BADGE */}

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d5bb8e]/25 bg-[#d5bb8e]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#e6d0a8]">
              <Sparkles size={13} />
              Your Vision, Our Creation
            </div>

            {/* MAIN HEADING */}

            <h2 className="text-[clamp(32px,3.2vw,54px)] font-semibold leading-[1.13] tracking-[-0.045em]">
              Beyond the Lens
              <br />
              Create Beautiful Moments.
              <br />
              <span className="bg-gradient-to-r from-[#e9d5b0] via-[#d4b783] to-[#f0dfbf] bg-clip-text text-transparent">
                Manage Everything Seamlessly.
              </span>
            </h2>

            {/* DESCRIPTION */}

            <p className="mt-4 max-w-[470px] text-[13px] leading-[1.8] text-[#b7c4d7] xl:text-sm">
              One creative space. Endless possibilities.
              Simplify your workflow, stay organized,
              and focus on what you do best.
            </p>

            {/* FEATURE CARDS */}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {features.map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="group rounded-xl border border-white/[0.09] bg-white/[0.045] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#d5bb8e]/30 hover:bg-white/[0.08] xl:p-4"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.07] text-[#e6d0a8]">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>

                  <p className="text-xs font-semibold text-white">
                    {title}
                  </p>
                </div>
              ))}
            </div>

            {/* BENEFITS */}

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {[
                "Unified Operations",
                "Simplified Workflow",
                "Business Control",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[11px] text-[#a9bbd2]"
                >
                  <CheckCircle2
                    size={14}
                    className="text-[#d5bb8e]"
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* LEFT FOOTER */}

          <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] pt-4 text-1xl text-[#8396b0]">
            <p>© 2026 Studio Raw Picturez</p>
          </div>
        </section>

        {/* ==========================================
            RIGHT LOGIN SECTION
        ========================================== */}

        <section className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f6f8fc] px-4 py-3 sm:px-8 lg:w-[48%] lg:px-7 xl:px-12">

          {/* BACKGROUND */}

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#e7edf7] blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#edf0f7] blur-[80px]" />
          </div>

          <div className="relative z-10 w-full max-w-[450px]">

            {/* MOBILE LOGO */}

            <div className="mb-5 flex items-center justify-center gap-3 lg:hidden">

              <StudioLogo size="mobile" />

              <div className="min-w-0">
                <p className="text-sm font-bold tracking-[0.07em] text-[#102b53] sm:text-base">
                  STUDIO RAW PICTUREZ
                </p>

                <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#b19464]">
                  ERP &amp; CRM
                </p>
              </div>
            </div>

            {/* WHITE LOGIN CARD */}

            <div
              className="rounded-[24px] border border-[#e7ebf2] !bg-white p-6 text-[#102b53] shadow-[0_20px_60px_rgba(16,43,83,0.08)] sm:p-8 lg:p-9"
              style={{
                backgroundColor: "#ffffff",
                colorScheme: "light",
              }}
            >

              {/* LOGIN HEADING */}

              <div className="mb-6">

                <div className="mb-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 rounded-full border border-[#e7ebf2] bg-[#f8fafc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#65748a]">
                    <ShieldCheck size={13} />
                    Workspace
                  </div>
                </div>

                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b19464]">
                  Studio Management Portal
                </p>

                <h2 className="text-[28px] font-bold tracking-[-0.035em] text-[#102b53] sm:text-[34px]">
                  Welcome back
                </h2>

                <p className="mt-2 text-[13px] leading-relaxed text-[#8793a6]">
                  Sign in to continue to your studio workspace.
                </p>
              </div>

              {/* LOGIN FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-[12px] font-semibold text-[#34445f]"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8ba]"
                    />

                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="name@studio.com"
                      autoComplete="username"
                      required
                      className="w-full rounded-xl border border-[#dfe6ef] !bg-[#fbfcfe] py-3.5 pl-11 pr-4 text-sm !text-[#102b53] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#7c9cc9] focus:!bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label
                    htmlFor="login-password"
                    className="mb-2 block text-[12px] font-semibold text-[#34445f]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8ba]"
                    />

                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#dfe6ef] !bg-[#fbfcfe] py-3.5 pl-11 pr-11 text-sm !text-[#102b53] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#7c9cc9] focus:!bg-white focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa8ba] transition hover:text-[#102b53]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600"
                  >
                    {error}
                  </p>
                )}

                {/* SIGN IN */}

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102b53] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,43,83,0.14)] transition-all duration-300 hover:bg-[#1b4380] hover:shadow-[0_12px_25px_rgba(16,43,83,0.2)]"
                >
                  Sign In to Dashboard

                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </form>
            </div>

            {/* FOOTER */}

            <p className="mt-5 text-center text-1xl text-black">
              © 2026 Studio Raw Picturez. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
