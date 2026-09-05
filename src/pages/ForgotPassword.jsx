import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as authApi from "../api/auth";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);

    try {
      await authApi.forgetPassword({
        identifier: identifier.trim(),
        newPassword,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't reset your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F5EF] text-[#152420] lg:grid lg:grid-cols-2">
      {/* LEFT PANEL */}
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
        {/* Decorative elements */}
        <div
          className="
            pointer-events-none
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-white/[0.03]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-32
            -left-24
            h-80
            w-80
            rounded-full
            border
            border-white/5
          "
        />

        {/* Logo */}
        <div className="relative z-10">
          <img
            src="/inventory.png"
            alt="Company name"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Middle Content */}
        <div className="relative z-10 hidden max-w-md lg:block">
          <p
            className="
              mb-3
              text-xs
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#AFC6BB]
            "
          >
            Account Recovery
          </p>

          <h1
            className="
              text-4xl
              font-medium
              leading-tight
              tracking-tight
              xl:text-5xl
            "
          >
            Regain access
            <br />
            to your account.
          </h1>

          <p
            className="
              mt-5
              max-w-sm
              text-sm
              leading-6
              text-[#B9CDC4]
            "
          >
            Update your account password and securely continue managing your
            inventory and business operations.
          </p>
        </div>

        {/* Support */}
        <div
          className="
            relative
            z-10
            border-t
            border-white/20
            pt-5
            text-[13px]
            leading-6
            text-[#AFC6BB]
          "
        >
          Need help resetting your password?{" "}
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

      {/* RIGHT PANEL */}
      <div
        className="
          flex
          min-h-[calc(100vh-240px)]
          items-center
          justify-center
          px-5
          py-10
          sm:px-8
          lg:min-h-screen
          lg:px-12
        "
      >
        <div className="w-full max-w-[390px]">
          {/* Header */}
          <div className="mb-8">

            <h2
              className="
                text-[28px]
                font-semibold
                tracking-tight
                text-[#152420]
                sm:text-[30px]
              "
            >
              Forgot your password?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4C5C55]">
              Enter your registered mobile number, then choose a new password.
            </p>
          </div>

          {/* ERROR */}
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

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number */}
            <div>
              <label
                htmlFor="identifier"
                className="
                  mb-2
                  block
                  text-[13px]
                  font-medium
                  text-[#4C5C55]
                "
              >
                Mobile number
              </label>

              <input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210"
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

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="
                  mb-2
                  block
                  text-[13px]
                  font-medium
                  text-[#4C5C55]
                "
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
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
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
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
                  <PasswordIcon visible={showNewPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="
                  mb-2
                  block
                  text-[13px]
                  font-medium
                  text-[#4C5C55]
                "
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Enter password again"
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
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
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
                  <PasswordIcon visible={showConfirmPassword} />
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword &&
                newPassword !== confirmPassword && (
                  <p className="mt-2 text-xs text-[#B5502E]">
                    Passwords don't match.
                  </p>
                )}

              {confirmPassword &&
                newPassword === confirmPassword &&
                newPassword.length >= 6 && (
                  <p className="mt-2 text-xs font-medium text-[#1F4438]">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {/* RESET BUTTON */}
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
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                />
              )}

              {submitting ? "Resetting…" : "Reset password"}
            </button>
          </form>

          {/* BACK TO LOGIN */}
          <div className="mt-7">
            <Link
              to="/login"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-[#1F4438]
                transition
                hover:text-[#122E26]
              "
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>

              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable password visibility icon */
function PasswordIcon({ visible }) {
  if (visible) {
    return (
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
    );
  }

  return (
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
  );
}