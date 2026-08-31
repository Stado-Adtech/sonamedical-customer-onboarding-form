import { createContext, useContext, useState, useCallback } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("authUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const persistSession = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    setMustChangePassword(Boolean(data.mustChangePassword));
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const data = await authApi.login({ identifier, password });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  // const signup = useCallback(
  //   async (payload) => {
  //     const data = await authApi.signup(payload);
  //     persistSession(data);
  //     return data;
  //   },
  //   [persistSession]
  // );

  const signup = useCallback(
  async (payload) => {
    const data = await authApi.customerSignup(payload); // CHANGED
    persistSession(data);
    return data;
  },
  [persistSession]
);

  const completePasswordChange = useCallback(async (currentPassword, newPassword) => {
    await authApi.changePassword({ currentPassword, newPassword });
    setMustChangePassword(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setMustChangePassword(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    mustChangePassword,
    login,
    signup,
    completePasswordChange,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
