import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SetNewPassword from "./pages/SetNewPassword";
import Dashboard from "./pages/Dashboard";
import Track from "./pages/Track";
import ForgotPassword from "./pages/ForgotPassword";
import "./App.css";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/track" replace /> : <Login />} // CHANGED
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/track" replace /> : <Signup />} // CHANGED
      />
      <Route
        path="/set-new-password"
        element={
          <ProtectedRoute allowPasswordChange>
            <SetNewPassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/track" replace /> : <ForgotPassword />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/track"
        element={
          <ProtectedRoute>
            <Track />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}