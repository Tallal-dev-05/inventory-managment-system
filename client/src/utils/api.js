export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5000").replace(/\/$/, "");

export function api(path) {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
