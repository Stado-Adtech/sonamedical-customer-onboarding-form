import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";

/* -------------------------------------------------------
   CONVERT API PROFILE -> FORM
------------------------------------------------------- */

function toFormShape(profile) {
  if (!profile) return {};

  return {
    fullName: profile.name ?? profile.fullName ?? "",
    mobileNumber: profile.phone ?? profile.mobileNumber ?? "",
    alternateNumber: profile.alternateNumber ?? profile.whatsapp ?? "",
    email: profile.email ?? "",
    dateOfBirth: profile.dob ?? profile.dateOfBirth ?? "",

    addressLine1: profile.address_line_1 ?? "",
    addressLine2: profile.address_line_2 ?? "",
    addressLine3: profile.address_line_3 ?? "",
    addressLine4: profile.address_line_4 ?? "",

    city: profile.city ?? "",
    state: profile.state ?? "",
    country: profile.country ?? "",

    pinCode: profile.pincode ?? profile.pinCode ?? "",
  };
}

/* -------------------------------------------------------
   CONVERT FORM -> API PAYLOAD
------------------------------------------------------- */

function toApiShape(form) {
  return {
    name: form.fullName?.trim(),
    phone: form.mobileNumber?.trim(),
    alternateNumber: form.alternateNumber?.trim(),
    email: form.email?.trim(),
    dob: form.dateOfBirth?.trim(),

    address_line_1: form.addressLine1?.trim(),
    address_line_2: form.addressLine2?.trim(),
    address_line_3: form.addressLine3?.trim(),
    address_line_4: form.addressLine4?.trim(),

    city: form.city?.trim(),
    state: form.state?.trim(),
    country: form.country?.trim(),

    pincode: form.pinCode?.trim(),
  };
}

/* -------------------------------------------------------
   SITE HEADER
------------------------------------------------------- */

function SiteHeader({ onLogout }) {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-[#D8E0D9]
        bg-[#F7F5EF]/95
        backdrop-blur
        supports-[backdrop-filter]:bg-[#F7F5EF]/80
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-4xl
          items-center
          justify-between
          gap-4
          px-4
          py-3
          sm:px-6
        "
      >
        <div className="flex items-center gap-2.5">
          <span
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-[#D8E0D9]
              bg-white
              p-1.5
              shadow-sm
            "
          >
            <img
              src="/inventory.png"
              alt="Sona Medical"
              className="max-h-full max-w-full object-contain"
            />
          </span>

          <span className="hidden text-sm font-semibold tracking-tight text-[#152420] sm:inline">
            Sona Medical
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="
            inline-flex
            items-center
            justify-center
            rounded-lg
            border
            border-[#D8E0D9]
            bg-white
            px-4
            py-2
            text-sm
            font-medium
            text-[#4C5C55]
            transition
            hover:border-[#1F4438]
            hover:text-[#1F4438]
          "
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------
   SITE FOOTER
------------------------------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-[#D8E0D9] bg-[#F7F5EF]">
      <div
        className="
          mx-auto
          flex
          max-w-4xl
          flex-col
          gap-3
          px-4
          py-6
          text-xs
          text-[#89968F]
          sm:flex-row
          sm:items-center
          sm:justify-between
          sm:px-6
        "
      >
        <p>
          &copy; {new Date().getFullYear()} Sona Medical.
          All rights reserved.
        </p>

        <p>
          Need help with your account?{" "}
          <a
            href="mailto:support@example.com"
            className="font-medium text-[#1F4438] hover:text-[#122E26]"
          >
            support@example.com
          </a>
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------
   DASHBOARD
------------------------------------------------------- */

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  /*
    PIN status:
    idle
    loading
    found
    notfound
    error
  */
  const [pinStatus, setPinStatus] = useState("idle");

  const [showWelcomeModal, setShowWelcomeModal] =
    useState(false);

  /* -------------------------------------------------------
     LOAD PROFILE
  ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const profile = await authApi.getProfile();

        if (!cancelled) {
          setForm(toFormShape(profile));
        }
      } catch {
        if (!cancelled) {
          setForm(toFormShape(user) || {});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* -------------------------------------------------------
     AUTO FETCH LOCATION USING PIN CODE
  ------------------------------------------------------- */

  useEffect(() => {
    if (!form) return;

    const pin = String(form.pinCode || "").trim();

    /*
      Do nothing until exactly 6 digits entered.
    */
    if (!/^\d{6}$/.test(pin)) {
      setPinStatus("idle");
      return;
    }

    let cancelled = false;

    setPinStatus("loading");

    /*
      Small delay prevents calling API on every keystroke.
    */
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${pin}`
        );

        if (!response.ok) {
          throw new Error("PIN API request failed");
        }

        const data = await response.json();

        const result = data?.[0];

        if (cancelled) return;

        if (
          result?.Status === "Success" &&
          Array.isArray(result?.PostOffice) &&
          result.PostOffice.length > 0
        ) {
          const office = result.PostOffice[0];

          setForm((prev) => ({
            ...prev,

            /*
              District normally gives a better city value
              than using PostOffice Name.
            */
            city:
              office.District ||
              office.Division ||
              office.Name ||
              "",

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
      } catch (err) {
        console.error("PIN lookup error:", err);

        if (!cancelled) {
          setPinStatus("error");
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form?.pinCode]);

  /* -------------------------------------------------------
     AUTO CLOSE WELCOME MODAL + REDIRECT TO /track
  ------------------------------------------------------- */

  useEffect(() => {
    if (!showWelcomeModal) return;

    const timer = setTimeout(() => {
      setShowWelcomeModal(false);
      navigate("/track"); // CHANGED: go to track page after save
    }, 4500);

    return () => {
      clearTimeout(timer);
    };
  }, [showWelcomeModal, navigate]);

  /* -------------------------------------------------------
     NORMAL FIELD UPDATE
  ------------------------------------------------------- */

  function update(field) {
    return (e) => {
      const value = e.target.value;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      setSaved(false);
    };
  }

  /* -------------------------------------------------------
     PIN FIELD UPDATE
  ------------------------------------------------------- */

  function handlePinChange(e) {
    /*
      Removes all non-numeric characters
      and limits PIN to 6 digits.
    */
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setSaved(false);

    setForm((prev) => ({
      ...prev,

      pinCode: value,

      /*
        Clear existing auto-filled location only
        when user is entering a different PIN.
      */
      city: value.length < 6 ? "" : prev.city,
      state: value.length < 6 ? "" : prev.state,
      country: value.length < 6 ? "" : prev.country,
    }));
  }

  /* -------------------------------------------------------
     SAVE PROFILE
  ------------------------------------------------------- */

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSaved(false);

    /*
      Required-field validation.
    */
    if (
      !form.fullName?.trim() ||
      !form.mobileNumber?.trim() ||
      !form.email?.trim() ||
      !form.dateOfBirth?.trim() ||
      !form.addressLine1?.trim() ||
      !form.addressLine4?.trim()
    ) {
      setError(
        "Please fill in Full name, Mobile number, Email, Date of birth, Address line 1 and Address line 4."
      );
      return;
    }

    /*
      PIN validation.
    */
    if (!/^\d{6}$/.test(form.pinCode || "")) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    /*
      Don't save if API couldn't resolve location.
    */
    if (!form.city || !form.state || !form.country) {
      setError(
        "Please enter a valid PIN code so City, State and Country can be detected."
      );

      return;
    }

    setSaving(true);

    try {
      await authApi.updateProfile(
        toApiShape(form)
      );

      setSaved(true);

      /*
        Open success modal. It will auto-close and
        redirect to /track after a short delay.
      */
      setShowWelcomeModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* -------------------------------------------------------
     STYLES
  ------------------------------------------------------- */

  const inputClass = `
    w-full
    rounded-lg
    border
    border-[#D8E0D9]
    bg-white
    px-3
    py-2.5
    text-sm
    text-[#152420]
    outline-none
    transition
    placeholder:text-[#9AA9A2]
    focus:border-[#1F4438]
    focus:ring-2
    focus:ring-[#1F4438]/10
  `;

  const readonlyInputClass = `
    w-full
    cursor-default
    rounded-lg
    border
    border-[#D8E0D9]
    bg-[#F7F8F5]
    px-3
    py-2.5
    text-sm
    text-[#4C5C55]
    outline-none
    placeholder:text-[#A0AAA5]
  `;

  const labelClass =
    "mb-1.5 block text-[13px] font-medium text-[#4C5C55]";

  /* -------------------------------------------------------
     LOADING SCREEN
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F5EF]">
        <SiteHeader onLogout={logout} />

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="flex items-center gap-3 text-sm text-[#4C5C55]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1F4438]/20 border-t-[#1F4438]" />

            Loading your details…
          </div>
        </div>

        <SiteFooter />
      </div>
    );
  }

  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#F7F5EF]">
        <SiteHeader onLogout={logout} />

        <div className="flex-1 px-4 py-8 sm:px-6 lg:py-12">
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#D8E0D9] bg-white p-5 shadow-sm sm:p-8">

            {/* HEADER */}

            <div className="mb-8 border-b border-[#D8E0D9] pb-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8FAE9E]">
                My Profile
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-[#152420] sm:text-3xl">
                Update your details
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#6B7B73]">
                Keep your account and delivery
                information current.
              </p>
            </div>

          {/* SUCCESS */}

          {saved && (
            <div className="mb-6 border-l-[3px] border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Your details have been updated
              successfully.
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 border-l-[3px] border-[#B5502E] bg-[#F3E3DC] px-4 py-3 text-sm leading-5 text-[#B5502E]">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* PERSONAL INFORMATION */}

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8FAE9E]">
                Personal Information
              </p>
            </div>

            {/* FULL NAME */}

            <div>
              <label
                htmlFor="fullName"
                className={labelClass}
              >
                Full name{" "}
                <span className="text-[#B5502E]">*</span>
              </label>

              <input
                id="fullName"
                required
                value={form?.fullName || ""}
                onChange={update("fullName")}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            {/* PHONE */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="mobileNumber"
                  className={labelClass}
                >
                  Mobile / WhatsApp number{" "}
                  <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="mobileNumber"
                  type="tel"
                  required
                  value={
                    form?.mobileNumber || ""
                  }
                  onChange={update(
                    "mobileNumber"
                  )}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="alternateNumber"
                  className={labelClass}
                >
                  Alternate number{" "}
                  <span className="text-[#8FAE9E]">(optional)</span>
                </label>

                <input
                  id="alternateNumber"
                  type="tel"
                  value={form?.alternateNumber || ""}
                  onChange={update("alternateNumber")}
                  placeholder="e.g. 9876543210"
                  className={inputClass}
                />
              </div>
            </div>

            {/* EMAIL + DATE OF BIRTH */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  Email address{" "}
                  <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={form?.email || ""}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className={labelClass}
                >
                  Date of birth{" "}
                  <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={form?.dateOfBirth || ""}
                  onChange={update("dateOfBirth")}
                  className={inputClass}
                />
              </div>
            </div>

            {/* ADDRESS SECTION */}

            <div className="border-t border-[#D8E0D9] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8FAE9E]">
                Address Information
              </p>
            </div>

            {/* ADDRESS LINE 1 */}

            <div>
              <label
                htmlFor="addressLine1"
                className={labelClass}
              >
                Address line 1{" "}
                <span className="text-[#B5502E]">*</span>
              </label>

              <input
                id="addressLine1"
                required
                value={
                  form?.addressLine1 || ""
                }
                onChange={update(
                  "addressLine1"
                )}
                placeholder="House / building / street"
                className={inputClass}
              />
            </div>

            {/* ADDRESS LINE 2 */}

            <div>
              <label
                htmlFor="addressLine2"
                className={labelClass}
              >
                Address line 2{" "}
                <span className="text-[#8FAE9E]">(optional)</span>
              </label>

              <input
                id="addressLine2"
                value={
                  form?.addressLine2 || ""
                }
                onChange={update(
                  "addressLine2"
                )}
                placeholder="Area / locality"
                className={inputClass}
              />
            </div>

            {/* ADDRESS 3 + 4 */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="addressLine3"
                  className={labelClass}
                >
                  Address line 3{" "}
                  <span className="text-[#8FAE9E]">(optional)</span>
                </label>

                <input
                  id="addressLine3"
                  value={
                    form?.addressLine3 || ""
                  }
                  onChange={update(
                    "addressLine3"
                  )}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="addressLine4"
                  className={labelClass}
                >
                  Address line 4{" "}
                  <span className="text-[#B5502E]">*</span>
                </label>

                <input
                  id="addressLine4"
                  required
                  value={
                    form?.addressLine4 || ""
                  }
                  onChange={update(
                    "addressLine4"
                  )}
                  className={inputClass}
                />
              </div>
            </div>

            {/* PIN */}

            <div>
              <label
                htmlFor="pinCode"
                className={labelClass}
              >
                PIN / Postal code{" "}
                <span className="text-[#B5502E]">*</span>
              </label>

              <div className="relative">
                <input
                  id="pinCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={
                    form?.pinCode || ""
                  }
                  onChange={handlePinChange}
                  placeholder="e.g. 800001"
                  className={`${inputClass} pr-28`}
                />

                {/* PIN LOADING */}

                {pinStatus ===
                  "loading" && (
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-[#6B7B73]">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#8FAE9E]/40 border-t-[#1F4438]" />

                    Checking
                  </div>
                )}

                {/* PIN FOUND */}

                {pinStatus ===
                  "found" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600">
                    ✓ Found
                  </span>
                )}
              </div>

              {/* HINT */}

              {pinStatus === "idle" &&
                form?.pinCode?.length > 0 &&
                form.pinCode.length < 6 && (
                  <p className="mt-2 text-xs text-[#89968F]">
                    Enter all 6 digits to
                    automatically detect your
                    location.
                  </p>
                )}

              {/* INVALID PIN */}

              {pinStatus ===
                "notfound" && (
                <p className="mt-2 text-xs font-medium text-[#B5502E]">
                  Couldn't find this PIN code.
                  Please check it and try again.
                </p>
              )}

              {/* API ERROR */}

              {pinStatus === "error" && (
                <p className="mt-2 text-xs font-medium text-[#B5502E]">
                  Couldn't fetch the location
                  right now. Please try again.
                </p>
              )}
            </div>

            {/* AUTO FETCHED LOCATION */}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

              {/* CITY */}

              <div>
                <label
                  htmlFor="city"
                  className={labelClass}
                >
                  City
                </label>

                <input
                  id="city"
                  readOnly
                  value={form?.city || ""}
                  placeholder="Auto-filled"
                  className={
                    readonlyInputClass
                  }
                />
              </div>

              {/* STATE */}

              <div>
                <label
                  htmlFor="state"
                  className={labelClass}
                >
                  State
                </label>

                <input
                  id="state"
                  readOnly
                  value={form?.state || ""}
                  placeholder="Auto-filled"
                  className={
                    readonlyInputClass
                  }
                />
              </div>

              {/* COUNTRY */}

              <div>
                <label
                  htmlFor="country"
                  className={labelClass}
                >
                  Country
                </label>

                <input
                  id="country"
                  readOnly
                  value={
                    form?.country || ""
                  }
                  placeholder="Auto-filled"
                  className={
                    readonlyInputClass
                  }
                />
              </div>
            </div>

            {/* LOCATION SUCCESS MESSAGE */}

            {pinStatus === "found" && (
              <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span className="mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold">
                  ✓
                </span>

                <span>
                  Location detected as{" "}
                  <strong>
                    {form.city},{" "}
                    {form.state},{" "}
                    {form.country}
                  </strong>
                  .
                </span>
              </div>
            )}

            {/* SAVE BUTTON */}

            <div className="border-t border-[#D8E0D9] pt-6">
              <button
                type="submit"
                disabled={
                  saving ||
                  pinStatus === "loading"
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#1F4438]
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#122E26]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#1F4438]/20
                  focus:ring-offset-2
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:w-auto
                "
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}

                {saving
                  ? "Saving…"
                  : "Save changes"}
              </button>
            </div>
          </form>
          </div>
        </div>

        <SiteFooter />
      </div>

      {/* ==================================================
          WELCOME MODAL
      ================================================== */}

      {showWelcomeModal && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-[#071713]/70
            px-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              bg-white
              px-6
              py-9
              text-center
              shadow-2xl
              sm:px-9
            "
          >
            {/* DECORATION */}

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#1F4438]/5" />

            <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[#8FAE9E]/10" />

            <div className="relative z-10">

              {/* LOGO */}

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#E4EAE6] bg-[#F7F9F7] p-3 shadow-sm">
                <img
                  src="/inventory.png"
                  alt="Sona Medical"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* CHECK */}

              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#8FAE9E]">
                Profile Updated
              </p>

              <h2 className="text-2xl font-semibold leading-tight tracking-tight text-[#152420] sm:text-3xl">
                Welcome to the
                <br />
                Sona Medical Family
              </h2>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6B7B73]">
                Your details have been saved
                successfully. We're delighted to
                have you with us and look forward
                to serving you better.
              </p>

              {/* PROGRESS */}

              <div className="mx-auto mt-7 h-1 w-full max-w-[250px] overflow-hidden rounded-full bg-[#E5EBE8]">
                <div className="welcome-progress h-full w-full origin-left bg-[#1F4438]" />
              </div>

              <p className="mt-3 text-[11px] text-[#9AA9A2]">
                Taking you to your tracking page…
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROGRESS ANIMATION */}

      <style>{`
        .welcome-progress {
          animation: welcomeProgress 4.5s linear forwards;
        }

        @keyframes welcomeProgress {
          from {
            transform: scaleX(1);
          }

          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </>
  );
}
