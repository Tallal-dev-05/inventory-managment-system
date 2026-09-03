import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

function ProtectedRoute({ children, allowedRole }) {
  const [user, setUser] = useState();

  useEffect(() => {
    fetch(api("/api/auth/me"), { credentials: "include" })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((result) => setUser(result?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (user === undefined) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen w-full bg-[#0b0e13] text-[#7c86a5] flex flex-col items-center justify-center gap-3 font-sans text-[10px]"
      >
        <div className="h-8 w-8 rounded-full border-[3px] border-[#232839] border-t-[#6865f5] animate-spin" />
        <span>Checking session...</span>
      </div>
    );
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
