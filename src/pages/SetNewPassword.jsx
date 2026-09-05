import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SetNewPassword() {
  const { completePasswordChange, logout } = useAuth();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (newPassword.length < 6) {
      setError(
        "Your new password must be at least 6 characters."
      );
      return;
    }

    if (newPassword === "123456") {
      setError(
        "Please choose something other than the default password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);

    try {
      await completePasswordChange(
        "123456",
        newPassword
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't update your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = `
    w-full
    border-0
    border-b-[1.5px]
    border-[#D8E0D9]
    bg-transparent
    px-0.5
    py-2.5
    pr-11
    text-[15px]
    text-[#152420]
    outline-none
    transition
    placeholder:text-[#A0AAA5]
    focus:border-[#1F4438]
    focus:ring-0
  `;

  const labelClass =
    "mb-2 block text-[13px] font-medium text-[#4C5C55]";

  const passwordMatches =
    confirmPassword &&
    newPassword === confirmPassword &&
    newPassword.length >= 6 &&
    newPassword !== "123456";

  return (
    <div className="min-h-screen w-full bg-[#F7F5EF] text-[#152420] lg:grid lg:grid-cols-2">
      {/* LEFT BRAND PANEL */}
      <div
        className="
          relative
          flex
          min-h-[220px]
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
          lg:min-h-screen
          lg:px-12
          lg:py-14
        "
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/[0.03]" />

        <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full border border-white/5" />

        {/* LOGO */}
        <div className="relative z-10">
          <img
            src="/inventory.png"
            alt="Sona Medical"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* CENTER CONTENT */}
        <div className="relative z-10 hidden max-w-md lg:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#AFC6BB]">
            Account Security
          </p>

          <h1 className="text-4xl font-medium leading-tight tracking-tight xl:text-5xl">
            One last step.
            <br />
            Secure your account.
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-6 text-[#B9CDC4]">
            Create your personal password to protect
            your Sona Medical account and continue
            securely.
          </p>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 border-t border-white/20 pt-5 text-[13px] leading-6 text-[#AFC6BB]">
          Your account security matters to us.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[400px]">
          {/* STEP */}
          <p className="mb-5 inline-block border-b border-[#D8E0D9] pb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#8FAE9E]">
            Step 2 of 2
          </p>

          {/* TITLE */}
          <h2 className="text-[28px] font-semibold tracking-tight text-[#152420] sm:text-[30px]">
            Set a new password
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#4C5C55]">
            You're currently using the default
            password. Choose a new password to finish
            securing your account.
          </p>

          {/* SECURITY NOTICE */}
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-[#EFF4F1] px-4 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDE9E2] text-[#1F4438]">
              <LockIcon />
            </div>

            <p className="text-xs leading-5 text-[#52635B]">
              For better security, avoid using your
              name, mobile number or the default
              password.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mt-6 border-l-[3px] border-[#B5502E] bg-[#F3E3DC] px-4 py-3 text-sm leading-5 text-[#B5502E]"
            >
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-6"
          >
            {/* NEW PASSWORD */}
            <div>
              <label
                htmlFor="newPassword"
                className={labelClass}
              >
                New password
              </label>

              <div className="relative">
                <input
                  id="newPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#7C8B84] transition hover:bg-[#1F4438]/5 hover:text-[#1F4438]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <PasswordIcon
                    visible={showPassword}
                  />
                </button>
              </div>

              {/* PASSWORD HINT */}
              {newPassword.length > 0 &&
                newPassword.length < 6 && (
                  <p className="mt-2 text-xs text-[#B5502E]">
                    Password must contain at least 6
                    characters.
                  </p>
                )}

              {newPassword === "123456" && (
                <p className="mt-2 text-xs text-[#B5502E]">
                  You cannot continue using the
                  default password.
                </p>
              )}

              {newPassword.length >= 6 &&
                newPassword !== "123456" && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    ✓ Password length is valid
                  </p>
                )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="confirmPassword"
                className={labelClass}
              >
                Confirm new password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(
                      e.target.value
                    );

                    setError("");
                  }}
                  required
                  autoComplete="new-password"
                  placeholder="Enter password again"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#7C8B84] transition hover:bg-[#1F4438]/5 hover:text-[#1F4438]"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <PasswordIcon
                    visible={
                      showConfirmPassword
                    }
                  />
                </button>
              </div>

              {/* MATCH VALIDATION */}
              {confirmPassword &&
                newPassword !==
                  confirmPassword && (
                  <p className="mt-2 text-xs text-[#B5502E]">
                    Passwords don't match.
                  </p>
                )}

              {passwordMatches && (
                <p className="mt-2 text-xs font-medium text-emerald-600">
                  ✓ Passwords match
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#1F4438]
                px-5
                py-3.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#122E26]
                focus:outline-none
                focus:ring-2
                focus:ring-[#1F4438]/25
                focus:ring-offset-2
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {submitting
                ? "Saving password…"
                : "Save password and continue"}
            </button>
          </form>

          {/* DIVIDER */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#D8E0D9]" />

            <span className="text-xs uppercase tracking-wider text-[#9AA9A2]">
              or
            </span>

            <div className="h-px flex-1 bg-[#D8E0D9]" />
          </div>

          {/* SIGN OUT */}
          <div className="text-center">
            <button
              type="button"
              onClick={logout}
              className="text-sm font-semibold text-[#1F4438] underline decoration-[#8FAE9E] underline-offset-4 transition hover:decoration-[#1F4438]"
            >
              Sign out and return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   PASSWORD EYE ICON
------------------------------------------------------- */

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

/* -------------------------------------------------------
   LOCK ICON
------------------------------------------------------- */

function LockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="11"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />

      <path d="M12 14v3" />
    </svg>
  );
}