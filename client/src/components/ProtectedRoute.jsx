import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ children, allowedRole }) {
  const [user, setUser] = useState();

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((result) => setUser(result?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return <div role="status" aria-live="polite" style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#667085" }}>Checking your session...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // User doesn't have the required role
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default ProtectedRoute;
