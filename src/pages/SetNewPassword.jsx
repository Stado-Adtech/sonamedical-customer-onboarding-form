import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SetNewPassword() {
  const { completePasswordChange, logout } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Your new password must be at least 6 characters.");
      return;
    }
    if (newPassword === "123456") {
      setError("Please choose something other than the default password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await completePasswordChange("123456", newPassword);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't update your password. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="record-card" data-tab="First login">
      <span className="record-no">STEP 2 OF 2</span>
      <h1>Set a new password</h1>
      <p className="subtitle">
        You're currently using the default password. Choose a new one to finish
        securing your account.
      </p>

      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="field-group">
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save password and continue"}
        </button>
      </form>

      <div className="divider-row">or</div>
      <p className="switch-link">
        <button type="button" onClick={logout}>
          Sign out
        </button>
      </p>
    </div>
  );
}
