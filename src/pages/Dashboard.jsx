import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";

function toFormShape(profile) {
  if (!profile) return {};
  return {
    fullName: profile.name ?? profile.fullName ?? "",
    mobileNumber: profile.phone ?? profile.mobileNumber ?? "",
    whatsapp: profile.whatsapp ?? "", // ADDED
    email: profile.email ?? "",
    addressLine1: profile.address_line_1 ?? "", // CHANGED — was addressLine
    addressLine2: profile.address_line_2 ?? "", // ADDED
    addressLine3: profile.address_line_3 ?? "", // ADDED
    addressLine4: profile.address_line_4 ?? "", // ADDED
    city: profile.city ?? "",
    state: profile.state ?? "", // ADDED
    pinCode: profile.pincode ?? profile.pinCode ?? "",
  };
}

function toApiShape(form) {
  return {
    name: form.fullName,
    phone: form.mobileNumber,
    whatsapp: form.whatsapp, // ADDED
    email: form.email,
    address_line_1: form.addressLine1, // CHANGED
    address_line_2: form.addressLine2, // ADDED
    address_line_3: form.addressLine3, // ADDED
    address_line_4: form.addressLine4, // ADDED
    city: form.city,
    state: form.state, // ADDED
    pincode: form.pinCode,
  };
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await authApi.getProfile();
        setForm(toFormShape(profile));
      } catch {
        setForm(toFormShape(user) || {});
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await authApi.updateProfile(toApiShape(form));
      setSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-card">
        <p>Loading your details…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <h1>Update your details</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Keep your account information current.
          </p>
        </div>
        <button className="logout-link" onClick={logout}>
          Sign out
        </button>
      </div>

      {saved && <div className="notice">Your details have been updated.</div>}
      {error && <div className="error-text">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="fullName">Full name</label>
          <input id="fullName" value={form?.fullName || ""} onChange={update("fullName")} />
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="mobileNumber">Mobile number</label>
            <input id="mobileNumber" value={form?.mobileNumber || ""} onChange={update("mobileNumber")} />
          </div>
          <div className="field-group">
            <label htmlFor="whatsapp">WhatsApp number</label>
            <input id="whatsapp" value={form?.whatsapp || ""} onChange={update("whatsapp")} />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="email">Email address</label>
          <input id="email" value={form?.email || ""} onChange={update("email")} />
        </div>

        <div className="field-group">
          <label htmlFor="addressLine1">Address line 1</label>
          <input id="addressLine1" value={form?.addressLine1 || ""} onChange={update("addressLine1")} />
        </div>
        <div className="field-group">
          <label htmlFor="addressLine2">Address line 2</label>
          <input id="addressLine2" value={form?.addressLine2 || ""} onChange={update("addressLine2")} />
        </div>
        <div className="field-row">
          <div className="field-group">
            <label htmlFor="addressLine3">Address line 3</label>
            <input id="addressLine3" value={form?.addressLine3 || ""} onChange={update("addressLine3")} />
          </div>
          <div className="field-group">
            <label htmlFor="addressLine4">Address line 4</label>
            <input id="addressLine4" value={form?.addressLine4 || ""} onChange={update("addressLine4")} />
          </div>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label htmlFor="city">City</label>
            <input id="city" value={form?.city || ""} onChange={update("city")} />
          </div>
          <div className="field-group">
            <label htmlFor="state">State</label>
            <input id="state" value={form?.state || ""} onChange={update("state")} />
          </div>
          <div className="field-group">
            <label htmlFor="pinCode">PIN / postal code</label>
            <input id="pinCode" value={form?.pinCode || ""} onChange={update("pinCode")} />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}