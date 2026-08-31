import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
        navigate("/track"); // CHANGED from "/dashboard"
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
    <div className="record-card" data-tab="Existing customer">
      <span className="record-no">LOG-IN</span>
      <h1>Sign in to your account</h1>
      <p className="subtitle">
        Use the mobile number or username registered on your account. New here?
        Create an account instead.
      </p>

      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="identifier">Username or mobile number</label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. 9876543210"
            required
            autoComplete="username"
          />
        </div>

        <div className="field-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <p className="hint">
            First time logging in? Your default password is <strong>123456</strong>
            — you'll be asked to set a new one right after signing in.
          </p>
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="switch-link" style={{ marginTop: 12 }}>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>

      <div className="divider-row">or</div>

      <p className="switch-link">
        Don't have an account yet? <Link to="/signup">Create one</Link>
      </p>
    </div>
  );
}