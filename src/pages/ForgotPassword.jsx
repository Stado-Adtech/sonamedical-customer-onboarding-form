import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as authApi from "../api/auth";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
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
            await authApi.forgetPassword({ identifier, newPassword });
            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.message || "Couldn't reset your password. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="record-card" data-tab="Forgot password">
            <span className="record-no">RESET PASSWORD</span>
            <h1>Forgot your password?</h1>
            <p className="subtitle">
                Enter your registered mobile number or username, then choose a new password.
            </p>

            {error && <div className="error-text">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="field-group">
                    <label htmlFor="identifier">Username or mobile number</label>
                    <input
                        id="identifier"
                        required
                        autoComplete="username" // ADDED
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="newPassword">New password</label>
                    <input
                        id="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="confirmPassword">Confirm new password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                    />
                </div>

                <button className="btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Resetting…" : "Reset password"}
                </button>
            </form>

            <p className="switch-link" style={{ marginTop: 18 }}>
                <Link to="/login">Back to sign in</Link>
            </p>
        </div>
    );
}