
import { useState } from "react";
import {
  Camera,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Aperture,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  UsersRound,
  ChartNoAxesCombined,
  Check,
} from "lucide-react";

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

  const features = [
    {
      icon: CalendarDays,
      title: "Smart Bookings",
    },
    {
      icon: UsersRound,
      title: "Studio Operations",
    },
    {
      icon: ChartNoAxesCombined,
      title: "Business Insights",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white lg:bg-[#f5f7fb]">
      {/* LEFT PREMIUM DESKTOP SECTION */}
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#08172d] p-12 text-white lg:flex lg:w-[54%] xl:p-16 2xl:p-20">
        {/* Background Decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#17375f] via-[#0b1d38] to-[#050e1e]" />

          <div className="absolute -right-40 -top-48 h-[550px] w-[550px] rounded-full bg-blue-400/15 blur-[110px]" />

          <div className="absolute -bottom-48 -left-32 h-[550px] w-[550px] rounded-full bg-cyan-400/10 blur-[110px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="absolute right-[-160px] top-[18%] h-[420px] w-[420px] rounded-full border border-white/10" />

          <div className="absolute right-[-110px] top-[23%] h-[320px] w-[320px] rounded-full border border-white/10" />

          <div className="absolute right-[-60px] top-[28%] h-[220px] w-[220px] rounded-full border border-white/10" />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg">
              <Camera size={27} strokeWidth={1.7} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide xl:text-2xl">
                STUDIO RAW PICTUREZ
              </h1>

              <p className="mt-1 text-[10px] tracking-[0.28em] text-blue-200/70 xl:text-xs">
                ERP & CRM PLATFORM
              </p>
            </div>
          </div>

          <span className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-blue-100 xl:block">
            Studio Workspace
          </span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-[650px] py-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-4 py-2 text-xs font-medium tracking-widest text-blue-200">
            <Sparkles size={15} />
            YOUR CREATIVE BUSINESS, ORGANIZED
          </div>

          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-gradient-to-br from-white/20 to-white/5 shadow-2xl">
            <Aperture size={44} strokeWidth={1.25} />
          </div>

          <h2 className="text-[clamp(42px,4.3vw,72px)] font-bold leading-[1.12] tracking-[-0.045em]">
            Every Moment.
            <br />
            Every Detail.
            <br />
            <span className="bg-gradient-to-r from-[#a8c8ff] to-[#d8e6ff] bg-clip-text text-transparent">
              One Platform.
            </span>
          </h2>

          <p className="mt-7 max-w-[550px] text-base leading-[1.85] text-blue-100/65 xl:text-lg">
            Manage your photography studio, customers,
            bookings, production, payments and team
            through one beautifully connected workspace.
          </p>

          {/* Benefits */}
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {[
              "Organized Workflow",
              "Client Management",
              "Studio Insights",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm text-blue-100/75"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-300/15">
                  <Check size={12} className="text-blue-200" />
                </span>
                {item}
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="mt-12 grid grid-cols-3 gap-3 xl:gap-4">
            {features.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 xl:p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-blue-400/20">
                  <Icon size={20} strokeWidth={1.6} />
                </div>

                <p className="text-xs font-medium leading-relaxed text-blue-50/85 xl:text-sm">
                  {title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-blue-100/45">
          <p>
            © 2026 Studio Raw Picturez. All rights reserved.
          </p>

          <p className="hidden xl:block">
            Crafted for creative excellence.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN SECTION */}
      <div className="relative flex w-full items-center justify-center p-6 sm:p-10 lg:w-[46%] lg:px-10 xl:px-16 2xl:px-20">
        {/* Desktop Background */}
        <div className="pointer-events-none absolute right-0 top-0 hidden h-72 w-72 rounded-full bg-blue-100/50 blur-[90px] lg:block" />

        <div className="relative z-10 w-full max-w-md">
          {/* MOBILE BRAND */}
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-[#102B53] p-3 text-white">
              <Camera />
            </div>

            <span className="text-lg font-bold text-[#102B53]">
              STUDIO RAW PICTUREZ
            </span>
          </div>

          {/* Desktop Brand */}
          <div className="mb-12 hidden items-center justify-between lg:flex">
            <div className="flex items-center gap-2 text-[#102B53]">
              <Aperture size={19} strokeWidth={1.7} />

              <span className="text-xs font-bold tracking-[0.22em]">
                STUDIO RAW
              </span>
            </div>

            <span className="text-xs text-slate-400">
              SECURE WORKSPACE
            </span>
          </div>

          {/* Portal Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 lg:border lg:border-[#dce6f3] lg:bg-white lg:shadow-sm">
            <ShieldCheck size={16} />
            Studio Management Portal
          </div>

          <h2 className="text-4xl font-bold text-[#102B53] lg:text-[44px] lg:leading-tight lg:tracking-[-0.04em]">
            Welcome Back
          </h2>

          <p className="mb-10 mt-3 text-slate-500 lg:text-[15px]">
            Sign in to access your studio dashboard.
          </p>

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-slate-200 py-4 pl-12 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:rounded-2xl lg:border-[#dce3ed] lg:bg-white lg:shadow-[0_3px_12px_rgba(16,43,83,0.025)] lg:transition-all lg:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.07)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                  className="w-full rounded-xl border border-slate-200 py-4 pl-12 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:rounded-2xl lg:border-[#dce3ed] lg:bg-white lg:shadow-[0_3px_12px_rgba(16,43,83,0.025)] lg:transition-all lg:focus:shadow-[0_0_0_4px_rgba(59,130,246,0.07)]"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#102B53]"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            {/* Sign In */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#102B53] py-4 font-semibold text-white transition hover:bg-[#1B4380] lg:rounded-2xl lg:bg-gradient-to-r lg:from-[#102B53] lg:to-[#1c467e] lg:shadow-[0_12px_30px_rgba(16,43,83,0.18)] lg:duration-300 lg:hover:-translate-y-0.5 lg:hover:from-[#173b6d] lg:hover:to-[#285998] lg:hover:shadow-[0_16px_35px_rgba(16,43,83,0.25)]"
            >
              Sign In
              <ArrowRight size={19} />
            </button>
          </form>

          {/* Demo Information */}
          <p className="mt-8 text-center text-sm text-slate-400">
            Frontend demo only — any non-empty email and password
            will open the dashboard.
          </p>

          {/* Desktop Footer */}
          <div className="mt-12 hidden items-center justify-center gap-2 text-xs text-slate-400 lg:flex">
            <ShieldCheck size={14} />
            Studio Raw Picturez Management Workspace
          </div>
        </div>
      </div>
    </div>
  );
}
