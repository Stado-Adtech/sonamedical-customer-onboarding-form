import client from "./client";

/**
 * These calls assume the following Node.js backend routes. Rename the
 * paths/fields below to match your actual Express routes — everything
 * that talks to the network lives in this one file, so that's the only
 * place you should need to edit.
 */

// Existing customer login with mobile/username + password.
// Backend should respond with:
//   { token, user, mustChangePassword }
// mustChangePassword should be true whenever the account still has the
// default password (e.g. "123456") so the app can force a reset.
export async function login({ identifier, password }) {
  const { data } = await client.post("/auth/login", { identifier, password });
  return data;
}

// First-login (or any time) password change for an existing customer.
export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await client.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
}

// New customer signup — creates their own username + password plus their
// profile details. Adjust the field names to match your backend schema.
export async function signup(payload) {
  const { data } = await client.post("/auth/signup", payload);
  return data;
}

// Fetch the logged-in customer's current profile (used to prefill the
// "update details" form for existing customers).
export async function getProfile() {
  const { data } = await client.get("/customers/me");
  return data;
}

// Update an existing customer's profile details.
export async function updateProfile(payload) {
  const { data } = await client.put("/customers/me", payload);
  return data;
}

export async function customerSignup(payload) {
  const { data } = await client.post("/auth/customer-signup", payload); // CHANGED path
  return data;
}

// Reset a forgotten customer password — no verification, just phone/username + new password.
export async function forgetPassword({ identifier, newPassword }) {
  const { data } = await client.post("/auth/customer-forget-password", {
    identifier,
    newPassword,
  });
  return data;
}