import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  fullName: "",
  mobileNumber: "",
  email: "",
  dateOfBirth: "",
  addressLine: "",
  city: "",
  pinCode: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

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

  setSubmitting(true);
  try {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, mobileNumber, ...rest } = form; // CHANGED
    const payload = { ...rest, phone: mobileNumber };        // ADDED
    await signup(payload);
    navigate("/dashboard");
  } catch (err) {
    setError(
      err.response?.data?.message || "Couldn't create your account. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
}

  return (
    <div className="record-card wide" data-tab="New customer">
      <span className="record-no">NEW ACCOUNT</span>
      <h1>Create your account</h1>
      <p className="subtitle">
        Fill in your details below. You'll choose your own username and
        password — no default password is used for new accounts.
      </p>

      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" required value={form.fullName} onChange={update("fullName")} />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="mobileNumber">Mobile number</label>
            <input
              id="mobileNumber"
              type="tel"
              required
              value={form.mobileNumber}
              onChange={update("mobileNumber")}
              placeholder="e.g. 9876543210"
            />
          </div>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={update("email")}
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              id="dateOfBirth"
              type="date"
              required
              value={form.dateOfBirth}
              onChange={update("dateOfBirth")}
            />
          </div>
          <div className="field-group">
            <label htmlFor="pinCode">PIN / postal code</label>
            <input id="pinCode" required value={form.pinCode} onChange={update("pinCode")} />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="addressLine">Address</label>
          <input
            id="addressLine"
            required
            value={form.addressLine}
            onChange={update("addressLine")}
          />
        </div>

        <div className="field-group">
          <label htmlFor="city">City</label>
          <input id="city" required value={form.city} onChange={update("city")} />
        </div>

        <div className="divider-row">account credentials</div>

        <div className="field-group">
          <label htmlFor="username">Choose a username</label>
          <input id="username" required value={form.username} onChange={update("username")} />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
          </div>
          <div className="field-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="switch-link" style={{ marginTop: 18 }}>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
