
import { useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CalendarDays,
  UsersRound,
  ChartNoAxesCombined,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { api, apiRequest, initializeCSRF } from "../api/client";

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

export default function Login({
  onLogin,
  onForgotPassword,
}) {
  const [email, setEmail] = useState("prathi");
  const [password, setPassword] = useState("prathi");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const [resetParams, setResetParams] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const uid = p.get("reset_uid");
      const token = p.get("reset_token");
      return uid && token ? { uid, token } : null;
    } catch {
      return null;
    }
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }

    setResettingPassword(true);
    try {
      const res = await api.auth.resetPassword({
        uidb64: resetParams.uid,
        token: resetParams.token,
        new_password: newPassword,
      });
      setResetMessage(res?.message || "Password reset successful! You can now sign in.");
      setTimeout(() => {
        setResetParams(null);
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    } catch (err) {
      setResetError(err.message || "Unable to reset password. Link may be expired.");
    } finally {
      setResettingPassword(false);
    }
  };

  /* ==========================================
     DJANGO LOGIN
  ========================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = email.trim();

    if (!username || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (loggingIn) return;

    setError("");
    setLoggingIn(true);

    try {
      await initializeCSRF();

      const result = await apiRequest("login/", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (result?.message !== "Login successful") {
        throw new Error("Unable to sign in. Please try again.");
      }

      if (typeof onLogin === "function") {
        await onLogin(result.user);
      }
    } catch (err) {
      const message = err?.message || "";

      if (
        message.includes("401") ||
        message.includes("Invalid username or password")
      ) {
        setError("Invalid username or password.");
      } else if (
        message.includes("403") ||
        message.toLowerCase().includes("csrf")
      ) {
        setError(
          "Security verification failed. Please refresh and try again."
        );
      } else if (
        message.includes("Failed to fetch") ||
        message.includes("NetworkError")
      ) {
        setError(
          "Unable to connect to the server. Please check if Django is running."
        );
      } else {
        setError(message || "Login failed. Please try again.");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  /* ==========================================
     FORGOT PASSWORD
  ========================================== */

  const openForgotPassword = () => {
    setRecoveryEmail(email);
    setRecoveryError("");
    setRecoverySuccess(false);
    setForgotOpen(true);
  };

  const backToLogin = () => {
    setForgotOpen(false);
    setRecoveryError("");
    setRecoverySuccess(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setRecoveryError("");
    setRecoverySuccess(false);

    const cleanEmail = recoveryEmail.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setRecoveryError(
        "Please enter a valid email address."
      );
      return;
    }

    if (typeof onForgotPassword !== "function") {
      setRecoveryError(
        "Password recovery email service is not connected yet."
      );
      return;
    }

    setSending(true);

    try {
      const result = await onForgotPassword({
        email: cleanEmail,
      });

      if (
        result === true ||
        result?.success === true
      ) {
        setRecoverySuccess(true);
      } else {
        setRecoveryError(
          result?.message ||
            "Unable to send the recovery link. Please try again."
        );
      }
    } catch {
      setRecoveryError(
        "Unable to send the recovery link. Please try again."
      );
    } finally {
      setSending(false);
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

              {resetParams ? (
                <>
                  {/* SET NEW PASSWORD FORM */}
                  <div className="mb-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef3fa] text-[#10264d]">
                      <LockKeyhole size={23} />
                    </div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b19464]">
                      Security Reset
                    </p>
                    <h2 className="text-[28px] font-bold tracking-[-0.035em] text-[#10264d] sm:text-[34px]">
                      Set New Password
                    </h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-[#8793a6]">
                      Choose a secure new password of at least 8 characters.
                    </p>
                  </div>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-[12px] font-semibold text-[#34445f]">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#dfe6ef] !bg-[#fbfcfe] px-4 py-3.5 text-sm !text-[#10264d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#7c9cc9] focus:!bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-semibold text-[#34445f]">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#dfe6ef] !bg-[#fbfcfe] px-4 py-3.5 text-sm !text-[#10264d] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#7c9cc9] focus:!bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    {resetError && (
                      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                        <AlertCircle size={16} />
                        {resetError}
                      </div>
                    )}

                    {resetMessage && (
                      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={16} />
                        {resetMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={resettingPassword}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10264d] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#1f487e] disabled:opacity-50"
                    >
                      {resettingPassword ? "Updating Password..." : "Save New Password"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetParams(null)}
                      className="w-full py-2 text-center text-xs font-semibold text-[#10264d] hover:underline"
                    >
                      Back to Login
                    </button>
                  </form>
                </>
              ) : !forgotOpen ? (
                <>
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

                    {/* EMAIL OR USERNAME */}

                    <div>
                      <label
                        htmlFor="login-email"
                        className="mb-2 block text-[12px] font-semibold text-[#34445f]"
                      >
                        Email Address or Username
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa8ba]"
                        />

                        <input
                          id="login-email"
                          type="text"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="Username or email (e.g. prathi or admin)"
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

                    {/* QUICK PREFILL CREDENTIALS */}
                    <div className="flex items-center justify-between rounded-xl border border-[#d6e4f7] bg-[#f0f6ff] px-3.5 py-2.5 text-xs text-[#204374]">
                      <span className="font-medium">
                        Admin Login: <strong className="font-bold text-[#102b53]">prathi</strong> / <strong className="font-bold text-[#102b53]">prathi</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("prathi");
                          setPassword("prathi");
                          if (error) setError("");
                        }}
                        className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-[#102b53] shadow-sm hover:bg-[#e4effd]"
                      >
                        Reset to prathi
                      </button>
                    </div>

                    {/* FORGOT PASSWORD BUTTON */}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={openForgotPassword}
                        className="text-xs font-semibold text-[#102b53] transition hover:text-[#1b4380] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* LOGIN ERROR */}

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
                      disabled={loggingIn}
                      className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102b53] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,43,83,0.14)] transition-all duration-300 hover:bg-[#1b4380] hover:shadow-[0_12px_25px_rgba(16,43,83,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loggingIn
                        ? "Signing In..."
                        : "Sign In to Dashboard"}

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* FORGOT PASSWORD FORM */}

                  <div className="mb-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef3fa] text-[#102b53]">
                      <LockKeyhole size={23} />
                    </div>

                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b19464]">
                      Account Recovery
                    </p>

                    <h2 className="text-[28px] font-bold tracking-[-0.035em] text-[#102b53] sm:text-[34px]">
                      Forgot Password?
                    </h2>

                    <p className="mt-2 text-[13px] leading-relaxed text-[#8793a6]">
                      Enter your registered email address
                      to receive a password reset link.
                    </p>
                  </div>

                  <form
                    onSubmit={handleForgotPassword}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="recovery-email"
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
                          id="recovery-email"
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => {
                            setRecoveryEmail(e.target.value);
                            setRecoveryError("");
                            setRecoverySuccess(false);
                          }}
                          placeholder="name@studio.com"
                          autoComplete="email"
                          required
                          className="w-full rounded-xl border border-[#dfe6ef] !bg-[#fbfcfe] py-3.5 pl-11 pr-4 text-sm !text-[#102b53] outline-none transition placeholder:text-[#9aa8ba] focus:border-[#7c9cc9] focus:!bg-white focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                    </div>

                    {/* RECOVERY ERROR */}

                    {recoveryError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs text-red-600"
                      >
                        <AlertCircle
                          size={16}
                          className="shrink-0"
                        />
                        <span>{recoveryError}</span>
                      </div>
                    )}

                    {/* RECOVERY SUCCESS */}

                    {recoverySuccess && (
                      <div
                        role="status"
                        className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 text-xs leading-relaxed text-green-700"
                      >
                        <CheckCircle2
                          size={17}
                          className="shrink-0"
                        />

                        <span>
                          If your email is registered,
                          recovery instructions will be
                          sent shortly. Check your inbox
                          and spam folder.
                        </span>
                      </div>
                    )}

                    {/* SEND RESET LINK */}

                    <button
                      type="submit"
                      disabled={sending}
                      className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#102b53] px-5 py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,43,83,0.14)] transition-all duration-300 hover:bg-[#1b4380] hover:shadow-[0_12px_25px_rgba(16,43,83,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending
                        ? "Sending..."
                        : "Send Reset Link"}

                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>

                    {/* BACK TO LOGIN */}

                    <button
                      type="button"
                      onClick={backToLogin}
                      className="flex w-full items-center justify-center gap-2 py-1 text-xs font-semibold text-[#102b53] transition hover:text-[#1b4380] hover:underline"
                    >
                      <ArrowLeft size={16} />
                      Back to Login
                    </button>
                  </form>
                </>
              )}
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
