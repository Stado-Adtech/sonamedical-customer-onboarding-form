import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const data = await login(identifier.trim(), password);

      if (data.mustChangePassword) {
        navigate("/set-new-password");
      } else {
        navigate("/track");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We couldn't sign you in. Check your mobile number and password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // CHANGED: cooler mint-tinted clinical background instead of warm paper
    <div className="min-h-screen w-full bg-[#F4F9F7] text-[#152420] lg:grid lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div
        className="
          relative
          flex
          min-h-[240px]
          flex-col
          justify-between
          overflow-hidden
          bg-gradient-to-br
          from-[#1F4438]
          to-[#122E26]
          px-6
          py-8
          text-[#F7F5EF]
          sm:px-10
          sm:py-10
          lg:min-h-screen
          lg:px-12
          lg:py-14
        "
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/[0.03]" />

        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full border border-white/5" />

        {/* ADDED: subtle medical-cross motif for healthcare branding */}
        <svg
          className="pointer-events-none absolute right-10 bottom-16 h-24 w-24 text-white/[0.05]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z" />
        </svg>

        {/* Logo */}
        <div className="relative z-10">
          <img
            src="/inventory.png"
            alt="Company name"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Brand content */}
        <div className="relative z-10 hidden max-w-md lg:block">
          {/* CHANGED: teal-tinted eyebrow label reads more "clinical" than the plain sage tone */}
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#7FD1C5]">
            Trusted Healthcare Partner
          </p>

          <h1 className="text-4xl font-medium leading-tight tracking-tight xl:text-5xl">
            Your medicines,
            <br />
            managed with care.
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-6 text-[#B9CDC4]">
            Access your orders, prescriptions and account details from one
            secure workspace.
          </p>
        </div>

        {/* Help */}
        <div className="relative z-10 border-t border-white/20 pt-5 text-[13px] leading-6 text-[#AFC6BB]">
          Need help signing in?{" "}
          <a
            href="mailto:support@example.com"
            className="
              text-[#F7F5EF]
              underline
              decoration-white/40
              underline-offset-4
              transition
              hover:decoration-white
            "
          >
            support@example.com
          </a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex min-h-[calc(100vh-240px)] items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12">
        <div className="w-full max-w-[390px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-[28px] font-semibold tracking-tight text-[#152420] sm:text-[30px]">
              Sign in to your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4C5C55]">
              Use the mobile number registered on your account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="
                mb-6
                border-l-[3px]
                border-[#B5502E]
                bg-[#F3E3DC]
                px-4
                py-3
                text-sm
                leading-5
                text-[#B5502E]
              "
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="identifier"
                className="mb-2 block text-[13px] font-medium text-[#4C5C55]"
              >
                Username
              </label>

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210"
                required
                autoComplete="username"
                className="
                  w-full
                  border-0
                  border-b-[1.5px]
                  border-[#D8E0D9]
                  bg-transparent
                  px-0.5
                  py-2.5
                  text-[15px]
                  text-[#152420]
                  outline-none
                  transition-colors
                  placeholder:text-[#9AA9A2]
                  focus:border-[#1F4438]
                  focus:ring-0
                "
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[13px] font-medium text-[#4C5C55]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="
                    w-full
                    border-0
                    border-b-[1.5px]
                    border-[#D8E0D9]
                    bg-transparent
                    px-0.5
                    py-2.5
                    pr-10
                    text-[15px]
                    text-[#152420]
                    outline-none
                    transition-colors
                    placeholder:text-[#9AA9A2]
                    focus:border-[#1F4438]
                    focus:ring-0
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="
                    absolute
                    right-0
                    top-1/2
                    flex
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-md
                    p-2
                    text-[#7C8B84]
                    transition
                    hover:bg-[#1F4438]/5
                    hover:text-[#1F4438]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#1F4438]/30
                  "
                >
                  {showPassword ? (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3l18 18" />

                      <path d="M10.6 5.2A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a13.3 13.3 0 0 1-3.1 4" />

                      <path d="M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5-1.4" />

                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  )}
                </button>
              </div>

              {/* First login hint */}
              <div className="mt-3 border-l-2 border-dashed border-[#D8E0D9] pl-3 text-xs leading-5 text-[#6B7B73]">
                First time logging in? Your default password is{" "}
                <strong className="font-semibold text-[#152420]">
                  123456
                </strong>
                . You'll be asked to set a new one after signing in.
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitting}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                bg-[#1F4438]
                px-4
                py-3.5
                text-sm
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-[#122E26]
                focus:outline-none
                focus:ring-2
                focus:ring-[#1F4438]/30
                focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-6">
            {/* CHANGED: teal accent instead of pine, to distinguish secondary actions with a healthcare-associated color */}
            <Link
              to="/forgot-password"
              className="
                inline-block
                border-b
                border-[#D8E0D9]
                pb-0.5
                text-sm
                font-medium
                text-[#0E7C86]
                transition
                hover:border-[#0E7C86]
              "
            >
              Forgot your password?
            </Link>
          </div>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#D8E0D9]" />

            <span className="text-xs text-[#9AA9A2]">or</span>

            <div className="h-px flex-1 bg-[#D8E0D9]" />
          </div>

          {/* Signup */}
          <p className="text-sm text-[#6B7B73]">
            Don't have an account yet?{" "}
            <Link
              to="/signup"
              className="
                font-semibold
                text-[#1F4438]
                underline
                decoration-[#8FAE9E]
                underline-offset-4
                transition
                hover:decoration-[#1F4438]
              "
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
