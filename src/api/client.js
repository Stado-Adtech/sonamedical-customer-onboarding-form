import axios from "axios";

// Point this at your Node.js backend. Set VITE_API_BASE_URL in a .env file
// (create .env at the project root): VITE_API_BASE_URL=https://your-api.example.com/api
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the saved token (if any) to every outgoing request.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the backend ever responds 401, clear the stale session so the user
// is sent back to login instead of getting stuck on a broken screen.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    }
    return Promise.reject(error);
  }
);

export default client;
