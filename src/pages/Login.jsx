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
} from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    onLogin();
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SECTION */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#102B53] text-white flex-col justify-between p-12 xl:p-16">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
            <Camera size={25} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-wide">
              STUDIO RAW PICTUREZ
            </h1>
            <p className="text-blue-200 text-xs tracking-[3px]">
              ERP & CRM PLATFORM
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mb-8">
            <Aperture size={44} strokeWidth={1.3} />
          </div>

          <h2 className="text-5xl xl:text-6xl font-bold leading-tight">
            Every Moment.
            <br />
            Every Detail.
            <br />
            <span className="text-blue-300">One Platform.</span>
          </h2>

          <p className="text-blue-100/80 text-lg mt-7 leading-relaxed">
            Manage your studio bookings, customers, photography
            projects, production, payments and team from one
            connected workspace.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-12">
            {["Smart Bookings", "Studio Operations", "Business Insights"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-blue-100"
                >
                  <ShieldCheck size={20} className="mb-3" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        <p className="relative z-10 text-blue-200/60 text-sm">
          © 2026 Studio Raw Picturez. All rights reserved.
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="bg-[#102B53] text-white p-3 rounded-xl">
              <Camera />
            </div>
            <span className="text-[#102B53] font-bold text-lg">
              STUDIO RAW PICTUREZ
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            Studio Management Portal
          </div>

          <h2 className="text-4xl font-bold text-[#102B53]">
            Welcome Back
          </h2>

          <p className="text-slate-500 mt-3 mb-10">
            Sign in to access your studio dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#102B53] hover:bg-[#1B4380] text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-3 transition"
            >
              Sign In
              <ArrowRight size={19} />
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-8">
            Frontend demo only — any non-empty email and password
            will open the dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}