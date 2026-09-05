import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  mobileNumber: "",
  alternateNumber: "",
  email: "",
  dateOfBirth: "",
  addressLine1: "",
  addressLine2: "",
  addressLine3: "",
  addressLine4: "",
  pinCode: "",
  city: "",
  state: "",
  country: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pinStatus, setPinStatus] = useState("idle");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update(field) {
    return (e) =>
      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
  }

  // Auto-fetch city/state/country from PIN code
  useEffect(() => {
    const pin = form.pinCode.trim();

    if (!/^\d{6}$/.test(pin)) {
      setPinStatus("idle");

      setForm((prev) =>
        prev.city || prev.state || prev.country
          ? {
              ...prev,
              city: "",
              state: "",
              country: "",
            }
          : prev
      );

      return;
    }

    let cancelled = false;

    setPinStatus("loading");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pin}`
        );

        const data = await res.json();
        const result = data?.[0];

        if (cancelled) return;

        if (
          result?.Status === "Success" &&
          result.PostOffice?.length
        ) {
          const office = result.PostOffice[0];

          setForm((prev) => ({
            ...prev,
            city: office.District || office.Name || "",
            state: office.State || "",
            country: office.Country || "India",
          }));

          setPinStatus("found");
        } else {
          setForm((prev) => ({
            ...prev,
            city: "",
            state: "",
            country: "",
          }));

          setPinStatus("notfound");
        }
      } catch {
        if (!cancelled) {
          setPinStatus("error");
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.pinCode]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!form.addressLine1.trim() || !form.addressLine4.trim()) {
      setError("Please fill in Address line 1 and Address line 4.");
      return;
    }

    if (!form.city || !form.state) {
      setError(
        "Enter a valid PIN code so we can detect your city and state."
      );
      return;
    }

    setSubmitting(true);

    try {
      const {
        confirmPassword,
        mobileNumber,
        alternateNumber,
        ...rest
      } = form;

      const payload = {
        ...rest,
        phone: mobileNumber.trim(),
        username: mobileNumber.trim(),
        ...(alternateNumber.trim()
          ? {
              alternateNumber: alternateNumber.trim(),
            }
          : {}),
      };

      await signup(payload);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't create your account. Please try again."
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
    text-[15px]
    text-[#152420]
    outline-none
    transition-colors
    placeholder:text-[#9AA9A2]
    focus:border-[#1F4438]
    focus:ring-0
  `;

  const readonlyInputClass = `
    w-full
    cursor-default
    border-0
    border-b-[1.5px]
    border-dashed
    border-[#D8E0D9]
    bg-transparent
    px-0.5
    py-2.5
    text-[15px]
    text-[#4C5C55]
    outline-none
    placeholder:text-[#A6B1AC]
    focus:ring-0
  `;

  const labelClass =
    "mb-2 block text-[13px] font-medium text-[#4C5C55]";

  return (
    // CHANGED: cooler mint-tinted clinical background to match Login
    <div className="min-h-screen w-full bg-[#F4F9F7] text-[#152420] lg:grid lg:grid-cols-[0.85fr_1.15fr]">
      {/* LEFT PANEL */}
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

        {/* ADDED: subtle medical-cross motif, matching Login */}
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

        {/* Brand Content */}
        <div className="relative z-10 hidden max-w-md lg:block">
          {/* CHANGED: teal-tinted eyebrow label, matching Login */}
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#7FD1C5]">
            New Account
          </p>

          <h1 className="text-4xl font-medium leading-tight tracking-tight xl:text-5xl">
            Join for care
            <br />
            you can rely on.
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-6 text-[#B9CDC4]">
            Create your account to manage orders, prescriptions and your
            delivery details from one place.
          </p>
        </div>

        {/* Support */}
        <div className="relative z-10 border-t border-white/20 pt-5 text-[13px] leading-6 text-[#AFC6BB]">
          Need help signing up?{" "}
          <a
            href="mailto:support@example.com"
            className="text-[#F7F5EF] underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
          >
            support@example.com
          </a>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex justify-center px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="w-full max-w-[620px]">
          {/* Header */}
          <div className="mb-8">

            <h2 className="text-[28px] font-semibold tracking-tight text-[#152420] sm:text-[30px]">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#4C5C55]">
              Fill in your details below. Your mobile number will be used
              as your username.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 border-l-[3px] border-[#B5502E] bg-[#F3E3DC] px-4 py-3 text-sm leading-5 text-[#B5502E]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className={labelClass}>
                Full name <span className="text-[#B5502E]">*</span>
              </label>

              <input
                id="fullName"
                required
                value={form.fullName}
                onChange={update("fullName")}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            {/* Mobile Numbers */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="mobileNumber" className={labelClass}>
                  Mobile / WhatsApp number{" "}
                  <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="mobileNumber"
                  type="tel"
                  required
                  value={form.mobileNumber}
                  onChange={update("mobileNumber")}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="alternateNumber" className={labelClass}>
                  Alternate number
                  <span className="ml-1 text-[#8FAE9E]">
                    (optional)
                  </span>
                </label>

                <input
                  id="alternateNumber"
                  type="tel"
                  value={form.alternateNumber}
                  onChange={update("alternateNumber")}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email + DOB */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email address <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className={labelClass}>
                  Date of birth <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={form.dateOfBirth}
                  onChange={update("dateOfBirth")}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Address heading */}
            <div className="border-t border-[#D8E0D9] pt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8FAE9E]">
                Address Information
              </p>
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pinCode" className={labelClass}>
                PIN / postal code <span className="text-[#B5502E]">*</span>
              </label>

              <div className="relative">
                <input
                  id="pinCode"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    setForm((prev) => ({
                      ...prev,
                      pinCode: value,
                    }));
                  }}
                  placeholder="e.g. 800001"
                  className={`${inputClass} pr-28`}
                />

                {pinStatus === "loading" && (
                  <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-[#6B7B73]">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8FAE9E]/40 border-t-[#1F4438]" />
                    Checking
                  </div>
                )}

                {pinStatus === "found" && (
                  // CHANGED: teal accent for the "found" confirmation, matching Login's secondary accent
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-medium text-[#0E7C86]">
                    ✓ Found
                  </div>
                )}
              </div>

              {pinStatus === "notfound" && (
                <p className="mt-2 text-xs text-[#B5502E]">
                  Couldn't find that PIN code. Please check and try again.
                </p>
              )}

              {pinStatus === "error" && (
                <p className="mt-2 text-xs text-[#B5502E]">
                  Couldn't look up that PIN code right now. Please try
                  again.
                </p>
              )}
            </div>

            {/* Address line 1 */}
            <div>
              <label htmlFor="addressLine1" className={labelClass}>
                Address line 1 <span className="text-[#B5502E]">*</span>
              </label>

              <input
                id="addressLine1"
                required
                value={form.addressLine1}
                onChange={update("addressLine1")}
                placeholder="House / building / street"
                className={inputClass}
              />
            </div>

            {/* Address line 2 */}
            <div>
              <label htmlFor="addressLine2" className={labelClass}>
                Address line 2
                <span className="ml-1 text-[#8FAE9E]">(optional)</span>
              </label>

              <input
                id="addressLine2"
                value={form.addressLine2}
                onChange={update("addressLine2")}
                placeholder="Area / locality"
                className={inputClass}
              />
            </div>

            {/* Address line 3 + 4 */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="addressLine3" className={labelClass}>
                  Address line 3
                  <span className="ml-1 text-[#8FAE9E]">(optional)</span>
                </label>

                <input
                  id="addressLine3"
                  value={form.addressLine3}
                  onChange={update("addressLine3")}
                  placeholder="Landmark"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="addressLine4" className={labelClass}>
                  Address line 4 <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="addressLine4"
                  required
                  value={form.addressLine4}
                  onChange={update("addressLine4")}
                  placeholder="Town / district"
                  className={inputClass}
                />
              </div>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>

                <input
                  id="city"
                  readOnly
                  value={form.city}
                  placeholder="Auto-filled from PIN"
                  className={readonlyInputClass}
                />
              </div>

              <div>
                <label htmlFor="state" className={labelClass}>
                  State
                </label>

                <input
                  id="state"
                  readOnly
                  value={form.state}
                  placeholder="Auto-filled from PIN"
                  className={readonlyInputClass}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className={labelClass}>
                Country
              </label>

              <input
                id="country"
                readOnly
                value={form.country}
                placeholder="Auto-filled from PIN"
                className={readonlyInputClass}
              />
            </div>

            {/* Credentials heading */}
            <div className="border-t border-[#D8E0D9] pt-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8FAE9E]">
                Account Credentials
              </p>
            </div>

            {/* Username info */}
            <div className="border-l-2 border-dashed border-[#D8E0D9] pl-3 text-sm leading-6 text-[#4C5C55]">
              Your username will be your mobile number
              {form.mobileNumber && (
                <>
                  {" "}
                  —{" "}
                  <strong className="font-semibold text-[#152420]">
                    {form.mobileNumber}
                  </strong>
                </>
              )}
              .
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Password */}
              <div>
                <label htmlFor="password" className={labelClass}>
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={update("password")}
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    className={`${inputClass} pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#7C8B84] transition hover:bg-[#1F4438]/5 hover:text-[#1F4438]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <PasswordIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    autoComplete="new-password"
                    placeholder="Enter password again"
                    className={`${inputClass} pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#7C8B84] transition hover:bg-[#1F4438]/5 hover:text-[#1F4438]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <PasswordIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>
            </div>

            {/* Password validation */}
            {form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <p className="-mt-3 text-xs text-[#B5502E]">
                  Passwords don't match.
                </p>
              )}

            {form.confirmPassword &&
              form.password === form.confirmPassword &&
              form.password.length >= 6 && (
                // CHANGED: teal accent for the match confirmation, matching Login's secondary accent
                <p className="-mt-3 text-xs font-medium text-[#0E7C86]">
                  ✓ Passwords match
                </p>
              )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || pinStatus === "loading"}
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
                transition
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

              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Login */}
          <p className="mt-7 text-sm text-[#6B7B73]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#1F4438] underline decoration-[#8FAE9E] underline-offset-4 transition hover:decoration-[#1F4438]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
